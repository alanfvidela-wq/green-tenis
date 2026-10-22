import "server-only";
import { crearPreferencia, getPago, secretosDelWebhook } from "./mercadopago";
import { getPedido } from "./pedidos";
import { origenDelSitio } from "./sitio";
import { crearClienteDeServicio } from "./supabaseServicio";

// Cobrar un pedido con Checkout Pro y conciliar lo que avisa Mercado Pago. No
// son Server Actions: las llaman lib/checkout.js y el webhook.

export const SIN_PAGO_ONLINE = "El pago online todavía no está disponible.";

// El pago online anda solo con las tres variables: sin el Access Token no hay
// preferencia, y sin el secret del webhook o la clave secreta de Supabase se
// cobraría sin poder marcar el pedido como pagado. Mientras falte alguna, los
// pedidos se crean igual y quedan pendientes, sin botón de pago. Se lee en
// cada request: alcanza con cargar las variables y volver a publicar.
export function pagoOnlineDisponible() {
  return Boolean(
    process.env.MP_ACCESS_TOKEN && secretosDelWebhook().length > 0 && process.env.SUPABASE_SECRET_KEY,
  );
}

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
  if (!pagoOnlineDisponible()) return { error: SIN_PAGO_ONLINE };
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
