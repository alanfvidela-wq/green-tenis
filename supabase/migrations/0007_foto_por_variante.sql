-- green.: fotos por variante. Una variante puede tener su propia foto, una de
-- las de su producto (las que sube npm run fotos:productos), y la ficha la
-- muestra al elegirla: el pack de 3 y el de 12 de un grip, por ejemplo. Sin
-- foto propia, la ficha muestra la principal del producto. Se corre una sola
-- vez, entera, en el SQL Editor, después de 0006. Va en una transacción.
--
-- La variante apunta a la foto por su orden (la de recortes/<slug>-<orden>),
-- no por su id: así la asociación sobrevive a volver a subir las fotos, y si
-- la foto de ese orden no está, la ficha usa la principal. No hacen falta
-- permisos nuevos: la lectura de variantes ya es pública (0001) y la
-- administración no toca esta columna.

begin;

alter table public.variantes
  add column orden_foto smallint check (orden_foto > 0);

comment on column public.variantes.orden_foto is
  'Orden de la foto del producto que muestra esta variante; null: la principal.';

-- Los dos grips que tienen una foto por pack
update public.variantes set orden_foto = 2 where sku = 'WILSON-PRO-OVERGRIP-PACK-3';
update public.variantes set orden_foto = 1 where sku = 'WILSON-PRO-OVERGRIP-PACK-12';
update public.variantes set orden_foto = 1 where sku = 'TOURNA-GRIP-ORIGINAL-PACK-3';
update public.variantes set orden_foto = 2 where sku = 'TOURNA-GRIP-ORIGINAL-PACK-10';

commit;

-- Chequeo (aparte, después): las cuatro variantes con su foto
-- select sku, nombre, orden_foto from public.variantes
-- where orden_foto is not null order by sku;
