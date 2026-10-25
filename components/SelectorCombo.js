"use client";

import { useState } from "react";
import { useCarrito } from "@/hooks/useCarrito";
import { formatearPrecio } from "@/lib/formato";
import AvisoAgregado, { useAvisoAgregado } from "./AvisoAgregado";
import OpcionesVariante, { alcanza } from "./OpcionesVariante";
import base from "./SelectorVariante.module.css";
import styles from "./SelectorCombo.module.css";

const listaNombres = new Intl.ListFormat("es", { type: "conjunction" });

// El precio y las opciones de un combo. Los ítems a elegir arrancan sin nada
// elegido: hasta que se elige todo se ve el precio «desde» y no se puede
// agregar. Los precios llegan calculados del servidor para cada combinación
// de opciones (ver lib/combos.js): acá solo se elige cuál mostrar.
export default function SelectorCombo({
  comboId,
  items,
  precios,
  descuentoPct,
  precioDesde,
  preciosDistintos = false,
}) {
  const { agregarCombo } = useCarrito();
  const aElegir = items.filter((item) => item.elige);
  const [elegidas, setElegidas] = useState({});
  const [avisoVisible, mostrarAviso] = useAvisoAgregado();
  const faltan = aElegir.filter((item) => !elegidas[item.id]);
  const elegido =
    faltan.length === 0 ? precios[aElegir.map((item) => elegidas[item.id]).join(",")] : null;
  const agotado = items.some(
    (item) => !item.variantes.some((v) => alcanza(v, item.cantidad)),
  );

  let nota = null;
  if (agotado) nota = null;
  else if (faltan.length > 0) {
    nota = `Falta elegir: ${listaNombres.format(
      faltan.map((item) => `${item.producto.marca} ${item.producto.nombre}`),
    )}.`;
  }

  return (
    <div className={base.selector}>
      <div className={styles.precios}>
        <p className={base.precio}>
          {!elegido && preciosDistintos && <span className={base.desde}>desde </span>}
          {formatearPrecio(elegido ? elegido.precio : precioDesde)}
        </p>
        {elegido ? (
          <p className={styles.ahorro}>
            Por separado, <span className={styles.monto}>{formatearPrecio(elegido.lista)}</span>:
            ahorrás <span className={styles.monto}>{formatearPrecio(elegido.descuento)}</span> (
            {descuentoPct} %).
          </p>
        ) : (
          <p className={styles.ahorro}>{descuentoPct} % menos que por separado.</p>
        )}
      </div>

      {aElegir.map((item) => (
        <OpcionesVariante
          key={item.id}
          leyenda={`${item.producto.marca} ${item.producto.nombre}`}
          variantes={item.variantes}
          cantidad={item.cantidad}
          elegidaId={elegidas[item.id] ?? null}
          onElegir={(id) => setElegidas((actuales) => ({ ...actuales, [item.id]: id }))}
        />
      ))}

      <button
        type="button"
        className={`boton ${base.agregar}`}
        disabled={agotado || !elegido}
        onClick={() => {
          agregarCombo(comboId, elegidas);
          mostrarAviso();
        }}
      >
        {agotado ? "Sin stock" : "Agregar al carrito"}
      </button>
      {nota && (
        <p className={base.nota} role="status">
          {nota}
        </p>
      )}
      <AvisoAgregado visible={avisoVisible} />
    </div>
  );
}
