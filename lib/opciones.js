// Las opciones de un producto como grillas de botones, una por dimensión: en
// las raquetas, el grip y el peso por separado (salen de variantes_raqueta);
// en lo demás, una sola, con el nombre de cada variante. Es lógica pura: la
// usa PanelCompra para saber qué variante quedó elegida y qué botones van
// tachados.

// El grip en pulgadas, como lo marcan las raquetas: 1 es 4 1/8″
const PULGADAS_GRIP = {
  0: "4″",
  1: "4 1/8″",
  2: "4 1/4″",
  3: "4 3/8″",
  4: "4 1/2″",
  5: "4 5/8″",
};

// stock null: no se controla (servicios)
export const hayStock = (variante, cantidad = 1) => variante.stock === null || variante.stock >= cantidad;

// Las dimensiones de un producto y, de cada variante, su valor en cada una:
// { dimensiones: [{ clave, rotulo, valores: [{ valor, etiqueta, detalle }] }],
//   valoresDe: (variante) => ({ grip: 2, peso: 300 }) }
export function dimensionesDe(producto) {
  const { tipo, variantes } = producto;
  const porGripYPeso = tipo === "raqueta" && variantes.every((v) => v.grip != null && v.pesoG != null);

  if (porGripYPeso) {
    const grips = [...new Set(variantes.map((v) => v.grip))].sort((a, b) => a - b);
    const pesos = [...new Set(variantes.map((v) => v.pesoG))].sort((a, b) => b - a);
    return {
      dimensiones: [
        {
          clave: "grip",
          rotulo: "Grip",
          valores: grips.map((grip) => ({ valor: grip, etiqueta: String(grip), detalle: PULGADAS_GRIP[grip] })),
        },
        {
          clave: "peso",
          rotulo: "Peso",
          valores: pesos.map((peso) => ({ valor: peso, etiqueta: `${peso} g` })),
        },
      ],
      valoresDe: (v) => ({ grip: v.grip, peso: v.pesoG }),
    };
  }

  return {
    dimensiones: [
      {
        clave: "variante",
        rotulo: variantes.length > 1 ? "Opción" : "Presentación",
        valores: variantes.map((v) => ({ valor: v.id, etiqueta: v.nombre })),
      },
    ],
    valoresDe: (v) => ({ variante: v.id }),
  };
}

// La elección de entrada: en las raquetas no hay nada elegido (salvo una
// dimensión con un solo valor, como el peso de una raqueta que viene en uno);
// en lo demás, la primera variante con stock
export function eleccionInicial(producto, { dimensiones, valoresDe }) {
  if (producto.tipo === "raqueta") {
    const conStock = producto.variantes.some((v) => hayStock(v));
    return Object.fromEntries(
      dimensiones.map((d) => [d.clave, conStock && d.valores.length === 1 ? d.valores[0].valor : null]),
    );
  }
  const primera = producto.variantes.find((v) => hayStock(v));
  return primera ? valoresDe(primera) : Object.fromEntries(dimensiones.map((d) => [d.clave, null]));
}

// La variante que corresponde a una elección completa, o null
export function varianteElegida(variantes, valoresDe, eleccion) {
  if (Object.values(eleccion).some((valor) => valor === null)) return null;
  return (
    variantes.find((v) => {
      const valores = valoresDe(v);
      return Object.entries(eleccion).every(([clave, valor]) => valores[clave] === valor);
    }) ?? null
  );
}

// Si un valor se puede elegir: alguna variante con ese valor tiene stock y
// coincide con lo ya elegido en las otras dimensiones. Si no, el botón va
// tachado y deshabilitado.
export function sePuedeElegir(variantes, valoresDe, eleccion, clave, valor) {
  return variantes.some((v) => {
    if (!hayStock(v)) return false;
    const valores = valoresDe(v);
    if (valores[clave] !== valor) return false;
    return Object.entries(eleccion).every(([otra, elegido]) => otra === clave || elegido === null || valores[otra] === elegido);
  });
}

// Lo que falta elegir, para la nota: «grip y peso», «grip»
const lista = new Intl.ListFormat("es", { type: "conjunction" });

export function faltaElegir(dimensiones, eleccion) {
  const faltan = dimensiones.filter((d) => eleccion[d.clave] === null).map((d) => d.rotulo.toLowerCase());
  return faltan.length > 0 ? lista.format(faltan) : null;
}

// La tensión del encordado, de a medio kilo dentro del rango de la raqueta,
// y la del medio (redondeada a medio kilo) para empezar
export function tensionesDe([minima, maxima]) {
  const tensiones = [];
  for (let kg = Math.ceil(minima * 2) / 2; kg <= maxima; kg += 0.5) tensiones.push(kg);
  return tensiones;
}

export function tensionDelMedio([minima, maxima]) {
  return Math.round(((minima + maxima) / 2) * 2) / 2;
}
