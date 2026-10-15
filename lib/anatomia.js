// «Anatomía de una raqueta», en la home: un paso por parte, de arriba hacia
// abajo. Es contenido de presentación.
//
// - partes: los grupos de components/Raqueta.js que se resaltan en lima.
// - ancla: la parte de donde sale la línea guía de la etiqueta.
// - lado: de qué lado de la raqueta va la etiqueta; distancia (opcional, en %
//   de la escena), cuánto se aleja de la parte.
// - foco: adónde va la cámara, en coordenadas del lienzo de la raqueta
//   (400×560), y cuánto se acerca.
// - giro y forma: cómo cae el sticker de la etiqueta (grados y «pildora» o
//   «redondeado»).
// - foco3d y ancla3d: lo mismo para la raqueta 3D (public/models/raqueta.glb),
//   en centímetros del modelo: va de y = 0 (la tapa) a y = 70,5 (la punta), con
//   el encordado de y = 32 a 69. foco3d.y es la altura que mira la cámara.
export const TITULO_ANATOMIA = "Anatomía de una raqueta";
// El final de la sección, después de la última parte
export const CIERRE_ANATOMIA = {
  texto: "Ahora que la conocés, salí a jugar.",
  accion: "Ver raquetas",
  href: "/categoria/raquetas",
};

export const BAJADA_ANATOMIA =
  "De la cabeza a la tapa del mango: qué es cada parte y qué cambia en el juego.";

export const PASOS_ANATOMIA = [
  {
    id: "contorno",
    titulo: "Contorno",
    dato: "Cabezas de 95 a 110 pulg². La de 100 pulg² (unos 645 cm²) es la más común.",
    frase: "Más cabeza da más superficie para pegarle bien; menos cabeza, más control.",
    partes: ["aro"],
    ancla: "aro",
    lado: "derecha",
    foco: { x: 200, y: 150, zoom: 1.15 },
    giro: -4,
    forma: "pildora",
    foco3d: { y: 51, zoom: 1.25 },
    ancla3d: [8.1, 66.9, 0],
  },
  {
    id: "encordado",
    titulo: "Encordado",
    dato: "Patrón 16×19: 16 cuerdas verticales y 19 horizontales. El 18×20 es más cerrado.",
    frase: "Abierto da más efecto; cerrado, más control. El antivibrador, abajo entre las cuerdas, corta la vibración.",
    partes: ["encordado", "antivibrador"],
    ancla: "encordado",
    lado: "izquierda",
    foco: { x: 200, y: 150, zoom: 1.45 },
    giro: 3,
    forma: "redondeado",
    foco3d: { y: 51, zoom: 1.6 },
    ancla3d: [-6, 57, 0.2],
  },
  {
    id: "punto-dulce",
    titulo: "Punto dulce",
    dato: "La zona del encordado que menos vibra y mejor devuelve la pelota, un poco abajo del centro.",
    frase: "Pegarle ahí se siente liviano. Las cabezas grandes lo tienen más amplio.",
    partes: ["punto-dulce"],
    ancla: "punto-dulce",
    lado: "derecha",
    // Afuera de la zona lima: la etiqueta lima no va sobre lima
    distancia: 30,
    foco: { x: 200, y: 160, zoom: 2.1 },
    giro: -3,
    forma: "pildora",
    foco3d: { y: 48, zoom: 1.9 },
    ancla3d: [0, 47.5, 0.3],
  },
  {
    id: "garganta",
    titulo: "Garganta",
    dato: "Casi todas las raquetas actuales tienen la garganta abierta, en forma de V.",
    frase: "Une la cabeza con el mango y define cuánto se flexiona la raqueta.",
    partes: ["garganta"],
    ancla: "garganta",
    lado: "izquierda",
    foco: { x: 200, y: 300, zoom: 1.7 },
    giro: 4,
    forma: "redondeado",
    foco3d: { y: 26, zoom: 2.1 },
    ancla3d: [-3.2, 26.5, 0.6],
  },
  {
    id: "mango-y-grip",
    titulo: "Mango y grip",
    dato: "Del grip 1 (4 1/8″, 105 mm de perímetro) al grip 4 (4 1/2″, 114 mm).",
    frase: "Con la mano cerrada sobre el mango, entre los dedos y la palma tiene que entrar un dedo índice.",
    partes: ["mango", "grip"],
    ancla: "grip",
    lado: "derecha",
    foco: { x: 200, y: 450, zoom: 1.6 },
    giro: -2,
    forma: "pildora",
    foco3d: { y: 11, zoom: 1.9 },
    ancla3d: [1.5, 10, 1.4],
  },
  {
    id: "overgrip",
    titulo: "Overgrip",
    dato: "Una cinta de 0,5 a 0,7 mm que se enrolla sobre el grip, de abajo hacia arriba.",
    frase: "Se cambia cuando deja de agarrar: mucho antes que el grip.",
    partes: ["overgrip"],
    ancla: "overgrip",
    lado: "izquierda",
    foco: { x: 200, y: 455, zoom: 2.1 },
    giro: 3,
    forma: "redondeado",
    foco3d: { y: 12, zoom: 2.5 },
    ancla3d: [-1.5, 13, 1.2],
  },
  {
    id: "tapa",
    titulo: "Tapa",
    dato: "Cierra el mango a 27 pulgadas (68,6 cm) de la punta: el largo estándar.",
    frase: "Ahí apoya el talón de la mano, y adentro se puede sumar peso.",
    partes: ["tapa"],
    ancla: "tapa",
    lado: "derecha",
    foco: { x: 200, y: 515, zoom: 2.4 },
    giro: -4,
    forma: "pildora",
    foco3d: { y: 2.5, zoom: 3 },
    ancla3d: [1.6, 0.6, 0],
  },
];
