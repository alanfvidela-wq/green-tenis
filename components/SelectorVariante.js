"use client";

import { useState } from "react";
import { useCarrito } from "@/hooks/useCarrito";
import { formatearPrecio } from "@/lib/formato";
import { MAX_CANTIDAD } from "@/lib/lineas";
import AvisoAgregado, { useAvisoAgregado } from "./AvisoAgregado";
import OpcionesVariante, { alcanza } from "./OpcionesVariante";
import SelectorCantidad from "./SelectorCantidad";
import styles from "./SelectorVariante.module.css";

// El precio y las opciones de un producto. Con `elegir` (lo que hay que
// elegir, como «grip y peso» en las raquetas) no hay nada elegido de entrada:
// hasta que el cliente elige se ve el precio «desde» y no se puede agregar.
// Sin `elegir`, arranca con la primera opción con stock. La cantidad va de 1
// al stock de la opción elegida; al agregar, sale el aviso «Agregado al
// carrito».
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
  const [cantidad, setCantidad] = useState(1);
  const [avisoVisible, mostrarAviso] = useAvisoAgregado();
  const seleccionada = variantes.find((v) => v.id === seleccionadaId) ?? null;
  const agotado = !primeraConStock;
  // Sin stock cargado (null) no hay tope; si se cambia a una opción con menos
  // stock, la cantidad baja hasta lo que hay
  const maximo = Math.min(MAX_CANTIDAD, seleccionada?.stock ?? MAX_CANTIDAD);
  const cantidadValida = Math.max(1, Math.min(cantidad, maximo));
  const sePuedeAgregar = Boolean(seleccionada) && alcanza(seleccionada, cantidadValida);

  let leyenda = variantes.length > 1 ? "Elegí una opción" : "Presentación";
  if (elegir) leyenda = `Elegí ${elegir}`;

  let nota = null;
  if (agotado) nota = null;
  else if (!seleccionada) nota = `Falta elegir ${elegir ?? "una opción"}.`;

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

      <div className={styles.compra}>
        {!agotado && (
          <SelectorCantidad
            valor={cantidadValida}
            maximo={maximo}
            onCambiar={setCantidad}
            deshabilitado={!sePuedeAgregar}
          />
        )}
        <button
          type="button"
          className={`boton ${styles.agregar}`}
          disabled={!sePuedeAgregar}
          onClick={() => {
            agregarProducto(seleccionada.id, cantidadValida);
            mostrarAviso();
          }}
        >
          {agotado ? "Sin stock" : "Agregar al carrito"}
        </button>
      </div>
      {nota && (
        <p className={styles.nota} role="status">
          {nota}
        </p>
      )}
      <AvisoAgregado visible={avisoVisible} />
    </div>
  );
}
