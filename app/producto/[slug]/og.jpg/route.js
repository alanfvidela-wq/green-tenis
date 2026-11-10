import { imagenCompartir } from "@/lib/imagenCompartir";
import { getProductoPorSlug } from "@/lib/productos";

// GET /producto/<slug>/og.jpg: la imagen del producto al compartir su link
// (lib/imagenCompartir.js), con su foto principal
export async function GET(_request, { params }) {
  const { slug } = await params;
  const producto = await getProductoPorSlug(slug);
  if (!producto || producto.fotos.length === 0) return new Response(null, { status: 404 });
  return imagenCompartir([producto.fotos[0]]);
}
