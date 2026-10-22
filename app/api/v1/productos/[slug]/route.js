import { conErrores, noEncontrado, validar } from "@/lib/api";
import { ParametrosSlug } from "@/lib/esquemas";
import { getProductoPorSlug } from "@/lib/productos";

// GET /api/v1/productos/[slug]: un producto con sus variantes y su ficha
export const GET = conErrores(async (_request, { params }) => {
  const { slug } = validar(ParametrosSlug, await params);

  const producto = await getProductoPorSlug(slug);
  if (!producto) throw noEncontrado("No hay ningún producto con ese slug.");
  return Response.json({ producto });
});
