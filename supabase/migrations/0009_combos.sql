-- green.: cuatro combos nuevos además del «Kit para arrancar», uno por perfil
-- del quiz y uno sin raqueta. Se corre una sola vez, entera, en el SQL Editor,
-- después de 0008. Va en una transacción.
--
-- Las raquetas van sin variante (el cliente elige grip y peso); lo demás, con
-- la variante fija. Las cuerdas son compatibles con su raqueta según
-- compatibilidades (la del armador): la ALU Power es además la recomendada de
-- la Blade 98; la RPM Blast (efecto) va con la Pure Drive y la X-One (blanda)
-- con la Clash 100. El precio lo calcula la tienda: la suma de los ítems menos
-- el descuento, redondeado para abajo (la misma cuenta que crear_pedido).

begin;

insert into public.combos (slug, nombre, descripcion, descuento_pct, orden) values
  ('kit-control', 'Kit control',
   'Raqueta de control, cuerda de poliéster que da precisión y dos tubos de pelotas para polvo de ladrillo.', 10, 2),
  ('kit-potencia', 'Kit potencia',
   'Raqueta de potencia, cuerda que le da efecto a la pelota y dos tubos de pelotas para todas las superficies.', 10, 3),
  ('kit-cuida-tu-brazo', 'Kit cuidá tu brazo',
   'Raqueta flexible, cuerda multifilamento blanda y dos tubos de pelotas de entrenamiento.', 10, 4),
  ('pack-entrenamiento', 'Pack entrenamiento',
   'Seis tubos de pelotas de entrenamiento y doce overgrips.', 15, 5);

insert into public.combo_items (combo_id, producto_id, variante_id, cantidad, orden) values
  ((select id from public.combos where slug = 'kit-control'), (select id from public.productos where slug = 'wilson-blade-98'), null, 1, 1),
  ((select id from public.combos where slug = 'kit-control'), (select id from public.productos where slug = 'luxilon-alu-power-125'), (select id from public.variantes where sku = 'LUXILON-ALU-POWER-125-SET'), 1, 2),
  ((select id from public.combos where slug = 'kit-control'), (select id from public.productos where slug = 'dunlop-fort-clay-court'), (select id from public.variantes where sku = 'DUNLOP-FORT-CLAY-COURT-TUBO-3'), 2, 3),

  ((select id from public.combos where slug = 'kit-potencia'), (select id from public.productos where slug = 'babolat-pure-drive'), null, 1, 1),
  ((select id from public.combos where slug = 'kit-potencia'), (select id from public.productos where slug = 'babolat-rpm-blast-125'), (select id from public.variantes where sku = 'BABOLAT-RPM-BLAST-125-SET'), 1, 2),
  ((select id from public.combos where slug = 'kit-potencia'), (select id from public.productos where slug = 'head-tour-xt'), (select id from public.variantes where sku = 'HEAD-TOUR-XT-TUBO-3'), 2, 3),

  ((select id from public.combos where slug = 'kit-cuida-tu-brazo'), (select id from public.productos where slug = 'wilson-clash-100'), null, 1, 1),
  ((select id from public.combos where slug = 'kit-cuida-tu-brazo'), (select id from public.productos where slug = 'tecnifibre-x-one-biphase-130'), (select id from public.variantes where sku = 'TECNIFIBRE-X-ONE-BIPHASE-130-SET'), 1, 2),
  ((select id from public.combos where slug = 'kit-cuida-tu-brazo'), (select id from public.productos where slug = 'penn-championship'), (select id from public.variantes where sku = 'PENN-CHAMPIONSHIP-TUBO-3'), 2, 3),

  ((select id from public.combos where slug = 'pack-entrenamiento'), (select id from public.productos where slug = 'penn-championship'), (select id from public.variantes where sku = 'PENN-CHAMPIONSHIP-TUBO-3'), 6, 1),
  ((select id from public.combos where slug = 'pack-entrenamiento'), (select id from public.productos where slug = 'wilson-pro-overgrip'), (select id from public.variantes where sku = 'WILSON-PRO-OVERGRIP-PACK-12'), 1, 2);

commit;

-- Chequeo (aparte, después): los cinco combos con sus ítems (3, 3, 3, 3 y 2)
-- select c.slug, c.descuento_pct, count(i.id) as items
-- from public.combos c join public.combo_items i on i.combo_id = c.id
-- group by c.slug, c.descuento_pct, c.orden order by c.orden;
