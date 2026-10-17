"use client";

import { useState } from "react";
import { formatearPrecio } from "@/lib/formato";
import OpcionesVariante, { alcanza } from "./OpcionesVariante";
import styles from "./SelectorVariante.module.css";

// El precio y las opciones de un producto. Con `elegir` (lo que hay que
// elegir, como «grip y peso» en las raquetas) no hay nada elegido de entrada:
// hasta que el cliente elige se ve el precio «desde». Sin `elegir`, arranca
// con la primera opción con stock.
export default function SelectorVariante({
  variantes,
  elegir = null,
  precioBase,
  preciosDistintos = false,
}) {
  const primeraConStock = variantes.find((v) => alcanza(v));
  const [seleccionadaId, setSeleccionadaId] = useState(
    elegir ? null : (primeraConStock?.id ?? null),
  );
  const seleccionada = variantes.find((v) => v.id === seleccionadaId) ?? null;
  const agotado = !primeraConStock;

  let leyenda = variantes.length > 1 ? "Elegí una opción" : "Presentación";
  if (elegir) leyenda = `Elegí ${elegir}`;

  return (
    <div className={styles.selector}>
      <p className={styles.precio}>
        {!seleccionada && preciosDistintos && <span className={styles.desde}>desde </span>}
        {formatearPrecio(seleccionada ? seleccionada.precio : precioBase)}
      </p>

      <OpcionesVariante
        leyenda={leyenda}
        variantes={variantes}
        elegidaId={seleccionadaId}
        onElegir={setSeleccionadaId}
      />

      <button type="button" className={`boton ${styles.agregar}`} disabled>
        {agotado ? "Sin stock" : "Agregar al carrito"}
      </button>
      {!agotado && (
        <p className={styles.nota}>
          {seleccionada ? "El carrito llega pronto." : `Falta elegir ${elegir}.`}
        </p>
      )}
    </div>
  );
}
