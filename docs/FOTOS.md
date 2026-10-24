# Fotos al scrollear: qué conseguir y cómo agregarlas

Las fotos que aparecen inclinadas entre las secciones de la home (ver «Fotos al
scrollear» en DESIGN.md). Son 10 lugares, mitad gente jugando y mitad objetos.
Mientras falta una foto, en su lugar se ve un placeholder del mismo tamaño, con
el color de su superficie y la descripción de abajo.

La lista de verdad está en `lib/fotos.js`: si cambia algo ahí (un nombre, una
proporción), esta tabla se actualiza a mano.

## La lista

Todas: **mínimo 1600px en el lado largo** (mejor 2400px o más), en color, sin
textos ni logos grandes encima, sin marcas de agua de terceros. La proporción
no tiene que ser exacta: el script recorta a la del lugar buscando el centro de
interés, así que conviene dejar aire alrededor del motivo.

| N.º | Nombre del archivo | Tipo | Orientación | Banda | Qué foto buscar |
| --- | --- | --- | --- | --- | --- |
| 01 | `partido-polvo-01` | Gente | vertical, 4:5 | 1 (Polvo), también en mobile | Un jugador o una jugadora en plena derecha sobre polvo de ladrillo, de cuerpo entero, con la cancha de fondo y algo de polvo levantado. Luz de día. |
| 02 | `pelota-polvo-01` | Objeto | cuadrada, 1:1 | 1 (Polvo) | Una pelota apoyada sobre la línea blanca de una cancha de polvo de ladrillo, de cerca, con la marca del pique en el polvo. |
| 03 | `partido-polvo-02` | Gente | horizontal, 3:2 | 1 (Polvo) | Un jugador que se desliza en el polvo de ladrillo para llegar a una pelota, tomado de costado, con la estela de polvo. |
| 04 | `saque-cancha-01` | Gente | vertical, 4:5 | 2 (Cancha rápida), también en mobile | Un saque en cancha rápida azul en el momento del impacto, tomado desde abajo o de costado, con el cielo o el techo de fondo. |
| 05 | `pelota-linea-01` | Objeto | horizontal, 3:2 | 2 (Cancha rápida) | Una pelota sobre la línea de fondo de una cancha rápida azul, a ras del piso, con la textura de la superficie a la vista. |
| 06 | `raqueta-cancha-01` | Objeto | vertical, 4:5 | 2 (Cancha rápida) | Una raqueta apoyada en la cancha azul junto a un tubo de pelotas abierto, vista desde arriba, con la sombra natural. |
| 07 | `partido-cancha-01` | Gente | horizontal, 3:2 | 2 (Cancha rápida) | Un punto de dobles en cancha rápida, con dos jugadores en la red, en plano general y con las líneas de la cancha a la vista. |
| 08 | `volea-cesped-01` | Gente | horizontal, 3:2 | 3 (Césped), también en mobile | Una volea cerca de la red en una cancha de césped, con el pasto gastado en el fondo y las líneas blancas. |
| 09 | `pelota-linea-02` | Objeto | cuadrada, 1:1 | 3 (Césped) | Una pelota nueva sobre la línea blanca de una cancha de césped, muy de cerca, con el pasto cortado al ras. |
| 10 | `bolso-cesped-01` | Objeto | vertical, 4:5 | 3 (Césped) | Un bolso raquetero en el banco al costado de una cancha de césped, con una raqueta asomando y la cancha de fondo. |

Las bandas: 1 entre «Lo que más sale» y «Anatomía de una raqueta», 2 entre la
anatomía y las categorías, 3 antes del footer. En mobile se ve una foto por
banda.

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
