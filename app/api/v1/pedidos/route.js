import { listarPedidos } from "@/lib/admin";
import { conErrores, exigirAdminApi, sinSesion, validar } from "@/lib/api";
import { ConsultaPedidosAdmin } from "@/lib/esquemasAdmin";
import { getPedidos } from "@/lib/pedidos";
import { getUsuario } from "@/lib/sesion";

const PRIVADO = { "Cache-Control": "private, no-store" };

// GET /api/v1/pedidos: los pedidos del usuario con sesión, el más nuevo
// primero. Con ?todos=1 (solo el admin): los de todos, paginados y con filtro
// por estado (?estado=pagado). Ver docs/API.md.
export const GET = conErrores(async (request) => {
  const { todos, ...consulta } = Object.fromEntries(request.nextUrl.searchParams);

  if (todos !== undefined) {
    const supabase = await exigirAdminApi();
    const { estado, page, limit } = validar(ConsultaPedidosAdmin, consulta);
    const { pedidos, total } = await listarPedidos(supabase, { estado, page, limit });
    return Response.json(
      { pedidos, paginacion: { page, limit, total, paginas: Math.ceil(total / limit) } },
      { headers: PRIVADO },
    );
  }

  if (!(await getUsuario())) throw sinSesion();
  return Response.json({ pedidos: await getPedidos() }, { headers: PRIVADO });
});
