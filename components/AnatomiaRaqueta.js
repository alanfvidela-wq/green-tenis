"use client";

import { useEffect, useRef } from "react";
import Raqueta, { ANCLAS, LIENZO } from "./Raqueta";
import styles from "./AnatomiaRaqueta.module.css";

// Sección «Anatomía de una raqueta» (ver DESIGN.md: es una excepción con su
// propio estilo, inflado y sobre azul). La raqueta queda fija y los pasos
// pasan al lado (abajo en mobile). Con el scroll, la cámara se acerca a cada
// parte, que se pone lima; entra su sticker con la línea guía, el nombre
// gigante aparece detrás, las cuerdas crecen y el overgrip se enrolla.
//
// Todo lo que se mueve es transform u opacity: la cámara, los stickers (en
// unidades del contenedor, cqw/cqh), las cuerdas y el parallax.
//
// Sin JavaScript o con prefers-reduced-motion queda lo que pinta el servidor:
// la raqueta entera, quieta, con todos los stickers a la vista.

const COMPLETA = { x: LIENZO.ancho / 2, y: LIENZO.alto / 2, zoom: 1 };
// La escena mide como el lienzo: 1% de alto equivale a 7/5 de 1% de ancho
const PROPORCION = LIENZO.alto / LIENZO.ancho;

const limitar = (n, min, max) => Math.min(max, Math.max(min, n));
const mezclar = (a, b, t) => a + (b - a) * t;
const suavizar = (t) => t * t * (3 - 2 * t);
const corto = (n) => Math.round(n * 100) / 100;

// Encuadre de la cámara como transform de la escena (en % de su tamaño):
// el foco queda en el centro
function camara({ x, y, zoom }) {
  return {
    tx: 50 - (zoom * x * 100) / LIENZO.ancho,
    ty: 50 - (zoom * y * 100) / LIENZO.alto,
    zoom,
  };
}

// Hasta dónde se alejan los stickers del centro, en % de la escena. En
// pantallas angostas, menos: si no, se salen por el borde.
const LIMITES = { derecha: [60, 80], izquierda: [20, 40] };
const LIMITES_ANGOSTOS = { derecha: [56, 72], izquierda: [28, 44] };

// Dónde va el sticker de un paso, de dónde sale su línea guía (en % de la
// escena) y cómo se dibuja esa línea, para un encuadre dado
function ubicar(paso, { tx, ty, zoom }, limites = LIMITES) {
  const [ax, ay] = ANCLAS[paso.ancla];
  const x = tx + (zoom * ax * 100) / LIENZO.ancho;
  const y = ty + (zoom * ay * 100) / LIENZO.alto;
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

const VISTA_COMPLETA = camara(COMPLETA);

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
  const refEscena = useRef(null);
  const refCamara = useRef(null);
  const refSvg = useRef(null);
  const refNombres = useRef(null);
  const refPelota = useRef(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const raiz = refRaiz.current;
    const escena = refEscena.current;
    const capaCamara = refCamara.current;
    const svg = refSvg.current;
    const nombresCapa = refNombres.current;
    const pelota = refPelota.current;
    const mobile = window.matchMedia("(max-width: 859px)");
    const elementosPasos = [...raiz.querySelectorAll("[data-paso]")];
    const marcas = pasos.map((paso) => raiz.querySelector(`[data-marca="${paso.id}"]`));
    const nombres = pasos.map((paso) => raiz.querySelector(`[data-nombre="${paso.id}"]`));
    const cuerdas = [...svg.querySelectorAll("[data-cuerda]")];
    const vueltas = [...svg.querySelectorAll("[data-vuelta]")];
    const pasoEncordado = pasos.findIndex((paso) => paso.partes.includes("encordado"));
    const pasoOvergrip = pasos.findIndex((paso) => paso.partes.includes("overgrip"));

    raiz.dataset.animado = "";

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

    // Cuerdas y vueltas de overgrip: crecen una tras otra (solo transform)
    function crecer(grupos, avance, eje) {
      const total = grupos.length;
      grupos.forEach((grupo, i) => {
        const hecho = corto(limitar(avance * total - i, 0, 1));
        if (grupo.dataset.hecho === String(hecho)) return;
        grupo.dataset.hecho = String(hecho);
        const sentido = eje ?? (grupo.dataset.sentido === "vertical" ? "Y" : "X");
        grupo.style.transform = `scale${sentido}(${hecho})`;
      });
    }

    let mirada = objetivo(progreso());
    let activo = null;
    let cuadro = 0;
    let moviendo = false;

    function marcarActivo(indice) {
      activo = indice;
      const partes = indice >= 0 ? pasos[indice].partes : [];
      for (const grupo of svg.querySelectorAll("[data-parte]")) {
        grupo.toggleAttribute("data-resaltada", partes.includes(grupo.dataset.parte));
      }
      svg.toggleAttribute("data-resaltando", partes.length > 0);
      elementosPasos.forEach((el, i) => el.toggleAttribute("data-activo", i === indice));
      marcas.forEach((el, i) => el.toggleAttribute("data-visible", i === indice));
      nombres.forEach((el, i) => el.toggleAttribute("data-visible", i === indice));
    }

    function pintar() {
      cuadro = 0;
      const p = progreso();
      const destino = objetivo(p);

      // La cámara sigue al scroll con un poco de inercia
      mirada = {
        x: mezclar(mirada.x, destino.x, 0.12),
        y: mezclar(mirada.y, destino.y, 0.12),
        zoom: mezclar(mirada.zoom, destino.zoom, 0.12),
      };
      const vista = camara(mirada);
      capaCamara.style.transform = `translate(${corto(vista.tx)}%, ${corto(vista.ty)}%) scale(${vista.zoom.toFixed(4)})`;

      crecer(cuerdas, limitar((p - pasoEncordado + 0.8) / 0.8, 0, 1));
      crecer(vueltas, limitar((p - pasoOvergrip + 0.7) / 0.7, 0, 1), "X");

      const indice = p > -0.5 && p < pasos.length - 0.5 ? Math.round(p) : -1;
      if (indice !== activo) marcarActivo(indice);
      if (indice >= 0) {
        const lugar = ubicar(pasos[indice], vista, mobile.matches ? LIMITES_ANGOSTOS : LIMITES);
        for (const [variable, valor] of Object.entries(lugar)) {
          marcas[indice].style.setProperty(variable, valor);
        }
      }

      // Parallax: el nombre gigante se queda atrás de la raqueta y la pelota
      // sube, baja y gira con el scroll
      const resto = p - Math.round(p);
      nombresCapa.style.transform = `translateY(${corto(resto * -36)}px)`;
      pelota.style.transform = `translateY(${corto(Math.sin(p * 1.3) * -12)}px) rotate(${corto(p * 24)}deg)`;

      const quieta =
        Math.abs(destino.x - mirada.x) < 0.05 &&
        Math.abs(destino.y - mirada.y) < 0.05 &&
        Math.abs(destino.zoom - mirada.zoom) < 0.001;

      // Mientras se mueve, la cámara va en su propia capa (transform en la
      // GPU); quieta, se repinta nítida al zoom en que quedó
      if (!quieta && !moviendo) {
        capaCamara.style.willChange = "transform";
        moviendo = true;
      } else if (quieta && moviendo) {
        capaCamara.style.willChange = "auto";
        moviendo = false;
      }
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
      capaCamara.style.willChange = "";
      window.removeEventListener("scroll", pedir);
      window.removeEventListener("resize", pedir);
    };
  }, [pasos]);

  return (
    <section className={styles.seccion} aria-labelledby="titulo-anatomia" ref={refRaiz}>
      <div className={styles.contenido}>
        <header className={styles.encabezado}>
          <h2 id="titulo-anatomia" className={styles.titular}>
            {titulo}
          </h2>
          <p className={styles.bajada}>{bajada}</p>
        </header>

        <div className={styles.anatomia}>
          <div className={styles.escenario}>
            {/* El nombre de la parte activa, gigante, detrás de la raqueta */}
            <div className={styles.nombres} ref={refNombres} aria-hidden="true">
              {pasos.map((paso) => (
                <span key={paso.id} className={styles.nombre} data-nombre={paso.id}>
                  {paso.titulo}
                </span>
              ))}
            </div>

            <div className={styles.escena} ref={refEscena}>
              <div className={styles.flotador}>
                <div className={styles.camara} ref={refCamara}>
                  <Raqueta
                    ref={refSvg}
                    estilo="inflada"
                    encuadre="lienzo"
                    prefijo="anatomia"
                    className={styles.raqueta}
                  />
                </div>
              </div>

              {/* Stickers: texto HTML; repiten el título del paso, por eso van
                  ocultos para lectores de pantalla */}
              {pasos.map((paso) => (
                <span
                  key={paso.id}
                  className={styles.marca}
                  data-marca={paso.id}
                  style={{ ...ubicar(paso, VISTA_COMPLETA), "--giro": `${paso.giro ?? 0}deg` }}
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
