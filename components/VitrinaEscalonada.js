"use client";

import { useEffect, useRef } from "react";

// Inspirado en Kinetics (kinetics.colorion.co) por Csaba Kissi:
// https://kinetics.colorion.co/effects/stagger-entrance/
const PASO_MS = 90;

// La lista de la vitrina: las celdas marcadas con data-escalonar que están
// debajo de la pantalla al cargar se esconden y, al llegar con el scroll,
// suben 14px y aparecen de a una, 90ms después de la anterior (las que entran
// juntas, como una fila). Lo que ya se ve al cargar no se esconde, y con
// prefers-reduced-motion (o sin JS) se ve todo desde el principio.
export default function VitrinaEscalonada({ className, children }) {
  const ref = useRef(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const celdas = [...ref.current.querySelectorAll(":scope > [data-escalonar]")].filter(
      (celda) => celda.getBoundingClientRect().top >= window.innerHeight,
    );
    if (celdas.length === 0) return;

    celdas.forEach((celda) => celda.setAttribute("data-oculta", ""));
    const mostrar = (celda, i) => {
      observador.unobserve(celda);
      celda.style.transitionDelay = `${i * PASO_MS}ms`;
      celda.removeAttribute("data-oculta");
    };
    const observador = new IntersectionObserver(
      (entradas) => {
        entradas
          .filter((entrada) => entrada.isIntersecting)
          .map((entrada) => entrada.target)
          .sort((a, b) => celdas.indexOf(a) - celdas.indexOf(b))
          .forEach(mostrar);
        // Si se saltó hasta más abajo (un ancla, el scroll que vuelve al ir
        // atrás), las que quedaron arriba sin pasar por la pantalla también
        // se muestran
        celdas
          .filter((celda) => celda.hasAttribute("data-oculta"))
          .filter((celda) => celda.getBoundingClientRect().bottom <= 0)
          .forEach((celda) => mostrar(celda, 0));
      },
      { threshold: 0.4 },
    );
    celdas.forEach((celda) => observador.observe(celda));
    return () => observador.disconnect();
  }, []);

  return (
    <ul ref={ref} className={className}>
      {children}
    </ul>
  );
}
