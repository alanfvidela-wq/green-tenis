# green. — Sistema de diseño

green. es una tienda de tenis que se lee como un catálogo de diseño industrial:
blanco y negro, una sola nota de color lima (el amarillo de la pelota) y
productos que traen todo el color que falta. Una grotesca suiza en un solo
peso hace el trabajo tonal; las líneas de 1px ordenan la página donde otros
sitios usarían cajas y sombras.

## Referencias y precedencia

- `docs/referencias/twotwo.md` **manda en la identidad**: blanco y negro con un
  único acento lima, grotesca suiza, botones en píldora, navegación en
  mayúsculas con tracking, sin sombras ni degradados.
- `docs/referencias/teenage-engineering.md` **manda solo en la vitrina de
  productos**: fondo de estudio casi blanco, grilla separada por líneas de 1px,
  el nombre chico arriba a la izquierda y el producto como único objeto con
  color.
- **Si chocan, gana twotwo** (por ejemplo, en los radios y en el color de las
  líneas).
- De esas marcas no se copian textos, logos ni nombres. Los valores de color y
  las fuentes de este documento son propios.

## Reglas de la estética

1. **Blanco y negro, más lima.** Todo es blanco, negro o gris. El único color
   de la interfaz es el lima, y es funcional: acción principal, estado activo,
   hover, el titular del hero y la pelota del logo. Nunca de fondo de sección,
   nunca de decoración.
2. **El color lo traen los productos.** Ningún texto, línea ni bloque compite
   con ellos.
3. **Líneas, no sombras.** Las superficies se separan con líneas de 1px negras
   o con espacio. Cero sombras, cero degradados, cero texturas.
4. **Dos radios y nada más.** 50px para lo que se toca, 16px para lo que se
   mira (ver «Radios»).
5. **Un solo peso.** Inter Tight 400 en todo. La jerarquía sale del tamaño y
   del gris, nunca de la negrita.
6. **La navegación va en mayúsculas.** 13px, tracking 0,06em. El resto del
   texto va en sentence case.
7. **Texto a la izquierda.** Solo se centran el titular del hero y los
   encabezados de estado (404, error).
8. **Una frase por lugar.** Títulos cortos, bajadas de 34 a 46 caracteres de
   ancho y, si hace falta, una acción.

## Paleta

| Token        | Nombre   | Hex       | Uso                                                          |
| ------------ | -------- | --------- | ------------------------------------------------------------ |
| `--blanco`   | Blanco   | `#FFFFFF` | Fondo de todas las páginas                                   |
| `--negro`    | Negro    | `#000000` | Texto, líneas de 1px, footer, cinta                          |
| `--grafito`  | Grafito  | `#333333` | Texto secundario: bajadas, variantes, legales                |
| `--hormigon` | Hormigón | `#E6E6E6` | El único gris de fondo: opciones sin stock, botones apagados |
| `--estudio`  | Estudio  | `#F4F5F2` | Solo la vitrina: el fondo de estudio de cada celda           |
| `--lima`     | Lima     | `#DCF900` | Acción principal, activo, hover, titular del hero, pelota    |

- **Lima** es el amarillo de una pelota nueva. Siempre va sobre negro o lleva
  texto negro encima; **nunca es texto sobre blanco** (1,2:1, no se lee).
- **Estudio** es casi blanco con un pelo de verde, como el papel sin fin de un
  estudio. Es lo bastante distinto del blanco para que la vitrina se lea como
  un bloque, y no es un color: no se usa fuera de la vitrina.

Contrastes (WCAG): negro sobre blanco 21:1, negro sobre lima 17,6:1, lima
sobre negro 17,6:1, grafito sobre blanco 12,6:1, grafito sobre estudio 11,5:1,
negro sobre hormigón 16,7:1.

## Tipografía

| Rol   | Fuente         | Uso                                                        |
| ----- | -------------- | ---------------------------------------------------------- |
| Todo  | Inter Tight    | Un solo peso (400): titulares, texto, navegación y botones |
| Datos | JetBrains Mono | 400: precios, talles, contadores y la ficha técnica        |

Inter Tight es la alternativa gratuita (Google Fonts) a una grotesca suiza
como Whyte: compacta, neutra y con buen color a tamaño display. JetBrains Mono
hace de voz técnica para los números, como una etiqueta de fábrica.

### Escala

| Token          | Tamaño                     | Uso                                              |
| -------------- | -------------------------- | ------------------------------------------------ |
| `--t-dato`     | 0.8125rem (13px)           | Navegación, nombre en la vitrina, legales, datos |
| `--t-texto`    | 1rem                       | Texto corrido, botones                           |
| `--t-entrada`  | 1.125rem                   | Bajadas y descripciones                          |
| `--t-titulo-3` | 1.375rem                   | Filas de categorías, ficha técnica               |
| `--t-titulo-2` | clamp(2.375rem, 5vw, 4rem) | Títulos de sección y de producto                 |
| `--t-titulo-1` | clamp(3rem, 8vw, 6rem)     | Hero, categoría, 404 y error                     |

Interlineado: 1.05 en display, 1.15 en títulos, 1.6 en texto. Tracking −0,02em
en los títulos; 0,06em en la navegación en mayúsculas.

### Wordmark

«green.» en minúscula, en Inter Tight con tracking −0,04em. El punto es una
**pelota de tenis**: un círculo lima con sus dos costuras en negro, en SVG, del
tamaño de un punto grande. Las costuras hacen que la pelota se lea también
sobre blanco. El componente es `Logo`; el link lleva `aria-label="green."`.

- Header: en negro sobre blanco; en blanco sobre el video.
- Footer: gigante (hasta 12rem), en blanco sobre negro.
- Favicon: la pelota sola, en `app/icon.svg`.

## Radios

Dos valores y nada más. El radio dice qué se toca y qué no.

- **50px (píldora)** para lo interactivo: botones, carrito, opciones del
  selector y etiquetas.
- **16px** para lo estático: el marco de la vitrina, la galería de producto y
  cualquier bloque.

Nada de 4px, 8px ni 24px. Las celdas de adentro de la vitrina son rectas: el
radio es del marco, no de cada celda.

## Botones

- **`.boton`**: la acción principal. Píldora lima, texto negro, sin borde,
  mínimo 48px de alto (56px en el hero). Hover: negro con texto lima.
- **`.boton-secundario`**: píldora blanca con borde de 1px negro y texto negro.
  Hover: lima.
- **Sobre el video, solo lima.** Un botón blanco o negro sobre una foto pierde
  la única señal de la marca.
- Deshabilitado: hormigón con texto grafito.

## Header

- **Sin línea.** Wordmark a la izquierda, las seis categorías en mayúsculas y
  el carrito a la derecha.
- **Carrito**: píldora «Carrito (0)» con borde de 1px negro. Sobre el video,
  píldora lima. La cantidad se lee en el servidor (`lib/carrito.js`).
- **Fijo y flotante.** En la home arranca transparente sobre el video, con el
  texto en blanco. Al scrollear (un poco antes de terminar el hero) pasa a
  fondo blanco y texto negro, con una transición de 300ms. En las demás páginas
  es blanco desde el principio. Mide su alto y lo publica en `--alto-header`.
- Al pasar el mouse, los links se subrayan.

## Estructura de la home

1. **Hero**: el video a pantalla completa (100svh), con el header flotando
   encima. Ver «Hero».
2. **Cinta** (negro): las leyendas de la casa en mayúsculas blancas, corriendo
   de derecha a izquierda, separadas por pelotitas lima. Se frena con el mouse
   encima.
3. **Manifiesto** (blanco): dos líneas display, la segunda corrida a la
   derecha, y una frase corta.
4. **Lo que más sale** (blanco): los seis destacados en la vitrina, en tres
   columnas (dos filas llenas).
5. **Categorías** (blanco): una fila por categoría, separadas por líneas de
   1px: nombre, bajada y cantidad. Al pasar el mouse, la fila se pinta lima.
6. **Footer** (negro).

Todo va sobre blanco; las secciones se separan con aire, no con fondos
alternados. El negro aparece solo en la cinta y en el footer. El contenido
editorial (leyendas) está en `lib/home.js`.

## Hero

- **Video**: un jugador de blanco en una cancha techada de polvo de ladrillo,
  en loop y sin audio. Ver «Video».
- **Capa plana**: negro al 40% sobre el video, pareja en toda la pantalla. No
  es un degradado; está para que el titular lima se lea sobre la cancha clara.
- **Titular** centrado, en lima, a `--t-titulo-1`. Debajo, una frase corta en
  blanco y la píldora lima.
- **Poster**: el primer cuadro de cada versión en WebP, pintado por el servidor
  en un `<picture>`. El video se monta encima desde un componente cliente
  (`VideoFondo`), que elige la versión según el ancho (corte en 760px).
- **Control**: círculo blanco sin borde con el ícono de pausa/play en negro,
  abajo a la derecha, con etiqueta accesible.

## Vitrina de productos

Adapta de teenage engineering solo esto: un catálogo bajo luz de estudio,
donde el producto es lo único con color y todo lo demás se dice en voz baja.
Lo que choca con twotwo (radios, color de las líneas) sigue a twotwo.

**Dónde va.** La grilla de cada categoría y cualquier listado de productos
(`GrillaProductos` + `TarjetaProducto`), «Lo que más sale» en la home y la
galería de `/producto/[slug]` (`GaleriaProducto`). La foto de cada celda la
pone `FotoVitrina`. La pantalla de carga dibuja la misma grilla vacía.

### La grilla

- **Marco**: borde de 1px negro y radio de 16px, con `overflow: hidden`. Es el
  único radio de la vitrina.
- **Celdas pegadas**, sin espacio, separadas por líneas de 1px negras. Cada
  celda dibuja su línea derecha y la de abajo; la lista se corre 1px hacia
  afuera para que esas líneas, en el borde, queden debajo del marco y no se
  dupliquen. Una fila incompleta termina limpia.
- **Columnas**: 2 en mobile (dentro del gutter: con radio, la vitrina no va de
  borde a borde), 3 desde 700px y 4 desde 1000px en los listados. La home se
  queda en 3: seis destacados, dos filas llenas.
- **Proporción**: cada celda es 4:5 vertical, la misma que la foto.

### La celda

- **Fondo de estudio**: plano liso en `--estudio`.
- **Arriba a la izquierda, a 13px**: el nombre (dos líneas como máximo) y,
  debajo, la variante en grafito, en una línea: la marca y las opciones
  («Babolat, 6 opciones», «Wilson, en negro o blanco»).
- **Abajo**: el precio a la izquierda, en JetBrains Mono, y «Comprar» a la
  derecha, en mayúsculas a 13px: un link discreto en negro que se subraya al
  pasar el mouse. En celdas de menos de 240px van uno abajo del otro, en todas
  por igual. Toda la celda es un solo link a la página del producto.
- **Cero sombras, cero degradados**, sin etiquetas encima. Ningún texto ni
  línea lleva color: **el producto es el único objeto con color**.

### Estados

- **Hover**: el producto se acerca apenas (escala 1,04, 400ms) y «Comprar» se
  subraya. El fondo no cambia: la foto lo trae puesto.
- **Foco**: lo mismo que el hover, más el contorno de foco de 3px negro dibujado
  por dentro de la celda (`outline-offset: -3px`), para que no lo tape la
  vecina.
- **Sin stock**: el producto pierde el color (escala de grises y opacidad 0,5)
  y «Sin stock» ocupa el lugar de «Comprar», con el mismo estilo. El texto lo
  dice también para lectores de pantalla.
- Con `prefers-reduced-motion` el producto no se mueve: quedan el subrayado y el
  foco.

### La galería del producto

En `/producto/[slug]` las fotos van en las mismas celdas de estudio 4:5, dentro
del mismo marco de 1px y 16px de radio, sin texto encima. La primera vista va
grande; si hay más, van de a dos debajo. En escritorio queda fija mientras se
lee la ficha y nunca es más alta que la pantalla. Acá el producto no se apaga
aunque no haya stock: eso lo dice el selector de opciones, al lado.

## Fotos de producto

### Especificación de las fotos de estudio

Todas las fotos de la vitrina salen de la misma sesión: puestas una al lado de
la otra, tienen que parecer la misma foto con distinto producto.

- **Fondo**: papel sin fin liso, sin textura, viñeta ni degradado. En la
  edición se lleva a `#F4F5F2` (`--estudio`) parejo en toda la foto (±2
  niveles en los bordes), así la foto se funde con la celda.
- **Proporción**: 4:5 vertical. Se entrega a 1600×2000 px, WebP calidad 82,
  sRGB.
- **Producto centrado** en la **caja de producto**: del 14% al 86% del ancho y
  del 26% al 86% del alto (en 1600×2000: x 224–1376, y 520–1720). Toca la caja
  por su lado más largo. Arriba queda aire para el nombre y abajo para el
  precio: nada del producto entra en esas franjas.
- **Encuadre por categoría**:
  - Raquetas: de frente, verticales, con la cabeza arriba y sin funda.
  - Zapatillas: el pie derecho de perfil, del lado de afuera, con la punta a la
    derecha.
  - Pelotas: el tubo cerrado, parado, con una pelota suelta al lado.
  - Cuerdas y grips: el set o el rollo de frente, en su envase.
  - Bolsos: parados, de frente, con los cierres cerrados.
  - Ropa: en maniquí invisible, de frente.
- **Misma luz**: una fuente grande y difusa arriba a la izquierda (a 45°),
  relleno suave desde la derecha, 5000 K, la misma exposición para todo el
  catálogo. Solo la sombra natural, corta y suave, donde el producto apoya.
- **Misma cámara**: equivalente a 100 mm, a la altura del centro del producto.
- **Vistas**: la primera es la de catálogo. Se pueden sumar vistas de detalle
  para la galería (el puente de la raqueta, la suela), con la misma luz, el
  mismo fondo y la misma caja.
- **Archivos**: `public/productos/estudio/<slug>-1.webp`, `-2.webp`, etc.,
  listados en `fotos` del producto en `lib/productos.js`. Con `fotos` cargadas,
  `FotoVitrina` las usa enteras (`object-fit: cover`).

### Mientras tanto: placeholder

Hasta que estén las fotos de estudio, **toda la vitrina muestra el
placeholder**: `FotoVitrina` dibuja la celda 4:5 en `--estudio` con la silueta
plana de la categoría (raqueta, zapatilla, tubo de pelotas, rollo de cuerda,
bolso raquetero o remera) en negro al 6%, centrada en la caja de producto. Sin
texto, sin ícono de imagen rota, sin líneas ni degradados. Es decorativo
(`aria-hidden`): el nombre ya está en la celda. Las fotos reemplazan al
placeholder solas, producto por producto. Sin stock, la silueta se lava igual
que una foto.

## Video

El loop del hero sale de `public/videos/fuentes/tenis.mp4` (fuera de git) con
`npm run video:hero` (`scripts/video-hero.mjs`): H.264 sin audio, de menos de
4 MB, con un fundido cruzado entre el final y el principio para que el loop no
salte. Hay dos versiones: `hero-desktop` (el cuadro entero, escalado) y
`hero-mobile` (un recorte 9:16 sobre el jugador). Cada una tiene su poster en
WebP (el primer cuadro). El detalle y el control del loop están en `MEDIOS.md`.

## Páginas

- **Categoría**: fondo blanco. Migas en mayúsculas, el nombre a `--t-titulo-1`,
  la bajada en grafito y la cantidad en mono. Debajo, la vitrina.
- **Producto**: la galería a la izquierda y, a la derecha, la marca en
  mayúsculas, el nombre a `--t-titulo-2`, la descripción, la **ficha técnica**
  (filas separadas por líneas de 1px, el dato en mono), el precio y el
  selector: opciones en píldora con borde de 1px, la activa en lima y las que
  no tienen stock en hormigón. «Agregar al carrito» es la píldora lima.
- **Carga**: «Peloteando…» y la vitrina vacía.
- **Error y 404**: tipográficos, sin dibujos. El código gigante, un título, una
  frase y la píldora para volver.

## Footer

Banda negra a todo el ancho. El wordmark gigante en blanco con su pelota lima,
una frase, las categorías en mayúsculas y los legales a 13px. Sin líneas de
color ni íconos sociales.

## Voz

Rioplatense, breve y con humor tenístico sin forzar. Una frase por lugar, no un
chiste por línea. Tono: «El que pierde paga las pelotas», «Cuarenta iguales»,
«Pelota nueva, excusa vieja», «Doble falta», «Se fue larga». Se habla de vos y
en presente.

## Movimiento

Poco y con sentido. Nada entra con fundido y desplazamiento genérico.

- **Hero**: el loop del video. Se puede pausar.
- **Cinta**: corre sola; se frena con el mouse encima.
- **Vitrina**: el producto se acerca apenas con el hover o el foco.
- **Categorías**: la fila se pinta lima al pasar el mouse.
- **Header**: pasa de transparente a blanco con una transición suave.
- Con `prefers-reduced-motion` el hero muestra solo el poster, la cinta queda
  quieta (y baja de línea si no entra) y no hay animaciones ni transiciones.

## Accesibilidad

- Contraste AA en todo el texto. El lima nunca es texto sobre blanco.
- Foco de 3px en negro sobre blanco y en lima sobre negro (cinta, footer,
  hero).
- Navegación completa con teclado, un solo paso de Tab por producto y salto al
  contenido.
- Layout fluido desde 320px.

## Evitar

| Evitar                                   | Cómo se resuelve                                                      |
| ---------------------------------------- | --------------------------------------------------------------------- |
| Un segundo color en la interfaz          | Blanco, negro, grises y lima. El resto del color es de los productos  |
| Sombras, resplandores, degradados        | Líneas de 1px y bloques planos. La capa del hero es negra y pareja    |
| Negritas para jerarquizar                | Un solo peso; la jerarquía sale del tamaño y del gris                 |
| Radios intermedios (4, 8, 24px)          | 50px para lo que se toca, 16px para lo que se mira                    |
| Tarjetas con sombra y radio en la grilla | La vitrina: celdas pegadas dentro de un marco de 1px                  |
| Ilustraciones, íconos decorativos, 3D    | Fotos de producto (o su placeholder) y tipografía                     |
| Lima de fondo o lima sobre lima          | El lima va sobre negro o lleva texto negro; nunca de fondo de sección |
| Texto centrado en párrafos y productos   | A la izquierda; solo se centran el hero y los estados                 |
