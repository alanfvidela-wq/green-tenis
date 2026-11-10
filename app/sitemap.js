import { getCombos } from "@/lib/combos";
import { CATEGORIAS, getProductos } from "@/lib/productos";
import { URL_SITIO } from "@/lib/sitio";

// /sitemap.xml: la home, las categorías, los listados y cada producto y combo
// a la venta. Se arma en cada pedido, con lo que esté activo en ese momento
// (getProductos y getCombos leen la base por request).
export default async function sitemap() {
  const [productos, combos] = await Promise.all([getProductos(), getCombos()]);
  const rutas = [
    "/",
    ...CATEGORIAS.map((categoria) => `/categoria/${categoria.slug}`),
    "/combos",
    "/quiz",
    ...productos.map((producto) => `/producto/${producto.slug}`),
    ...combos.map((combo) => `/combo/${combo.slug}`),
  ];
  return rutas.map((ruta) => ({ url: new URL(ruta, URL_SITIO).href }));
}
