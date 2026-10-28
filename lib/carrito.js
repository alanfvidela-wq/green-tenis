"use server";

import { claveEleccion, getCombosPorId } from "./combos";
import { Lineas } from "./esquemas";
import { formatearKg } from "./formato";
import { claveDe } from "./lineas";
import { getReglasEncordado, getVariantesPorId } from "./productos";

// Lo que dice una línea cuando no alcanza el stock de una de sus variantes
function faltaStock(stock, deQue) {
  const texto = stock === 0 ? "Sin stock" : stock === 1 ? "Queda 1" : `Quedan ${stock}`;
  return deQue ? `${texto} de ${deQue}` : texto;
}

// Cotiza el carrito del navegador con los datos de Supabase: precios,
// descuentos de combos (la misma cuenta que crear_pedido) y stock. Recibe solo
// ids y cantidades (ver lib/lineas.js) y no confía en nada de lo que llega:
// pasa por el esquema Lineas. El navegador manda siempre líneas limpias, así
// que si no pasan es un pedido armado a mano, y falla.
export async function cotizarCarrito(entrada) {
  const validadas = Lineas.safeParse(entrada);
  if (!validadas.success) throw new Error("El carrito no tiene el formato esperado.");
  const lineas = validadas.data;
  const productos = lineas.filter((l) => l.tipo === "producto");

  const [variantes, combos] = await Promise.all([
    getVariantesPorId([
      ...productos.map((l) => l.varianteId),
      ...productos.filter((l) => l.encordado).map((l) => l.encordado.cuerdaId),
    ]),
    getCombosPorId(lineas.filter((l) => l.tipo === "combo").map((l) => l.comboId)),
  ]);
  const variantePorId = new Map(variantes.map((v) => [v.id, v]));
  const comboPorId = new Map(combos.map((c) => [c.id, c]));

  // Las reglas del encordado, solo si alguna raqueta lo lleva
  const raquetasEncordadas = productos
    .filter((l) => l.encordado && variantePorId.get(l.varianteId)?.producto.tipo === "raqueta")
    .map((l) => variantePorId.get(l.varianteId).producto.id);
  const reglas = raquetasEncordadas.length > 0 ? await getReglasEncordado(raquetasEncordadas) : null;

  // Cuánto se pide de cada variante, sumando sueltos y combos, y su stock
  const demanda = new Map();
  const sumar = (variante, cantidad) => {
    const anterior = demanda.get(variante.id);
    demanda.set(variante.id, { stock: variante.stock, cantidad: (anterior?.cantidad ?? 0) + cantidad });
  };

  // Una raqueta encordada: cada unidad suma un set de 12 m de la cuerda y el
  // servicio. La cuerda tiene que ser un set compatible con la raqueta y la
  // tensión, entrar en su rango (lo mismo revisa crear_pedido, salvo la
  // compatibilidad, que es de la tienda).
  function cotizarEncordada(lineaProducto, linea, raqueta) {
    const cuerda = variantePorId.get(linea.encordado.cuerdaId);
    const regla = reglas?.raquetas.get(raqueta.producto.id);
    const [minima, maxima] = regla?.tensionKg ?? [];
    const { tensionKg } = linea.encordado;
    if (
      !reglas?.servicio ||
      !regla ||
      !cuerda ||
      cuerda.largoM !== 12 ||
      !regla.cuerdas.has(cuerda.producto.id) ||
      tensionKg < minima ||
      tensionKg > maxima
    ) {
      return { ...lineaProducto, problema: "Revisá el encordado: elegí la cuerda y la tensión de nuevo" };
    }

    sumar(raqueta, linea.cantidad);
    sumar(cuerda, linea.cantidad);
    const precio = raqueta.precio + cuerda.precio + reglas.servicio.precio;
    const maximo = Math.min(raqueta.stock ?? Infinity, cuerda.stock ?? Infinity);
    const deQue = (variante) => `${variante.producto.marca} ${variante.producto.nombre} (${variante.nombre})`;
    return {
      ...lineaProducto,
      detalle: [
        raqueta.nombre,
        `Encordada con ${cuerda.producto.marca} ${cuerda.producto.nombre} a ${formatearKg(tensionKg)}`,
      ],
      precioUnitario: precio,
      lista: precio * linea.cantidad,
      descuento: 0,
      subtotal: precio * linea.cantidad,
      maximo: maximo === Infinity ? undefined : maximo,
      usa: [
        { id: raqueta.id, deQue: deQue(raqueta) },
        { id: cuerda.id, deQue: deQue(cuerda) },
      ],
    };
  }

  const cotizadas = lineas.map((linea) => {
    const base = { clave: claveDe(linea), tipo: linea.tipo, cantidad: linea.cantidad };

    if (linea.tipo === "producto") {
      const variante = variantePorId.get(linea.varianteId);
      if (!variante) return { ...base, problema: "Ya no está a la venta" };
      const { producto } = variante;
      const lineaProducto = {
        ...base,
        nombre: producto.nombre,
        marca: producto.marca,
        detalle: [variante.nombre],
        href: `/producto/${producto.slug}`,
        foto: producto.fotos[0] ?? null,
        categoria: producto.categoria,
      };
      if (linea.encordado) return cotizarEncordada(lineaProducto, linea, variante);

      sumar(variante, linea.cantidad);
      return {
        ...lineaProducto,
        precioUnitario: variante.precio,
        lista: variante.precio * linea.cantidad,
        descuento: 0,
        subtotal: variante.precio * linea.cantidad,
        maximo: variante.stock ?? undefined,
        usa: [{ id: variante.id, deQue: null }],
      };
    }

    const combo = comboPorId.get(linea.comboId);
    if (!combo) return { ...base, problema: "Ya no está a la venta" };
    const elegidas = combo.items.map((item) =>
      item.elige
        ? item.variantes.find((v) => v.id === linea.elecciones[item.id])
        : item.variantes[0],
    );
    const lineaCombo = {
      ...base,
      nombre: combo.nombre,
      marca: "Combo",
      href: `/combo/${combo.slug}`,
      foto: combo.fotos[0] ?? combo.items[0].producto.fotos[0] ?? null,
      categoria: combo.items[0].producto.categoria,
    };
    if (elegidas.includes(undefined)) {
      return { ...lineaCombo, detalle: [], problema: "Falta elegir una opción" };
    }

    combo.items.forEach((item, i) => sumar(elegidas[i], item.cantidad * linea.cantidad));
    const precio = combo.precios[claveEleccion(combo.items, linea.elecciones)];
    const porItem = combo.items.map((item, i) =>
      elegidas[i].stock === null ? Infinity : Math.floor(elegidas[i].stock / item.cantidad),
    );
    const maximo = Math.min(...porItem);
    return {
      ...lineaCombo,
      detalle: combo.items.map(
        (item, i) => `${item.cantidad} × ${item.producto.marca} ${item.producto.nombre}, ${elegidas[i].nombre}`,
      ),
      precioUnitario: precio.precio,
      lista: precio.lista * linea.cantidad,
      descuento: precio.descuento * linea.cantidad,
      subtotal: precio.precio * linea.cantidad,
      maximo: maximo === Infinity ? undefined : maximo,
      usa: combo.items.map((item, i) => ({
        id: elegidas[i].id,
        deQue: `${item.producto.marca} ${item.producto.nombre} (${elegidas[i].nombre})`,
      })),
    };
  });

  // Con todo sumado, cada línea que usa una variante que no alcanza lo avisa
  const resultado = cotizadas.map(({ usa, ...linea }) => {
    if (linea.problema || !usa) return linea;
    const corta = usa.find(({ id }) => {
      const { stock, cantidad } = demanda.get(id);
      return stock !== null && cantidad > stock;
    });
    if (!corta) return linea;
    return { ...linea, problema: faltaStock(demanda.get(corta.id).stock, corta.deQue) };
  });

  const conPrecio = resultado.filter((l) => l.subtotal !== undefined);
  const lista = conPrecio.reduce((suma, l) => suma + l.lista, 0);
  const descuento = conPrecio.reduce((suma, l) => suma + l.descuento, 0);

  return {
    lineas: resultado,
    lista,
    descuento,
    total: lista - descuento,
    puedeComprar: resultado.length > 0 && resultado.every((l) => !l.problema),
  };
}
