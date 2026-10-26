import { NIVELES } from "./tipos";

// El quiz de estilo de juego (/quiz): las preguntas y la recomendación. Es
// lógica pura, sin base ni React, para poder probarla sola: recibe las
// respuestas y el catálogo (los productos como los arma getCatalogoQuiz, en
// lib/productos.js) y devuelve el kit. Todo sale de reglas de puntaje: cada
// respuesta le suma (o le resta) puntos a ciertos atributos, y los productos
// se ordenan por la suma. Cada regla lleva la frase que la explica: el motivo
// de cada producto son las frases de las dos reglas que más le sumaron.

// ---------------------------------------------------------------------------
// Las preguntas
// ---------------------------------------------------------------------------

// En el orden del quiz. `resumen` es cómo se lee la respuesta en el resultado.
export const PREGUNTAS = [
  {
    id: "nivel",
    pregunta: "¿Cuál es tu nivel?",
    opciones: [
      { valor: "principiante", texto: "Principiante", detalle: "Estoy aprendiendo o juego hace poco.", resumen: "Nivel principiante" },
      { valor: "intermedio", texto: "Intermedio", detalle: "Sostengo peloteos y juego partidos.", resumen: "Nivel intermedio" },
      { valor: "avanzado", texto: "Avanzado", detalle: "Juego torneos o compito seguido.", resumen: "Nivel avanzado" },
    ],
  },
  {
    id: "frecuencia",
    pregunta: "¿Cuántas veces por semana jugás?",
    opciones: [
      { valor: "ocasional", texto: "Una o menos", resumen: "Una vez por semana o menos" },
      { valor: "regular", texto: "Dos o tres", resumen: "Dos o tres veces por semana" },
      { valor: "intensiva", texto: "Cuatro o más", resumen: "Cuatro o más veces por semana" },
    ],
  },
  {
    id: "estilo",
    pregunta: "¿Desde dónde jugás más?",
    opciones: [
      { valor: "fondo", texto: "Desde el fondo", detalle: "Peloteos largos desde la línea de fondo.", resumen: "Desde el fondo" },
      { valor: "red", texto: "Cerca de la red", detalle: "Saque y red, voleas.", resumen: "Cerca de la red" },
      { valor: "all-court", texto: "En toda la cancha", detalle: "Un poco de todo.", resumen: "En toda la cancha" },
    ],
  },
  {
    id: "preferencia",
    pregunta: "¿Qué preferís en tus golpes?",
    opciones: [
      { valor: "potencia", texto: "Potencia", detalle: "Que la pelota salga rápido con menos esfuerzo.", resumen: "Potencia" },
      { valor: "control", texto: "Control", detalle: "Poner la pelota donde quiero.", resumen: "Control" },
    ],
  },
  {
    id: "brazo",
    pregunta: "¿Querés algo cómodo para el brazo?",
    opciones: [
      { valor: "si", texto: "Sí", detalle: "Tengo molestias o prefiero cuidarlo.", resumen: "Cómodo para el brazo" },
      { valor: "no", texto: "No hace falta", resumen: "Sin cuidado especial del brazo" },
    ],
  },
  {
    id: "superficie",
    pregunta: "¿En qué superficie jugás?",
    opciones: [
      { valor: "polvo", texto: "Polvo de ladrillo", resumen: "Polvo de ladrillo" },
      { valor: "dura", texto: "Cancha dura", resumen: "Cancha dura" },
      { valor: "sintetico", texto: "Sintético", resumen: "Sintético" },
      { valor: "varias", texto: "Juego en varias", resumen: "Varias superficies" },
    ],
  },
];

// Las respuestas como se leen en el resultado, en el orden del quiz
export function resumirRespuestas(respuestas) {
  return PREGUNTAS.map(
    (p) => p.opciones.find((o) => o.valor === respuestas[p.id])?.resumen ?? null,
  ).filter(Boolean);
}

// Las respuestas como query string, en el orden del quiz:
// «nivel=intermedio&frecuencia=regular&…»
export function aBusqueda(respuestas) {
  return new URLSearchParams(PREGUNTAS.map((p) => [p.id, respuestas[p.id]])).toString();
}

export function mismasRespuestas(a, b) {
  return PREGUNTAS.every((p) => a?.[p.id] === b?.[p.id]);
}

// ---------------------------------------------------------------------------
// El puntaje
// ---------------------------------------------------------------------------

// Lo que se le resta a un producto sin stock: lo baja en el ranking, pero no
// lo saca. En el resultado sale con «Sin stock».
export const PENALIDAD_SIN_STOCK = 6;

// La tercera raqueta entra si suma al menos esto del puntaje de la primera
export const UMBRAL_TERCERA = 0.75;

const hayStock = (variante) => variante.stock === null || variante.stock > 0;
const disponible = (producto) => producto.variantes.some(hayStock);

// El mínimo y el máximo de un atributo en el catálogo
function rango(valores) {
  const definidos = valores.filter((valor) => valor !== null && valor !== undefined);
  if (definidos.length === 0) return null;
  return { min: Math.min(...definidos), max: Math.max(...definidos) };
}

// De 0 (el mínimo del catálogo) a 1 (el máximo). null si no hay dato o si en
// el catálogo todos valen lo mismo: entonces el atributo no distingue a nadie.
function relativo(valor, { min, max } = {}) {
  if (valor === null || valor === undefined || min === undefined || min === max) return null;
  return (valor - min) / (max - min);
}

// Una regla que se cumple: los puntos que suma y la frase que lo explica
// (null si no hace falta explicarla). Las reglas con 0 puntos no cuentan.
function regla(puntos, texto = null) {
  return { puntos, texto };
}

// El puntaje (la suma) y el motivo (las frases de las dos reglas que más
// suman, sin repetir). Sin ninguna frase, el motivo de respaldo.
function evaluar(reglas, respaldo) {
  const validas = reglas.filter((r) => r.puntos !== 0 && !Number.isNaN(r.puntos));
  const puntaje = validas.reduce((suma, r) => suma + r.puntos, 0);
  const frases = [
    ...new Set(
      validas
        .filter((r) => r.puntos > 0 && r.texto)
        .sort((a, b) => b.puntos - a.puntos)
        .map((r) => r.texto),
    ),
  ];
  return { puntaje, motivo: (frases.length ? frases.slice(0, 2) : [respaldo]).join(" ") };
}

const distanciaDeNivel = (a, b) => Math.abs(NIVELES.indexOf(a) - NIVELES.indexOf(b));

// Los roles de un producto en el kit, en el orden en que se muestran
export const ROLES = ["raqueta", "cuerda", "pelota"];

// ---------------------------------------------------------------------------
// Raquetas
// ---------------------------------------------------------------------------

// Cuánto suma cada perfil de juego según lo que se prefiere en los golpes
const JUEGO_POR_PREFERENCIA = {
  potencia: { potencia: 3, equilibrio: 1.5, confort: 1, control: 0 },
  control: { control: 3, equilibrio: 1.5, confort: 1, potencia: 0 },
};

// Cuánto suma cada perfil de juego según desde dónde se juega
const JUEGO_POR_ESTILO = {
  fondo: { potencia: 1.5, control: 1, equilibrio: 1, confort: 0.5 },
  red: { control: 1, equilibrio: 1, confort: 0.5, potencia: 0 },
  "all-court": { equilibrio: 2, potencia: 0.5, control: 0.5, confort: 0.5 },
};

// La variante que se sugiere, entre las que tienen stock (si no hay, entre
// todas): la más liviana para quien empieza o quiere cuidar el brazo, la más
// pesada para el avanzado y, si no, la primera de la tienda
function varianteDeRaqueta(raqueta, respuestas) {
  const conPeso = raqueta.variantes.filter((v) => v.pesoG);
  const conStock = conPeso.filter(hayStock);
  const opciones = conStock.length ? conStock : conPeso;
  if (opciones.length === 0) return raqueta.variantes[0] ?? null;

  const porPeso = [...opciones].sort((a, b) => a.pesoG - b.pesoG);
  if (respuestas.nivel === "principiante" || respuestas.brazo === "si") return porPeso[0];
  if (respuestas.nivel === "avanzado") return porPeso.at(-1);
  return opciones[0];
}

// Los rangos de las raquetas del catálogo, para puntuar en forma relativa: el
// peso (de todas las variantes), la rigidez, la cabeza y el balance
function rangosDeRaquetas(raquetas) {
  return {
    peso: rango(raquetas.flatMap((r) => r.variantes.map((v) => v.pesoG))),
    rigidez: rango(raquetas.map((r) => r.ficha.rigidezRa)),
    cabeza: rango(raquetas.map((r) => r.ficha.cabezaPulg2)),
    balance: rango(raquetas.map((r) => r.ficha.balanceMm)),
    rigideces: raquetas.map((r) => r.ficha.rigidezRa),
  };
}

function puntuarRaqueta(raqueta, respuestas, rangos) {
  const { ficha } = raqueta;
  const { nivel, frecuencia, estilo, preferencia, brazo } = respuestas;
  const variante = varianteDeRaqueta(raqueta, respuestas);
  const peso = variante?.pesoG ?? null;

  // De 0 a 1 contra el resto del catálogo
  const pesada = relativo(peso, rangos.peso);
  const liviana = pesada === null ? null : 1 - pesada;
  const rigida = relativo(ficha.rigidezRa, rangos.rigidez);
  const flexible = rigida === null ? null : 1 - rigida;
  const cabezaGrande = relativo(ficha.cabezaPulg2, rangos.cabeza);
  const balance = relativo(ficha.balanceMm, rangos.balance);
  const livianaDeCabeza = balance === null ? null : 1 - balance;

  const reglas = [];

  // El nivel: el mismo suma todo; el de al lado, la mitad
  const distancia = distanciaDeNivel(nivel, ficha.nivel);
  if (distancia === 0) reglas.push(regla(4, "Está pensada para tu nivel."));
  else if (distancia === 1) {
    const lado = NIVELES.indexOf(ficha.nivel) > NIVELES.indexOf(nivel) ? "arriba" : "abajo";
    reglas.push(regla(2, `Es de nivel ${ficha.nivel}, uno ${lado} del tuyo.`));
  }

  // Potencia o control
  const textoJuego =
    ficha.perfilJuego === preferencia
      ? `Da ${preferencia === "potencia" ? "la potencia" : "el control"} que buscás.`
      : ficha.perfilJuego === "equilibrio"
        ? "Combina potencia y control."
        : null;
  reglas.push(regla(JUEGO_POR_PREFERENCIA[preferencia][ficha.perfilJuego], textoJuego));

  // Desde dónde se juega: el perfil y, en la red, que sea liviana de cabeza
  const textosEstilo = {
    fondo: {
      potencia: "Suma potencia desde el fondo.",
      control: "Da precisión en los peloteos largos.",
      equilibrio: "Rinde en los peloteos desde el fondo.",
    },
    red: { control: "Es manejable para volear.", equilibrio: "Es manejable para volear." },
    "all-court": { equilibrio: "Es equilibrada, para jugar en toda la cancha." },
  };
  reglas.push(
    regla(JUEGO_POR_ESTILO[estilo][ficha.perfilJuego], textosEstilo[estilo][ficha.perfilJuego]),
  );
  if (estilo === "red" && livianaDeCabeza !== null) {
    reglas.push(
      regla(
        1.5 * livianaDeCabeza,
        livianaDeCabeza >= 0.5 ? "Es liviana de cabeza, rápida para volear." : null,
      ),
    );
  }

  // La cabeza: la más grande perdona más (para quien empieza o juega poco);
  // la más chica da precisión (para quien busca control o compite)
  if (cabezaGrande !== null) {
    const grande = (nivel === "principiante" ? 1.5 : 0) + (frecuencia === "ocasional" ? 0.5 : 0);
    reglas.push(
      regla(
        grande * cabezaGrande,
        cabezaGrande >= 0.5
          ? `Su cabeza de ${ficha.cabezaPulg2} pulg² perdona los golpes descentrados.`
          : null,
      ),
    );
    const chica = (preferencia === "control" ? 1 : 0) + (nivel === "avanzado" ? 0.5 : 0);
    reglas.push(
      regla(
        chica * (1 - cabezaGrande),
        cabezaGrande < 0.5 ? `Su cabeza de ${ficha.cabezaPulg2} pulg² da precisión.` : null,
      ),
    );
  }

  // El peso, contra el resto del catálogo: la más liviana suma más para quien
  // empieza, para quien quiere cuidar el brazo y para quien juega poco; la más
  // pesada, para el avanzado
  if (liviana !== null) {
    const porLiviana =
      (nivel === "principiante" ? 3 : 0) +
      (brazo === "si" ? 2 : 0) +
      (frecuencia === "ocasional" ? 1 : 0);
    reglas.push(
      regla(
        porLiviana * liviana,
        liviana >= 0.5 ? `Con ${peso} g, es de las más livianas del catálogo.` : null,
      ),
    );
    if (nivel === "avanzado") {
      reglas.push(
        regla(2 * pesada, pesada >= 0.5 ? `Con ${peso} g, da estabilidad en los golpes fuertes.` : null),
      );
    }
  }

  // El brazo: el perfil de confort y, contra el resto del catálogo, que sea
  // flexible
  if (brazo === "si") {
    if (ficha.perfilJuego === "confort") reglas.push(regla(3, "Está hecha para cuidar el brazo."));
    if (flexible !== null) {
      const unica = rangos.rigideces.filter((ra) => ra === ficha.rigidezRa).length === 1;
      let texto = null;
      if (flexible === 1 && unica) texto = `Es la más flexible del catálogo (${ficha.rigidezRa} RA).`;
      else if (flexible >= 0.5) texto = `Es de las más flexibles del catálogo (${ficha.rigidezRa} RA).`;
      reglas.push(regla(3 * flexible, texto));
    }
  }

  if (!disponible(raqueta)) reglas.push(regla(-PENALIDAD_SIN_STOCK));

  return {
    ...evaluar(reglas, `Es una raqueta de ${ficha.perfilJuego} para nivel ${ficha.nivel}.`),
    varianteId: variante?.id ?? null,
  };
}

// ---------------------------------------------------------------------------
// Cuerdas
// ---------------------------------------------------------------------------

const RESPALDO_CUERDA = {
  durabilidad: "Es una cuerda que dura.",
  control: "Es una cuerda de control.",
  confort: "Es una cuerda de confort.",
  spin: "Es una cuerda para darle efecto a la pelota.",
};

// El set de 12 m (lo que lleva un encordado) con stock; si no, cualquiera con
// stock y, si no, la primera
function varianteDeCuerda(cuerda) {
  const conStock = cuerda.variantes.filter(hayStock);
  return (
    conStock.find((v) => v.largoM === 12) ??
    conStock[0] ??
    cuerda.variantes.find((v) => v.largoM === 12) ??
    cuerda.variantes[0] ??
    null
  );
}

function puntuarCuerda(cuerda, respuestas) {
  const { ficha } = cuerda;
  const { nivel, frecuencia, estilo, preferencia, brazo } = respuestas;
  const juego = ficha.perfilJuego;
  const poliester = ficha.material === "copoliester";
  const textoEfecto =
    ficha.perfil === "redondo"
      ? "Le da efecto a la pelota."
      : `Su perfil ${ficha.perfil} le da efecto a la pelota.`;

  const reglas = [];

  // El brazo y el nivel: el poliéster es rígido y pide un swing completo
  if (brazo === "si") {
    if (juego === "confort") reglas.push(regla(5, "Es blanda y elástica: cuida el brazo."));
    if (poliester) reglas.push(regla(-2));
  }
  if (nivel === "principiante") {
    reglas.push(poliester ? regla(-1) : regla(2, "Es más fácil de jugar que un poliéster."));
  }
  if (nivel === "avanzado" && juego !== "confort") reglas.push(regla(1));

  // Potencia o control
  if (preferencia === "potencia") {
    if (juego === "confort") reglas.push(regla(2, "Es elástica y suma potencia."));
    if (juego === "spin") reglas.push(regla(1, textoEfecto));
  } else {
    if (juego === "control") reglas.push(regla(3, "Da el control que buscás."));
    if (juego === "spin") reglas.push(regla(1.5, textoEfecto));
  }

  // Cuánto se juega: la que dura, para quien juega seguido
  if (juego === "durabilidad") {
    if (frecuencia === "intensiva") reglas.push(regla(3, "Aguanta bien si jugás seguido."));
    if (frecuencia === "regular") reglas.push(regla(1.5, "Aguanta bien si jugás seguido."));
  }
  if (frecuencia === "ocasional" && juego === "confort") reglas.push(regla(1));

  // Desde dónde se juega
  if (estilo === "fondo" && juego === "spin") {
    reglas.push(regla(2, "Da efecto para jugar desde el fondo."));
  }
  if (estilo === "red") {
    if (juego === "control") reglas.push(regla(1.5, "Da precisión para volear."));
    if (juego === "confort") reglas.push(regla(0.5));
  }
  if (estilo === "all-court" && (juego === "control" || juego === "spin")) reglas.push(regla(1));

  if (!disponible(cuerda)) reglas.push(regla(-PENALIDAD_SIN_STOCK));

  return {
    ...evaluar(reglas, RESPALDO_CUERDA[juego]),
    varianteId: varianteDeCuerda(cuerda)?.id ?? null,
  };
}

// ---------------------------------------------------------------------------
// Pelotas
// ---------------------------------------------------------------------------

// Qué superficie de pelota va con cada respuesta: sintético y varias, la de
// todas
const SUPERFICIE_POR_RESPUESTA = {
  polvo: "polvo",
  dura: "dura",
  sintetico: "todas",
  varias: "todas",
};

const TEXTO_SUPERFICIE = {
  polvo: "Está hecha para polvo de ladrillo.",
  dura: "Está hecha para cancha dura.",
  sintetico: "Sirve en todas las superficies, también en sintético.",
  varias: "Sirve en todas las superficies en las que jugás.",
};

const RESPALDO_PELOTA = {
  todas: "Es una pelota para todas las superficies.",
  dura: "Es una pelota para cancha dura.",
  polvo: "Es una pelota para polvo de ladrillo.",
};

// La presentación según cuánto se juega, entre las que tienen stock y de la
// más barata a la más cara: la primera (el tubo) y, para quien juega cuatro o
// más veces, la que sigue (el pack)
function varianteDePelota(pelota, respuestas) {
  const porPrecio = [...pelota.variantes].sort((a, b) => a.precio - b.precio);
  const conStock = porPrecio.filter(hayStock);
  const opciones = conStock.length ? conStock : porPrecio;
  if (respuestas.frecuencia === "intensiva" && opciones.length > 1) return opciones[1];
  return opciones[0] ?? null;
}

function puntuarPelota(pelota, respuestas) {
  const { superficie, uso } = pelota.ficha;
  const { nivel, frecuencia } = respuestas;
  const buscada = SUPERFICIE_POR_RESPUESTA[respuestas.superficie];

  const reglas = [];

  // La superficie es la que más pesa: la justa suma 6; la de todas, 2
  if (superficie === buscada) reglas.push(regla(6, TEXTO_SUPERFICIE[respuestas.superficie]));
  else if (superficie === "todas") reglas.push(regla(2, "Sirve en todas las superficies."));

  // Entrenamiento para quien empieza o juega poco; competencia para el resto
  if (uso === "entrenamiento") {
    const texto = "Es de entrenamiento: rinde en los peloteos.";
    if (nivel === "principiante") reglas.push(regla(2, texto));
    if (frecuencia === "ocasional") reglas.push(regla(1.5, texto));
  } else {
    const texto = "Es una pelota de competencia.";
    if (nivel === "avanzado") reglas.push(regla(2, texto));
    if (nivel === "intermedio") reglas.push(regla(1, texto));
    if (frecuencia === "intensiva") reglas.push(regla(1.5, texto));
    if (frecuencia === "regular") reglas.push(regla(1, texto));
  }

  if (!disponible(pelota)) reglas.push(regla(-PENALIDAD_SIN_STOCK));

  return {
    ...evaluar(reglas, RESPALDO_PELOTA[superficie]),
    varianteId: varianteDePelota(pelota, respuestas)?.id ?? null,
  };
}

// ---------------------------------------------------------------------------
// El ranking y el kit
// ---------------------------------------------------------------------------

// De más a menos puntaje; con el mismo puntaje, en el orden de la tienda (el
// del catálogo que llega)
function ordenar(productos, puntuar) {
  return productos
    .map((producto, i) => ({ producto, i, ...puntuar(producto) }))
    .sort((a, b) => b.puntaje - a.puntaje || a.i - b.i)
    .map(({ i, ...item }) => ({ ...item, disponible: disponible(item.producto) }));
}

// Cada tipo ordenado de más a menos puntaje. Solo cuentan los que tienen los
// datos que usa el quiz: las raquetas y las cuerdas con su ficha, las pelotas
// con superficie y uso.
//
//   { raquetas: [{ producto, puntaje, motivo, varianteId, disponible }, …],
//     cuerdas: […], pelotas: […] }
export function rankear(respuestas, productos) {
  const raquetas = productos.filter((p) => p.tipo === "raqueta" && p.ficha?.nivel);
  const cuerdas = productos.filter((p) => p.tipo === "cuerda" && p.ficha?.perfilJuego);
  const pelotas = productos.filter((p) => p.tipo === "pelota" && p.ficha?.superficie && p.ficha?.uso);
  const rangos = rangosDeRaquetas(raquetas);

  return {
    raquetas: ordenar(raquetas, (raqueta) => puntuarRaqueta(raqueta, respuestas, rangos)),
    cuerdas: ordenar(cuerdas, (cuerda) => puntuarCuerda(cuerda, respuestas)),
    pelotas: ordenar(pelotas, (pelota) => puntuarPelota(pelota, respuestas)),
  };
}

// El kit: las dos mejores raquetas (y la tercera si suma al menos el 75% de la
// primera), la mejor cuerda y la mejor pelota. Lo que no tiene stock puede
// entrar, más abajo: el resultado lo muestra con «Sin stock».
//
//   { raquetas: [item, item, item?], cuerda: item o null, pelota: item o null }
export function recomendarKit(respuestas, productos) {
  const { raquetas, cuerdas, pelotas } = rankear(respuestas, productos);
  const [primera, segunda, tercera] = raquetas;
  const elegidas = [primera, segunda].filter(Boolean);
  if (tercera && tercera.puntaje >= primera.puntaje * UMBRAL_TERCERA) elegidas.push(tercera);

  return {
    raquetas: elegidas,
    cuerda: cuerdas[0] ?? null,
    pelota: pelotas[0] ?? null,
  };
}
