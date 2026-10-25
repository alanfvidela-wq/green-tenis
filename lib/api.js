import { unstable_rethrow } from "next/navigation";
import { crearClienteConSesion, getUsuario, usuarioEsAdmin } from "./sesion";

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

// 403: hay sesión, pero el endpoint es de la administración
export function sinPermiso() {
  return new ErrorApi(403, "sin_permiso", "Esto lo puede hacer solo el admin.");
}

// Para los endpoints de la administración: sin sesión, 401; sin el rol de
// admin, 403. Devuelve el cliente con la sesión del usuario (nunca la clave
// secreta): lo que escriba lo vuelve a filtrar RLS, la última barrera.
export async function exigirAdminApi() {
  const usuario = await getUsuario();
  if (!usuario) throw sinSesion();
  if (!usuarioEsAdmin(usuario)) throw sinPermiso();
  return crearClienteConSesion();
}

// Los mensajes de las restricciones únicas, por nombre (ver 0001_esquema.sql)
const REPETIDOS = {
  productos_slug_key: { campo: "slug", mensaje: "Ya hay un producto con ese slug." },
  variantes_sku_key: { campo: "variantes", mensaje: "Ya hay una variante con ese SKU." },
  variantes_producto_id_nombre_key: {
    campo: "variantes",
    mensaje: "Dos variantes del producto no pueden llamarse igual.",
  },
};

// Un error de la base (PostgREST) como error de la API. Lo que no se reconoce
// sigue como error nuestro (500).
export function errorDeBase(error) {
  const { code, message = "" } = error;
  if (code === "23505") {
    const repetido = Object.entries(REPETIDOS).find(([nombre]) => message.includes(nombre))?.[1];
    return new ErrorApi(409, "ya_existe", repetido?.mensaje ?? "Ya existe.", repetido && [repetido]);
  }
  if (code === "23503") {
    return new ErrorApi(
      409,
      "en_uso",
      "Tiene pedidos o está en un combo, y la base no deja borrarlo: desactivalo en vez de borrarlo.",
    );
  }
  if (code === "P0002") return new ErrorApi(404, "no_encontrado", message);
  if (code === "23514" || code === "23502" || code === "22P02") {
    return new ErrorApi(400, "datos_invalidos", "La base rechazó un dato: " + message);
  }
  // El rol se verificó contra Supabase Auth, pero la base mira el token: si el
  // rol se asignó con la sesión ya abierta, el token todavía no lo trae. O
  // falta correr 0004_admin.sql (sin GRANT, tampoco deja).
  if (code === "42501") {
    return new ErrorApi(
      403,
      "sin_permiso",
      "La base no te deja escribir: cerrá sesión y volvé a entrar (el rol viaja en el token) y revisá que se haya corrido 0004_admin.sql.",
    );
  }
  if (code === "PGRST202") {
    return new ErrorApi(500, "falta_migracion", "Falta correr supabase/migrations/0004_admin.sql.");
  }
  return new Error(`Error de la base (${code}): ${message}`);
}

// El cuerpo de un POST o un PATCH, que tiene que ser JSON
export async function leerJson(request) {
  try {
    return await request.json();
  } catch {
    throw new ErrorApi(400, "json_invalido", "El cuerpo tiene que ser JSON.");
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
    resultado.error.issues.flatMap((problema) =>
      // Un campo que el esquema no conoce (los .strict()): uno por campo
      problema.code === "unrecognized_keys"
        ? problema.keys.map((clave) => ({
            campo: [...problema.path, clave].join("."),
            mensaje: "Ese campo no existe o no se puede cambiar.",
          }))
        : [{ campo: problema.path.join("."), mensaje: problema.message }],
    ),
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
