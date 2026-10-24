"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

// Header fijo: transparente mientras flota sobre el hero ([data-hero]) y con
// fondo sólido cuando se scrollea. Cambia un poco antes del final del hero,
// antes de que el titular y el botón pasen por debajo del header transparente.
// También publica su alto en --alto-header.
export default function CabeceraFlotante({ className, children }) {
  const ref = useRef(null);
  const pathname = usePathname();
  // Solo la home tiene hero; ahí arranca transparente hasta medir el scroll
  const [heroALaVista, setHeroALaVista] = useState(true);
  const transparente = pathname === "/" && heroALaVista;

  useEffect(() => {
    const header = ref.current;
    const raiz = document.documentElement;
    const observador = new ResizeObserver(() => {
      raiz.style.setProperty("--alto-header", `${header.offsetHeight}px`);
    });
    observador.observe(header);
    return () => observador.disconnect();
  }, []);

  useEffect(() => {
    if (pathname !== "/") return;
    let hero = null;
    let cuadro = 0;
    let observador = null;
    function medir() {
      cuadro = 0;
      const alto = ref.current.offsetHeight;
      const { bottom, height } = hero.getBoundingClientRect();
      setHeroALaVista(bottom - alto > height * 0.6);
    }
    function alScrollear() {
      if (!cuadro) cuadro = requestAnimationFrame(medir);
    }
    function empezar() {
      hero = document.querySelector("[data-hero]");
      // Mientras se ve la pantalla de carga, React trae el hero en un bloque
      // oculto: ahí mide 0, así que se espera a que se muestre
      if (!hero || hero.getClientRects().length === 0) return false;
      alScrollear();
      window.addEventListener("scroll", alScrollear, { passive: true });
      window.addEventListener("resize", alScrollear);
      return true;
    }
    // La página puede llegar después que el header (mientras se ve la pantalla
    // de carga): si el hero todavía no está, se lo espera
    if (!empezar()) {
      observador = new MutationObserver(() => {
        if (empezar()) observador.disconnect();
      });
      observador.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["hidden"] });
    }
    return () => {
      observador?.disconnect();
      cancelAnimationFrame(cuadro);
      window.removeEventListener("scroll", alScrollear);
      window.removeEventListener("resize", alScrollear);
    };
  }, [pathname]);

  return (
    <header
      ref={ref}
      className={className}
      data-transparente={transparente || undefined}
    >
      {children}
    </header>
  );
}
