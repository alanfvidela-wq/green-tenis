// Los medidores de la página de producto: Potencia, Control y Confort, de 1 a
// 10, para raquetas y cuerdas. Son una guía para comparar los productos de la
// tienda entre sí, no una medición: salen de la ficha (ver getProductoPorSlug)
// con la regla de abajo, que se puede ajustar acá sin tocar la página. Los
// demás productos no llevan medidores (null).
//
// Raquetas: cuatro datos de la ficha, cada uno llevado a una escala de 0 a 1
// entre los valores que se ven en el mercado (lo que se pasa de los extremos
// queda en 0 o en 1):
//
//   cabeza   95 a 110 pulg²  más cabeza: más potencia y confort, menos control
//   rigidez  55 a 72 RA      más rígida: más potencia, menos control y confort
//   peso     260 a 320 g     más peso: más control y confort, menos potencia
//
// El peso es el promedio de los pesos de sus variantes (la Pure Drive viene
// de 300 g y de 285 g). Cada medidor pondera esos tres datos:
//
//   potencia = 0,40·cabeza + 0,40·rigidez + 0,20·(1 − peso)
//   control  = 0,40·(1 − cabeza) + 0,35·peso + 0,25·(1 − rigidez)
//   confort  = 0,50·(1 − rigidez) + 0,30·peso + 0,20·cabeza
//
// El perfil de juego que carga la tienda suma 0,25 al medidor que nombra
// (potencia, control o confort); «equilibrio» no suma nada. Al final, cada
// uno se lleva de 0–1 a 1–10 y se redondea.
//
// Cuerdas: según su perfil de juego, con una tabla fija (ver PERFILES_CUERDA).

// Las escalas de cada dato de la raqueta: [mínimo, máximo]
const ESCALAS_RAQUETA = {
  cabeza: [95, 110],
  rigidez: [55, 72],
  peso: [260, 320],
};

// Lo que suma el perfil de juego al medidor que nombra
const SUMA_PERFIL = 0.25;

// Cuerdas: el valor de cada medidor según el perfil de juego
export const PERFILES_CUERDA = {
  control: { potencia: 4, control: 9, confort: 4 },
  spin: { potencia: 6, control: 8, confort: 4 },
  durabilidad: { potencia: 4, control: 7, confort: 3 },
  confort: { potencia: 8, control: 5, confort: 9 },
};

export const MEDIDORES = [
  { clave: "potencia", rotulo: "Potencia" },
  { clave: "control", rotulo: "Control" },
  { clave: "confort", rotulo: "Confort" },
];

const entre0y1 = (valor) => Math.min(1, Math.max(0, valor));

// Un dato en la escala de 0 a 1
function escalar(valor, [minimo, maximo]) {
  return entre0y1((valor - minimo) / (maximo - minimo));
}

// De 0–1 a 1–10, redondeado
const aDiez = (valor) => Math.round(1 + 9 * entre0y1(valor));

// Los tres valores de una raqueta, de 1 a 10. null si a la ficha le falta
// algún dato (la rigidez es opcional en la base) o no hay pesos.
export function medidoresRaqueta({ cabezaPulg2, rigidezRa, perfilJuego }, pesos) {
  if (!cabezaPulg2 || !rigidezRa || pesos.length === 0) return null;
  const pesoPromedio = pesos.reduce((suma, peso) => suma + peso, 0) / pesos.length;
  const cabeza = escalar(cabezaPulg2, ESCALAS_RAQUETA.cabeza);
  const rigidez = escalar(rigidezRa, ESCALAS_RAQUETA.rigidez);
  const peso = escalar(pesoPromedio, ESCALAS_RAQUETA.peso);

  const valores = {
    potencia: 0.4 * cabeza + 0.4 * rigidez + 0.2 * (1 - peso),
    control: 0.4 * (1 - cabeza) + 0.35 * peso + 0.25 * (1 - rigidez),
    confort: 0.5 * (1 - rigidez) + 0.3 * peso + 0.2 * cabeza,
  };
  if (perfilJuego in valores) valores[perfilJuego] += SUMA_PERFIL;

  return Object.fromEntries(Object.entries(valores).map(([clave, valor]) => [clave, aDiez(valor)]));
}

// Los medidores de un producto, en el orden de MEDIDORES: [{ clave, rotulo,
// valor }], con valor de 1 a 10. null si el producto no lleva.
export function medidoresDe(producto) {
  const { tipo, ficha, variantes } = producto;
  if (!ficha) return null;

  let valores = null;
  if (tipo === "raqueta") {
    const pesos = [...new Set(variantes.map((v) => v.pesoG).filter(Boolean))];
    valores = medidoresRaqueta(ficha, pesos);
  } else if (tipo === "cuerda") {
    valores = PERFILES_CUERDA[ficha.perfilJuego] ?? null;
  }
  if (!valores) return null;

  return MEDIDORES.map(({ clave, rotulo }) => ({ clave, rotulo, valor: valores[clave] }));
}
