"use client";

import { useEffect, useRef, useState } from "react";
import FotoVitrina from "./FotoVitrina";
import VisorFotos from "./VisorFotos";
import styles from "./GaleriaFicha.module.css";

// Cuántas fotos se ven en escritorio antes de «Ver todas»
const VISIBLES = 4;

// La galería de la página de producto (ver «La galería del producto» en
// DESIGN.md). En escritorio, una grilla de dos columnas: la primera foto a lo
// ancho si es la única o si son tres, y como mucho cuatro hasta «Ver todas».
// En mobile, un carrusel que se desliza de a una foto, con los puntos que
// dicen en cuál se está. Tocando una foto se abre en grande (VisorFotos), y
// ahí se pasa de una a otra. Sin fotos, la silueta de la categoría.
export default function GaleriaFicha({ producto }) {
  const fotos = producto.fotos?.length ? producto.fotos : [null];
  const total = fotos.length;
  const [todas, setTodas] = useState(false);
  const [actual, setActual] = useState(0);
  const [visor, setVisor] = useState(null);
  const lista = useRef(null);

  // La foto que se ve en el carrusel: la más cercana al borde izquierdo
  useEffect(() => {
    const elemento = lista.current;
    if (total < 2) return;
    let cuadro = 0;
    const alDeslizar = () => {
      cancelAnimationFrame(cuadro);
      cuadro = requestAnimationFrame(() => {
        const ancho = elemento.firstElementChild?.getBoundingClientRect().width || 1;
        setActual(Math.min(total - 1, Math.max(0, Math.round(elemento.scrollLeft / ancho))));
      });
    };
    elemento.addEventListener("scroll", alDeslizar, { passive: true });
    return () => {
      cancelAnimationFrame(cuadro);
      elemento.removeEventListener("scroll", alDeslizar);
    };
  }, [total]);

  const alt = (i) =>
    i === 0 ? `${producto.marca} ${producto.nombre}` : `${producto.marca} ${producto.nombre}, vista ${i + 1}`;

  // Al cerrar el visor, el carrusel queda en la última foto que se vio y el
  // foco vuelve a esa foto (si está a la vista: en escritorio, las de más de
  // cuatro esperan a «Ver todas»)
  const alCerrar = (ultima) => {
    setVisor(null);
    const elemento = lista.current;
    const vista = elemento.children[ultima];
    const paso = vista.getBoundingClientRect().width + parseFloat(getComputedStyle(elemento).columnGap || 0);
    elemento.scrollTo({ left: ultima * paso, behavior: "instant" });
    const boton = vista.querySelector("button");
    if (boton?.getClientRects().length) boton.focus({ preventScroll: true });
  };

  return (
    <div className={styles.galeria} data-fotos={total > 3 ? "muchas" : total} data-todas={todas || undefined}>
      <ul ref={lista} className={styles.vistas} aria-label={total > 1 ? `Fotos, ${total}` : undefined}>
        {fotos.map((foto, i) => (
          <li
            key={`${i}:${foto}`}
            className={styles.vista}
            data-extra={i >= VISIBLES || undefined}
            style={{ "--orden": i - VISIBLES }}
          >
            {foto ? (
              <button
                type="button"
                className={styles.marco}
                aria-haspopup="dialog"
                aria-label={`Ver en grande: ${alt(i)}`}
                onClick={() => setVisor(i)}
              >
                <FotoVitrina
                  foto={foto}
                  categoria={producto.categoria}
                  alt={alt(i)}
                  sizes={
                    total === 1 || (total === 3 && i === 0)
                      ? "(max-width: 859px) 100vw, 720px"
                      : "(max-width: 859px) 100vw, 360px"
                  }
                  prioridad={i === 0}
                />
              </button>
            ) : (
              <div className={styles.marco}>
                <FotoVitrina foto={null} categoria={producto.categoria} />
              </div>
            )}
          </li>
        ))}
      </ul>

      {total > 1 && (
        <div className={styles.puntos} aria-hidden="true">
          {fotos.map((foto, i) => (
            <span key={`${i}:${foto}`} className={styles.punto} data-actual={i === actual || undefined} />
          ))}
        </div>
      )}
      {total > 1 && (
        <p className="solo-lectores" aria-live="polite">
          Foto {actual + 1} de {total}
        </p>
      )}

      {total > VISIBLES && !todas && (
        <button type="button" className={`boton boton-secundario ${styles.verTodas}`} onClick={() => setTodas(true)}>
          Ver todas ({total})
        </button>
      )}

      {visor !== null && (
        <VisorFotos
          fotos={fotos}
          alts={fotos.map((_, i) => alt(i))}
          titulo={`${producto.marca} ${producto.nombre}`}
          inicio={visor}
          alCerrar={alCerrar}
        />
      )}
    </div>
  );
}
