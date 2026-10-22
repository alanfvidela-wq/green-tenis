import { unstable_rethrow } from "next/navigation";

// Errores de la API (/api/v1, ver docs/API.md). Cada uno sale como
//
//   { "error": { "codigo": "firma_invalida", "mensaje": "…", "detalles": […] } }
//
// con su status HTTP. Todos quedan en el log del servidor. Lo que no es un
// ErrorApi es un error nuestro: se loguea completo y sale como 500, sin contar
// qué pasó.

export class ErrorApi extends Error {
  constructor(status, codigo, mensaje, detalles) {
    super(mensaje);
    this.name = "ErrorApi";
    this.status = status;
    this.codigo = codigo;
    this.detalles = detalles;
  }
}

// 404: lo pedido no existe (o, si es de otro usuario, no se ve: RLS)
export function noEncontrado(mensaje) {
  return new ErrorApi(404, "no_encontrado", mensaje);
}

// 401: el endpoint pide sesión y no hay
export function sinSesion() {
  return new ErrorApi(401, "sin_sesion", "Hace falta iniciar sesión.");
}

// Los datos que dejó pasar un esquema de Zod; si no pasan, un 400 que dice
// qué campo falló y por qué
export function validar(esquema, datos) {
  const resultado = esquema.safeParse(datos);
  if (resultado.success) return resultado.data;
  throw new ErrorApi(
    400,
    "datos_invalidos",
    "Los datos no tienen el formato esperado.",
    resultado.error.issues.map((problema) => ({
      campo: problema.path.join("."),
      mensaje: problema.message,
    })),
  );
}

// Envuelve un Route Handler: lo que tire queda en el log y sale como respuesta
// de error. Los errores internos de Next (notFound, redirect) siguen su curso.
export function conErrores(manejador) {
  return async (request, contexto) => {
    try {
      return await manejador(request, contexto);
    } catch (error) {
      unstable_rethrow(error);
      const ruta = `${request.method} ${new URL(request.url).pathname}`;

      if (error instanceof ErrorApi) {
        const { status, codigo, message: mensaje, detalles } = error;
        (status >= 500 ? console.error : console.warn)(`${ruta} → ${status} ${codigo}`);
        return Response.json({ error: { codigo, mensaje, detalles } }, { status });
      }

      console.error(`${ruta} → 500:`, error);
      return Response.json(
        { error: { codigo: "error_interno", mensaje: "Algo falló de nuestro lado." } },
        { status: 500 },
      );
    }
  };
}
