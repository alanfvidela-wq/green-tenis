# green. — Sistema de diseño

green. es una tienda de tenis que se lee como un catálogo: blanco, un gris
claro de fondo y negro, con **un solo color de acento** en las acciones. Las
fotos de los productos y de la gente jugando traen todo el color que falta.
Los titulares son enormes, en una display condensada; el resto se dice en voz
baja, con mucho aire. **Pocas cosas, grandes y con aire.**

## Referencias y precedencia

- **Este documento manda.** Las referencias son inspiración: de ellas no se
  copian textos, logos, ilustraciones, fotos ni colores. Los valores de acá son
  propios.
- `docs/referencias/twotwo.md` **manda en la base**: blanco y negro con un
  único acento en las acciones, dos radios (16px y píldora), navegación de
  texto en mayúsculas, el video del hero en un contenedor, la celda de
  producto con la barra de acción a lo ancho y la banda negra del footer.
- `docs/referencias/teenage-engineering.md` **manda en la vitrina**: el producto
  solo, grande, sobre fondo de estudio, y el texto chico y afuera de la foto.
- `docs/referencias/slush.md`: solo la idea de la display enorme y apretada.
- `docs/referencias/hungry-tiger.md` es **histórica**: describe una dirección
  que se probó y se descartó (superficies de color, fotos inclinadas). No manda
  en nada.
- Las capturas de terceros (`docs/referencias/capturas/`) no van al repo.

## Reglas de la estética

1. **Blanco, hormigón y negro, más un acento.** Todo es blanco, gris o negro.
   El único color de la interfaz es el acento, y es funcional: acción
   principal, barra de la vitrina, carrito, estados activos. Nunca de fondo de
   sección, nunca de adorno.
2. **El color lo traen las fotos**: los productos y la gente jugando.
3. **Titulares enormes** en Archivo extra condensada, en mayúsculas. El resto
   es Inter Tight en un solo peso, también en los números (ver «Números»).
4. **Pocas cosas, grandes y con aire.** Las secciones se separan con espacio,
   no con líneas. La línea de 1px queda solo para tablas, resúmenes, campos y
   el botón secundario.
5. **Dos radios y nada más**: 16px para lo que se mira (contenedores, celdas,
   fotos) y píldora para lo que se toca (botones, barras, campos, etiquetas).
6. **Sin adornos**: sin superficies de color, sin grano, sin marcas de agua,
   sin stickers, sin punteados, sin sombras ni degradados. La única sombra es
   la suave de la raqueta de la anatomía.
7. **Ningún elemento repite lo que ya dice el título.** Ni bajadas que lo
   reformulan, ni etiquetas que lo anuncian. Textos que describen, sin slogans
   (ver «Voz»).
8. **Movimiento con sentido**, solo con `transform` y `opacity`, y nada con
   `prefers-reduced-motion`.

## Paleta

| Token | Nombre | Hex | Uso |
| --- | --- | --- | --- |
| `--blanco` | Blanco | `#FFFFFF` | El fondo de las páginas y de las tarjetas |
| `--hormigon` | Hormigón | `#E6E6E6` | El gris claro de fondo: secciones alternas, placeholders de fotos, botones apagados, etiquetas neutras |
| `--estudio` | Estudio | `#F4F5F2` | El fondo de las fotos de producto en la vitrina y la galería, y la banda de la anatomía de la raqueta |
| `--negro` | Negro | `#000000` | Texto, bordes de 1px, la banda del footer |
| `--grafito` | Grafito | `#333333` | Texto secundario sobre blanco, hormigón y estudio; la raqueta 3D de la anatomía |
| `--acento` | Verde césped | `#0F6E3C` | El único color: botón principal, barra de la vitrina, carrito, estados activos, la parte activa de la raqueta |
| `--lima` | Amarillo pelota | `#DCF900` | Solo la pelota del wordmark y del favicon |

### El acento

**Verde césped** (`#0F6E3C`, el de una cancha de césped, cercano al de
Wimbledon): uno solo en todo el sitio, y siempre con **texto blanco** encima.
Acompaña el nombre de la tienda. Reemplazó al naranja polvo (`#B3471C`), y se
eligió entre tres verdes, medidos igual:

| Opción | Hex | Con blanco | Contra hormigón | Contra el estudio | Contra el negro | Como texto sobre el video |
| --- | --- | --- | --- | --- | --- | --- |
| Césped oscuro | `#0F5C36` | 8,06 | 6,46 | 7,37 | 2,60 | — |
| **Verde césped** (el elegido) | `#0F6E3C` | **6,33** | **5,07** | **5,79** | 3,32 | 1,12 |
| Verde vivo | `#0A8043` | 5,02 | 4,02 | 4,59 | 4,18 | — |
| Naranja polvo (el de antes) | `#B3471C` | 5,48 | 4,39 | 5,00 | 3,83 | 1,02 |

- **«Con blanco»** vale en los dos sentidos: texto blanco sobre el acento (en
  botones, barras y el carrito) y el acento como texto sobre blanco: 6,33:1,
  AA. Como texto también pasa sobre hormigón (5,07:1) y sobre estudio
  (5,79:1).
- **Contra el negro** da 3,32:1: más que el 3:1 de un componente. Es el paso
  del botón a su hover, que sigue siendo negro. El césped oscuro no llegaba
  (2,60:1) y el vivo no pasaba como texto sobre hormigón (4,02:1).
- **Contra el estudio**, 5,79:1: alcanza para la parte activa de la raqueta
  sobre la banda de la anatomía.
- **Sobre el video no se lee** (1,12:1 en el cuadro más claro): el titular del
  hero va en blanco y el acento queda en el botón.
- **Un solo token**: no hay variante de hover (es el negro) ni de fondo suave.
  La raqueta 3D lo repite escrito (`ACENTO` en `components/Raqueta3D.js`): si
  cambia el token, cambia ahí también.
- El lima no es acento: es el amarillo de la pelota del wordmark.

### Contrastes de los neutros

| Fondo | Negro | Grafito | Blanco |
| --- | --- | --- | --- |
| Blanco | **21,00** | **12,63** | — |
| Hormigón | **16,83** | **10,12** | 1,25 |
| Estudio | **19,19** | **11,55** | 1,09 |
| Negro | — | 1,66 | **21,00** |
| Clips del hero, con la capa negra al 55% | — | — | **5,57** |

**En negrita, las combinaciones permitidas como texto.** El grafito sobre negro
(1,66) no se usa. El lima nunca es texto.

### Superficies

- **Las secciones van sobre blanco o hormigón**, alternadas cuando hace falta
  separar, con mucho espacio arriba y abajo.
- **Banda negra**: el footer.
- **Banda de estudio**: la anatomía de la raqueta, con la raqueta en grafito.
- No hay más fondos: ni colores de superficie, ni texturas, ni dibujos de fondo.

### Foco

Anillo de 3px a 3px de distancia, del color `--foco` de cada fondo: negro sobre
blanco, hormigón y estudio; blanco sobre negro y sobre el video.

## Tipografía

| Rol | Fuente | Uso |
| --- | --- | --- |
| Display | **Archivo**, variable, ancho 62 y peso 900 | Titulares, en mayúsculas: hero, secciones, títulos de página, categorías, pasos de la anatomía, códigos de error; y el wordmark, en minúscula |
| Texto | Inter Tight 400 | Todo lo demás, en un solo peso: texto, nombres de producto, links, botones, etiquetas. La jerarquía sale del tamaño |

Las dos van con `next/font` (Google Fonts, sin archivos propios), que reserva
el espacio con una fuente de respaldo ajustada: el cambio de fuente no mueve
nada.

### La display

Archivo (ancho 62, peso 900). Se probó contra Anton y Big Shoulders: es una
grotesca como Inter Tight, así que conviven sin chocar; es un solo archivo
variable con eje de ancho y tiene los acentos completos. Anton pide
interlineado 1,14 por la altura de sus tildes, y Big Shoulders no tiene
métricas de respaldo en next/font (al cargar movería el texto).

Uso: **siempre en mayúsculas** (`text-transform`, el texto se escribe normal),
`font-stretch: 62%`, peso 900, tracking 0, `text-wrap: balance`. Nunca por
debajo de 2rem ni en párrafos, con una excepción: los títulos de los pasos de
la anatomía en mobile van a 1,75rem, porque el paso entero tiene que entrar
debajo de la raqueta. A la izquierda; solo el hero y los estados se centran.

**Interlineado: 0,92.** Con menos, las tildes de las mayúsculas (Á É Í Ó Ú Ñ,
que en Archivo suben hasta 0,89em) tocan la línea de arriba.

### Escala

| Token | Tamaño | Uso |
| --- | --- | --- |
| `--t-dato` | 0.8125rem (13px) | Links del header, nombres de las partes, legales, datos, placeholders |
| `--t-chico` | 0.875rem | Barras de la vitrina, notas |
| `--t-texto` | 1rem | Texto corrido, nombres de producto, botones |
| `--t-entrada` | clamp(1.0625rem, 1.3vw, 1.25rem) | Bajadas, el botón del hero |
| `--t-titulo` | clamp(1.25rem, 2vw, 1.625rem) | Subtítulos |
| `--t-display-4` | clamp(2rem, 4vw, 3.25rem) | Pasos, categorías, nombres en la página de producto |
| `--t-precio` | clamp(2.25rem, 3.2vw, 2.75rem) | El precio de la página de producto y de un combo, en la display |
| `--t-display-3` | clamp(2.75rem, 6.5vw, 5.5rem) | Títulos de página |
| `--t-display-2` | clamp(3.5rem, 10vw, 9rem) | Títulos de sección de la home |
| `--t-display-1` | clamp(4.5rem, min(15vw, 17svh), 14rem) | 404 y error. Depende también del alto |

Interlineado: 0,92 en la display, 1,2 en subtítulos, 1,5 en bajadas, 1,6 en
texto. Tracking: 0,06em en las mayúsculas de Inter Tight (links, barras,
etiquetas).

### Números

No hay tipografía monoespaciada: los números van con las mismas dos fuentes.

- **Precios grandes** (el de la página de producto y el de un combo, a
  `--t-precio`, y el total destacado del carrito, el checkout y el pedido, a
  2rem): en la display, con `font-variant-numeric: tabular-nums`. Como toda la
  display, nunca por debajo de 2rem.
- **Números chicos y precios secundarios** (los precios de las celdas, del
  carrito y de la barra fija, los desgloses, las pulgadas del grip, el stock,
  la cantidad, la insignia del carrito, fechas, contadores, la ficha técnica,
  los medidores y las tablas de la administración): en Inter Tight con
  `font-variant-numeric: tabular-nums`, para que las cifras queden alineadas
  en columnas y no salten cuando cambian (el precio que sube, la cantidad que
  rebota). La clase global `.dato` lo trae, a 13px.

### Wordmark

«green.» en minúscula, en Archivo (900, ancho 62), con el punto como **pelota
de tenis**: el círculo amarillo pelota (`--lima`) con sus dos costuras en negro
(`Pelota`), a 0,34em, sobre la línea de base. La pelota es la misma con
cualquier acento.

- Header: negro sobre blanco; blanco sobre el video.
- Footer: gigante (hasta 12rem), en blanco sobre negro.
- Favicon: la pelota sola, en `app/icon.svg`.

## Radios, bordes y espacios

- **Dos radios**: `--radio` (16px) para lo que se mira (el contenedor del hero,
  las fotos de la vitrina, las celdas y los bloques de foto, las tarjetas de
  categoría, el resumen, la tabla, los recuadros de error) y `--radio-pildora`
  (50px) para lo que se toca (botones, la barra de la vitrina, el carrito,
  campos, opciones, etiquetas de estado). Nada más: ni 4, ni 8, ni 12px.
- **Bordes**: 1px negro, solo en tablas, resúmenes, campos, el botón
  secundario y los recuadros de error.
- **Espacios**: múltiplos de 4px, `--espacio-1` (4px) a `--espacio-32`
  (128px). Las secciones llevan `clamp(4rem, 10vw, 8rem)` arriba y abajo. El
  gutter es `clamp(1rem, 4vw, 2rem)` y el ancho máximo del contenido, 1280px.

## Componentes

### Header

- **El wordmark a la izquierda; al lado, los links de texto; a la derecha,
  «Mi cuenta» y el carrito.** Los links (las cuatro categorías, «Combos» y
  «Quiz») van en mayúsculas a 13px, con tracking 0,06em y 44px de alto; con el
  mouse se subrayan. Sin píldoras en los links.
- **El carrito** es la única píldora: el acento con texto blanco («Carrito
  (0)», con `BotonCarrito`); hover, negro (blanco sobre el video).
- **El link activo** queda subrayado y lleva `aria-current="page"`, solo en la
  página que corresponde (la categoría abierta, los combos, el quiz o la
  cuenta): el header lo saca de la ruta (`usePathname`). En la home no hay
  ninguno.
- **Sobre el video**: en la home el header va adentro del contenedor del hero,
  sin fondo, con el wordmark y los links en blanco y foco blanco.
- **Fijo**. Al scrollear (un poco antes de terminar el hero) pasa a banda
  blanca, con el texto en negro. En las demás páginas es blanco desde el
  principio. La lógica de `CabeceraFlotante` no cambia: mide su alto y lo
  publica en `--alto-header`.
- **Se esconde en la anatomía**: mientras la raqueta queda fija y la sección
  ocupa la pantalla, el header se desliza para arriba; vuelve al salir de la
  sección o al scrollear para arriba (ver «Anatomía de una raqueta»).
- **El wordmark mide lo que mide** (no se estira a su columna): el anillo de
  foco, que como todos aparece solo con `:focus-visible`, lo rodea a él.
- De 640 a 1023px los links de las secciones bajan a una segunda fila (las
  seis entran); arriba quedan el wordmark, «Mi cuenta» y el carrito.
- **En el celular (menos de 640px), el menú**: una sola fila con el wordmark,
  el botón «Menú» y el carrito. «Menú» es texto como los links (subrayado
  mientras está abierto), no una hamburguesa ni una píldora. Abre una hoja
  blanca debajo del header, hasta abajo de la pantalla, con las seis secciones
  y «Mi cuenta» una debajo de la otra, como los links del footer (48px de
  alto). Sobre el video, con el menú abierto el header pasa a la banda blanca.
  Es un disclosure (`MenuSecciones`): `aria-expanded` y `aria-controls` en el
  botón, los links siguen en el orden de tabulación, y se cierra con el mismo
  botón, con Escape (el foco vuelve al botón), al elegir un link, al tocar
  afuera o cuando el foco sale del menú. Con el menú abierto, el header no se
  esconde en la anatomía.
  - Por qué un menú y no la fila con scroll horizontal: en 375px entraban
    cuatro secciones y media, y «Combos» y «Quiz» quedaban afuera sin nada
    que dijera que seguían. El indicio tendría que ser un degradado o una
    sombra en el borde (fuera del sistema) o flechas, y con el mouse la fila
    no se scrollea. El menú las muestra todas juntas, con aire, sigue siendo
    texto en mayúsculas y deja el header en una fila (60px en vez de 104px),
    que es pantalla para el resto, sobre todo en la anatomía.

### Botones

- **Principal**: píldora del acento con texto blanco, sin borde, mínimo 48px de
  alto (60px en el hero). Hover: negro (blanco con texto negro sobre el video).
- **Secundario**: blanco con borde de 1px negro; hover, hormigón.
- **Apagado**: hormigón con texto grafito.

### Etiquetas de estado

Solo para estados: sin stock, pagado, pendiente, pago en proceso, cancelado,
vencido (`Estado`). Nunca de adorno. Texto en mayúsculas a 12px sobre un fondo
plano, en píldora, sin borde: el acento con texto blanco (pagado), hormigón
con texto negro (pendiente, pago en proceso), negro con texto blanco (sin
stock, cancelado, vencido). El texto siempre dice el estado.

### Campos

Píldora blanca de 48px con borde de 1px negro y texto a 16px; la etiqueta,
arriba, en mayúsculas a 13px. El error va debajo, en un recuadro blanco con
borde de 1px y radio de 16px, ligado con `aria-describedby` y `aria-invalid`.
Los campos de contraseña llevan el ojo adentro, a la derecha (ver «Cuenta»).

### Tarjetas de categoría

Una por categoría, en dos columnas (una en mobile), blancas sobre hormigón, con
radio de 16px. Adentro: el nombre en la display (`--t-display-4`), la bajada
y, abajo, la cantidad y una flecha. Toda la tarjeta es el link: con el
mouse o el foco se pinta del acento, con el texto en blanco, y la flecha avanza
6px.

## Vitrina de productos

El producto solo, grande, sobre estudio; el nombre y el precio afuera, en voz
baja; y la barra de acción a lo ancho.

**Dónde va.** La grilla de cada categoría y cualquier listado de productos
(`GrillaProductos` + `TarjetaProducto`), el listado de combos
(`TarjetaCombo`), «Lo que más sale» en la home y el kit del quiz (con el
motivo debajo del nombre). La foto de cada celda la pone
`FotoVitrina`. La pantalla de carga dibuja la misma grilla vacía.

### La grilla

- **Celdas grandes**: tres por fila desde 1000px, dos en tablet y en mobile.
- 20px entre columnas (12px en mobile) y 48px entre filas (40px en mobile).
- **Celdas de foto**: cada tanto (una por tanda de seis, en la cuarta
  posición), una celda con una foto de gente jugando, del mismo tamaño que las
  de producto y **sin texto encima** (ver «Fotos»).

### La celda

- **La foto**: proporción 4:5, sobre `--estudio`, **sin borde, con radio de
  16px**. El producto ocupa casi toda la celda: la foto recortada sin fondo
  viene en un lienzo de 4:5 con su margen y entra con `object-fit: cover`; el
  placeholder centra la silueta igual.
- **Debajo, una fila**: el nombre a la izquierda (Inter Tight a 16px,
  subrayado) y el precio a la derecha, a 13px con cifras de ancho fijo («desde» si cambia con
  las opciones). En celdas de menos de 260px, el precio baja debajo del nombre.
- **Debajo, la barra**: una píldora de ancho completo y 48px de alto en el
  acento, con «Ver producto» (en los combos, «Ver combo») en mayúsculas y
  texto blanco. **Sin stock**, la barra va en negro y dice «Sin stock».
- **Toda la celda es un solo link** al producto (un solo paso de Tab).
- Sin sombras, sin degradados, sin texto sobre la foto.

### Orden y filtros

En la página de cada categoría, entre el encabezado y la grilla
(`FiltrosListado`, con `lib/listado.js`):

- **Un grupo por cosa que se elige**, con el rótulo en mayúsculas a 13px (como
  la etiqueta de un campo) y las opciones en píldoras de 44px con borde de 1px,
  como las opciones de la ficha: «Ordenar» (Recomendados, que es el orden de
  la tienda; Menor precio; Mayor precio), «Marca» (si hay más de una) y, en
  las raquetas, «Nivel». La elegida va en el acento con texto blanco; la
  primera de cada grupo es la que vale sin elegir nada.
- **Cada opción es un link** a la misma página con los parámetros en la URL
  (`?orden=precio-asc&marca=wilson&nivel=intermedio`): se resuelve en el
  servidor, anda sin JavaScript, se puede compartir y no vuelve arriba. La URL
  canónica sigue siendo la de la categoría sola.
- **La cuenta** del encabezado pasa a «2 de 5 productos» cuando hay un filtro.
  Si no queda ninguno: «Ningún producto con esos filtros.» y el link «Quitar
  los filtros».
- Los grupos van uno al lado del otro y bajan de a uno cuando no entran.

### Estados

- **Hover y foco**: el producto escala a 1,03 (400ms) y la barra pasa a negro.
  El foco agrega el anillo de 3px alrededor de la celda. Sin giros.
- Con `prefers-reduced-motion`, el producto no se mueve: queda el cambio de la
  barra y el foco.

### La galería del producto

Las fotos van sobre estudio, con radio de 16px y el producto centrado con el
mismo margen, sin texto encima. Acá el producto no se apaga aunque no haya
stock: eso lo dicen las opciones, al lado.

- **`/producto/[slug]`** (`GaleriaFicha`): en escritorio, una grilla de dos
  columnas con las fotos grandes. Una sola foto (o la primera de tres) va a lo
  ancho, y una sola nunca es más alta que la pantalla: la celda se acorta y el
  producto sigue centrado. Con más de cuatro se ven cuatro y abajo «Ver todas
  (n)», un botón secundario; las demás entran de a una, subiendo 14px. En
  mobile es un carrusel que se desliza de a una foto (scroll snap), con puntos
  abajo: el de la foto que se ve, negro y estirado. Con una sola foto no hay
  puntos.
- **En grande** (`VisorFotos`): cada foto es un botón; al tocarla se abre a
  pantalla completa sobre estudio, en un `<dialog>` modal, tan grande como
  entra. Arriba, la marca y el nombre en mayúsculas chicas y la cruz; abajo,
  el contador («2 / 4»). Se pasa de una a otra con las flechas (a los
  costados en escritorio, abajo junto al contador en mobile), con las del
  teclado o deslizando, y de la última se vuelve a la primera. Se cierra con
  la cruz o con Escape, y el carrusel queda en la última foto que se vio. Los
  botones son círculos blancos de 48px, como la pausa del video. En la
  galería, con el mouse o el foco, el producto se acerca (1,03), como en la
  vitrina.
- **Fotos por variante**: una variante puede tener su foto propia, una de las
  de su producto (`variantes.orden_foto`), como el pack de 3 y el de 12 de un
  grip. Entonces la galería sigue a la opción elegida en el panel: primero va
  la foto de esa variante (si no tiene, la principal del producto), después
  las que no son de ninguna variante, y las de las otras variantes no se ven.
  En mobile el carrusel vuelve a la primera. La barra fija también muestra la
  foto de la variante; la vitrina y el carrito, la principal.
- **`/combo/[slug]`** (`GaleriaProducto`): la primera vista grande y las demás
  de a dos debajo; en escritorio queda fija mientras se lee la ficha.

## Fotos

Las fotos de juego y de objetos que traen color y aire al sitio. No son las de
producto (ver «Fotos de producto»).

### Los lugares

`lib/fotos.js` define 10 lugares, mitad gente jugando y mitad objetos, con
nombre de archivo, uso, proporción, página y descripción de qué foto buscar. La
lista para conseguirlas y cómo agregarlas está en `docs/FOTOS.md`.

- **Celdas de la vitrina** (gente jugando, 4:5): una por página (la home y
  cada categoría), del mismo tamaño que las celdas de producto, con la foto
  recortada al alto de la fila (`object-fit: cover`), radio de 16px y sin texto
  encima.
- **Bloques entre secciones** (objetos, 16:9): de ancho completo dentro del
  contenido, con radio de 16px y sin texto encima. En la home, uno solo, antes
  de la anatomía.
- Son decorativas: van ocultas para lectores de pantalla.

### Placeholder

Hasta que esté la foto, el lugar muestra un bloque **hormigón** del mismo
tamaño, con el nombre del archivo y la proporción y la descripción en
texto chico, en grafito. Las fotos reemplazan al placeholder solas, lugar por
lugar.

### Movimiento

Sin inclinación ni parallax. Como mucho, **una aparición suave al entrar en
pantalla** (`Aparecer`): sube 24px y aparece en 600 a 800ms, una sola vez. Lo
que ya está a la vista al cargar no se esconde, y con `prefers-reduced-motion`
o sin JavaScript se ve desde el principio.

### Archivos y rendimiento

- Las fotos fuente van en `public/fotos/fuente/` (fuera de git) y
  `npm run fotos` (`scripts/fotos.mjs`, con sharp) genera AVIF y WebP a 480,
  800, 1200 y 1600px en `public/fotos/`, recortados a la proporción del lugar,
  más el blur de carga, y lo anota todo en `lib/fotosGeneradas.json`. La página
  mira ese manifiesto (no la carpeta, que no llega a Vercel) para elegir entre
  la foto y el placeholder.
- `FotoLugar` arma un `<picture>` con AVIF y WebP de respaldo usando
  `getImageProps` de next/image: `sizes`, lazy, y el blur del manifiesto de
  fondo mientras carga. Los bloques reservan su espacio con la proporción; las
  celdas, con el alto de la fila.
- **Créditos**: en `public/fotos/fuente/CREDITOS.txt` (`archivo | autor |
  fuente | url`); el script los pasa al manifiesto y el footer los muestra en
  una línea («Fotos: …»). Si no hay fotos, no se muestra nada.

## Movimiento

Poco y con sentido. Solo `transform` y `opacity`; nada de `top`, `left`,
`width` ni filtros en lo que se mueve. Sin giros.

- **Hero**: los clips en secuencia, con un fundido de 0,8s entre uno y otro.
  Se pueden pausar.
- **Vitrina**: con el mouse o el foco, el producto se acerca (escala 1,03) y la
  barra pasa a negro.
- **Categorías**: la tarjeta se pinta del acento y la flecha avanza 6px.
- **Fotos**: la aparición suave al entrar en pantalla.
- **Anatomía de una raqueta**: la cámara sigue al scroll y el header se
  esconde mientras la sección ocupa la pantalla (ver esa sección).
- **Header**: pasa de transparente a blanco con una transición de 300ms.
- **Microanimaciones** (inspiradas en Kinetics, de Csaba Kissi; ver
  «Créditos» en el README). Dos curvas en `globals.css`: `--deslizar`
  (cubic-bezier(0.16, 1, 0.3, 1)) y `--resorte` (cubic-bezier(0.34, 1.56,
  0.64, 1)).
  - **Carrito**: mientras llega la cotización, cada línea y el resumen
    muestran un esqueleto del mismo alto que lo que va a llegar, con un brillo
    que pasa en 1,4s; cuando llega, el esqueleto se apaga en 0,3s y el
    contenido sube 8px y aparece en 0,4s (`--deslizar`). El CLS del carrito
    en mobile pasó de 0,31 a 0.
  - **Insignia del carrito** (header): cuando sube la cantidad, salta a escala
    1,4 con `--resorte` en 0,3s y vuelve a los 320ms.
  - **«Agregado al carrito»**: una píldora negra abajo al centro, que entra
    desde 140% más abajo a escala 0,9 y se pasa un poco de su lugar
    (cubic-bezier(0.18, 1.25, 0.4, 1), 0,55s). Se va a los 2,2s. Reemplaza la
    nota que había debajo del botón.
  - **Cantidad** (carrito y producto): el número rebota a escala 1,3 con
    `--resorte` en 0,35s y el botón apretado se hunde a 0,9 en 0,1s.
  - **Pago aprobado**: el aro se dibuja en 0,5s (cubic-bezier(0.65, 0, 0.35,
    1)) y toma el acento; después se traza la tilde en 0,3s.
  - **Vitrina**: las tarjetas que están debajo de la pantalla al cargar suben
    14px y aparecen en 0,45s (`--deslizar`), cada una 90ms después de la
    anterior. La celda de foto mantiene su propia aparición.
  - **Página de producto** (ver «Páginas»): el precio sube 6px y aparece en
    0,3s cuando cambia; los botones de opción se hunden a 0,96 en 0,1s; la
    cuerda y la tensión del encordado suben 6px al aparecer (0,35s); la barra
    fija entra desde abajo en 0,4s (`--deslizar`); el punto del carrusel se
    estira (escala 2,25 en x) en 0,35s; las fotos de «Ver todas» suben 14px de
    a una, como la vitrina; el visor de fotos aparece en 0,3s y pasa de una
    foto a otra deslizándose; el acordeón baja 8px su contenido en 0,35s y el
    signo achica su barra vertical; el arco de los medidores se dibuja en 0,9s
    (un trazo, como el aro del pago aprobado).
- **Con `prefers-reduced-motion`**: el hero muestra solo el poster del primer
  clip, las fotos
  se ven desde el principio, la anatomía muestra la raqueta entera y quieta con
  los nombres de sus partes, y no hay animaciones ni transiciones (tampoco
  las microanimaciones: el esqueleto queda quieto, el aviso aparece sin
  moverse y el chequeo se ve completo).

## Estructura de la home

1. **Hero**: el video en un contenedor, con el header adentro. Ver «Hero».
2. **Lo que más sale** (blanco): el título en `--t-display-2` y la vitrina, con
   una celda de foto entre los productos. Sin bajada: el título ya dice qué hay.
3. **Quiz de juego** (blanco): «Tu kit en seis preguntas» en `--t-display-2`
   y, al lado (debajo en mobile), qué recomienda y el botón del acento «Hacer
   el quiz», de 60px. Sin espacio arriba propio: ya lo deja «Lo que más sale».
   Va antes de la anatomía, que es larga, para que se vea sin scrollear tanto.
   Ver «Quiz».
4. **Bloque de foto** (`pelota-polvo-01`).
5. **Anatomía de una raqueta** (banda de estudio). Ver esa sección.
6. **Categorías** (hormigón): el título y las cuatro tarjetas, pegadas a la
   anatomía, sin foto en el medio. Cada banda deja su espacio arriba y abajo.
7. **Footer** (negro).

Sin cintas con leyendas ni bloques de slogan.

## Hero

- **El video en un contenedor**, no a sangre: un bloque con radio de 16px y el
  gutter de margen alrededor, del alto de la pantalla menos ese margen. Adentro,
  el header (en blanco), el titular, la bajada y el botón.
- **Video**: tres clips de la misma cancha techada de polvo de ladrillo, sin
  audio, que pasan en secuencia con un fundido entre uno y otro y vuelven a
  empezar: el jugador de blanco, el pique antes del saque y una derecha. Ver
  «Video».
- **Capa plana negra al 55%**, pareja en todo el contenedor (no es un
  degradado), la misma sobre todos los clips. Medida sobre un cuadro cada medio
  segundo de las dos versiones de cada clip: en el cuadro más claro, el blanco
  del texto da 5,57:1 (el jugador; el pique, 5,92:1, y la derecha, 7,03:1;
  percentil 99 de la zona del texto). Con la capa al 40% de antes no llegaba
  a AA.
- **Titular** centrado, **en blanco**, en Archivo: «GAME, SET, MATCH», en una
  sola línea (con `lang="en"`, para que los lectores de pantalla lo
  pronuncien bien). Mide 6,9em: en pantallas angostas su tamaño es el ancho
  del texto dividido 7 (la caja del hero en `cqi`, menos el gutter de cada
  lado), así va de borde a borde (44px en 375); en desktop se frena en 8,5rem
  (136px, lo que medía el titular de antes en 1280): grande, sin ocupar todo
  el ancho. Es la única display que se calcula así. El acento no se lee sobre el video
  (1,12:1). Debajo, qué se vende, en blanco («Todo para jugar al tenis:
  raquetas, pelotas, cuerdas, grips y bolsos de las marcas que ya
  conocés.»), y el botón del acento, grande (60px de alto). El `<title>`
  («green. — Todo para el tenis») y la descripción dicen que es una tienda de
  tenis.
- **Poster**: el primer cuadro del primer clip, de cada versión, en WebP,
  pintado por el servidor en un `<picture>`. Los videos se montan encima desde
  un componente cliente (`VideoFondo`), que elige la versión según el ancho
  (corte en 760px) y el formato (WebM si el navegador lo reproduce; si no, MP4).
- **Control**: círculo blanco con el ícono de pausa/play en negro, abajo a la
  derecha del contenedor, con etiqueta accesible. Pausa toda la secuencia,
  también en medio de un fundido.

## Combos

Kits armados por la tienda con un descuento sobre la suma de sus productos:
«Kit para arrancar» (raqueta, tubo de pelotas y overgrip), uno por perfil del
quiz («Kit control», «Kit potencia», «Kit cuidá tu brazo»: raqueta, cuerda
compatible según el armador y dos tubos) y «Pack entrenamiento» (pelotas y
overgrips, sin raqueta). Se cargan por migración (`0009_combos.sql`). Se
muestran y se venden como un producto más, con las mismas piezas.

- **La imagen** (`ComboImagen`): no es un archivo; se arma con las fotos de
  sus productos, encimadas sobre estudio, así cambia sola si cambia un
  producto o su foto. La raqueta grande atrás (más ancha que la celda, porque
  el recorte trae margen) y la cuerda, las pelotas o el grip más chicos
  adelante, abajo a la derecha; sin raqueta, el primero grande y los otros al
  lado. De cada ítem va la foto de su pack, si tiene (`orden_foto`), o la
  principal. Para los lectores de pantalla es una sola imagen, con el nombre
  y lo que trae. Va en la celda y de portada en la página del combo.

- **Precio y stock** (`lib/combos.js`): se calculan en el servidor a partir de
  los ítems. El precio es la suma menos el descuento redondeado para abajo (la
  misma cuenta que hace `crear_pedido` en la base). El stock es cuántos combos
  alcanzan con el ítem más escaso. Si un ítem tiene variantes (grip y peso), el
  cliente elige una: el precio de cada combinación llega calculado y la página
  solo muestra el que corresponde. Un combo con algún producto inactivo no se
  muestra.
- **La celda** (`TarjetaCombo`): la misma de la vitrina, con la imagen armada.
  En la fila, el nombre y, a la derecha, lo que sale por separado tachado (en
  grafito) y, debajo, el precio del combo («desde» si cambia con las
  opciones). Debajo, lo que trae, una línea por producto en grafito
  («2 × Dunlop Fort Clay Court»), y cuánto se ahorra («Ahorrás $ 48.070»;
  «desde» si cambia con las opciones).
- **El listado** (`/combos`): como una categoría. Migas, «Combos» en la
  display a `--t-display-3`, una línea que dice qué son («Raqueta, cuerda y
  pelotas elegidas para cada forma de jugar, o pelotas y grips para entrenar:
  juntos salen menos que comprando cada producto por separado»), la cantidad
  y la vitrina. Va en el header y en el footer,
  después de las categorías.
- **La página** (`/combo/[slug]`): como la de producto. La galería abre con la
  imagen armada, en la celda grande, y sigue con las fotos del combo, si
  tiene, y la de cada producto. A la
  derecha:
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

## Quiz

Seis preguntas sobre cómo se juega que terminan en un kit del catálogo: dos o
tres raquetas, una cuerda y una pelota, cada una con por qué encaja. Se llega
solo desde «Quiz» en el header y desde la home: los listados no lo ofrecen.

- **Las preguntas** (`PREGUNTAS` en `lib/quiz.js`): nivel, cuántas veces por
  semana, desde dónde (fondo, red o toda la cancha), potencia o control, si
  quiere algo cómodo para el brazo y la superficie (polvo de ladrillo, cancha
  dura, sintético o varias).
- **`/quiz`**: una pregunta por pantalla. Arriba, el número («02 /
  06») y la barra de progreso, una píldora hormigón de 8px con el relleno del
  acento. «Quiz de juego» va chico, en mayúsculas: lo grande es la pregunta,
  en la display a `--t-display-3`. Las opciones son píldoras grandes con borde
  de 1px (el texto y, debajo, en grafito, qué quiere decir), en una columna en
  mobile y en dos o tres desde 700px; la elegida, en el acento con texto
  blanco. Elegir pasa sola a la siguiente; «Atrás» vuelve sin perder lo
  elegido (y entonces aparece «Siguiente»). En la última, «Ver mi kit», el
  botón del acento. La página mide al menos una pantalla.
- **La recomendación** (`lib/quiz.js`): reglas de puntaje, nada de IA. Cada
  respuesta suma (o resta) puntos a atributos del producto: el nivel (el
  mismo suma todo; el de al lado, la mitad), el perfil de juego, y el peso, la
  rigidez, la cabeza y el balance **relativos al catálogo** (la más liviana
  suma más para quien empieza o quiere cuidar el brazo). La superficie es lo
  que más pesa en la pelota (sintético y varias van con las de todas). Lo que
  no tiene stock baja en el ranking, pero no sale. El motivo de cada producto
  son las frases de las dos reglas que más le sumaron.
- **El resultado** (`/quiz/resultado`, con las respuestas en la URL): migas,
  «Tu kit» a `--t-display-3`, las respuestas en una línea (separadas
  por «·»), «Llevalo como combo» (el botón del acento, con «Kit control:
  ahorrás $ 48.070» al lado) si el kit coincide con un combo con stock (lleva
  la primera raqueta recomendada y además su cuerda o su pelota;
  `comboDelKit`), «Volver a hacer el quiz» (secundario) y si quedó guardado en
  la cuenta (o «Guardar en mi cuenta», o «Ingresá para guardarlo»). Debajo,
  «Raquetas» y «Cuerda y pelota» en la display a `--t-display-4`, cada uno con
  la vitrina del catálogo (`GrillaProductos`): las mismas celdas que en
  Raquetas, con el motivo en grafito debajo del nombre («Está pensada para tu
  nivel…»). La celda entera lleva a la página del producto, donde se elige
  grip, peso o presentación y se agrega al carrito.
- **Tu kit** (`/tu-kit`, en la cuenta): con sesión, el quiz guarda el kit (el
  último reemplaza al anterior, en `kits_quiz`, que cada usuario ve solo suyo).
  La página lo muestra igual que el resultado, con la fecha del quiz y los
  precios y el stock de hoy. Sin kit, «Hacer el quiz».
- **Movimiento**: la pregunta nueva entra desde el costado al que se va (32px
  y opacidad, 0,45s con `--deslizar`); la barra crece con `scaleX` (0,5s,
  `--deslizar`); la opción apretada se hunde a 0,97 y, al elegirla, salta a
  1,03 con `--resorte`. Las celdas del kit entran escalonadas, como en la
  vitrina. Al pasar de pregunta, el foco va a la pregunta nueva.

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
- **La página** (`/carrito`): título en `--t-display-3`. Las líneas van
  separadas por 1px:
  - la foto chica sobre estudio, con radio de 16px, o la silueta;
  - la marca (o «Combo») en mayúsculas, el nombre y, en grafito, la variante o
    lo que trae el combo;
  - lo que impide comprarla, en un recuadro con borde de 1px y radio de 16px,
    como los errores de los campos;
  - la cantidad en una píldora (− n +, con tope por stock) y «Quitar»;
  - el subtotal y, en los combos, cuánto se ahorra.
- **El resumen**, a la derecha (abajo en mobile), fijo mientras se scrollea:
  sobre hormigón, con radio de 16px, subtotal, descuento de combos, envío
  («Gratis» por ahora) y total en filas de 1px (`Totales`, el mismo en el
  checkout y en los pedidos), y «Ir a pagar» (el acento), apagado mientras se
  recalcula o si alguna línea tiene un problema.
- **Vacío**: «Tu carrito está vacío» y el botón «Ver raquetas».

## Cuenta

- **Con email y contraseña** (Supabase Auth, sin confirmación por mail: al
  crear la cuenta ya queda la sesión iniciada). La contraseña tiene al menos 8
  caracteres; lo controla el formulario y también Supabase. Al crear la cuenta
  (y al elegir una nueva) se escribe dos veces: si lo repetido no coincide,
  debajo dice «Las contraseñas no coinciden» en el momento y el formulario no
  se envía (`CamposContrasena`); el servidor lo vuelve a revisar.
- **Mostrar la contraseña**: cada campo de contraseña (`EntradaContrasena`)
  lleva adentro, a la derecha, un ojo de línea fina en negro (SVG en línea,
  tachado cuando se ve lo escrito) en un círculo de 44px que se pinta hormigón
  al pasar el mouse. Es un `type="button"` que no saca el foco del campo, con
  «Mostrar contraseña» u «Ocultar contraseña» y `aria-pressed`. Al enviar, el
  campo vuelve a ocultarse, así el navegador ofrece guardar la contraseña.
- **Rutas protegidas**: `/checkout`, `/mis-pedidos`, `/tu-kit` y `/nueva-contrasena`. Sin
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
  `/recuperar`, `/nueva-contrasena`): una columna angosta con el título en
  `--t-display-3`, una bajada que dice para qué («Para terminar la compra,
  ingresá con tu cuenta») y el formulario con los campos del sistema. Debajo,
  el link a la otra página.
- **Cerrar sesión**: en `/mis-pedidos`, con el botón secundario.

## Checkout

- **`/checkout`** (con sesión), armado como el carrito. A la izquierda,
  «Comprás como …» y los datos de envío: nombre y apellido, teléfono, calle y
  número, piso o departamento (opcional), ciudad, provincia (las 24) y código
  postal, con los campos del sistema. A la derecha, «Tu pedido»: una fila por
  línea con la cantidad, **marca y nombre** («Babolat Pure Drive»; los combos,
  por su nombre), la variante o lo que trae el combo en grafito y el subtotal;
  después los totales y «Cambiar el carrito».
- **Confirmar y pagar** (el botón del acento): el servidor vuelve a cotizar el
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

- **El listado** (`/mis-pedidos`): el encabezado de un listado con la cuenta y
  «Cerrar sesión», y una fila de 1px por pedido con **columnas de ancho fijo**,
  iguales en todas las filas, para que todo quede alineado:
  - desktop (desde 900px): número (11rem, «Pedido #1001», lleva al detalle),
    fecha y hora (la única flexible), estado (11rem, la etiqueta de
    estado) y total, alineado a la derecha (9rem);
  - mobile: el número y el total arriba, en la misma fila; debajo, la fecha y,
    debajo, la etiqueta del estado. Nada se corta ni desborda.
- **El detalle** (`/mis-pedidos/[id]`): número, fecha, estado (etiqueta) y qué
  significa. Si está pendiente o se canceló por vencido, antes de mostrarlo el
  servidor busca sus pagos en Mercado Pago y los concilia, por si el aviso del
  webhook no llegó: un vencido pagado a tiempo vuelve a «Pagado».
  Un pendiente dice hasta qué hora se puede pagar («Tenés hasta las 14:32…»)
  y lleva el botón del acento «Pagar con Mercado Pago», que reusa la
  preferencia del pedido; si el último intento se rechazó, lo dice y ofrece
  probar de nuevo. Con un pago en proceso se ve «Pago en proceso» y no vence;
  pasados los 30 minutos sin pago, «Vencido». Un cancelado dice si fue por
  vencido o porque se devolvió el pago, y si llegó un pago aprobado tarde, que
  se está revisando. Debajo, «Qué compraste»: cada combo con sus productos
  sangrados y lo que se ahorró, y los productos sueltos con marca y nombre,
  variante, cantidad por precio y subtotal, todo con los precios congelados del
  pedido. Al costado, los totales (con «Envío») y los datos de envío. Sin pago
  online, un pendiente lleva arriba el aviso «El pago online todavía no está
  disponible.» (con «Listo: tu pedido quedó registrado.» si recién se
  confirmó), dice hasta qué hora queda pendiente y no tiene botón de pago.
- **La vuelta de Mercado Pago** (`/mis-pedidos/[id]/pago/aprobado`,
  `/pendiente` y `/rechazado`): un encabezado de estado centrado, como el 404,
  con «Pago aprobado», «Pago en proceso» o «Pago rechazado» en la display, qué
  significa y «Ver el pedido». El rechazado suma «Probar de nuevo» (el acento)
  mientras el pedido se pueda pagar y haya pago online. Antes de mostrarse, si
  el pedido está pendiente, el servidor busca sus pagos en Mercado Pago y los
  concilia (lo mismo que el detalle del pedido): «Pago aprobado» dice si ya está
  acreditado. Los parámetros de la URL de vuelta nunca cambian el pedido (ver
  docs/API.md).

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
- **Props**: `resaltadas` (las partes en el acento), `estilo`, `encuadre`
  (`ajustado`, solo la raqueta, o `lienzo`, 400×560 con aire para las
  etiquetas) y `prefijo` (para los ids si hay más de una en la página). Exporta
  `ANCLAS` (el punto de cada parte), `PATRON` y `LIENZO`.
- **Estilo `linea`** (el que va en «Armá tu raqueta»): línea negra de 1,5px
  sobre blanco, sin rellenos. Es un dibujo técnico, no una ilustración.
  Resaltar es poner un marcador del acento debajo de la línea; el resto baja a
  gris (negro al 28%).
- **Estilo `inflada`** (el de la anatomía): cada parte con cuerpo, **relleno
  blanco plano** y contorno negro; **la parte activa en el acento**. Sin
  degradados ni brillos, y las demás partes no se apagan: la raqueta se lee
  entera contra el estudio de la banda.

## Anatomía de una raqueta

Una sección de la home, después del bloque de foto y antes de las categorías,
que explica la raqueta parte por parte. Lo que sigue es lo propio de la sección.

### Color y fondo

- **Banda de estudio** (`--estudio`) de borde a borde, el mismo tono de las
  fotos de producto, sin texturas ni dibujos. Entra y sale con un borde recto.
- Negro para el texto, los títulos, las líneas guía y el contorno de los
  puntos; grafito para la bajada, el número y el dato de cada paso; el acento
  para la parte activa (5,79:1 contra el estudio).
- **La raqueta contrasta con la banda**: la 3D va en grafito satinado, con las
  cuerdas claras; la dibujada, en relleno blanco con contorno negro. Las dos
  llevan una **sombra suave** (un `drop-shadow` de CSS, negro al 20%, 22px de
  desenfoque y 18px hacia abajo): la única sombra del sitio. La parte activa
  va en el acento.
- Sin la pelota flotante de antes: pocas cosas.

### La raqueta 3D

- **Modelo**: `public/models/raqueta.glb`, una raqueta de tenis realista (marco,
  garganta, grip y encordado modelado). Sale de `modelos-fuente/raqueta.glb`
  (fuera de git) con `npm run modelo:raqueta`: gltf-transform con meshopt y
  texturas WebP de 2048px como máximo, de 19 MB a 364 KB. Trae tres mallas: la
  raqueta (marco con sus ojales, garganta, empuñadura con el grip y tapón) y el
  encordado en dos mallas. Viene acostado y se endereza en el código. El
  material del marco pasa a grafito (`#333`, rugosidad 0,42 y un poco de
  metal) para que se lea contra el estudio y la luz le marque el contorno.
- **Resaltar**: lo que es una malla aparte se pone del acento con un emissive
  suave (el encordado). Lo que no lo es (marco, protector, ojales, garganta,
  empuñadura, grip, overgrip y tapón) se marca con su nombre anclado a su
  posición 3D y la línea guía. El punto dulce es un disco del acento
  semitransparente que late sobre el encordado. El antivibrador no viene en el
  modelo: es una pastilla blanca agregada en el código, entre las principales y
  debajo de la última cruzada, que pasa al acento en su paso.
- **Luz de estudio suave**: un entorno chico armado con `Lightformer` de drei
  (no baja ningún HDR), una luz principal arriba a la derecha y una sombra de
  contacto debajo del tapón.

### La raqueta dibujada (SVG)

Es `Raqueta` con `estilo="inflada"` y se ve cuando no va el 3D: con
`prefers-reduced-motion`, sin WebGL, sin JavaScript y mientras carga el modelo.
Ocupa la misma caja que el 3D, así que el cambio de una a otra no mueve el
layout. Relleno blanco plano, contorno negro, la parte activa en el acento y
la misma sombra suave; quieta y completa, con los nombres de las partes a la
vista.

### Nombres de las partes y tipografía

- **Cada parte se nombra con texto y una línea guía**, sin cápsula: el nombre
  en mayúsculas a 13px, en negro, y una línea negra de 2px que sale de un
  punto blanco con borde negro sobre la parte (se ve sobre la raqueta grafito
  y sobre el estudio). **El nombre va afuera de la silueta** (a la
  izquierda o a la derecha de la raqueta): nunca sobre la raqueta, y nunca se
  sale del escenario. El nombre lleva el fondo de estudio de la banda (no se
  ve como recuadro): si en el 3D llega a rozar el marco, se sigue leyendo. Con el
  3D se ve solo el del paso activo; en la versión dibujada, todos.
- **En la 3D, pegado al marco** (desktop y mobile): el nombre va a la altura
  de su parte, justo afuera del borde de la silueta de ese lado (con 8px de
  separación y una línea de 18px como mínimo), nunca sobre las cuerdas. El borde sale de la
  silueta medida sobre los vértices del modelo (ancho y espesor, porque la
  cámara mira un poco de costado), en una franja de ±1,5cm alrededor de la
  parte (el nombre tiene alto). «Punto dulce» va en dos líneas, a 12px.
- **Sin palabra gigante detrás de la raqueta**: el nombre ya está en el título
  del paso y en la etiqueta de la parte.
- **Titular y pasos**: el titular de la sección en la display a
  `--t-display-2`; los títulos de los pasos en la display a `--t-display-4`.
  Debajo del título va primero la frase, grande (`--t-titulo`), y después el
  dato técnico, chico (0,875rem, en grafito), separados por espacio.
- **Pasos en mobile, compactos**: arriba «03 / 11» (cuál es y cuántas son, en
  grafito, 13px), el título a 1,75rem, la frase en texto normal (1rem) y el
  dato debajo, con poco espacio entre uno y otro y el texto arriba, pegado a la
  raqueta.
- **Hasta 768px, el dato plegado**: en su lugar va «Ver más», un botón de texto
  como los links (mayúsculas, 13px, 44px de alto) pero subrayado siempre,
  porque en el celular no hay hover. Lo despliega y pasa a «Ver menos»; el
  botón va antes del dato, así lo que sigue en el orden de lectura es lo que
  abrió (`aria-expanded`, `aria-controls`, el foco de siempre). El dato
  aparece bajando 8px, como en el acordeón de la ficha (nada con
  `prefers-reduced-motion`). Se abre uno a la vez: al pasar a otra parte (el
  paso deja la línea de lectura) vuelve plegado. Si el dato abierto no entra
  entero, la página baja lo justo, dentro del aire que hay arriba del número;
  si no alcanza, el número queda entero debajo de la raqueta, nunca cortado.
  El alto del texto se mide con el dato plegado: abrirlo no achica la raqueta.
  Sin JavaScript, el dato se ve siempre. De 769 a 859px el dato se ve como
  antes.

### Estructura

- **Desktop**: la raqueta queda fija (sticky) a la izquierda, en un escenario
  de toda la pantalla (100dvh), y los pasos van pasando a la derecha, uno por
  pantalla. **Mobile**: la raqueta fija arriba, de borde a borde, y debajo el
  paso activo; entre los dos ocupan la pantalla entera (100dvh). Cada paso
  mide lo que queda debajo de la raqueta, así entra justo uno a la vez, sin
  espacio vacío abajo. El escenario se queda con lo que no ocupa el texto del
  paso más largo (lo mide AnatomiaRaqueta en `--alto-texto`), nunca menos de
  46dvh: en 375×812, 555px de raqueta y 257px de texto. En dvh, así en mobile
  no la tapa la barra del navegador.
- **Pantalla completa**: el escenario se pega arriba de todo y, mientras está
  fijo, el header se esconde (AnatomiaRaqueta marca `data-sin-header` en
  `<html>`). Vuelve al salir de la sección, para arriba o para abajo, y
  apenas se scrollea para arriba adentro, para poder navegar. Si algo del
  header toma el foco (con Tab), también vuelve; pero tener el foco adentro
  no lo deja fijo (antes, después de tocar el logo, que se queda con el foco,
  el header no se escondía más).
- **Un paso por parte, de arriba hacia abajo**, con la terminología técnica
  en castellano: marco, protector, ojales, encordado, punto dulce,
  antivibrador, garganta, empuñadura, grip, overgrip y tapón. Cada paso tiene
  el número, el nombre de la parte (`h3`), una frase corta que dice qué es o
  qué cambia en el juego y un dato técnico concreto (tamaño de la cabeza en
  pulgadas², patrón 16×19 contra 18×20, grips del 0 al 5, largo de 27″). Los
  pasos están en `lib/anatomia.js`.
- **Todo el texto es HTML** (títulos y párrafos), nunca texto dentro del SVG.
  Los nombres de las partes también son HTML y repiten el título del paso,
  por eso van ocultos para lectores de pantalla.

### Movimiento

- **La cámara**: recorre la raqueta 3D de arriba hacia abajo con el scroll y se
  acerca a la parte de cada paso. El paso que cruza la línea de lectura (el
  centro de la pantalla; en mobile, el centro de lo que queda debajo de la
  raqueta) decide adónde mira, con entrada y salida suaves y un poco de
  inercia. Es continuo: entre un paso y otro está en el medio. Antes del
  primer paso y después del último se ve la raqueta entera. Mira de frente, un
  poco desde la derecha y desde arriba. **Nunca se acerca tanto que la raqueta
  se salga por los costados del lienzo** (en desktop, la columna de la
  raqueta): si la parte que entra en cuadro es más ancha, se aleja hasta que
  entre con aire (como mucho el 84% del ancho). Así la cabeza no queda cortada
  en el protector o el antivibrador; en las partes angostas (empuñadura, grip,
  tapón) el acercamiento no cambia. Los focos y las anclas de cada paso
  están en `lib/anatomia.js` (`foco3d`, `ancla3d`, en centímetros del modelo).
- **Lugar para el nombre**: la cámara también se aleja hasta que, a la altura
  de la parte, al costado de la raqueta entre su nombre afuera del marco (en
  el final, el de todas las partes). Entre un paso y otro, en el medio. En
  desktop pasa en los pasos de la cabeza (ojales, encordado, punto dulce): la
  cabeza se ve entera.
- **En mobile, además**, la cámara no deja más de 4cm de aire arriba de la
  punta ni abajo del tapón: si se alejó, la raqueta llena el escenario en vez
  de quedar arriba o abajo con la mitad vacía. Así se ve entera, o completa la
  zona del paso, y centrada de costado.
- **Al activarse un paso**: la parte pasa al acento (el encordado brilla,
  aparece el disco del punto dulce o el antivibrador pasa al acento), el nombre
  de la parte aparece con su línea guía (un fundido corto). El paso activo se
  lee entero y los demás bajan al 35%.
- **Flotación**: la raqueta sube y baja medio centímetro y gira apenas (±8°).
  Los nombres de las partes no flotan.
- **El header**: se desliza para arriba en 0,4s (`--deslizar`) cuando el
  escenario queda fijo, y vuelve igual. Solo `transform`.

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
5. **Aparece el botón del acento «Ver raquetas»** (desde el 78%), debajo de la
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
  la proyección de su ancla 3D), el header y las apariciones. Nada de `left`,
  `top` ni filtros SVG en elementos que se mueven. La sombra de la raqueta es
  un `drop-shadow` de CSS sobre el contenedor del lienzo, que no se mueve.
- **Funciona igual en Chrome, Safari y Firefox**: el scroll se mide con
  `requestAnimationFrame`, sin `animation-timeline`.

### Sin movimiento

Con `prefers-reduced-motion`, sin WebGL o sin JavaScript no se carga el 3D: se
ve la raqueta dibujada, entera y quieta, con los nombres de las partes a la
vista, cada uno con su línea guía. El final es la raqueta quieta con la frase
de cierre (en la display) y el botón del acento, fijos al lado (debajo en
mobile) mientras dura el tramo de cierre, que mide lo mismo con y sin 3D.
Mientras carga el modelo se ve lo mismo, y cuando está listo la raqueta 3D
aparece encima con un fundido. La pantalla completa sigue igual: el header se
esconde y vuelve, pero sin deslizarse.

## Fotos de producto

### Recortes sin fondo

Las fotos de la vitrina son **recortes del producto sin fondo**: puestas una al
lado de la otra, todas tienen el producto a la misma escala, centrado y con el
mismo margen, sobre el estudio de la celda.

- **Originales**: `public/productos/fuente/<slug>-<n>.(png|jpg|jpeg|webp)`
  (fuera de git), donde `<slug>` es el de un producto o un combo y `<n>` el
  orden: la 1 es la principal (la de la vitrina, el carrito y la barra fija) y
  2, 3… son las extras, que suma la galería del producto en ese orden. Mejor
  fotos del producto solo, de frente,
  sobre un fondo liso y con buena luz. Las raquetas, verticales y con la cabeza
  arriba; las pelotas, el tubo parado; los bolsos, parados y cerrados.
- **`npm run fotos:productos`** (`scripts/fotos-productos.mjs`, el script de la
  época de Amargo adaptado, con `@imgly/background-removal-node`): saca el
  fondo, borra los restos sueltos (una sombra, un pedazo de cartel), recorta al
  contorno del producto y lo pone en un lienzo transparente de 1600 × 2000
  (4:5, como las celdas). Exporta AVIF y WebP con transparencia. Si la foto
  ya viene sin fondo, no pasa por el modelo: se usa como está (el modelo
  llenaba el hueco entre las cuerdas y se comía las partes blancas).
  - **El producto entero** entra en el cuadrado del medio, de 1296px (el 81%
    del ancho): todos a la misma escala y con el mismo margen.
  - **Un detalle** (el producto toca un borde de la foto original, como la
    cabeza de una raqueta con el grip cortado) se pega a ese borde y deja un
    5% en los demás: en la celda, el corte llega al borde, como si la foto
    siguiera.
- **Dónde quedan**: en `public/productos/fuente/procesadas/` para revisarlas, y
  en el bucket `productos` de Supabase Storage como
  `recortes/<slug>-<n>.webp` y `.avif`, con su fila en la tabla `fotos` (la
  ruta del WebP y el orden; si ya había una con ese orden, se reemplaza), que
  escribe la función `guardar_foto` de `0006_guardar_foto.sql`. El
  AVIF queda al lado, con la misma ruta. `--sin-subir` procesa sin tocar
  Supabase; con slugs, procesa solo esos.
- En la celda, `FotoVitrina` muestra el recorte con `object-fit: cover`, sin
  margen propio: todas las celdas son de 4:5 o más anchas (la barra fija, la
  galería con una sola foto), así que solo se recorta margen arriba y abajo y
  un detalle sigue tocando el borde.
- **La URL lleva la versión del formato** (`?v=2`, en `lib/versionFotos.mjs`):
  next/image guarda cada foto 4 horas por URL y el script reemplaza los
  archivos con el mismo nombre. Si cambia el formato de todas, se sube el
  número y se vuelven a procesar.

### Mientras tanto: placeholder

Hasta que estén las fotos, `FotoVitrina` dibuja la celda en `--estudio` con la
silueta plana de la categoría (raqueta, tubo de pelotas, rollo de cuerda o
bolso raquetero) en negro al 6%, centrada con el mismo margen que tendrá el
recorte. Sin texto, sin ícono de imagen rota. Es decorativo (`aria-hidden`):
el nombre ya está debajo. Las fotos reemplazan al placeholder solas, producto
por producto.

## Video

Los clips del hero salen de `public/videos/fuentes/` (fuera de git) con
`npm run video:hero` (`scripts/video-hero.mjs`): de 5 a 8 segundos, sin audio,
cada uno en dos versiones, `desktop` (el cuadro entero, en 1920×1012) y
`mobile` (un recorte 9:16 que sigue al jugador, en 720×1280), y cada versión
en WebM (VP9) y MP4 (H.264), con su poster en WebP (el primer cuadro). Quedan
anotados en `lib/videosHero.json`, con sus créditos, que el footer muestra
(«Videos: …», como las fotos).

- **La secuencia** (`VideoFondo`): dos `<video>` apilados que se turnan. Al
  entrar solo se carga el primer clip; mientras uno se reproduce, el otro
  carga el que sigue. Cuando al que se ve le quedan 0,8s, el siguiente arranca
  encima y aparece (su opacidad sigue a su propio tiempo, así la pausa también
  congela el fundido). Después del último vuelve al primero, que ya está en el
  caché.
- El detalle de cada clip (fuente, tramo, recorte y peso) está en
  `MEDIOS.md`. Si cambia un clip, se vuelve a medir el contraste del titular
  sobre sus cuadros (ver «Hero»).

## Páginas

- **Categoría**: migas en mayúsculas, el nombre en `--t-display-3`, la bajada
  y la cantidad. Debajo, la vitrina, con su celda de foto, y al final
  el bloque de foto de la categoría.
- **Producto** (`app/producto/[slug]`): dos columnas desde 860px, la galería
  (más ancha) a la izquierda y el panel a la derecha. El panel acompaña el
  scroll (`ColumnaFija`) cuando es más corto que la galería: queda pegado,
  arriba si entra en la pantalla y por abajo si es más alto, así nunca queda
  una parte escondida. La galería no acompaña: se queda donde está aunque el
  acordeón alargue el panel (pegada, se destrababa del final de la fila y
  saltaba). En mobile, el carrusel arriba y el panel debajo.
  - **El panel** (`PanelCompra`): la marca en mayúsculas, el nombre en la
    display a `--t-display-4`, la primera oración de la descripción en
    grafito, el precio en la display a `--t-precio` (cuando cambia, sube 6px
    y aparece) y las
    opciones como **grillas de botones**, una por dimensión: en las raquetas,
    «Grip» (el número y, chico, las pulgadas: «4 1/4″») y «Peso»; en lo demás,
    una sola con el nombre de cada opción. El botón elegido va en el acento con
    texto blanco; lo que no tiene stock con lo ya elegido, en hormigón, tachado
    y deshabilitado. Al apretar un botón se hunde a 0,96. Debajo, el stock de la
    opción elegida («En stock», «¡Queda 1!», «¡Quedan 3!»).
  - En las raquetas no hay grip ni peso elegidos de entrada (salvo una
    dimensión con un solo valor, como el peso de la Blade): hasta que el
    cliente elige, el precio es el «desde» (sin «desde» si todas valen lo
    mismo), el botón está apagado y debajo dice «Falta elegir grip y peso».
    Los demás productos arrancan con la primera opción con stock.
  - **«Llevala encordada»** (raquetas): un check con el precio del servicio
    («+ $ 15.000 y la cuerda»). Marcado, aparecen las cuerdas compatibles (las
    de `compatibilidades`, en set de 12 m, una por fila con su precio; la
    recomendada primero y marcada «Recomendada») y la tensión, de a medio kilo
    dentro del rango de la raqueta, empezando por la del medio. El precio
    suma la cuerda y el servicio, con el desglose debajo.
  - La cantidad y «Agregar al carrito», en una fila; el botón es el del acento.
  - **Medidores** (raquetas y cuerdas): Potencia, Control y Confort de 1 a 10,
    en tres semicírculos: el fondo en hormigón, el valor en negro y el número
    en el medio. Salen de la ficha con `lib/medidores.js`, donde está
    la regla. El arco se dibuja hasta su valor al entrar en pantalla.
  - **El acordeón** (`Acordeon`, con `<details>`): Descripción (abierta),
    Ficha técnica (filas con líneas de 1px en hormigón, adentro de las negras
    del acordeón) y Envíos y devoluciones (los textos están
    en `lib/envio.js`). El signo pasa de + a − y el contenido baja 8px y
    aparece.
  - **La barra fija**: cuando «Agregar al carrito» queda arriba, fuera de la
    pantalla o debajo del header, entra desde abajo una píldora blanca con
    borde de 1px, centrada (hasta 640px): la foto chica sobre estudio, el
    nombre, el precio y «Agregar». Sin todo elegido, «Agregar» lleva a las
    opciones y deja el foco en la primera que falta. El aviso «Agregado al
    carrito» sube encima de la barra.
  - **«Combina con»**, al final, a todo el ancho: la vitrina con las cuerdas
    compatibles (en las raquetas) y los combos que llevan el producto. Si no
    hay ninguno, no aparece.
- **Combos y combo**: el listado y la página de un combo, con las piezas de la
  categoría y del producto. Ver «Combos».
- **Carga**: un bloque blanco del alto de la pantalla, con «Cargando…» para
  lectores de pantalla (en los listados, la vitrina vacía). Mide al menos el
  alto de la pantalla: si no, cuando llega el contenido el footer salta para
  abajo: con la pantalla de carga anterior, la home, las categorías y el
  producto daban un CLS de 0,135; con esta, 0. Los listados la arman con
  `CargaVitrina`; el carrito y el checkout, que se arman en el navegador,
  también miden al menos una pantalla.
- **Error y 404**: tipográficos, sin dibujos. El código gigante en la display a
  `--t-display-1`; un título que dice qué pasó («Página no encontrada», «Algo
  salió mal») y el botón para volver. Centrados.

## Footer

Banda negra a todo el ancho. El wordmark gigante en blanco con su pelota
amarilla; las categorías, «Combos» y «Mi cuenta» como links de texto en
mayúsculas (blancos, subrayados con el mouse); la línea de créditos de las
fotos si hay alguna («Fotos: …», ver «Fotos») y los legales a 13px. Foco
blanco. Sin íconos sociales ni separadores.

## Voz

Sencilla y descriptiva, en castellano rioplatense (de vos). Los textos dicen
qué es cada cosa: «Todo para el tenis», «Raquetas de potencia con un
punto dulce amplio», «Página no encontrada». Sin slogans, leyendas, chistes ni
frases inventadas. La única excepción es el titular del hero, «Game, set,
match», en inglés, como se dice en la cancha. **Ningún texto repite lo que ya dice el título.** Las
descripciones de producto cuentan para qué sirve y qué lo distingue, en una o
dos oraciones.

## Rendimiento

- El video del hero, las fotos y la anatomía no compiten: el video arranca
  primero (el poster va con `fetchPriority="high"`); las fotos son lazy; el 3D
  carga sin SSR y deja de renderizar fuera de pantalla.
- Todo lo que está debajo del pliegue es lazy: fotos, vitrinas fuera de la
  primera pantalla y el modelo 3D.
- Las fuentes van con `next/font`, las imágenes reservan su espacio
  (proporción o alto de fila) y la pantalla de carga mide una pantalla: nada se
  mueve al cargar.

## Accesibilidad

- Contraste AA en todo el texto, con las combinaciones de las tablas de
  «Paleta». El lima nunca es texto; el acento siempre lleva texto blanco.
- Foco visible en todos los fondos: anillo de 3px de `--foco` (negro en los
  claros, blanco en el negro y el video).
- Áreas táctiles de 44px como mínimo: links del header (44px de alto), el
  carrito, botones y barras (48px), campos (48px), opciones, el ojo de la
  contraseña y la pausa del video.
- Navegación completa con teclado, un solo paso de Tab por producto y salto al
  contenido.
- `prefers-reduced-motion` respetado en todo (ver «Movimiento»).
- Lo decorativo va oculto para lectores de pantalla: las fotos de juego y de
  objetos y los nombres de las partes de la anatomía (repiten el paso).
- Layout fluido desde 320px, sin scroll horizontal.

## Evitar

| Evitar | Cómo se resuelve |
| --- | --- |
| Superficies de color (polvo, cancha, césped) | Blanco, hormigón y negro; el color lo traen las fotos |
| Grano o texturas | Fondos planos |
| Marcas de agua y dibujos de fondo | Espacio y titulares grandes |
| Fotos inclinadas o con parallax | Celdas y bloques derechos, con radio de 16px; como mucho, una aparición suave |
| Stickers decorativos o girados | Solo etiquetas de estado, derechas y en píldora, sin borde |
| Separadores punteados, o líneas para separar secciones | Espacio. La línea de 1px solo en tablas, resúmenes y campos |
| Píldoras en la navegación | Links de texto en mayúsculas que se subrayan; solo el carrito en píldora |
| Más de un color en la interfaz, o el acento de adorno | Un solo acento, solo en acciones y estados activos, siempre con texto blanco |
| El acento como titular sobre el video | Titular en blanco; el acento en el botón |
| El lima como texto o como acento | El lima es solo la pelota del wordmark |
| Textos que repiten el título | Ningún elemento repite lo que ya dice el título |
| Radios fuera de los dos | 16px para lo que se mira, píldora para lo que se toca |
| Negritas para jerarquizar el texto | Inter Tight en un solo peso; la jerarquía sale del tamaño y de la display |
| Interlineado de 0,8 con mayúsculas acentuadas | 0,92 en la display |
| Sombras, resplandores, degradados | Fondos planos y bordes de 1px donde hacen falta; la única sombra es la suave de la raqueta de la anatomía |
| Una palabra gigante detrás de la raqueta | El nombre va en el título del paso y en la etiqueta de la parte |
| Nombres de partes en cápsulas o sobre la raqueta | Texto y línea guía, afuera de la silueta |
| Texto sobre las fotos | La foto sola; el nombre y el precio van debajo |
| Movimiento con `top`, `left`, `width` o filtros | Solo `transform` y `opacity` |
| Movimiento con `prefers-reduced-motion` | Todo quieto en su estado final |
| Áreas táctiles chicas | 44px como mínimo |
| Pantalla de carga más baja que la pantalla | Un bloque del alto de la pantalla: el footer no salta |
| Placeholder con ícono de imagen rota | Bloque gris con la proporción exacta y la descripción, o la silueta centrada |
| Fotos de terceros sin crédito o sin licencia | `CREDITOS.txt` y licencias de uso (ver docs/FOTOS.md) |
| Copiar textos, logos, ilustraciones, fotos o colores de las referencias | Valores y textos propios |
| Slogans, leyendas y frases inventadas | Textos que describen qué hay y para qué sirve |
| Texto centrado en párrafos y productos | A la izquierda; solo se centran el hero y los estados |
