import { expect, test } from "@playwright/test";
import { lineasDe } from "../lib/pedidos";

// lineasDe (lib/pedidos.js) arma las líneas de un pedido tal como las lee la
// base, y junta cada encordado con su raqueta. Es la misma para el detalle del
// pedido, el listado del admin y la preferencia de Mercado Pago. No necesita
// navegador ni base: las filas van armadas acá, con la forma que devuelve
// PostgREST (pedido_encordados es una fila o null: la clave es el servicio).

function item(id, { slug, marca, nombre, variante, precio, cantidad = 1, encordado = null }) {
  return {
    id,
    pedido_combo_id: null,
    producto_slug: slug,
    marca,
    producto_nombre: nombre,
    variante_nombre: variante,
    precio_unitario: precio,
    cantidad,
    subtotal: precio * cantidad,
    pedido_encordados: encordado,
  };
}

const raqueta = (id, cantidad = 1) =>
  item(id, { slug: "babolat-pure-drive", marca: "Babolat", nombre: "Pure Drive", variante: "Grip 2 / 300 g", precio: 389000, cantidad });
const cuerda = (id, cantidad = 1) =>
  item(id, { slug: "babolat-rpm-blast-125", marca: "Babolat", nombre: "RPM Blast 1.25", variante: "Set 12 m", precio: 34900, cantidad });
const servicio = (id, raquetaId, cuerdaId, tensionKg = 24) =>
  item(id, {
    slug: "encordado",
    marca: "green.",
    nombre: "Encordado",
    variante: "Encordado",
    precio: 15000,
    encordado: { raqueta_item_id: raquetaId, cuerda_item_id: cuerdaId, tension_kg: tensionKg },
  });
const pedido = (...items) => ({ pedido_combos: [], pedido_items: items });

test.describe("Líneas de un pedido (sin navegador)", () => {
  test("con dos raquetas, el encordado va con la que lo lleva", () => {
    const { sueltas } = lineasDe(pedido(raqueta("r1"), raqueta("r2"), cuerda("c1"), servicio("s1", "r1", "c1")));

    const aLaVista = sueltas.filter((linea) => !linea.encordaA);
    expect(aLaVista.map((linea) => linea.id)).toEqual(["r1", "r2"]);
    expect(aLaVista[0].encordado).toEqual({
      texto: "Encordada con Babolat RPM Blast 1.25 a 24 kg",
      total: 389000 + 34900 + 15000,
    });
    expect(aLaVista[1].encordado).toBeUndefined();
    // La cuerda y el servicio siguen en la lista (la API no cambia), con su raqueta
    expect(sueltas.find((linea) => linea.id === "c1").encordaA).toBe("r1");
    expect(sueltas.find((linea) => linea.id === "s1").encordaA).toBe("r1");
  });

  test("dos unidades encordadas suman las dos cuerdas y los dos servicios", () => {
    const { sueltas } = lineasDe(
      pedido(raqueta("r1", 2), cuerda("c1", 2), servicio("s1", "r1", "c1", 24.5), servicio("s2", "r1", "c1", 24.5)),
    );
    const [linea] = sueltas.filter((l) => !l.encordaA);
    expect(linea.encordado).toEqual({
      texto: "Encordada con Babolat RPM Blast 1.25 a 24,5 kg",
      total: 2 * (389000 + 34900 + 15000),
    });
  });

  test("un pedido sin encordado queda como antes", () => {
    const { sueltas } = lineasDe(pedido(raqueta("r1"), cuerda("c1")));
    expect(sueltas).toEqual([
      {
        id: "r1",
        slug: "babolat-pure-drive",
        href: "/producto/babolat-pure-drive",
        nombre: "Babolat Pure Drive",
        variante: "Grip 2 / 300 g",
        precioUnitario: 389000,
        cantidad: 1,
        subtotal: 389000,
      },
      {
        id: "c1",
        slug: "babolat-rpm-blast-125",
        href: "/producto/babolat-rpm-blast-125",
        nombre: "Babolat RPM Blast 1.25",
        variante: "Set 12 m",
        precioUnitario: 34900,
        cantidad: 1,
        subtotal: 34900,
      },
    ]);
  });

  test("un servicio sin su raqueta en la lista se muestra solo, con la tensión", () => {
    const { sueltas } = lineasDe(pedido(cuerda("c1"), servicio("s1", "r-que-no-esta", "c1")));
    const linea = sueltas.find((l) => l.id === "s1");
    expect(linea.variante).toBe("Tensión 24 kg");
    expect(linea.encordaA).toBeUndefined();
    expect(sueltas.find((l) => l.id === "c1").encordaA).toBeUndefined();
  });
});
