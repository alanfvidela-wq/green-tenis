import { connection } from "next/server";

export const CATEGORIAS = [
  {
    slug: "raquetas",
    nombre: "Raquetas",
    descripcion: "Raquetas de Babolat, Wilson, Head y Yonex, con grip y peso a elección.",
  },
  {
    slug: "pelotas",
    nombre: "Pelotas",
    descripcion: "Pelotas presurizadas por tubo, por pack o por caja.",
  },
  {
    slug: "cuerdas-y-grips",
    nombre: "Cuerdas y grips",
    descripcion: "Cuerdas en set o en rollo, y overgrips por pack.",
  },
  {
    slug: "bolsos",
    nombre: "Bolsos",
    descripcion: "Raqueteros y mochilas para llevar raquetas, ropa y pelotas.",
  },
];

// Raquetas por grip y peso: [grip, peso en gramos, precio, stock]
function porGripYPeso(id, opciones) {
  return opciones.map(([grip, peso, precio, stock]) => ({
    id: `${id}-g${grip}-${peso}`,
    nombre: `Grip ${grip} / ${peso} g`,
    precio,
    stock,
  }));
}

// precioBase es el precio de la variante más barata ("desde").
// fotos (opcional) son las fotos de estudio 4:5 de la vitrina, la de catálogo
// primero; sin ellas la vitrina muestra el placeholder (ver «Fotos de
// producto» en DESIGN.md).
const productos = [
  // Raquetas
  {
    id: 1,
    slug: "babolat-pure-drive",
    categoria: "raquetas",
    marca: "Babolat",
    nombre: "Pure Drive",
    descripcion:
      "Raqueta de potencia con un punto dulce amplio. Una de las más usadas en los clubes.",
    precioBase: 389000,
    destacado: true,
    variantes: porGripYPeso(1, [
      [1, 300, 389000, 2],
      [2, 300, 389000, 6],
      [3, 300, 389000, 4],
      [2, 285, 389000, 3],
      [3, 285, 389000, 0],
    ]),
  },
  {
    id: 2,
    slug: "wilson-blade-98",
    categoria: "raquetas",
    marca: "Wilson",
    nombre: "Blade 98",
    descripcion:
      "Raqueta de control, con cabeza de 98 pulgadas. Para jugadores con un swing completo.",
    precioBase: 405000,
    variantes: porGripYPeso(2, [
      [2, 305, 405000, 3],
      [3, 305, 405000, 5],
      [4, 305, 405000, 1],
    ]),
  },
  {
    id: 3,
    slug: "head-speed-mp",
    categoria: "raquetas",
    marca: "Head",
    nombre: "Speed MP",
    descripcion:
      "Raqueta liviana y estable, que va bien desde el fondo y en la red.",
    precioBase: 359000,
    variantes: porGripYPeso(3, [
      [1, 300, 359000, 2],
      [2, 300, 359000, 7],
      [3, 300, 359000, 0],
      [4, 300, 359000, 2],
    ]),
  },
  {
    id: 4,
    slug: "yonex-ezone-100",
    categoria: "raquetas",
    marca: "Yonex",
    nombre: "Ezone 100",
    descripcion:
      "Raqueta de potencia con buena respuesta en los golpes descentrados.",
    precioBase: 369000,
    destacado: true,
    variantes: porGripYPeso(4, [
      [1, 300, 379000, 1],
      [2, 300, 379000, 4],
      [2, 285, 369000, 3],
      [3, 285, 369000, 2],
    ]),
  },
  {
    id: 5,
    slug: "wilson-clash-100",
    categoria: "raquetas",
    marca: "Wilson",
    nombre: "Clash 100",
    descripcion:
      "Raqueta flexible y cómoda para el brazo.",
    precioBase: 349000,
    variantes: porGripYPeso(5, [
      [1, 295, 349000, 0],
      [2, 295, 349000, 0],
      [3, 295, 349000, 0],
    ]),
  },

  // Pelotas
  {
    id: 11,
    slug: "head-tour-xt",
    categoria: "pelotas",
    marca: "Head",
    nombre: "Tour XT",
    descripcion:
      "Pelota presurizada para todas las superficies, con pique parejo.",
    precioBase: 18900,
    destacado: true,
    variantes: [
      { id: "11-tubo-3", nombre: "Tubo x3", precio: 18900, stock: 60 },
      { id: "11-pack-6", nombre: "Pack x6 tubos", precio: 108000, stock: 12 },
      { id: "11-caja-24", nombre: "Caja x24 tubos", precio: 399000, stock: 3 },
    ],
  },
  {
    id: 12,
    slug: "wilson-us-open",
    categoria: "pelotas",
    marca: "Wilson",
    nombre: "US Open Extra Duty",
    descripcion:
      "Pelota presurizada para cancha dura, con felpa extra duty.",
    precioBase: 19900,
    variantes: [
      { id: "12-tubo-3", nombre: "Tubo x3", precio: 19900, stock: 45 },
      { id: "12-pack-6", nombre: "Pack x6 tubos", precio: 114000, stock: 8 },
      { id: "12-caja-24", nombre: "Caja x24 tubos", precio: 419000, stock: 0 },
    ],
  },
  {
    id: 13,
    slug: "dunlop-fort-clay-court",
    categoria: "pelotas",
    marca: "Dunlop",
    nombre: "Fort Clay Court",
    descripcion:
      "Pelota presurizada para polvo de ladrillo.",
    precioBase: 17900,
    variantes: [
      { id: "13-tubo-3", nombre: "Tubo x3", precio: 17900, stock: 52 },
      { id: "13-pack-6", nombre: "Pack x6 tubos", precio: 99000, stock: 10 },
      { id: "13-caja-24", nombre: "Caja x24 tubos", precio: 375000, stock: 2 },
    ],
  },
  {
    id: 14,
    slug: "babolat-gold-all-court",
    categoria: "pelotas",
    marca: "Babolat",
    nombre: "Gold All Court",
    descripcion:
      "Pelota presurizada para todas las superficies, en tubos de cuatro.",
    precioBase: 24500,
    variantes: [
      { id: "14-tubo-4", nombre: "Tubo x4", precio: 24500, stock: 30 },
      { id: "14-pack-6", nombre: "Pack x6 tubos", precio: 139000, stock: 0 },
    ],
  },
  {
    id: 15,
    slug: "penn-championship",
    categoria: "pelotas",
    marca: "Penn",
    nombre: "Championship",
    descripcion:
      "Pelota presurizada para entrenamiento y peloteo.",
    precioBase: 12900,
    variantes: [
      { id: "15-tubo-3", nombre: "Tubo x3", precio: 12900, stock: 80 },
      { id: "15-caja-24", nombre: "Caja x24 tubos", precio: 279000, stock: 4 },
    ],
  },

  // Cuerdas y grips
  {
    id: 16,
    slug: "luxilon-alu-power-125",
    categoria: "cuerdas-y-grips",
    marca: "Luxilon",
    nombre: "ALU Power 1.25",
    descripcion:
      "Cuerda de copoliéster de 1,25 mm, para control con golpes fuertes.",
    precioBase: 39900,
    destacado: true,
    variantes: [
      { id: "16-set", nombre: "Set 12 m", precio: 39900, stock: 25 },
      { id: "16-rollo", nombre: "Rollo 200 m", precio: 459000, stock: 2 },
    ],
  },
  {
    id: 17,
    slug: "babolat-rpm-blast-125",
    categoria: "cuerdas-y-grips",
    marca: "Babolat",
    nombre: "RPM Blast 1.25",
    descripcion:
      "Cuerda de copoliéster de 1,25 mm con perfil octogonal, para generar efecto.",
    precioBase: 34900,
    variantes: [
      { id: "17-set", nombre: "Set 12 m", precio: 34900, stock: 30 },
      { id: "17-rollo", nombre: "Rollo 200 m", precio: 399000, stock: 0 },
    ],
  },
  {
    id: 18,
    slug: "solinco-hyper-g-125",
    categoria: "cuerdas-y-grips",
    marca: "Solinco",
    nombre: "Hyper-G 1.25",
    descripcion:
      "Cuerda de copoliéster de 1,25 mm, para control y efecto.",
    precioBase: 31900,
    variantes: [
      { id: "18-set", nombre: "Set 12 m", precio: 31900, stock: 18 },
      { id: "18-rollo", nombre: "Rollo 200 m", precio: 349000, stock: 1 },
    ],
  },
  {
    id: 19,
    slug: "wilson-pro-overgrip",
    categoria: "cuerdas-y-grips",
    marca: "Wilson",
    nombre: "Pro Overgrip",
    descripcion:
      "Overgrip fino de tacto pegajoso.",
    precioBase: 12900,
    destacado: true,
    variantes: [
      { id: "19-pack-3", nombre: "Pack x3", precio: 12900, stock: 40 },
      { id: "19-pack-12", nombre: "Pack x12", precio: 44900, stock: 9 },
    ],
  },
  {
    id: 20,
    slug: "tourna-grip-original",
    categoria: "cuerdas-y-grips",
    marca: "Tourna",
    nombre: "Tourna Grip Original",
    descripcion:
      "Overgrip de tacto seco, que absorbe la transpiración.",
    precioBase: 14900,
    variantes: [
      { id: "20-pack-3", nombre: "Pack x3", precio: 14900, stock: 22 },
      { id: "20-pack-10", nombre: "Pack x10", precio: 42900, stock: 6 },
    ],
  },

  // Bolsos
  {
    id: 21,
    slug: "wilson-super-tour-9",
    categoria: "bolsos",
    marca: "Wilson",
    nombre: "Super Tour 9",
    descripcion:
      "Raquetero para nueve raquetas, con un compartimento térmico.",
    precioBase: 229000,
    destacado: true,
    variantes: [
      { id: "21-negro", nombre: "Negro", precio: 229000, stock: 4 },
      { id: "21-rojo", nombre: "Rojo", precio: 229000, stock: 2 },
    ],
  },
  {
    id: 22,
    slug: "babolat-pure-aero-rh",
    categoria: "bolsos",
    marca: "Babolat",
    nombre: "Pure Aero RH",
    descripcion:
      "Raquetero para seis o doce raquetas, con lugar para ropa y pelotas.",
    precioBase: 159000,
    variantes: [
      { id: "22-6", nombre: "6 raquetas", precio: 159000, stock: 5 },
      { id: "22-12", nombre: "12 raquetas", precio: 199000, stock: 0 },
    ],
  },
  {
    id: 23,
    slug: "head-tour-racquet-bag",
    categoria: "bolsos",
    marca: "Head",
    nombre: "Tour Racquet Bag",
    descripcion:
      "Raquetero con doble compartimento y bolsillo para zapatillas.",
    precioBase: 149000,
    variantes: [
      { id: "23-m", nombre: "M (6 raquetas)", precio: 149000, stock: 3 },
      { id: "23-l", nombre: "L (9 raquetas)", precio: 179000, stock: 2 },
    ],
  },
  {
    id: 24,
    slug: "yonex-pro-backpack",
    categoria: "bolsos",
    marca: "Yonex",
    nombre: "Pro Backpack",
    descripcion:
      "Mochila con lugar para dos raquetas y bolsillo para notebook.",
    precioBase: 119000,
    variantes: [
      { id: "24-negro", nombre: "Negro", precio: 119000, stock: 6 },
      { id: "24-azul", nombre: "Azul marino", precio: 119000, stock: 3 },
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
