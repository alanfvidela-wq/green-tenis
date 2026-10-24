# green. — Sistema de diseño

green. es una tienda de tenis que se ve como una cancha: polvo de ladrillo,
cancha rápida, césped y líneas blancas, con el lima de la pelota como color de
marca y de acción. Los titulares son enormes y apretados, como objetos; las
etiquetas son stickers con borde; los botones y la navegación, píldoras que se
tocan. Las superficies de color llevan un grano quieto, y las fotos aparecen
inclinadas al scrollear. Cálida, colorida y con tacto, sin perder la lectura:
todo el texto pasa AA y los productos se siguen viendo sobre fondo de estudio.

## Referencias y precedencia

- **Este documento manda.** Las referencias son inspiración: de ellas no se
  copian textos, logos, ilustraciones, fotos ni colores. Los valores de acá son
  propios.
- `docs/referencias/slush.md`: la display enorme y apretada, los stickers con
  borde, los botones y la navegación en píldora, la flotación.
- `docs/referencias/hungry-tiger.md`: el lienzo cálido y saturado, los
  titulares que ocupan la pantalla, los recuadros de fotos inclinados que se
  enderezan con el scroll, la navegación en píldoras opacas y los separadores
  punteados.
- `docs/referencias/twotwo.md` y `docs/referencias/teenage-engineering.md` son
  **históricas**: describen el sistema anterior (blanco y negro con un lima,
  vitrina de líneas de 1px). No mandan en nada.
- Las capturas de terceros (`docs/referencias/capturas/`) no van al repo.

## Reglas de la estética

1. **Cada sección juega en una superficie**: polvo, cancha o césped, o un
   neutro (cal o tinta). Nunca hay más de dos superficies de color a la vista.
2. **Sobre polvo, cancha y césped, todo el texto es tinta.** El lima es color
   de marca y de acción: relleno con texto tinta, nunca texto sobre claro.
3. **La display hace de objeto.** Mayúsculas pesadas y condensadas, enormes y
   apretadas, solo en titulares. El texto corrido es Inter Tight.
4. **Tacto, no adorno.** Bordes de 2px en tinta, píldoras, stickers, un grano
   quieto y motivos de tenis como marca de agua. Sin sombras ni degradados.
5. **Una escala para todo**: cuatro radios, tres bordes, una escala de
   espacios de 4px.
6. **Moderación**: como mucho tres recursos decorativos por pantalla, de no más
   de dos tipos (ver «Moderación»).
7. **El producto se ve sobre estudio.** Las celdas de la vitrina siguen en el
   fondo neutro de estudio, apoyadas sobre las superficies de color.
8. **Textos que describen.** Títulos cortos y bajadas que dicen qué hay; los
   stickers nombran lo que se ve. Sin slogans (ver «Voz»).
9. **Movimiento con sentido**, solo con `transform` y `opacity`, y nada con
   `prefers-reduced-motion`.

## Paleta: las superficies del tenis

| Token | Nombre | Hex | Uso |
| --- | --- | --- | --- |
| `--polvo` | Polvo de ladrillo | `#D46C3F` | La base cálida de la marca: «Lo que más sale», listados, estados (404, error, pagos) |
| `--cancha` | Cancha rápida | `#5A8FE6` | «Anatomía de una raqueta» y su banda de fotos |
| `--cesped` | Césped | `#5A9E4A` | Categorías y su banda de fotos |
| `--cal` | Cal | `#FBF6EE` | Neutro cálido: producto, carrito, cuenta, checkout y pedidos |
| `--blanco` | Blanco | `#FFFFFF` | Las líneas: marcas de agua, relleno de píldoras, campos y stickers |
| `--estudio` | Estudio | `#F4F5F2` | Solo las celdas de la vitrina (las fotos se editan a este valor) |
| `--tinta` | Tinta | `#1A1411` | Negro cálido: el texto, los bordes, el footer |
| `--grafito` | Grafito | `#4A403A` | Texto secundario, solo sobre cal, blanco y estudio |
| `--hormigon` | Hormigón | `#E6E6E6` | Botones y opciones apagados |
| `--lima` | Lima | `#DCF900` | Marca y acción: botón principal, activo, stickers, la pelota |

- **Superficies de color**: polvo, cancha y césped (y los placeholders de
  fotos, que llevan esos colores). **Neutros**: cal, blanco, estudio y tinta.
- El polvo es naranja tierra, no ladrillo oscuro: con un tono más oscuro el
  texto tinta no llegaría a AA y el blanco tampoco.

### Contrastes

WCAG 2.1, calculados con estos valores (la muestra los calcula igual). Sobre
polvo, cancha y césped el número entre paréntesis es el peor píxel con el grano
(ver «Texturas»): el que oscurece el fondo para el texto oscuro y el que lo
aclara para el texto claro.

| Fondo | Tinta | Grafito | Blanco | Lima |
| --- | --- | --- | --- | --- |
| Polvo | **5,22 (4,51)** | 2,88 | 3,49 (3,15) | 2,92 |
| Cancha | **5,65 (4,87)** | 3,12 | 3,23 (2,91) | 2,70 |
| Césped | **5,58 (4,81)** | 3,08 | 3,27 (2,94) | 2,74 |
| Cal | **16,94** | **9,36** | 1,08 | 1,11 |
| Blanco | **18,23** | **10,07** | — | 1,19 |
| Estudio | **16,66** | **9,20** | 1,09 | 1,09 |
| Hormigón | **14,60** | **8,07** | 1,25 | 1,05 |
| Tinta | — | 1,81 | **18,23** | **15,27** |
| Lima | **15,27** | 8,44 | 1,19 | — |
| Video del hero, con la capa | — | — | **4,71** | **3,94** (titular grande) |

**En negrita, las combinaciones permitidas.** Todo lo demás no se usa como
texto:

- Lima como texto sobre cualquier fondo claro o de color (1,1 a 2,9).
- Blanco como texto sobre polvo, cancha o césped (2,9 a 3,5): solo como dibujo
  decorativo y oculto para lectores de pantalla (el nombre gigante de la
  anatomía, las marcas de agua).
- Grafito sobre superficies de color (2,7 a 3,1): sobre color, la jerarquía
  sale del tamaño y del peso, no del gris.

Los bordes de 2px en tinta dan el contraste de componente (3:1) contra las
superficies: 5,22 sobre polvo, 5,65 sobre cancha, 5,58 sobre césped. El lima de
relleno no llega solo (2,7 a 2,9 sobre las superficies, 1,1 sobre cal), por eso
todo lo lima lleva borde tinta.

### Dos superficies como máximo

- En una pantalla nunca hay más de dos superficies de color. Dos secciones de
  color seguidas se pueden tocar; si van tres, la del medio mide al menos
  `100svh` o se separan con un neutro.
- Los placeholders de fotos cuentan; las fotos reales no.

### Mapa de superficies

| Página | Superficie |
| --- | --- |
| Home | Hero (video, capa de tinta) → «Lo que más sale» en polvo → fotos (banda 1, sobre polvo) → Anatomía en cancha → fotos (banda 2, sobre cancha) → Categorías en césped → fotos (banda 3, sobre césped) → footer en tinta |
| Categoría y combos | Encabezado y vitrina en polvo |
| Producto, combo, carrito, cuenta, checkout, pedidos | Cal |
| 404, error, páginas de pago | Polvo |
| Carga | Cal, con la vitrina vacía |
| Footer | Tinta |

### Foco

Anillo de 3px a 3px de distancia, del color `--foco` que pone cada superficie:
tinta sobre las claras y las de color, lima sobre tinta y sobre el video.
Dentro de la vitrina, el anillo va por fuera del borde de la tarjeta.

## Tipografía

| Rol | Fuente | Uso |
| --- | --- | --- |
| Display | **Archivo**, variable, ancho 62 y peso 900 | Titulares, en mayúsculas: hero, secciones, títulos de página, nombres de categoría, pasos de la anatomía, códigos de error, el wordmark |
| Texto | Inter Tight 400 y 600 | Texto corrido (400); botones, navegación, stickers, etiquetas y nombres de producto (600) |
| Datos | JetBrains Mono 400 | Precios, contadores, fechas y la ficha técnica |

Las tres van con `next/font` (Google Fonts, sin archivos propios), que reserva
el espacio con una fuente de respaldo ajustada: el cambio de fuente no mueve
nada.

### La display

Se probaron tres, con el mismo titular, en `/muestra`:

- **Archivo** (ancho 62, peso 900): la elegida. Es una grotesca como Inter
  Tight, así que conviven sin chocar; es la más cercana a la display de Slush;
  un solo archivo variable con eje de ancho (se puede abrir en tamaños chicos) y
  acentos completos.
- Anton (400): la más de afiche, pero tiene un solo ancho y las mayúsculas más
  altas: sus tildes suben hasta 1,11em y piden interlineado 1,14.
- Big Shoulders (Display, peso 900): la más angosta, de cartel de estadio; se
  aleja del tenis. Además, next/font no tiene sus métricas para ajustar la
  fuente de respaldo, así que al cargar movería el texto.

Uso: **siempre en mayúsculas** (`text-transform`, el texto se escribe normal),
`font-stretch: 62%`, peso 900, tracking 0, `text-wrap: balance`. Nunca por
debajo de 2rem ni en párrafos.

**Interlineado: 0,92.** El 0,8 de Slush pisa los acentos del castellano: en
Archivo, las mayúsculas acentuadas (Á É Í Ó Ú Ñ) suben hasta 0,89em sobre la
línea de base, así que con menos de 0,9 la tilde de una línea toca la de
arriba. 0,92 es el mínimo con aire (las mayúsculas miden 0,69em: entre línea y
línea quedan 0,23em). En títulos de una sola línea (el nombre gigante de la
anatomía) puede bajar a 0,8.

### Escala

| Token | Tamaño | Uso |
| --- | --- | --- |
| `--t-dato` | 0.8125rem (13px) | Navegación, stickers, etiquetas, legales, datos |
| `--t-chico` | 0.875rem | Botones, nombres en la vitrina, notas |
| `--t-texto` | 1rem | Texto corrido |
| `--t-entrada` | clamp(1.0625rem, 1.3vw, 1.25rem) | Bajadas |
| `--t-titulo` | clamp(1.25rem, 2vw, 1.625rem) | Subtítulos en Inter Tight 600 |
| `--t-display-4` | clamp(2rem, 4vw, 3.25rem) | Pasos, filas de categorías, nombres de producto |
| `--t-display-3` | clamp(2.75rem, 6.5vw, 5.5rem) | Títulos de página y de bloque |
| `--t-display-2` | clamp(3.5rem, 10vw, 9rem) | Títulos de sección de la home |
| `--t-display-1` | clamp(4.5rem, min(15vw, 17svh), 14rem) | Hero, 404 y error. Depende también del alto, así el hero entra en una pantalla |

Interlineado: 0,92 en la display, 1,2 en subtítulos, 1,5 en bajadas, 1,6 en
texto. Tracking: 0,04em en las mayúsculas de Inter Tight (navegación,
botones, stickers), −0,01em en subtítulos.

### Wordmark

«green.» en minúscula, en la display (Archivo 900, ancho 62), con el punto
como **pelota de tenis**: el círculo lima con sus dos costuras en negro
(`Pelota`), a 0,34em, sobre la línea de base. Con ese tamaño el trazo de las
costuras queda en unos 2px. La display le da peso de logo sin perder la
pelota.

- Header: tinta sobre cal; blanco sobre el video.
- Footer: gigante (hasta 12rem), en blanco sobre tinta.
- Favicon: la pelota sola, en `app/icon.svg`.

## Escala única: radios, bordes y espacios

- **Radios** (`--radio-foto`, `--radio-sticker`, `--radio-bloque`,
  `--radio-pildora`):
  - 6px: los recuadros de las fotos al scrollear.
  - 12px: stickers de esquinas y recuadros de error.
  - 20px: tarjetas, la galería de producto, el resumen, paneles y muestras de
    color.
  - 999px (píldora): todo lo que se toca (botones, navegación, opciones,
    campos, «Comprar») y los stickers píldora.
- **Bordes** (`--borde-fino`, `--borde`, `--borde-grueso`), siempre en tinta
  (blanco sobre tinta):
  - 1px: filas de tablas (pedidos, carrito, totales, ficha técnica).
  - 2px: píldoras, botones, campos, stickers, tarjetas, recuadros de fotos.
  - 3px: el anillo de foco y las líneas guía de la anatomía.
- **Espacios**: múltiplos de 4px, `--espacio-1` (4px) a `--espacio-32`
  (128px): 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 96 y 128. El gutter es
  `clamp(1rem, 4vw, 2rem)` y el ancho máximo del contenido, 1280px.

En la fase 1 del rediseño conviven nombres provisorios en `globals.css`
(`--grafito-calido`, `--radio-redondo`) con los viejos; en la fase 2 quedan los
de este documento.

## Texturas y motivos

- **Grano**: `public/texturas/ruido.png` (128px, gris con alfa de hasta 16%)
  como capa quieta al 50% (`::before`, detrás del contenido), solo sobre polvo,
  cancha, césped y los placeholders. No se anima ni es un filtro. Mezcla cada
  píxel con hasta un 7,8% de negro o de blanco; los contrastes de arriba ya lo
  cuentan.
- **Marcas de agua**: dibujos de línea en blanco al 28%, con trazo fijo
  (`vector-effect: non-scaling-stroke`), detrás del texto y recortados por la
  sección (`Superficie`, prop `marca`):
  - `lineas`: una cancha vista desde arriba (dobles, singles, red, saque,
    central), enorme y girada −8°. Para polvo y cancha.
  - `costuras`: una pelota gigante con sus dos costuras, asomando por un
    costado. Para césped.
  Al ser más claras que la superficie, el texto tinta gana contraste en vez de
  perderlo.
- **Sin degradados ni sombras.** La única excepción es el volumen de la
  raqueta inflada y de la pelota de la anatomía, que es dibujo, no fondo.

## Moderación

En una misma pantalla (lo que entra en el viewport), como máximo **tres
recursos decorativos, de no más de dos tipos**:

- 1 marca de agua;
- 2 stickers girados;
- 2 fotos inclinadas (1 en mobile). Cada foto cuenta con su etiqueta.

No cuentan los stickers derechos de estado dentro de tarjetas y filas, ni el
grano. Una sección con fotos inclinadas no lleva marca de agua. La anatomía es
la excepción: sus stickers nombran las partes (son información), así que esa
pantalla no lleva marca de agua ni fotos.

## Componentes

### Botones

- **Principal**: píldora lima con borde de 2px tinta y texto tinta, Inter
  Tight 600 en mayúsculas a 14px con tracking 0,04em, mínimo 48px de alto (56px
  en el hero). Hover: tinta con texto lima y sube 2px; al apretar, baja 1px.
- **Secundario**: transparente con borde de 2px tinta; hover, blanco.
- **Sobre tinta o video**: el principal sigue lima; el secundario lleva borde y
  texto blancos (hover: blanco con texto tinta).
- **Apagado**: hormigón con borde y texto grafito.
- Con `prefers-reduced-motion`, sin subir ni bajar: solo cambia el color.

### Navegación en píldoras (header)

- Cada link es una **píldora blanca opaca** de 44px con borde de 2px tinta,
  Inter Tight 600 en mayúsculas a 13px: se lee igual sobre el video y sobre
  cualquier superficie. La sección activa va en lima; el carrito, siempre en
  lima («Carrito (0)», con `BotonCarrito`).
- A la izquierda el wordmark; en el medio las cuatro categorías y «Combos»; a
  la derecha «Mi cuenta» y el carrito.
- **Fijo**. En la home arranca sin fondo sobre el video; al scrollear (un poco
  antes de terminar el hero) pasa a banda cal con un separador punteado abajo.
  En las demás páginas es cal desde el principio. La lógica de
  `CabeceraFlotante` no cambia: mide su alto y lo publica en `--alto-header`.
- Por debajo de 1100px las secciones bajan a una segunda fila con scroll
  horizontal; por debajo de 520px las píldoras se achican (12px de texto)
  sin bajar de 44px de alto.

### Stickers

Para etiquetas y estados; no son interactivos (`Sticker`).

- Inter Tight 600 en mayúsculas a 13px, tracking 0,04em, borde de 2px tinta,
  píldora o esquinas de 12px.
- **Tonos**: lima (activo, nuevo, pagado, recomendado), blanco (pendiente,
  informativo, pago en proceso), tinta con texto blanco (sin stock,
  cancelado, vencido). El texto siempre dice el estado: el color no es la
  única señal.
- **Giro**: derechos dentro de tarjetas y filas; girados entre −3° y 3° solo
  como acento, y cuentan para la moderación.

### Separador punteado

Puntos de 4px cada 12px (`Separador`, una máscara sobre `currentColor`): tinta
en las superficies claras y de color, blanco sobre tinta. Va entre bloques
grandes: debajo del header, antes de los títulos de sección, entre filas de
categorías y arriba del footer. Las filas de las tablas siguen con 1px.

### Campos

Píldora blanca de 48px con borde de 2px tinta y texto a 16px; la etiqueta,
arriba, en Inter Tight 600 en mayúsculas a 13px. El error va debajo, en un
recuadro blanco con borde de 2px y radio de 12px, en 600, ligado con
`aria-describedby` y `aria-invalid`. Los campos de contraseña llevan el ojo
adentro, a la derecha (ver «Cuenta»).

## Movimiento

Poco y con sentido. Solo `transform` y `opacity`; nada de `top`, `left`,
`width` ni filtros en lo que se mueve.

- **Hero**: el loop del video. Se puede pausar.
- **Tacto**: los botones suben 2px con el hover; las tarjetas de la vitrina
  suben 4px y se inclinan −1°, y el producto se acerca (1,04).
- **Fotos al scrollear**: entran y se enderezan atadas al scroll (ver «Fotos
  al scrollear»).
- **Anatomía de una raqueta**: la cámara sigue al scroll y todo flota (ver esa
  sección).
- **Header**: pasa de transparente a cal con una transición de 300ms.
- **Con `prefers-reduced-motion`**: el hero muestra solo el poster, las fotos
  quedan quietas en su giro final, la anatomía muestra la raqueta entera y
  quieta con todos sus stickers, y no hay animaciones ni transiciones.

## Fotos al scrollear

Recuadros de fotos inclinados, intercalados entre las secciones de la home, que
entran con el scroll y se enderezan.

### Los lugares

`lib/fotos.js` define 10 lugares, mitad gente jugando y mitad objetos, con
nombre de archivo (`partido-polvo-01`, `pelota-linea-02`…), proporción
(4:5, 3:2 o 1:1), descripción de qué foto buscar, etiqueta, giro, parallax,
banda, lado y si se ve en mobile. La lista para conseguirlas y cómo agregarlas
está en `docs/FOTOS.md`.

### Bandas

- Tres bandas en la home: la 1 sobre polvo (después de «Lo que más sale»), la 2
  sobre cancha (después de la anatomía) y la 3 sobre césped (antes del
  footer). Cada una es su propio bloque (`BandaFotos`): las fotos nunca salen de
  su banda, nunca pisan texto ni botones y no reciben clics.
- Cada lugar ocupa 80svh, con la foto en zigzag (derecha, izquierda, centro):
  así nunca hay más de dos fotos a la vista. El recuadro mide hasta 56svh de
  alto: 30vw de ancho las verticales, 42vw las horizontales, 32vw las
  cuadradas.
- **Mobile** (menos de 760px): una foto por banda (las de `mobile: true`),
  centrada, a 76vw (88vw las horizontales).
- La banda es decorativa: va oculta para lectores de pantalla.

### El recuadro

- La caja de afuera queda quieta y reserva el espacio con la proporción
  exacta: nada se mueve en el layout. El recuadro de adentro es el que gira y
  se mueve.
- Borde de 2px tinta, radio de 6px y, encima del borde de arriba, la
  etiqueta: el número en un círculo tinta con el número en lima y un sticker
  blanco que nombra lo que se ve («Polvo de ladrillo», «Saque»).
- **Giro en reposo** entre −4° y 4°; con la entrada llega como mucho a ±6°.

### Placeholder

Hasta que esté la foto, el recuadro muestra un bloque del mismo tamaño, giro y
movimiento, en el color de la superficie de la sección que viene (banda 1:
cancha; banda 2: césped; banda 3: polvo), así se distingue del fondo y nunca
hay más de dos superficies a la vista. Lleva grano, el nombre del archivo con la
proporción en mono y la descripción en texto chico, en tinta. Las fotos
reemplazan al placeholder solas, lugar por lugar.

### Movimiento

`MovimientoFotos` (cliente) envuelve la banda y no dibuja nada: mide la caja
quieta en cada `requestAnimationFrame` y escribe el `transform` del recuadro.
Solo escucha el scroll mientras la banda está cerca de la pantalla
(IntersectionObserver).

- **Desktop**: la foto asoma desde 80px más abajo, girada 3° más (hacia el
  mismo lado) y a escala 0,92, y en la primera mitad de su recorrido se asienta
  en su giro y a escala 1. Encima, un parallax propio (`velocidad`, de 0,06 a
  0,16 del alto de la pantalla), distinto en cada foto. Sin fundido: el
  placeholder nunca se mezcla con el fondo.
- **Mobile**: solo la entrada vertical (48px), con el giro fijo.
- **Sin movimiento o sin JavaScript**: quietas en su giro final.

### Archivos y rendimiento

- Las fotos fuente van en `public/fotos/fuente/` (fuera de git) y
  `npm run fotos` (`scripts/fotos.mjs`, con sharp) genera AVIF y WebP a 480,
  800, 1200 y 1600px en `public/fotos/`, recortados a la proporción del lugar,
  más el blur de carga, y lo anota todo en `lib/fotosGeneradas.json`. La página
  mira ese manifiesto (no la carpeta, que no llega a Vercel) para elegir entre
  la foto y el placeholder.
- `FotoLugar` arma un `<picture>` con AVIF y WebP de respaldo usando
  `getImageProps` de next/image: `sizes` por orientación, lazy, y el blur del
  manifiesto de fondo mientras carga.
- **Créditos**: en `public/fotos/fuente/CREDITOS.txt` (`archivo | autor |
  fuente | url`); el script los pasa al manifiesto y el footer los muestra en
  una línea («Fotos: …»). Si no hay fotos, no se muestra nada.

## Estructura de la home

1. **Hero**: el video a pantalla completa, con el header flotando encima. Ver
   «Hero».
2. **Lo que más sale** (polvo, con marca de agua de líneas): título en
   `--t-display-2` y los seis destacados en la vitrina, en tres columnas.
3. **Fotos**, banda 1 (sobre polvo).
4. **Anatomía de una raqueta** (cancha). Ver esa sección.
5. **Fotos**, banda 2 (sobre cancha).
6. **Categorías** (césped, con marca de agua de costuras): una fila por
   categoría, separadas por puntos: el nombre en `--t-display-4`, la bajada y la
   cantidad en mono. Al pasar el mouse, la fila se pinta lima.
7. **Fotos**, banda 3 (sobre césped).
8. **Footer** (tinta).

La home muestra productos, cómo es una raqueta y las categorías: no hay cintas
con leyendas ni bloques de slogan.

## Hero

- **Video**: un jugador de blanco en una cancha techada de polvo de ladrillo,
  en loop y sin audio. Ver «Video».
- **Capa plana de tinta al 55%**, pareja en toda la pantalla (no es un
  degradado). Medida sobre el poster y sobre un cuadro cada medio segundo de
  las dos versiones del video: en el cuadro más claro, el percentil 99 de la
  zona del texto da 3,94:1 para el lima (el titular es display grande: alcanza
  con 3:1) y 4,71:1 para el blanco de la bajada. Con la capa al 40% de antes
  daba 2,57 y 3,07.
- **Titular** centrado, en lima, en la display a `--t-display-1`, en tres
  líneas («Todo para / jugar al / tenis»: ancho máximo 5,5em). Debajo, qué se
  vende, en blanco, y la píldora lima de 56px.
- La navegación en píldoras flota arriba, opaca.
- **Poster**: el primer cuadro de cada versión en WebP, pintado por el servidor
  en un `<picture>`. El video se monta encima desde un componente cliente
  (`VideoFondo`), que elige la versión según el ancho (corte en 760px).
- **Control**: círculo blanco con borde de 2px tinta y el ícono de pausa/play,
  abajo a la derecha, con etiqueta accesible.

## Vitrina de productos

El producto se ve sobre fondo de estudio, en tarjetas sueltas apoyadas sobre
la superficie de la sección.

**Dónde va.** La grilla de cada categoría y cualquier listado de productos
(`GrillaProductos` + `TarjetaProducto`), el listado de combos
(`TarjetaCombo`), «Lo que más sale» en la home y la galería de
`/producto/[slug]` y `/combo/[slug]` (`GaleriaProducto`). La foto de cada
tarjeta la pone `FotoVitrina`. La pantalla de carga dibuja la misma grilla
vacía.

### La grilla

- **Tarjetas sueltas** separadas 16px (12px en mobile), sobre la superficie.
- **Columnas**: 2 en mobile, 3 desde 700px y 4 desde 1000px en los listados.
  La home se queda en 3: seis destacados, dos filas llenas.
- **Proporción**: cada tarjeta es 4:5 vertical, la misma que la foto.

### La tarjeta

- Fondo de estudio, borde de 2px tinta, radio de 20px. Toda la tarjeta es un
  solo link a la página del producto.
- **Arriba a la izquierda**: el nombre en Inter Tight 600 a 14px (dos líneas
  como máximo) y, debajo, la variante en grafito, en una línea («Babolat, 6
  opciones»).
- **Abajo**: el precio a la izquierda, en mono, y a la derecha «Comprar» en una
  píldora chica blanca con borde, que se pinta lima con el hover. En tarjetas
  de menos de 240px queda solo el precio. Sin stock, en lugar de «Comprar» va
  el sticker tinta «Sin stock».
- Sin sombras ni degradados. El producto es el único objeto con color dentro de
  la tarjeta.

### Estados

- **Hover y foco**: la tarjeta sube 4px y se inclina −1°, el producto se
  acerca (escala 1,04, 400ms) y «Comprar» se pinta lima. El foco agrega el
  anillo de 3px por fuera del borde.
- **Sin stock**: el producto pierde el color (escala de grises y opacidad 0,5) y
  va el sticker «Sin stock». El texto lo dice también para lectores de
  pantalla.
- Con `prefers-reduced-motion`, nada se mueve: queda el cambio de color y el
  foco.

### La galería del producto

En `/producto/[slug]` las fotos van en celdas de estudio 4:5, dentro de un
marco de 2px tinta y 20px de radio, sin texto encima. La primera vista va
grande; si hay más, van de a dos debajo. En escritorio queda fija mientras se
lee la ficha y nunca es más alta que la pantalla. Acá el producto no se apaga
aunque no haya stock: eso lo dice el selector de opciones, al lado.

## Combos

Kits armados por la tienda («Kit para arrancar»: raqueta, tubo de pelotas y
overgrip) con un descuento sobre la suma de sus productos. Se muestran y se
venden como un producto más, con las mismas piezas.

- **Precio y stock** (`lib/combos.js`): se calculan en el servidor a partir de
  los ítems. El precio es la suma menos el descuento redondeado para abajo (la
  misma cuenta que hace `crear_pedido` en la base). El stock es cuántos combos
  alcanzan con el ítem más escaso. Si un ítem tiene variantes (grip y peso), el
  cliente elige una: el precio de cada combinación llega calculado y la página
  solo muestra el que corresponde. Un combo con algún producto inactivo no se
  muestra.
- **La tarjeta** (`TarjetaCombo`): la misma de la vitrina. La línea de la
  variante dice cuántos productos trae y el descuento («3 productos, 10 %
  menos»), y el precio es el del combo («desde» si cambia con las opciones). El
  descuento va en el texto; un sticker derecho «10 % menos» puede acompañarlo
  junto al precio, nunca sobre la foto. Sin foto propia, el placeholder es el de
  su primer producto.
- **El listado** (`/combos`): como una categoría, sobre polvo. Migas,
  «Combos» a `--t-display-3`, la bajada, la cantidad y la vitrina. Va en el
  header y en el footer, después de las categorías.
- **La página** (`/combo/[slug]`): como la de producto, sobre cal. La galería
  muestra las fotos del combo, si tiene, y después la primera de cada producto.
  A la derecha:
  - «Combo» en mayúsculas, el nombre y la descripción;
  - la ficha «Qué trae»: una fila por producto, que lleva a su página, con la
    cantidad y la variante («1 × Tubo x3») o «a elección»;
  - el precio del combo y, debajo en grafito, cuánto sale por separado y cuánto
    se ahorra;
  - un grupo de opciones por cada producto a elegir, con las mismas píldoras
    que el selector de producto (`OpcionesVariante`). Ninguno arranca elegido:
    hasta que se elige todo, el precio es el «desde», debajo dice «10 % menos
    que por separado» y, bajo el botón, qué falta elegir;
  - «Agregar al carrito», apagado hasta que no falte nada.

## Carrito

- **Dónde vive**: en el navegador (`localStorage`), con solo ids y cantidades:
  la variante de un producto suelto, o el combo con la variante elegida de cada
  ítem (`lib/lineas.js`, `useCarrito`). Nunca guarda precios.
- **Quién pone los precios**: el servidor. `cotizarCarrito` (Server Action en
  `lib/carrito.js`) lee de Supabase los precios, el descuento de cada combo (la
  misma cuenta que `crear_pedido`) y el stock, sumando lo que se pide de cada
  variante entre sueltos y combos. Lo que no alcanza, lo que ya no está a la
  venta o lo que falta elegir lo dice en la línea.
- **Agregar**: «Agregar al carrito» suma una unidad y, debajo, dice «Agregado
  al carrito. Ver carrito». Si ya estaba, suma a la misma línea.
- **La página** (`/carrito`, sobre cal): título en `--t-display-3`. Las líneas
  van separadas por 1px:
  - la tarjeta de estudio chica (borde de 2px, radio de 12px), con la foto o la
    silueta;
  - la marca (o «Combo») en mayúsculas, el nombre en 600 y, en grafito, la
    variante o lo que trae el combo;
  - lo que impide comprarla, en un recuadro blanco con borde de 2px y radio de
    12px, como los errores de los campos;
  - la cantidad en una píldora (− n +, con tope por stock) y «Quitar»;
  - el subtotal en mono y, en los combos, cuánto se ahorra.
- **El resumen**, a la derecha (abajo en mobile), fijo mientras se scrollea: un
  bloque blanco con borde de 2px y radio de 20px, con subtotal, descuento de
  combos, envío («Gratis» por ahora) y total en filas de 1px (`Totales`, el
  mismo en el checkout y en los pedidos), y «Ir a pagar» (lima), apagado
  mientras se recalcula o si alguna línea tiene un problema.
- **Vacío**: «Tu carrito está vacío» y la píldora «Ver raquetas».

## Cuenta

- **Con email y contraseña** (Supabase Auth, sin confirmación por mail: al
  crear la cuenta ya queda la sesión iniciada). La contraseña tiene al menos 8
  caracteres; lo controla el formulario y también Supabase. Al crear la cuenta
  (y al elegir una nueva) se escribe dos veces: si lo repetido no coincide,
  debajo dice «Las contraseñas no coinciden» en el momento y el formulario no
  se envía (`CamposContrasena`); el servidor lo vuelve a revisar.
- **Mostrar la contraseña**: cada campo de contraseña (`EntradaContrasena`)
  lleva adentro, a la derecha, un ojo de línea fina en tinta (SVG en línea,
  tachado cuando se ve lo escrito) en un círculo de 44px que se pinta lima al
  pasar el mouse. Es un `type="button"` que no saca el foco del campo, con
  «Mostrar contraseña» u «Ocultar contraseña» y `aria-pressed`. Al enviar, el
  campo vuelve a ocultarse, así el navegador ofrece guardar la contraseña. Es el
  único ícono de la interfaz: está porque hace algo.
- **Rutas protegidas**: `/checkout`, `/mis-pedidos` y `/nueva-contrasena`. Sin
  sesión, llevan a `/ingresar?siguiente=<ruta>` y, al ingresar o crear la
  cuenta, se vuelve ahí. El carrito no se toca: vive en el navegador.
- **Recuperar la contraseña**: «¿Olvidaste tu contraseña?» en `/ingresar` lleva
  a `/recuperar`, que pide el email y responde siempre lo mismo («Si ese email
  tiene cuenta, te mandamos un link…»), tenga cuenta o no. El link del mail
  llega a `/auth/confirmar`, que inicia la sesión y lleva a
  `/nueva-contrasena`. Ahí se elige la nueva y se vuelve a `/mis-pedidos` con
  «Listo: cambiaste tu contraseña». Si el link venció o ya se usó, `/recuperar`
  lo dice y deja pedir otro.
- **Los dos formatos del link**: con la plantilla por defecto de Supabase llega
  `?code=` (PKCE) y solo sirve en el mismo navegador donde se pidió, porque el
  verificador quedó en una cookie de ese navegador; abierto en otro,
  `/recuperar` explica eso. Con un SMTP propio se puede usar la plantilla en
  castellano con `token_hash`, que sirve en cualquier navegador.
  `/auth/confirmar` acepta los dos.
- **Ingresar, crear cuenta y recuperar** (`/ingresar`, `/registrarme`,
  `/recuperar`, `/nueva-contrasena`, sobre cal): una columna angosta con el
  título en `--t-display-3`, una bajada que dice para qué («Para terminar la
  compra, ingresá con tu cuenta») y el formulario con los campos del sistema.
  Debajo, el link a la otra página.
- **Cerrar sesión**: en `/mis-pedidos`, con el botón secundario.

## Checkout

- **`/checkout`** (con sesión, sobre cal), armado como el carrito. A la
  izquierda, «Comprás como …» y los datos de envío: nombre y apellido,
  teléfono, calle y número, piso o departamento (opcional), ciudad, provincia
  (las 24) y código postal, con los campos del sistema. A la derecha, «Tu
  pedido»: una fila por línea con la cantidad, **marca y nombre** («Babolat Pure
  Drive»; los combos, por su nombre), la variante o lo que trae el combo en
  grafito y el subtotal en mono; después los totales y «Cambiar el carrito».
- **Confirmar y pagar** (la píldora lima): el servidor vuelve a cotizar el
  carrito, valida el envío y crea el pedido con `crear_pedido`, que recalcula
  todo, reserva el stock y lo deja pendiente de pago. Si la base lo rechaza
  («No hay stock suficiente de …»), el mensaje aparece arriba del botón. Si
  sale bien, se vacía el carrito y se va a Mercado Pago (Checkout Pro), con la
  preferencia armada desde el pedido guardado. Si Mercado Pago no responde, se
  va al pedido, que dice que no se pudo abrir y tiene «Pagar con Mercado
  Pago». Debajo del botón: «Al confirmar, te llevamos a Mercado Pago para
  pagar…».
- **Sin pago online** (falta configurar Mercado Pago, ver docs/API.md): el
  botón dice «Confirmar pedido» y, debajo, «El pago online todavía no está
  disponible: el pedido queda pendiente de pago…». El pedido se crea igual y
  se va a su página.

## Mis pedidos

- **El listado** (`/mis-pedidos`, sobre cal): el encabezado de un listado con
  la cuenta y «Cerrar sesión», y una fila de 1px por pedido con **columnas de
  ancho fijo**, iguales en todas las filas, para que todo quede alineado:
  - desktop (desde 900px): número (11rem, «Pedido #1001», lleva al detalle),
    fecha y hora en mono (la única flexible), estado (11rem, un sticker derecho
    con el tono del estado) y total en mono, alineado a la derecha (9rem);
  - mobile: el número y el total arriba, en la misma fila; debajo, la fecha y,
    debajo, el sticker del estado. Nada se corta ni desborda.
- **El detalle** (`/mis-pedidos/[id]`): número, fecha, estado (sticker) y qué
  significa. Si está pendiente o se canceló por vencido, antes de mostrarlo el
  servidor busca sus pagos en Mercado Pago y los concilia, por si el aviso del
  webhook no llegó: un vencido pagado a tiempo vuelve a «Pagado».
  Un pendiente dice hasta qué hora se puede pagar («Tenés hasta las 14:32…»)
  y lleva la píldora lima «Pagar con Mercado Pago», que reusa la preferencia
  del pedido; si el último intento se rechazó, lo dice y ofrece probar de
  nuevo. Con un pago en proceso se ve «Pago en proceso» y no vence; pasados
  los 30 minutos sin pago, «Vencido». Un cancelado dice si fue por vencido o
  porque se devolvió el pago, y si llegó un pago aprobado tarde, que se está
  revisando. Debajo, «Qué compraste»: cada combo con sus productos sangrados y
  lo que se ahorró, y los productos sueltos con marca y nombre, variante,
  cantidad por precio y subtotal, todo con los precios congelados del pedido.
  Al costado, los totales (con «Envío») y los datos de envío. Sin pago online,
  un pendiente lleva arriba el aviso «El pago online todavía no está
  disponible.» (con «Listo: tu pedido quedó registrado.» si recién se
  confirmó), dice hasta qué hora queda pendiente y no tiene botón de pago.
- **La vuelta de Mercado Pago** (`/mis-pedidos/[id]/pago/aprobado`,
  `/pendiente` y `/rechazado`, sobre polvo): un encabezado de estado centrado,
  como el 404, con «Pago aprobado», «Pago en proceso» o «Pago rechazado» en la
  display, qué significa y «Ver el pedido». El rechazado suma «Probar de nuevo»
  (lima) mientras el pedido se pueda pagar y haya pago online. Antes de
  mostrarse, si el pedido está pendiente, el servidor busca sus pagos en
  Mercado Pago y los concilia (lo mismo que el detalle del pedido): «Pago
  aprobado» dice si ya está acreditado. Los parámetros de la URL de vuelta
  nunca cambian el pedido (ver docs/API.md).
- **Tonos de los estados**: pagado, lima; pendiente, blanco; pago en proceso,
  blanco; cancelado y vencido, tinta.

## Componente `Raqueta`

La raqueta de frente y vertical, dibujada en SVG con código
(`components/Raqueta.js`). Es reutilizable: la anatomía la usa como versión
sin 3D y la va a usar «Armá tu raqueta».

- **Partes**: cada una es un grupo (`data-parte`) que se puede resaltar o animar
  por separado, con la terminología técnica en castellano: marco (la cabeza,
  la zona que rodea el encordado), protector (la pieza de arriba del marco),
  ojales (un agujero en cada punta de cada cuerda, sobre la línea media del
  marco), encordado (16 principales verticales × 19 cruzadas horizontales,
  calculadas desde el patrón), punto dulce (una zona, no una pieza),
  antivibrador (entre las principales, debajo de la última cruzada), garganta
  (con el puente, que cierra la cabeza por debajo del encordado), empuñadura
  (octogonal: de frente se ven las aristas de sus biseles), grip, overgrip y
  tapón. En el código los ids van sin tildes ni eñes (`empunadura`, `tapon`).
- **Cuerdas y ojales**: las cuerdas están en las mismas posiciones en los dos
  estilos. Las cruzadas dejan lugar abajo para el antivibrador, y los pasos
  están elegidos para que ningún ojal se pise con otro.
- **Props**: `resaltadas` (las partes en lima), `estilo`, `encuadre`
  (`ajustado`, solo la raqueta, o `lienzo`, 400×560 con aire para las
  etiquetas) y `prefijo` (para los ids de los degradados si hay más de una en
  la página). Exporta `ANCLAS` (el punto de cada parte), `PATRON` y `LIENZO`.
- **Estilo `linea`** (el que va en «Armá tu raqueta»): línea tinta de 1,5px
  sobre cal, sin rellenos. Es un dibujo técnico, no una ilustración. Resaltar es
  poner un marcador lima debajo de la línea; el resto baja a gris (tinta al
  28%). Las cuerdas y los ojales llevan un marcador más fino para no volverse
  una mancha.
- **Estilo `inflada`**: el de la anatomía (ver abajo).

## Anatomía de una raqueta

Una sección de la home, entre la banda de fotos 1 y la 2, que explica la
raqueta parte por parte. **Usa el sistema como cualquier otra sección**: la
superficie de cancha rápida, los stickers del sistema y la display. Lo que
sigue es lo propio de la sección.

### Color y fondo

- **Cancha rápida** (`--cancha`) de borde a borde, con grano y **sin marca de
  agua** (ver «Moderación»). Entra y sale con un borde recto.
- Tinta para el texto, los contornos y las líneas guía (5,65:1 sobre cancha);
  blanco para la raqueta, los stickers inactivos y el nombre gigante; lima
  para la pelota, la parte activa y el sticker activo.
- El blanco sobre la cancha (3,23:1) solo se usa en el nombre gigante, que es
  decorativo y repite el título del paso.

### La raqueta 3D

- **Modelo**: `public/models/raqueta.glb`, una raqueta de tenis realista (marco
  azul, garganta y grip negros, encordado modelado). Sale de
  `modelos-fuente/raqueta.glb` (fuera de git) con `npm run modelo:raqueta`:
  gltf-transform con meshopt y texturas WebP de 2048px como máximo, de 19 MB a
  364 KB. Trae tres mallas: la raqueta (marco con sus ojales, garganta,
  empuñadura con el grip y tapón) y el encordado en dos mallas. Viene acostado
  y se endereza en el código.
- **Resaltar**: lo que es una malla aparte se pone lima con un emissive suave
  (el encordado). Lo que no lo es (marco, protector, ojales, garganta,
  empuñadura, grip, overgrip y tapón) se marca solo con el sticker anclado a su
  posición 3D y la línea guía. El punto dulce es un disco lima semitransparente
  que late sobre el encordado. El antivibrador no viene en el modelo: es una
  pastilla blanca agregada en el código, entre las principales y debajo de la
  última cruzada, que pasa a lima en su paso.
- **Luz de estudio suave**: un entorno chico armado con `Lightformer` de drei
  (no baja ningún HDR), una luz principal arriba a la derecha y una sombra de
  contacto debajo del tapón.
- **La pelota**: una pelota de tenis inflada (SVG), lima con contorno y
  costuras negras, flota arriba a la izquierda.

### La raqueta inflada (SVG)

Es la versión dibujada (`Raqueta` con `estilo="inflada"`) y se ve cuando no va
el 3D: con `prefers-reduced-motion`, sin WebGL, sin JavaScript y mientras carga
el modelo. Ocupa la misma caja que el 3D, así que el cambio de una a otra no
mueve el layout.

- **Plástico blando**: cada parte tiene cuerpo, con degradados suaves (blanco
  que va a un azul muy pálido, con la luz arriba a la izquierda; cilindros más
  claros en el centro), un brillo blanco donde pega la luz y un **contorno
  negro grueso** (2,6 unidades por lado, unos 3px). Es el único lugar con
  degradados: dan volumen al dibujo, no son fondo.
- **Textura de ruido**: el mismo `public/texturas/ruido.png` del grano,
  aplicado como patrón sobre los cuerpos. No es un filtro SVG y no se anima.
- **Quieta y completa**: sin parte activa, con todos los stickers a la vista.

### Stickers y tipografía

- **Stickers**: los del sistema (`Sticker`): borde de 2px tinta, Inter Tight
  600 en mayúsculas, píldora o esquinas de 12px, apenas girados (±2 a 4°).
  Con el 3D se ve solo el del paso activo, en lima; en la versión SVG se ven
  todos, en blanco. Lo une a su parte una línea guía tinta de 3px que sale de un
  punto blanco con borde tinta de 3px. Nunca va sobre una zona lima y nunca se
  sale del escenario: con el 3D, si no entra, se acerca a la raqueta.
- **Nombre gigante**: el nombre de la parte activa en la display, enorme
  (17cqi) y en una línea (interlineado 0,8), en blanco, detrás de la raqueta.
- **Titular y pasos**: el titular de la sección en la display a
  `--t-display-2`; los títulos de los pasos en la display a `--t-display-4`. El
  dato técnico va en mono, con una línea de 2px arriba, y el texto en Inter
  Tight 400.

### Estructura

- **Desktop**: la raqueta queda fija (sticky) a la izquierda, en un escenario
  del alto de la pantalla, y los pasos van pasando a la derecha, uno por
  pantalla. **Mobile**: la raqueta fija arriba (46% del alto, de borde a
  borde) y los pasos abajo.
- **Un paso por parte, de arriba hacia abajo**, con la terminología técnica
  en castellano: marco, protector, ojales, encordado, punto dulce,
  antivibrador, garganta, empuñadura, grip, overgrip y tapón. Cada paso tiene
  el número, el nombre de la parte (`h3`), un dato técnico concreto en mono
  (tamaño de la cabeza en pulgadas², patrón 16×19 contra 18×20, grips del 0 al
  5, largo de 27″) y una frase corta que dice qué cambia en el juego. Los
  pasos están en `lib/anatomia.js`.
- **Todo el texto es HTML** (títulos y párrafos), nunca texto dentro del SVG.
  Los stickers y el nombre gigante también son HTML y repiten el título del
  paso, por eso van ocultos para lectores de pantalla.

### Movimiento

- **La cámara**: recorre la raqueta 3D de arriba hacia abajo con el scroll y se
  acerca a la parte de cada paso. El paso que cruza la línea de lectura (el
  centro de la pantalla; en mobile, el centro de lo que queda debajo de la
  raqueta) decide adónde mira, con entrada y salida suaves y un poco de
  inercia. Es continuo: entre un paso y otro está en el medio. Antes del
  primer paso y después del último se ve la raqueta entera. Mira de frente, un
  poco desde la derecha y desde arriba. Los focos y las anclas de cada paso
  están en `lib/anatomia.js` (`foco3d`, `ancla3d`, en centímetros del modelo).
- **Al activarse un paso**: el encordado brilla en lima, aparece el disco del
  punto dulce o el antivibrador pasa a lima, el sticker entra flotando (sube,
  se endereza y crece, con un rebote corto) pegado a su parte, y el nombre
  gigante aparece detrás. El paso activo se lee entero y los demás bajan al
  35%.
- **Flotación y parallax**: la raqueta sube y baja medio centímetro y gira
  apenas (±8°); cada sticker flota a su ritmo; la pelota sube, baja y gira con
  el scroll; el nombre gigante se queda un poco atrás de la raqueta.

### El final

Después de la última parte (el tapón) viene un tramo de scroll propio, el
bloque de cierre (`data-cierre`, de 170 a 180svh). A lo largo de ese tramo:

1. **La cámara se aleja** hasta mostrar la raqueta entera, centrada, un poco
   más lejos que al principio.
2. **Los stickers de todas las partes aparecen juntos** alrededor de la
   raqueta, cada uno anclado a su parte, un instante (del 14% al 34% del
   tramo), y se van. **Con ellos entra la frase de cierre**, «Ahora que la
   conocés, salí a jugar.», en el espacio libre al lado de la raqueta (debajo
   en mobile), fija mientras dura el tramo, en la display a `--t-display-3`.
   Entra subiendo y se queda durante la vuelta y hasta el final. Nunca va
   detrás de la raqueta.
3. **La raqueta da una vuelta de 360°** atada al scroll (del 36% al 86%), con
   entrada y salida suaves. Si se vuelve para atrás, desanda la vuelta.
4. **Después queda flotando** con una rotación muy lenta (0,18 rad/s, una
   vuelta cada 35 segundos).
5. **Aparece el botón lima «Ver raquetas»** (desde el 78%), debajo de la
   frase, al lado de la raqueta (debajo en mobile), y lleva a
   `/categoria/raquetas`. Entra subiendo; antes está oculto y fuera del orden
   de tabulación.

La frase y el botón están en `lib/anatomia.js` (`CIERRE_ANATOMIA`). La frase es
texto HTML del bloque de cierre, el mismo con y sin 3D.

### Rendimiento

- **El 3D va solo en esta sección**: React Three Fiber y drei, cargados con
  `dynamic` y sin SSR (`components/Raqueta3D.js`). El lienzo deja de
  renderizar cuando la sección no está en pantalla (`frameloop="never"`).
- **Mobile**: DPR máximo 1,5 (2 en desktop) y la sombra de contacto se calcula
  una sola vez, no en tiempo real.
- **En la página, solo `transform` y `opacity`**: los stickers y sus líneas
  (posicionados en unidades del contenedor, `cqw`/`cqh`, a partir de la
  proyección de su ancla 3D), el parallax y las apariciones. Nada de `left`,
  `top` ni filtros SVG en elementos que se mueven.
- **Funciona igual en Chrome, Safari y Firefox**: el scroll se mide con
  `requestAnimationFrame`, sin `animation-timeline`.

### Sin movimiento

Con `prefers-reduced-motion`, sin WebGL o sin JavaScript no se carga el 3D: se
ve la raqueta inflada en SVG, entera y quieta, con los stickers a la vista, en
blanco, cada uno con su línea guía. No flota nada. El final es la raqueta
quieta con la frase de cierre (en la display) y el botón lima, fijos al lado
(debajo en mobile) mientras dura el tramo de cierre, que mide lo mismo con y
sin 3D. Mientras carga el modelo se ve lo mismo, y cuando está listo la
raqueta 3D aparece encima con un fundido.

## Fotos de producto

### Especificación de las fotos de estudio

Todas las fotos de la vitrina salen de la misma sesión: puestas una al lado de
la otra, tienen que parecer la misma foto con distinto producto.

- **Fondo**: papel sin fin liso, sin textura, viñeta ni degradado. En la
  edición se lleva a `#F4F5F2` (`--estudio`) parejo en toda la foto (±2
  niveles en los bordes), así la foto se funde con la tarjeta.
- **Proporción**: 4:5 vertical. Se entrega a 1600×2000 px, WebP calidad 82,
  sRGB.
- **Producto centrado** en la **caja de producto**: del 14% al 86% del ancho y
  del 26% al 86% del alto (en 1600×2000: x 224–1376, y 520–1720). Toca la caja
  por su lado más largo. Arriba queda aire para el nombre y abajo para el
  precio: nada del producto entra en esas franjas.
- **Encuadre por categoría**:
  - Raquetas: de frente, verticales, con la cabeza arriba y sin funda.
  - Pelotas: el tubo cerrado, parado, con una pelota suelta al lado.
  - Cuerdas y grips: el set o el rollo de frente, en su envase.
  - Bolsos: parados, de frente, con los cierres cerrados.
- **Misma luz**: una fuente grande y difusa arriba a la izquierda (a 45°),
  relleno suave desde la derecha, 5000 K, la misma exposición para todo el
  catálogo. Solo la sombra natural, corta y suave, donde el producto apoya.
- **Misma cámara**: equivalente a 100 mm, a la altura del centro del producto.
- **Vistas**: la primera es la de catálogo. Se pueden sumar vistas de detalle
  para la galería (el puente de la raqueta, el cierre del bolso), con la misma
  luz, el mismo fondo y la misma caja.
- **Archivos**: `estudio/<slug>-1.webp`, `-2.webp`, etc., en el bucket
  `productos` de Supabase Storage, y una fila por foto en la tabla `fotos` (la
  ruta y el orden). Con fotos cargadas, `FotoVitrina` las usa enteras
  (`object-fit: cover`).

Son otras fotos que las de «Fotos al scrollear»: estas muestran el producto;
aquellas, el juego.

### Mientras tanto: placeholder

Hasta que estén las fotos de estudio, **toda la vitrina muestra el
placeholder**: `FotoVitrina` dibuja la celda 4:5 en `--estudio` con la silueta
plana de la categoría (raqueta, tubo de pelotas, rollo de cuerda o bolso
raquetero) en tinta al 6%, centrada en la caja de producto. Sin texto, sin
ícono de imagen rota, sin líneas ni degradados. Es decorativo (`aria-hidden`):
el nombre ya está en la tarjeta. Las fotos reemplazan al placeholder solas,
producto por producto. Sin stock, la silueta se lava igual que una foto.

## Video

El loop del hero sale de `public/videos/fuentes/tenis.mp4` (fuera de git) con
`npm run video:hero` (`scripts/video-hero.mjs`): H.264 sin audio, de menos de
4 MB, con un fundido cruzado entre el final y el principio para que el loop no
salte. Hay dos versiones: `hero-desktop` (el cuadro entero, escalado) y
`hero-mobile` (un recorte 9:16 que sigue al jugador). Cada una tiene su poster
en WebP (el primer cuadro). El detalle y el control del loop están en
`MEDIOS.md`. Si cambia el video, se vuelve a medir el contraste del titular
sobre sus cuadros (ver «Hero»).

## Páginas

- **Categoría** (polvo): migas en mayúsculas, el nombre en `--t-display-3`, la
  bajada y la cantidad en mono. Debajo, la vitrina.
- **Producto** (cal): la galería a la izquierda y, a la derecha, la marca en
  mayúsculas, el nombre en la display a `--t-display-4`, la descripción, la
  **ficha técnica** (filas separadas por líneas de 1px, el dato en mono), el
  precio y el selector: opciones en píldora con borde de 2px, la activa en
  lima y las que no tienen stock en hormigón. «Agregar al carrito» es la
  píldora lima. En las raquetas no hay grip ni peso elegidos de entrada: hasta
  que el cliente elige, el precio es el «desde» (sin «desde» si todas las
  opciones valen lo mismo), el botón está apagado y debajo dice «Falta elegir
  grip y peso». Los demás productos arrancan con la primera opción con stock.
  El stock va en singular o plural: «¡Queda 1!», «¡Quedan 3!».
- **Combos y combo**: el listado y la página de un combo, con las piezas de la
  categoría y del producto. Ver «Combos».
- **Carga** (cal): «Cargando…» y la vitrina vacía. Mide al menos el alto de la
  pantalla: si no, cuando llega el contenido el footer salta para abajo (es el
  único salto de layout que se midió en la muestra).
- **Error y 404** (polvo): tipográficos, sin dibujos. El código gigante en la
  display a `--t-display-1`, en tinta; un título que dice qué pasó («Página no
  encontrada», «Algo salió mal») y la píldora para volver. Centrados.

## Footer

Banda tinta a todo el ancho, con un separador punteado blanco arriba del
contenido. El wordmark gigante en blanco con su pelota lima, las categorías y
«Combos» en mayúsculas, la línea de créditos de las fotos si hay alguna
(«Fotos: …», ver «Fotos al scrollear») y los legales a 13px. Foco en lima. Sin
íconos sociales.

## Voz

Sencilla y descriptiva, en castellano rioplatense (de vos). Los textos dicen
qué es cada cosa: «Todo para jugar al tenis», «Raquetas de potencia con un
punto dulce amplio», «Página no encontrada». Sin slogans, leyendas, chistes ni
frases inventadas. Los stickers nombran lo que se ve o el estado («Polvo de
ladrillo», «Sin stock»). Las descripciones de producto cuentan para qué sirve
y qué lo distingue, en una o dos oraciones.

## Rendimiento

- El video del hero, las fotos y la anatomía no compiten: el video arranca
  primero (el poster va con `fetchPriority="high"`); las fotos son lazy y su
  movimiento solo escucha el scroll mientras su banda está cerca; el 3D carga
  sin SSR y deja de renderizar fuera de pantalla.
- Todo lo que está debajo del pliegue es lazy: fotos, vitrinas fuera de la
  primera pantalla y el modelo 3D.
- Las fuentes van con `next/font` y las imágenes reservan su espacio
  (proporción fija): el cambio de fuente o la carga de una foto no mueven nada.
- En mobile, menos fotos (una por banda) y movimiento más simple.

## Accesibilidad

- Contraste AA en todo el texto, con las combinaciones de la tabla «Contrastes».
  El lima nunca es texto sobre claro.
- Foco visible en todas las superficies: anillo de 3px de `--foco` (tinta en
  claras y de color, lima en tinta y video).
- Áreas táctiles de 44px como mínimo: píldoras, botones (48px), campos (48px),
  opciones, el ojo de la contraseña y la pausa del video.
- Navegación completa con teclado, un solo paso de Tab por producto y salto al
  contenido.
- `prefers-reduced-motion` respetado en todo (ver «Movimiento»).
- Lo decorativo va oculto para lectores de pantalla: bandas de fotos, marcas de
  agua, el nombre gigante y los stickers de la anatomía.
- Layout fluido desde 320px, sin scroll horizontal.

## Evitar

| Evitar | Cómo se resuelve |
| --- | --- |
| Lima como texto sobre claro o sobre las superficies | Lima de relleno, con texto y borde tinta. Como texto, solo sobre tinta o el video |
| Grafito o blanco como texto sobre polvo, cancha o césped | Todo el texto en tinta; la jerarquía sale del tamaño y del peso |
| Tres superficies de color a la vista | Dos como máximo; la del medio mide al menos 100svh o va un neutro |
| Interlineado de 0,8 con mayúsculas acentuadas | 0,92 en la display: la tilde llega a 0,89em |
| Display en párrafos o por debajo de 2rem | Display solo en titulares; el texto en Inter Tight |
| Degradados decorativos, sombras, resplandores | Grano quieto, bordes de 2px tinta y bloques planos. Solo la raqueta inflada tiene volumen |
| Más de tres recursos decorativos en una pantalla | Ver «Moderación»: una marca de agua, dos stickers girados, dos fotos inclinadas, de no más de dos tipos |
| Fotos que tapan texto o botones | Bandas propias, sin clics; las fotos no salen de su banda |
| Rotaciones de más de 6° | Giro en reposo de −4° a 4°; con la entrada, ±6° como mucho |
| Movimiento con `top`, `left`, `width` o filtros | Solo `transform` y `opacity` |
| Movimiento con `prefers-reduced-motion` | Todo quieto en su estado final |
| Radios fuera de la escala | 6px fotos, 12px stickers, 20px bloques, píldora para lo que se toca |
| Áreas táctiles chicas | 44px como mínimo |
| Placeholder con ícono de imagen rota | Bloque de color con la proporción exacta y la descripción |
| Fotos de terceros sin crédito o sin licencia | `CREDITOS.txt` y licencias de uso (ver docs/FOTOS.md) |
| Copiar textos, logos, ilustraciones, fotos o colores de las referencias | Valores y textos propios |
| Slogans, leyendas y frases inventadas | Textos que describen qué hay y para qué sirve |
| Texto centrado en párrafos y productos | A la izquierda; solo se centran el hero y los estados |
