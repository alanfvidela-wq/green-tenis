"use client";

import Link from "next/link";
import FotoVitrina from "./FotoVitrina";
import SelectorCantidad from "./SelectorCantidad";
import Totales from "./Totales";
import { useCarrito } from "@/hooks/useCarrito";
import { useCotizacion } from "@/hooks/useCotizacion";
import { formatearPrecio } from "@/lib/formato";
import { MAX_CANTIDAD, claveDe } from "@/lib/lineas";
import styles from "./Carrito.module.css";

// Mientras llega la cotización, cada línea y el resumen muestran un esqueleto
// con el alto de lo que va a llegar (así nada salta en mobile); cuando llega,
// el esqueleto se apaga y el contenido sube 8px y aparece.
// Inspirado en Kinetics (kinetics.colorion.co) por Csaba Kissi:
// https://kinetics.colorion.co/effects/skeleton-to-content/
function Barra({ ancho }) {
  return <span className={styles.barra} style={{ "--ancho": ancho }} />;
}

// Un producto trae una línea de detalle (la opción), dos si va encordado; un
// combo, una por producto (el carrito no sabe cuántos son: se toman tres, como
// el kit)
function EsqueletoLinea({ linea, listo }) {
  const combo = linea.tipo === "combo";
  const detalles = combo ? 3 : linea.encordado ? 2 : 1;
  return (
    <div className={styles.esqueleto} data-listo={listo || undefined} aria-hidden="true">
      <p className={styles.marca}>
        <Barra ancho="5em" />
      </p>
      <p className={styles.titulo}>
        <Barra ancho="55%" />
      </p>
      {Array.from({ length: detalles }, (_, i) => (
        <p key={i} className={styles.detalle}>
          <Barra ancho={combo ? `${80 - i * 8}%` : "35%"} />
        </p>
      ))}
    </div>
  );
}

function EsqueletoPrecio({ tipo, listo }) {
  return (
    <div className={styles.esqueleto} data-listo={listo || undefined} aria-hidden="true">
      <p>
        <Barra ancho="6.5em" />
      </p>
      {tipo === "combo" && (
        <p className={styles.ahorro}>
          <Barra ancho="9em" />
        </p>
      )}
    </div>
  );
}

// Las filas del resumen: subtotal, descuento (si hay combos), envío y total
function EsqueletoTotales({ conDescuento, listo }) {
  const filas = ["Subtotal", conDescuento && "Descuento", "Envío"].filter(Boolean);
  return (
    <div className={styles.esqueleto} data-listo={listo || undefined} aria-hidden="true">
      <dl className={styles.totales}>
        {filas.map((fila) => (
          <div key={fila} className={styles.fila}>
            <dt>
              <Barra ancho="6em" />
            </dt>
            <dd>
              <Barra ancho="5em" />
            </dd>
          </div>
        ))}
        <div className={`${styles.fila} ${styles.total}`}>
          <dt>
            <Barra ancho="3em" />
          </dt>
          <dd>
            <Barra ancho="6em" />
          </dd>
        </div>
      </dl>
    </div>
  );
}

// Una línea del carrito. Lo que muestra (nombre, precios, problemas) viene de
// la cotización del servidor; de acá salen solo la cantidad y la clave.
function Linea({ linea, cotizada, listo, onCantidad, onQuitar }) {
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
        <span className={styles.esqueletoFoto} data-listo={listo || undefined} aria-hidden="true" />
      </div>

      <div className={`${styles.info} ${styles.capas}`}>
        <EsqueletoLinea linea={linea} listo={listo} />
        <div className={styles.real} data-listo={listo || undefined}>
          {cotizada?.marca && <p className={styles.marca}>{cotizada.marca}</p>}
          <h3 className={styles.titulo}>{titulo}</h3>
          {cotizada?.detalle?.map((texto) => (
            <p key={texto} className={styles.detalle}>
              {texto}
            </p>
          ))}
          {cotizada?.problema && <p className={styles.problema}>{cotizada.problema}</p>}
        </div>
      </div>

      <div className={styles.acciones}>
        <SelectorCantidad valor={linea.cantidad} maximo={maximo} onCambiar={onCantidad} />
        <button type="button" className={styles.quitar} onClick={onQuitar}>
          Quitar
        </button>
      </div>

      <div className={`${styles.precio} ${styles.capas}`}>
        <EsqueletoPrecio tipo={linea.tipo} listo={listo} />
        <div className={styles.real} data-listo={listo || undefined}>
          {conPrecio && <p>{formatearPrecio(cotizada.subtotal)}</p>}
          {conPrecio && cotizada.descuento > 0 && (
            <p className={styles.ahorro}>ahorrás {formatearPrecio(cotizada.descuento)}</p>
          )}
        </div>
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
              listo={porClave.has(clave) || error}
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
        <div className={styles.capas}>
          <EsqueletoTotales
            conDescuento={lineas.some((l) => l.tipo === "combo")}
            listo={Boolean(cotizacion) || error}
          />
          {cotizacion && (
            <div className={styles.entra}>
              <Totales
                lista={cotizacion.lista}
                descuento={cotizacion.descuento}
                total={cotizacion.total}
                alDia={alDia}
              />
            </div>
          )}
        </div>
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
