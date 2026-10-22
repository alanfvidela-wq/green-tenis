import { headers } from "next/headers";

// La dirección del sitio desde donde llega el pedido (localhost o Vercel), para
// que los links que salen del servidor (el mail de recuperación, las vueltas
// de Mercado Pago) vuelvan al mismo lugar
export async function origenDelSitio() {
  const encabezados = await headers();
  const host = encabezados.get("x-forwarded-host") ?? encabezados.get("host");
  const protocolo =
    encabezados.get("x-forwarded-proto")?.split(",")[0] ??
    (host?.startsWith("localhost") ? "http" : "https");
  return `${protocolo}://${host}`;
}
