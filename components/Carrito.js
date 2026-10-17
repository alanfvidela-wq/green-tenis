"use client";

import Link from "next/link";
import FotoVitrina from "./FotoVitrina";
import { useCarrito } from "@/hooks/useCarrito";
import { useCotizacion } from "@/hooks/useCotizacion";
import { formatearPrecio } from "@/lib/formato";
import { MAX_CANTIDAD, claveDe } from "@/lib/lineas";
import styles from "./Carrito.module.css";

// Una línea del carrito. Lo que muestra (nombre, precios, problemas) viene de
// la cotización del servidor; de acá salen solo la cantidad y la clave.
function Linea({ linea, cotizada, onCantidad, onQuitar }) {
  const maximo = Math.min(MAX_CANTIDAD, cotizada?.maximo ?? MAX_CANTIDAD);
  const conPrecio = cotizada?.subtotal !== undefined;

  let titulo = "Calculando…";
  if (cotizada?.nombre) {
    titulo = (
      <Link href={cotizada.href} className={styles.nombre}>
        {cotizada.nombre}
      </Link>
    );
  } else if (cotizada) {
    titulo = "Un producto que ya no está a la venta";
  }

  return (
    <li className={styles.linea}>
      <div className={styles.foto}>
        <FotoVitrina
          foto={cotizada?.foto}
          categoria={cotizada?.categoria ?? "raquetas"}
          alt={cotizada?.nombre ?? ""}
          sizes="96px"
        />
      </div>

      <div className={styles.info}>
        {cotizada?.marca && <p className={styles.marca}>{cotizada.marca}</p>}
        <h3 className={styles.titulo}>{titulo}</h3>
        {cotizada?.detalle?.map((texto) => (
          <p key={texto} className={styles.detalle}>
            {texto}
          </p>
        ))}
        {cotizada?.problema && <p className={styles.problema}>{cotizada.problema}</p>}
      </div>

      <div className={styles.acciones}>
        <div className={styles.cantidad}>
          <button
            type="button"
            aria-label="Uno menos"
            disabled={linea.cantidad <= 1}
            onClick={() => onCantidad(linea.cantidad - 1)}
          >
            −
          </button>
          <span aria-live="polite" aria-label={`Cantidad: ${linea.cantidad}`}>
            {linea.cantidad}
          </span>
          <button
            type="button"
            aria-label="Uno más"
            disabled={linea.cantidad >= maximo}
            onClick={() => onCantidad(linea.cantidad + 1)}
          >
            +
          </button>
        </div>
        <button type="button" className={styles.quitar} onClick={onQuitar}>
          Quitar
        </button>
      </div>

      <div className={styles.precio}>
        {conPrecio && <p>{formatearPrecio(cotizada.subtotal)}</p>}
        {conPrecio && cotizada.descuento > 0 && (
          <p className={styles.ahorro}>ahorrás {formatearPrecio(cotizada.descuento)}</p>
        )}
      </div>
    </li>
  );
}

// El carrito: las líneas del navegador, cotizadas en el servidor, y el
// resumen con el total y «Ir a pagar»
export default function Carrito() {
  const { lineas, cargado, cambiarCantidad, quitar } = useCarrito();
  const { cotizacion, calculando, alDia, error } = useCotizacion();

  if (!cargado) return <p className={styles.estado}>Cargando…</p>;

  if (lineas.length === 0) {
    return (
      <div className={styles.vacio}>
        <p className={styles.estado}>Tu carrito está vacío.</p>
        <Link href="/categoria/raquetas" className="boton">
          Ver raquetas
        </Link>
      </div>
    );
  }

  const porClave = new Map((cotizacion?.lineas ?? []).map((l) => [l.clave, l]));
  const puedePagar = alDia && cotizacion.puedeComprar;

  let nota = null;
  if (error) nota = "No se pudo calcular el carrito. Probá de nuevo en un rato.";
  else if (!alDia) nota = "Calculando…";
  else if (!cotizacion.puedeComprar) nota = "Revisá las líneas marcadas para seguir.";

  return (
    <div className={styles.carrito}>
      <ul className={styles.lineas} aria-busy={calculando}>
        {lineas.map((linea) => {
          const clave = claveDe(linea);
          return (
            <Linea
              key={clave}
              linea={linea}
              cotizada={porClave.get(clave)}
              onCantidad={(cantidad) => cambiarCantidad(clave, cantidad)}
              onQuitar={() => quitar(clave)}
            />
          );
        })}
      </ul>

      <section className={styles.resumen} aria-labelledby="titulo-resumen">
        <h2 id="titulo-resumen" className={styles.resumenTitulo}>
          Resumen
        </h2>
        {cotizacion && (
          <dl className={alDia ? undefined : styles.viejo}>
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
        )}
        {puedePagar ? (
          <Link href="/checkout" className={`boton ${styles.pagar}`}>
            Ir a pagar
          </Link>
        ) : (
          <button type="button" className={`boton ${styles.pagar}`} disabled>
            Ir a pagar
          </button>
        )}
        {nota && <p className={styles.nota}>{nota}</p>}
      </section>
    </div>
  );
}
