"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import Raqueta, { ANCLAS, LIENZO } from "./Raqueta";
import styles from "./AnatomiaRaqueta.module.css";

// Sección «Anatomía de una raqueta» (ver DESIGN.md), sobre una banda de
// estudio. La raqueta queda fija y los pasos pasan al lado (abajo en mobile).
// Mientras está fija, la sección ocupa toda la pantalla y el header se
// esconde; vuelve al salir de la sección o si se scrollea para arriba.
//
// - Con WebGL y movimiento permitido: la raqueta 3D (Raqueta3D, cargada sin
//   SSR). Con el scroll, la cámara la recorre de arriba hacia abajo y se
//   acerca a la parte de cada paso; aparece el nombre de la parte, anclado a
//   la posición 3D de la parte.
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
// Lo que se mueve en la página (nombres de las partes, el header) es
// transform u opacity.

// Tramos del final (fin va de 0 a 1 a lo largo del bloque de cierre): los
// stickers juntos, y desde dónde se ven la frase (junto con los stickers, y
// queda durante la vuelta) y el botón. La vuelta de la raqueta está en
// Raqueta3D.
const FINAL = { stickers: [0.14, 0.34], frase: 0.14, boton: 0.78 };

const Raqueta3D = dynamic(() => import("./Raqueta3D"), { ssr: false });

// La escena mide como el lienzo de la raqueta: 1% de alto equivale a 7/5 de
// 1% de ancho
const PROPORCION = LIENZO.alto / LIENZO.ancho;

// En la raqueta dibujada, hasta dónde se alejan los stickers del centro, en %
// de la escena
const LIMITES = { derecha: [60, 80], izquierda: [20, 40] };
// Aire entre el sticker y el borde del escenario, en px
const AIRE = 8;
// En la raqueta 3D el nombre va afuera del marco: a esta distancia del borde
// de la silueta y con la línea guía de este largo como mínimo, en px.
// Raqueta3D aleja la cámara lo necesario para que entre (ver LUGAR_NOMBRE).
const SEPARACION = 8;
const GUIA_MINIMA = 18;
// Cuánto tiene que moverse el scroll (en px, de un cuadro al otro) para contar
// como que sube o baja: el header no parpadea con un temblor del touchpad
const UMBRAL_SCROLL = 2;

const limitar = (n, min, max) => Math.min(max, Math.max(min, n));
const corto = (n) => Math.round(n * 100) / 100;

// Donde la raqueta queda arriba y los pasos abajo
const MOBILE = "(max-width: 859px)";
// Aire debajo del dato de un paso al abrirlo, en px
const AIRE_DATO = 12;

// La línea de lectura: el centro de la pantalla; en mobile, el centro de lo
// que queda debajo del escenario, donde un paso entra justo
function lineaDeLectura(escenario, mobile) {
  const alto = window.innerHeight;
  return mobile.matches ? (escenario.getBoundingClientRect().bottom + alto) / 2 : alto / 2;
}

// Dónde va el sticker de un paso y cómo se dibuja su línea guía, a partir del
// punto de su parte en la escena (en %)
function posicionMarca(paso, x, y, limites = LIMITES) {
  const distancia = paso.distancia ?? 16;
  const ex =
    paso.lado === "derecha"
      ? limitar(x + distancia, ...limites.derecha)
      : limitar(x - distancia, ...limites.izquierda);
  return trazo(x, y, ex);
}

// Las variables del sticker y su línea: del punto (x, y) al nombre, en ex
function trazo(x, y, ex) {
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
  const refAnatomia = useRef(null);
  const refMarcas = useRef([]);
  // Lo que comparte con la escena 3D sin volver a renderizar: el progreso del
  // scroll y dónde está la escena dentro del lienzo
  const estado = useRef({ p: -1, fin: 0 });
  const medidas = useRef({
    escena: { x: 0, y: 0, ancho: 1, alto: 1 },
    fraccion: 1,
    anchoEscenario: 1,
    stickers: [],
    angosta: false,
  });

  const cargar3d = useSyncExternalStore(sinSuscripcion, puede3d, () => false);
  const [modo3d, setModo3d] = useState(false);
  const alListo = useCallback(() => setModo3d(true), []);

  // En mobile chico el dato de cada paso queda plegado detrás de «Ver más»
  // (solo con JavaScript: sin él, el dato se ve siempre). Se abre uno a la
  // vez, el del paso que se está leyendo; al abrirlo, si no entra entero, la
  // página baja lo justo para mostrarlo.
  const plegable = useSyncExternalStore(sinSuscripcion, () => true, () => false);
  const [abierto, setAbierto] = useState(null);
  const mostrarDato = useRef(false);

  // La escena 3D avisa en cada cuadro dónde quedó la parte del paso activo
  // (x, y) y dónde está el borde de la silueta a esa altura, del lado del
  // nombre (borde). Todo en % de la escena. El nombre va afuera del marco,
  // pegado a ese borde; los límites lo dejan entero dentro del escenario (si
  // no, lo corta el borde).
  const colocarMarca = useCallback(
    (indice, x, y, borde) => {
      const marca = refMarcas.current[indice];
      if (!marca) return;
      const paso = pasos[indice];
      const { escena, anchoEscenario, stickers } = medidas.current;
      const enEscena = (px) => (px / escena.ancho) * 100;
      const sticker = enEscena((stickers[indice] ?? 0) + AIRE);
      const izquierda = enEscena(-escena.x) + sticker;
      const derecha = enEscena(anchoEscenario - escena.x) - sticker;
      const ex =
        paso.lado === "derecha"
          ? Math.min(Math.max(x + enEscena(GUIA_MINIMA), borde + enEscena(SEPARACION)), derecha)
          : Math.max(Math.min(x - enEscena(GUIA_MINIMA), borde - enEscena(SEPARACION)), izquierda);
      const lugar = trazo(x, y, ex);
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
    const consulta = window.matchMedia(MOBILE);
    function medir() {
      const s = escenario.getBoundingClientRect();
      const e = escena.getBoundingClientRect();
      medidas.current = {
        escena: { x: e.left - s.left, y: e.top - s.top, ancho: e.width, alto: e.height },
        fraccion: e.height / s.height,
        anchoEscenario: s.width,
        stickers: etiquetas.map((etiqueta) => etiqueta?.offsetWidth ?? 0),
        angosta: consulta.matches,
      };
    }
    medir();
    const observador = new ResizeObserver(medir);
    observador.observe(escenario);
    observador.observe(escena);
    // Los stickers cambian de ancho cuando carga la fuente
    etiquetas.forEach((etiqueta) => etiqueta && observador.observe(etiqueta));
    return () => observador.disconnect();
  }, [cargar3d]);

  // En mobile, la raqueta arriba y el paso activo abajo llenan la pantalla
  // (100dvh): el escenario se queda con lo que no ocupa el texto del paso más
  // largo (--alto-texto, que mira el CSS). Se vuelve a medir si cambia el
  // ancho o carga la fuente. Con el dato plegado, se mide hasta «Ver más»:
  // abrir un dato alarga ese paso, pero no achica la raqueta.
  useEffect(() => {
    const raiz = refRaiz.current;
    const elementos = [...raiz.querySelectorAll("[data-paso]")];
    function medir() {
      let mayor = 0;
      for (const paso of elementos) {
        const { paddingTop, paddingBottom } = getComputedStyle(paso);
        const verMas = paso.querySelector("[data-ver-mas]");
        const hasta = verMas?.getClientRects().length ? verMas : paso.lastElementChild;
        const arriba = paso.firstElementChild.getBoundingClientRect().top;
        const abajo = hasta.getBoundingClientRect().bottom;
        mayor = Math.max(mayor, abajo - arriba + parseFloat(paddingTop) + parseFloat(paddingBottom));
      }
      if (mayor > 0) raiz.style.setProperty("--alto-texto", `${Math.ceil(mayor)}px`);
    }
    medir();
    const observador = new ResizeObserver(medir);
    elementos.forEach((paso) => [...paso.children].forEach((hijo) => observador.observe(hijo)));
    return () => observador.disconnect();
  }, []);

  // El dato abierto: si no entra entero debajo de la raqueta, la página baja
  // lo justo (sin deslizarse con prefers-reduced-motion), sin que el paso
  // deje la línea de lectura. Y se cierra solo cuando el paso deja esa línea:
  // al pasar a otra parte, vuelve plegado.
  useEffect(() => {
    if (abierto === null) return;
    const paso = refRaiz.current.querySelector(`[data-paso='${abierto}']`);
    const escenario = refEscenario.current;
    const mobile = window.matchMedia(MOBILE);
    let cuadro = 0;

    if (mostrarDato.current) {
      mostrarDato.current = false;
      const linea = lineaDeLectura(escenario, mobile);
      const { top, bottom } = paso.getBoundingClientRect();
      const tapa = escenario.getBoundingClientRect().bottom;
      const numero = paso.firstElementChild.getBoundingClientRect().top;
      const titulo = paso.querySelector("h3").getBoundingClientRect().top;
      const dato = paso.querySelector("[data-detalle]").getBoundingClientRect().bottom;
      // Lo que hay que bajar para ver el dato entero. Arriba del número hay
      // aire (el padding del paso): si alcanza, se baja dentro de ese aire y
      // no se tapa nada. Si no, el número queda entero debajo de la raqueta,
      // nunca cortado a la mitad.
      const falta = dato + AIRE_DATO - window.innerHeight;
      const libre = Math.max(0, numero - tapa);
      let bajar = 0;
      if (falta > 0) {
        bajar = falta <= libre ? falta : falta - AIRE_DATO <= libre ? libre : titulo - tapa - 4;
      }
      // Y sin que el paso deje la línea de lectura (con el teclado, el botón
      // puede ser el de un paso que todavía no llegó)
      bajar = Math.min(Math.max(bajar, top - linea), bottom - linea - 1);
      if (Math.abs(bajar) > 1) {
        const quieta = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        window.scrollBy({ top: bajar, behavior: quieta ? "auto" : "smooth" });
      }
    }

    function mirar() {
      cuadro = 0;
      const linea = lineaDeLectura(escenario, mobile);
      const { top, bottom } = paso.getBoundingClientRect();
      if (linea < top || linea > bottom) setAbierto(null);
    }
    function pedir() {
      if (!cuadro) cuadro = requestAnimationFrame(mirar);
    }
    window.addEventListener("scroll", pedir, { passive: true });
    return () => {
      cancelAnimationFrame(cuadro);
      window.removeEventListener("scroll", pedir);
    };
  }, [abierto]);

  // Pantalla completa: mientras el escenario está fijo arriba de todo, el
  // header se esconde (se desliza para arriba). Vuelve al salir de la
  // sección, para arriba o para abajo, y apenas se scrollea para arriba
  // adentro, para poder navegar. Se marca en <html> (data-sin-header), que es
  // lo que mira el header; con prefers-reduced-motion cambia sin deslizarse.
  // Si algo del header toma el foco (con Tab) también vuelve, pero no se queda
  // fijo por tener el foco: si no, después de tocar el logo (que queda con el
  // foco) no se escondía más.
  useEffect(() => {
    const anatomia = refAnatomia.current;
    const escenario = refEscenario.current;
    const html = document.documentElement;
    let ultimoY = window.scrollY;
    let cuadro = 0;

    function mirar() {
      cuadro = 0;
      const y = window.scrollY;
      const { top, bottom } = anatomia.getBoundingClientRect();
      // Con un píxel de tolerancia: justo al fijarse, top queda en fracciones
      const fija = top <= 1 && bottom >= escenario.offsetHeight;
      if (!fija || y < ultimoY - UMBRAL_SCROLL) html.removeAttribute("data-sin-header");
      else if (y > ultimoY + UMBRAL_SCROLL) html.setAttribute("data-sin-header", "");
      ultimoY = y;
    }
    function pedir() {
      if (!cuadro) cuadro = requestAnimationFrame(mirar);
    }
    function alFoco(evento) {
      if (evento.target.closest?.("[data-cabecera]")) html.removeAttribute("data-sin-header");
    }

    window.addEventListener("scroll", pedir, { passive: true });
    window.addEventListener("resize", pedir);
    document.addEventListener("focusin", alFoco);
    return () => {
      cancelAnimationFrame(cuadro);
      window.removeEventListener("scroll", pedir);
      window.removeEventListener("resize", pedir);
      document.removeEventListener("focusin", alFoco);
      html.removeAttribute("data-sin-header");
    };
  }, []);

  // Con la raqueta 3D en pantalla, el scroll decide el paso activo
  useEffect(() => {
    if (!modo3d) return;

    const raiz = refRaiz.current;
    const mobile = window.matchMedia(MOBILE);
    const elementosPasos = [...raiz.querySelectorAll("[data-paso]")];
    const bloqueCierre = raiz.querySelector("[data-cierre]");
    const escenario = refEscenario.current;

    // Progreso continuo: 0 con el primer paso en la línea de lectura, 1 con
    // el segundo, etc. De -1 (antes del primero) a pasos.length (después).
    function progreso() {
      const linea = lineaDeLectura(escenario, mobile);
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
      const linea = lineaDeLectura(escenario, mobile);
      const r = bloqueCierre.getBoundingClientRect();
      const resto = Math.max(0, escenario.getBoundingClientRect().bottom - linea);
      return limitar((linea - r.top) / Math.max(1, r.height - resto), 0, 1);
    }

    let estadoAnterior = "";
    let cuadro = 0;

    function marcar(indice, todos, final) {
      elementosPasos.forEach((el, i) => el.toggleAttribute("data-activo", i === indice));
      refMarcas.current.forEach((el, i) => el?.toggleAttribute("data-visible", todos || i === indice));
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
      data-plegable={plegable ? "" : undefined}
    >
      <div className={styles.contenido}>
        <header className={styles.encabezado}>
          <h2 id="titulo-anatomia" className={styles.titular}>
            {titulo}
          </h2>
          <p className={styles.bajada}>{bajada}</p>
        </header>

        <div className={styles.anatomia} ref={refAnatomia}>
          <div className={styles.escenario} ref={refEscenario}>
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
                {/* «03 / 11» en mobile, «03» en desktop. La lista ya dice
                    cuántas son a los lectores de pantalla. */}
                <span className={styles.numero} aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                  <span className={styles.total}> / {String(pasos.length).padStart(2, "0")}</span>
                </span>
                <h3 className={styles.titulo}>{paso.titulo}</h3>
                <p className={styles.frase}>{paso.frase}</p>
                {/* Solo en mobile chico: antes del dato, así al abrirlo lo
                    que sigue en el orden de lectura es el dato */}
                <button
                  type="button"
                  className={styles.verMas}
                  aria-expanded={abierto === i}
                  aria-controls={`dato-${paso.id}`}
                  data-ver-mas
                  onClick={() => {
                    mostrarDato.current = abierto !== i;
                    setAbierto(abierto === i ? null : i);
                  }}
                >
                  {abierto === i ? "Ver menos" : "Ver más"}
                </button>
                <p
                  id={`dato-${paso.id}`}
                  className={styles.dato}
                  data-detalle
                  data-abierto={abierto === i ? "" : undefined}
                >
                  {paso.dato}
                </p>
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
