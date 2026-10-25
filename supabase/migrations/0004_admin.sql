-- green.: lo que necesita la administración (/admin y los endpoints que
-- escriben de /api/v1, ver docs/API.md). Se corre una sola vez, entera, en el
-- SQL Editor, después de 0003. Va en una transacción: si algo falla, no queda
-- nada a medias.
--
-- Las políticas «admin: todo» (catálogo) y «admin actualiza» (pedidos) ya
-- estaban desde 0001, pero el proyecto no les da permisos a los roles solo: sin
-- estos GRANT, la sesión del admin no puede escribir. Quién puede lo sigue
-- decidiendo RLS: el GRANT abre la tabla a cualquier usuario con sesión y las
-- políticas la cierran a todos menos al admin (es_admin()).

begin;

-- ---------------------------------------------------------------------------
-- Permisos
-- ---------------------------------------------------------------------------

grant insert, update, delete on
  public.productos, public.variantes,
  public.fichas_raqueta, public.variantes_raqueta,
  public.fichas_cuerda, public.variantes_cuerda
to authenticated;

-- De un pedido, el admin cambia solo el estado (en preparación, enviado)
grant update (estado) on public.pedidos to authenticated;

-- ---------------------------------------------------------------------------
-- Guardar un producto
-- ---------------------------------------------------------------------------

-- Crea o actualiza un producto con su ficha y sus variantes en una sola
-- transacción: si algo falla (un slug o un sku repetido, una variante que se
-- quiere quitar y ya tiene pedidos), no queda nada a medias. Corre con los
-- permisos de quien la llama (security invoker, el default): RLS aplica igual
-- que en cada tabla, y además se corta acá si no es el admin.
--
-- `datos` llega validado por la API (ProductoAdmin, lib/esquemasAdmin.js):
--
--   { "id": 12 o null, "slug", "categoria", "tipo", "marca", "nombre",
--     "descripcion", "destacado", "activo",
--     "ficha": [["Tipo", "Presurizada"], …] (pelota, grip, bolso),
--              { "cabezaPulg2", "largoMm", "balanceMm", "patron": [16, 19],
--                "rigidezRa", "tensionKg": [23, 26] } (raqueta),
--              { "material", "calibreMm", "perfil" } (cuerda) o null,
--     "variantes": [{ "id": 31 o null, "sku", "nombre", "precio", "stock",
--                     "activa", "grip", "pesoG", "largoM" }, …] }
--
-- Con id null crea el producto; con id, lo actualiza (el tipo no cambia: las
-- fichas tipadas están atadas a él). Las variantes van en el orden de la lista;
-- las que ya no están se borran. Devuelve el id del producto.
create function public.admin_guardar_producto(datos jsonb)
returns bigint
language plpgsql
set search_path = ''
as $$
declare
  v_id          bigint := (datos ->> 'id')::bigint;
  v_tipo        public.producto_tipo := (datos ->> 'tipo')::public.producto_tipo;
  v_ficha       jsonb := nullif(datos -> 'ficha', 'null'::jsonb);
  v_variante    jsonb;
  v_variante_id bigint;
  v_orden       smallint := 0;
  v_quedan      bigint[];
begin
  if not (select public.es_admin()) then
    raise exception 'Solo el admin puede guardar productos.' using errcode = '42501';
  end if;

  if v_id is null then
    insert into public.productos
      (slug, categoria, tipo, marca, nombre, descripcion, ficha, destacado, activo)
    values (
      datos ->> 'slug',
      datos ->> 'categoria',
      v_tipo,
      datos ->> 'marca',
      datos ->> 'nombre',
      datos ->> 'descripcion',
      case when v_tipo in ('pelota', 'grip', 'bolso') then v_ficha end,
      coalesce((datos ->> 'destacado')::boolean, false),
      coalesce((datos ->> 'activo')::boolean, true)
    )
    returning id into v_id;
  else
    update public.productos
    set slug        = datos ->> 'slug',
        categoria   = datos ->> 'categoria',
        marca       = datos ->> 'marca',
        nombre      = datos ->> 'nombre',
        descripcion = datos ->> 'descripcion',
        ficha       = case when tipo in ('pelota', 'grip', 'bolso') then v_ficha end,
        destacado   = coalesce((datos ->> 'destacado')::boolean, false),
        activo      = coalesce((datos ->> 'activo')::boolean, true)
    where id = v_id
    returning tipo into v_tipo;

    if not found then
      raise exception 'No hay ningún producto con id %.', v_id using errcode = 'P0002';
    end if;
  end if;

  -- La ficha tipada, si el tipo la tiene: se crea, se reemplaza o se borra
  if v_tipo = 'raqueta' then
    if v_ficha is null then
      delete from public.fichas_raqueta where producto_id = v_id;
    else
      insert into public.fichas_raqueta
        (producto_id, cabeza_pulg2, largo_mm, balance_mm, patron_principales,
         patron_cruzadas, rigidez_ra, tension_min_kg, tension_max_kg)
      values (
        v_id,
        (v_ficha ->> 'cabezaPulg2')::smallint,
        (v_ficha ->> 'largoMm')::smallint,
        (v_ficha ->> 'balanceMm')::smallint,
        (v_ficha -> 'patron' ->> 0)::smallint,
        (v_ficha -> 'patron' ->> 1)::smallint,
        (v_ficha ->> 'rigidezRa')::smallint,
        (v_ficha -> 'tensionKg' ->> 0)::numeric,
        (v_ficha -> 'tensionKg' ->> 1)::numeric
      )
      on conflict (producto_id) do update
      set cabeza_pulg2       = excluded.cabeza_pulg2,
          largo_mm           = excluded.largo_mm,
          balance_mm         = excluded.balance_mm,
          patron_principales = excluded.patron_principales,
          patron_cruzadas    = excluded.patron_cruzadas,
          rigidez_ra         = excluded.rigidez_ra,
          tension_min_kg     = excluded.tension_min_kg,
          tension_max_kg     = excluded.tension_max_kg;
    end if;
  elsif v_tipo = 'cuerda' then
    if v_ficha is null then
      delete from public.fichas_cuerda where producto_id = v_id;
    else
      insert into public.fichas_cuerda (producto_id, material, calibre_mm, perfil)
      values (
        v_id,
        v_ficha ->> 'material',
        (v_ficha ->> 'calibreMm')::numeric,
        v_ficha ->> 'perfil'
      )
      on conflict (producto_id) do update
      set material   = excluded.material,
          calibre_mm = excluded.calibre_mm,
          perfil     = excluded.perfil;
    end if;
  end if;

  -- Primero se borran las variantes que ya no están, así una nueva puede usar
  -- el nombre o el sku de una que se quitó. Si alguna tiene pedidos, la base no
  -- la deja borrar (pedido_items) y se deshace todo.
  select coalesce(array_agg((elemento ->> 'id')::bigint), '{}')
  into v_quedan
  from jsonb_array_elements(datos -> 'variantes') as elemento
  where elemento ->> 'id' is not null;

  delete from public.variantes
  where producto_id = v_id and id <> all (v_quedan);

  for v_variante in
    select elemento
    from jsonb_array_elements(datos -> 'variantes') with ordinality as lista (elemento, posicion)
    order by posicion
  loop
    v_variante_id := (v_variante ->> 'id')::bigint;

    if v_variante_id is null then
      insert into public.variantes (producto_id, sku, nombre, precio, stock, orden, activa)
      values (
        v_id,
        v_variante ->> 'sku',
        v_variante ->> 'nombre',
        (v_variante ->> 'precio')::integer,
        (v_variante ->> 'stock')::integer,
        v_orden,
        coalesce((v_variante ->> 'activa')::boolean, true)
      )
      returning id into v_variante_id;
    else
      update public.variantes
      set sku    = v_variante ->> 'sku',
          nombre = v_variante ->> 'nombre',
          precio = (v_variante ->> 'precio')::integer,
          stock  = (v_variante ->> 'stock')::integer,
          orden  = v_orden,
          activa = coalesce((v_variante ->> 'activa')::boolean, true)
      where id = v_variante_id and producto_id = v_id;

      if not found then
        raise exception 'La variante % no es de este producto.', v_variante_id
          using errcode = 'P0002';
      end if;
    end if;

    -- Lo propio de cada tipo: grip y peso de una raqueta, largo de una cuerda
    if v_tipo = 'raqueta' then
      insert into public.variantes_raqueta (variante_id, grip, peso_g)
      values (
        v_variante_id,
        (v_variante ->> 'grip')::smallint,
        (v_variante ->> 'pesoG')::smallint
      )
      on conflict (variante_id) do update
      set grip = excluded.grip, peso_g = excluded.peso_g;
    elsif v_tipo = 'cuerda' then
      insert into public.variantes_cuerda (variante_id, largo_m)
      values (v_variante_id, (v_variante ->> 'largoM')::smallint)
      on conflict (variante_id) do update
      set largo_m = excluded.largo_m;
    end if;

    v_orden := v_orden + 1;
  end loop;

  return v_id;
end;
$$;

revoke all on function public.admin_guardar_producto(jsonb) from public, anon;
grant execute on function public.admin_guardar_producto(jsonb) to authenticated;

commit;
