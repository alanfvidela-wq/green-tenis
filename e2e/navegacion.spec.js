import { expect, test } from "@playwright/test";

test.describe("Navegación", () => {
  test("la home carga el hero y los links principales", async ({ page }) => {
    await page.goto("/");

    // El hero (la sección que nombra su titular): el titular y su botón.
    // «Ver raquetas» también está más abajo, en la anatomía de la raqueta.
    const hero = page.getByRole("region", { name: "Game, set, match" });
    await expect(hero.getByRole("heading", { level: 1, name: "Game, set, match" })).toBeVisible();
    const verRaquetas = hero.getByRole("link", { name: "Ver raquetas" });
    await expect(verRaquetas).toBeVisible();

    // El header: el logo, las secciones, «Mi cuenta» y el carrito
    const header = page.getByRole("banner");
    await expect(header.getByRole("link", { name: "green." })).toBeVisible();
    const secciones = header.getByRole("navigation", { name: "Secciones" });
    for (const seccion of ["Raquetas", "Pelotas", "Cuerdas y grips", "Bolsos", "Combos", "Quiz"]) {
      await expect(secciones.getByRole("link", { name: seccion, exact: true })).toBeVisible();
    }
    await expect(header.getByRole("link", { name: "Mi cuenta" })).toBeVisible();
    await expect(header.getByRole("link", { name: /^Carrito/ })).toBeVisible();

    // Las secciones de la home
    await expect(page.getByRole("heading", { name: "Lo que más sale" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Hacer el quiz" })).toBeVisible();

    // El botón del hero lleva a las raquetas
    await verRaquetas.click();
    await expect(page).toHaveURL("/categoria/raquetas");
  });

  test("la grilla de Raquetas muestra productos y lleva a una ficha", async ({ page }) => {
    await page.goto("/");
    await page
      .getByRole("banner")
      .getByRole("navigation", { name: "Secciones" })
      .getByRole("link", { name: "Raquetas" })
      .click();

    await expect(page).toHaveURL("/categoria/raquetas");
    await expect(page.getByRole("heading", { level: 1, name: "Raquetas" })).toBeVisible();

    // Cada celda de la vitrina es un link con el nombre del producto (h3) y la
    // barra «Ver producto» o «Sin stock»
    const celdas = page.getByRole("main").getByRole("link").filter({ has: page.getByRole("heading", { level: 3 }) });
    await expect(celdas.first()).toBeVisible();
    const cantidad = await celdas.count();
    expect(cantidad).toBeGreaterThan(0);
    // La cuenta del encabezado coincide con las celdas
    await expect(page.getByText(`${cantidad} ${cantidad === 1 ? "producto" : "productos"}`, { exact: true })).toBeVisible();

    // Se entra a la ficha de la primera
    const primera = celdas.first();
    const nombre = await primera.getByRole("heading", { level: 3 }).innerText();
    await primera.click();

    await expect(page).toHaveURL(/\/producto\/[\w-]+$/);
    await expect(page.getByRole("heading", { level: 1, name: nombre })).toBeVisible();
    const migas = page.getByRole("navigation", { name: "Ubicación" });
    await expect(migas.getByRole("link", { name: "Raquetas" })).toBeVisible();
    await expect(page.getByRole("button", { name: /Agregar al carrito|Sin stock/ })).toBeVisible();
  });

  test("un producto que no existe responde 404", async ({ page }) => {
    const respuesta = await page.goto("/producto/raqueta-que-no-existe");

    expect(respuesta.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1, name: "Página no encontrada" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Volver al inicio" })).toBeVisible();
  });
});
