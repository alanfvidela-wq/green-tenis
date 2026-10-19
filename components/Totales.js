import { formatearPrecio } from "@/lib/formato";
import styles from "./Carrito.module.css";

// Subtotal, descuento de combos, envío y total, en filas de 1px. Sirve para
// la cotización del carrito y para un pedido ya hecho (con `envio`). Mientras
// se recalcula (`alDia` en false) se ve apagado.
export default function Totales({ lista, descuento, envio = 0, total, alDia = true }) {
  return (
    <dl className={`${styles.totales} ${alDia ? "" : styles.viejo}`}>
      <div className={styles.fila}>
        <dt>Subtotal</dt>
        <dd>{formatearPrecio(lista)}</dd>
      </div>
      {descuento > 0 && (
        <div className={styles.fila}>
          <dt>Descuento de combos</dt>
          <dd>−{formatearPrecio(descuento)}</dd>
        </div>
      )}
      <div className={styles.fila}>
        <dt>Envío</dt>
        <dd>{envio > 0 ? formatearPrecio(envio) : "Gratis"}</dd>
      </div>
      <div className={`${styles.fila} ${styles.total}`}>
        <dt>Total</dt>
        <dd>{formatearPrecio(total)}</dd>
      </div>
    </dl>
  );
}
