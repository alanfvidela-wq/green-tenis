-- green.: cada bolso queda con una sola opción, la de sus fotos: el rojo de la
-- Wilson Super Tour 9, la Babolat Pure Aero RH de 6 raquetas, la Head Tour
-- Racquet Bag M y la Yonex Pro Backpack azul marino. Las otras no se borran
-- (los pedidos las referencian): se desactivan, y la tienda deja de
-- mostrarlas. Se corre una sola vez, entera, en el SQL Editor, después de
-- 0007. Va en una transacción.

begin;

update public.variantes set activa = false
where sku in (
  'WILSON-SUPER-TOUR-9-NEGRO',
  'BABOLAT-PURE-AERO-RH-12',
  'HEAD-TOUR-RACQUET-BAG-L',
  'YONEX-PRO-BACKPACK-NEGRO'
);

-- La Babolat y la Head hablaban de los dos tamaños
update public.productos
set descripcion = 'Raquetero para seis raquetas, con lugar para ropa y pelotas.',
    ficha = '[["Capacidad","6 raquetas"],["Compartimentos","2"],["Térmico","Sí"]]'::jsonb
where slug = 'babolat-pure-aero-rh';

update public.productos
set ficha = '[["Capacidad","6 raquetas"],["Compartimentos","2"],["Bolsillo para zapatillas","Sí"]]'::jsonb
where slug = 'head-tour-racquet-bag';

commit;

-- Chequeo (aparte, después): una variante activa por bolso
-- select p.slug, v.sku, v.nombre, v.activa
-- from public.variantes v join public.productos p on p.id = v.producto_id
-- where p.categoria = 'bolsos' order by p.slug, v.orden;
