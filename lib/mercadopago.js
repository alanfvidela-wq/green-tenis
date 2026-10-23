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
// pendientes por días y el pedido no puede esperar tanto. auto_return solo con
// HTTPS: Mercado Pago no vuelve solo a localhost.
//
// Sin notification_url: los avisos van a la URL registrada en el panel
// (Webhooks › Configurar notificaciones, modo de prueba y productivo), que es
// donde Mercado Pago garantiza la firma con la clave secreta. Con la
// notification_url de la preferencia, los avisos reales del pedido #4 llegaron
// con una firma que no validaba, mientras «Simular» (que va a la URL del
// panel) sí. Devuelve { id, initPoint }.
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
      ...(conHttps && { auto_return: "approved" }),
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
// Lo mismo para un pago consultado por id o encontrado en una búsqueda (ahí el
// id puede venir como texto).
const Pago = z.object({
  id: z.coerce.number().int().positive(),
  status: z.string().min(1),
  status_detail: z.string().nullish(),
  external_reference: z.string().nullish(),
  transaction_amount: z.number(),
  currency_id: z.string().min(1),
  payment_method_id: z.string().nullish(),
  // Cuándo se aprobó: decide si un pedido vencido se reactiva. Si no viene o
  // no se entiende, el pago se concilia igual y el pedido vencido va a revisión.
  date_approved: z.string().nullish().catch(null),
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

// Los pagos de un pedido, buscados en Mercado Pago por external_reference (el
// id del pedido), del más viejo al más nuevo. La búsqueda va con el Access
// Token, así que solo devuelve pagos cobrados por la tienda. Un resultado que
// no tiene la forma esperada se saltea (y se loguea) en vez de frenar los
// demás. La búsqueda puede tardar unos segundos en mostrar un pago recién hecho.
export async function buscarPagos(externalReference) {
  const consulta = new URLSearchParams({
    external_reference: externalReference,
    sort: "date_created",
    criteria: "asc",
    limit: "50",
  });
  const datos = await llamar(`/v1/payments/search?${consulta}`);
  if (!Array.isArray(datos?.results)) {
    throw new ErrorMercadoPago(502, `La búsqueda de pagos de ${externalReference} no tiene el formato esperado`);
  }

  const pagos = [];
  for (const resultado of datos.results) {
    const pago = Pago.safeParse(resultado);
    if (!pago.success) {
      console.warn(`Un pago de ${externalReference} no tiene el formato esperado (id ${resultado?.id})`);
    } else if (pago.data.external_reference === externalReference) {
      pagos.push(pago.data);
    }
  }
  return pagos;
}

// Las claves secretas del webhook. MP_WEBHOOK_SECRET puede traer varias,
// separadas por comas: la del modo de prueba y la del productivo (en el panel
// pueden ser distintas), o la vieja y la nueva mientras se cambia con
// «Restablecer».
export function secretosDelWebhook() {
  return (process.env.MP_WEBHOOK_SECRET ?? "")
    .split(",")
    .map((secreto) => secreto.trim())
    .filter(Boolean);
}

// Qué tan viejo es el ts de la firma. Mercado Pago lo manda en milisegundos
// (13 dígitos) aunque algunos ejemplos y el SDK lo traten como segundos: se
// mira el largo. Solo es para el log: no se rechaza por antigüedad, porque un
// aviso repetido no hace daño (el pago se consulta de nuevo y la conciliación
// es idempotente) y no está claro que los reintentos vengan con un ts nuevo.
function antiguedadDe(ts) {
  const enMilisegundos = ts.length >= 13;
  const segundos = Math.round((Date.now() - Number(ts) * (enMilisegundos ? 1 : 1000)) / 1000);
  return { unidad: enMilisegundos ? "milisegundos" : "segundos", segundos };
}

// Verifica la firma de un aviso: x-signature trae «ts=…,v1=…», y v1 es el
// HMAC-SHA256 (en hexadecimal, con la clave secreta) de
// «id:<data.id>;request-id:<x-request-id>;ts:<ts>;», con data.id de la query
// en minúsculas. Lo que no llega se saca del manifiesto. Prueba cada clave de
// `secretos`.
//
// Devuelve { valida: true, clave } (cuál de las claves, desde 1) o
// { valida: false, motivo }: «falta x-signature», «x-signature sin ts o sin
// v1» o «hash distinto» (con o sin x-request-id). En los dos casos, con lo que
// sirve para el log:
// data.id, x-request-id, ts y su antigüedad, y cuántas claves se probaron.
// Nunca las claves ni los hashes.
export function verificarFirma({ firma, requestId, dataId, secretos }) {
  const datos = {
    dataId: dataId ?? null,
    requestId: requestId ?? null,
    ts: null,
    antiguedad: null,
    claves: secretos.length,
  };
  if (!firma) return { valida: false, motivo: "falta x-signature", ...datos };

  const partes = {};
  for (const parte of firma.split(",")) {
    const igual = parte.indexOf("=");
    if (igual > 0) partes[parte.slice(0, igual).trim().toLowerCase()] = parte.slice(igual + 1).trim();
  }
  const { ts, v1 } = partes;
  if (!ts || !/^\d+$/.test(ts) || !v1) {
    return { valida: false, motivo: "x-signature sin ts o sin v1", ...datos };
  }
  datos.ts = ts;
  datos.antiguedad = antiguedadDe(ts);

  const manifiesto =
    [dataId && `id:${dataId.toLowerCase()}`, requestId && `request-id:${requestId}`, `ts:${ts}`]
      .filter(Boolean)
      .join(";") + ";";
  const recibida = Buffer.from(v1);
  const coincide = (secreto) => {
    const esperada = Buffer.from(createHmac("sha256", secreto).update(manifiesto).digest("hex"));
    return esperada.length === recibida.length && timingSafeEqual(esperada, recibida);
  };

  const indice = secretos.findIndex(coincide);
  if (indice === -1) {
    // Sin x-request-id el manifiesto es otro: si Mercado Pago lo firmó con uno,
    // no va a coincidir
    return { valida: false, motivo: requestId ? "hash distinto" : "hash distinto, sin x-request-id", ...datos };
  }
  return { valida: true, clave: indice + 1, ...datos };
}
