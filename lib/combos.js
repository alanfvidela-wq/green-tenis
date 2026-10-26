import { connection } from "next/server";
import { leer, supabase, urlFoto } from "./supabase";

// Cada combo con sus ítems, y de cada ítem el producto con sus variantes. Lo
// que no está activo no llega (lo esconde la base).
const CAMPOS =
  "id,slug,nombre,descripcion,descuento_pct,destacado,fotos(ruta,orden)," +
  "combo_items(id,cantidad,orden,variante_id," +
  "productos(slug,categoria,marca,nombre,fotos(ruta,orden)," +
  "variantes(id,nombre,precio,stock,orden)))";

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
// están activos
function aItem({ id, cantidad, variante_id, productos: producto }) {
  if (!producto) return null;
  const variantes = producto.variantes
    .filter((v) => variante_id === null || v.id === variante_id)
    .map(({ id, nombre, precio, stock }) => ({ id, nombre, precio, stock }));
  if (variantes.length === 0) return null;
  return {
    id,
    cantidad,
    elige: variante_id === null,
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
