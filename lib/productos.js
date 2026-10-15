import { connection } from "next/server";

export const CATEGORIAS = [
  {
    slug: "raquetas",
    nombre: "Raquetas",
    descripcion: "Para el que pega fuerte, para el que la pone donde quiere y para el que vuelve.",
  },
  {
    slug: "zapatillas",
    nombre: "Zapatillas",
    descripcion: "Para frenar en seco en el polvo de ladrillo y arrancar de nuevo.",
  },
  {
    slug: "pelotas",
    nombre: "Pelotas",
    descripcion: "Pelota nueva, excusa vieja. Por tubo, por pack o por caja.",
  },
  {
    slug: "cuerdas-y-grips",
    nombre: "Cuerdas y grips",
    descripcion: "Lo que se gasta primero y lo que más se nota cuando falta.",
  },
  {
    slug: "bolsos",
    nombre: "Bolsos",
    descripcion: "Raquetas, ropa, pelotas y la toalla, todo en un solo viaje.",
  },
  {
    slug: "ropa",
    nombre: "Ropa",
    descripcion: "Que seque rápido y que tenga bolsillo para la segunda pelota.",
  },
];

// Variantes por talle, todas al mismo precio: [talle, stock]
function porTalle(id, precio, talles) {
  return talles.map(([talle, stock]) => ({
    id: `${id}-${talle}`.toLowerCase(),
    nombre: `Talle ${talle}`,
    precio,
    stock,
  }));
}

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
      "Potencia fácil y un punto dulce generoso. La raqueta que más se ve en los clubes, por algo.",
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
      "Control y sensación en cada golpe. Para el que ya tiene el swing armado y quiere ponerla en la línea.",
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
      "Liviana, rápida y estable. Va bien desde el fondo y no te deja a pie en la red.",
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
      "Potencia con un toque suave. Perdona los golpes que salen del centro del encordado.",
    precioBase: 369000,
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
      "Flexible y amable con el brazo. Ideal si volvés a la cancha después de un tiempo.",
    precioBase: 349000,
    variantes: porGripYPeso(5, [
      [1, 295, 349000, 0],
      [2, 295, 349000, 0],
      [3, 295, 349000, 0],
    ]),
  },

  // Zapatillas
  {
    id: 6,
    slug: "asics-gel-resolution-9",
    categoria: "zapatillas",
    marca: "Asics",
    nombre: "Gel-Resolution 9",
    descripcion:
      "Estabilidad para correr de lado a lado sin miedo a doblar el tobillo. Suela para polvo de ladrillo.",
    precioBase: 239000,
    destacado: true,
    variantes: porTalle(6, 239000, [
      [39, 2],
      [40, 4],
      [41, 6],
      [42, 5],
      [43, 0],
      [44, 3],
      [45, 1],
    ]),
  },
  {
    id: 7,
    slug: "adidas-barricade",
    categoria: "zapatillas",
    marca: "Adidas",
    nombre: "Barricade",
    descripcion:
      "Resistentes como pocas. Aguantan cemento, polvo de ladrillo y al que arrastra los pies.",
    precioBase: 219000,
    variantes: porTalle(7, 219000, [
      [39, 3],
      [40, 5],
      [41, 0],
      [42, 4],
      [43, 2],
      [44, 2],
      [45, 0],
    ]),
  },
  {
    id: 8,
    slug: "nike-vapor-pro-2",
    categoria: "zapatillas",
    marca: "Nike",
    nombre: "Vapor Pro 2",
    descripcion:
      "Livianas y rápidas, para los que viven pegados a la red y suben al primer golpe.",
    precioBase: 249000,
    variantes: porTalle(8, 249000, [
      [38, 1],
      [39, 2],
      [40, 3],
      [41, 3],
      [42, 0],
      [43, 2],
      [44, 1],
    ]),
  },
  {
    id: 9,
    slug: "babolat-jet-mach-3",
    categoria: "zapatillas",
    marca: "Babolat",
    nombre: "Jet Mach 3",
    descripcion:
      "Ultralivianas, con una suela que agarra para frenar en seco y cambiar de dirección.",
    precioBase: 259000,
    variantes: porTalle(9, 259000, [
      [39, 0],
      [40, 2],
      [41, 3],
      [42, 3],
      [43, 1],
      [44, 0],
    ]),
  },
  {
    id: 10,
    slug: "k-swiss-hypercourt-express-2",
    categoria: "zapatillas",
    marca: "K-Swiss",
    nombre: "Hypercourt Express 2",
    descripcion:
      "Cómodas desde el primer partido, sin ablande. Para jugar tres veces por semana.",
    precioBase: 179000,
    variantes: porTalle(10, 179000, [
      [38, 2],
      [39, 4],
      [40, 4],
      [41, 5],
      [42, 3],
      [43, 2],
      [44, 1],
      [45, 1],
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
      "Presurizadas, con pique parejo y una felpa que aguanta el set largo.",
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
      "Pensadas para cancha dura: la felpa no se pela aunque el cemento raspe.",
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
      "Hechas para polvo de ladrillo: no se cargan de tierra ni se ponen pesadas.",
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
      "Cuatro pelotas por tubo, para que nadie se quede mirando mientras se busca la que se fue.",
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
      "La de peloteo de toda la vida. Rinde, pica bien y no duele cuando se pierde una.",
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
      "Monofilamento de poliéster para el que pega fuerte y quiere que la pelota baje.",
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
      "Perfil octogonal que muerde la pelota. Más efecto, menos pelotas largas.",
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
      "Control y efecto, con una tensión que se sostiene más partidos de lo que esperás.",
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
      "Fino y pegajoso. Cambialo seguido y la raqueta no se te escapa en el tercer set.",
    precioBase: 12900,
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
      "El overgrip azul de siempre: seca la mano aunque transpires como en enero.",
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
      "Para nueve raquetas, con un compartimento térmico para que las cuerdas no sufran el calor.",
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
      "El raquetero de los fines de semana largos: raquetas, ropa de cambio y las pelotas nuevas.",
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
      "Doble compartimento y un bolsillo aparte para las zapatillas con tierra.",
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
      "Mochila con lugar para dos raquetas. Va al club y, con un poco de cara, a la oficina.",
    precioBase: 119000,
    variantes: [
      { id: "24-negro", nombre: "Negro", precio: 119000, stock: 6 },
      { id: "24-azul", nombre: "Azul marino", precio: 119000, stock: 3 },
    ],
  },

  // Ropa
  {
    id: 25,
    slug: "nike-remera-court-dri-fit",
    categoria: "ropa",
    marca: "Nike",
    nombre: "Remera Court Dri-FIT",
    descripcion:
      "Liviana y de secado rápido. Para el tercer set de una tarde de enero.",
    precioBase: 49900,
    destacado: true,
    variantes: porTalle(25, 49900, [
      ["S", 4],
      ["M", 8],
      ["L", 6],
      ["XL", 0],
    ]),
  },
  {
    id: 26,
    slug: "adidas-short-club",
    categoria: "ropa",
    marca: "Adidas",
    nombre: "Short Club",
    descripcion:
      "Bolsillos donde entran dos pelotas, como tiene que ser.",
    precioBase: 39900,
    variantes: porTalle(26, 39900, [
      ["S", 3],
      ["M", 7],
      ["L", 5],
      ["XL", 2],
    ]),
  },
  {
    id: 27,
    slug: "lacoste-chomba-sport",
    categoria: "ropa",
    marca: "Lacoste",
    nombre: "Chomba Sport",
    descripcion:
      "La chomba de tenis de toda la vida, en una tela que respira.",
    precioBase: 89900,
    variantes: porTalle(27, 89900, [
      ["S", 2],
      ["M", 0],
      ["L", 3],
      ["XL", 1],
    ]),
  },
  {
    id: 28,
    slug: "wilson-pollera-team",
    categoria: "ropa",
    marca: "Wilson",
    nombre: "Pollera Team",
    descripcion:
      "Con short interno y un bolsillo para la pelota del segundo saque.",
    precioBase: 45900,
    variantes: porTalle(28, 45900, [
      ["XS", 2],
      ["S", 4],
      ["M", 3],
      ["L", 0],
    ]),
  },
  {
    id: 29,
    slug: "head-gorra-pro-player",
    categoria: "ropa",
    marca: "Head",
    nombre: "Gorra Pro Player",
    descripcion:
      "Visera que no se deforma y una banda que absorbe. El sol de las dos de la tarde, a raya.",
    precioBase: 24900,
    variantes: [
      { id: "29-blanca", nombre: "Blanca", precio: 24900, stock: 10 },
      { id: "29-negra", nombre: "Negra", precio: 24900, stock: 7 },
    ],
  },
  {
    id: 30,
    slug: "babolat-medias-team",
    categoria: "ropa",
    marca: "Babolat",
    nombre: "Medias Team x3",
    descripcion:
      "Tres pares con refuerzo en talón y punta. Ni una ampolla en el torneo del club.",
    precioBase: 19900,
    variantes: [
      { id: "30-39-42", nombre: "39 a 42", precio: 19900, stock: 15 },
      { id: "30-43-46", nombre: "43 a 46", precio: 19900, stock: 11 },
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
