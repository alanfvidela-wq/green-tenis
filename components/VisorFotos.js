"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import styles from "./VisorFotos.module.css";

function Flecha({ izquierda }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      {izquierda ? <path d="M15 5l-7 7 7 7" /> : <path d="M9 5l7 7-7 7" />}
    </svg>
  );
}

// Las fotos de la galería en grande (ver «La galería del producto» en
// DESIGN.md): un <dialog> modal a pantalla completa sobre estudio, con una
// foto por vez. Se pasa de una a otra con las flechas (de la pantalla o del
// teclado) o deslizando, y se cierra con la cruz o con Escape. Se monta al
// abrir, en la foto `inicio`; al cerrar, `alCerrar` recibe la última que se
// vio.
export default function VisorFotos({ fotos, alts, titulo, inicio, alCerrar }) {
  const dialogo = useRef(null);
  const pista = useRef(null);
  const [actual, setActual] = useState(inicio);
  const total = fotos.length;

  // Abre el modal ya parado en la foto que se tocó
  useEffect(() => {
    if (!dialogo.current.open) dialogo.current.showModal();
    const elemento = pista.current;
    elemento.scrollTo({ left: inicio * elemento.clientWidth, behavior: "instant" });
  }, [inicio]);

  // La foto que se ve: la más cercana al borde izquierdo de la pista
  useEffect(() => {
    const elemento = pista.current;
    let cuadro = 0;
    const alDeslizar = () => {
      cancelAnimationFrame(cuadro);
      cuadro = requestAnimationFrame(() => {
        const indice = Math.round(elemento.scrollLeft / (elemento.clientWidth || 1));
        setActual(Math.min(total - 1, Math.max(0, indice)));
      });
    };
    elemento.addEventListener("scroll", alDeslizar, { passive: true });
    return () => {
      cancelAnimationFrame(cuadro);
      elemento.removeEventListener("scroll", alDeslizar);
    };
  }, [total]);

  // De la última se pasa a la primera y al revés
  const ir = (paso) => {
    const elemento = pista.current;
    const destino = (actual + paso + total) % total;
    const quieto = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    elemento.scrollTo({ left: destino * elemento.clientWidth, behavior: quieto ? "instant" : "smooth" });
  };

  const alTeclear = (evento) => {
    if (total < 2 || (evento.key !== "ArrowLeft" && evento.key !== "ArrowRight")) return;
    evento.preventDefault();
    ir(evento.key === "ArrowLeft" ? -1 : 1);
  };

  return (
    <dialog
      ref={dialogo}
      className={styles.visor}
      aria-labelledby="titulo-visor"
      onKeyDown={alTeclear}
      onClose={() => alCerrar(actual)}
    >
      <div className={styles.arriba}>
        <p id="titulo-visor" className={styles.titulo}>
          {titulo}
        </p>
        <button type="button" className={styles.boton} aria-label="Cerrar" onClick={() => dialogo.current.close()}>
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>

      <ul ref={pista} className={styles.pista} aria-label={total > 1 ? `Fotos, ${total}` : undefined}>
        {fotos.map((foto, i) => (
          <li key={`${i}:${foto}`} className={styles.vista}>
            <div className={styles.marco}>
              <Image
                src={foto}
                alt={alts[i]}
                fill
                sizes="(max-width: 859px) 100vw, 80vh"
                loading="eager"
                fetchPriority={i === inicio ? "high" : undefined}
                className={styles.foto}
              />
            </div>
          </li>
        ))}
      </ul>

      {total > 1 && (
        <div className={styles.abajo}>
          <button
            type="button"
            className={`${styles.boton} ${styles.anterior}`}
            aria-label="Foto anterior"
            onClick={() => ir(-1)}
          >
            <Flecha izquierda />
          </button>
          <p className={styles.contador} aria-hidden="true">
            {actual + 1} / {total}
          </p>
          <p className="solo-lectores" aria-live="polite">
            Foto {actual + 1} de {total}
          </p>
          <button
            type="button"
            className={`${styles.boton} ${styles.siguiente}`}
            aria-label="Foto siguiente"
            onClick={() => ir(1)}
          >
            <Flecha />
          </button>
        </div>
      )}
    </dialog>
  );
}
