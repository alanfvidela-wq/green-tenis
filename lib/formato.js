const formatoPesos = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});

export function formatearPrecio(precio) {
  return formatoPesos.format(precio);
}

const listaOpciones = new Intl.ListFormat("es", { type: "disjunction" });

// "1 L - Verde" -> "1 L verde": las opciones van en minúscula dentro de la frase.
function nombreOpcion(nombre) {
  return nombre
    .split(" - ")
    .map((parte) => parte.charAt(0).toLowerCase() + parte.slice(1))
    .join(" ");
}

// Línea chica de la vitrina: la marca y las opciones del producto.
// "Stanley, en verde, negro o crema"; "Artesanal" si hay una sola opción "Única".
export function describirVariante(producto) {
  const opciones = producto.variantes
    .map((variante) => variante.nombre)
    .filter((nombre) => nombre !== "Única")
    .map(nombreOpcion);
  if (opciones.length === 0) return producto.marca;
  return `${producto.marca}, en ${listaOpciones.format(opciones)}`;
}
