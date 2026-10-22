import { ErrorApi, conErrores } from "@/lib/api";

// Cualquier otra ruta bajo /api/v1: un 404 en JSON, con la misma forma que el
// resto de los errores, en vez de la página HTML de Next
const inexistente = conErrores(async () => {
  throw new ErrorApi(404, "ruta_inexistente", "No hay ningún endpoint en esa ruta.");
});

export const GET = inexistente;
export const POST = inexistente;
export const PUT = inexistente;
export const PATCH = inexistente;
export const DELETE = inexistente;
