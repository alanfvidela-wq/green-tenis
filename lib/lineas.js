// Las líneas del carrito: solo ids y cantidades, nunca precios.
//
//   { tipo: "producto", varianteId: 14, cantidad: 1 }
//   { tipo: "producto", varianteId: 2, cantidad: 1,
//     encordado: { cuerdaId: 33, tensionKg: 24.5 } }
//   { tipo: "combo", comboId: 1, elecciones: { 1: 14 }, cantidad: 1 }
//
// `encordado` va solo en una raqueta: cada unidad lleva además un set de 12 m
// de esa cuerda (la variante `cuerdaId`) y el servicio de encordado a esa
// tensión. `elecciones` lleva la variante elegida de cada ítem a elegir del
// combo (combo_item_id → variante_id). El carrito del navegador
// (hooks/useCarrito.js) limpia lo guardado con limpiarLineas; el servidor no
// confía en lo que le llega y lo valida con el esquema Lineas
// (lib/esquemas.js), con los mismos límites.

export const MAX_LINEAS = 30;
export const MAX_CANTIDAD = 99;

// La tensión del encordado: de a medio kilo, dentro de lo que admite
// cualquier raqueta (el rango de cada una lo valida el servidor)
export const TENSION_MINIMA_KG = 15;
export const TENSION_MAXIMA_KG = 35;

const esId = (valor) => Number.isSafeInteger(valor) && valor > 0;

export const esTension = (valor) =>
  Number.isFinite(valor) &&
  valor >= TENSION_MINIMA_KG &&
  valor <= TENSION_MAXIMA_KG &&
  Number.isInteger(valor * 2);

// La misma variante, o el mismo combo con las mismas elecciones, es la misma
// línea: «p:14», «p:2:e=33@24.5» (encordada), «c:1:1=14»
export function claveDe(linea) {
  if (linea.tipo === "producto") {
    const { encordado } = linea;
    return encordado
      ? `p:${linea.varianteId}:e=${encordado.cuerdaId}@${encordado.tensionKg}`
      : `p:${linea.varianteId}`;
  }
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
    const linea = { tipo: "producto", varianteId: dato.varianteId, cantidad };
    if (dato.encordado === undefined) return linea;
    // Un encordado que no se puede leer descarta la línea: no se vende la
    // raqueta sin encordar si se pidió encordada
    const { cuerdaId, tensionKg } = dato.encordado ?? {};
    if (!esId(cuerdaId) || !esTension(tensionKg)) return null;
    return { ...linea, encordado: { cuerdaId, tensionKg } };
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
// y cada combo, una vez por unidad, en `combos` con sus elecciones. Una
// raqueta encordada suma su set de cuerda como otro ítem y un encordado por
// unidad, que nombra a los dos por su `ref` (r1 y c1, r2 y c2…).
export function argumentosDePedido(lineas) {
  const productos = lineas.filter((l) => l.tipo === "producto");
  const encordadas = productos.filter((l) => l.encordado);
  return {
    items: productos.flatMap((l) => {
      if (!l.encordado) return [{ variante_id: l.varianteId, cantidad: l.cantidad }];
      const n = encordadas.indexOf(l) + 1;
      return [
        { variante_id: l.varianteId, cantidad: l.cantidad, ref: `r${n}` },
        { variante_id: l.encordado.cuerdaId, cantidad: l.cantidad, ref: `c${n}` },
      ];
    }),
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
    encordados: encordadas.flatMap((l, i) =>
      Array.from({ length: l.cantidad }, () => ({
        raqueta: `r${i + 1}`,
        cuerda: `c${i + 1}`,
        tension_kg: l.encordado.tensionKg,
      })),
    ),
  };
}

// Las líneas sin repetir (las repetidas suman su cantidad, hasta 99) y como
// mucho 30
export function unirLineas(lineas) {
  const porClave = new Map();
  for (const linea of lineas) {
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

// Las líneas válidas de lo guardado en el navegador: lo que no tiene la forma
// esperada se descarta
export function limpiarLineas(datos) {
  if (!Array.isArray(datos)) return [];
  return unirLineas(datos.map(limpiarLinea).filter(Boolean));
}
