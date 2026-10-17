"use client";

import { useState } from "react";
import { formatearPrecio } from "@/lib/formato";
import OpcionesVariante, { alcanza } from "./OpcionesVariante";
import styles from "./SelectorVariante.module.css";

export default function SelectorVariante({ variantes }) {
  const primeraConStock = variantes.find((v) => alcanza(v));
  const [seleccionadaId, setSeleccionadaId] = useState(
    primeraConStock?.id ?? null,
  );
  const seleccionada =
    variantes.find((v) => v.id === seleccionadaId) ?? variantes[0];
  const agotado = !primeraConStock;

  return (
    <div className={styles.selector}>
      <p className={styles.precio}>{formatearPrecio(seleccionada.precio)}</p>

      <OpcionesVariante
        leyenda={variantes.length > 1 ? "Elegí una opción" : "Presentación"}
        variantes={variantes}
        elegidaId={seleccionadaId}
        onElegir={setSeleccionadaId}
      />

      <button type="button" className={`boton ${styles.agregar}`} disabled>
        {agotado ? "Sin stock" : "Agregar al carrito"}
      </button>
      {!agotado && <p className={styles.nota}>El carrito llega pronto.</p>}
    </div>
  );
}
