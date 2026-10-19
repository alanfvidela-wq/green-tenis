"use server";

import { cotizarCarrito } from "./carrito";
import { limpiarEnvio } from "./envio";
import { argumentosDePedido, limpiarLineas } from "./lineas";
import { crearClienteConSesion, getUsuario } from "./sesion";

// Confirma el pedido del usuario con sesión: valida el carrito y el envío, y
// lo crea con crear_pedido, que recalcula precios y descuentos, reserva el
// stock y lo deja en pendiente_pago. Devuelve { pedidoId } o { error }.
export async function confirmarPedido(entrada, datosEnvio) {
  const usuario = await getUsuario();
  if (!usuario) return { error: "Tu sesión se cerró. Ingresá de nuevo para confirmar." };

  const { envio, error: errorEnvio } = limpiarEnvio(datosEnvio);
  if (errorEnvio) return { error: errorEnvio };

  const lineas = limpiarLineas(entrada);
  if (lineas.length === 0) return { error: "Tu carrito está vacío." };

  // Lo mismo que ve el cliente: si alguna línea tiene un problema, no sigue
  const cotizacion = await cotizarCarrito(lineas);
  if (!cotizacion.puedeComprar) {
    return { error: "Algo cambió en tu carrito. Revisalo antes de confirmar." };
  }

  const supabase = await crearClienteConSesion();
  const { data, error } = await supabase.rpc("crear_pedido", {
    ...argumentosDePedido(lineas),
    envio_datos: envio,
  });

  if (error) {
    // Los rechazos de crear_pedido ya vienen en castellano («No hay stock
    // suficiente de …»); lo demás, no se muestra tal cual
    if (error.code === "P0001") return { error: error.message };
    if (error.code === "42501") {
      return { error: "Tu sesión se cerró. Ingresá de nuevo para confirmar." };
    }
    return { error: "No se pudo confirmar el pedido. Probá de nuevo en un rato." };
  }

  return { pedidoId: data };
}
