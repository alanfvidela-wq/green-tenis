const formatoPesos = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});

export function formatearPrecio(precio) {
  return formatoPesos.format(precio);
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
