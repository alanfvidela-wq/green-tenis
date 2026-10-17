"use client";

import Link from "next/link";
import Totales from "./Totales";
import { useCarrito } from "@/hooks/useCarrito";
import { useCotizacion } from "@/hooks/useCotizacion";
import { formatearPrecio } from "@/lib/formato";
import base from "./Carrito.module.css";
import styles from "./Checkout.module.css";

// Lo que se compra, tal como lo cotiza el servidor: una fila por línea y los
// totales
function Resumen({ cotizacion, alDia }) {
  return (
    <section className={base.resumen} aria-labelledby="titulo-resumen">
      <h2 id="titulo-resumen" className={base.resumenTitulo}>
        Tu pedido
      </h2>
      {cotizacion ? (
        <>
          <ul className={styles.lineas}>
            {cotizacion.lineas.map((linea) => (
              <li key={linea.clave} className={styles.linea}>
                <div>
                  <p>
                    {linea.cantidad} × {linea.nombre ?? "Un producto que ya no está a la venta"}
                  </p>
                  {linea.detalle?.map((texto) => (
                    <p key={texto} className={styles.detalle}>
                      {texto}
                    </p>
                  ))}
                  {linea.problema && <p className={styles.problema}>{linea.problema}</p>}
                </div>
                {linea.subtotal !== undefined && (
                  <p className={styles.monto}>{formatearPrecio(linea.subtotal)}</p>
                )}
              </li>
            ))}
          </ul>
          <Totales cotizacion={cotizacion} alDia={alDia} />
        </>
      ) : (
        <p className={base.nota}>Calculando…</p>
      )}
      <Link href="/carrito" className={styles.editar}>
        Cambiar el carrito
      </Link>
    </section>
  );
}

// El checkout: quién compra y el resumen del pedido. La confirmación (los
// datos de envío y crear_pedido) llega en la próxima entrega.
export default function Checkout({ email }) {
  const { lineas, cargado } = useCarrito();
  const { cotizacion, alDia, error } = useCotizacion();

  if (!cargado) return <p className={base.estado}>Cargando…</p>;

  if (lineas.length === 0) {
    return (
      <div className={base.vacio}>
        <p className={base.estado}>Tu carrito está vacío.</p>
        <Link href="/categoria/raquetas" className="boton">
          Ver raquetas
        </Link>
      </div>
    );
  }

  return (
    <div className={base.carrito}>
      <section className={styles.datos}>
        <p className={styles.cuenta}>
          Comprás como <span className={styles.email}>{email}</span>
        </p>
        <button type="button" className="boton" disabled>
          Confirmar pedido
        </button>
        <p className={base.nota}>
          {error
            ? "No se pudo calcular el pedido. Probá de nuevo en un rato."
            : "Los datos de envío y la confirmación llegan en la próxima entrega."}
        </p>
      </section>

      <Resumen cotizacion={cotizacion} alDia={alDia} />
    </div>
  );
}
