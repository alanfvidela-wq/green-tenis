"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useCarrito } from "@/hooks/useCarrito";
import { contar } from "@/lib/formato";
import styles from "./BotonCarrito.module.css";

// Inspirado en Kinetics (kinetics.colorion.co) por Csaba Kissi:
// https://kinetics.colorion.co/effects/badge-counter/
const POP_MS = 320;

// «Carrito» del header, con la cantidad en una insignia en la esquina. La
// cantidad sale del carrito guardado en el navegador; hasta leerlo, dice solo
// «Carrito». Cuando sube (se agregó algo), la insignia salta con un resorte.
export default function BotonCarrito({ className }) {
  const { cantidadTotal, cargado } = useCarrito();
  const insignia = useRef(null);
  const anterior = useRef(null);

  useEffect(() => {
    const previa = anterior.current;
    anterior.current = cargado ? cantidadTotal : null;
    const elemento = insignia.current;
    if (!elemento || previa === null || cantidadTotal <= previa) return;
    // Se saca y se vuelve a poner con un reflow en el medio: cada agregado salta
    elemento.classList.remove(styles.pop);
    void elemento.offsetWidth;
    elemento.classList.add(styles.pop);
    const temporizador = setTimeout(() => elemento.classList.remove(styles.pop), POP_MS);
    return () => clearTimeout(temporizador);
  }, [cantidadTotal, cargado]);

  return (
    <Link
      href="/carrito"
      className={`${className} ${styles.boton}`}
      aria-label={cargado ? `Carrito, ${contar(cantidadTotal, "producto", "productos")}` : "Carrito"}
    >
      Carrito
      {cargado && (
        <span ref={insignia} className={styles.insignia} aria-hidden="true">
          {cantidadTotal}
        </span>
      )}
    </Link>
  );
}
