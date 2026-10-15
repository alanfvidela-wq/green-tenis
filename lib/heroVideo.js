// Videos del hero de la home: la cancha de tenis en loop (npm run video:hero,
// ver MEDIOS.md).
// Si `src` es null se ve solo el poster.
// El corte también está en components/Hero.module.css.
export const CORTE_MOBILE = "(max-width: 760px)";

export const VIDEOS_HERO = {
  desktop: { src: "/videos/hero-desktop.mp4", poster: "/videos/hero-desktop.webp" },
  mobile: { src: "/videos/hero-mobile.mp4", poster: "/videos/hero-mobile.webp" },
};
