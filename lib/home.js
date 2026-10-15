// Contenido editorial de la home. Es presentación: no toca precios ni stock.

export const LEYENDAS = [
  "Elaborada con palo",
  "Estacionada sin apuro",
  "Para la ronda larga",
  "Cebada con paciencia",
  "Agua a 80, nunca hervida",
];

// Una ronda para cada momento, con la categoría que la resuelve.
// Fotos generadas con Higgsfield (ver DESIGN.md, «Fotos y video»).
export const MOMENTOS = [
  {
    titulo: "La de la mañana",
    texto: "Yerba suave, agua a punto y el diario abierto. Sin apuro.",
    foto: "/fotos/la-de-la-manana.webp",
    alt: "Un mate de calabaza en la mesada de la cocina, junto a un paquete de yerba y el diario",
    categoria: "yerbas",
    accion: "Ver yerbas",
  },
  {
    titulo: "La de la ruta",
    texto: "Un termo que aguante caliente hasta el próximo peaje.",
    foto: "/fotos/la-de-la-ruta.webp",
    alt: "Un mate y un termo verde sobre el tablero de un auto, frente a un campo al atardecer",
    categoria: "termos",
    accion: "Ver termos",
  },
  {
    titulo: "La de la plaza",
    texto: "Matera al hombro y una manta en el pasto. Lo demás se arregla.",
    foto: "/fotos/la-de-la-plaza.webp",
    alt: "Una matera de cuero, un termo y un mate sobre una manta a rayas en el pasto",
    categoria: "accesorios",
    accion: "Ver accesorios",
  },
];
