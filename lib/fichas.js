// Ficha técnica de un producto, como filas de rótulo y valor. Es presentación:
// los números vienen de la base (ver getProductoPorSlug) y acá se les pone
// unidad y formato.

const numero = new Intl.NumberFormat("es-AR", { maximumFractionDigits: 2 });
const listaOpciones = new Intl.ListFormat("es", { type: "disjunction" });

const MATERIALES = {
  copoliester: "Copoliéster",
  multifilamento: "Multifilamento",
  nylon: "Nylon",
  tripa: "Tripa natural",
  hibrida: "Híbrida",
};

const mayuscula = (texto) => texto.charAt(0).toUpperCase() + texto.slice(1);

// "300 g o 285 g": los pesos de las variantes, sin repetir, en su orden
function pesos(variantes) {
  const distintos = [...new Set(variantes.map((v) => v.pesoG).filter(Boolean))];
  return listaOpciones.format(distintos.map((peso) => `${peso} g`));
}

function fichaRaqueta(ficha, variantes) {
  const [principales, cruzadas] = ficha.patron;
  const [minima, maxima] = ficha.tensionKg;
  const filas = [
    ["Cabeza", `${ficha.cabezaPulg2} pulg²`],
    ["Peso sin encordar", pesos(variantes)],
    ["Balance", `${ficha.balanceMm} mm`],
    ["Patrón", `${principales} × ${cruzadas}`],
    ["Tensión", `${numero.format(minima)} a ${numero.format(maxima)} kg`],
  ];
  if (ficha.rigidezRa) filas.push(["Rigidez", `${ficha.rigidezRa} RA`]);
  return filas;
}

function fichaCuerda(ficha) {
  return [
    ["Material", MATERIALES[ficha.material] ?? mayuscula(ficha.material)],
    ["Calibre", `${numero.format(ficha.calibreMm)} mm`],
    ["Perfil", mayuscula(ficha.perfil)],
  ];
}

export function getFicha(producto) {
  const { tipo, ficha, variantes } = producto;
  if (!ficha) return [];
  if (tipo === "raqueta") return fichaRaqueta(ficha, variantes);
  if (tipo === "cuerda") return fichaCuerda(ficha);
  // Pelota, grip y bolso: la ficha ya viene como filas
  return ficha;
}
