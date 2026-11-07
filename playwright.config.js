import { defineConfig, devices } from "@playwright/test";

// Los tests E2E de green. (ver docs/TESTING.md). Corren contra el build de
// producción, no contra `next dev`: Playwright arma el build y levanta
// `next start` en un puerto propio, así no choca con el servidor de desarrollo.

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

export default defineConfig({
  testDir: "./e2e",
  // Si quedó un test.only, que falle en CI
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  // La base es la de Supabase, remota: de a dos alcanza y no la satura
  workers: 2,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: URL_BASE,
    locale: "es-AR",
    timezoneId: "America/Argentina/Buenos_Aires",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: `npm run build && npm run start -- -p ${PUERTO}`,
    url: URL_BASE,
    // Si ya hay un `next start` en ese puerto (fuera de CI), lo reusa
    reuseExistingServer: !process.env.CI,
    // El build tarda: hasta 5 minutos para que el servidor responda
    timeout: 300_000,
    stdout: "ignore",
    stderr: "pipe",
  },
});
