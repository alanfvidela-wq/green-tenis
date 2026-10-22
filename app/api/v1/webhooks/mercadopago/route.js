import { z } from "zod";
import { ErrorApi, conErrores, validar } from "@/lib/api";
import { conciliarPago, pagoOnlineDisponible } from "@/lib/cobros";
import { ErrorMercadoPago, secretosDelWebhook, verificarFirma } from "@/lib/mercadopago";

// POST /api/v1/webhooks/mercadopago: los avisos de Mercado Pago (Webhooks).
// Valida la firma, toma el id del pago, lo consulta en Mercado Pago y lo
// concilia con conciliar_pago. Del aviso solo se usa el id: el estado y el
// monto salen siempre de GET /v1/payments/:id. Ver docs/API.md.
//
// Responde 200 enseguida a lo que no es un pago. Un pago se procesa antes de
// responder (tarda menos de un segundo): si algo falla, el 5xx hace que
// Mercado Pago reintente. Sin la configuración de Mercado Pago responde 503:
// el aviso no se pierde y llega de nuevo cuando estén las variables.

// ?data.id=123456&type=payment. data.id es el valor firmado. source_news solo
// llega si la URL la tenía (la notification_url de las preferencias viejas)
const Consulta = z.object({
  "data.id": z.string().optional(),
  type: z.string().optional(),
  source_news: z.string().optional(),
});

// El cuerpo es solo una señal: se lee el tipo de evento y, para el log, si es
// de producción (live_mode)
const Aviso = z.object({
  type: z.string().optional(),
  action: z.string().optional(),
  live_mode: z.boolean().optional(),
});

const AvisoDePago = z.object({
  "data.id": z.string().regex(/^\d{1,20}$/, "El id del pago tiene que ser un número"),
});

// Lo que se sabe de la firma y del aviso, en una línea para el log. Nunca las
// claves ni los hashes.
function describir(firma, aviso, consulta, request) {
  const { dataId, requestId, ts, antiguedad, claves } = firma;
  return [
    `data.id=${dataId ?? "no vino"}`,
    `x-request-id=${requestId ?? "no vino"}`,
    ts ? `ts=${ts} (en ${antiguedad.unidad}, hace ${antiguedad.segundos} s)` : "ts=no vino",
    `claves probadas=${claves}`,
    `live_mode=${aviso.live_mode ?? "no vino"}`,
    `source_news=${consulta.source_news ?? "no vino"}`,
    `user-agent="${request.headers.get("user-agent") ?? ""}"`,
  ].join(", ");
}

export const POST = conErrores(async (request) => {
  const { searchParams } = new URL(request.url);
  const consulta = validar(Consulta, Object.fromEntries(searchParams));

  if (!pagoOnlineDisponible()) {
    throw new ErrorApi(503, "pago_online_no_disponible", "El pago online todavía no está configurado.");
  }

  const leido = Aviso.safeParse(await request.json().catch(() => null));
  const aviso = leido.success ? leido.data : {};

  const firma = verificarFirma({
    firma: request.headers.get("x-signature"),
    requestId: request.headers.get("x-request-id"),
    dataId: consulta["data.id"],
    secretos: secretosDelWebhook(),
  });
  if (!firma.valida) {
    console.warn(
      `Webhook de Mercado Pago: firma rechazada (${firma.motivo}). ${describir(firma, aviso, consulta, request)}`,
    );
    throw new ErrorApi(401, "firma_invalida", "La firma del aviso no coincide.", [
      { campo: "x-signature", mensaje: firma.motivo },
    ]);
  }

  const tipo = aviso.type || consulta.type;
  if (tipo !== "payment") {
    return Response.json({ recibido: true, resultado: "ignorado", tipo: tipo ?? null });
  }

  const { "data.id": pagoId } = validar(AvisoDePago, consulta);
  let resultado;
  try {
    resultado = await conciliarPago(pagoId);
  } catch (error) {
    if (error instanceof ErrorMercadoPago) {
      console.error(`Webhook de Mercado Pago, pago ${pagoId}:`, error.message);
      throw new ErrorApi(502, "mercadopago_no_responde", "No se pudo consultar el pago en Mercado Pago.");
    }
    throw error;
  }

  console.info(
    `Webhook de Mercado Pago: pago ${pagoId} → ${resultado} (firma válida con la clave ${firma.clave} de ${firma.claves}, live_mode=${aviso.live_mode ?? "no vino"}, source_news=${consulta.source_news ?? "no vino"})`,
  );
  return Response.json({ recibido: true, resultado });
});
