import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { z } from "zod";

// Mercado Pago (Checkout Pro), por su API REST y con el Access Token
// (MP_ACCESS_TOKEN), siempre desde el servidor: crear la preferencia de un
// pedido, consultar un pago y validar la firma de un aviso del webhook.

const API = "https://api.mercadopago.com";
// El webhook tiene que responder en menos de 22 segundos
const ESPERA_MS = 8000;

export class ErrorMercadoPago extends Error {
  constructor(status, mensaje) {
    super(mensaje);
    this.name = "ErrorMercadoPago";
    this.status = status;
  }
}

async function llamar(ruta, { method = "GET", cuerpo } = {}) {
  const token = process.env.MP_ACCESS_TOKEN;
  if (!token) throw new Error("Falta la variable MP_ACCESS_TOKEN");

  let respuesta;
  try {
    respuesta = await fetch(`${API}${ruta}`, {
      method,
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: cuerpo ? JSON.stringify(cuerpo) : undefined,
      cache: "no-store",
      signal: AbortSignal.timeout(ESPERA_MS),
    });
  } catch (error) {
    throw new ErrorMercadoPago(0, `Mercado Pago no respondió: ${error.message}`);
  }

  const datos = await respuesta.json().catch(() => null);
  if (!respuesta.ok) {
    throw new ErrorMercadoPago(
      respuesta.status,
      `Mercado Pago respondió ${respuesta.status} en ${method} ${ruta}: ${datos?.message ?? respuesta.statusText}`,
    );
  }
  return datos;
}

// Las fechas como las pide Mercado Pago: «2026-10-22T17:32:00.000+00:00»
function fechaMp(fecha) {
  return new Date(fecha).toISOString().replace("Z", "+00:00");
}

// Los ítems de la preferencia salen del pedido guardado, nunca del carrito:
// cada combo es un ítem con su precio ya descontado (Mercado Pago no acepta
// ítems negativos), cada producto suelto otro y el envío, si cuesta, otro. La
// suma tiene que dar el total del pedido.
function itemsDelPedido(pedido) {
  const items = [
    ...pedido.combos.map((combo) => ({
      id: `combo-${combo.comboId}`,
      title: combo.nombre,
      description: combo.lineas.map((linea) => `${linea.nombre} (${linea.variante})`).join(", "),
      quantity: 1,
      unit_price: combo.precio,
      currency_id: "ARS",
    })),
    ...pedido.sueltas.map((linea) => ({
      id: linea.slug,
      title: `${linea.nombre} (${linea.variante})`,
      quantity: linea.cantidad,
      unit_price: linea.precioUnitario,
      currency_id: "ARS",
    })),
  ];
  if (pedido.envio > 0) {
    items.push({ id: "envio", title: "Envío", quantity: 1, unit_price: pedido.envio, currency_id: "ARS" });
  }

  const suma = items.reduce((total, item) => total + item.quantity * item.unit_price, 0);
  if (suma !== pedido.total) {
    throw new Error(`Los ítems del pedido #${pedido.numero} suman ${suma} y el total es ${pedido.total}`);
  }
  return items;
}

// Crea la preferencia de Checkout Pro de un pedido. Vence junto con el pedido
// (a los 30 minutos de creado), así que se puede reusar mientras se pueda
// pagar. Sin medios en efectivo (Rapipago, Pago Fácil, cajeros): quedan
// pendientes por días y el pedido no puede esperar tanto. auto_return y
// notification_url solo con HTTPS: Mercado Pago no vuelve ni avisa a
// localhost. Devuelve { id, initPoint }.
export async function crearPreferencia({ pedido, email, origen }) {
  const volver = (resultado) => `${origen}/mis-pedidos/${pedido.id}/pago/${resultado}`;
  const conHttps = origen.startsWith("https://");

  const preferencia = await llamar("/checkout/preferences", {
    method: "POST",
    cuerpo: {
      items: itemsDelPedido(pedido),
      payer: { email },
      external_reference: pedido.id,
      back_urls: {
        success: volver("aprobado"),
        pending: volver("pendiente"),
        failure: volver("rechazado"),
      },
      ...(conHttps && {
        auto_return: "approved",
        // source_news=webhooks: solo avisos de Webhooks (firmados), sin los IPN
        notification_url: `${origen}/api/v1/webhooks/mercadopago?source_news=webhooks`,
      }),
      payment_methods: { excluded_payment_types: [{ id: "ticket" }, { id: "atm" }] },
      expires: true,
      expiration_date_from: fechaMp(pedido.creadoEn),
      expiration_date_to: fechaMp(pedido.venceEn),
      statement_descriptor: "GREEN",
    },
  });

  return { id: preferencia.id, initPoint: preferencia.init_point };
}

// Lo que se usa de GET /v1/payments/:id. El resto del pago no se guarda.
const Pago = z.object({
  id: z.number().int().positive(),
  status: z.string().min(1),
  status_detail: z.string().nullish(),
  external_reference: z.string().nullish(),
  transaction_amount: z.number(),
  currency_id: z.string().min(1),
  payment_method_id: z.string().nullish(),
});

// El pago tal como lo tiene Mercado Pago; null si no existe (por ejemplo, el
// id de prueba que manda «Simular» en el panel)
export async function getPago(id) {
  let datos;
  try {
    datos = await llamar(`/v1/payments/${encodeURIComponent(id)}`);
  } catch (error) {
    if (error.status === 404) return null;
    throw error;
  }
  const pago = Pago.safeParse(datos);
  if (!pago.success) throw new ErrorMercadoPago(502, `El pago ${id} no tiene el formato esperado`);
  return pago.data;
}

// Valida la firma de un aviso: x-signature trae «ts=…,v1=…», y v1 es el
// HMAC-SHA256 (en hexadecimal, con el secret del webhook) de
// «id:<data.id>;request-id:<x-request-id>;ts:<ts>;». Lo que no llega se saca
// del manifiesto; data.id va en minúsculas. No se mira la antigüedad de ts: un
// aviso repetido no hace daño, porque el pago se consulta de nuevo y la
// conciliación es idempotente.
export function firmaValida({ firma, requestId, dataId, secreto }) {
  if (!firma || !secreto) return false;

  const partes = {};
  for (const parte of firma.split(",")) {
    const igual = parte.indexOf("=");
    if (igual > 0) partes[parte.slice(0, igual).trim()] = parte.slice(igual + 1).trim();
  }
  const { ts, v1 } = partes;
  if (!ts || !v1) return false;

  const manifiesto =
    [dataId && `id:${dataId.toLowerCase()}`, requestId && `request-id:${requestId}`, `ts:${ts}`]
      .filter(Boolean)
      .join(";") + ";";
  const esperada = Buffer.from(createHmac("sha256", secreto).update(manifiesto).digest("hex"));
  const recibida = Buffer.from(v1);
  return esperada.length === recibida.length && timingSafeEqual(esperada, recibida);
}
