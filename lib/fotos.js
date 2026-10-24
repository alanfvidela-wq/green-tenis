// Los lugares de las fotos al scrollear de la home (ver «Fotos al scrollear»
// en DESIGN.md y la lista para conseguirlas en docs/FOTOS.md). Mitad gente
// jugando y mitad objetos. Es contenido de presentación.
//
// - archivo: el nombre que tiene que tener la foto en public/fotos/fuente/
//   (con cualquier extensión de imagen); `npm run fotos` genera las versiones
//   optimizadas en public/fotos/ y las anota en lib/fotosGeneradas.json.
// - tipo: «gente» u «objeto».
// - proporcion: ancho y alto. La foto se recorta a esta proporción exacta, y el
//   placeholder la tiene también.
// - superficie: el color del placeholder mientras no hay foto. Cada banda va
//   sobre la superficie de la sección de arriba y sus placeholders llevan la de
//   la sección de abajo (banda 1: cancha sobre polvo; banda 2: césped sobre
//   cancha; banda 3: polvo sobre césped), así se distinguen del fondo y nunca
//   hay más de dos superficies a la vista.
// - descripcion: qué foto buscar. La muestra el placeholder.
// - etiqueta: el sticker de la foto. Describe lo que se ve, sin slogans.
// - giro: la rotación en reposo, en grados (entre −4 y 4: con la entrada
//   llega como mucho a ±6).
// - velocidad: el parallax, en fracción del alto de la pantalla. Distinta en
//   cada foto.
// - banda: en qué banda de la home va (1: entre «Lo que más sale» y la
//   anatomía; 2: entre la anatomía y las categorías; 3: antes del footer).
// - lado: dónde cae en la banda («izquierda», «derecha» o «centro»).
// - mobile: si se ve en pantallas angostas (una por banda).

// Los anchos que genera `npm run fotos`, de cada formato
export const ANCHOS_FOTOS = [480, 800, 1200, 1600];

// El lado largo mínimo de la foto fuente
export const LADO_MINIMO_FOTOS = 1600;

export const LUGARES_FOTOS = [
  {
    archivo: "partido-polvo-01",
    tipo: "gente",
    proporcion: [4, 5],
    superficie: "cancha",
    descripcion:
      "Un jugador o una jugadora en plena derecha sobre polvo de ladrillo, de cuerpo entero, con la cancha de fondo y algo de polvo levantado. Luz de día.",
    etiqueta: "Polvo de ladrillo",
    giro: 3,
    velocidad: 0.12,
    banda: 1,
    lado: "derecha",
    mobile: true,
  },
  {
    archivo: "pelota-polvo-01",
    tipo: "objeto",
    proporcion: [1, 1],
    superficie: "cancha",
    descripcion:
      "Una pelota apoyada sobre la línea blanca de una cancha de polvo de ladrillo, de cerca, con la marca del pique en el polvo.",
    etiqueta: "Pelota sobre la línea",
    giro: -4,
    velocidad: 0.06,
    banda: 1,
    lado: "izquierda",
    mobile: false,
  },
  {
    archivo: "partido-polvo-02",
    tipo: "gente",
    proporcion: [3, 2],
    superficie: "cancha",
    descripcion:
      "Un jugador que se desliza en el polvo de ladrillo para llegar a una pelota, tomado de costado, con la estela de polvo.",
    etiqueta: "Deslizamiento",
    giro: 2,
    velocidad: 0.16,
    banda: 1,
    lado: "centro",
    mobile: false,
  },
  {
    archivo: "saque-cancha-01",
    tipo: "gente",
    proporcion: [4, 5],
    superficie: "cesped",
    descripcion:
      "Un saque en cancha rápida azul en el momento del impacto, tomado desde abajo o de costado, con el cielo o el techo de fondo.",
    etiqueta: "Saque",
    giro: -3,
    velocidad: 0.1,
    banda: 2,
    lado: "derecha",
    mobile: true,
  },
  {
    archivo: "pelota-linea-01",
    tipo: "objeto",
    proporcion: [3, 2],
    superficie: "cesped",
    descripcion:
      "Una pelota sobre la línea de fondo de una cancha rápida azul, a ras del piso, con la textura de la superficie a la vista.",
    etiqueta: "Cancha rápida",
    giro: 4,
    velocidad: 0.14,
    banda: 2,
    lado: "izquierda",
    mobile: false,
  },
  {
    archivo: "raqueta-cancha-01",
    tipo: "objeto",
    proporcion: [4, 5],
    superficie: "cesped",
    descripcion:
      "Una raqueta apoyada en la cancha azul junto a un tubo de pelotas abierto, vista desde arriba, con la sombra natural.",
    etiqueta: "Raqueta y tubo",
    giro: -2,
    velocidad: 0.08,
    banda: 2,
    lado: "derecha",
    mobile: false,
  },
  {
    archivo: "partido-cancha-01",
    tipo: "gente",
    proporcion: [3, 2],
    superficie: "cesped",
    descripcion:
      "Un punto de dobles en cancha rápida, con dos jugadores en la red, en plano general y con las líneas de la cancha a la vista.",
    etiqueta: "Dobles",
    giro: 3,
    velocidad: 0.12,
    banda: 2,
    lado: "izquierda",
    mobile: false,
  },
  {
    archivo: "volea-cesped-01",
    tipo: "gente",
    proporcion: [3, 2],
    superficie: "polvo",
    descripcion:
      "Una volea cerca de la red en una cancha de césped, con el pasto gastado en el fondo y las líneas blancas.",
    etiqueta: "Volea en césped",
    giro: -3,
    velocidad: 0.12,
    banda: 3,
    lado: "derecha",
    mobile: true,
  },
  {
    archivo: "pelota-linea-02",
    tipo: "objeto",
    proporcion: [1, 1],
    superficie: "polvo",
    descripcion:
      "Una pelota nueva sobre la línea blanca de una cancha de césped, muy de cerca, con el pasto cortado al ras.",
    etiqueta: "Sobre el pasto",
    giro: 4,
    velocidad: 0.07,
    banda: 3,
    lado: "izquierda",
    mobile: false,
  },
  {
    archivo: "bolso-cesped-01",
    tipo: "objeto",
    proporcion: [4, 5],
    superficie: "polvo",
    descripcion:
      "Un bolso raquetero en el banco al costado de una cancha de césped, con una raqueta asomando y la cancha de fondo.",
    etiqueta: "Bolso raquetero",
    giro: -2,
    velocidad: 0.15,
    banda: 3,
    lado: "centro",
    mobile: false,
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
