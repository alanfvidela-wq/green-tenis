"use client";

import { useEffect, useRef } from "react";
import Raqueta, { ANCLAS, LIENZO } from "./Raqueta";
import styles from "./AnatomiaRaqueta.module.css";

// Sección «Anatomía de una raqueta» (ver DESIGN.md): la raqueta queda fija y
// los pasos pasan al lado (abajo en mobile). Con el scroll, la cámara se
// acerca a cada parte, que se pone lima; aparece su etiqueta con la línea
// guía, las cuerdas se dibujan y el overgrip se enrolla.
//
// Sin JavaScript o con prefers-reduced-motion queda lo que pinta el servidor:
// la raqueta entera, quieta, con todas las etiquetas a la vista.

const COMPLETA = { x: LIENZO.ancho / 2, y: LIENZO.alto / 2, zoom: 1 };

const limitar = (n, min, max) => Math.min(max, Math.max(min, n));
const mezclar = (a, b, t) => a + (b - a) * t;
const suavizar = (t) => t * t * (3 - 2 * t);

// Dónde va la etiqueta de un paso y de dónde sale su línea guía, en % de la
// escena, para un encuadre dado
function ubicar(paso, vista) {
  const [ax, ay] = ANCLAS[paso.ancla];
  const x = ((ax - vista.x) / vista.ancho) * 100;
  const y = ((ay - vista.y) / vista.alto) * 100;
  const distancia = paso.distancia ?? 16;
  const etiquetaX =
    paso.lado === "derecha"
      ? limitar(x + distancia, 60, 80)
      : limitar(x - distancia, 20, 40);
  return { x, y, etiquetaX, etiquetaY: limitar(y, 6, 94) };
}

function encuadre({ x, y, zoom }) {
  const ancho = LIENZO.ancho / zoom;
  const alto = LIENZO.alto / zoom;
  return { x: x - ancho / 2, y: y - alto / 2, ancho, alto };
}

const VISTA_COMPLETA = encuadre(COMPLETA);

export default function AnatomiaRaqueta({ pasos }) {
  const refRaiz = useRef(null);
  const refEscena = useRef(null);
  const refSvg = useRef(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const raiz = refRaiz.current;
    const escena = refEscena.current;
    const svg = refSvg.current;
    const mobile = window.matchMedia("(max-width: 859px)");
    const elementosPasos = [...raiz.querySelectorAll("[data-paso]")];
    const marcas = pasos.map((paso) => ({
      etiqueta: raiz.querySelector(`[data-etiqueta="${paso.id}"]`),
      guia: raiz.querySelector(`[data-guia="${paso.id}"]`),
      punto: raiz.querySelector(`[data-punto="${paso.id}"]`),
    }));
    const cuerdas = [...svg.querySelectorAll("[data-cuerda]")];
    const totalCuerdas = cuerdas.length / 2;
    const vueltas = [...svg.querySelectorAll("[data-vuelta]")];
    const totalVueltas = vueltas.length / 2;
    const pasoOvergrip = pasos.findIndex((paso) => paso.partes.includes("overgrip"));
    const pasoEncordado = pasos.findIndex((paso) => paso.partes.includes("encordado"));

    // Las cuerdas y el overgrip arrancan sin dibujar
    for (const trazo of [...cuerdas, ...vueltas]) {
      trazo.style.strokeDasharray = "1";
      trazo.style.strokeDashoffset = "1";
    }
    raiz.dataset.animado = "";
    svg.dataset.camara = "";

    // Progreso continuo: 0 con el primer paso en la línea de lectura, 1 con
    // el segundo, etc. De -1 (antes del primero) a pasos.length (después del
    // último).
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

    // Adónde mira la cámara: de foco en foco, con entrada y salida suaves
    const focos = [COMPLETA, ...pasos.map((paso) => paso.foco), COMPLETA];
    function objetivo(p) {
      const q = p + 1;
      const k = limitar(Math.floor(q), 0, focos.length - 2);
      const t = suavizar(limitar(q - k, 0, 1));
      const a = focos[k];
      const b = focos[k + 1];
      return { x: mezclar(a.x, b.x, t), y: mezclar(a.y, b.y, t), zoom: mezclar(a.zoom, b.zoom, t) };
    }

    function dibujar(trazos, total, avance) {
      trazos.forEach((trazo, i) => {
        const orden = i % total;
        const hecho = limitar(avance * total - orden, 0, 1);
        const valor = String(Math.round((1 - hecho) * 1000) / 1000);
        if (trazo.style.strokeDashoffset !== valor) trazo.style.strokeDashoffset = valor;
      });
    }

    let camara = objetivo(progreso());
    let activo = null;
    let cuadro = 0;

    function marcarActivo(indice) {
      activo = indice;
      const partes = indice >= 0 ? pasos[indice].partes : [];
      for (const grupo of svg.querySelectorAll("[data-parte]")) {
        grupo.toggleAttribute("data-resaltada", partes.includes(grupo.dataset.parte));
      }
      svg.toggleAttribute("data-resaltando", partes.length > 0);
      elementosPasos.forEach((el, i) => el.toggleAttribute("data-activo", i === indice));
      marcas.forEach((marca, i) => {
        for (const el of Object.values(marca)) el.toggleAttribute("data-visible", i === indice);
      });
    }

    function pintar() {
      cuadro = 0;
      const p = progreso();
      const destino = objetivo(p);

      // La cámara sigue al scroll con un poco de inercia
      camara = {
        x: mezclar(camara.x, destino.x, 0.14),
        y: mezclar(camara.y, destino.y, 0.14),
        zoom: mezclar(camara.zoom, destino.zoom, 0.14),
      };
      const vista = encuadre(camara);
      svg.setAttribute("viewBox", `${vista.x} ${vista.y} ${vista.ancho} ${vista.alto}`);

      // Grosores fijos en pantalla aunque la cámara se acerque
      const pixeles = escena.clientWidth / vista.ancho;
      svg.style.setProperty("--trazo", `${1.5 / pixeles}px`);
      svg.style.setProperty("--resalte", `${8 / pixeles}px`);
      svg.style.setProperty("--resalte-fino", `${3 / pixeles}px`);

      // Las cuerdas se dibujan al llegar al encordado; el overgrip se
      // enrolla al llegar al overgrip
      dibujar(cuerdas, totalCuerdas, limitar((p - pasoEncordado + 0.8) / 0.8, 0, 1));
      dibujar(vueltas, totalVueltas, limitar((p - pasoOvergrip + 0.7) / 0.7, 0, 1));

      const indice = p > -0.5 && p < pasos.length - 0.5 ? Math.round(p) : -1;
      if (indice !== activo) marcarActivo(indice);

      if (indice >= 0) {
        const lugar = ubicar(pasos[indice], vista);
        const { etiqueta, guia, punto } = marcas[indice];
        etiqueta.style.left = `${lugar.etiquetaX}%`;
        etiqueta.style.top = `${lugar.etiquetaY}%`;
        punto.style.left = `${lugar.x}%`;
        punto.style.top = `${lugar.y}%`;
        guia.setAttribute("x1", lugar.x);
        guia.setAttribute("y1", lugar.y);
        guia.setAttribute("x2", lugar.etiquetaX);
        guia.setAttribute("y2", lugar.etiquetaY);
      }

      const quieta =
        Math.abs(destino.x - camara.x) < 0.05 &&
        Math.abs(destino.y - camara.y) < 0.05 &&
        Math.abs(destino.zoom - camara.zoom) < 0.001;
      if (!quieta) pedir();
    }

    function pedir() {
      if (!cuadro) cuadro = requestAnimationFrame(pintar);
    }

    pintar();
    window.addEventListener("scroll", pedir, { passive: true });
    window.addEventListener("resize", pedir);
    return () => {
      cancelAnimationFrame(cuadro);
      window.removeEventListener("scroll", pedir);
      window.removeEventListener("resize", pedir);
    };
  }, [pasos]);

  return (
    <div className={styles.anatomia} ref={refRaiz}>
      <div className={styles.escenario}>
        <div className={styles.escena} ref={refEscena}>
          <Raqueta ref={refSvg} encuadre="lienzo" className={styles.raqueta} />

          {/* Líneas guía: de la parte a su etiqueta */}
          <svg
            className={styles.guias}
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
            focusable="false"
          >
            {pasos.map((paso) => {
              const lugar = ubicar(paso, VISTA_COMPLETA);
              return (
                <line
                  key={paso.id}
                  data-guia={paso.id}
                  x1={lugar.x}
                  y1={lugar.y}
                  x2={lugar.etiquetaX}
                  y2={lugar.etiquetaY}
                />
              );
            })}
          </svg>

          {/* Etiquetas: texto HTML; repiten el título del paso, por eso van
              ocultas para lectores de pantalla */}
          {pasos.map((paso) => {
            const lugar = ubicar(paso, VISTA_COMPLETA);
            return (
              <span key={paso.id}>
                <span
                  className={styles.punto}
                  data-punto={paso.id}
                  style={{ left: `${lugar.x}%`, top: `${lugar.y}%` }}
                  aria-hidden="true"
                />
                <span
                  className={`${styles.etiqueta} ${paso.lado === "izquierda" ? styles.izquierda : ""}`}
                  data-etiqueta={paso.id}
                  style={{ left: `${lugar.etiquetaX}%`, top: `${lugar.etiquetaY}%` }}
                  aria-hidden="true"
                >
                  {paso.titulo}
                </span>
              </span>
            );
          })}
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
  );
}
