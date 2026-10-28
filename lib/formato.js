const formatoPesos = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});

export function formatearPrecio(precio) {
  return formatoPesos.format(precio);
}

// Una tensión de encordado: «24 kg», «24,5 kg»
const formatoKg = new Intl.NumberFormat("es-AR", { maximumFractionDigits: 1 });

export function formatearKg(kg) {
  return `${formatoKg.format(kg)} kg`;
}

// Fecha y hora de Argentina, aunque el servidor corra en otra zona:
// «19 de octubre de 2026, 14:32»
const formatoFecha = new Intl.DateTimeFormat("es-AR", {
  dateStyle: "long",
  timeStyle: "short",
  timeZone: "America/Argentina/Buenos_Aires",
});

export function formatearFecha(fecha) {
  return formatoFecha.format(new Date(fecha));
}

// Solo el día, corto, para las tablas de la administración: «19/10/2026»
const formatoDia = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "America/Argentina/Buenos_Aires",
});

export function formatearDia(fecha) {
  return formatoDia.format(new Date(fecha));
}

// Solo la hora, también de Argentina y de 0 a 23: «14:32»
const formatoHora = new Intl.DateTimeFormat("es-AR", {
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
  timeZone: "America/Argentina/Buenos_Aires",
});

export function formatearHora(fecha) {
  return formatoHora.format(new Date(fecha));
}

// Una cantidad con su palabra en singular o plural: "1 producto", "5 productos"
export function contar(cantidad, singular, plural) {
  return `${cantidad} ${cantidad === 1 ? singular : plural}`;
}

const listaOpciones = new Intl.ListFormat("es", { type: "disjunction" });

// Dentro de la frase, la palabra capitalizada del principio va en minúscula
// ("Negro" -> "negro", "Tubo x3" -> "tubo x3"); siglas y letras sueltas
// quedan igual ("M (6 raquetas)").
function nombreOpcion(nombre) {
  return nombre.replace(/^\p{Lu}(?=\p{Ll})/u, (letra) => letra.toLowerCase());
}

// Línea chica de la vitrina: la marca y las opciones del producto.
// "Wilson, en negro o rojo"; "Babolat, 5 opciones".
export function describirVariante(producto) {
  const nombres = producto.variantes.map((variante) => variante.nombre);
  if (nombres.length < 2) return producto.marca;

  // Muchas opciones, u opciones compuestas («Grip 2 / 300 g»), no entran en
  // una línea: se cuentan
  if (nombres.length > 3 || nombres.some((nombre) => nombre.includes(" / "))) {
    return `${producto.marca}, ${contar(nombres.length, "opción", "opciones")}`;
  }
  return `${producto.marca}, en ${listaOpciones.format(nombres.map(nombreOpcion))}`;
}
