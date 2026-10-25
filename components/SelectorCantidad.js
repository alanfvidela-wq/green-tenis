"use client";

import { useEffect, useRef } from "react";
import styles from "./SelectorCantidad.module.css";

// La cantidad en una píldora: − n +. Al cambiar, el número rebota con un
// resorte y el botón apretado se hunde un poco.
// Inspirado en Kinetics (kinetics.colorion.co) por Csaba Kissi:
// https://kinetics.colorion.co/effects/quantity-stepper/
const REBOTE_MS = 350;

export default function SelectorCantidad({ valor, maximo, onCambiar, deshabilitado = false }) {
  const numero = useRef(null);
  const temporizador = useRef(0);

  useEffect(() => () => clearTimeout(temporizador.current), []);

  function cambiar(nuevo) {
    onCambiar(nuevo);
    // La clase se saca y se vuelve a poner (con un reflow en el medio) para
    // que cada clic rebote aunque el anterior no haya terminado
    const elemento = numero.current;
    elemento.classList.remove(styles.rebote);
    void elemento.offsetWidth;
    elemento.classList.add(styles.rebote);
    clearTimeout(temporizador.current);
    temporizador.current = setTimeout(() => elemento.classList.remove(styles.rebote), REBOTE_MS);
  }

  return (
    <div className={styles.cantidad}>
      <button
        type="button"
        aria-label="Uno menos"
        disabled={deshabilitado || valor <= 1}
        onClick={() => cambiar(valor - 1)}
      >
        −
      </button>
      <span
        ref={numero}
        className={styles.numero}
        aria-live="polite"
        aria-label={`Cantidad: ${valor}`}
      >
        {valor}
      </span>
      <button
        type="button"
        aria-label="Uno más"
        disabled={deshabilitado || valor >= maximo}
        onClick={() => cambiar(valor + 1)}
      >
        +
      </button>
    </div>
  );
}
