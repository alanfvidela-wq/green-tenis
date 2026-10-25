import { guardarProducto, listarProductos } from "@/lib/admin";
import { conErrores, exigirAdminApi, leerJson, validar } from "@/lib/api";
import { ConsultaProductos } from "@/lib/esquemas";
import { ConsultaProductosAdmin, ProductoAdmin } from "@/lib/esquemasAdmin";
import { getPaginaDeProductos } from "@/lib/productos";

const PRIVADO = { "Cache-Control": "private, no-store" };

// GET /api/v1/productos?categoria=raquetas&page=1&limit=12: el catálogo,
// paginado y en el orden de la tienda. Con ?todos=1 (solo el admin): todos los
// productos, también los inactivos, con búsqueda (?q=pure drive). Ver
// docs/API.md.
export const GET = conErrores(async (request) => {
  const { todos, ...consulta } = Object.fromEntries(request.nextUrl.searchParams);

  if (todos !== undefined) {
    const supabase = await exigirAdminApi();
    const { q, categoria, page, limit } = validar(ConsultaProductosAdmin, consulta);
    const { productos, total } = await listarProductos(supabase, { q, categoria, page, limit });
    return Response.json(
      { productos, paginacion: { page, limit, total, paginas: Math.ceil(total / limit) } },
      { headers: PRIVADO },
    );
  }

  const { categoria, page, limit } = validar(ConsultaProductos, consulta);
  const { productos, total } = await getPaginaDeProductos({ categoria, page, limit });
  return Response.json({
    productos,
    paginacion: { page, limit, total, paginas: Math.ceil(total / limit) },
  });
});

// POST /api/v1/productos (solo el admin): crea un producto con su ficha y sus
// variantes. Responde 201 con el producto guardado.
export const POST = conErrores(async (request) => {
  const supabase = await exigirAdminApi();
  const producto = validar(ProductoAdmin, await leerJson(request));

  const guardado = await guardarProducto(supabase, producto);
  return Response.json(
    { producto: guardado },
    { status: 201, headers: { ...PRIVADO, Location: `/api/v1/productos/${guardado.id}` } },
  );
});
