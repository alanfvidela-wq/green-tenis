// Cómo las pantallas de la administración llaman a /api/v1 desde el
// navegador: fetch con la cookie de sesión (la misma del sitio), JSON de ida y
// vuelta, y los errores de la API (ver «Errores» en docs/API.md) como
// excepción, con su código y el detalle de cada campo.

export class ErrorDeApi extends Error {
  constructor(status, error) {
    super(error?.mensaje ?? MENSAJES[status] ?? "No se pudo completar. Probá de nuevo.");
    this.name = "ErrorDeApi";
    this.status = status;
    this.codigo = error?.codigo ?? null;
    this.detalles = error?.detalles ?? [];
  }
}

const MENSAJES = {
  401: "Tu sesión venció: volvé a ingresar.",
  403: "Esto lo puede hacer solo el admin.",
};

export async function pedirApi(url, { method = "GET", cuerpo, signal } = {}) {
  let respuesta;
  try {
    respuesta = await fetch(url, {
      method,
      signal,
      cache: "no-store",
      headers: cuerpo === undefined ? undefined : { "Content-Type": "application/json" },
      body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
    });
  } catch (error) {
    if (error.name === "AbortError") throw error;
    throw new ErrorDeApi(0, { mensaje: "No hay conexión. Probá de nuevo." });
  }
  if (respuesta.status === 204) return null;
  const datos = await respuesta.json().catch(() => null);
  if (!respuesta.ok) throw new ErrorDeApi(respuesta.status, datos?.error);
  return datos;
}

// Los detalles de un 400 por campo: { "variantes.0.precio": "Tiene que ser…" }
export function erroresPorCampo(error) {
  return Object.fromEntries((error?.detalles ?? []).map(({ campo, mensaje }) => [campo, mensaje]));
}
