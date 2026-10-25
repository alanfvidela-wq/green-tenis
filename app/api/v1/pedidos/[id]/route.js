import { avanzarPedido } from "@/lib/admin";
import { conErrores, exigirAdminApi, leerJson, noEncontrado, sinSesion, validar } from "@/lib/api";
import { ParametrosPedido } from "@/lib/esquemas";
import { CambioDeEstado } from "@/lib/esquemasAdmin";
import { getPedido } from "@/lib/pedidos";
import { getUsuario } from "@/lib/sesion";

// GET /api/v1/pedidos/[id]: un pedido del usuario con sesión. Primero la
// sesión (sin ella, 401 sin mirar el id), después el formato del id (400). Si
// no existe o es de otro usuario, 404 en los dos casos: RLS no lo deja ver y
// un 403 confirmaría que existe. Ver docs/API.md.
export const GET = conErrores(async (_request, { params }) => {
  if (!(await getUsuario())) throw sinSesion();
  const { id } = validar(ParametrosPedido, await params);

  const pedido = await getPedido(id);
  if (!pedido) throw noEncontrado("No hay ningún pedido tuyo con ese id.");
  return Response.json({ pedido }, { headers: { "Cache-Control": "private, no-store" } });
});

// PATCH /api/v1/pedidos/[id] (solo el admin): pasa el pedido al estado
// siguiente, { "estado": "preparando" } (desde pagado) o { "estado": "enviado" }
// (desde en preparación). Otro salto, 409 transicion_invalida.
export const PATCH = conErrores(async (request, { params }) => {
  const supabase = await exigirAdminApi();
  const { id } = validar(ParametrosPedido, await params);
  const { estado } = validar(CambioDeEstado, await leerJson(request));

  const pedido = await avanzarPedido(supabase, id, estado);
  return Response.json({ pedido }, { headers: { "Cache-Control": "private, no-store" } });
});
