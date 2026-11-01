"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { CLIPS_HERO, CORTE_MOBILE } from "@/lib/heroVideo";

const sinSuscripcion = () => () => {};

// Cuánto dura el fundido entre un clip y el siguiente, en segundos
const FUNDIDO = 0.8;

// Los clips del hero, en secuencia. Dos <video> apilados se turnan: mientras
// uno se reproduce, el otro carga el clip que sigue (al entrar solo carga el
// primero). Cuando al que se ve le queda FUNDIDO, el siguiente arranca encima
// y aparece: su opacidad sigue a su propio tiempo, así la pausa también
// congela el fundido. Después del último vuelve al primero. Elige la versión
// según el ancho y el formato (WebM si el navegador lo reproduce; si no, o si
// falla, MP4), y no se monta con prefers-reduced-motion (queda solo el poster
// del primero, del servidor).
export default function VideoFondo({ className, claseVideos, claseBoton, claseIcono }) {
  // En el servidor y durante la hidratación no hay video
  const montado = useSyncExternalStore(sinSuscripcion, () => true, () => false);
  const reducido = useMediaQuery("(prefers-reduced-motion: reduce)");
  const mobile = useMediaQuery(CORTE_MOBILE);
  const [pausado, setPausado] = useState(false);
  const primero = useRef(null);
  const segundo = useRef(null);
  // La secuencia la maneja el efecto; el botón la pausa y la reanuda por acá
  const control = useRef(null);

  const version = mobile ? "mobile" : "desktop";
  const conVideo = montado && !reducido && CLIPS_HERO.length > 0;

  useEffect(() => {
    if (!conVideo) return;
    const total = CLIPS_HERO.length;
    const videos = [primero.current, segundo.current];
    let webm = videos[0].canPlayType('video/webm; codecs="vp9"') === "probably";
    let [actual, siguiente] = videos;
    let indice = 0;
    let fundiendo = false;
    let quieto = false;
    let cuadro = 0;

    const cargar = (video, i) => {
      const clip = CLIPS_HERO[i % total][version];
      video.dataset.indice = String(i % total);
      video.poster = clip.poster;
      video.src = webm ? clip.webm : clip.mp4;
      video.load();
    };
    const reproducir = (video) =>
      video.play().catch((error) => {
        // Sin permiso para reproducir solo: queda en pausa, con el botón
        if (error.name === "NotAllowedError") {
          quieto = true;
          setPausado(true);
        }
      });

    // Si el WebM no anda, todo pasa a MP4 desde el clip que falló
    const alFallar = (evento) => {
      if (!webm) return;
      webm = false;
      const video = evento.currentTarget;
      cargar(video, Number(video.dataset.indice));
      if (video === actual && !quieto) reproducir(video);
    };
    // Cuando arranca el que se ve, el otro carga el que sigue
    const alArrancar = (evento) => {
      if (evento.currentTarget !== actual || total < 2 || fundiendo) return;
      const proximo = (indice + 1) % total;
      if (siguiente.dataset.indice !== String(proximo)) cargar(siguiente, proximo);
    };

    const paso = () => {
      cuadro = requestAnimationFrame(paso);
      if (quieto || total < 2) return;
      if (!fundiendo) {
        const queda = actual.duration - actual.currentTime;
        // Si el siguiente todavía no puede arrancar, el que se ve queda en su
        // último cuadro hasta que pueda
        if (queda <= FUNDIDO && siguiente.readyState >= 3) {
          fundiendo = true;
          siguiente.currentTime = 0;
          siguiente.style.zIndex = "1";
          actual.style.zIndex = "0";
          reproducir(siguiente);
        }
        return;
      }
      const opacidad = Math.min(1, siguiente.currentTime / FUNDIDO);
      siguiente.style.opacity = String(opacidad);
      if (opacidad < 1) return;
      // Terminó el fundido: el que entró pasa a ser el que se ve, y el otro
      // se apaga y carga el que sigue
      actual.pause();
      actual.style.opacity = "0";
      [actual, siguiente] = [siguiente, actual];
      indice = (indice + 1) % total;
      fundiendo = false;
      cargar(siguiente, indice + 1);
    };

    for (const video of videos) {
      // Por las dudas: algunos navegadores solo reproducen solos si muted es propiedad
      video.muted = true;
      video.addEventListener("error", alFallar);
      video.addEventListener("playing", alArrancar);
    }
    actual.style.opacity = "1";
    siguiente.style.opacity = "0";
    actual.loop = total < 2;
    cargar(actual, 0);
    reproducir(actual);
    cuadro = requestAnimationFrame(paso);

    control.current = {
      pausar() {
        quieto = true;
        actual.pause();
        if (fundiendo) siguiente.pause();
      },
      seguir() {
        quieto = false;
        reproducir(actual);
        if (fundiendo) reproducir(siguiente);
      },
    };
    // Al cambiar de versión, la secuencia arranca de nuevo, en pausa si lo estaba
    if (pausado) control.current.pausar();

    return () => {
      cancelAnimationFrame(cuadro);
      control.current = null;
      for (const video of videos) {
        video.removeEventListener("error", alFallar);
        video.removeEventListener("playing", alArrancar);
        video.pause();
        // Corta la descarga del que estaba cargando
        video.removeAttribute("src");
        video.load();
      }
    };
    // La pausa se lee al arrancar, no reinicia la secuencia
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conVideo, version]);

  if (!conVideo) return null;

  function alternar() {
    if (pausado) control.current?.seguir();
    else control.current?.pausar();
    setPausado(!pausado);
  }

  const propiedades = {
    className,
    muted: true,
    playsInline: true,
    preload: "auto",
    "aria-hidden": "true",
    tabIndex: -1,
  };

  return (
    <>
      <div className={claseVideos}>
        <video ref={primero} {...propiedades} />
        <video ref={segundo} {...propiedades} />
      </div>
      <button
        type="button"
        className={claseBoton}
        onClick={alternar}
        aria-label={pausado ? "Reproducir el video" : "Pausar el video"}
      >
        <svg className={claseIcono} viewBox="0 0 24 24" aria-hidden="true">
          {pausado ? (
            <path d="M8 5.5v13l10.5-6.5z" fill="currentColor" />
          ) : (
            <path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" fill="currentColor" />
          )}
        </svg>
      </button>
    </>
  );
}
