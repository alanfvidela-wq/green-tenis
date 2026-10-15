"use client";

import { useState } from "react";
import { formatearPrecio } from "@/lib/formato";
import styles from "./SelectorVariante.module.css";

function textoStock(stock) {
  if (stock === 0) return "Sin stock";
  if (stock <= 3) return `¡Quedan ${stock}!`;
  return "En stock";
}

export default function SelectorVariante({ variantes }) {
  const primeraConStock = variantes.find((v) => v.stock > 0);
  const [seleccionadaId, setSeleccionadaId] = useState(
    primeraConStock?.id ?? null,
  );
  const seleccionada =
    variantes.find((v) => v.id === seleccionadaId) ?? variantes[0];
  const agotado = !primeraConStock;

  return (
    <div className={styles.selector}>
      <p className={styles.precio}>{formatearPrecio(seleccionada.precio)}</p>

      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>
          {variantes.length > 1 ? "Elegí una opción" : "Presentación"}
        </legend>
        <div className={styles.opciones}>
          {variantes.map((variante) => {
            const sinStock = variante.stock === 0;
            const activa = variante.id === seleccionadaId;
            return (
              <button
                key={variante.id}
                type="button"
                className={`${styles.opcion} ${activa ? styles.activa : ""}`}
                disabled={sinStock}
                aria-pressed={activa}
                onClick={() => setSeleccionadaId(variante.id)}
              >
                <span className={styles.opcionNombre}>{variante.nombre}</span>
                <span
                  className={`${styles.opcionStock} ${variante.stock > 0 && variante.stock <= 3 ? styles.pocas : ""}`}
                >
                  {textoStock(variante.stock)}
                </span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <button type="button" className={`boton ${styles.agregar}`} disabled>
        {agotado ? "Sin stock" : "Agregar al carrito"}
      </button>
      {!agotado && <p className={styles.nota}>El carrito llega pronto.</p>}
    </div>
  );
}
