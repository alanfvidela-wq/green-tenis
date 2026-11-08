# Testing de green.

Dos capas:

- **Tests E2E con Playwright** (`e2e/`): recorren la tienda en Chromium como
  lo haría alguien que compra, contra el build de producción. Cubren el camino
  principal y se corren antes de cada entrega.
- **QA manual**: casos de prueba escritos para lo que no conviene automatizar
  (un pago aprobado en Mercado Pago, un mail de recuperación, el panel de
  administración) y reportes de los bugs que se encontraron.

## Tests E2E

### Qué cubren

| Archivo                   | Test                                                                         | Qué verifica |
| ------------------------- | ---------------------------------------------------------------------------- | ------------ |
| `e2e/navegacion.spec.js`  | La home carga el hero y los links principales                                | El titular y «Ver raquetas» del hero, el logo, las seis secciones del header, «Mi cuenta», el carrito y que el botón del hero lleve a Raquetas |
| `e2e/navegacion.spec.js`  | La grilla de Raquetas muestra productos y lleva a una ficha                  | Que la vitrina tenga celdas, que «N productos» coincida con las celdas y que la primera abra su ficha (el `h1` es el nombre de la celda) |
| `e2e/navegacion.spec.js`  | Un producto que no existe responde 404                                       | El status HTTP 404 (no solo la pantalla) y «Página no encontrada». Es la regresión de [BUG-01](#bug-01-las-páginas-inexistentes-responden-200) |
| `e2e/compra.spec.js`      | En la ficha, elegir grip y peso habilita «Agregar al carrito» y lo agotado no se puede elegir | Sin elegir, el botón deshabilitado y «Falta elegir grip y peso.»; con el grip de una combinación agotada, ese peso deshabilitado; con grip y peso, el botón habilitado, el aviso y el carrito del header en 1 |
| `e2e/compra.spec.js`      | El carrito agrega, cambia la cantidad, quita y actualiza el total            | Dos pelotas desde su ficha; el total es la suma de las líneas; «Uno más» duplica la línea y sube el total; «Quitar» la saca y lo baja; sin líneas, «Tu carrito está vacío.» |
| `e2e/quiz.spec.js`        | El quiz responde las seis preguntas y muestra un kit con motivos             | La barra de avance pregunta por pregunta, «Ver mi kit», el resumen de respuestas, al menos dos raquetas, la cuerda y la pelota, y el porqué en cada celda |
| `e2e/admin.spec.js`       | Sin sesión, los endpoints de admin responden 401                             | Los siete endpoints de la administración (`?todos=1`, POST, PATCH y DELETE de productos, PATCH de pedidos) responden `401 sin_sesion` |
| `e2e/admin.spec.js`       | Con sesión pero sin el rol de admin, responden 403 y /admin lleva a la home  | Con la cuenta de prueba (que no es admin), los mismos siete responden `403 sin_permiso`, y `/admin/productos` redirige a la home. Los cuerpos están armados para no escribir nada aunque la protección fallara. Sin `E2E_EMAIL` y `E2E_PASSWORD` se saltea (en CI, por ejemplo) |
| `e2e/cuenta.spec.js`      | Entrar a /checkout sin sesión lleva a /ingresar                              | La redirección del proxy con `?siguiente=/checkout` y el texto para terminar la compra |
| `e2e/cuenta.spec.js`      | Con la cuenta de prueba, el checkout llega a Mercado Pago sin pagar (`@escribe-en-base`) | Carrito → «Ir a pagar» → ingresar → vuelve al checkout → envío → «Confirmar y pagar» → la URL de Checkout Pro con su `pref_id`. Al terminar, pase o falle, cancela su pedido y devuelve el stock |

### Cómo correrlos

La primera vez, con las dependencias ya instaladas (`npm install`), bajar el
Chromium de Playwright:

```bash
npx playwright install chromium
```

En `.env.local` tienen que estar las variables de siempre (Supabase y Mercado
Pago, ver `docs/API.md`) y la cuenta de prueba:

```
E2E_EMAIL=...
E2E_PASSWORD=...
```

Es una cuenta que ya existe (se crea una vez, a mano, en `/registrarme`), de
cliente, sin el rol de admin. Los tests no crean cuentas. Sin estas dos
variables, el test del checkout se saltea y los demás corren igual. Ese test
necesita además la función `cancelar_pedido`
(`supabase/migrations/0010_cancelar_pedido.sql`) para limpiar lo que crea.

Después:

```bash
npm run test:e2e        # los diez
npm run test:e2e:ci     # todos menos los que escriben en la base (los del CI)
```

Playwright hace `npm run build`, levanta `next start` en el puerto 3100 (así no
choca con `npm run dev` en el 3000), corre los tests en Chromium con dos
workers y apaga el servidor. Si ya hay un `next start` en el 3100, lo reusa y
no vuelve a armar el build. Los tests tardan unos 35 segundos, más el build.
En GitHub corren con cada push (ver `docs/CI.md`).

Los tests que escriben en la base llevan el tag `@escribe-en-base` (hoy, solo
el del checkout). `test:e2e:ci` los deja afuera con `--grep-invert`; para
correr solo esos, `npx playwright test --grep @escribe-en-base`.

Otras formas útiles:

```bash
npx playwright test e2e/compra.spec.js     # un archivo
npx playwright test -g "carrito"           # los tests cuyo nombre lo dice
npx playwright test --ui                   # modo UI, paso a paso
npx playwright test --headed               # con el navegador a la vista
npx playwright show-report                 # el reporte HTML de la última corrida
```

Si un test falla, el reporte trae la captura y la traza (`npx playwright
show-trace test-results/<test>/trace.zip`): se ve cada paso con el DOM, la red
y la consola. `test-results/` y `playwright-report/` no van al repo.

### Cómo están escritos

- **Locators semánticos**: `getByRole` (con el nombre accesible: «Agregar al
  carrito», la región «Resumen», el grupo «Grip»), `getByText` y `getByLabel`.
  Nunca clases CSS: con CSS Modules las clases salen con un hash
  (`Hero-module__Z8hQ_W__cta`) que cambia con cada build, y además un test que
  encuentra las cosas por su rol prueba de paso que la página se puede usar
  con un lector de pantalla. Cuando un nombre se repite (hay dos «Ver
  raquetas» en la home, y «Mi cuenta» también está en el footer), se acota al
  contenedor: la región del hero, el `banner` del header.
- **Assertions con `expect`** que esperan solas (`toBeVisible`, `toHaveURL`,
  `toBeDisabled`, `toHaveText`): nada de `waitForTimeout`. El carrito se
  cotiza en el servidor y el quiz pasa de pregunta con una pausa; el `expect`
  reintenta hasta que se cumple o vencen los 5 segundos.
- **Los datos los lee el test, no se suponen**: los precios del carrito se
  leen de cada línea (el servidor los cotiza) y la raqueta con una
  combinación agotada se busca por la API pública (`/api/v1/productos`), así el
  test no se rompe cuando cambia el stock. Los productos fijos están en
  `e2e/ayudas.js`: Penn Championship y Head Tour XT, en tubo de 3.
- **Cada test arranca de cero**: Playwright abre un contexto de navegador
  nuevo por test, con el `localStorage` (el carrito) y las cookies (la sesión)
  vacíos.
- **Mercado Pago no se carga**: el test del checkout intercepta la
  navegación a `mercadopago.com.ar` (`page.route`) y responde una página vacía.
  Verifica que se llegó con una preferencia, sin pagar ni depender de la página
  de Mercado Pago.

### Qué dejan en la base y cómo se limpia

Los tests no tocan el catálogo ni crean cuentas. Todos leen, salvo el del
checkout, que crea un pedido y lo limpia al terminar.

**Cómo limpia.** El test pone una marca de la corrida (`E2E <timestamp>`) en
«Piso o departamento». En el `afterEach`, que corre aunque el test falle,
`cancelarPedidosDePrueba` (`e2e/ayudas.js`) entra a Supabase con la cuenta de
prueba, busca sus pedidos en `pendiente_pago` con esa marca y llama a
`cancelar_pedido` con cada uno. La función hace lo mismo que
`liberar_pedidos_vencidos` con un solo pedido: lo pasa a `cancelado` y
devuelve el stock de sus ítems en la misma transacción. Solo puede cancelar un
pedido de quien la llama, pendiente y sin un pago en curso. Usa la sesión de
la cuenta de prueba, como la tienda, y no la clave secreta. El reporte anota
qué pedido canceló («Pedido cancelado: #17»). Si no puede cancelarlo, el test
falla con un error que empieza con «Limpieza:», así no queda un pedido colgado
sin que se sepa. En ese caso el pedido vence solo a los 30 minutos, como
cualquier otro.

Lo que queda después de cada corrida:

| Qué                    | Dónde queda                                    | Cuánto dura |
| ---------------------- | ---------------------------------------------- | ----------- |
| Un pedido de la cuenta de prueba, ya `cancelado` (`cancelado_por = 'cliente'`), con 1 tubo de Penn Championship y el envío a nombre de «Prueba E2E» | `pedidos` y `pedido_items` | Hasta que se borre (abajo). Se ve en «Mis pedidos» de la cuenta de prueba y en `/admin/pedidos` |
| El stock                | `variantes.stock`                              | Nada: baja al confirmar y vuelve al limpiar, unos segundos después |
| Una preferencia de Checkout Pro | La cuenta de prueba vendedora de Mercado Pago | Vence a los 30 minutos (`expiration_date_to`). Nadie la paga; si alguien lo hiciera, el pago iría a revisión (`pago_en_cancelado`) |
| Un número de pedido usado | La secuencia de `pedidos.numero` | Para siempre (los números no se reusan) |
| La sesión del login | Supabase Auth (`last_sign_in_at` de la cuenta de prueba) | Lo normal de cada ingreso. La de la limpieza se cierra al terminar |

El carrito vive en el `localStorage` del contexto de Playwright y se descarta
al terminar cada test. El quiz se hace sin sesión, así que no guarda el kit.

Para borrar los pedidos cancelados que se van juntando, en el SQL Editor de
Supabase:

```sql
-- Borra los pedidos de los E2E (el envío a nombre de «Prueba E2E») ya
-- cancelados, con sus ítems y sus pagos (se borran en cascada). Poner el
-- email de E2E_EMAIL.
delete from public.pedidos
where email = 'cuenta-de-prueba@ejemplo.com'
  and envio_datos ->> 'nombre' = 'Prueba E2E'
  and estado = 'cancelado';
```

El filtro por «Prueba E2E» deja afuera los pedidos de las pruebas manuales con
la misma cuenta. Nunca borrar un pedido en `pendiente_pago`: su stock sigue
reservado y, sin el pedido, ya no vuelve. Si quedó alguno pendiente (la
limpieza falló), se cancela solo a los 30 minutos, con el próximo
`crear_pedido`, o con `select public.liberar_pedidos_vencidos();` en el SQL
Editor una vez pasado ese plazo.

## Casos de prueba manuales

Cada caso dice qué tiene que estar listo antes (precondiciones), qué hacer
(pasos), con qué datos y qué tiene que pasar. Al ejecutarlo se anota el
resultado obtenido y si pasó; si no pasó, se abre un reporte de bug como los de
abajo. Los precios son los del catálogo de hoy.

### CP-01 · Compra completa de una raqueta encordada

|                       |   |
| --------------------- | - |
| **Precondiciones**    | La tienda publicada en Vercel (Mercado Pago no vuelve ni avisa a localhost). Mercado Pago con credenciales de prueba. Una cuenta de cliente de la tienda, con sesión cerrada, y la cuenta de prueba compradora de Mercado Pago. Babolat Pure Drive Grip 2 / 300 g con stock (anotar cuánto hay, en `/admin/productos`). Carrito vacío. |
| **Datos de entrada**  | Raqueta: Babolat Pure Drive, Grip 2, 300 g. Encordado: Babolat RPM Blast 1.25, 24 kg. Envío: «Ana Prueba», 11 5555-0000, Av. Corrientes 1234, CABA, Ciudad Autónoma de Buenos Aires, 1043. Tarjeta: Mastercard 5031 7557 3453 0604, código 123, vencimiento 11/30, titular `APRO`, DNI 12345678. |
| **Pasos**             | 1. Ir a Raquetas › Pure Drive. 2. Elegir Grip 2 y 300 g. 3. Tildar «Llevala encordada», elegir la cuerda y la tensión. 4. «Agregar al carrito». 5. Abrir el carrito. 6. «Ir a pagar» e ingresar con la cuenta de la tienda. 7. Completar el envío y «Confirmar y pagar». 8. En Checkout Pro, ingresar con la compradora de prueba y pagar con la tarjeta. 9. «Volver al sitio». |
| **Resultado esperado** | En la ficha, el precio pasa a $ 438.900 con el desglose «Pure Drive $ 389.000 · cuerda $ 34.900 · encordado $ 15.000». El carrito muestra una línea con «Grip 2 / 300 g» y «Encordada con Babolat RPM Blast 1.25 a 24 kg», a $ 438.900, y el total igual. Después de ingresar se vuelve al checkout con el carrito intacto. Mercado Pago cobra $ 438.900. La vuelta muestra «Pago aprobado» y el pedido queda **Pagado** en «Mis pedidos» con la raqueta, el set de cuerda y el servicio de encordado a 24 kg. El carrito queda vacío. En `/admin/pedidos` aparece Pagado, y el stock de la raqueta (Grip 2 / 300 g) y del set de RPM Blast bajó en 1. |

### CP-02 · El admin crea un producto

|                       |   |
| --------------------- | - |
| **Precondiciones**    | Una cuenta con el rol de admin (`app_metadata.rol = "admin"`, ver `docs/API.md`), con sesión iniciada. La migración `0004_admin.sql` aplicada. No existe un producto con el slug que se va a usar. |
| **Datos de entrada**  | Categoría: Pelotas. Tipo: pelota. Marca: Slazenger. Nombre: Wimbledon QA. Descripción: «Pelota de prueba para QA.». Ficha: superficie y uso cualesquiera. Variante: SKU `QA-WIMB-3`, nombre «Tubo x3», precio 15000, stock 10. Para el caso negativo: precio «abc». |
| **Pasos**             | 1. Ir a `/admin/productos` › «Nuevo producto». 2. Cargar el precio «abc» y «Crear producto». 3. Corregir el precio a 15000 y «Crear producto». 4. Volver al listado y buscar «Wimbledon». 5. En otra pestaña, abrir `/producto/<slug>` y `/categoria/pelotas`. 6. Al terminar, borrar el producto desde el listado. |
| **Resultado esperado** | En el paso 2 no se crea nada y el error aparece debajo del campo del precio (lo valida el servidor). En el paso 3 se va a la edición del producto con el aviso «Producto creado.». El listado lo muestra con su precio y stock. La ficha pública muestra «Slazenger», «Wimbledon QA», $ 15.000 y «En stock», y la categoría lo cuenta. Después de borrarlo, su ficha responde 404. |

### CP-03 · Guardar el kit del quiz en la cuenta

|                       |   |
| --------------------- | - |
| **Precondiciones**    | Una cuenta de cliente, con sesión cerrada. La migración `0005_quiz.sql` aplicada. |
| **Datos de entrada**  | Respuestas: Principiante · Una o menos · En toda la cancha · Control · Sí · Cancha dura. |
| **Pasos**             | 1. Ir a «Quiz» en el header. 2. Responder las seis preguntas (probar «Atrás» en la tercera y volver a elegir). 3. «Ver mi kit». 4. En el resultado, «Ingresá» e ingresar. 5. «Guardar en mi cuenta». 6. Ir a `/tu-kit`. 7. Repetir el quiz con otras respuestas, ya con sesión. |
| **Resultado esperado** | «Atrás» vuelve con la respuesta marcada. El resultado muestra las respuestas resumidas, dos o tres raquetas, una cuerda y una pelota, cada una con su porqué. Después de ingresar se vuelve al mismo resultado, con «Guardar en mi cuenta». Al guardar, dice «Quedó guardado en tu cuenta: lo ves en Tu kit.». `/tu-kit` muestra el mismo kit con «Del quiz del <fecha>». En el paso 7, el kit se guarda solo (sin el botón) y `/tu-kit` muestra el nuevo. |

### CP-04 · Recuperar la contraseña

|                       |   |
| --------------------- | - |
| **Precondiciones**    | Una cuenta de cliente con un email al que se tenga acceso. En Supabase, el Site URL y la Redirect URL de `/auth/confirmar` del dominio que se prueba (ver `docs/API.md`). Sesión cerrada. Si es la cuenta de los E2E, después hay que actualizar `E2E_PASSWORD`. |
| **Datos de entrada**  | El email de la cuenta. Contraseña nueva: una de 8 caracteres o más, distinta de la anterior. Para los casos negativos: un email sin cuenta, y una contraseña nueva de 5 caracteres. |
| **Pasos**             | 1. En `/ingresar`, «¿Olvidaste tu contraseña?». 2. Pedir el link con el email sin cuenta. 3. Pedirlo con el email de la cuenta. 4. Abrir el mail en el mismo navegador y tocar el link. 5. Probar la contraseña corta. 6. Cargar la nueva dos veces y «Guardar la contraseña». 7. Cerrar sesión e ingresar con la anterior. 8. Ingresar con la nueva. 9. Volver a abrir el link del mail. |
| **Resultado esperado** | En los pasos 2 y 3 la respuesta es la misma («Si ese email tiene cuenta, te mandamos un link…»): no dice qué emails tienen cuenta. Solo llega un mail, el del paso 3. El link lleva a `/nueva-contrasena` con sesión. La contraseña corta muestra el error del mínimo y no se guarda. Al guardar, va a «Mis pedidos» con «Listo: cambiaste tu contraseña.». Con la anterior: «El email o la contraseña no coinciden.». Con la nueva, ingresa. El link reusado lleva a `/recuperar` con «El link venció o ya se usó. Pedí uno nuevo.». |

### CP-05 · Un pedido sin pagar vence y devuelve el stock

|                       |   |
| --------------------- | - |
| **Precondiciones**    | Una cuenta de cliente con sesión iniciada. El stock de Head Tour XT, Tubo x3, anotado (en `/admin/productos`). |
| **Datos de entrada**  | 2 × Head Tour XT, Tubo x3. Un envío válido cualquiera. |
| **Pasos**             | 1. Agregar 2 tubos al carrito, ir a pagar y «Confirmar y pagar». 2. En Checkout Pro, no pagar: volver atrás. 3. Revisar el stock en el admin. 4. Esperar 31 minutos y abrir el pedido en «Mis pedidos». 5. Hacer cualquier otro pedido (o «Simular» un aviso del webhook). 6. Revisar el pedido y el stock. |
| **Resultado esperado** | Después del paso 1, el pedido está «Pendiente de pago» y el stock bajó en 2 (está reservado). A los 31 minutos el pedido dice «Vencido», con «Pasaron 30 minutos sin el pago: el pedido se cancela y el stock vuelve a estar disponible.», y ya no muestra «Pagar con Mercado Pago». Después del paso 5 el pedido está «Cancelado» y el stock volvió al valor anotado. |

### CP-06 · El carrito no deja pedir más de lo que hay

|                       |   |
| --------------------- | - |
| **Precondiciones**    | Una variante con stock 1 (hoy, Babolat Pure Drive Grip 2 / 285 g). Carrito vacío. Dos pestañas de la tienda. |
| **Datos de entrada**  | Babolat Pure Drive, Grip 2, 285 g. |
| **Pasos**             | 1. En la ficha, elegir Grip 2 y 285 g. 2. Tocar «Uno más» en la cantidad. 3. Agregar 1 al carrito. 4. En el carrito, tocar «Uno más». 5. En la otra pestaña, agregar otra vez la misma raqueta desde la ficha. 6. Volver a la primera pestaña. |
| **Resultado esperado** | La ficha dice «¡Queda 1!» y «Uno más» está deshabilitado. En el carrito, «Uno más» también está deshabilitado. Al agregar desde la otra pestaña, el carrito (compartido entre pestañas) pasa a 2 y la línea dice «Queda 1»: «Ir a pagar» se deshabilita con «Revisá las líneas marcadas para seguir.». Bajando a 1, se puede pagar de nuevo. |

## Reportes de bug

Bugs reales que ya se arreglaron, con el formato de reporte. Severidad: cuánto
daño hace (crítica, alta, media, baja). Prioridad: qué tan pronto hay que
arreglarlo (alta, media, baja).

### BUG-01 · Las páginas inexistentes responden 200

|                         |   |
| ----------------------- | - |
| **Título**              | Un producto, combo, categoría o pedido que no existe responde HTTP 200 en lugar de 404 |
| **Severidad**           | Media: quien navega ve «Página no encontrada», pero para los buscadores, los monitores de links rotos y cualquier cliente que mire el status la página existe (un «soft 404»). |
| **Prioridad**           | Alta: afecta a todas las URLs del catálogo y se indexan páginas vacías. |
| **Entorno**             | Producción y `next start`, cualquier navegador. Encontrado el 26/10/2026. |
| **Estado**              | Resuelto en `6e8f563` («404 de verdad para producto, combo, categoría y pedido inexistentes»). |
| **Pasos para reproducir** | 1. Abrir las herramientas de desarrollo, pestaña Red. 2. Entrar a `/producto/raqueta-que-no-existe`. 3. Mirar el status del documento. Lo mismo con `/combo/no-existe`, `/categoria/zapatillas` y `/mis-pedidos/<un uuid cualquiera>` (con sesión). También con `curl -I https://<dominio>/producto/raqueta-que-no-existe`. |
| **Resultado esperado**  | Status 404 y la pantalla «Página no encontrada». |
| **Resultado obtenido**  | Status 200. La pantalla sí era la del 404, con un `<meta name="robots" content="noindex">`. |
| **Causa**               | Esas páginas se mandan en streaming detrás de `app/loading.js`: el 200 y los encabezados salen con la pantalla de carga, y para cuando la página llamaba a `notFound()` ya no se podía cambiar el status; a Next solo le quedaba agregar el `noindex`. |
| **Cómo se resolvió**    | `proxy.js` corre antes de cada producto, combo, categoría y pedido, y pregunta si existe con el mismo criterio que la página (`existeProducto`, `existeCombo`, `getCategoria`, `existePedido`). Si no existe, reescribe a una ruta que no puede existir (`/_no-encontrado`) y Next responde 404 con `app/not-found.js`, sin cambiar la URL. Los prefetch del router no pasan por esa consulta, y si la base no responde el proxy sigue de largo y la página se encarga. |
| **Verificación**        | El test E2E «un producto que no existe responde 404» (`e2e/navegacion.spec.js`) mira el status de la respuesta. |

### BUG-02 · La tabla de pedidos del admin desborda en tablet

|                         |   |
| ----------------------- | - |
| **Título**              | En `/admin/pedidos`, a lo ancho de una tablet, la tabla se pasa unos píxeles y el botón de la última columna corre el scroll y corta el número de pedido |
| **Severidad**           | Baja: no se pierde información y la acción se puede hacer, pero el admin toca un botón y la tabla se mueve. |
| **Prioridad**           | Media: el admin gestiona los pedidos desde la tablet. |
| **Entorno**             | `/admin/pedidos` y `/admin/productos`, Chrome con un ancho de tablet (768 × 1024, iPad en vertical), sesión de admin, con pedidos pagados. Encontrado el 26/10/2026, en la prueba con la sesión del admin. |
| **Estado**              | Resuelto en `b2902c5` («Admin: las tablas entran en una tablet y sin filas queda solo el mensaje»). |
| **Pasos para reproducir** | 1. Ingresar con la cuenta de admin. 2. Ir a `/admin/pedidos`, con al menos un pedido Pagado. 3. Poner la ventana (o el modo dispositivo) en 768 px de ancho. 4. Tocar «Pasar a en preparación» en la última columna. 5. Filtrar por un estado sin pedidos. |
| **Resultado esperado**  | La tabla entra en el ancho, sin scroll horizontal, y el botón se toca sin que nada se mueva. Sin resultados, se ve solo el mensaje. |
| **Resultado obtenido**  | Aparecía un scroll horizontal de unos píxeles; al tocar el botón el scroll se corría y la columna del número de pedido quedaba cortada. Con el filtro sin resultados, la tabla vacía dejaba una barra de scroll por un píxel de redondeo. |
| **Causa**               | El ancho mínimo de las tablas (44rem) más el relleno derecho de la última columna superaban el espacio disponible a ese ancho; el texto largo de los botones («Pasar a en preparación») ensanchaba la columna. |
| **Cómo se resolvió**    | En `app/admin/admin.module.css`, el ancho mínimo bajó a 40rem (en mobile las tablas siguen desplazándose de costado a propósito) y la última columna va sin relleno a la derecha. Los botones dicen «Preparar» y «Marcar enviado», con el texto completo para los lectores de pantalla en el `aria-label` («Pasar a en preparación: pedido #10»). Sin filas, no se dibuja la tabla. |
| **Verificación**        | Repetir los pasos a 768 px y a 1024 px: sin scroll horizontal y con el número de pedido entero. |
