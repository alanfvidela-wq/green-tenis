import { getComboPorSlug } from "@/lib/combos";
import { fotosDeCombo, imagenCompartir } from "@/lib/imagenCompartir";

// GET /combo/<slug>/og.jpg: la imagen del combo al compartir su link
// (lib/imagenCompartir.js), con las fotos de lo que trae
export async function GET(_request, { params }) {
  const { slug } = await params;
  const combo = await getComboPorSlug(slug);
  const fotos = combo ? fotosDeCombo(combo) : [];
  if (fotos.length === 0) return new Response(null, { status: 404 });
  return imagenCompartir(fotos);
}
