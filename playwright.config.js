import { defineConfig, devices } from "@playwright/test";

// Los tests E2E de green. (ver docs/TESTING.md y docs/CI.md). Corren contra
// el build de producción, no contra `next dev`: Playwright arma el build y
// levanta `next start` en un puerto propio, así no choca con el servidor de
// desarrollo. En CI el build ya lo hizo el paso anterior del workflow.

// Las credenciales de la cuenta de prueba (E2E_EMAIL, E2E_PASSWORD) se leen de
// .env.local, como el resto de las variables; si ya vienen del entorno (CI),
// esas ganan. Sin el archivo, sigue con lo que haya.
try {
  process.loadEnvFile(".env.local");
} catch {
  // Sin .env.local: las variables tienen que venir del entorno
}

const PUERTO = 3100;
const URL_BASE = `http://localhost:${PUERTO}`;
const EN_CI = Boolean(process.env.CI);
const INICIAR = `npm run start -- -p ${PUERTO}`;

export default defineConfig({
  testDir: "./e2e",
  // Si quedó un test.only, que falle en CI
  forbidOnly: EN_CI,
  retries: EN_CI ? 2 : 0,
  // La base es la de Supabase, remota: de a dos alcanza y no la satura
  workers: 2,
  // En CI, además, los errores como anotaciones en el resumen de GitHub
  reporter: EN_CI
    ? [["list"], ["github"], ["html", { open: "never" }]]
    : [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: URL_BASE,
    locale: "es-AR",
    timezoneId: "America/Argentina/Buenos_Aires",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: EN_CI ? INICIAR : `npm run build && ${INICIAR}`,
    url: URL_BASE,
    // Si ya hay un `next start` en ese puerto (fuera de CI), lo reusa
    reuseExistingServer: !EN_CI,
    // El build tarda: hasta 5 minutos para que el servidor responda
    timeout: 300_000,
    stdout: "ignore",
    stderr: "pipe",
  },
});
