# green. — Sistema de diseño

green. es una tienda de tenis que se ve como una cancha: polvo de ladrillo,
cancha rápida, césped y líneas blancas, con el lima de la pelota como color de
marca y de acción. **La identidad la dan cuatro cosas**: los colores de las
superficies, los titulares gigantes, las fotos y el grano. Todo lo demás se
dice en voz baja: texto, líneas lisas de 1px y espacio. Los productos se ven
solos, sobre fondo de estudio. Todo el texto pasa AA.

## Referencias y precedencia

- **Este documento manda.** Las referencias son inspiración: de ellas no se
  copian textos, logos, ilustraciones, fotos ni colores. Los valores de acá son
  propios.
- `docs/referencias/slush.md`: la display enorme y apretada.
- `docs/referencias/hungry-tiger.md`: el lienzo cálido y saturado, los
  titulares que ocupan la pantalla y los recuadros de fotos inclinados que se
  enderezan con el scroll.
- `docs/referencias/teenage-engineering.md`: solo la vitrina, como idea (la
  celda es la foto del producto sobre estudio, y el nombre y el precio van
  afuera, en voz baja).
- `docs/referencias/twotwo.md` es **histórica**: describe el sistema anterior
  (blanco y negro con un lima). No manda en nada.
- Las capturas de terceros (`docs/referencias/capturas/`) no van al repo.

## Reglas de la estética

1. **Cada sección juega en una superficie**: polvo, cancha o césped, o un
   neutro (cal o tinta). Nunca hay más de dos superficies de color a la vista.
2. **Sobre polvo, cancha y césped, todo el texto es tinta.** El lima es color
   de marca y de acción: relleno con texto tinta, nunca texto sobre claro.
3. **La display hace de objeto.** Mayúsculas pesadas y condensadas, enormes y
   apretadas, solo en titulares. El texto corrido es Inter Tight.
4. **Pocos recursos.** Sin stickers, sin punteados, sin cápsulas en la
   navegación, sin sombras ni degradados. Las secciones se separan con espacio;
   donde hace falta una línea, 1px lisa (ver «Moderación»).
5. **Una escala para todo**: cuatro radios, tres bordes, una escala de
   espacios de 4px.
6. **El producto se ve solo**, grande y centrado sobre estudio.
7. **Ningún elemento repite lo que ya dice el título.** Ni bajadas que lo
   reformulan, ni etiquetas que lo anuncian. Textos que describen, sin slogans
   (ver «Voz»).
8. **Movimiento con sentido**, solo con `transform` y `opacity`, y nada con
   `prefers-reduced-motion`.

## Paleta: las superficies del tenis

| Token | Nombre | Hex | Uso |
| --- | --- | --- | --- |
| `--polvo` | Polvo de ladrillo | `#D46C3F` | La base cálida de la marca: «Lo que más sale», listados, estados (404, error, pagos) |
| `--cancha` | Cancha rápida | `#5A8FE6` | «Anatomía de una raqueta» |
| `--cesped` | Césped | `#5A9E4A` | Categorías |
| `--cal` | Cal | `#FBF6EE` | Neutro cálido: producto, carrito, cuenta, checkout y pedidos; el header con scroll |
| `--blanco` | Blanco | `#FFFFFF` | Las líneas de las marcas de agua, los campos, el relleno de la raqueta dibujada |
| `--estudio` | Estudio | `#F4F5F2` | Solo las celdas de la vitrina |
| `--tinta` | Tinta | `#1A1411` | Negro cálido: el texto, los bordes, el footer |
| `--grafito` | Grafito | `#4A403A` | Texto secundario, solo sobre cal, blanco y estudio |
| `--hormigon` | Hormigón | `#E6E6E6` | Botones apagados y etiquetas de estado neutras |
| `--lima` | Lima | `#DCF900` | Marca y acción: botón principal, carrito, hover, la parte activa, la pelota |

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
  anatomía, las marcas de agua). Los links del header sí van en blanco sobre el
  video, con la capa de tinta.
- Grafito sobre superficies de color (2,7 a 3,1): sobre color, la jerarquía
  sale del tamaño y del peso, no del gris.

Los bordes de 2px en tinta dan el contraste de componente (3:1) contra las
superficies: 5,22 sobre polvo, 5,65 sobre cancha, 5,58 sobre césped. El lima de
relleno no llega solo (2,7 a 2,9 sobre las superficies, 1,1 sobre cal), por eso
los botones lima llevan borde tinta.

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
| Carga | El color de lo que viene (tinta en la home), del alto de la pantalla |
| Footer | Tinta |

### Foco

Anillo de 3px a 3px de distancia, del color `--foco` que pone cada superficie:
tinta sobre las claras y las de color, lima sobre tinta y sobre el video. En
las filas que se pintan enteras (categorías), el anillo va por dentro.

## Tipografía

| Rol | Fuente | Uso |
| --- | --- | --- |
| Display | **Archivo**, variable, ancho 62 y peso 900 | Titulares, en mayúsculas: hero, secciones, títulos de página, nombres de categoría, pasos de la anatomía, códigos de error; y el wordmark, en minúscula |
| Texto | Inter Tight 400 y 600 | Texto corrido y nombres de producto (400); links del header, botones, etiquetas de estado y rótulos de campos (600) |
| Datos | JetBrains Mono 400 | Precios, contadores, fechas y la ficha técnica |

Las tres van con `next/font` (Google Fonts, sin archivos propios), que reserva
el espacio con una fuente de respaldo ajustada: el cambio de fuente no mueve
nada.

### La display

Archivo (ancho 62, peso 900). Se probó contra Anton y Big Shoulders: es una
grotesca como Inter Tight, así que conviven sin chocar; es la más cercana a la
display de Slush; es un solo archivo variable con eje de ancho y tiene los
acentos completos. Anton pide interlineado 1,14 por la altura de sus tildes, y
Big Shoulders no tiene métricas de respaldo en next/font (al cargar movería el
texto).

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
| `--t-dato` | 0.8125rem (13px) | Links del header, pies de foto, nombres de las partes, legales, datos |
| `--t-chico` | 0.875rem | Botones, notas |
| `--t-texto` | 1rem | Texto corrido |
| `--t-entrada` | clamp(1.0625rem, 1.3vw, 1.25rem) | Bajadas |
| `--t-titulo` | clamp(1.25rem, 2vw, 1.625rem) | Subtítulos en Inter Tight 600 |
| `--t-display-4` | clamp(2rem, 4vw, 3.25rem) | Pasos, filas de categorías, nombres en la página de producto |
| `--t-display-3` | clamp(2.75rem, 6.5vw, 5.5rem) | Títulos de página y de bloque |
| `--t-display-2` | clamp(3.5rem, 10vw, 9rem) | Títulos de sección de la home |
| `--t-display-1` | clamp(4.5rem, min(15vw, 17svh), 14rem) | Hero, 404 y error. Depende también del alto, así el hero entra en una pantalla |

Interlineado: 0,92 en la display, 1,2 en subtítulos, 1,5 en bajadas, 1,6 en
texto. Tracking: 0,04em en las mayúsculas de Inter Tight (links, botones,
etiquetas), −0,01em en subtítulos.

### Wordmark

«green.» en minúscula, en Archivo (900, ancho 62), con el punto como **pelota
de tenis**: el círculo lima con sus dos costuras en negro (`Pelota`), a 0,34em,
sobre la línea de base. Con ese tamaño el trazo de las costuras queda en unos
2px.

- Header: tinta sobre cal; blanco sobre el video.
- Footer: gigante (hasta 12rem), en blanco sobre tinta.
- Favicon: la pelota sola, en `app/icon.svg`.

## Escala única: radios, bordes y espacios

- **Radios** (`--radio-chico`, `--radio-medio`, `--radio-bloque`,
  `--radio-pildora`):
  - 0: las celdas de la vitrina, con esquinas rectas.
  - 6px: los recuadros de las fotos al scrollear y las etiquetas de estado.
  - 12px: los recuadros de error y la tabla de la ficha.
  - 20px: el resumen del carrito y los paneles.
  - 999px (píldora): botones, el carrito del header, campos, opciones y el «+».
- **Bordes** (`--borde-fino`, `--borde`, `--borde-grueso`), siempre en tinta:
  - 1px: filas de tablas (pedidos, carrito, totales, ficha técnica), filas de
    categorías, resúmenes y el header con scroll.
  - 2px: botones, el carrito, campos y el «+».
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
- **Marcas de agua**, solo en **polvo y césped**: dibujos de línea en blanco
  al 28%, con trazo fijo (`vector-effect: non-scaling-stroke`), detrás del
  texto y recortados por la sección (`Superficie`, prop `marca`):
  - `lineas`: una cancha vista desde arriba, enorme y girada −8°. En polvo.
  - `costuras`: una pelota gigante con sus dos costuras, asomando por un
    costado. En césped.
  Al ser más claras que la superficie, el texto tinta gana contraste.
- **Sin degradados ni sombras.** La raqueta y la pelota dibujadas de la
  anatomía también van en relleno plano.

## Moderación

- **Lo que hace la identidad**: los colores de las superficies, los titulares
  gigantes, las fotos y el grano.
- **Marcas de agua**: como máximo una por pantalla, y nunca en una sección con
  fotos inclinadas ni en la anatomía.
- **Fuera**: stickers decorativos o girados, separadores punteados, cápsulas
  en la navegación, cajas alrededor de nombres o etiquetas, íconos de adorno.
- **Separaciones**: con espacio. Donde hace falta una línea (filas de tablas,
  resúmenes, filas de categorías), 1px lisa en tinta.
- **Ningún elemento repite lo que ya dice el título**: si el título dice «Lo
  que más sale», no hay una bajada «Los más vendidos» ni una etiqueta «Más
  vendidos».

## Componentes

### Botones

- **Principal**: píldora lima con borde de 2px tinta y texto tinta, Inter
  Tight 600 en mayúsculas a 14px con tracking 0,04em, mínimo 48px de alto (56px
  en el hero). Hover: tinta con texto lima.
- **Secundario**: transparente con borde de 2px tinta; hover, blanco.
- **Sobre tinta o video**: el principal sigue lima; el secundario lleva borde y
  texto blancos (hover: blanco con texto tinta).
- **Apagado**: hormigón con borde y texto grafito.

### Header

- **El wordmark a la izquierda, links de texto y solo el carrito en
  píldora.** Los links (las cuatro categorías, «Combos» y «Mi cuenta») van en
  Inter Tight 600 en mayúsculas a 13px, con tracking 0,04em y 44px de alto;
  con el mouse se subrayan (2px, a 6px del texto). El carrito es la única
  píldora: lima con borde de 2px tinta («Carrito (0)», con `BotonCarrito`);
  hover, tinta con texto lima.
- **El link activo** queda subrayado y lleva `aria-current="page"`, solo en la
  página que corresponde (la categoría abierta, los combos o la cuenta): el
  header lo saca de la ruta (`usePathname`). En la home no hay ninguno activo.
- **Sobre el video**: el wordmark y los links en blanco, sin fondo, con foco
  lima; el carrito sigue lima.
- **Fijo**. En la home arranca sin fondo sobre el video; al scrollear (un poco
  antes de terminar el hero) pasa a banda cal con una línea lisa de 1px abajo.
  En las demás páginas es cal desde el principio. La lógica de
  `CabeceraFlotante` no cambia: mide su alto y lo publica en `--alto-header`.
- Por debajo de 1024px los links de las secciones bajan a una segunda fila con
  scroll horizontal; arriba quedan el wordmark, «Mi cuenta» y el carrito.

### Etiquetas de estado

Solo para estados: sin stock, pagado, pendiente, pago en proceso, cancelado,
vencido (`Estado`). Nunca de adorno.

- Inter Tight 600 en mayúsculas a 12px, tracking 0,04em, sobre un fondo plano,
  con radio de 6px, **derechas, sin giro y sin borde**.
- **Tonos**: lima (pagado), hormigón con texto tinta (pendiente, pago en
  proceso), tinta con texto blanco (sin stock, cancelado, vencido). El texto
  siempre dice el estado: el color no es la única señal.

### Campos

Píldora blanca de 48px con borde de 2px tinta y texto a 16px; la etiqueta,
arriba, en Inter Tight 600 en mayúsculas a 13px. El error va debajo, en un
recuadro blanco con línea de 1px tinta y radio de 12px, en 600, ligado con
`aria-describedby` y `aria-invalid`. Los campos de contraseña llevan el ojo
adentro, a la derecha (ver «Cuenta»).

## Movimiento

Poco y con sentido. Solo `transform` y `opacity`; nada de `top`, `left`,
`width` ni filtros en lo que se mueve. Sin giros fuera de las fotos.

- **Hero**: el loop del video. Se puede pausar.
- **Vitrina**: con el mouse o el foco, el producto se acerca (escala 1,03) y
  el «+» pasa a lima.
- **Categorías**: la fila se pinta lima y la flecha avanza 6px.
- **Fotos al scrollear**: entran y se enderezan atadas al scroll (ver «Fotos
  al scrollear»).
- **Anatomía de una raqueta**: la cámara sigue al scroll (ver esa sección).
- **Header**: pasa de transparente a cal con una transición de 300ms.
- **Con `prefers-reduced-motion`**: el hero muestra solo el poster, las fotos
  quedan quietas en su giro final, la anatomía muestra la raqueta entera y
  quieta con los nombres de sus partes, y no hay animaciones ni transiciones.

## Fotos al scrollear

Recuadros de fotos apenas inclinados, intercalados entre las secciones de la
home, que entran con el scroll y se enderezan.

### Los lugares

`lib/fotos.js` define 10 lugares, mitad gente jugando y mitad objetos, con
nombre de archivo (`partido-polvo-01`, `pelota-linea-02`…), proporción
(4:5, 3:2 o 1:1), descripción de qué foto buscar, pie, giro, parallax, banda,
lado y si se ve en mobile. La lista para conseguirlas y cómo agregarlas está en
`docs/FOTOS.md`.

### Bandas

- Tres bandas en la home: la 1 sobre polvo (después de «Lo que más sale»), la 2
  sobre cancha (después de la anatomía) y la 3 sobre césped (antes del footer).
  Cada una es su propio bloque (`BandaFotos`), sin marca de agua: las fotos
  nunca salen de su banda, nunca pisan texto ni botones y no reciben clics.
- **Desktop**: las fotos van alternadas a un lado y al otro. Cada lugar mide
  44svh y cada foto, 40svh de alto con su pie: así **se ven dos a la vez**, una
  de cada lado, sin vacío entre ellas. Las verticales miden hasta 28vw de
  ancho; las horizontales, 40vw; las cuadradas, 30vw.
- **Mobile** (menos de 760px): una foto por banda (las de `mobile: true`),
  centrada, a 76vw (88vw las horizontales).
- La banda es decorativa: va oculta para lectores de pantalla.

### El recuadro

- La caja de afuera queda quieta y reserva el espacio de la foto, con la
  proporción exacta, y del pie: nada se mueve en el layout. El recuadro de
  adentro (la foto y su pie) es el que gira y se mueve.
- La foto sin borde, con radio de 6px. **Debajo, el pie**: texto chico (13px,
  tinta) que dice lo que se ve («Derecha en polvo»). Sin stickers ni números.
- **Giro en reposo** entre −4° y 4°; con la entrada llega como mucho a ±6°.

### Placeholder

Hasta que esté la foto, el recuadro muestra un bloque del mismo tamaño, giro y
movimiento, en el color de la superficie de la sección que viene (banda 1:
cancha; banda 2: césped; banda 3: polvo), así se distingue del fondo y nunca
hay más de dos superficies a la vista. Lleva grano, el nombre del archivo con la
proporción en mono y la descripción en texto chico, en tinta; el pie va debajo,
como con la foto. Las fotos reemplazan al placeholder solas, lugar por lugar.

### Movimiento

`MovimientoFotos` (cliente) envuelve la banda y no dibuja nada: mide la caja
quieta en cada `requestAnimationFrame` y escribe el `transform` del recuadro.
Solo escucha el scroll mientras la banda está cerca de la pantalla
(IntersectionObserver).

- **Desktop**: la foto asoma desde 80px más abajo, girada 3° más (hacia el
  mismo lado) y a escala 0,92, y en la primera mitad de su recorrido se asienta
  en su giro y a escala 1. Encima, un parallax propio (`velocidad`, de 0,06 a
  0,16 del alto de la pantalla), distinto en cada foto. Sin fundido.
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
2. **Lo que más sale** (polvo, con la marca de agua de líneas): el título en
   `--t-display-2` y, debajo, los seis destacados en la vitrina editorial. Sin
   bajada: el título ya dice qué hay.
3. **Fotos**, banda 1 (sobre polvo).
4. **Anatomía de una raqueta** (cancha). Ver esa sección.
5. **Fotos**, banda 2 (sobre cancha).
6. **Categorías** (césped, con la marca de agua de costuras): una fila por
   categoría, toda clickeable, separadas por líneas lisas de 1px: el nombre en
   `--t-display-4`, la bajada, la cantidad en mono y una flecha. Con el mouse o
   el foco, la fila se pinta lima y la flecha avanza.
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
- **El header** flota arriba, sin fondo: wordmark y links en blanco, el
  carrito en lima.
- **Poster**: el primer cuadro de cada versión en WebP, pintado por el servidor
  en un `<picture>`. El video se monta encima desde un componente cliente
  (`VideoFondo`), que elige la versión según el ancho (corte en 760px).
- **Control**: círculo blanco con borde de 2px tinta y el ícono de pausa/play,
  abajo a la derecha, con etiqueta accesible.

## Vitrina de productos

La celda es la foto del producto, sola, sobre estudio; el nombre y el precio
van afuera, en voz baja. La idea viene de teenage engineering (sin copiarla).

**Dónde va.** La grilla de cada categoría y cualquier listado de productos
(`GrillaProductos` + `TarjetaProducto`), el listado de combos
(`TarjetaCombo`) y «Lo que más sale» en la home. La foto de cada celda la pone
`FotoVitrina`. La pantalla de carga dibuja la misma grilla vacía.

### La grilla

- **Editorial** desde 960px: cuatro columnas, con celdas grandes (medio ancho)
  y chicas (un cuarto) mezcladas. En cada tanda de seis, la primera y la última
  son grandes: una grande al lado de dos chicas, y después dos chicas al lado de
  una grande. El patrón se repite.
- **Alto de fila fijo**: la foto mide `clamp(17rem, 25vw, 22rem)` de alto en
  todas las celdas, grandes y chicas.
- **20px de espacio** entre columnas y 32px entre filas (la foto más su pie).
- **Mobile** (y hasta 959px): dos columnas parejas, con la foto en 4:5.

### La celda

- **La foto**: fondo `--estudio` plano, sin borde, con esquinas rectas. El
  producto grande y centrado: la foto recortada sin fondo entra con
  `object-fit: contain` y un margen interno parejo (8%); el placeholder centra
  la silueta igual.
- **Debajo y afuera de la foto**: el nombre en Inter Tight 400 a 15px, el
  precio al lado, chico (12px) en mono («desde» si cambia con las opciones), y
  a la derecha el **«+»**: un círculo de 44px con borde de 2px tinta y el signo
  en SVG. Sin «Comprar», sin marca y sin la cantidad de opciones.
- **El «+»**: con más de una variante, es parte del link al producto (toda la
  celda es un solo link, un solo paso de Tab). Con una sola variante, es un
  botón aparte (`AgregarDirecto`) que la agrega al carrito con el mismo
  `agregarProducto` del selector; avisa con un tilde un momento y lo dice para
  lectores de pantalla.
- Sin sombras, sin degradados, sin texto sobre la foto.

### Estados

- **Hover y foco**: el producto escala a 1,03 (400ms) y el «+» pasa a lima. El
  foco agrega el anillo de 3px alrededor de la celda. Sin giros.
- **Sin stock**: el producto en gris lavado (escala de grises y opacidad 0,5) y,
  en lugar del «+», la etiqueta de estado «Sin stock».
- Con `prefers-reduced-motion`, el producto no se mueve: queda el «+» en lima y
  el foco.

### La galería del producto

En `/producto/[slug]` y `/combo/[slug]` las fotos van en celdas de estudio,
con esquinas rectas y el producto centrado con el mismo margen, sin texto
encima. La primera vista va grande; si hay más, van de a dos debajo. En
escritorio queda fija mientras se lee la ficha y nunca es más alta que la
pantalla. Acá el producto no se apaga aunque no haya stock: eso lo dice el
selector de opciones, al lado.

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
- **La celda** (`TarjetaCombo`): la misma de la vitrina. Debajo, el nombre, el
  precio del combo («desde» si cambia con las opciones) y, al lado, el
  descuento en mono («−10 %»); el «+» lleva a su página. Sin foto propia, el
  placeholder es el de su primer producto.
- **El listado** (`/combos`): como una categoría, sobre polvo. Migas,
  «Combos» a `--t-display-3`, la cantidad y la vitrina. Va en el header y en el
  footer, después de las categorías.
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
  al carrito. Ver carrito». Si ya estaba, suma a la misma línea. El «+» de la
  vitrina (solo en productos de una variante) hace lo mismo.
- **La página** (`/carrito`, sobre cal): título en `--t-display-3`. Las líneas
  van separadas por 1px:
  - la celda de estudio chica, con esquinas rectas, con la foto o la silueta;
  - la marca (o «Combo») en mayúsculas, el nombre y, en grafito, la variante o
    lo que trae el combo;
  - lo que impide comprarla, en un recuadro blanco con línea de 1px y radio de
    12px, como los errores de los campos;
  - la cantidad en una píldora (− n +, con tope por stock) y «Quitar»;
  - el subtotal en mono y, en los combos, cuánto se ahorra.
- **El resumen**, a la derecha (abajo en mobile), fijo mientras se scrollea: un
  bloque blanco con línea de 1px y radio de 20px, con subtotal, descuento de
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
  campo vuelve a ocultarse, así el navegador ofrece guardar la contraseña.
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
    fecha y hora en mono (la única flexible), estado (11rem, la etiqueta de
    estado) y total en mono, alineado a la derecha (9rem);
  - mobile: el número y el total arriba, en la misma fila; debajo, la fecha y,
    debajo, la etiqueta del estado. Nada se corta ni desborda.
- **El detalle** (`/mis-pedidos/[id]`): número, fecha, estado (etiqueta) y qué
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
  etiquetas) y `prefijo` (para los ids si hay más de una en la página). Exporta
  `ANCLAS` (el punto de cada parte), `PATRON` y `LIENZO`.
- **Estilo `linea`** (el que va en «Armá tu raqueta»): línea tinta de 1,5px
  sobre cal, sin rellenos. Es un dibujo técnico, no una ilustración. Resaltar es
  poner un marcador lima debajo de la línea; el resto baja a gris (tinta al
  28%).
- **Estilo `inflada`** (el de la anatomía): cada parte con cuerpo, **relleno
  blanco plano**, contorno tinta de unos 2,5px y el grano encima; **la parte
  activa en lima**. Sin degradados ni brillos, y las demás partes no se apagan:
  la raqueta se lee entera contra la cancha.

## Anatomía de una raqueta

Una sección de la home, entre la banda de fotos 1 y la 2, que explica la
raqueta parte por parte. Usa el sistema como cualquier otra sección: la
superficie de cancha rápida, la display y los textos chicos en mayúsculas. Lo
que sigue es lo propio de la sección.

### Color y fondo

- **Cancha rápida** (`--cancha`) de borde a borde, con grano y **sin marca de
  agua**. Entra y sale con un borde recto.
- Tinta para el texto, los contornos y las líneas guía (5,65:1 sobre cancha);
  blanco para el relleno de la raqueta y el nombre gigante; lima para la parte
  activa y la pelota.
- **La raqueta contrasta con la cancha**: relleno claro, contorno tinta y la
  parte activa en lima, tanto la dibujada como la 3D (en el modelo, el material
  del marco pasa a blanco).
- El blanco sobre la cancha (3,23:1) solo se usa en el nombre gigante, que es
  decorativo y repite el título del paso.

### La raqueta 3D

- **Modelo**: `public/models/raqueta.glb`, una raqueta de tenis realista (marco,
  garganta, grip y encordado modelado). Sale de `modelos-fuente/raqueta.glb`
  (fuera de git) con `npm run modelo:raqueta`: gltf-transform con meshopt y
  texturas WebP de 2048px como máximo, de 19 MB a 364 KB. Trae tres mallas: la
  raqueta (marco con sus ojales, garganta, empuñadura con el grip y tapón) y el
  encordado en dos mallas. Viene acostado y se endereza en el código. El
  material del marco se aclara (blanco) para que contraste con la cancha.
- **Resaltar**: lo que es una malla aparte se pone lima con un emissive suave
  (el encordado). Lo que no lo es (marco, protector, ojales, garganta,
  empuñadura, grip, overgrip y tapón) se marca solo con su nombre anclado a su
  posición 3D y la línea guía. El punto dulce es un disco lima semitransparente
  que late sobre el encordado. El antivibrador no viene en el modelo: es una
  pastilla blanca agregada en el código, entre las principales y debajo de la
  última cruzada, que pasa a lima en su paso.
- **Luz de estudio suave**: un entorno chico armado con `Lightformer` de drei
  (no baja ningún HDR), una luz principal arriba a la derecha y una sombra de
  contacto debajo del tapón.
- **La pelota**: una pelota de tenis dibujada (SVG), lima plana con contorno y
  costuras tinta, flota arriba a la izquierda.

### La raqueta dibujada (SVG)

Es `Raqueta` con `estilo="inflada"` y se ve cuando no va el 3D: con
`prefers-reduced-motion`, sin WebGL, sin JavaScript y mientras carga el modelo.
Ocupa la misma caja que el 3D, así que el cambio de una a otra no mueve el
layout. Relleno blanco plano, contorno tinta, grano y la parte activa en lima;
quieta y completa, con los nombres de las partes a la vista.

### Nombres de las partes y tipografía

- **Cada parte se nombra con texto y una línea guía**, sin cápsula: el nombre
  en Inter Tight 600 en mayúsculas a 13px, en tinta, y una línea tinta de 3px
  que sale de un punto blanco con borde tinta de 3px sobre la parte. **El
  nombre va afuera de la silueta** (a la izquierda o a la derecha de la
  raqueta): nunca sobre la raqueta ni sobre una zona lima, y nunca se sale del
  escenario. Con el 3D se ve solo el del paso activo; en la versión dibujada,
  todos.
- **Nombre gigante**: el nombre de la parte activa en la display, enorme
  (17cqi) y en una línea (interlineado 0,8), en blanco, **detrás de la raqueta,
  nunca encima**: va a la altura de la cabeza, donde el encordado y el marco le
  pasan por delante y no cae ningún nombre de parte.
- **Titular y pasos**: el titular de la sección en la display a
  `--t-display-2`; los títulos de los pasos en la display a `--t-display-4`. El
  dato técnico va en mono, con una línea lisa de 1px arriba, y el texto en
  Inter Tight 400.

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
  Los nombres de las partes y el nombre gigante también son HTML y repiten el
  título del paso, por eso van ocultos para lectores de pantalla.

### Movimiento

- **La cámara**: recorre la raqueta 3D de arriba hacia abajo con el scroll y se
  acerca a la parte de cada paso. El paso que cruza la línea de lectura (el
  centro de la pantalla; en mobile, el centro de lo que queda debajo de la
  raqueta) decide adónde mira, con entrada y salida suaves y un poco de
  inercia. Es continuo: entre un paso y otro está en el medio. Antes del
  primer paso y después del último se ve la raqueta entera. Mira de frente, un
  poco desde la derecha y desde arriba. Los focos y las anclas de cada paso
  están en `lib/anatomia.js` (`foco3d`, `ancla3d`, en centímetros del modelo).
- **Al activarse un paso**: la parte pasa a lima (el encordado brilla, aparece
  el disco del punto dulce o el antivibrador pasa a lima), el nombre de la
  parte aparece con su línea guía (sube un poco, con un fundido corto) y el
  nombre gigante aparece detrás. El paso activo se lee entero y los demás bajan
  al 35%.
- **Flotación y parallax**: la raqueta sube y baja medio centímetro y gira
  apenas (±8°); la pelota sube, baja y gira con el scroll; el nombre gigante se
  queda un poco atrás de la raqueta. Los nombres de las partes no flotan.

### El final

Después de la última parte (el tapón) viene un tramo de scroll propio, el
bloque de cierre (`data-cierre`, de 170 a 180svh). A lo largo de ese tramo:

1. **La cámara se aleja** hasta mostrar la raqueta entera, centrada, un poco
   más lejos que al principio.
2. **Los nombres de todas las partes aparecen juntos** alrededor de la
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
- **En la página, solo `transform` y `opacity`**: los nombres de las partes y
  sus líneas (posicionados en unidades del contenedor, `cqw`/`cqh`, a partir de
  la proyección de su ancla 3D), el parallax y las apariciones. Nada de `left`,
  `top` ni filtros SVG en elementos que se mueven.
- **Funciona igual en Chrome, Safari y Firefox**: el scroll se mide con
  `requestAnimationFrame`, sin `animation-timeline`.

### Sin movimiento

Con `prefers-reduced-motion`, sin WebGL o sin JavaScript no se carga el 3D: se
ve la raqueta dibujada, entera y quieta, con los nombres de las partes a la
vista, cada uno con su línea guía. No flota nada. El final es la raqueta
quieta con la frase de cierre (en la display) y el botón lima, fijos al lado
(debajo en mobile) mientras dura el tramo de cierre, que mide lo mismo con y
sin 3D. Mientras carga el modelo se ve lo mismo, y cuando está listo la
raqueta 3D aparece encima con un fundido.

## Fotos de producto

### Recortes sin fondo

Las fotos de la vitrina son **recortes del producto sin fondo**: puestas una al
lado de la otra, todas tienen el producto a la misma escala, centrado y con el
mismo margen, sobre el estudio de la celda.

- **Originales**: `public/productos/fuente/<slug>-<n>.(png|jpg|jpeg|webp)`
  (fuera de git), donde `<slug>` es el de un producto o un combo y `<n>` el
  orden (1 es la de la vitrina). Mejor fotos del producto solo, de frente,
  sobre un fondo liso y con buena luz. Las raquetas, verticales y con la cabeza
  arriba; las pelotas, el tubo parado; los bolsos, parados y cerrados.
- **`npm run fotos:productos`** (`scripts/fotos-productos.mjs`, el script de la
  época de Amargo adaptado, con `@imgly/background-removal-node`): saca el
  fondo, borra los restos sueltos (una sombra, un pedazo de cartel), recorta al
  contorno del producto y lo centra en un cuadrado transparente de 1600px con
  un 5% de margen por lado. Exporta AVIF y WebP con transparencia.
- **Dónde quedan**: en `public/productos/fuente/procesadas/` para revisarlas, y
  en el bucket `productos` de Supabase Storage como
  `recortes/<slug>-<n>.webp` y `.avif`, con su fila en la tabla `fotos` (la
  ruta del WebP y el orden; si ya había una con ese orden, se reemplaza). El
  AVIF queda al lado, con la misma ruta. `--sin-subir` procesa sin tocar
  Supabase; con slugs, procesa solo esos.
- En la celda, `FotoVitrina` muestra el recorte con `object-fit: contain` y un
  margen interno de 8%.

### Mientras tanto: placeholder

Hasta que estén las fotos, `FotoVitrina` dibuja la celda en `--estudio` con la
silueta plana de la categoría (raqueta, tubo de pelotas, rollo de cuerda o
bolso raquetero) en tinta al 6%, centrada con el mismo margen que tendrá el
recorte. Sin texto, sin ícono de imagen rota, sin líneas ni degradados. Es
decorativo (`aria-hidden`): el nombre ya está debajo. Las fotos reemplazan al
placeholder solas, producto por producto. Sin stock, la silueta se lava igual
que una foto.

Son otras fotos que las de «Fotos al scrollear»: estas muestran el producto;
aquellas, el juego.

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
- **Carga**: un bloque del alto de la pantalla, del color de lo que viene
  (tinta en la home; cal con la vitrina vacía en los listados), con «Cargando…»
  para lectores de pantalla. Mide al menos el alto de la pantalla: si no,
  cuando llega el contenido el footer salta para abajo. La muestra lo probó: con
  la pantalla de carga de hoy daba un CLS de 0,29; con la nueva, 0.
- **Error y 404** (polvo): tipográficos, sin dibujos. El código gigante en la
  display a `--t-display-1`, en tinta; un título que dice qué pasó («Página no
  encontrada», «Algo salió mal») y la píldora para volver. Centrados.

## Footer

Banda tinta a todo el ancho. El wordmark gigante en blanco con su pelota lima;
las categorías, «Combos» y «Mi cuenta» como links de texto en mayúsculas
(blancos, subrayados con el mouse); la línea de créditos de las fotos si hay
alguna («Fotos: …», ver «Fotos al scrollear») y los legales a 13px. Foco en
lima. Sin íconos sociales ni separadores.

## Voz

Sencilla y descriptiva, en castellano rioplatense (de vos). Los textos dicen
qué es cada cosa: «Todo para jugar al tenis», «Raquetas de potencia con un
punto dulce amplio», «Página no encontrada». Sin slogans, leyendas, chistes ni
frases inventadas. Los pies de foto dicen lo que se ve («Derecha en polvo»);
las etiquetas, el estado («Sin stock»). **Ningún texto repite lo que ya dice el
título.** Las descripciones de producto cuentan para qué sirve y qué lo
distingue, en una o dos oraciones.

## Rendimiento

- El video del hero, las fotos y la anatomía no compiten: el video arranca
  primero (el poster va con `fetchPriority="high"`); las fotos son lazy y su
  movimiento solo escucha el scroll mientras su banda está cerca; el 3D carga
  sin SSR y deja de renderizar fuera de pantalla.
- Todo lo que está debajo del pliegue es lazy: fotos, vitrinas fuera de la
  primera pantalla y el modelo 3D.
- Las fuentes van con `next/font`, las imágenes reservan su espacio
  (proporción o alto fijo) y la pantalla de carga mide una pantalla: nada se
  mueve al cargar.
- En mobile, menos fotos (una por banda) y movimiento más simple.

## Accesibilidad

- Contraste AA en todo el texto, con las combinaciones de la tabla «Contrastes».
  El lima nunca es texto sobre claro.
- Foco visible en todas las superficies: anillo de 3px de `--foco` (tinta en
  claras y de color, lima en tinta y video).
- Áreas táctiles de 44px como mínimo: links del header (44px de alto), el
  carrito, botones (48px), campos (48px), opciones, el «+», el ojo de la
  contraseña y la pausa del video.
- Navegación completa con teclado, un solo paso de Tab por producto (dos si el
  «+» agrega directo) y salto al contenido.
- `prefers-reduced-motion` respetado en todo (ver «Movimiento»).
- Lo decorativo va oculto para lectores de pantalla: bandas de fotos, marcas de
  agua, el nombre gigante y los nombres de las partes de la anatomía (repiten el
  paso).
- Layout fluido desde 320px, sin scroll horizontal.

## Evitar

| Evitar | Cómo se resuelve |
| --- | --- |
| Separadores punteados | Espacio entre secciones; donde haga falta una línea, 1px lisa |
| Stickers decorativos o girados | Solo etiquetas de estado: texto en mayúsculas sobre fondo plano, derechas y sin borde |
| Cápsulas en la navegación | Links de texto en mayúsculas que se subrayan; solo el carrito en píldora |
| Cápsulas alrededor de los nombres de las partes | Texto y línea guía, afuera de la silueta |
| Textos que repiten el título | Ningún elemento repite lo que ya dice el título: ni bajadas que lo reformulan ni etiquetas que lo anuncian |
| Lima como texto sobre claro o sobre las superficies | Lima de relleno, con texto y borde tinta. Como texto, solo sobre tinta o el video |
| Grafito o blanco como texto sobre polvo, cancha o césped | Todo el texto en tinta; la jerarquía sale del tamaño y del peso |
| Tres superficies de color a la vista | Dos como máximo; la del medio mide al menos 100svh o va un neutro |
| Más de una marca de agua por pantalla, o marcas en cancha | Una como máximo, solo en polvo y césped |
| Interlineado de 0,8 con mayúsculas acentuadas | 0,92 en la display: la tilde llega a 0,89em |
| Display en párrafos o por debajo de 2rem | Display solo en titulares; el texto en Inter Tight |
| Degradados, sombras, resplandores | Grano quieto, bordes tinta y rellenos planos, también en la raqueta dibujada |
| Raqueta que se pierde contra la cancha | Relleno claro, contorno tinta, la parte activa en lima; las demás partes no se apagan |
| La palabra gigante encima de la raqueta | Detrás, a la altura de la cabeza, donde no cae ningún nombre |
| Tarjetas de producto con borde, radio o texto sobre la foto | La celda es la foto sobre estudio; el nombre y el precio van debajo |
| «Comprar», la marca o «5 opciones» en la vitrina | Nombre, precio y el «+» |
| Fotos que tapan texto o botones | Bandas propias, sin clics; las fotos no salen de su banda |
| Stickers o números sobre las fotos | Un pie de foto chico debajo, que dice lo que se ve |
| Rotaciones de más de 6°, o giros fuera de las fotos | Fotos de −4° a 4° (±6° con la entrada); nada más gira |
| Movimiento con `top`, `left`, `width` o filtros | Solo `transform` y `opacity` |
| Movimiento con `prefers-reduced-motion` | Todo quieto en su estado final |
| Radios fuera de la escala | 0 en la vitrina, 6px fotos y etiquetas, 12px errores, 20px bloques, píldora para lo que se toca |
| Áreas táctiles chicas | 44px como mínimo |
| Pantalla de carga más baja que la pantalla | Un bloque del alto de la pantalla: el footer no salta |
| Placeholder con ícono de imagen rota | Bloque con la proporción exacta y la descripción, o la silueta centrada |
| Fotos de terceros sin crédito o sin licencia | `CREDITOS.txt` y licencias de uso (ver docs/FOTOS.md) |
| Copiar textos, logos, ilustraciones, fotos o colores de las referencias | Valores y textos propios |
| Slogans, leyendas y frases inventadas | Textos que describen qué hay y para qué sirve |
| Texto centrado en párrafos y productos | A la izquierda; solo se centran el hero y los estados |
