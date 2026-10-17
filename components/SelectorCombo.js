"use client";

import { useState } from "react";
import { formatearPrecio } from "@/lib/formato";
import OpcionesVariante, { alcanza } from "./OpcionesVariante";
import base from "./SelectorVariante.module.css";
import styles from "./SelectorCombo.module.css";

// El precio y las opciones de un combo. Los precios llegan calculados del
// servidor para cada combinación de opciones (ver lib/combos.js): acá solo se
// elige cuál mostrar. Los ítems fijos no tienen nada para elegir.
export default function SelectorCombo({ items, precios, descuentoPct }) {
  const aElegir = items.filter((item) => item.elige);
  const [elegidas, setElegidas] = useState(() =>
    Object.fromEntries(
      aElegir.map((item) => [
        item.id,
        (item.variantes.find((v) => alcanza(v, item.cantidad)) ?? item.variantes[0]).id,
      ]),
    ),
  );
  const { lista, descuento, precio } =
    precios[aElegir.map((item) => elegidas[item.id]).join(",")];
  const agotado = items.some(
    (item) => !item.variantes.some((v) => alcanza(v, item.cantidad)),
  );

  return (
    <div className={base.selector}>
      <div className={styles.precios}>
        <p className={base.precio}>{formatearPrecio(precio)}</p>
        <p className={styles.ahorro}>
          Por separado, <span className={styles.monto}>{formatearPrecio(lista)}</span>:
          ahorrás <span className={styles.monto}>{formatearPrecio(descuento)}</span> (
          {descuentoPct} %).
        </p>
      </div>

      {aElegir.map((item) => (
        <OpcionesVariante
          key={item.id}
          leyenda={`${item.producto.marca} ${item.producto.nombre}`}
          variantes={item.variantes}
          cantidad={item.cantidad}
          elegidaId={elegidas[item.id]}
          onElegir={(id) => setElegidas((actuales) => ({ ...actuales, [item.id]: id }))}
        />
      ))}

      <button type="button" className={`boton ${base.agregar}`} disabled>
        {agotado ? "Sin stock" : "Agregar al carrito"}
      </button>
      {!agotado && <p className={base.nota}>El carrito llega pronto.</p>}
    </div>
  );
}
