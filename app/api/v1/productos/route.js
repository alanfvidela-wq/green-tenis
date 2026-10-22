import { conErrores, validar } from "@/lib/api";
import { ConsultaProductos } from "@/lib/esquemas";
import { getPaginaDeProductos } from "@/lib/productos";

// GET /api/v1/productos?categoria=raquetas&page=1&limit=12: el catálogo,
// paginado y en el orden de la tienda. Ver docs/API.md.
export const GET = conErrores(async (request) => {
  const consulta = Object.fromEntries(request.nextUrl.searchParams);
  const { categoria, page, limit } = validar(ConsultaProductos, consulta);

  const { productos, total } = await getPaginaDeProductos({ categoria, page, limit });
  return Response.json({
    productos,
    paginacion: { page, limit, total, paginas: Math.ceil(total / limit) },
  });
});
