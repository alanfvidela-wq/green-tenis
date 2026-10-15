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
no cierra sola (primer cuadro contra último: SSIM 0,58), así que el último
segundo se funde con el primero para que el loop no salte; el loop dura 5,88 s
(147 cuadros a 25 fps). La fuente es 4K: cada versión se recorta y se escala.

| Versión        | Recorte                                       | Salida         | Peso    | Loop (último vs primero) | Vecinos (mínimo) |
| -------------- | --------------------------------------------- | -------------- | ------- | ------------------------ | ---------------- |
| `hero-desktop` | El cuadro entero                              | 1920×1012, crf 20 | 3,15 MB | SSIM 0,93             | SSIM 0,75        |
| `hero-mobile`  | 9:16 a alto completo, que sigue al jugador    | 720×1280, crf 18  | 2,44 MB | SSIM 0,88             | SSIM 0,74        |

El jugador se mueve entre el 43% y el 79% del ancho, más de lo que entra en
un recorte fijo de 9:16. Por eso el recorte de mobile tiene puntos clave cada
20 cuadros (el centro del jugador) y se interpola entre ellos; termina donde
empieza, así el paneo también cierra el loop. La fuente no tiene cortes: entre
cuadros vecinos la similitud baja y sube de a poco (cámara en mano y grano).

## Modelo 3D de la raqueta

| Archivo                     | Origen                                   | Proceso                  |
| --------------------------- | ---------------------------------------- | ------------------------ |
| `public/models/raqueta.glb` | `modelos-fuente/raqueta.glb` (fuera de git) | `npm run modelo:raqueta` |

**Fuente**: export de Sketchfab, 19,13 MB. Tres mallas con un solo material
(`M_TAILS_MG05`) y tres texturas de 4096px (color, normales y
oclusión/rugosidad/metal):

- `Tails_PowerShoot_r_low`: el marco entero, con la garganta, el mango, el
  grip y la tapa (1.217 vértices).
- `Tails_PowerShoot_l_low` y `Tails_PowerShoot_lt_low`: el encordado, en dos
  mallas (1.986 y 1.400 vértices).

Viene acostado por una rotación en la raíz, que el código saca. Ya enderezada
mide 70,5 cm de la tapa a la punta y 28 cm de ancho, con el encordado de y = 32
a 69.

**Proceso**: gltf-transform `optimize` con meshopt, texturas WebP de 2048px,
sin simplificar ni unir mallas (así el encordado sigue aparte). Sale de
19,13 MB a 364 KB.

## Fotos de producto

Todavía no hay: la vitrina muestra el placeholder. Cuando estén, se anotan acá
con su sesión, siguiendo la especificación de «Fotos de producto» en
`DESIGN.md`.
