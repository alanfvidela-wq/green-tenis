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
- `docs/referencias/slush.md` **manda solo en la sección «Anatomía de una
  raqueta»**: volumen inflado, stickers, tipografía enorme y flotación. Es una
  excepción acotada, con su propia paleta y sus propias reglas (ver
  «Excepción: Anatomía de una raqueta»).
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
8. **Textos que describen.** Títulos cortos y bajadas que dicen qué hay. Sin
   slogans, leyendas ni frases inventadas (ver «Voz»).

Estas reglas valen para todo el sitio menos «Anatomía de una raqueta», que es
una excepción acotada con reglas propias. La regla 8 vale también ahí.

## Paleta

| Token        | Nombre   | Hex       | Uso                                                          |
| ------------ | -------- | --------- | ------------------------------------------------------------ |
| `--blanco`   | Blanco   | `#FFFFFF` | Fondo de todas las páginas                                   |
| `--negro`    | Negro    | `#000000` | Texto, líneas de 1px, footer                                 |
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
| Todo  | Inter Tight    | Un solo peso (400): titulares, texto, navegación y botones. El 800 es solo de la excepción de la anatomía |
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
2. **Lo que más sale** (blanco): los seis destacados en la vitrina, en tres
   columnas (dos filas llenas).
3. **Anatomía de una raqueta** (azul de cancha, de borde a borde): la
   raqueta inflada, fija, y un paso por parte con el scroll. Es la única
   sección con otro estilo; ver «Excepción: Anatomía de una raqueta».
4. **Categorías** (blanco): una fila por categoría, separadas por líneas de
   1px: nombre, bajada y cantidad. Al pasar el mouse, la fila se pinta lima.
5. **Footer** (negro).

Todo va sobre blanco (menos la anatomía, que va sobre azul); las secciones
se separan con aire, no con fondos alternados. El negro aparece solo en el
footer. No hay cintas con leyendas ni
bloques de slogan: la home muestra productos, cómo es una raqueta y las
categorías.

## Hero

- **Video**: un jugador de blanco en una cancha techada de polvo de ladrillo,
  en loop y sin audio. Ver «Video».
- **Capa plana**: negro al 40% sobre el video, pareja en toda la pantalla. No
  es un degradado; está para que el titular lima se lea sobre la cancha clara.
- **Titular** centrado, en lima, a `--t-titulo-1`: «Todo para jugar al
  tenis». Debajo, qué se vende, en blanco, y la píldora lima.
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

## Componente `Raqueta`

La raqueta de frente y vertical, dibujada en SVG con código
(`components/Raqueta.js`). Es reutilizable: la usa la anatomía y la va a usar
«Armá tu raqueta».

- **Partes**: cada una es un grupo (`data-parte`) que se puede resaltar o animar
  por separado: aro, encordado (16 verticales × 19 horizontales, calculadas
  desde el patrón), punto dulce (una zona, no una pieza), antivibrador,
  garganta, mango, grip, overgrip y tapa.
- **Props**: `resaltadas` (las partes en lima), `estilo`, `encuadre`
  (`ajustado`, solo la raqueta, o `lienzo`, 400×560 con aire para las
  etiquetas) y `prefijo` (para los ids de los degradados si hay más de una en
  la página). Exporta `ANCLAS` (el punto de cada parte), `PATRON` y `LIENZO`.
- **Estilo `linea`** (el del sitio, el que va en «Armá tu raqueta»): línea
  negra de 1,5px sobre blanco, sin rellenos. Es un dibujo técnico, no una
  ilustración. Resaltar es poner un marcador lima debajo de la línea (sobre
  blanco, una línea lima sola no se leería); el resto baja a gris (negro al
  28%). Las cuerdas llevan un marcador más fino para no volverse una mancha.
- **Estilo `inflada`**: solo para la anatomía (ver abajo).

## Excepción: Anatomía de una raqueta

Una sección de la home, entre «Lo que más sale» y «Categorías», que explica la
raqueta parte por parte. **Es la única sección que no sigue este documento**:
toma de `docs/referencias/slush.md` el volumen inflado, los stickers, la
tipografía enorme y la flotación, adaptados a green. Lo que no está en esta
sección sigue las reglas generales. No se copian textos, logos ni
ilustraciones de esa referencia, ni su arcoíris de colores.

### Color y fondo

| Token           | Hex       | Uso                                                       |
| --------------- | --------- | --------------------------------------------------------- |
| `--azul-cancha` | `#A3C4E8` | El fondo de la sección, de borde a borde: un azul pastel de cancha rápida |
| `--blanco`      | `#FFFFFF` | La raqueta, los stickers inactivos y el nombre gigante    |
| `--negro`       | `#000000` | Contornos, texto, líneas guía                             |
| `--lima`        | `#DCF900` | La pelota, la parte activa y el sticker activo            |

- **Nada más**: ni el resto del arcoíris de la referencia ni grises.
- **Corte limpio**: la sección entra y sale con un borde recto, sin ola, sin
  degradado y sin línea. Arriba y abajo está el blanco del resto de la home.
- Contrastes: negro sobre el azul 11,6:1. El blanco sobre el azul (1,8:1) solo
  se usa en el nombre gigante, que es decorativo y repite el título del paso.

### La raqueta inflada

- **Plástico blando**: cada parte tiene cuerpo, con degradados suaves (blanco
  que va a un azul muy pálido, con la luz arriba a la izquierda; cilindros más
  claros en el centro), un brillo blanco donde pega la luz y un **contorno
  negro grueso** (2,6 unidades por lado, unos 3px).
- **Textura de ruido**: un PNG chico y estático (`public/texturas/ruido.png`)
  aplicado como patrón sobre los cuerpos. No es un filtro SVG y no se anima.
- **Resaltar es pasar a lima**: la parte activa cambia a su versión lima
  (degradado lima con el mismo volumen); el resto queda al 35% de opacidad.
- **La pelota**: una pelota de tenis inflada, lima con contorno y costuras
  negras, flota arriba a la izquierda. Es lo único lima cuando no hay paso
  activo.

### Stickers y tipografía

- **Stickers**: cada parte se nombra con un sticker: borde negro de 3px, forma
  de píldora o de esquinas redondeadas (14px), apenas rotado (±2 a 4°), en
  mayúsculas, Inter Tight 800. El del paso activo es lima; sin JavaScript o
  sin movimiento, todos son blancos. Lo une a su parte una línea guía negra de
  3px que sale de un punto blanco con borde negro. Nunca va sobre una zona lima.
- **Nombre gigante**: el nombre de la parte activa, enorme y apretado (Inter
  Tight 800, interlineado 0.8, tracking −0,045em), en blanco, detrás de la
  raqueta.
- **Titular y pasos**: el titular de la sección en Inter Tight 800,
  interlineado 0.8; los títulos de los pasos también en 800, interlineado
  0.85. El dato técnico va en mono y el texto, en 400.
- Fuera de esta sección, el 800 no se usa.

### Estructura

- **Desktop**: la raqueta queda fija (sticky) a la izquierda, en un escenario
  del alto de la pantalla, y los pasos van pasando a la derecha, uno por
  pantalla. **Mobile**: la raqueta fija arriba (46% del alto, de borde a
  borde) y los pasos abajo.
- **Un paso por parte, de arriba hacia abajo**: contorno, encordado, punto
  dulce, garganta, mango y grip, overgrip y tapa. Cada paso tiene el número,
  el nombre de la parte (`h3`), un dato técnico concreto en mono (patrón 16×19
  contra 18×20, tamaños de grip, largo de 27″) y una frase corta que dice qué
  cambia en el juego. El antivibrador se resalta con el encordado. Los pasos
  están en `lib/anatomia.js`.
- **Todo el texto es HTML** (títulos y párrafos), nunca texto dentro del SVG.
  Los stickers y el nombre gigante también son HTML y repiten el título del
  paso, por eso van ocultos para lectores de pantalla.

### Movimiento

- **La cámara**: un `transform` (translate y scale) sobre la raqueta, que va de
  parte en parte con el scroll. El paso que cruza la línea de lectura (el
  centro de la pantalla; en mobile, el centro de lo que queda debajo de la
  raqueta) decide adónde mira; la cámara se acerca y se mueve con entrada y
  salida suaves y un poco de inercia. Es continuo: entre un paso y otro está
  en el medio. Antes del primer paso y después del último se ve la raqueta
  entera.
- **Al activarse un paso**: su parte pasa a lima, el resto se desvanece, el
  sticker entra flotando (sube, se endereza y crece, con un rebote corto) y el
  nombre gigante aparece detrás. El paso activo se lee entero y los demás
  bajan al 35%.
- **Movimientos propios**: las cuerdas crecen una tras otra (primero las
  verticales) al llegar al encordado; el punto dulce late suave (escala 1,1
  cada 1,8 s) mientras está activo; el overgrip se enrolla vuelta por vuelta,
  de abajo hacia arriba, al llegar a su paso.
- **Flotación y parallax**: la raqueta sube y baja 7px y rota ±0,8° cada 6
  segundos; cada sticker flota a su ritmo; la pelota sube, baja y gira con el
  scroll; el nombre gigante se queda un poco atrás de la raqueta.

### Rendimiento

- **Solo se anima `transform` y `opacity`**: la cámara, los stickers y sus
  líneas (posicionados en unidades del contenedor, `cqw`/`cqh`), las cuerdas
  (`scale`), el overgrip, el parallax y las apariciones. Nada de `left`,
  `top`, `viewBox` ni `stroke-dashoffset`.
- La textura de ruido es estática y ningún elemento animado lleva filtros SVG.
- Mientras la cámara se mueve, va en su propia capa (`will-change: transform`);
  cuando se queda quieta se saca, para que se repinte nítida al zoom en que
  quedó.
- **Sin librerías**: un componente cliente (`AnatomiaRaqueta`) mide el scroll
  con `requestAnimationFrame`. No usa `animation-timeline`, que Firefox no
  soporta: funciona igual en Chrome, Safari y Firefox.

### Sin movimiento

Con `prefers-reduced-motion` (o sin JavaScript): la raqueta inflada entera,
quieta, sin parte activa, con las cuerdas y el overgrip puestos y los siete
stickers a la vista, en blanco, cada uno con su línea guía. No flota nada.

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
`hero-mobile` (un recorte 9:16 que sigue al jugador). Cada una tiene su poster en
WebP (el primer cuadro). El detalle y el control del loop están en `MEDIOS.md`.

## Páginas

- **Categoría**: fondo blanco. Migas en mayúsculas, el nombre a `--t-titulo-1`,
  la bajada en grafito y la cantidad en mono. Debajo, la vitrina.
- **Producto**: la galería a la izquierda y, a la derecha, la marca en
  mayúsculas, el nombre a `--t-titulo-2`, la descripción, la **ficha técnica**
  (filas separadas por líneas de 1px, el dato en mono), el precio y el
  selector: opciones en píldora con borde de 1px, la activa en lima y las que
  no tienen stock en hormigón. «Agregar al carrito» es la píldora lima.
- **Carga**: «Cargando…» y la vitrina vacía.
- **Error y 404**: tipográficos, sin dibujos. El código gigante, un título que
  dice qué pasó («Página no encontrada», «Algo salió mal») y la píldora para
  volver.

## Footer

Banda negra a todo el ancho. El wordmark gigante en blanco con su pelota lima,
las categorías en mayúsculas y los legales a 13px. Sin líneas de
color ni íconos sociales.

## Voz

Sencilla y descriptiva, en castellano rioplatense (de vos). Los textos dicen
qué es cada cosa: «Todo para jugar al tenis», «Raquetas de potencia con un
punto dulce amplio», «Página no encontrada». Sin slogans, leyendas, chistes ni
frases inventadas. Las descripciones de producto cuentan para qué sirve y qué
lo distingue, en una o dos oraciones.

## Movimiento

Poco y con sentido. Nada entra con fundido y desplazamiento genérico.

- **Hero**: el loop del video. Se puede pausar.
- **Vitrina**: el producto se acerca apenas con el hover o el foco.
- **Anatomía de una raqueta**: la cámara sigue al scroll y todo flota. Ver
  «Excepción: Anatomía de una raqueta».
- **Categorías**: la fila se pinta lima al pasar el mouse.
- **Header**: pasa de transparente a blanco con una transición suave.
- Con `prefers-reduced-motion` el hero muestra solo el poster, la anatomía
  muestra la raqueta entera y quieta con todos sus stickers, y no hay
  animaciones ni transiciones.

## Accesibilidad

- Contraste AA en todo el texto. El lima nunca es texto sobre blanco.
- Foco de 3px en negro sobre blanco y en lima sobre negro (footer, hero).
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
| Ilustraciones, íconos decorativos, 3D    | Fotos de producto (o su placeholder) y tipografía. Las únicas excepciones son la raqueta (componente `Raqueta`) y la pelota de la anatomía |
| Lima de fondo o lima sobre lima          | El lima va sobre negro o lleva texto negro; nunca de fondo de sección |
| Texto centrado en párrafos y productos   | A la izquierda; solo se centran el hero y los estados                 |
| Slogans, leyendas y frases inventadas    | Textos que describen qué hay y para qué sirve                         |
