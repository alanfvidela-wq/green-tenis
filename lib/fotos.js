// Los lugares de las fotos del sitio (ver «Fotos» en DESIGN.md y la lista
// para conseguirlas en docs/FOTOS.md). Mitad gente jugando y mitad objetos.
// Es contenido de presentación.
//
// - archivo: el nombre que tiene que tener la foto en public/fotos/fuente/
//   (con cualquier extensión de imagen); `npm run fotos` genera las versiones
//   optimizadas en public/fotos/ y las anota en lib/fotosGeneradas.json.
// - tipo: «gente» u «objeto».
// - uso: «celda» (una celda de la vitrina, del mismo tamaño que las de
//   producto: gente jugando) o «bloque» (un bloque grande entre dos secciones:
//   objetos).
// - proporcion: ancho y alto. La foto se recorta a esta proporción exacta, y el
//   placeholder la tiene también.
// - pagina: dónde va («home» o el slug de la categoría).
// - descripcion: qué foto buscar. La muestra el placeholder.

// Los anchos que genera `npm run fotos`, de cada formato
export const ANCHOS_FOTOS = [480, 800, 1200, 1600];

// El lado largo mínimo de la foto fuente
export const LADO_MINIMO_FOTOS = 1600;

export const LUGARES_FOTOS = [
  // ---------- Celdas de la vitrina: gente jugando ----------
  {
    archivo: "partido-polvo-01",
    tipo: "gente",
    uso: "celda",
    proporcion: [4, 5],
    pagina: "home",
    descripcion:
      "Un jugador o una jugadora en plena derecha sobre polvo de ladrillo, de cuerpo entero, con la cancha de fondo y algo de polvo levantado. Luz de día.",
  },
  {
    archivo: "saque-cancha-01",
    tipo: "gente",
    uso: "celda",
    proporcion: [4, 5],
    pagina: "raquetas",
    descripcion:
      "Un saque en cancha rápida en el momento del impacto, tomado desde abajo o de costado, con el cielo o el techo de fondo.",
  },
  {
    archivo: "volea-cesped-01",
    tipo: "gente",
    uso: "celda",
    proporcion: [4, 5],
    pagina: "pelotas",
    descripcion:
      "Una volea cerca de la red en una cancha de césped, de cuerpo entero, con el pasto gastado en el fondo y las líneas blancas.",
  },
  {
    archivo: "grip-banco-01",
    tipo: "gente",
    uso: "celda",
    proporcion: [4, 5],
    pagina: "cuerdas-y-grips",
    descripcion:
      "Un jugador sentado en el banco entre dos puntos, poniéndole un overgrip nuevo a la raqueta, de medio cuerpo.",
  },
  {
    archivo: "bolso-polvo-01",
    tipo: "gente",
    uso: "celda",
    proporcion: [4, 5],
    pagina: "bolsos",
    descripcion:
      "Un jugador que llega a una cancha de polvo de ladrillo con el bolso raquetero al hombro, de cuerpo entero.",
  },

  // ---------- Bloques grandes entre secciones: objetos ----------
  {
    archivo: "pelota-polvo-01",
    tipo: "objeto",
    uso: "bloque",
    proporcion: [16, 9],
    pagina: "home",
    descripcion:
      "Una pelota apoyada sobre la línea blanca de una cancha de polvo de ladrillo, a ras del piso, con la marca del pique y mucho aire alrededor.",
  },
  {
    archivo: "raqueta-cancha-01",
    tipo: "objeto",
    uso: "bloque",
    proporcion: [16, 9],
    pagina: "home",
    descripcion:
      "Una raqueta apoyada en una cancha rápida junto a un tubo de pelotas abierto, vista desde arriba, con la sombra natural y las líneas de la cancha.",
  },
  {
    archivo: "raquetas-red-01",
    tipo: "objeto",
    uso: "bloque",
    proporcion: [16, 9],
    pagina: "raquetas",
    descripcion:
      "Varias raquetas apoyadas contra la red, de costado, con la luz de la tarde y la cancha fuera de foco.",
  },
  {
    archivo: "pelota-linea-01",
    tipo: "objeto",
    uso: "bloque",
    proporcion: [16, 9],
    pagina: "pelotas",
    descripcion:
      "Una pelota nueva sobre la línea blanca de una cancha de césped, muy de cerca, con el pasto cortado al ras.",
  },
  {
    archivo: "bolso-banco-01",
    tipo: "objeto",
    uso: "bloque",
    proporcion: [16, 9],
    pagina: "bolsos",
    descripcion:
      "Un bolso raquetero en el banco al costado de la cancha, con una raqueta asomando y la cancha de fondo.",
  },
];

// La orientación, a partir de la proporción
export function orientacion([ancho, alto]) {
  if (ancho === alto) return "cuadrada";
  return ancho > alto ? "horizontal" : "vertical";
}

// El número de cada lugar (01, 02…), en el orden de la lista
export function numeroDeLugar(archivo) {
  const indice = LUGARES_FOTOS.findIndex((lugar) => lugar.archivo === archivo);
  return String(indice + 1).padStart(2, "0");
}

// Los lugares de una página, de un uso («celda» o «bloque»)
export function lugaresDe(pagina, uso) {
  return LUGARES_FOTOS.filter((lugar) => lugar.pagina === pagina && lugar.uso === uso);
}
