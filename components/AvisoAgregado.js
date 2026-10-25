"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./AvisoAgregado.module.css";

// Inspirado en Kinetics (kinetics.colorion.co) por Csaba Kissi:
// https://kinetics.colorion.co/effects/toast-overshoot/
const DURACION_MS = 2200;

// Si se ve el aviso y cómo mostrarlo: cada agregado lo muestra (o lo deja a la
// vista) y vuelve a contar los 2,2 s hasta que se va
export function useAvisoAgregado() {
  const [visible, setVisible] = useState(false);
  const temporizador = useRef(0);

  useEffect(() => () => clearTimeout(temporizador.current), []);

  function mostrar() {
    clearTimeout(temporizador.current);
    setVisible(true);
    temporizador.current = setTimeout(() => setVisible(false), DURACION_MS);
  }

  return [visible, mostrar];
}

// «Agregado al carrito»: una píldora negra que sube desde abajo, se pasa un
// poco y se acomoda. Es solo visual; lo anuncia un status aparte, que se vacía
// cuando el aviso se va (así el próximo agregado se vuelve a anunciar).
export default function AvisoAgregado({ visible }) {
  return (
    <>
      <p className={styles.aviso} data-visible={visible || undefined} aria-hidden="true">
        <span className={styles.punto} />
        Agregado al carrito
      </p>
      <p className="solo-lectores" role="status">
        {visible ? "Agregado al carrito." : ""}
      </p>
    </>
  );
}
