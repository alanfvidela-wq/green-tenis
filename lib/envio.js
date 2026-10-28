// Los datos de envío del checkout: qué se pide y con qué reglas. Los usan el
// formulario (components/Checkout.js) y el esquema Envio (lib/esquemas.js),
// con el que confirmarPedido valida todo en el servidor antes de mandarlo a
// crear_pedido.

export const PROVINCIAS = [
  "Buenos Aires",
  "Ciudad Autónoma de Buenos Aires",
  "Catamarca",
  "Chaco",
  "Chubut",
  "Córdoba",
  "Corrientes",
  "Entre Ríos",
  "Formosa",
  "Jujuy",
  "La Pampa",
  "La Rioja",
  "Mendoza",
  "Misiones",
  "Neuquén",
  "Río Negro",
  "Salta",
  "San Juan",
  "San Luis",
  "Santa Cruz",
  "Santa Fe",
  "Santiago del Estero",
  "Tierra del Fuego",
  "Tucumán",
];

export const CAMPOS_ENVIO = [
  { nombre: "nombre", etiqueta: "Nombre y apellido", autoComplete: "name", maximo: 80 },
  { nombre: "telefono", etiqueta: "Teléfono", autoComplete: "tel", tipo: "tel", maximo: 30 },
  { nombre: "calle", etiqueta: "Calle y número", autoComplete: "address-line1", maximo: 120 },
  {
    nombre: "piso",
    etiqueta: "Piso o departamento",
    autoComplete: "address-line2",
    maximo: 40,
    opcional: true,
  },
  { nombre: "ciudad", etiqueta: "Ciudad", autoComplete: "address-level2", maximo: 80 },
  { nombre: "provincia", etiqueta: "Provincia", autoComplete: "address-level1", opciones: PROVINCIAS },
  { nombre: "codigoPostal", etiqueta: "Código postal", autoComplete: "postal-code", maximo: 8 },
];

export const TELEFONO = /^\+?[\d\s()-]{6,30}$/;
// Cuatro números, o el formato nuevo (CPA): C1425ABC
export const CODIGO_POSTAL = /^(\d{4}|[A-Z]\d{4}[A-Z]{3})$/;

// «Envíos y devoluciones» en la página de producto. Dicen lo que hace hoy la
// tienda (el checkout pide la dirección, el envío se ve en el resumen antes de
// pagar y el pedido avanza por sus estados en «Mis pedidos») y el derecho de
// arrepentimiento de las compras a distancia (Ley 24.240, art. 34). Las
// condiciones propias de la tienda (plazos, cambios de grip) van acá cuando
// estén definidas.
export const ENVIOS_Y_DEVOLUCIONES = [
  "Enviamos a todo el país. El costo del envío se ve en el resumen del checkout, antes de pagar.",
  "Preparamos el pedido cuando se acredita el pago. En «Mis pedidos» ves cuándo sale y cuándo llega.",
  "Si la llevás encordada, la encordamos con la cuerda y la tensión que elegiste antes de mandarla.",
  "Tenés 10 días corridos desde que recibís el pedido para arrepentirte de la compra, como dice la Ley de Defensa del Consumidor.",
];
