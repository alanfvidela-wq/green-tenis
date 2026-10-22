import "server-only";
import { crearPreferencia, getPago } from "./mercadopago";
import { getPedido } from "./pedidos";
import { origenDelSitio } from "./sitio";
import { crearClienteDeServicio } from "./supabaseServicio";

// Cobrar un pedido con Checkout Pro y conciliar lo que avisa Mercado Pago. No
// son Server Actions: las llaman lib/checkout.js y el webhook.

const NO_SE_PAGA = {
  procesando: "Mercado Pago está procesando un pago de este pedido. Esperá a que se resuelva.",
  vencido: "El pedido venció: pasaron 30 minutos sin el pago. Armalo de nuevo desde el carrito.",
  cancelado: "El pedido está cancelado.",
};

// El link a Checkout Pro de un pedido pendiente del usuario con sesión: el que
// ya tiene guardado o, si no tiene, uno nuevo. Los ítems salen del pedido
// guardado (getPedido lee con la sesión, así que solo encuentra los suyos).
// Devuelve { url } o { error }; nunca tira, porque el checkout la llama con el
// pedido ya creado.
export async function linkDePago(pedidoId, email) {
  try {
    const pedido = await getPedido(pedidoId);
    if (!pedido) return { error: "No encontramos ese pedido." };
    if (pedido.estado.clave !== "pendiente_pago") {
      return { error: NO_SE_PAGA[pedido.estado.clave] ?? "Este pedido ya está pagado." };
    }
    if (pedido.initPoint) return { url: pedido.initPoint };

    const preferencia = await crearPreferencia({ pedido, email, origen: await origenDelSitio() });
    const { error } = await crearClienteDeServicio().rpc("guardar_preferencia", {
      pedido: pedido.id,
      preferencia: preferencia.id,
      init_point: preferencia.initPoint,
    });
    // Sin guardarla, igual sirve: la próxima vez se crea otra
    if (error) console.error(`No se pudo guardar la preferencia del pedido ${pedido.id}:`, error.message);
    return { url: preferencia.initPoint };
  } catch (error) {
    console.error(`No se pudo armar el pago del pedido ${pedidoId}:`, error);
    return { error: "No pudimos abrir Mercado Pago. Probá de nuevo en un rato." };
  }
}

// Consulta el pago en Mercado Pago (nunca se confía en el aviso) y lo concilia
// con su pedido con conciliar_pago. Devuelve lo que hizo la base (pagado,
// en_curso, sin_cambios…) o pago_inexistente.
export async function conciliarPago(pagoId) {
  const pago = await getPago(pagoId);
  if (!pago) return "pago_inexistente";

  const { data, error } = await crearClienteDeServicio().rpc("conciliar_pago", { pago });
  if (error) throw new Error(`No se pudo conciliar el pago ${pagoId}: ${error.message}`);
  return data;
}
