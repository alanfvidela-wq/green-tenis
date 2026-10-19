// Los datos de envío del checkout: qué se pide y cómo se valida. Los usan el
// formulario (components/Checkout.js) y el servidor (confirmarPedido), que
// vuelve a validar todo antes de mandarlo a crear_pedido.

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

const TELEFONO = /^\+?[\d\s()-]{6,30}$/;
// Cuatro números, o el formato nuevo (CPA): C1425ABC
const CODIGO_POSTAL = /^(\d{4}|[A-Z]\d{4}[A-Z]{3})$/;

// { envio } con los datos limpios, o { error } con lo que hay que corregir
export function limpiarEnvio(dato) {
  const envio = {};
  const faltan = [];
  for (const campo of CAMPOS_ENVIO) {
    const valor = String(dato?.[campo.nombre] ?? "").trim().slice(0, campo.maximo ?? 80);
    if (!valor && !campo.opcional) faltan.push(campo.etiqueta.toLowerCase());
    envio[campo.nombre] = valor;
  }
  envio.codigoPostal = envio.codigoPostal.toUpperCase().replace(/\s/g, "");

  // Con comas: «nombre y apellido» y «calle y número» ya llevan su «y»
  if (faltan.length > 0) return { error: `Faltan datos: ${faltan.join(", ")}.` };
  if (!TELEFONO.test(envio.telefono)) return { error: "El teléfono no parece válido." };
  if (!PROVINCIAS.includes(envio.provincia)) return { error: "Elegí una provincia de la lista." };
  if (!CODIGO_POSTAL.test(envio.codigoPostal)) {
    return { error: "El código postal va con 4 números, o en el formato nuevo (C1425ABC)." };
  }
  return { envio };
}
