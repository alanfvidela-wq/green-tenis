-- green.: lo que necesita el quiz de estilo de juego (/quiz). Se corre una sola
-- vez, entera, en el SQL Editor, después de 0004. Va en una transacción: si
-- algo falla, no queda nada a medias.
--
-- - Raquetas: nivel y perfil de juego, y la rigidez que faltaba.
-- - Cuerdas: perfil de juego (el `perfil` que ya estaba es la forma de la
--   sección), y una cuerda multifilamento de confort nueva.
-- - Pelotas: superficie y uso en una ficha tipada nueva, fichas_pelota. Las
--   filas «Superficie» y «Uso» salen de productos.ficha para no estar dos veces.
-- - El kit de cada usuario (kits_quiz), que ve solo él (RLS).
-- - admin_guardar_producto, reemplazada para escribir todo lo nuevo.
--
-- Los datos de los productos (lo de abajo de cada tabla) solo tocan lo que ya
-- está cargado: en una base vacía no hacen nada, y el catálogo entero, con lo
-- nuevo, lo carga seed.sql después de las migraciones.

begin;

-- ---------------------------------------------------------------------------
-- Raquetas: nivel, perfil de juego y rigidez
-- ---------------------------------------------------------------------------

alter table public.fichas_raqueta
  add column nivel        text check (nivel in ('principiante', 'intermedio', 'avanzado')),
  add column perfil_juego text check (perfil_juego in ('potencia', 'control', 'equilibrio', 'confort'));

-- La rigidez es la publicada para cada modelo, aproximada: va a confirmar con
-- el año del modelo que se vende
update public.fichas_raqueta f
set nivel = v.nivel, perfil_juego = v.perfil_juego, rigidez_ra = v.rigidez_ra
from (values
  ('babolat-pure-drive', 'intermedio',   'potencia',   71),
  ('wilson-blade-98',    'avanzado',     'control',    62),
  ('head-speed-mp',      'intermedio',   'equilibrio', 64),
  ('yonex-ezone-100',    'principiante', 'potencia',   66),
  ('wilson-clash-100',   'intermedio',   'confort',    55)
) as v (slug, nivel, perfil_juego, rigidez_ra)
join public.productos p on p.slug = v.slug
where f.producto_id = p.id;

-- Una raqueta que no está en la lista (cargada desde el admin) queda como
-- intermedia y equilibrada, y lo avisa: se corrige desde el admin
do $$
declare
  v_sin_datos text;
begin
  select string_agg(p.slug, ', ' order by p.slug)
  into v_sin_datos
  from public.fichas_raqueta f
  join public.productos p on p.id = f.producto_id
  where f.nivel is null or f.perfil_juego is null;

  if v_sin_datos is not null then
    raise notice 'Raquetas sin nivel ni perfil, quedan como intermedio y equilibrio: %', v_sin_datos;
    update public.fichas_raqueta
    set nivel = coalesce(nivel, 'intermedio'), perfil_juego = coalesce(perfil_juego, 'equilibrio')
    where nivel is null or perfil_juego is null;
  end if;
end;
$$;

alter table public.fichas_raqueta
  alter column nivel set not null,
  alter column perfil_juego set not null;

-- ---------------------------------------------------------------------------
-- Cuerdas: perfil de juego
-- ---------------------------------------------------------------------------

alter table public.fichas_cuerda
  add column perfil_juego text check (perfil_juego in ('durabilidad', 'control', 'confort', 'spin'));

update public.fichas_cuerda f
set perfil_juego = v.perfil_juego
from (values
  ('luxilon-alu-power-125', 'control'),
  ('babolat-rpm-blast-125', 'spin'),
  ('solinco-hyper-g-125',   'durabilidad')
) as v (slug, perfil_juego)
join public.productos p on p.slug = v.slug
where f.producto_id = p.id;

do $$
declare
  v_sin_datos text;
begin
  select string_agg(p.slug, ', ' order by p.slug)
  into v_sin_datos
  from public.fichas_cuerda f
  join public.productos p on p.id = f.producto_id
  where f.perfil_juego is null;

  if v_sin_datos is not null then
    raise notice 'Cuerdas sin perfil de juego, quedan como control: %', v_sin_datos;
    update public.fichas_cuerda set perfil_juego = 'control' where perfil_juego is null;
  end if;
end;
$$;

alter table public.fichas_cuerda alter column perfil_juego set not null;

-- La cuerda de confort que faltaba: multifilamento, con un set de 12 m. Va
-- después de las otras tres cuerdas (mismo orden, id mayor).
insert into public.productos (slug, categoria, tipo, marca, nombre, descripcion, orden)
select 'tecnifibre-x-one-biphase-130', c.slug, 'cuerda'::public.producto_tipo, 'Tecnifibre', 'X-One Biphase 1.30',
       'Cuerda multifilamento de 1,30 mm, blanda y elástica. Cuida el brazo y suma potencia.', 13
from public.categorias c
where c.slug = 'cuerdas-y-grips';

insert into public.variantes (producto_id, sku, nombre, precio, stock, orden)
select p.id, 'TECNIFIBRE-X-ONE-BIPHASE-130-SET', 'Set 12 m', 36900, 20, 1
from public.productos p
where p.slug = 'tecnifibre-x-one-biphase-130';

insert into public.fichas_cuerda (producto_id, material, calibre_mm, perfil, perfil_juego)
select p.id, 'multifilamento', 1.30, 'redondo', 'confort'
from public.productos p
where p.slug = 'tecnifibre-x-one-biphase-130';

insert into public.variantes_cuerda (variante_id, largo_m)
select v.id, 12
from public.variantes v
where v.sku = 'TECNIFIBRE-X-ONE-BIPHASE-130-SET';

-- Para el armador, como las demás cuerdas: compatible con todas las raquetas,
-- sin ser la recomendada de ninguna
insert into public.compatibilidades (raqueta_id, accesorio_id, accesorio_tipo, recomendado)
select r.id, c.id, 'cuerda'::public.producto_tipo, false
from public.productos r
cross join public.productos c
where r.tipo = 'raqueta' and c.slug = 'tecnifibre-x-one-biphase-130'
on conflict do nothing;

-- ---------------------------------------------------------------------------
-- Pelotas: superficie y uso, en su ficha tipada
-- ---------------------------------------------------------------------------

create table public.fichas_pelota (
  producto_id bigint primary key,
  tipo        public.producto_tipo not null default 'pelota' check (tipo = 'pelota'),
  superficie  text not null check (superficie in ('todas', 'dura', 'polvo')),
  uso         text not null check (uso in ('competencia', 'entrenamiento')),
  foreign key (producto_id, tipo) references public.productos (id, tipo) on delete cascade
);

-- Desde las filas de cada pelota: «Polvo de ladrillo» es polvo, «Cancha dura»
-- es dura y lo demás («Todas»), todas; con «Entrenamiento» en el uso es de
-- entrenamiento y si no, de competencia. Con el catálogo de hoy queda:
-- Head Tour XT, todas y competencia; Wilson US Open, dura y competencia;
-- Dunlop Fort Clay Court, polvo y competencia; Babolat Gold All Court, todas y
-- competencia; Penn Championship, todas y entrenamiento.
insert into public.fichas_pelota (producto_id, superficie, uso)
select p.id,
       case
         when s.valor ilike '%polvo%' then 'polvo'
         when s.valor ilike '%dura%' then 'dura'
         else 'todas'
       end,
       case when u.valor ilike '%entrenamiento%' then 'entrenamiento' else 'competencia' end
from public.productos p
left join lateral (
  select fila ->> 1 as valor
  from jsonb_array_elements(p.ficha) as fila
  where fila ->> 0 = 'Superficie'
  limit 1
) s on true
left join lateral (
  select fila ->> 1 as valor
  from jsonb_array_elements(p.ficha) as fila
  where fila ->> 0 = 'Uso'
  limit 1
) u on true
where p.tipo = 'pelota' and p.ficha is not null;

-- Las filas que ahora están en fichas_pelota; sin ninguna fila, sin ficha
update public.productos p
set ficha = (
  select nullif(coalesce(jsonb_agg(fila order by n), '[]'::jsonb), '[]'::jsonb)
  from jsonb_array_elements(p.ficha) with ordinality as f (fila, n)
  where fila ->> 0 not in ('Superficie', 'Uso')
)
where p.tipo = 'pelota' and p.ficha is not null;

alter table public.fichas_pelota enable row level security;

create policy "lectura pública" on public.fichas_pelota
  for select to anon, authenticated
  using (exists (select 1 from public.productos p where p.id = producto_id));

create policy "admin: todo" on public.fichas_pelota
  for all to authenticated using ((select public.es_admin())) with check ((select public.es_admin()));

grant select on public.fichas_pelota to anon, authenticated;
grant insert, update, delete on public.fichas_pelota to authenticated;

-- ---------------------------------------------------------------------------
-- El kit del quiz de cada usuario
-- ---------------------------------------------------------------------------

-- Uno por usuario: el último quiz que hizo con sesión. `respuestas` son las
-- del quiz ({ "nivel": "intermedio", … }, ver PREGUNTAS en lib/quiz.js) y
-- `productos`, lo que se le recomendó, en orden:
--   [{ "rol": "raqueta", "productoId": 1, "varianteId": 4, "motivo": "…" }, …]
-- Los precios y el stock no se guardan: se leen del catálogo al mostrarlo.
create table public.kits_quiz (
  usuario_id     uuid primary key default auth.uid() references auth.users on delete cascade,
  respuestas     jsonb not null check (jsonb_typeof(respuestas) = 'object'),
  productos      jsonb not null check (
                   case when jsonb_typeof(productos) = 'array'
                        then jsonb_array_length(productos) between 1 and 6
                        else false
                   end
                 ),
  actualizado_en timestamptz not null default now()
);

alter table public.kits_quiz enable row level security;

-- Cada uno ve, crea y cambia solo el suyo
create policy "dueño" on public.kits_quiz
  for select to authenticated
  using (usuario_id = (select auth.uid()));

create policy "dueño crea" on public.kits_quiz
  for insert to authenticated
  with check (usuario_id = (select auth.uid()));

create policy "dueño cambia" on public.kits_quiz
  for update to authenticated
  using (usuario_id = (select auth.uid()))
  with check (usuario_id = (select auth.uid()));

grant select, insert, update on public.kits_quiz to authenticated;

-- ---------------------------------------------------------------------------
-- Guardar un producto, con lo nuevo de cada ficha
-- ---------------------------------------------------------------------------

-- La de 0004, con lo nuevo de las fichas. `datos` llega validado por la API
-- (ProductoAdmin, lib/esquemasAdmin.js):
--
--   "ficha": { "cabezaPulg2", "largoMm", "balanceMm", "patron": [16, 19],
--              "rigidezRa", "tensionKg": [23, 26], "nivel", "perfilJuego" } (raqueta),
--            { "material", "calibreMm", "perfil", "perfilJuego" } (cuerda),
--            { "superficie", "uso", "filas": [["Tipo", "Presurizada"], …] } (pelota),
--            [["Espesor", "0,6 mm"], …] (grip y bolso) o null
--
-- Lo demás, como en 0004.
create or replace function public.admin_guardar_producto(datos jsonb)
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
      -- Las filas de rótulo y valor: toda la ficha en grip y bolso, solo
      -- `filas` en la pelota
      case
        when v_tipo in ('grip', 'bolso') then v_ficha
        when v_tipo = 'pelota' then
          nullif(nullif(v_ficha -> 'filas', 'null'::jsonb), '[]'::jsonb)
      end,
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
        ficha       = case
                        when tipo in ('grip', 'bolso') then v_ficha
                        when tipo = 'pelota' then
                          nullif(nullif(v_ficha -> 'filas', 'null'::jsonb), '[]'::jsonb)
                      end,
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
         patron_cruzadas, rigidez_ra, tension_min_kg, tension_max_kg, nivel, perfil_juego)
      values (
        v_id,
        (v_ficha ->> 'cabezaPulg2')::smallint,
        (v_ficha ->> 'largoMm')::smallint,
        (v_ficha ->> 'balanceMm')::smallint,
        (v_ficha -> 'patron' ->> 0)::smallint,
        (v_ficha -> 'patron' ->> 1)::smallint,
        (v_ficha ->> 'rigidezRa')::smallint,
        (v_ficha -> 'tensionKg' ->> 0)::numeric,
        (v_ficha -> 'tensionKg' ->> 1)::numeric,
        v_ficha ->> 'nivel',
        v_ficha ->> 'perfilJuego'
      )
      on conflict (producto_id) do update
      set cabeza_pulg2       = excluded.cabeza_pulg2,
          largo_mm           = excluded.largo_mm,
          balance_mm         = excluded.balance_mm,
          patron_principales = excluded.patron_principales,
          patron_cruzadas    = excluded.patron_cruzadas,
          rigidez_ra         = excluded.rigidez_ra,
          tension_min_kg     = excluded.tension_min_kg,
          tension_max_kg     = excluded.tension_max_kg,
          nivel              = excluded.nivel,
          perfil_juego       = excluded.perfil_juego;
    end if;
  elsif v_tipo = 'cuerda' then
    if v_ficha is null then
      delete from public.fichas_cuerda where producto_id = v_id;
    else
      insert into public.fichas_cuerda (producto_id, material, calibre_mm, perfil, perfil_juego)
      values (
        v_id,
        v_ficha ->> 'material',
        (v_ficha ->> 'calibreMm')::numeric,
        v_ficha ->> 'perfil',
        v_ficha ->> 'perfilJuego'
      )
      on conflict (producto_id) do update
      set material     = excluded.material,
          calibre_mm   = excluded.calibre_mm,
          perfil       = excluded.perfil,
          perfil_juego = excluded.perfil_juego;
    end if;
  elsif v_tipo = 'pelota' then
    if v_ficha is null then
      delete from public.fichas_pelota where producto_id = v_id;
    else
      insert into public.fichas_pelota (producto_id, superficie, uso)
      values (v_id, v_ficha ->> 'superficie', v_ficha ->> 'uso')
      on conflict (producto_id) do update
      set superficie = excluded.superficie,
          uso        = excluded.uso;
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
