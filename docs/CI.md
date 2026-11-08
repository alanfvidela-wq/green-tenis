# CI de green.

Cada push a `main` y cada pull request pasan por GitHub Actions
(`.github/workflows/ci.yml`): lint, build y los tests E2E que no escriben en la
base. El estado se ve en el badge de arriba del README y en la pestaña Actions
del repo. El deploy no pasa por acá: lo hace Vercel con cada push, por su lado.

## El pipeline

Un solo job, **Lint, build y E2E**, en `ubuntu-latest`, con 20 minutos como
máximo. Un push nuevo a la misma rama (o al mismo PR) cancela la corrida
anterior. El workflow solo lee el repo (`permissions: contents: read`).

| Paso                         | Qué hace |
| ---------------------------- | -------- |
| `actions/checkout`           | Baja el código |
| `actions/setup-node`         | Node de la versión de `.nvmrc` (24, la del proyecto) y la caché de npm, que se arma con `package-lock.json` |
| `npm ci`                     | Instala exactamente lo del lockfile |
| `npm run lint`               | ESLint, con la config de Next |
| Revisar los secrets          | Corta con un error claro si falta alguno (ver abajo) |
| `npm run build`              | El build de producción, con las variables `NEXT_PUBLIC_` |
| Instalar Chromium            | `npx playwright install --with-deps chromium`: el navegador y las librerías del sistema que pide |
| `npm run test:e2e:ci`        | Playwright levanta `next start` en el puerto 3100 con ese build (en CI no lo vuelve a armar) y corre todos los tests menos los que llevan el tag `@escribe-en-base` |
| Subir el reporte             | Solo si fallaron los tests: el artifact `playwright-report` |

En CI, Playwright reintenta dos veces cada test que falla (`retries: 2`), marca
los errores como anotaciones en el resumen de la corrida (reporter `github`) y
falla si quedó un `test.only` (`forbidOnly`). Todo eso está en
`playwright.config.js`, que mira la variable `CI` (GitHub la pone sola).

### Los tests que escriben en la base

El del checkout (`e2e/cuenta.spec.js`) crea un pedido en la base real y reserva
stock, aunque al terminar los devuelve (ver `docs/TESTING.md`). Por eso lleva
el tag `@escribe-en-base` y el CI no lo corre: además necesitaría la cuenta de
prueba. Se corre a mano, en local, antes de mergear algo que toque la compra:

```bash
npm run test:e2e                          # todos, con el del checkout
npx playwright test --grep @escribe-en-base  # solo los que escriben
```

Así, los tests del CI solo leen: el catálogo, la cotización del carrito y el
kit del quiz salen del proyecto de Supabase de verdad, pero no cambian nada.

## Secrets

El workflow no tiene ninguna variable escrita: salen de GitHub Secrets. Se
cargan en el repo, en **Settings › Secrets and variables › Actions › New
repository secret**, uno por uno, con el nombre exacto:

| Secret                                 | De dónde sale | Lo usan |
| -------------------------------------- | ------------- | ------- |
| `NEXT_PUBLIC_SUPABASE_URL`             | Supabase › el proyecto › Project Settings › Data API › Project URL (`https://<proyecto>.supabase.co`). Es el mismo valor que en `.env.local` y en Vercel | El build (`next.config.mjs` arma con ella el dominio permitido para las fotos) y la tienda, para leer la base |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase › Project Settings › API Keys › Publishable key (`sb_publishable_…`). El mismo valor que en `.env.local` y en Vercel | El build y la tienda: el catálogo y la sesión, con RLS |

Nada más. Los que **no** van, a propósito:

- `SUPABASE_SECRET_KEY`, `MP_ACCESS_TOKEN` y `MP_WEBHOOK_SECRET`: solo los usa
  el pago con Mercado Pago (`lib/cobros.js`), y ningún test del CI llega a
  pagar. Sin ellas la tienda funciona igual: el checkout diría que el pago
  online no está disponible.
- `E2E_EMAIL` y `E2E_PASSWORD`: los usan el test del checkout, que no corre
  en CI, y el del 403 de la API de administración (`e2e/admin.spec.js`), que
  sin ellas se saltea. Ese test solo ingresa y hace requests que no escriben:
  si se quiere que corra también en CI, alcanza con cargar los dos como
  secrets y pasarlos con `env:` al paso «Tests E2E».

La clave publicable no es secreta (viaja al navegador en cada visita), pero va
igual como secret para que ningún valor quede en el YAML ni en el historial.
GitHub no les pasa los secrets a los pull requests que vienen de un fork: esos
fallan en «Revisar los secrets».

Si un día hace falta otra variable, se suma como secret y se pasa con `env:`
solo al paso que la usa, como las dos de ahora (no a todo el job: `npm ci`
corre scripts de terceros).

## Cuando falla

- **Lint o build**: el log del paso dice el archivo y la línea. Se reproduce
  con `npm run lint` o `npm run build`.
- **«Faltan los secrets»**: falta cargar alguno de los de arriba, o tiene otro
  nombre.
- **Tests E2E**: en la corrida, Summary › Artifacts › `playwright-report` (se
  guarda 14 días). Adentro están `playwright-report/` y `test-results/`:

  ```bash
  npx playwright show-report playwright-report     # el reporte, con cada paso
  npx playwright show-trace test-results/<test>/trace.zip
  ```

  La traza abre el Trace Viewer: cada acción con el DOM de ese momento, la
  red, la consola y una captura. También se puede soltar el `trace.zip` en
  [trace.playwright.dev](https://trace.playwright.dev), sin instalar nada. Para
  reproducirlo en local, `npm run test:e2e:ci`.

Como los tests leen el catálogo real, un test puede fallar porque cambió el
catálogo y no el código: por ejemplo, si se borra una de las pelotas de
`e2e/ayudas.js`. El mensaje de error lo dice.

## Speed Insights

`app/layout.js` incluye `<SpeedInsights />` (`@vercel/speed-insights`): mide
los Core Web Vitals (LCP, INP, CLS, además de FCP y TTFB) en las visitas
reales y los manda a Vercel, por página y por dispositivo. Complementa al CI,
que prueba que la tienda funciona pero no cuánto tarda en el teléfono de
alguien.

Para que mida hay que activarlo una vez en Vercel: el proyecto › **Speed
Insights** › **Enable**. Activarlo suma las rutas `/_vercel/speed-insights/*`
desde el **deploy siguiente**: si se activa después de publicar este cambio,
hay que volver a publicar (Deployments › el último › Redeploy, o un push). Los
datos aparecen a medida que llegan visitas; el plan de Vercel pone un cupo
mensual.

En local y en CI no mide nada: el script lo sirve Vercel, así que en
`next start` la página pide `/_vercel/speed-insights/script.js`, recibe un 404
y sigue de largo (en la consola del navegador queda un aviso).
