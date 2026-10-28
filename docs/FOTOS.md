# Fotos del sitio: qué conseguir y cómo agregarlas

Las fotos de juego y de objetos (ver «Fotos» en DESIGN.md). Son 10 lugares:
cinco **celdas de la vitrina** (gente jugando, del mismo tamaño que las celdas
de producto) y cinco **bloques grandes entre secciones** (objetos). Mientras
falta una foto, en su lugar se ve un placeholder gris claro del mismo tamaño,
con la descripción de abajo.

Las fotos de producto son otra cosa: ver «Fotos de producto» al final.

La lista de verdad está en `lib/fotos.js`: si cambia algo ahí (un nombre, una
proporción), esta tabla se actualiza a mano.

## La lista

Todas: **mínimo 1600px en el lado largo** (mejor 2400px o más), en color, sin
textos ni logos grandes encima, sin marcas de agua de terceros. La proporción
no tiene que ser exacta: el script recorta a la del lugar buscando el centro de
interés, así que conviene dejar aire alrededor del motivo. Las celdas se ven
recortadas al alto de la fila de la vitrina: lo importante, en el centro.

| N.º | Nombre del archivo | Tipo | Uso | Orientación | Dónde va | Qué foto buscar |
| --- | --- | --- | --- | --- | --- | --- |
| 01 | `partido-polvo-01` | Gente | Celda de la vitrina | vertical, 4:5 | Home | Un jugador o una jugadora en plena derecha sobre polvo de ladrillo, de cuerpo entero, con la cancha de fondo y algo de polvo levantado. Luz de día. |
| 02 | `saque-cancha-01` | Gente | Celda de la vitrina | vertical, 4:5 | Raquetas | Un saque en cancha rápida en el momento del impacto, tomado desde abajo o de costado, con el cielo o el techo de fondo. |
| 03 | `volea-cesped-01` | Gente | Celda de la vitrina | vertical, 4:5 | Pelotas | Una volea cerca de la red en una cancha de césped, de cuerpo entero, con el pasto gastado en el fondo y las líneas blancas. |
| 04 | `grip-banco-01` | Gente | Celda de la vitrina | vertical, 4:5 | Cuerdas y grips | Un jugador sentado en el banco entre dos puntos, poniéndole un overgrip nuevo a la raqueta, de medio cuerpo. |
| 05 | `bolso-polvo-01` | Gente | Celda de la vitrina | vertical, 4:5 | Bolsos | Un jugador que llega a una cancha de polvo de ladrillo con el bolso raquetero al hombro, de cuerpo entero. |
| 06 | `pelota-polvo-01` | Objeto | Bloque entre secciones | horizontal, 16:9 | Home | Una pelota apoyada sobre la línea blanca de una cancha de polvo de ladrillo, a ras del piso, con la marca del pique y mucho aire alrededor. |
| 07 | `raqueta-cancha-01` | Objeto | Bloque entre secciones | horizontal, 16:9 | Home | Una raqueta apoyada en una cancha rápida junto a un tubo de pelotas abierto, vista desde arriba, con la sombra natural y las líneas de la cancha. |
| 08 | `raquetas-red-01` | Objeto | Bloque entre secciones | horizontal, 16:9 | Raquetas | Varias raquetas apoyadas contra la red, de costado, con la luz de la tarde y la cancha fuera de foco. |
| 09 | `pelota-linea-01` | Objeto | Bloque entre secciones | horizontal, 16:9 | Pelotas | Una pelota nueva sobre la línea blanca de una cancha de césped, muy de cerca, con el pasto cortado al ras. |
| 10 | `bolso-banco-01` | Objeto | Bloque entre secciones | horizontal, 16:9 | Bolsos | Un bolso raquetero en el banco al costado de la cancha, con una raqueta asomando y la cancha de fondo. |

## Licencias

Solo fotos que se puedan usar en el sitio: propias, con permiso escrito, o con
una licencia que lo permita (por ejemplo, la de Unsplash o la de Pexels). Nada
de fotos de agencias, de medios ni de sitios de marcas. Si se ve una persona de
cerca, mejor que sea una foto con permiso de uso de su imagen. Las marcas de
ropa o de raquetas pueden aparecer, pero que no sean el centro de la foto.

## Cómo agregarlas

1. Guardá la foto en `public/fotos/fuente/` con el **nombre exacto** de la
   tabla y cualquier extensión de imagen: `partido-polvo-01.jpg`. Sirven JPG,
   PNG, WebP, AVIF y TIFF (las HEIC del celular, exportalas antes a JPG). Esa
   carpeta no va al repo.
2. Anotá el crédito en `public/fotos/fuente/CREDITOS.txt`, una línea por foto:

   ```
   # archivo | autor | fuente | url (opcional)
   partido-polvo-01 | Ana Pérez | Unsplash | https://unsplash.com/photos/...
   ```

3. Corré el script:

   ```bash
   npm run fotos
   ```

   Por cada foto genera AVIF y WebP a 480, 800, 1200 y 1600px de ancho (sin
   agrandar: si la foto es más chica, se queda en lo que da) en
   `public/fotos/`, más el blur que se ve mientras carga, y escribe todo, con
   los créditos, en `lib/fotosGeneradas.json`. Avisa si falta algún lugar, si
   una foto es chica, si hay archivos que no corresponden a ningún lugar o si
   falta un crédito. Se puede correr las veces que haga falta: reemplaza lo de
   antes.
4. Commiteá `public/fotos/*.avif`, `public/fotos/*.webp` y
   `lib/fotosGeneradas.json`. Las fotos reemplazan al placeholder solas, lugar
   por lugar, y los créditos aparecen en el footer.

Para sacar una foto: borrala de `fuente/` y volvé a correr `npm run fotos`;
vuelve el placeholder.

## Fotos de producto

Las de la vitrina, del producto solo, sin fondo. Van en
`public/productos/fuente/<slug>-<n>.(png|jpg|jpeg|webp)` (fuera de git), donde
`<slug>` es el de un producto o un combo y `<n>` el orden. Mejor fotos de
frente, sobre un fondo liso y con buena luz.

- **La principal** es la 1 (`wilson-blade-98-1.jpg`): la de la vitrina, el
  carrito y la barra fija de la página de producto.
- **Las extras** son la 2, la 3… (`wilson-blade-98-2.jpg`,
  `wilson-blade-98-3.jpg`), otros ángulos o un detalle, y la galería del
  producto las suma en ese orden. En escritorio se ven cuatro y el resto con
  «Ver todas»; en mobile, todas en el carrusel. Con una sola foto, la galería
  la muestra sola, a lo ancho.
- El número va siempre: sin él, `wilson-blade-98.jpg` se leería como el slug
  `wilson-blade` con orden 98. Un cero adelante (`-02`) da lo mismo que `-2`.
- Las extras pasan por el mismo recorte: un detalle que toca los bordes de la
  foto queda centrado y con margen, como las demás.

```bash
npm run fotos:productos -- --sin-subir
```

Saca el fondo, recorta al producto y lo centra con el mismo margen en un
cuadrado transparente, y deja AVIF y WebP en `public/productos/fuente/procesadas/`
para revisarlas. Si el original ya viene sin fondo (un PNG o WebP con
transparencia, como los de las marcas), lo que era transparente sigue
transparente: si no, el hueco entre las cuerdas de una raqueta se llenaría de
gris. Sin `--sin-subir`, además las sube al bucket `productos` de
Supabase Storage (`recortes/<slug>-<n>.webp` y `.avif`) y anota la foto en la
tabla `fotos` con la función `guardar_foto` (`0006_guardar_foto.sql`), que es
lo único que la clave secreta puede escribir ahí; necesita
`SUPABASE_SECRET_KEY` en `.env.local`. Si el slug no es de ningún producto ni
combo, no anota nada y borra lo que subió. Con slugs
(`npm run fotos:productos -- babolat-pure-drive`) procesa solo esos.
