-- green.: guardar_foto, para que npm run fotos:productos registre cada foto
-- de producto sin permisos sobre las tablas. Se corre una sola vez, entera, en
-- el SQL Editor, después de 0005. Va en una transacción: si algo falla, no
-- queda nada a medias.
--
-- El script sube los recortes a Storage con SUPABASE_SECRET_KEY (service_role)
-- y después anota la foto en la tabla fotos. service_role no tiene permisos
-- sobre ninguna tabla (ver 0001: el proyecto no los da solo) y sigue sin
-- tenerlos: la clave secreta solo ejecuta funciones. guardar_foto es la única
-- que le toca a fotos, y solo puede hacer esto:
-- - buscar el producto o combo por su slug (no devuelve nada de él);
-- - crear o reemplazar la fila de fotos de ese slug y ese orden, con la ruta
--   que arma ella: recortes/<slug>-<orden>.webp. El script no elige la ruta.
-- No borra fotos, no toca otras columnas ni otras tablas y no lee pedidos.
--
-- Suma además un índice único por producto y orden (y por combo y orden): una
-- foto por lugar de la galería, aunque el script corra dos veces a la vez.

begin;

create unique index fotos_producto_orden on public.fotos (producto_id, orden);
create unique index fotos_combo_orden on public.fotos (combo_id, orden);

-- Devuelve la ruta guardada, o null si no hay producto ni combo con ese slug
-- (entonces no escribe nada). orden empieza en 1: la 1 es la de la vitrina.
create function public.guardar_foto(slug text, orden smallint)
returns text
language plpgsql
security definer
set search_path = ''
as $$
#variable_conflict use_column
-- `orden` es el parámetro y también la columna de fotos: en el on conflict
-- tiene que ser la columna. El parámetro va siempre como guardar_foto.orden.
declare
  v_producto bigint;
  v_combo    bigint;
  v_ruta     text;
begin
  if guardar_foto.orden is null or guardar_foto.orden < 1 then
    raise exception 'El orden de la foto empieza en 1';
  end if;

  select p.id into v_producto from public.productos p where p.slug = guardar_foto.slug;
  if v_producto is null then
    select k.id into v_combo from public.combos k where k.slug = guardar_foto.slug;
    if v_combo is null then
      return null;
    end if;
  end if;

  v_ruta := format('recortes/%s-%s.webp', guardar_foto.slug, guardar_foto.orden);

  if v_producto is not null then
    insert into public.fotos (producto_id, ruta, orden)
    values (v_producto, v_ruta, guardar_foto.orden)
    on conflict (producto_id, orden) do update set ruta = excluded.ruta;
  else
    insert into public.fotos (combo_id, ruta, orden)
    values (v_combo, v_ruta, guardar_foto.orden)
    on conflict (combo_id, orden) do update set ruta = excluded.ruta;
  end if;

  return v_ruta;
end;
$$;

revoke all on function public.guardar_foto(text, smallint) from public, anon, authenticated;
grant execute on function public.guardar_foto(text, smallint) to service_role;

commit;
