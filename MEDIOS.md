# Medios — registro

Fotos y video del sitio, con su origen y cómo se procesaron, para poder
rehacerlos igual. Los originales quedan en `public/videos/fuentes/` (fuera de
git); lo que usa el sitio, en `public/videos/`.

## Video del hero

Tres clips de cottonbro studio en Pexels, de la misma sesión: una cancha
techada de polvo de ladrillo, con el cartel «Sport Palace». Pasan en
secuencia, en este orden, con un fundido entre uno y otro (ver «Video» en
`DESIGN.md`). Los créditos están en `public/videos/fuentes/CREDITOS.txt`
(`archivo | autor | fuente | url`, como el de las fotos); el script los
anota en `lib/videosHero.json` y el footer los muestra.

| Clip      | Fuente (`public/videos/fuentes/`) | Pexels                                                                                       | Tramo                 | Qué se ve |
| --------- | --------------------------------- | -------------------------------------------------------------------------------------------- | --------------------- | --------- |
| `jugador` | `tenis.mp4`                       | [5740594](https://www.pexels.com/video/young-man-playing-tennis-5740594/)                    | 0 a 6,88 s (entero)   | El jugador de blanco y bigote, con la raqueta |
| `pique`   | `pexels-5730485.mp4`              | [5730485](https://www.pexels.com/video/caucasian-man-bouncing-a-ball-for-tennis-serve-5730485/) | 0 a 7 s, de 16,36 s   | El pique de la pelota antes del saque, en los pies; la cámara sube hasta el jugador. El saque (de 9,5 a 12 s) queda afuera |
| `derecha` | `pexels-5740600.mp4`              | [5740600](https://www.pexels.com/video/young-man-playing-tennis-5740600/)                    | 0 a 7,6 s (entero)    | El jugador de rojo pega una derecha frente al cartel y se acerca |

Las tres fuentes son 4096×2160, 25 fps, H.264, sin audio.

**Proceso** (`npm run video:hero`, `scripts/video-hero.mjs`): cada clip se
corta a su tramo, se recorta, se escala y sale en WebM (VP9) y MP4 (H.264, con
`faststart`), sin audio, con el poster en WebP (el primer cuadro del MP4).
Cada formato arranca con buena calidad y se comprime más hasta quedar debajo
del tope: 2,5 MB por archivo en desktop y 1,5 MB en mobile. La capa negra del
hero (55%) disimula la compresión. Ya no se funde el final de un clip con su
principio: el fundido entre clips lo hace el hero.

| Versión   | Recorte                                                  | Salida    |
| --------- | -------------------------------------------------------- | --------- |
| `desktop` | El cuadro entero                                         | 1920×1012 |
| `mobile`  | 9:16 a alto completo (1215×2160), que sigue al jugador   | 720×1280  |

El recorte de mobile, clip por clip:

- **jugador**: se mueve entre el 43% y el 79% del ancho, más de lo que entra
  en un recorte fijo. Puntos clave cada 20 cuadros (el centro del jugador),
  interpolados en línea recta.
- **pique**: fijo en x = 1400 (el 49%): los pies y después el jugador quedan
  siempre cerca del centro.
- **derecha**: puntos clave cada medio segundo o segundo. Al final el jugador
  está tan cerca de la cámara que la raqueta queda afuera del recorte.

| Clip      | Desktop WebM      | Desktop MP4       | Mobile WebM       | Mobile MP4        | Posters (desktop / mobile) |
| --------- | ----------------- | ----------------- | ----------------- | ----------------- | -------------------------- |
| `jugador` | 1,14 MB (crf 34)  | 1,98 MB (crf 24)  | 0,78 MB (crf 34)  | 1,25 MB (crf 24)  | 50 / 26 KB                 |
| `pique`   | 0,84 MB (crf 34)  | 1,90 MB (crf 22)  | 0,75 MB (crf 34)  | 1,37 MB (crf 22)  | 60 / 31 KB                 |
| `derecha` | 1,97 MB (crf 34)  | 2,26 MB (crf 26)  | 1,30 MB (crf 34)  | 1,33 MB (crf 26)  | 66 / 35 KB                 |

**Calidad**: contra la fuente escalada igual, el WebM queda a la par o mejor
que el MP4 pesando menos (SSIM de la derecha en desktop: 0,974 contra 0,966;
del jugador: 0,988 contra 0,987). Por eso el hero usa WebM cuando el navegador
lo reproduce, y MP4 si no (o si el WebM falla).

**Contraste**: con la capa al 55%, el texto blanco da 5,57:1 en el cuadro más
claro del jugador, 5,92:1 en el del pique y 7,03:1 en el de la derecha (un
cuadro cada medio segundo de las dos versiones, percentil 99 de la zona del
texto).

**Peso de la home** (build de producción, Chrome, sin caché al entrar ni
scroll):

| Ancho        | Antes (un video MP4) | Ahora, a los 5 s | Ahora, un ciclo entero |
| ------------ | -------------------- | ---------------- | ---------------------- |
| Desktop 1280 | 4,21 MB              | 3,09 MB          | 5,12 MB                |
| Mobile 375   | 3,44 MB              | 2,55 MB          | 3,88 MB                |

A los 5 s ya bajó el segundo clip, que carga mientras se ve el primero; el
tercero baja cuando arranca el segundo. En la segunda vuelta los clips salen
del caché (0 MB). Un navegador sin WebM baja los MP4: unos 5 MB a los 5 s y
7,3 MB en un ciclo en desktop, y 3,6 y 5 MB en mobile.

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
