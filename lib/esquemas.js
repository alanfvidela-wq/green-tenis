import "server-only";
import { z } from "zod";
import { CAMPOS_ENVIO, CODIGO_POSTAL, PROVINCIAS, TELEFONO } from "./envio";
import { MAX_CANTIDAD, MAX_LINEAS, unirLineas } from "./lineas";
import { CATEGORIAS } from "./productos";

// Los esquemas de Zod de lo que entra al servidor: los parámetros de la API
// (/api/v1, que los valida con validar() de lib/api.js) y las entradas de las
// Server Actions. Lo que no pasa no se usa. Este módulo es solo del servidor:
// Zod no llega al navegador. El webhook de Mercado Pago tiene los suyos, con el
// formato de sus avisos. Ver docs/API.md.

// ---------------------------------------------------------------------------
// API
// ---------------------------------------------------------------------------

const SLUGS_CATEGORIAS = CATEGORIAS.map((c) => c.slug);
const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;

// Un entero de la query string («2»), de minimo a maximo
function entero(minimo, maximo) {
  const error = `Tiene que ser un número entero del ${minimo} al ${maximo}.`;
  return z.coerce.number({ error }).int({ error }).min(minimo, { error }).max(maximo, { error });
}

// ?categoria=raquetas&page=2&limit=12. Los parámetros que no son estos se ignoran.
export const ConsultaProductos = z.object({
  categoria: z
    .enum(SLUGS_CATEGORIAS, { error: `Tiene que ser una de estas: ${SLUGS_CATEGORIAS.join(", ")}.` })
    .optional(),
  page: entero(1, 1000).default(1),
  limit: entero(1, 48).default(12),
});

// /productos/[slug] y /combos/[slug]: minúsculas, números y guiones
export const ParametrosSlug = z.object({
  slug: z
    .string()
    .max(120, { error: "Tiene como mucho 120 caracteres." })
    .regex(SLUG, { error: "Va en minúsculas, con números y guiones (babolat-pure-drive)." }),
});

// /pedidos/[id]: el id que le da gen_random_uuid()
export const ParametrosPedido = z.object({
  id: z.uuid({ error: "Tiene que ser un uuid." }),
});

// ---------------------------------------------------------------------------
// Carrito (cotizarCarrito y confirmarPedido)
// ---------------------------------------------------------------------------

const Id = z.int().positive();
const Cantidad = z.int().min(1).max(MAX_CANTIDAD);

// Una línea del carrito, como la describe lib/lineas.js. Las claves de
// `elecciones` son ids de combo_items («1»).
const Linea = z.discriminatedUnion("tipo", [
  z.object({ tipo: z.literal("producto"), varianteId: Id, cantidad: Cantidad }),
  z.object({
    tipo: z.literal("combo"),
    comboId: Id,
    elecciones: z.record(z.string().regex(/^[1-9]\d*$/), Id),
    cantidad: Cantidad,
  }),
]);

// Hasta 30 líneas; las repetidas se unen en una
export const Lineas = z.array(Linea).max(MAX_LINEAS).transform(unirLineas);

// ---------------------------------------------------------------------------
// Envío (confirmarPedido)
// ---------------------------------------------------------------------------

// Un campo del formulario: texto sin espacios de más. Lo que falta (o no es
// texto) da un error con la etiqueta del campo, que confirmarPedido junta en
// «Faltan datos: …».
function campoDeTexto({ etiqueta, maximo = 80, opcional }) {
  const falta = etiqueta.toLowerCase();
  const texto = z.string({ error: falta }).trim();
  return (opcional ? texto : texto.min(1, { error: falta, abort: true })).max(maximo, {
    error: `${etiqueta}: como mucho ${maximo} caracteres.`,
  });
}

const REGLAS_ENVIO = {
  telefono: (campo) => campo.regex(TELEFONO, { error: "El teléfono no parece válido." }),
  provincia: (campo) =>
    campo.refine((valor) => PROVINCIAS.includes(valor), { error: "Elegí una provincia de la lista." }),
  codigoPostal: (campo) =>
    campo
      .toUpperCase()
      .overwrite((valor) => valor.replace(/\s/g, ""))
      .regex(CODIGO_POSTAL, {
        error: "El código postal va con 4 números, o en el formato nuevo (C1425ABC).",
      }),
};

// Los campos de CAMPOS_ENVIO, en su orden. Lo que no llega cuenta como vacío.
export const Envio = z.object(
  Object.fromEntries(
    CAMPOS_ENVIO.map((campo) => {
      const regla = REGLAS_ENVIO[campo.nombre] ?? ((esquema) => esquema);
      return [campo.nombre, regla(campoDeTexto(campo)).prefault("")];
    }),
  ),
);

// ---------------------------------------------------------------------------
// Cuenta (lib/cuenta.js)
// ---------------------------------------------------------------------------

// El largo mínimo lo aplica también Supabase (Authentication)
export const MINIMO_CONTRASENA = 8;

const EMAIL_INVALIDO = "Escribí un email válido.";
const NO_COINCIDEN = "Las contraseñas no coinciden.";
const CORTA = `La contraseña tiene que tener al menos ${MINIMO_CONTRASENA} caracteres.`;

// Sin espacios de más y en minúsculas, con el mismo criterio que el
// type="email" del navegador
const Email = z
  .string({ error: EMAIL_INVALIDO })
  .trim()
  .toLowerCase()
  .pipe(z.email({ pattern: z.regexes.html5Email, error: EMAIL_INVALIDO }));

// La contraseña nueva y su repetición («repetir» en el formulario)
const contrasenas = {
  contrasena: z.string({ error: CORTA }).min(MINIMO_CONTRASENA, { error: CORTA }),
  repetir: z.string({ error: NO_COINCIDEN }),
};
const coinciden = (datos) => datos.contrasena === datos.repetir;

export const Ingreso = z.object({
  email: Email,
  contrasena: z.string().min(1),
});

export const Registro = z
  .object({ email: Email, ...contrasenas })
  .refine(coinciden, { error: NO_COINCIDEN, path: ["repetir"] });

export const ContrasenaNueva = z
  .object(contrasenas)
  .refine(coinciden, { error: NO_COINCIDEN, path: ["repetir"] });

export const Recuperacion = z.object({ email: Email });
