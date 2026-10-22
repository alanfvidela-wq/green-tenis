// Errores de la API (/api/v1, ver docs/API.md). Cada uno sale como
//
//   { "error": { "codigo": "firma_invalida", "mensaje": "…", "detalles": […] } }
//
// con su status HTTP. Lo que no es un ErrorApi es un error nuestro: se loguea
// y sale como 500, sin contar qué pasó.

export class ErrorApi extends Error {
  constructor(status, codigo, mensaje, detalles) {
    super(mensaje);
    this.name = "ErrorApi";
    this.status = status;
    this.codigo = codigo;
    this.detalles = detalles;
  }
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

// Envuelve un Route Handler: lo que tire sale como respuesta de error
export function conErrores(manejador) {
  return async (request, contexto) => {
    try {
      return await manejador(request, contexto);
    } catch (error) {
      if (error instanceof ErrorApi) {
        const { codigo, message: mensaje, detalles } = error;
        return Response.json({ error: { codigo, mensaje, detalles } }, { status: error.status });
      }
      console.error(`${request.method} ${new URL(request.url).pathname}:`, error);
      return Response.json(
        { error: { codigo: "error_interno", mensaje: "Algo falló de nuestro lado." } },
        { status: 500 },
      );
    }
  };
}
