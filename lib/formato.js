const formatoPesos = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});

export function formatearPrecio(precio) {
  return formatoPesos.format(precio);
}

const listaOpciones = new Intl.ListFormat("es", { type: "disjunction" });

// Dentro de la frase, la palabra capitalizada del principio va en minúscula
// ("Negro" -> "negro", "Tubo x3" -> "tubo x3"); siglas y talles quedan igual
// ("XL", "M (6 raquetas)").
function nombreOpcion(nombre) {
  return nombre.replace(/^\p{Lu}(?=\p{Ll})/u, (letra) => letra.toLowerCase());
}

// Línea chica de la vitrina: la marca y las opciones del producto.
// "Wilson, en negro o rojo"; "Asics, talles 39 a 45"; "Babolat, 5 opciones".
export function describirVariante(producto) {
  const nombres = producto.variantes.map((variante) => variante.nombre);
  if (nombres.length < 2) return producto.marca;

  const talles = nombres.every((nombre) => nombre.startsWith("Talle "));
  if (talles && nombres.length > 2) {
    const desde = nombres[0].slice("Talle ".length);
    const hasta = nombres.at(-1).slice("Talle ".length);
    return `${producto.marca}, talles ${desde} a ${hasta}`;
  }
  // Muchas opciones, u opciones compuestas («Grip 2 / 300 g»), no entran en
  // una línea: se cuentan
  if (nombres.length > 3 || nombres.some((nombre) => nombre.includes(" / "))) {
    return `${producto.marca}, ${nombres.length} opciones`;
  }
  return `${producto.marca}, en ${listaOpciones.format(nombres.map(nombreOpcion))}`;
}
