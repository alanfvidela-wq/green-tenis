"use client";

import { useEffect, useRef } from "react";
import styles from "./Aparecer.module.css";

// Una aparición suave al entrar en pantalla (ver «Movimiento» en DESIGN.md):
// lo de adentro sube 24px y aparece, una sola vez. Lo que ya está a la vista al
// cargar no se esconde, y con prefers-reduced-motion (o sin JS) no pasa nada:
// se ve desde el principio. Solo transform y opacity.
export default function Aparecer({ className = "", children }) {
  const ref = useRef(null);

  useEffect(() => {
    const elemento = ref.current;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (elemento.getBoundingClientRect().top < window.innerHeight) return;

    elemento.setAttribute("data-oculto", "");
    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (!entrada.isIntersecting) return;
        elemento.removeAttribute("data-oculto");
        observador.disconnect();
      },
      { threshold: 0.15 },
    );
    observador.observe(elemento);
    return () => observador.disconnect();
  }, []);

  return (
    <div ref={ref} className={`${styles.aparecer} ${className}`}>
      {children}
    </div>
  );
}
