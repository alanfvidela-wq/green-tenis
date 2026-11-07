// Lo que comparten los tests E2E.

// Productos del catálogo que usan los tests. Los tests no cambian el
// catálogo: si alguno deja de existir, hay que cambiarlo acá.
export const PELOTA_BARATA = { slug: "penn-championship", nombre: "Championship", opcion: "Tubo x3" };
export const OTRA_PELOTA = { slug: "head-tour-xt", nombre: "Tour XT", opcion: "Tubo x3" };

// Un precio en pesos como lo muestra la tienda («$ 12.900»), como expresión
// regular: el espacio después del $ depende del navegador (a veces es un
// espacio duro), así que se compara por los números.
export function pesos(monto) {
  const miles = String(monto).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return new RegExp(`^\\$\\s?${miles.replace(/\./g, "\\.")}$`);
}

// El monto de un texto en pesos: «$ 12.900» → 12900
export function monto(texto) {
  return Number(texto.replace(/\D/g, ""));
}

// Una raqueta con grip y peso que tenga una combinación sin stock y, con el
// mismo grip, otra que sí tenga. Sale de la API pública (la misma que lee la
// tienda), así el test no depende de cuál esté agotada hoy.
export async function raquetaConVarianteAgotada(request) {
  const listado = await request.get("/api/v1/productos?categoria=raquetas&limit=48");
  const { productos } = await listado.json();

  for (const { slug } of productos) {
    const { producto } = await (await request.get(`/api/v1/productos/${slug}`)).json();
    const variantes = producto.variantes.filter((v) => v.grip != null && v.pesoG != null);
    const agotada = variantes.find((v) => v.stock === 0);
    const conStock = agotada && variantes.find((v) => v.grip === agotada.grip && v.stock > 0);
    if (conStock) return { producto, agotada, conStock };
  }
  return null;
}

// Agrega al carrito la opción de un producto (que no sea raqueta) desde su
// ficha y espera el aviso
export async function agregarAlCarrito(page, { slug, opcion }) {
  await page.goto(`/producto/${slug}`);
  await page.getByRole("group", { name: /Opción|Presentación/ }).getByRole("button", { name: opcion }).click();
  await page.getByRole("button", { name: "Agregar al carrito" }).click();
  await page.getByRole("status").filter({ hasText: "Agregado al carrito." }).waitFor();
}
