import { expect, test } from "@playwright/test";
import { ingresar } from "./ayudas";

// Los endpoints de la administración (ver docs/API.md). Los cuerpos y los ids
// están armados para que, si la protección fallara, ninguno escriba: el POST
// va vacío (no pasa el esquema), y el PATCH y el DELETE apuntan a un producto
// y a un pedido que no existen.
const ENDPOINTS_ADMIN = [
  ["GET", "/api/v1/productos?todos=1"],
  ["POST", "/api/v1/productos", {}],
  ["GET", "/api/v1/productos/1"],
  ["PATCH", "/api/v1/productos/999999999", { nombre: "No se guarda" }],
  ["DELETE", "/api/v1/productos/999999999"],
  ["GET", "/api/v1/pedidos?todos=1"],
  ["PATCH", "/api/v1/pedidos/00000000-0000-4000-8000-000000000000", { estado: "preparando" }],
];

async function pedirTodos(request) {
  const respuestas = [];
  for (const [metodo, url, cuerpo] of ENDPOINTS_ADMIN) {
    const respuesta = await request.fetch(url, { method: metodo, data: cuerpo });
    respuestas.push({ ruta: `${metodo} ${url}`, status: respuesta.status(), cuerpo: await respuesta.json() });
  }
  return respuestas;
}

test.describe("API de administración", () => {
  test("sin sesión, los endpoints de admin responden 401", async ({ request }) => {
    for (const { ruta, status, cuerpo } of await pedirTodos(request)) {
      expect.soft(status, ruta).toBe(401);
      expect.soft(cuerpo.error?.codigo, ruta).toBe("sin_sesion");
    }
  });

  test("con sesión pero sin el rol de admin, responden 403 y /admin lleva a la home", async ({ page }) => {
    const email = process.env.E2E_EMAIL;
    const contrasena = process.env.E2E_PASSWORD;
    test.skip(!email || !contrasena, "Faltan E2E_EMAIL y E2E_PASSWORD (ver .env.example)");

    await ingresar(page, email, contrasena);

    // page.request comparte las cookies de la sesión con la página
    for (const { ruta, status, cuerpo } of await pedirTodos(page.request)) {
      expect.soft(status, ruta).toBe(403);
      expect.soft(cuerpo.error?.codigo, ruta).toBe("sin_permiso");
    }

    // Las páginas de la administración: el proxy lleva a la home
    await page.goto("/admin/productos");
    await expect(page).toHaveURL("/");
  });
});
