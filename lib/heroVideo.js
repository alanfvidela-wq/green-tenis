// Clips del hero de la home: pasan en secuencia, con un fundido entre uno y
// otro (VideoFondo). Los genera npm run video:hero (ver MEDIOS.md) en
// lib/videosHero.json, con sus créditos (el footer los muestra).
// El corte también está en components/Hero.module.css.
import generados from "./videosHero.json";

export const CORTE_MOBILE = "(max-width: 760px)";

// Cada clip: { nombre, duracion, desktop: { mp4, webm, poster }, mobile: {…} }.
// El poster del primero es el que se ve antes del video y con
// prefers-reduced-motion.
export const CLIPS_HERO = generados.clips;

export const CREDITOS_VIDEOS = generados.creditos;
