// Las líneas del carrito: solo ids y cantidades, nunca precios.
//
//   { tipo: "producto", varianteId: 14, cantidad: 1 }
//   { tipo: "combo", comboId: 1, elecciones: { 1: 14 }, cantidad: 1 }
//
// `elecciones` lleva la variante elegida de cada ítem a elegir del combo
// (combo_item_id → variante_id). Las usan el carrito del navegador
// (hooks/useCarrito.js) y el servidor (lib/carrito.js), que no confía en lo
// que le llega.

export const MAX_LINEAS = 30;
export const MAX_CANTIDAD = 99;

const esId = (valor) => Number.isSafeInteger(valor) && valor > 0;

// La misma variante, o el mismo combo con las mismas elecciones, es la misma
// línea: «p:14», «c:1:1=14»
export function claveDe(linea) {
  if (linea.tipo === "producto") return `p:${linea.varianteId}`;
  const elecciones = Object.entries(linea.elecciones)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([item, variante]) => `${item}=${variante}`)
    .join(",");
  return `c:${linea.comboId}:${elecciones}`;
}

// Una línea con la forma esperada, con la cantidad acotada de 1 a 99; null si
// no la tiene
export function limpiarLinea(dato) {
  if (!dato || typeof dato !== "object" || !Number.isSafeInteger(dato.cantidad)) {
    return null;
  }
  const cantidad = Math.min(MAX_CANTIDAD, Math.max(1, dato.cantidad));

  if (dato.tipo === "producto" && esId(dato.varianteId)) {
    return { tipo: "producto", varianteId: dato.varianteId, cantidad };
  }

  if (
    dato.tipo === "combo" &&
    esId(dato.comboId) &&
    dato.elecciones &&
    typeof dato.elecciones === "object" &&
    !Array.isArray(dato.elecciones)
  ) {
    const elecciones = {};
    for (const [item, variante] of Object.entries(dato.elecciones)) {
      if (!esId(Number(item)) || !esId(variante)) return null;
      elecciones[Number(item)] = variante;
    }
    return { tipo: "combo", comboId: dato.comboId, elecciones, cantidad };
  }

  return null;
}

// Las líneas como las espera crear_pedido en la base: los sueltos en `items`
// y cada combo, una vez por unidad, en `combos` con sus elecciones
export function argumentosDePedido(lineas) {
  return {
    items: lineas
      .filter((l) => l.tipo === "producto")
      .map((l) => ({ variante_id: l.varianteId, cantidad: l.cantidad })),
    combos: lineas
      .filter((l) => l.tipo === "combo")
      .flatMap((l) =>
        Array.from({ length: l.cantidad }, () => ({
          combo_id: l.comboId,
          elecciones: Object.entries(l.elecciones).map(([item, variante]) => ({
            combo_item_id: Number(item),
            variante_id: variante,
          })),
        })),
      ),
    encordados: [],
  };
}

// Las líneas válidas, sin repetir (las repetidas suman su cantidad) y como
// mucho 30
export function limpiarLineas(datos) {
  if (!Array.isArray(datos)) return [];
  const porClave = new Map();
  for (const dato of datos) {
    const linea = limpiarLinea(dato);
    if (!linea) continue;
    const clave = claveDe(linea);
    const anterior = porClave.get(clave);
    porClave.set(
      clave,
      anterior
        ? { ...anterior, cantidad: Math.min(MAX_CANTIDAD, anterior.cantidad + linea.cantidad) }
        : linea,
    );
  }
  return [...porClave.values()].slice(0, MAX_LINEAS);
}
