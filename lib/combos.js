import { connection } from "next/server";
import { leer, supabase, urlFoto } from "./supabase";

// Cada combo con sus ítems, y de cada ítem el producto con sus variantes. Lo
// que no está activo no llega (lo esconde la base).
const CAMPOS =
  "id,slug,nombre,descripcion,descuento_pct,destacado,fotos(ruta,orden)," +
  "combo_items(id,cantidad,orden,variante_id," +
  "productos(slug,categoria,marca,nombre,fotos(ruta,orden)," +
  "variantes(id,nombre,precio,stock,orden,orden_foto)))";

function consulta() {
  return supabase
    .from("combos")
    .select(CAMPOS)
    .eq("activo", true)
    .order("orden")
    .order("id")
    .order("orden", { referencedTable: "fotos" })
    .order("orden", { referencedTable: "combo_items" })
    .order("orden", { referencedTable: "combo_items.productos.fotos" })
    .order("orden", { referencedTable: "combo_items.productos.variantes" });
}

// El precio de un combo: la suma de sus ítems, menos el descuento redondeado
// para abajo. Es la misma cuenta que hace crear_pedido en la base.
function conDescuento(lista, descuentoPct) {
  const descuento = Math.floor((lista * descuentoPct) / 100);
  return { lista, descuento, precio: lista - descuento };
}

// Cuántos combos alcanzan con el stock de un ítem: con la variante fija, los
// de esa variante; si se elige, los de todas sumadas. Sin stock que controlar
// (servicios), no pone límite.
function stockItem({ cantidad, variantes }) {
  let total = 0;
  for (const variante of variantes) {
    if (variante.stock === null) return Infinity;
    total += Math.floor(variante.stock / cantidad);
  }
  return total;
}

// null si el ítem no se puede comprar: el producto o su variante fija ya no
// están activos. `foto` es la del ítem: la de su variante fija, si tiene
// foto propia (orden_foto, como el pack de 3 de un grip), o la principal del
// producto.
function aItem({ id, cantidad, variante_id, productos: producto }) {
  if (!producto) return null;
  const fija = producto.variantes.filter((v) => variante_id === null || v.id === variante_id);
  const variantes = fija.map(({ id, nombre, precio, stock }) => ({ id, nombre, precio, stock }));
  if (variantes.length === 0) return null;
  const ordenFoto = variante_id === null ? null : fija[0].orden_foto;
  const foto = producto.fotos.find((f) => f.orden === ordenFoto) ?? producto.fotos[0];
  return {
    id,
    cantidad,
    elige: variante_id === null,
    foto: foto ? urlFoto(foto.ruta) : null,
    producto: {
      slug: producto.slug,
      categoria: producto.categoria,
      marca: producto.marca,
      nombre: producto.nombre,
      fotos: producto.fotos.map((f) => urlFoto(f.ruta)),
    },
    variantes,
  };
}

// La clave de una elección: los ids de las variantes elegidas, en el orden de
// los ítems a elegir, separados por comas («» si no hay nada para elegir)
export function claveEleccion(items, elecciones) {
  return items
    .filter((item) => item.elige)
    .map((item) => elecciones[item.id])
    .join(",");
}

// El precio de cada combinación de opciones, calculado acá: la página solo
// muestra el que corresponde a lo que se eligió (ver claveEleccion)
function preciosPorEleccion(items, descuentoPct) {
  const fijo = items
    .filter((item) => !item.elige)
    .reduce((suma, item) => suma + item.cantidad * item.variantes[0].precio, 0);
  let combinaciones = [{ ids: [], lista: fijo }];
  for (const item of items.filter((i) => i.elige)) {
    combinaciones = combinaciones.flatMap((c) =>
      item.variantes.map((v) => ({
        ids: [...c.ids, v.id],
        lista: c.lista + item.cantidad * v.precio,
      })),
    );
  }
  return Object.fromEntries(
    combinaciones.map((c) => [c.ids.join(","), conDescuento(c.lista, descuentoPct)]),
  );
}

// null si algún ítem no se puede comprar: el combo no se muestra
function aCombo(fila) {
  const items = fila.combo_items.map(aItem);
  if (items.length === 0 || items.includes(null)) return null;

  const listaDesde = items.reduce(
    (suma, item) => suma + item.cantidad * Math.min(...item.variantes.map((v) => v.precio)),
    0,
  );
  const desde = conDescuento(listaDesde, fila.descuento_pct);
  const stock = Math.min(...items.map(stockItem));

  return {
    id: fila.id,
    slug: fila.slug,
    nombre: fila.nombre,
    descripcion: fila.descripcion,
    descuentoPct: fila.descuento_pct,
    destacado: fila.destacado,
    precioListaDesde: desde.lista,
    precioDesde: desde.precio,
    ahorroDesde: desde.descuento,
    stock: stock === Infinity ? null : stock,
    fotos: fila.fotos.map((f) => urlFoto(f.ruta)),
    items,
    precios: preciosPorEleccion(items, fila.descuento_pct),
  };
}

export async function getCombos() {
  // El stock se lee en cada request, no en el build
  await connection();
  return (await leer(consulta())).map(aCombo).filter(Boolean);
}

async function leerCombo(slug) {
  const fila = await leer(consulta().eq("slug", slug).maybeSingle());
  return fila ? aCombo(fila) : null;
}

export async function getComboPorSlug(slug) {
  await connection();
  return leerCombo(slug);
}

// Si getComboPorSlug encontraría el combo. Lo pregunta el proxy antes de la
// página, para responder 404 (ver proxy.js). Se lee entero porque depende de
// sus ítems (ver aCombo).
export async function existeCombo(slug) {
  return Boolean(await leerCombo(slug));
}

// Los combos que llevan un producto («Combina con», en su página)
export async function getCombosConProducto(slug) {
  return (await getCombos()).filter((combo) => combo.items.some((item) => item.producto.slug === slug));
}

// Para cotizar el carrito (desde una Server Action, que ya corre por request)
export async function getCombosPorId(ids) {
  if (ids.length === 0) return [];
  return (await leer(consulta().in("id", ids))).map(aCombo).filter(Boolean);
}

export function comboTieneStock(combo) {
  return combo.stock === null || combo.stock > 0;
}

export function comboTienePreciosDistintos(combo) {
  return new Set(Object.values(combo.precios).map((p) => p.precio)).size > 1;
}

// Lo que trae un combo, corto, para la celda: «2 × Dunlop Fort Clay Court»
export function lineasDeCombo(combo) {
  return combo.items.map(
    ({ cantidad, producto }) => `${cantidad > 1 ? `${cantidad} × ` : ""}${producto.marca} ${producto.nombre}`,
  );
}

// El combo que coincide con el kit del quiz (los ítems de armarKit, en
// lib/kits.js): lleva la primera raqueta que recomienda y además su cuerda o
// su pelota. Entre varios, el que comparte más productos; solo los que tienen
// stock. null si no hay ninguno.
export function comboDelKit(kit, combos) {
  const raqueta = kit.find((item) => item.rol === "raqueta")?.producto.slug;
  if (!raqueta) return null;
  const resto = new Set(kit.filter((item) => item.rol !== "raqueta").map((item) => item.producto.slug));
  let elegido = null;
  let enComun = 0;
  for (const combo of combos.filter(comboTieneStock)) {
    const slugs = combo.items.map((item) => item.producto.slug);
    if (!slugs.includes(raqueta)) continue;
    const cuantos = slugs.filter((slug) => resto.has(slug)).length;
    if (cuantos > enComun) {
      elegido = combo;
      enComun = cuantos;
    }
  }
  return elegido;
}
