import { formatearPrecio } from "@/lib/formato";
import styles from "./Carrito.module.css";

// Subtotal, descuento de combos y total de una cotización, en filas de 1px.
// Mientras se recalcula (`alDia` en false) se ve apagado.
export default function Totales({ cotizacion, alDia = true }) {
  return (
    <dl className={`${styles.totales} ${alDia ? "" : styles.viejo}`}>
      <div className={styles.fila}>
        <dt>Subtotal</dt>
        <dd>{formatearPrecio(cotizacion.lista)}</dd>
      </div>
      {cotizacion.descuento > 0 && (
        <div className={styles.fila}>
          <dt>Descuento de combos</dt>
          <dd>−{formatearPrecio(cotizacion.descuento)}</dd>
        </div>
      )}
      <div className={`${styles.fila} ${styles.total}`}>
        <dt>Total</dt>
        <dd>{formatearPrecio(cotizacion.total)}</dd>
      </div>
    </dl>
  );
}
