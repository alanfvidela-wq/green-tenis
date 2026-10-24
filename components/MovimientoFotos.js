"use client";

import { useEffect, useRef } from "react";

// Mueve las fotos de una banda con el scroll (ver «Fotos al scrollear» en
// DESIGN.md). No dibuja las fotos: las recibe del servidor y busca adentro
// [data-foto] (la caja quieta, que se mide) y [data-recuadro] (lo que se
// mueve). Solo escucha el scroll mientras la banda está cerca de la pantalla.
// - Desktop: cada recuadro entra desde más abajo, un poco más girado y más
//   chico, y se asienta en su giro; más un parallax propio (data-velocidad).
// - Mobile: solo la entrada vertical, con el giro fijo.
// - Con prefers-reduced-motion (o sin JS) quedan quietos en su giro.
// Solo transform: sin fundidos, así el placeholder nunca se mezcla con el
// fondo.

const limitar = (n, min, max) => Math.min(max, Math.max(min, n));
const suavizar = (t) => 1 - (1 - t) ** 3;
const corto = (n) => Math.round(n * 100) / 100;

export default function MovimientoFotos({ className, children }) {
  const ref = useRef(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const raiz = ref.current;
    const angosta = window.matchMedia("(max-width: 759px)");
    const fotos = [...raiz.querySelectorAll("[data-foto]")].map((caja) => {
      const giro = Number(caja.dataset.giro) || 0;
      return {
        caja,
        recuadro: caja.querySelector("[data-recuadro]"),
        giro,
        // La entrada gira hacia el mismo lado, sin pasar de ±6°
        giroEntrada: limitar(giro + (giro < 0 ? -3 : 3), -6, 6),
        velocidad: Number(caja.dataset.velocidad) || 0,
      };
    });
    raiz.setAttribute("data-animado", "");

    let cuadro = 0;
    function actualizar() {
      cuadro = 0;
      const alto = window.innerHeight;
      const mobile = angosta.matches;
      // Primero se mide todo y después se escribe
      const medidas = fotos.map(({ caja }) => caja.getBoundingClientRect());
      fotos.forEach((foto, i) => {
        const r = medidas[i];
        // Oculta en mobile
        if (!r.width) return;
        // 0 cuando asoma por abajo, 1 cuando se va por arriba
        const t = limitar((alto - r.top) / (alto + r.height), 0, 1);
        const e = suavizar(limitar(t / 0.5, 0, 1));
        let transformacion;
        if (mobile) {
          transformacion = `translate3d(0, ${corto((1 - e) * 48)}px, 0) rotate(${foto.giro}deg)`;
        } else {
          const y = (1 - e) * 80 + (0.5 - t) * foto.velocidad * alto;
          const giro = foto.giroEntrada + (foto.giro - foto.giroEntrada) * e;
          transformacion = `translate3d(0, ${corto(y)}px, 0) rotate(${corto(giro)}deg) scale(${corto(0.92 + 0.08 * e)})`;
        }
        foto.recuadro.style.transform = transformacion;
      });
    }
    function pedir() {
      if (!cuadro) cuadro = requestAnimationFrame(actualizar);
    }

    let escuchando = false;
    function escuchar(si) {
      if (si === escuchando) return;
      escuchando = si;
      if (si) {
        window.addEventListener("scroll", pedir, { passive: true });
        window.addEventListener("resize", pedir);
        pedir();
      } else {
        window.removeEventListener("scroll", pedir);
        window.removeEventListener("resize", pedir);
      }
    }
    const observador = new IntersectionObserver(([entrada]) => escuchar(entrada.isIntersecting), {
      rootMargin: "25% 0px",
    });
    observador.observe(raiz);
    pedir();

    return () => {
      observador.disconnect();
      escuchar(false);
      cancelAnimationFrame(cuadro);
    };
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
