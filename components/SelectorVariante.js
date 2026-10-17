"use client";

import Link from "next/link";
import { useState } from "react";
import { useCarrito } from "@/hooks/useCarrito";
import { formatearPrecio } from "@/lib/formato";
import OpcionesVariante, { alcanza } from "./OpcionesVariante";
import styles from "./SelectorVariante.module.css";

// El precio y las opciones de un producto. Con `elegir` (lo que hay que
// elegir, como «grip y peso» en las raquetas) no hay nada elegido de entrada:
// hasta que el cliente elige se ve el precio «desde» y no se puede agregar.
// Sin `elegir`, arranca con la primera opción con stock.
export default function SelectorVariante({
  variantes,
  elegir = null,
  precioBase,
  preciosDistintos = false,
}) {
  const { agregarProducto } = useCarrito();
  const primeraConStock = variantes.find((v) => alcanza(v));
  const [seleccionadaId, setSeleccionadaId] = useState(
    elegir ? null : (primeraConStock?.id ?? null),
  );
  const [agregado, setAgregado] = useState(false);
  const seleccionada = variantes.find((v) => v.id === seleccionadaId) ?? null;
  const agotado = !primeraConStock;

  let leyenda = variantes.length > 1 ? "Elegí una opción" : "Presentación";
  if (elegir) leyenda = `Elegí ${elegir}`;

  let nota = null;
  if (agotado) nota = null;
  else if (!seleccionada) nota = `Falta elegir ${elegir ?? "una opción"}.`;
  else if (agregado) {
    nota = (
      <>
        Agregado al carrito. <Link href="/carrito">Ver carrito</Link>
      </>
    );
  }

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
        onElegir={(id) => {
          setSeleccionadaId(id);
          setAgregado(false);
        }}
      />

      <button
        type="button"
        className={`boton ${styles.agregar}`}
        disabled={!seleccionada || !alcanza(seleccionada)}
        onClick={() => {
          agregarProducto(seleccionada.id);
          setAgregado(true);
        }}
      >
        {agotado ? "Sin stock" : "Agregar al carrito"}
      </button>
      {nota && (
        <p className={styles.nota} role="status">
          {nota}
        </p>
      )}
    </div>
  );
}
