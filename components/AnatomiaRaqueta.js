"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import Raqueta, { ANCLAS, LIENZO } from "./Raqueta";
import styles from "./AnatomiaRaqueta.module.css";

// Sección «Anatomía de una raqueta» (ver DESIGN.md: es una excepción con su
// propio estilo, sobre azul de cancha). La raqueta queda fija y los pasos
// pasan al lado (abajo en mobile).
//
// - Con WebGL y movimiento permitido: la raqueta 3D (Raqueta3D, cargada sin
//   SSR). Con el scroll, la cámara la recorre de arriba hacia abajo y se
//   acerca a la parte de cada paso; entra su sticker, anclado a la posición 3D
//   de la parte, y el nombre gigante aparece detrás.
// - Con prefers-reduced-motion, sin WebGL o mientras carga el modelo: la
//   raqueta inflada en SVG, quieta, con todos los stickers. Ocupa la misma
//   caja que el 3D, así que el cambio no mueve nada.
//
// Lo que se mueve en la página (stickers, nombre, parallax) es transform u
// opacity.

const Raqueta3D = dynamic(() => import("./Raqueta3D"), { ssr: false });

// La escena mide como el lienzo de la raqueta: 1% de alto equivale a 7/5 de
// 1% de ancho
const PROPORCION = LIENZO.alto / LIENZO.ancho;

// Hasta dónde se alejan los stickers del centro, en % de la escena. En
// pantallas angostas, menos: si no, se salen por el borde.
const LIMITES = { derecha: [60, 80], izquierda: [20, 40] };
const LIMITES_ANGOSTOS = { derecha: [56, 72], izquierda: [28, 44] };

const limitar = (n, min, max) => Math.min(max, Math.max(min, n));
const corto = (n) => Math.round(n * 100) / 100;

// Dónde va el sticker de un paso y cómo se dibuja su línea guía, a partir del
// punto de su parte en la escena (en %)
function posicionMarca(paso, x, y, limites = LIMITES) {
  const distancia = paso.distancia ?? 16;
  const ex =
    paso.lado === "derecha"
      ? limitar(x + distancia, ...limites.derecha)
      : limitar(x - distancia, ...limites.izquierda);
  const ey = limitar(y, 6, 94);
  const dx = ex - x;
  const dy = (ey - y) * PROPORCION;
  return {
    "--x": corto(x),
    "--y": corto(y),
    "--ex": corto(ex),
    "--ey": corto(ey),
    "--largo": corto(Math.hypot(dx, dy)),
    "--angulo": `${corto((Math.atan2(dy, dx) * 180) / Math.PI)}deg`,
  };
}

// En el dibujo SVG (la raqueta entera), el punto de cada parte
function posicionSvg(paso) {
  const [ax, ay] = ANCLAS[paso.ancla];
  return posicionMarca(paso, (ax / LIENZO.ancho) * 100, (ay / LIENZO.alto) * 100);
}

// ¿Va la raqueta 3D? Solo con WebGL y sin prefers-reduced-motion
let hay3d = null;
function puede3d() {
  if (hay3d === null) {
    let webgl = false;
    try {
      const lienzo = document.createElement("canvas");
      webgl = Boolean(lienzo.getContext("webgl2") || lienzo.getContext("webgl"));
    } catch {}
    hay3d = webgl && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }
  return hay3d;
}
const sinSuscripcion = () => () => {};

// La pelota de la marca, inflada: lima con contorno negro y sus costuras
function PelotaInflada() {
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id="anatomia-pelota" cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#f7ffb8" />
          <stop offset="0.55" stopColor="#dcf900" />
          <stop offset="1" stopColor="#a9c400" />
        </radialGradient>
        <pattern id="anatomia-pelota-ruido" patternUnits="userSpaceOnUse" width="40" height="40">
          <image href="/texturas/ruido.png" width="40" height="40" />
        </pattern>
      </defs>
      <circle cx="50" cy="50" r="44" fill="url(#anatomia-pelota)" />
      <circle cx="50" cy="50" r="44" fill="url(#anatomia-pelota-ruido)" />
      <path
        d="M18 20c15 14 15 46 0 60M82 20c-15 14-15 46 0 60"
        fill="none"
        stroke="#000"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <ellipse cx="33" cy="28" rx="11" ry="6" fill="#fff" fillOpacity="0.75" transform="rotate(-35 33 28)" />
      <circle cx="50" cy="50" r="44" fill="none" stroke="#000" strokeWidth="4.5" />
    </svg>
  );
}

export default function AnatomiaRaqueta({ titulo, bajada, pasos }) {
  const refRaiz = useRef(null);
  const refEscenario = useRef(null);
  const refEscena = useRef(null);
  const refNombres = useRef(null);
  const refPelota = useRef(null);
  const refMarcas = useRef([]);
  // Lo que comparte con la escena 3D sin volver a renderizar: el progreso del
  // scroll y dónde está la escena dentro del lienzo
  const estado = useRef({ p: -1 });
  const medidas = useRef({ escena: { x: 0, y: 0, ancho: 1, alto: 1 }, fraccion: 1 });
  const angosta = useRef(false);

  const cargar3d = useSyncExternalStore(sinSuscripcion, puede3d, () => false);
  const [modo3d, setModo3d] = useState(false);
  const alListo = useCallback(() => setModo3d(true), []);

  // La escena 3D avisa en cada cuadro dónde quedó la parte del paso activo
  const colocarMarca = useCallback(
    (indice, x, y) => {
      const marca = refMarcas.current[indice];
      if (!marca) return;
      const lugar = posicionMarca(pasos[indice], x, y, angosta.current ? LIMITES_ANGOSTOS : LIMITES);
      for (const [variable, valor] of Object.entries(lugar)) {
        marca.style.setProperty(variable, valor);
      }
    },
    [pasos],
  );

  // Dónde está la escena dentro del escenario (el lienzo 3D lo ocupa entero)
  useEffect(() => {
    if (!cargar3d) return;
    const escenario = refEscenario.current;
    const escena = refEscena.current;
    const consulta = window.matchMedia("(max-width: 859px)");
    function medir() {
      const s = escenario.getBoundingClientRect();
      const e = escena.getBoundingClientRect();
      medidas.current = {
        escena: { x: e.left - s.left, y: e.top - s.top, ancho: e.width, alto: e.height },
        fraccion: e.height / s.height,
      };
      angosta.current = consulta.matches;
    }
    medir();
    const observador = new ResizeObserver(medir);
    observador.observe(escenario);
    observador.observe(escena);
    return () => observador.disconnect();
  }, [cargar3d]);

  // Con la raqueta 3D en pantalla, el scroll decide el paso activo
  useEffect(() => {
    if (!modo3d) return;

    const raiz = refRaiz.current;
    const escena = refEscena.current;
    const nombresCapa = refNombres.current;
    const pelota = refPelota.current;
    const mobile = window.matchMedia("(max-width: 859px)");
    const elementosPasos = [...raiz.querySelectorAll("[data-paso]")];
    const nombres = pasos.map((paso) => raiz.querySelector(`[data-nombre="${paso.id}"]`));

    // Progreso continuo: 0 con el primer paso en la línea de lectura, 1 con
    // el segundo, etc. De -1 (antes del primero) a pasos.length (después).
    function progreso() {
      const alto = window.innerHeight;
      const linea = mobile.matches
        ? (escena.getBoundingClientRect().bottom + alto) / 2
        : alto / 2;
      const centros = elementosPasos.map((el) => {
        const r = el.getBoundingClientRect();
        return r.top + r.height / 2;
      });
      const n = centros.length;
      if (linea <= centros[0]) {
        return Math.max(-1, (linea - centros[0]) / (centros[1] - centros[0]));
      }
      for (let i = 0; i < n - 1; i++) {
        if (linea < centros[i + 1]) {
          return i + (linea - centros[i]) / (centros[i + 1] - centros[i]);
        }
      }
      return Math.min(n, n - 1 + (linea - centros[n - 1]) / (centros[n - 1] - centros[n - 2]));
    }

    let activo = null;
    let cuadro = 0;

    function marcarActivo(indice) {
      activo = indice;
      elementosPasos.forEach((el, i) => el.toggleAttribute("data-activo", i === indice));
      refMarcas.current.forEach((el, i) => el?.toggleAttribute("data-visible", i === indice));
      nombres.forEach((el, i) => el.toggleAttribute("data-visible", i === indice));
    }

    function actualizar() {
      cuadro = 0;
      const p = progreso();
      estado.current.p = p;

      const indice = p > -0.5 && p < pasos.length - 0.5 ? Math.round(p) : -1;
      if (indice !== activo) marcarActivo(indice);

      // Parallax: el nombre gigante se queda atrás de la raqueta y la pelota
      // sube, baja y gira con el scroll
      const resto = p - Math.round(p);
      nombresCapa.style.transform = `translateY(${corto(resto * -36)}px)`;
      pelota.style.transform = `translateY(${corto(Math.sin(p * 1.3) * -12)}px) rotate(${corto(p * 24)}deg)`;
    }

    function pedir() {
      if (!cuadro) cuadro = requestAnimationFrame(actualizar);
    }

    actualizar();
    window.addEventListener("scroll", pedir, { passive: true });
    window.addEventListener("resize", pedir);
    return () => {
      cancelAnimationFrame(cuadro);
      window.removeEventListener("scroll", pedir);
      window.removeEventListener("resize", pedir);
    };
  }, [modo3d, pasos]);

  return (
    <section
      className={styles.seccion}
      aria-labelledby="titulo-anatomia"
      ref={refRaiz}
      data-animado={modo3d ? "" : undefined}
      data-modo={modo3d ? "3d" : "svg"}
    >
      <div className={styles.contenido}>
        <header className={styles.encabezado}>
          <h2 id="titulo-anatomia" className={styles.titular}>
            {titulo}
          </h2>
          <p className={styles.bajada}>{bajada}</p>
        </header>

        <div className={styles.anatomia}>
          <div className={styles.escenario} ref={refEscenario}>
            {/* El nombre de la parte activa, gigante, detrás de la raqueta */}
            <div className={styles.nombres} ref={refNombres} aria-hidden="true">
              {pasos.map((paso) => (
                <span key={paso.id} className={styles.nombre} data-nombre={paso.id}>
                  {paso.titulo}
                </span>
              ))}
            </div>

            {cargar3d && (
              <div className={styles.capa3d}>
                <Raqueta3D
                  pasos={pasos}
                  estado={estado}
                  medidas={medidas}
                  onMarca={colocarMarca}
                  onListo={alListo}
                />
              </div>
            )}

            <div className={styles.escena} ref={refEscena}>
              {/* La raqueta en SVG: mientras carga el 3D, sin WebGL o sin
                  movimiento */}
              <div className={styles.dibujo}>
                <Raqueta estilo="inflada" encuadre="lienzo" prefijo="anatomia" className={styles.raqueta} />
              </div>

              {/* Stickers: texto HTML; repiten el título del paso, por eso van
                  ocultos para lectores de pantalla */}
              {pasos.map((paso, i) => (
                <span
                  key={paso.id}
                  ref={(el) => {
                    refMarcas.current[i] = el;
                  }}
                  className={styles.marca}
                  data-marca={paso.id}
                  style={{ ...posicionSvg(paso), "--giro": `${paso.giro ?? 0}deg` }}
                  aria-hidden="true"
                >
                  <span className={styles.guia} />
                  <span className={styles.punto} />
                  <span
                    className={`${styles.sticker} ${paso.lado === "izquierda" ? styles.izquierda : ""}`}
                  >
                    <span className={styles.entrada}>
                      <span
                        className={`${styles.etiqueta} ${paso.forma === "redondeado" ? styles.redondeado : ""}`}
                      >
                        {paso.titulo}
                      </span>
                    </span>
                  </span>
                </span>
              ))}
            </div>

            <div className={styles.pelota} ref={refPelota} aria-hidden="true">
              <div className={styles.pelotaFlota}>
                <PelotaInflada />
              </div>
            </div>
          </div>

          <ol className={styles.pasos}>
            {pasos.map((paso, i) => (
              <li key={paso.id} className={styles.paso} data-paso={i}>
                <span className={styles.numero} aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className={styles.titulo}>{paso.titulo}</h3>
                <p className={styles.dato}>{paso.dato}</p>
                <p className={styles.frase}>{paso.frase}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
