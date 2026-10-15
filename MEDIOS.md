# Medios — registro

Fotos y video del sitio, con su origen y cómo se procesaron, para poder
rehacerlos igual. Los originales quedan en `public/videos/fuentes/` (fuera de
git); lo que usa el sitio, en `public/videos/`.

## Video del hero

| Archivo                         | Origen                                     | Proceso              |
| ------------------------------- | ------------------------------------------ | -------------------- |
| `public/videos/hero-desktop.*`  | `public/videos/fuentes/tenis.mp4`          | `npm run video:hero` |
| `public/videos/hero-mobile.*`   | `public/videos/fuentes/tenis.mp4`          | `npm run video:hero` |

**Fuente**: un jugador de blanco en una cancha techada de polvo de ladrillo.
4096×2160, 25 fps, 6,88 s (172 cuadros), H.264, sin audio.

**Proceso** (`scripts/video-hero.mjs`): H.264 sin audio, de menos de 4 MB, con
`faststart`, y el poster de cada versión en WebP (su primer cuadro). La fuente
no cierra sola (primer cuadro contra último: SSIM 0,58), así que el final se
funde con el principio para que el loop no salte.

## Fotos de producto

Todavía no hay: la vitrina muestra el placeholder. Cuando estén, se anotan acá
con su sesión, siguiendo la especificación de «Fotos de producto» en
`DESIGN.md`.
