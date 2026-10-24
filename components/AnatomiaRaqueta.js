"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import Raqueta, { ANCLAS, LIENZO } from "./Raqueta";
import styles from "./AnatomiaRaqueta.module.css";

// Sección «Anatomía de una raqueta» (ver DESIGN.md), sobre una banda negra.
// La raqueta queda fija y los pasos pasan al lado (abajo en mobile).
//
// - Con WebGL y movimiento permitido: la raqueta 3D (Raqueta3D, cargada sin
//   SSR). Con el scroll, la cámara la recorre de arriba hacia abajo y se
//   acerca a la parte de cada paso; aparece el nombre de la parte, anclado a
//   la posición 3D de la parte, y el nombre gigante aparece detrás.
// - Con prefers-reduced-motion, sin WebGL o mientras carga el modelo: la
//   raqueta dibujada en SVG, quieta, con los nombres de todas las partes.
//   Ocupa la misma caja que el 3D, así que el cambio no mueve nada.
//
// Al final, después de la última parte, la cámara se aleja hasta la raqueta
// entera, que da una vuelta con el scroll y después gira muy lento; los
// nombres de las partes aparecen todos juntos un instante, la frase de cierre aparece al
// lado (debajo en mobile) y queda mientras gira, y aparece el botón. Sin
// movimiento, el cierre es texto y botón al lado de la
// raqueta quieta.
//
// Lo que se mueve en la página (nombres de las partes, nombre gigante,
// parallax) es transform u opacity.

// Tramos del final (fin va de 0 a 1 a lo largo del bloque de cierre): los
// stickers juntos, y desde dónde se ven la frase (junto con los stickers, y
// queda durante la vuelta) y el botón. La vuelta de la raqueta está en
// Raqueta3D.
const FINAL = { stickers: [0.14, 0.34], frase: 0.14, boton: 0.78 };

const Raqueta3D = dynamic(() => import("./Raqueta3D"), { ssr: false });

// La escena mide como el lienzo de la raqueta: 1% de alto equivale a 7/5 de
// 1% de ancho
const PROPORCION = LIENZO.alto / LIENZO.ancho;

// Hasta dónde se alejan los stickers del centro, en % de la escena. En
// pantallas angostas, menos: si no, se salen por el borde.
const LIMITES = { derecha: [60, 80], izquierda: [20, 40] };
const LIMITES_ANGOSTOS = { derecha: [56, 72], izquierda: [28, 44] };
// Aire entre el sticker y el borde del escenario, en px
const AIRE = 8;

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

export default function AnatomiaRaqueta({ titulo, bajada, pasos, cierre }) {
  const refRaiz = useRef(null);
  const refEscenario = useRef(null);
  const refEscena = useRef(null);
  const refNombres = useRef(null);
  const refMarcas = useRef([]);
  // Lo que comparte con la escena 3D sin volver a renderizar: el progreso del
  // scroll y dónde está la escena dentro del lienzo
  const estado = useRef({ p: -1, fin: 0 });
  const medidas = useRef({
    escena: { x: 0, y: 0, ancho: 1, alto: 1 },
    fraccion: 1,
    anchoEscenario: 1,
    stickers: [],
  });
  const angosta = useRef(false);

  const cargar3d = useSyncExternalStore(sinSuscripcion, puede3d, () => false);
  const [modo3d, setModo3d] = useState(false);
  const alListo = useCallback(() => setModo3d(true), []);

  // La escena 3D avisa en cada cuadro dónde quedó la parte del paso activo.
  // Los límites se achican para que el sticker entero quede dentro del
  // escenario: si no, lo corta el borde.
  const colocarMarca = useCallback(
    (indice, x, y) => {
      const marca = refMarcas.current[indice];
      if (!marca) return;
      const { escena, anchoEscenario, stickers } = medidas.current;
      const base = angosta.current ? LIMITES_ANGOSTOS : LIMITES;
      const sticker = (((stickers[indice] ?? 0) + AIRE) / escena.ancho) * 100;
      const izquierda = (-escena.x / escena.ancho) * 100 + sticker;
      const derecha = ((anchoEscenario - escena.x) / escena.ancho) * 100 - sticker;
      const limites = {
        derecha: [Math.min(base.derecha[0], derecha), Math.min(base.derecha[1], derecha)],
        izquierda: [Math.max(base.izquierda[0], izquierda), Math.max(base.izquierda[1], izquierda)],
      };
      const lugar = posicionMarca(pasos[indice], x, y, limites);
      for (const [variable, valor] of Object.entries(lugar)) {
        marca.style.setProperty(variable, valor);
      }
    },
    [pasos],
  );

  // Dónde está la escena dentro del escenario (el lienzo 3D lo ocupa entero)
  // y cuánto mide cada sticker
  useEffect(() => {
    if (!cargar3d) return;
    const escenario = refEscenario.current;
    const escena = refEscena.current;
    const etiquetas = refMarcas.current.map((marca) => marca?.querySelector(`.${styles.etiqueta}`));
    const consulta = window.matchMedia("(max-width: 859px)");
    function medir() {
      const s = escenario.getBoundingClientRect();
      const e = escena.getBoundingClientRect();
      medidas.current = {
        escena: { x: e.left - s.left, y: e.top - s.top, ancho: e.width, alto: e.height },
        fraccion: e.height / s.height,
        anchoEscenario: s.width,
        stickers: etiquetas.map((etiqueta) => etiqueta?.offsetWidth ?? 0),
      };
      angosta.current = consulta.matches;
    }
    medir();
    const observador = new ResizeObserver(medir);
    observador.observe(escenario);
    observador.observe(escena);
    // Los stickers cambian de ancho cuando carga la fuente
    etiquetas.forEach((etiqueta) => etiqueta && observador.observe(etiqueta));
    return () => observador.disconnect();
  }, [cargar3d]);

  // Con la raqueta 3D en pantalla, el scroll decide el paso activo
  useEffect(() => {
    if (!modo3d) return;

    const raiz = refRaiz.current;
    const escena = refEscena.current;
    const nombresCapa = refNombres.current;
    const mobile = window.matchMedia("(max-width: 859px)");
    const elementosPasos = [...raiz.querySelectorAll("[data-paso]")];
    const nombres = pasos.map((paso) => raiz.querySelector(`[data-nombre="${paso.id}"]`));
    const bloqueCierre = raiz.querySelector("[data-cierre]");
    const escenario = refEscenario.current;

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

    // Avance dentro del bloque de cierre: 0 cuando su borde de arriba cruza la
    // línea de lectura, 1 justo antes de que la raqueta deje de estar fija
    function avanceFinal() {
      const alto = window.innerHeight;
      const linea = mobile.matches
        ? (escena.getBoundingClientRect().bottom + alto) / 2
        : alto / 2;
      const r = bloqueCierre.getBoundingClientRect();
      const resto = Math.max(0, escenario.getBoundingClientRect().bottom - linea);
      return limitar((linea - r.top) / Math.max(1, r.height - resto), 0, 1);
    }

    let estadoAnterior = "";
    let cuadro = 0;

    function marcar(indice, todos, final) {
      elementosPasos.forEach((el, i) => el.toggleAttribute("data-activo", i === indice));
      refMarcas.current.forEach((el, i) => el?.toggleAttribute("data-visible", todos || i === indice));
      nombres.forEach((el, i) => el.toggleAttribute("data-visible", i === indice));
      raiz.toggleAttribute("data-frase", final >= FINAL.frase);
      raiz.toggleAttribute("data-final", final >= FINAL.boton);
    }

    function actualizar() {
      cuadro = 0;
      const p = progreso();
      const fin = avanceFinal();
      estado.current.p = p;
      estado.current.fin = fin;

      const indice = p > -0.5 && p < pasos.length - 0.5 ? Math.round(p) : -1;
      const todos = fin > FINAL.stickers[0] && fin < FINAL.stickers[1];
      const final = fin >= FINAL.boton ? FINAL.boton : fin >= FINAL.frase ? FINAL.frase : 0;
      const clave = `${indice}|${todos}|${final}`;
      if (clave !== estadoAnterior) {
        estadoAnterior = clave;
        marcar(indice, todos, final);
      }

      // Parallax: el nombre gigante se queda atrás de la raqueta
      const resto = p - Math.round(p);
      nombresCapa.style.transform = `translateY(${corto(resto * -36)}px)`;
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
              {/* La raqueta dibujada: mientras carga el 3D, sin WebGL o sin
                  movimiento */}
              <div className={styles.dibujo}>
                <Raqueta estilo="inflada" encuadre="lienzo" className={styles.raqueta} />
              </div>

              {/* Los nombres de las partes, con su línea guía: texto HTML;
                  repiten el título del paso, por eso van ocultos para
                  lectores de pantalla */}
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

          {/* El cierre: el tramo de scroll del final. La frase y el botón
              quedan fijos al lado de la raqueta (debajo en mobile). Con 3D la
              frase aparece junto con los nombres de las partes y se queda
              mientras la raqueta gira, y el botón entra al final; sin 3D
              están siempre. */}
          <div className={styles.cierre} data-cierre>
            <div className={styles.cierreContenido}>
              <p className={styles.cierreTexto}>{cierre.texto}</p>
              <Link href={cierre.href} className={`boton ${styles.cierreBoton}`}>
                {cierre.accion}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
