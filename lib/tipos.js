// Lo que comparten el formulario de la administración (en el navegador) y la
// validación del servidor (lib/esquemasAdmin.js): qué tipos de producto van en
// cada categoría, las opciones de la ficha de una cuerda y por qué estados
// avanza un pedido. Sin dependencias: lo puede importar un componente de
// cliente.

// Las categorías de CATEGORIAS (lib/productos.js), con los tipos que admiten.
// El encordado es un servicio y no se carga desde acá.
export const TIPOS_POR_CATEGORIA = {
  raquetas: ["raqueta"],
  pelotas: ["pelota"],
  "cuerdas-y-grips": ["cuerda", "grip"],
  bolsos: ["bolso"],
};

export const NOMBRES_TIPO = {
  raqueta: "Raqueta",
  pelota: "Pelota",
  cuerda: "Cuerda",
  grip: "Grip",
  bolso: "Bolso",
};

// Los de la base (check de fichas_cuerda)
export const MATERIALES_CUERDA = ["copoliester", "multifilamento", "nylon", "tripa", "hibrida"];
export const PERFILES_CUERDA = ["redondo", "octogonal", "cuadrado", "pentagonal"];

// Lo que usa el quiz para recomendar, también de la base (check de
// fichas_raqueta, fichas_cuerda y fichas_pelota)
export const NIVELES = ["principiante", "intermedio", "avanzado"];
export const JUEGOS_RAQUETA = ["potencia", "control", "equilibrio", "confort"];
export const JUEGOS_CUERDA = ["durabilidad", "control", "confort", "spin"];
export const SUPERFICIES_PELOTA = ["todas", "dura", "polvo"];
export const USOS_PELOTA = ["competencia", "entrenamiento"];

// Los tipos que llevan filas de rótulo y valor (productos.ficha). La de grip y
// la de bolso son solo eso; la pelota suma superficie y uso (fichas_pelota), y
// la raqueta y la cuerda van enteras en sus tablas.
export const TIPOS_CON_FICHA_LIBRE = ["pelota", "grip", "bolso"];

// Por dónde avanza un pedido desde la administración: de pagado a en
// preparación, y de ahí a enviado. Los demás estados los cambian el pago y el
// vencimiento.
export const SIGUIENTE_ESTADO = {
  pagado: "preparando",
  preparando: "enviado",
};

export const ESTADOS_PEDIDO = {
  pendiente_pago: "Pendiente de pago",
  pagado: "Pagado",
  preparando: "En preparación",
  enviado: "Enviado",
  entregado: "Entregado",
  cancelado: "Cancelado",
};
