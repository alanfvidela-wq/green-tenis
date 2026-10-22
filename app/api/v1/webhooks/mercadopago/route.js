import { z } from "zod";
import { ErrorApi, conErrores, validar } from "@/lib/api";
import { conciliarPago, pagoOnlineDisponible } from "@/lib/cobros";
import { ErrorMercadoPago, firmaValida } from "@/lib/mercadopago";

// POST /api/v1/webhooks/mercadopago: los avisos de Mercado Pago (Webhooks).
// Valida la firma, toma el id del pago, lo consulta en Mercado Pago y lo
// concilia con conciliar_pago. Del aviso solo se usa el id: el estado y el
// monto salen siempre de GET /v1/payments/:id. Ver docs/API.md.
//
// Responde 200 enseguida a lo que no es un pago. Un pago se procesa antes de
// responder (tarda menos de un segundo): si algo falla, el 5xx hace que
// Mercado Pago reintente. Sin la configuración de Mercado Pago responde 503:
// el aviso no se pierde y llega de nuevo cuando estén las variables.

// ?data.id=123456&type=payment. data.id es el valor firmado.
const Consulta = z.object({
  "data.id": z.string().optional(),
  type: z.string().optional(),
});

// El cuerpo es solo una señal: se lee el tipo de evento y nada más
const Aviso = z.object({
  type: z.string().optional(),
  action: z.string().optional(),
});

const AvisoDePago = z.object({
  "data.id": z.string().regex(/^\d{1,20}$/, "El id del pago tiene que ser un número"),
});

export const POST = conErrores(async (request) => {
  const { searchParams } = new URL(request.url);
  const consulta = validar(Consulta, Object.fromEntries(searchParams));

  if (!pagoOnlineDisponible()) {
    throw new ErrorApi(503, "pago_online_no_disponible", "El pago online todavía no está configurado.");
  }
  const firmado = firmaValida({
    firma: request.headers.get("x-signature"),
    requestId: request.headers.get("x-request-id"),
    dataId: consulta["data.id"],
    secreto: process.env.MP_WEBHOOK_SECRET,
  });
  if (!firmado) throw new ErrorApi(401, "firma_invalida", "La firma del aviso no coincide.");

  const aviso = Aviso.safeParse(await request.json().catch(() => null));
  const tipo = (aviso.success && aviso.data.type) || consulta.type;
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

  console.info(`Webhook de Mercado Pago: pago ${pagoId} → ${resultado}`);
  return Response.json({ recibido: true, resultado });
});
