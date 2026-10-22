import { conErrores, sinSesion } from "@/lib/api";
import { getPedidos } from "@/lib/pedidos";
import { getUsuario } from "@/lib/sesion";

// GET /api/v1/pedidos: los pedidos del usuario con sesión, el más nuevo
// primero. Los filtra la base (RLS), no este handler. Ver docs/API.md.
export const GET = conErrores(async () => {
  if (!(await getUsuario())) throw sinSesion();

  return Response.json(
    { pedidos: await getPedidos() },
    { headers: { "Cache-Control": "private, no-store" } },
  );
});
