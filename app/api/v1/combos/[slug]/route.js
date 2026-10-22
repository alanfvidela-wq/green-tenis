import { conErrores, noEncontrado, validar } from "@/lib/api";
import { getComboPorSlug } from "@/lib/combos";
import { ParametrosSlug } from "@/lib/esquemas";

// GET /api/v1/combos/[slug]: un combo con sus ítems y el precio de cada elección
export const GET = conErrores(async (_request, { params }) => {
  const { slug } = validar(ParametrosSlug, await params);

  const combo = await getComboPorSlug(slug);
  if (!combo) throw noEncontrado("No hay ningún combo con ese slug.");
  return Response.json({ combo });
});
