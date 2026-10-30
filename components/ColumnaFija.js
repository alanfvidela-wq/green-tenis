"use client";

import { useEffect, useRef } from "react";
import styles from "./ColumnaFija.module.css";

const AIRE_PX = 20;

// Una columna de la página de producto que acompaña el scroll en escritorio
// (sticky). Si entra en la pantalla, queda pegada arriba, debajo del header;
// si es más alta, se pega por abajo cuando se termina de ver, así nunca queda
// una parte escondida. La usa el panel, y acompaña cuando es más corto que la
// galería (si es más alto, ocupa toda la fila y no tiene dónde moverse). La
// galería no: cuando el acordeón alargaba el panel, se destrababa del final
// de la fila y saltaba.
export default function ColumnaFija({ className = "", children }) {
  const ref = useRef(null);

  useEffect(() => {
    const columna = ref.current;
    const medir = () => {
      const header = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--alto-header")) || 0;
      const arriba = header + AIRE_PX;
      const tope = Math.min(arriba, window.innerHeight - columna.offsetHeight - AIRE_PX);
      columna.style.setProperty("--tope", `${tope}px`);
    };
    medir();
    const observador = new ResizeObserver(medir);
    observador.observe(columna);
    window.addEventListener("resize", medir);
    return () => {
      observador.disconnect();
      window.removeEventListener("resize", medir);
    };
  }, []);

  return (
    <div ref={ref} className={`${styles.columna} ${className}`}>
      {children}
    </div>
  );
}
