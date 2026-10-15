import { connection } from "next/server";

export const CATEGORIAS = [
  {
    slug: "mates",
    imagen: "/productos/mate-imperial-calabaza-alpaca.webp",
    nombre: "Mates",
    descripcion: "Calabaza, algarrobo, vidrio y acero. Para todos los gustos y cebadores.",
  },
  {
    slug: "bombillas",
    imagen: "/productos/bombilla-alpaca-pico-de-loro.webp",
    nombre: "Bombillas",
    descripcion: "Alpaca, acero y caña. Rectas, curvas, de resorte o pico de loro.",
  },
  {
    slug: "termos",
    imagen: "/productos/stanley-clasico.webp",
    nombre: "Termos",
    descripcion: "Que el agua llegue a la última ronda a la temperatura justa.",
  },
  {
    slug: "yerbas",
    imagen: "/productos/playadito-suave.webp",
    nombre: "Yerbas",
    descripcion: "Con palo, sin palo, suaves, intensas y con hierbas serranas.",
  },
  {
    slug: "accesorios",
    imagen: "/productos/set-yerbera-azucarera.webp",
    nombre: "Accesorios",
    descripcion: "Materas, yerberas y todo lo que hace falta para la ronda.",
  },
];

// precioBase es el precio de la variante más barata ("desde").
// imagen es el recorte sin fondo; no entra en la vitrina. fotos (opcional) son
// las fotos de estudio 4:5 de la vitrina, la de catálogo primero; sin ellas la
// vitrina muestra el placeholder (ver «Fotos de producto» en DESIGN.md).
const productos = [
  // Mates
  {
    id: 1,
    slug: "mate-imperial-calabaza-alpaca",
    imagen: "/productos/mate-imperial-calabaza-alpaca.webp",
    categoria: "mates",
    marca: "Artesanal",
    nombre: "Mate imperial de calabaza",
    descripcion:
      "Calabaza seleccionada forrada en cuero vacuno, con virola de alpaca cincelada a mano. El clásico de los clásicos.",
    precioBase: 38500,
    destacado: true,
    variantes: [
      { id: "1-marron", nombre: "Cuero marrón", precio: 38500, stock: 6 },
      { id: "1-negro", nombre: "Cuero negro", precio: 38500, stock: 0 },
      { id: "1-suela", nombre: "Cuero suela", precio: 41000, stock: 3 },
    ],
  },
  {
    id: 2,
    slug: "mate-camionero-calabaza",
    imagen: "/productos/mate-camionero-calabaza.webp",
    categoria: "mates",
    marca: "Artesanal",
    nombre: "Mate camionero",
    descripcion:
      "Calabaza de boca ancha con virola lisa de acero. Grande, cómodo y para rondas largas.",
    precioBase: 24900,
    variantes: [
      { id: "2-virola-acero", nombre: "Virola de acero", precio: 24900, stock: 10 },
      { id: "2-virola-alpaca", nombre: "Virola de alpaca", precio: 32900, stock: 4 },
    ],
  },
  {
    id: 3,
    slug: "mate-algarrobo",
    imagen: "/productos/mate-algarrobo.webp",
    categoria: "mates",
    marca: "Artesanal",
    nombre: "Mate de algarrobo",
    descripcion:
      "Torneado en madera de algarrobo del norte argentino. Curado simple y sabor amable.",
    precioBase: 12500,
    variantes: [
      { id: "3-chico", nombre: "Chico", precio: 12500, stock: 8 },
      { id: "3-grande", nombre: "Grande", precio: 14900, stock: 0 },
    ],
  },
  {
    id: 4,
    slug: "stanley-mate-system",
    imagen: "/productos/stanley-mate-system.webp",
    categoria: "mates",
    marca: "Stanley",
    nombre: "Mate System",
    descripcion:
      "Mate de acero inoxidable con doble pared y tapa. No se cura, no se rompe y aguanta cualquier mochila.",
    precioBase: 46000,
    destacado: true,
    variantes: [
      { id: "4-verde", nombre: "Verde", precio: 46000, stock: 5 },
      { id: "4-negro", nombre: "Negro", precio: 46000, stock: 2 },
      { id: "4-crema", nombre: "Crema", precio: 46000, stock: 0 },
    ],
  },

  // Bombillas
  {
    id: 5,
    slug: "bombilla-alpaca-pico-de-loro",
    imagen: "/productos/bombilla-alpaca-pico-de-loro.webp",
    categoria: "bombillas",
    marca: "Artesanal",
    nombre: "Bombilla pico de loro",
    descripcion:
      "Alpaca labrada con pico curvo de bronce. Filtro desmontable para limpiarla fácil.",
    precioBase: 18900,
    destacado: true,
    variantes: [
      { id: "5-16cm", nombre: "16 cm", precio: 18900, stock: 7 },
      { id: "5-19cm", nombre: "19 cm", precio: 20500, stock: 3 },
    ],
  },
  {
    id: 6,
    slug: "bombilla-acero-resorte",
    imagen: "/productos/bombilla-acero-resorte.webp",
    categoria: "bombillas",
    marca: "Artesanal",
    nombre: "Bombilla de acero con resorte",
    descripcion:
      "Acero inoxidable con filtro de resorte: no se tapa ni con la yerba más fina.",
    precioBase: 5900,
    variantes: [
      { id: "6-recta", nombre: "Recta", precio: 5900, stock: 25 },
      { id: "6-curva", nombre: "Curva", precio: 6400, stock: 12 },
    ],
  },
  {
    id: 7,
    slug: "bombilla-cana",
    imagen: "/productos/bombilla-cana.webp",
    categoria: "bombillas",
    marca: "Artesanal",
    nombre: "Bombilla de caña",
    descripcion:
      "Caña natural con filtro tejido. Liviana, tradicional y sin sabor metálico.",
    precioBase: 3200,
    variantes: [{ id: "7-unica", nombre: "Única", precio: 3200, stock: 0 }],
  },
  {
    id: 8,
    slug: "bombilla-plana-alpaca-bronce",
    imagen: "/productos/bombilla-plana-alpaca-bronce.webp",
    categoria: "bombillas",
    marca: "Artesanal",
    nombre: "Bombilla plana alpaca y bronce",
    descripcion:
      "Cuerpo plano de alpaca con detalles de bronce. Filtro de paleta, ideal para mates imperiales.",
    precioBase: 14500,
    variantes: [
      { id: "8-unica", nombre: "Única", precio: 14500, stock: 4 },
    ],
  },

  // Termos
  {
    id: 9,
    slug: "stanley-clasico",
    imagen: "/productos/stanley-clasico.webp",
    categoria: "termos",
    marca: "Stanley",
    nombre: "Termo Clásico",
    descripcion:
      "Acero inoxidable de doble pared con tapón cebador. Mantiene el agua caliente todo el día.",
    precioBase: 89900,
    destacado: true,
    variantes: [
      { id: "9-1l-verde", nombre: "1 L - Verde", precio: 89900, stock: 8 },
      { id: "9-1l-negro", nombre: "1 L - Negro", precio: 89900, stock: 0 },
      { id: "9-1-4l-verde", nombre: "1,4 L - Verde", precio: 104900, stock: 3 },
    ],
  },
  {
    id: 10,
    slug: "lumilagro-luminox",
    imagen: "/productos/lumilagro-luminox.webp",
    categoria: "termos",
    marca: "Lumilagro",
    nombre: "Luminox",
    descripcion:
      "El termo de acero de Lumilagro con pico cebador. Robusto y liviano.",
    precioBase: 42900,
    variantes: [
      { id: "10-1l-negro", nombre: "1 L - Negro", precio: 42900, stock: 9 },
      { id: "10-1l-rojo", nombre: "1 L - Rojo", precio: 42900, stock: 2 },
    ],
  },
  {
    id: 11,
    slug: "waterdog-tropero",
    imagen: "/productos/waterdog-tropero.webp",
    categoria: "termos",
    marca: "Waterdog",
    nombre: "Tropero",
    descripcion:
      "Termo de acero con manija y pico cebador de precisión. Pensado para la ruta y el campo.",
    precioBase: 59900,
    variantes: [
      { id: "11-1l-gris", nombre: "1 L - Gris", precio: 59900, stock: 5 },
      { id: "11-1-3l-gris", nombre: "1,3 L - Gris", precio: 67900, stock: 0 },
    ],
  },
  {
    id: 12,
    slug: "termolar-r-evolution",
    imagen: "/productos/termolar-r-evolution.webp",
    categoria: "termos",
    marca: "Termolar",
    nombre: "R-Evolution",
    descripcion:
      "Ampolla de vidrio y cuerpo plástico reforzado. Tapón cebador de vertido controlado.",
    precioBase: 34900,
    variantes: [
      { id: "12-1l-verde", nombre: "1 L - Verde", precio: 34900, stock: 0 },
      { id: "12-1l-negro", nombre: "1 L - Negro", precio: 34900, stock: 0 },
    ],
  },

  // Yerbas
  {
    id: 13,
    slug: "playadito-suave",
    imagen: "/productos/playadito-suave.webp",
    categoria: "yerbas",
    marca: "Playadito",
    nombre: "Yerba suave con palo",
    descripcion:
      "La colonense de sabor suave y parejo. Rinde bien y no amarga.",
    precioBase: 4200,
    destacado: true,
    variantes: [
      { id: "13-500g", nombre: "500 g", precio: 4200, stock: 40 },
      { id: "13-1kg", nombre: "1 kg", precio: 7900, stock: 22 },
    ],
  },
  {
    id: 14,
    slug: "taragui-con-palo",
    imagen: "/productos/taragui-con-palo.webp",
    categoria: "yerbas",
    marca: "Taragüí",
    nombre: "Yerba con palo",
    descripcion:
      "Sabor intenso y tradicional, estacionamiento natural. La de siempre.",
    precioBase: 3900,
    variantes: [
      { id: "14-500g", nombre: "500 g", precio: 3900, stock: 30 },
      { id: "14-1kg", nombre: "1 kg", precio: 7200, stock: 0 },
    ],
  },
  {
    id: 15,
    slug: "cbse-hierbas-serranas",
    imagen: "/productos/cbse-hierbas-serranas.webp",
    categoria: "yerbas",
    marca: "CBSé",
    nombre: "Hierbas Serranas",
    descripcion:
      "Yerba compuesta con peperina, menta, poleo y burrito. Aromática y digestiva.",
    precioBase: 3600,
    variantes: [
      { id: "15-500g", nombre: "500 g", precio: 3600, stock: 18 },
    ],
  },
  {
    id: 16,
    slug: "rosamonte-especial",
    imagen: "/productos/rosamonte-especial.webp",
    categoria: "yerbas",
    marca: "Rosamonte",
    nombre: "Yerba Especial",
    descripcion:
      "Molienda fina y sabor potente, con estacionamiento prolongado. Para los que la toman fuerte.",
    precioBase: 4400,
    variantes: [
      { id: "16-500g", nombre: "500 g", precio: 4400, stock: 0 },
      { id: "16-1kg", nombre: "1 kg", precio: 8300, stock: 12 },
    ],
  },
  {
    id: 17,
    slug: "canarias-tradicional",
    imagen: "/productos/canarias-tradicional.webp",
    categoria: "yerbas",
    marca: "Canarias",
    nombre: "Yerba Tradicional",
    descripcion:
      "La uruguaya sin palo, de molienda fina y sabor bien marcado.",
    precioBase: 6900,
    variantes: [
      { id: "17-500g", nombre: "500 g", precio: 6900, stock: 10 },
      { id: "17-1kg", nombre: "1 kg", precio: 12900, stock: 6 },
    ],
  },

  // Accesorios
  {
    id: 18,
    slug: "matera-cuero",
    imagen: "/productos/matera-cuero.webp",
    categoria: "accesorios",
    marca: "Artesanal",
    nombre: "Matera de cuero",
    descripcion:
      "Cuero vacuno con costuras a mano. Lugar para termo de 1 L, mate, yerbera y azucarera.",
    precioBase: 64900,
    destacado: true,
    variantes: [
      { id: "18-marron", nombre: "Marrón", precio: 64900, stock: 3 },
      { id: "18-negro", nombre: "Negro", precio: 64900, stock: 1 },
    ],
  },
  {
    id: 19,
    slug: "set-yerbera-azucarera",
    imagen: "/productos/set-yerbera-azucarera.webp",
    categoria: "accesorios",
    marca: "Artesanal",
    nombre: "Set yerbera y azucarera",
    descripcion:
      "Latas con tapa hermética y pico vertedor. Mantienen la yerba fresca y a mano.",
    precioBase: 15900,
    variantes: [
      { id: "19-verde", nombre: "Verde", precio: 15900, stock: 6 },
      { id: "19-crema", nombre: "Crema", precio: 15900, stock: 0 },
    ],
  },
  {
    id: 20,
    slug: "cepillo-limpia-bombillas",
    imagen: "/productos/cepillo-limpia-bombillas.webp",
    categoria: "accesorios",
    marca: "Artesanal",
    nombre: "Cepillo limpia bombillas",
    descripcion:
      "Cepillo fino de cerdas de nylon para dejar la bombilla como nueva.",
    precioBase: 1900,
    variantes: [
      { id: "20-pack-2", nombre: "Pack x2", precio: 1900, stock: 35 },
    ],
  },
];

export async function getProductos() {
  // Simula una consulta a la base: el stock se lee en cada request, no en el build.
  await connection();
  return structuredClone(productos);
}

export async function getProductosPorCategoria(categoria) {
  await connection();
  return structuredClone(productos.filter((p) => p.categoria === categoria));
}

export async function getProductoPorSlug(slug) {
  await connection();
  const producto = productos.find((p) => p.slug === slug);
  return producto ? structuredClone(producto) : null;
}

export function getCategoria(slug) {
  return CATEGORIAS.find((c) => c.slug === slug) ?? null;
}

export function tieneStock(producto) {
  return producto.variantes.some((v) => v.stock > 0);
}

export function tienePreciosDistintos(producto) {
  return producto.variantes.some((v) => v.precio !== producto.precioBase);
}
