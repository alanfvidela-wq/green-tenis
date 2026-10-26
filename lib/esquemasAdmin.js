import "server-only";
import { z } from "zod";
import {
  JUEGOS_CUERDA,
  JUEGOS_RAQUETA,
  MATERIALES_CUERDA,
  NIVELES,
  PERFILES_CUERDA,
  SIGUIENTE_ESTADO,
  SUPERFICIES_PELOTA,
  TIPOS_POR_CATEGORIA,
  USOS_PELOTA,
} from "./tipos";

// Los esquemas de Zod de la administración: los cuerpos de POST y PATCH de
// /api/v1/productos y PATCH /api/v1/pedidos/[id], y la query de los listados
// del admin. Como los de lib/esquemas.js, son solo del servidor y lo que no
// pasa no se usa. Los límites son los de la base (los check de
// supabase/migrations/0001_esquema.sql): así el error sale acá, campo por
// campo, y no como un error de la base.

const CATEGORIAS = Object.keys(TIPOS_POR_CATEGORIA);
const TIPOS = [...new Set(Object.values(TIPOS_POR_CATEGORIA).flat())];
const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const SKU = /^[A-Z0-9]+(-[A-Z0-9]+)*$/;

const VACIO = "No puede quedar vacío.";

function texto(maximo) {
  return z
    .string({ error: VACIO })
    .trim()
    .min(1, { error: VACIO })
    .max(maximo, { error: `Tiene como mucho ${maximo} caracteres.` });
}

// Un entero del JSON (no de la query: ahí van como texto), de minimo a maximo
function entero(minimo, maximo, unidad = "") {
  const error = `Tiene que ser un número entero del ${minimo} al ${maximo}${unidad}.`;
  return z.int({ error }).min(minimo, { error }).max(maximo, { error });
}

function decimal(minimo, maximo, paso) {
  const error = `Tiene que ser un número del ${minimo} al ${maximo}.`;
  return z.number({ error }).min(minimo, { error }).max(maximo, { error }).multipleOf(paso, {
    error: `Va con ${paso === 0.1 ? "un decimal" : "dos decimales"} como mucho.`,
  });
}

const Id = z.int({ error: "Tiene que ser un id." }).positive({ error: "Tiene que ser un id." });

// ---------------------------------------------------------------------------
// Fichas
// ---------------------------------------------------------------------------

// Uno de los valores de una lista (los check de la base)
function unoDe(valores) {
  return z.enum(valores, { error: `Uno de estos: ${valores.join(", ")}.` });
}

// Filas de rótulo y valor ([["Tipo", "Presurizada"], …])
const Filas = z
  .array(z.tuple([texto(40), texto(80)]), { error: "Van filas de rótulo y valor." })
  .max(12, { error: "Van como mucho 12 filas." });

// Grip y bolso: solo las filas
const FichaLibre = Filas.nullable();

// Pelota: superficie y uso (los usa el quiz) y las filas
const FichaPelota = z
  .object({
    superficie: unoDe(SUPERFICIES_PELOTA),
    uso: unoDe(USOS_PELOTA),
    filas: Filas.default([]),
  })
  .nullable();

const FichaRaqueta = z
  .object({
    cabezaPulg2: entero(85, 135, " pulg²"),
    largoMm: entero(660, 740, " mm").default(685),
    balanceMm: entero(290, 360, " mm"),
    patron: z.tuple([entero(14, 20), entero(15, 22)]),
    rigidezRa: entero(45, 80, " RA").nullable().default(null),
    tensionKg: z
      .tuple([decimal(15, 35, 0.1), decimal(15, 35, 0.1)])
      .refine(([minima, maxima]) => minima < maxima, {
        error: "La tensión mínima va antes que la máxima.",
      }),
    nivel: unoDe(NIVELES),
    perfilJuego: unoDe(JUEGOS_RAQUETA),
  })
  .nullable();

const FichaCuerda = z
  .object({
    material: unoDe(MATERIALES_CUERDA),
    calibreMm: decimal(1.05, 1.45, 0.01),
    perfil: unoDe(PERFILES_CUERDA),
    perfilJuego: unoDe(JUEGOS_CUERDA),
  })
  .nullable();

function esquemaDeFicha(tipo) {
  if (tipo === "raqueta") return FichaRaqueta;
  if (tipo === "cuerda") return FichaCuerda;
  if (tipo === "pelota") return FichaPelota;
  return FichaLibre;
}

// ---------------------------------------------------------------------------
// Productos
// ---------------------------------------------------------------------------

// Una variante. Sin id, es nueva. stock null: no se controla. Grip y peso solo
// en las raquetas; el largo, solo en las cuerdas (ver la validación de abajo).
const VarianteAdmin = z.object({
  id: Id.nullable().default(null),
  sku: z
    .string({ error: VACIO })
    .trim()
    .toUpperCase()
    .max(60, { error: "Tiene como mucho 60 caracteres." })
    .regex(SKU, { error: "En mayúsculas, con números y guiones (BABOLAT-PURE-DRIVE-G2-300)." }),
  nombre: texto(60),
  precio: entero(1, 100_000_000, " (pesos, sin centavos)"),
  stock: entero(0, 100_000).nullable(),
  activa: z.boolean().default(true),
  grip: entero(0, 5).optional(),
  pesoG: entero(220, 360, " g").optional(),
  largoM: entero(1, 1000, " m").optional(),
});

const CamposProducto = z.object({
  categoria: z.enum(CATEGORIAS, { error: `Una de estas: ${CATEGORIAS.join(", ")}.` }),
  tipo: z.enum(TIPOS, { error: `Uno de estos: ${TIPOS.join(", ")}.` }),
  marca: texto(40),
  nombre: texto(80),
  slug: z
    .string({ error: VACIO })
    .trim()
    .max(120, { error: "Tiene como mucho 120 caracteres." })
    .regex(SLUG, { error: "Va en minúsculas, con números y guiones (babolat-pure-drive)." }),
  descripcion: texto(600),
  destacado: z.boolean().default(false),
  activo: z.boolean().default(true),
  ficha: z.unknown().default(null),
  variantes: z
    .array(VarianteAdmin)
    .min(1, { error: "Tiene que tener al menos una variante." })
    .max(30, { error: "Van como mucho 30 variantes." }),
});

// Lo que depende de más de un campo: el tipo tiene que ir en la categoría, la
// ficha tiene la forma de su tipo, cada variante trae lo de su tipo y no se
// repiten skus ni nombres. Termina con la ficha ya validada.
export const ProductoAdmin = CamposProducto.transform((producto, ctx) => {
  const problema = (path, message) => ctx.issues.push({ code: "custom", path, message, input: producto });
  const { categoria, tipo, variantes } = producto;

  if (!TIPOS_POR_CATEGORIA[categoria].includes(tipo)) {
    problema(["tipo"], `En esta categoría va: ${TIPOS_POR_CATEGORIA[categoria].join(" o ")}.`);
  }

  const ficha = esquemaDeFicha(tipo).safeParse(producto.ficha);
  if (!ficha.success) {
    for (const issue of ficha.error.issues) problema(["ficha", ...issue.path], issue.message);
  }

  const vistos = { sku: new Set(), nombre: new Set() };
  variantes.forEach((variante, i) => {
    if (tipo === "raqueta") {
      if (variante.grip === undefined) problema(["variantes", i, "grip"], "Falta el grip.");
      if (variante.pesoG === undefined) problema(["variantes", i, "pesoG"], "Falta el peso.");
    }
    if (tipo === "cuerda" && variante.largoM === undefined) {
      problema(["variantes", i, "largoM"], "Falta el largo.");
    }
    for (const campo of ["sku", "nombre"]) {
      if (vistos[campo].has(variante[campo])) problema(["variantes", i, campo], "Está repetido.");
      vistos[campo].add(variante[campo]);
    }
  });

  // Una ficha de filas sin ninguna fila es lo mismo que no tener ficha
  let datosFicha = ficha.success ? ficha.data : null;
  if (Array.isArray(datosFicha) && datosFicha.length === 0) datosFicha = null;
  return { ...producto, ficha: datosFicha };
});

// PATCH: los campos que llegan reemplazan a los guardados; `variantes`, si
// llega, es la lista completa. El tipo no cambia (la ficha tipada está atada a
// él): el handler lo toma del producto guardado.
export const CambiosProducto = CamposProducto.omit({ tipo: true })
  .partial()
  .extend({
    // Los defaults de los campos no aplican a un PATCH: lo que no llega queda
    destacado: z.boolean().optional(),
    activo: z.boolean().optional(),
    ficha: z.unknown().optional(),
  })
  .strict();

// /productos/[producto]: el slug (en la tienda) o el id (en la administración)
const SLUG_O_ID = "Va el slug (babolat-pure-drive) o el id del producto.";
export const ParametroProducto = z.object({
  producto: z.union([
    z.string().regex(/^[1-9]\d{0,17}$/, { error: SLUG_O_ID }).transform(Number),
    z.string().max(120, { error: SLUG_O_ID }).regex(SLUG, { error: SLUG_O_ID }),
  ]),
});

// El listado del admin: ?todos=1&q=pure&categoria=raquetas&page=1
export const ConsultaProductosAdmin = z.object({
  q: z
    .string()
    .trim()
    .max(60, { error: "Tiene como mucho 60 caracteres." })
    .regex(/^[\p{L}\p{N} .'-]*$/u, { error: "Solo letras, números, espacios y guiones." })
    .default(""),
  categoria: z.enum(CATEGORIAS, { error: `Una de estas: ${CATEGORIAS.join(", ")}.` }).optional(),
  page: z.coerce.number().int().min(1).max(1000).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

// ---------------------------------------------------------------------------
// Pedidos
// ---------------------------------------------------------------------------

const ESTADOS_DESTINO = Object.values(SIGUIENTE_ESTADO);

// PATCH /pedidos/[id]: a qué estado pasa
export const CambioDeEstado = z
  .object({
    estado: z.enum(ESTADOS_DESTINO, { error: `Uno de estos: ${ESTADOS_DESTINO.join(", ")}.` }),
  })
  .strict();

// El listado del admin: ?todos=1&estado=pagado&page=1
export const ConsultaPedidosAdmin = z.object({
  estado: z
    .enum(["pendiente_pago", "pagado", "preparando", "enviado", "entregado", "cancelado"], {
      error: "No es un estado de pedido.",
    })
    .optional(),
  page: z.coerce.number().int().min(1).max(1000).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});
