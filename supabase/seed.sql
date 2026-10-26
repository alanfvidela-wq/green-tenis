-- green.: el catálogo inicial. Generado desde lib/productos.js y lib/fichas.js
-- (sin zapatillas ni ropa). Se corre una sola vez, después de todas las
-- migraciones (supabase/migrations/, de 0001 a la última).

begin;

-- Categorías: las cuatro que se navegan y la de servicios, oculta
insert into public.categorias (slug, nombre, descripcion, orden, visible) values
  ('raquetas', 'Raquetas', 'Raquetas de Babolat, Wilson, Head y Yonex, con grip y peso a elección.', 1, true),
  ('pelotas', 'Pelotas', 'Pelotas presurizadas por tubo, por pack o por caja.', 2, true),
  ('cuerdas-y-grips', 'Cuerdas y grips', 'Cuerdas en set o en rollo, y overgrips por pack.', 3, true),
  ('bolsos', 'Bolsos', 'Raqueteros y mochilas para llevar raquetas, ropa y pelotas.', 4, true),
  ('servicios', 'Servicios', 'Encordado y otros trabajos del taller.', 5, false);

-- Productos
insert into public.productos (slug, categoria, tipo, marca, nombre, descripcion, ficha, destacado, orden) values
  ('babolat-pure-drive', 'raquetas', 'raqueta', 'Babolat', 'Pure Drive',
   'Raqueta de potencia con un punto dulce amplio. Una de las más usadas en los clubes.',
   null, true, 1),
  ('wilson-blade-98', 'raquetas', 'raqueta', 'Wilson', 'Blade 98',
   'Raqueta de control, con cabeza de 98 pulgadas. Para jugadores con un swing completo.',
   null, false, 2),
  ('head-speed-mp', 'raquetas', 'raqueta', 'Head', 'Speed MP',
   'Raqueta liviana y estable, que va bien desde el fondo y en la red.',
   null, false, 3),
  ('yonex-ezone-100', 'raquetas', 'raqueta', 'Yonex', 'Ezone 100',
   'Raqueta de potencia con buena respuesta en los golpes descentrados.',
   null, true, 4),
  ('wilson-clash-100', 'raquetas', 'raqueta', 'Wilson', 'Clash 100',
   'Raqueta flexible y cómoda para el brazo.',
   null, false, 5),
  ('head-tour-xt', 'pelotas', 'pelota', 'Head', 'Tour XT',
   'Pelota presurizada para todas las superficies, con pique parejo.',
   '[["Tipo","Presurizada"],["Felpa","Regular"]]'::jsonb, true, 6),
  ('wilson-us-open', 'pelotas', 'pelota', 'Wilson', 'US Open Extra Duty',
   'Pelota presurizada para cancha dura, con felpa extra duty.',
   '[["Tipo","Presurizada"],["Felpa","Extra duty"]]'::jsonb, false, 7),
  ('dunlop-fort-clay-court', 'pelotas', 'pelota', 'Dunlop', 'Fort Clay Court',
   'Pelota presurizada para polvo de ladrillo.',
   '[["Tipo","Presurizada"],["Felpa","Regular"]]'::jsonb, false, 8),
  ('babolat-gold-all-court', 'pelotas', 'pelota', 'Babolat', 'Gold All Court',
   'Pelota presurizada para todas las superficies, en tubos de cuatro.',
   '[["Tipo","Presurizada"],["Pelotas por tubo","4"]]'::jsonb, false, 9),
  ('penn-championship', 'pelotas', 'pelota', 'Penn', 'Championship',
   'Pelota presurizada para entrenamiento y peloteo.',
   '[["Tipo","Presurizada"]]'::jsonb, false, 10),
  ('luxilon-alu-power-125', 'cuerdas-y-grips', 'cuerda', 'Luxilon', 'ALU Power 1.25',
   'Cuerda de copoliéster de 1,25 mm, para control con golpes fuertes.',
   null, true, 11),
  ('babolat-rpm-blast-125', 'cuerdas-y-grips', 'cuerda', 'Babolat', 'RPM Blast 1.25',
   'Cuerda de copoliéster de 1,25 mm con perfil octogonal, para generar efecto.',
   null, false, 12),
  ('solinco-hyper-g-125', 'cuerdas-y-grips', 'cuerda', 'Solinco', 'Hyper-G 1.25',
   'Cuerda de copoliéster de 1,25 mm, para control y efecto.',
   null, false, 13),
  ('tecnifibre-x-one-biphase-130', 'cuerdas-y-grips', 'cuerda', 'Tecnifibre', 'X-One Biphase 1.30',
   'Cuerda multifilamento de 1,30 mm, blanda y elástica. Cuida el brazo y suma potencia.',
   null, false, 13),
  ('wilson-pro-overgrip', 'cuerdas-y-grips', 'grip', 'Wilson', 'Pro Overgrip',
   'Overgrip fino de tacto pegajoso.',
   '[["Espesor","0,6 mm"],["Tacto","Pegajoso"]]'::jsonb, true, 14),
  ('tourna-grip-original', 'cuerdas-y-grips', 'grip', 'Tourna', 'Tourna Grip Original',
   'Overgrip de tacto seco, que absorbe la transpiración.',
   '[["Espesor","0,6 mm"],["Tacto","Seco"]]'::jsonb, false, 15),
  ('wilson-super-tour-9', 'bolsos', 'bolso', 'Wilson', 'Super Tour 9',
   'Raquetero para nueve raquetas, con un compartimento térmico.',
   '[["Capacidad","9 raquetas"],["Compartimentos","3"],["Térmico","Sí"]]'::jsonb, true, 16),
  ('babolat-pure-aero-rh', 'bolsos', 'bolso', 'Babolat', 'Pure Aero RH',
   'Raquetero para seis o doce raquetas, con lugar para ropa y pelotas.',
   '[["Capacidad","6 o 12 raquetas"],["Compartimentos","2 o 3"],["Térmico","Sí"]]'::jsonb, false, 17),
  ('head-tour-racquet-bag', 'bolsos', 'bolso', 'Head', 'Tour Racquet Bag',
   'Raquetero con doble compartimento y bolsillo para zapatillas.',
   '[["Capacidad","6 o 9 raquetas"],["Compartimentos","2"],["Bolsillo para zapatillas","Sí"]]'::jsonb, false, 18),
  ('yonex-pro-backpack', 'bolsos', 'bolso', 'Yonex', 'Pro Backpack',
   'Mochila con lugar para dos raquetas y bolsillo para notebook.',
   '[["Capacidad","2 raquetas"],["Compartimentos","2"],["Bolsillo para notebook","Sí"]]'::jsonb, false, 19),
  ('encordado', 'servicios', 'servicio', 'green.', 'Encordado',
   'Encordamos tu raqueta con la cuerda y la tensión que elijas.',
   null, false, 20);

-- Variantes: precio en ARS y stock (null: el servicio no lleva stock)
insert into public.variantes (producto_id, sku, nombre, precio, stock, orden) values
  ((select id from public.productos where slug = 'babolat-pure-drive'), 'BABOLAT-PURE-DRIVE-G1-300', 'Grip 1 / 300 g', 389000, 2, 1),
  ((select id from public.productos where slug = 'babolat-pure-drive'), 'BABOLAT-PURE-DRIVE-G2-300', 'Grip 2 / 300 g', 389000, 6, 2),
  ((select id from public.productos where slug = 'babolat-pure-drive'), 'BABOLAT-PURE-DRIVE-G3-300', 'Grip 3 / 300 g', 389000, 4, 3),
  ((select id from public.productos where slug = 'babolat-pure-drive'), 'BABOLAT-PURE-DRIVE-G2-285', 'Grip 2 / 285 g', 389000, 3, 4),
  ((select id from public.productos where slug = 'babolat-pure-drive'), 'BABOLAT-PURE-DRIVE-G3-285', 'Grip 3 / 285 g', 389000, 0, 5),
  ((select id from public.productos where slug = 'wilson-blade-98'), 'WILSON-BLADE-98-G2-305', 'Grip 2 / 305 g', 405000, 3, 1),
  ((select id from public.productos where slug = 'wilson-blade-98'), 'WILSON-BLADE-98-G3-305', 'Grip 3 / 305 g', 405000, 5, 2),
  ((select id from public.productos where slug = 'wilson-blade-98'), 'WILSON-BLADE-98-G4-305', 'Grip 4 / 305 g', 405000, 1, 3),
  ((select id from public.productos where slug = 'head-speed-mp'), 'HEAD-SPEED-MP-G1-300', 'Grip 1 / 300 g', 359000, 2, 1),
  ((select id from public.productos where slug = 'head-speed-mp'), 'HEAD-SPEED-MP-G2-300', 'Grip 2 / 300 g', 359000, 7, 2),
  ((select id from public.productos where slug = 'head-speed-mp'), 'HEAD-SPEED-MP-G3-300', 'Grip 3 / 300 g', 359000, 0, 3),
  ((select id from public.productos where slug = 'head-speed-mp'), 'HEAD-SPEED-MP-G4-300', 'Grip 4 / 300 g', 359000, 2, 4),
  ((select id from public.productos where slug = 'yonex-ezone-100'), 'YONEX-EZONE-100-G1-300', 'Grip 1 / 300 g', 379000, 1, 1),
  ((select id from public.productos where slug = 'yonex-ezone-100'), 'YONEX-EZONE-100-G2-300', 'Grip 2 / 300 g', 379000, 4, 2),
  ((select id from public.productos where slug = 'yonex-ezone-100'), 'YONEX-EZONE-100-G2-285', 'Grip 2 / 285 g', 369000, 3, 3),
  ((select id from public.productos where slug = 'yonex-ezone-100'), 'YONEX-EZONE-100-G3-285', 'Grip 3 / 285 g', 369000, 2, 4),
  ((select id from public.productos where slug = 'wilson-clash-100'), 'WILSON-CLASH-100-G1-295', 'Grip 1 / 295 g', 349000, 0, 1),
  ((select id from public.productos where slug = 'wilson-clash-100'), 'WILSON-CLASH-100-G2-295', 'Grip 2 / 295 g', 349000, 0, 2),
  ((select id from public.productos where slug = 'wilson-clash-100'), 'WILSON-CLASH-100-G3-295', 'Grip 3 / 295 g', 349000, 0, 3),
  ((select id from public.productos where slug = 'head-tour-xt'), 'HEAD-TOUR-XT-TUBO-3', 'Tubo x3', 18900, 60, 1),
  ((select id from public.productos where slug = 'head-tour-xt'), 'HEAD-TOUR-XT-PACK-6', 'Pack x6 tubos', 108000, 12, 2),
  ((select id from public.productos where slug = 'head-tour-xt'), 'HEAD-TOUR-XT-CAJA-24', 'Caja x24 tubos', 399000, 3, 3),
  ((select id from public.productos where slug = 'wilson-us-open'), 'WILSON-US-OPEN-TUBO-3', 'Tubo x3', 19900, 45, 1),
  ((select id from public.productos where slug = 'wilson-us-open'), 'WILSON-US-OPEN-PACK-6', 'Pack x6 tubos', 114000, 8, 2),
  ((select id from public.productos where slug = 'wilson-us-open'), 'WILSON-US-OPEN-CAJA-24', 'Caja x24 tubos', 419000, 0, 3),
  ((select id from public.productos where slug = 'dunlop-fort-clay-court'), 'DUNLOP-FORT-CLAY-COURT-TUBO-3', 'Tubo x3', 17900, 52, 1),
  ((select id from public.productos where slug = 'dunlop-fort-clay-court'), 'DUNLOP-FORT-CLAY-COURT-PACK-6', 'Pack x6 tubos', 99000, 10, 2),
  ((select id from public.productos where slug = 'dunlop-fort-clay-court'), 'DUNLOP-FORT-CLAY-COURT-CAJA-24', 'Caja x24 tubos', 375000, 2, 3),
  ((select id from public.productos where slug = 'babolat-gold-all-court'), 'BABOLAT-GOLD-ALL-COURT-TUBO-4', 'Tubo x4', 24500, 30, 1),
  ((select id from public.productos where slug = 'babolat-gold-all-court'), 'BABOLAT-GOLD-ALL-COURT-PACK-6', 'Pack x6 tubos', 139000, 0, 2),
  ((select id from public.productos where slug = 'penn-championship'), 'PENN-CHAMPIONSHIP-TUBO-3', 'Tubo x3', 12900, 80, 1),
  ((select id from public.productos where slug = 'penn-championship'), 'PENN-CHAMPIONSHIP-CAJA-24', 'Caja x24 tubos', 279000, 4, 2),
  ((select id from public.productos where slug = 'luxilon-alu-power-125'), 'LUXILON-ALU-POWER-125-SET', 'Set 12 m', 39900, 25, 1),
  ((select id from public.productos where slug = 'luxilon-alu-power-125'), 'LUXILON-ALU-POWER-125-ROLLO', 'Rollo 200 m', 459000, 2, 2),
  ((select id from public.productos where slug = 'babolat-rpm-blast-125'), 'BABOLAT-RPM-BLAST-125-SET', 'Set 12 m', 34900, 30, 1),
  ((select id from public.productos where slug = 'babolat-rpm-blast-125'), 'BABOLAT-RPM-BLAST-125-ROLLO', 'Rollo 200 m', 399000, 0, 2),
  ((select id from public.productos where slug = 'solinco-hyper-g-125'), 'SOLINCO-HYPER-G-125-SET', 'Set 12 m', 31900, 18, 1),
  ((select id from public.productos where slug = 'solinco-hyper-g-125'), 'SOLINCO-HYPER-G-125-ROLLO', 'Rollo 200 m', 349000, 1, 2),
  ((select id from public.productos where slug = 'tecnifibre-x-one-biphase-130'), 'TECNIFIBRE-X-ONE-BIPHASE-130-SET', 'Set 12 m', 36900, 20, 1),
  ((select id from public.productos where slug = 'wilson-pro-overgrip'), 'WILSON-PRO-OVERGRIP-PACK-3', 'Pack x3', 12900, 40, 1),
  ((select id from public.productos where slug = 'wilson-pro-overgrip'), 'WILSON-PRO-OVERGRIP-PACK-12', 'Pack x12', 44900, 9, 2),
  ((select id from public.productos where slug = 'tourna-grip-original'), 'TOURNA-GRIP-ORIGINAL-PACK-3', 'Pack x3', 14900, 22, 1),
  ((select id from public.productos where slug = 'tourna-grip-original'), 'TOURNA-GRIP-ORIGINAL-PACK-10', 'Pack x10', 42900, 6, 2),
  ((select id from public.productos where slug = 'wilson-super-tour-9'), 'WILSON-SUPER-TOUR-9-NEGRO', 'Negro', 229000, 4, 1),
  ((select id from public.productos where slug = 'wilson-super-tour-9'), 'WILSON-SUPER-TOUR-9-ROJO', 'Rojo', 229000, 2, 2),
  ((select id from public.productos where slug = 'babolat-pure-aero-rh'), 'BABOLAT-PURE-AERO-RH-6', '6 raquetas', 159000, 5, 1),
  ((select id from public.productos where slug = 'babolat-pure-aero-rh'), 'BABOLAT-PURE-AERO-RH-12', '12 raquetas', 199000, 0, 2),
  ((select id from public.productos where slug = 'head-tour-racquet-bag'), 'HEAD-TOUR-RACQUET-BAG-M', 'M (6 raquetas)', 149000, 3, 1),
  ((select id from public.productos where slug = 'head-tour-racquet-bag'), 'HEAD-TOUR-RACQUET-BAG-L', 'L (9 raquetas)', 179000, 2, 2),
  ((select id from public.productos where slug = 'yonex-pro-backpack'), 'YONEX-PRO-BACKPACK-NEGRO', 'Negro', 119000, 6, 1),
  ((select id from public.productos where slug = 'yonex-pro-backpack'), 'YONEX-PRO-BACKPACK-AZUL', 'Azul marino', 119000, 3, 2),
  ((select id from public.productos where slug = 'encordado'), 'ENCORDADO', 'Encordado', 15000, null, 1);

-- Fichas de raqueta (sin encordar), con el nivel y el perfil de juego que usa
-- el quiz. La rigidez es la publicada para cada modelo, aproximada.
insert into public.fichas_raqueta
  (producto_id, cabeza_pulg2, largo_mm, balance_mm, patron_principales, patron_cruzadas,
   rigidez_ra, tension_min_kg, tension_max_kg, nivel, perfil_juego)
values
  ((select id from public.productos where slug = 'babolat-pure-drive'), 100, 685, 320, 16, 19, 71, 23, 26, 'intermedio', 'potencia'),
  ((select id from public.productos where slug = 'wilson-blade-98'), 98, 685, 320, 16, 19, 62, 23, 27, 'avanzado', 'control'),
  ((select id from public.productos where slug = 'head-speed-mp'), 100, 685, 320, 16, 19, 64, 22, 26, 'intermedio', 'equilibrio'),
  ((select id from public.productos where slug = 'yonex-ezone-100'), 100, 685, 320, 16, 19, 66, 20, 27, 'principiante', 'potencia'),
  ((select id from public.productos where slug = 'wilson-clash-100'), 100, 685, 310, 16, 19, 55, 22, 26, 'intermedio', 'confort');

-- Grip y peso de cada variante de raqueta
insert into public.variantes_raqueta (variante_id, grip, peso_g) values
  ((select id from public.variantes where sku = 'BABOLAT-PURE-DRIVE-G1-300'), 1, 300),
  ((select id from public.variantes where sku = 'BABOLAT-PURE-DRIVE-G2-300'), 2, 300),
  ((select id from public.variantes where sku = 'BABOLAT-PURE-DRIVE-G3-300'), 3, 300),
  ((select id from public.variantes where sku = 'BABOLAT-PURE-DRIVE-G2-285'), 2, 285),
  ((select id from public.variantes where sku = 'BABOLAT-PURE-DRIVE-G3-285'), 3, 285),
  ((select id from public.variantes where sku = 'WILSON-BLADE-98-G2-305'), 2, 305),
  ((select id from public.variantes where sku = 'WILSON-BLADE-98-G3-305'), 3, 305),
  ((select id from public.variantes where sku = 'WILSON-BLADE-98-G4-305'), 4, 305),
  ((select id from public.variantes where sku = 'HEAD-SPEED-MP-G1-300'), 1, 300),
  ((select id from public.variantes where sku = 'HEAD-SPEED-MP-G2-300'), 2, 300),
  ((select id from public.variantes where sku = 'HEAD-SPEED-MP-G3-300'), 3, 300),
  ((select id from public.variantes where sku = 'HEAD-SPEED-MP-G4-300'), 4, 300),
  ((select id from public.variantes where sku = 'YONEX-EZONE-100-G1-300'), 1, 300),
  ((select id from public.variantes where sku = 'YONEX-EZONE-100-G2-300'), 2, 300),
  ((select id from public.variantes where sku = 'YONEX-EZONE-100-G2-285'), 2, 285),
  ((select id from public.variantes where sku = 'YONEX-EZONE-100-G3-285'), 3, 285),
  ((select id from public.variantes where sku = 'WILSON-CLASH-100-G1-295'), 1, 295),
  ((select id from public.variantes where sku = 'WILSON-CLASH-100-G2-295'), 2, 295),
  ((select id from public.variantes where sku = 'WILSON-CLASH-100-G3-295'), 3, 295);

-- Fichas de cuerda, con el perfil de juego que usa el quiz
insert into public.fichas_cuerda (producto_id, material, calibre_mm, perfil, perfil_juego) values
  ((select id from public.productos where slug = 'luxilon-alu-power-125'), 'copoliester', 1.25, 'redondo', 'control'),
  ((select id from public.productos where slug = 'babolat-rpm-blast-125'), 'copoliester', 1.25, 'octogonal', 'spin'),
  ((select id from public.productos where slug = 'solinco-hyper-g-125'), 'copoliester', 1.25, 'cuadrado', 'durabilidad'),
  ((select id from public.productos where slug = 'tecnifibre-x-one-biphase-130'), 'multifilamento', 1.30, 'redondo', 'confort');

-- Largo de cada variante de cuerda: 12 m el set, 200 m el rollo
insert into public.variantes_cuerda (variante_id, largo_m) values
  ((select id from public.variantes where sku = 'LUXILON-ALU-POWER-125-SET'), 12),
  ((select id from public.variantes where sku = 'LUXILON-ALU-POWER-125-ROLLO'), 200),
  ((select id from public.variantes where sku = 'BABOLAT-RPM-BLAST-125-SET'), 12),
  ((select id from public.variantes where sku = 'BABOLAT-RPM-BLAST-125-ROLLO'), 200),
  ((select id from public.variantes where sku = 'SOLINCO-HYPER-G-125-SET'), 12),
  ((select id from public.variantes where sku = 'SOLINCO-HYPER-G-125-ROLLO'), 200),
  ((select id from public.variantes where sku = 'TECNIFIBRE-X-ONE-BIPHASE-130-SET'), 12);

-- Fichas de pelota: superficie y uso, que usa el quiz
insert into public.fichas_pelota (producto_id, superficie, uso) values
  ((select id from public.productos where slug = 'head-tour-xt'), 'todas', 'competencia'),
  ((select id from public.productos where slug = 'wilson-us-open'), 'dura', 'competencia'),
  ((select id from public.productos where slug = 'dunlop-fort-clay-court'), 'polvo', 'competencia'),
  ((select id from public.productos where slug = 'babolat-gold-all-court'), 'todas', 'competencia'),
  ((select id from public.productos where slug = 'penn-championship'), 'todas', 'entrenamiento');

-- Compatibilidades para el armador: todas las cuerdas y grips, con una cuerda y
-- un grip recomendados por raqueta
insert into public.compatibilidades (raqueta_id, accesorio_id, accesorio_tipo, recomendado) values
  ((select id from public.productos where slug = 'babolat-pure-drive'), (select id from public.productos where slug = 'luxilon-alu-power-125'), 'cuerda', true),
  ((select id from public.productos where slug = 'babolat-pure-drive'), (select id from public.productos where slug = 'babolat-rpm-blast-125'), 'cuerda', false),
  ((select id from public.productos where slug = 'babolat-pure-drive'), (select id from public.productos where slug = 'solinco-hyper-g-125'), 'cuerda', false),
  ((select id from public.productos where slug = 'babolat-pure-drive'), (select id from public.productos where slug = 'wilson-pro-overgrip'), 'grip', true),
  ((select id from public.productos where slug = 'babolat-pure-drive'), (select id from public.productos where slug = 'tourna-grip-original'), 'grip', false),
  ((select id from public.productos where slug = 'wilson-blade-98'), (select id from public.productos where slug = 'luxilon-alu-power-125'), 'cuerda', true),
  ((select id from public.productos where slug = 'wilson-blade-98'), (select id from public.productos where slug = 'babolat-rpm-blast-125'), 'cuerda', false),
  ((select id from public.productos where slug = 'wilson-blade-98'), (select id from public.productos where slug = 'solinco-hyper-g-125'), 'cuerda', false),
  ((select id from public.productos where slug = 'wilson-blade-98'), (select id from public.productos where slug = 'wilson-pro-overgrip'), 'grip', false),
  ((select id from public.productos where slug = 'wilson-blade-98'), (select id from public.productos where slug = 'tourna-grip-original'), 'grip', true),
  ((select id from public.productos where slug = 'head-speed-mp'), (select id from public.productos where slug = 'luxilon-alu-power-125'), 'cuerda', false),
  ((select id from public.productos where slug = 'head-speed-mp'), (select id from public.productos where slug = 'babolat-rpm-blast-125'), 'cuerda', false),
  ((select id from public.productos where slug = 'head-speed-mp'), (select id from public.productos where slug = 'solinco-hyper-g-125'), 'cuerda', true),
  ((select id from public.productos where slug = 'head-speed-mp'), (select id from public.productos where slug = 'wilson-pro-overgrip'), 'grip', true),
  ((select id from public.productos where slug = 'head-speed-mp'), (select id from public.productos where slug = 'tourna-grip-original'), 'grip', false),
  ((select id from public.productos where slug = 'yonex-ezone-100'), (select id from public.productos where slug = 'luxilon-alu-power-125'), 'cuerda', false),
  ((select id from public.productos where slug = 'yonex-ezone-100'), (select id from public.productos where slug = 'babolat-rpm-blast-125'), 'cuerda', true),
  ((select id from public.productos where slug = 'yonex-ezone-100'), (select id from public.productos where slug = 'solinco-hyper-g-125'), 'cuerda', false),
  ((select id from public.productos where slug = 'yonex-ezone-100'), (select id from public.productos where slug = 'wilson-pro-overgrip'), 'grip', true),
  ((select id from public.productos where slug = 'yonex-ezone-100'), (select id from public.productos where slug = 'tourna-grip-original'), 'grip', false),
  ((select id from public.productos where slug = 'wilson-clash-100'), (select id from public.productos where slug = 'luxilon-alu-power-125'), 'cuerda', false),
  ((select id from public.productos where slug = 'wilson-clash-100'), (select id from public.productos where slug = 'babolat-rpm-blast-125'), 'cuerda', false),
  ((select id from public.productos where slug = 'wilson-clash-100'), (select id from public.productos where slug = 'solinco-hyper-g-125'), 'cuerda', true),
  ((select id from public.productos where slug = 'wilson-clash-100'), (select id from public.productos where slug = 'wilson-pro-overgrip'), 'grip', false),
  ((select id from public.productos where slug = 'wilson-clash-100'), (select id from public.productos where slug = 'tourna-grip-original'), 'grip', true),
  ((select id from public.productos where slug = 'babolat-pure-drive'), (select id from public.productos where slug = 'tecnifibre-x-one-biphase-130'), 'cuerda', false),
  ((select id from public.productos where slug = 'wilson-blade-98'), (select id from public.productos where slug = 'tecnifibre-x-one-biphase-130'), 'cuerda', false),
  ((select id from public.productos where slug = 'head-speed-mp'), (select id from public.productos where slug = 'tecnifibre-x-one-biphase-130'), 'cuerda', false),
  ((select id from public.productos where slug = 'yonex-ezone-100'), (select id from public.productos where slug = 'tecnifibre-x-one-biphase-130'), 'cuerda', false),
  ((select id from public.productos where slug = 'wilson-clash-100'), (select id from public.productos where slug = 'tecnifibre-x-one-biphase-130'), 'cuerda', false);

-- Combos
insert into public.combos (slug, nombre, descripcion, descuento_pct, orden) values
  ('kit-para-arrancar', 'Kit para arrancar',
   'Raqueta, un tubo de pelotas y overgrips para empezar a jugar.', 10, 1);

-- La raqueta se elige al comprar (grip y peso); pelotas y overgrip van fijos
insert into public.combo_items (combo_id, producto_id, variante_id, cantidad, orden) values
  ((select id from public.combos where slug = 'kit-para-arrancar'), (select id from public.productos where slug = 'yonex-ezone-100'), null, 1, 1),
  ((select id from public.combos where slug = 'kit-para-arrancar'), (select id from public.productos where slug = 'head-tour-xt'), (select id from public.variantes where sku = 'HEAD-TOUR-XT-TUBO-3'), 1, 2),
  ((select id from public.combos where slug = 'kit-para-arrancar'), (select id from public.productos where slug = 'wilson-pro-overgrip'), (select id from public.variantes where sku = 'WILSON-PRO-OVERGRIP-PACK-3'), 1, 3);

commit;
