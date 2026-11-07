import { expect, test } from "@playwright/test";
import { OTRA_PELOTA, PELOTA_BARATA, agregarAlCarrito, monto, pesos, raquetaConVarianteAgotada } from "./ayudas";

test.describe("Compra", () => {
  test("en la ficha, elegir grip y peso habilita «Agregar al carrito» y lo agotado no se puede elegir", async ({
    page,
    request,
  }) => {
    const raqueta = await raquetaConVarianteAgotada(request);
    test.skip(!raqueta, "Ninguna raqueta tiene hoy una combinación de grip y peso sin stock");
    const { producto, agotada, conStock } = raqueta;

    await page.goto(`/producto/${producto.slug}`);
    await expect(page.getByRole("heading", { level: 1, name: producto.nombre })).toBeVisible();

    // Sin nada elegido, no se puede agregar
    const agregar = page.getByRole("button", { name: "Agregar al carrito" });
    await expect(agregar).toBeDisabled();
    await expect(page.getByText("Falta elegir grip y peso.")).toBeVisible();

    // Se elige el grip de la combinación agotada
    const grip = page.getByRole("group", { name: "Grip" }).getByRole("button", { name: new RegExp(`^${agotada.grip}\\b`) });
    await grip.click();
    await expect(grip).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByText("Falta elegir peso.")).toBeVisible();
    await expect(agregar).toBeDisabled();

    // Con ese grip, el peso sin stock está deshabilitado y el otro no
    const grupoPeso = page.getByRole("group", { name: "Peso" });
    await expect(grupoPeso.getByRole("button", { name: `${agotada.pesoG} g` })).toBeDisabled();
    const peso = grupoPeso.getByRole("button", { name: `${conStock.pesoG} g` });
    await expect(peso).toBeEnabled();

    // Con grip y peso, se habilita y agrega
    await peso.click();
    await expect(page.getByText(/En stock|¡Queda/)).toBeVisible();
    await expect(agregar).toBeEnabled();
    await agregar.click();
    await expect(page.getByRole("status").filter({ hasText: "Agregado al carrito." })).toBeAttached();
    await expect(page.getByRole("banner").getByRole("link", { name: "Carrito, 1 producto" })).toBeVisible();
  });

  test("el carrito agrega, cambia la cantidad, quita y actualiza el total", async ({ page }) => {
    await agregarAlCarrito(page, PELOTA_BARATA);
    await agregarAlCarrito(page, OTRA_PELOTA);

    await page.getByRole("banner").getByRole("link", { name: "Carrito, 2 productos" }).click();
    await expect(page).toHaveURL("/carrito");

    const lineas = page.getByRole("main").getByRole("listitem");
    const barata = lineas.filter({ has: page.getByRole("link", { name: PELOTA_BARATA.nombre }) });
    const otra = lineas.filter({ has: page.getByRole("link", { name: OTRA_PELOTA.nombre }) });
    const total = page.getByRole("region", { name: "Resumen" }).getByRole("definition").last();

    // Los precios los cotiza el servidor: se leen de cada línea
    const precio = (linea) => linea.getByText(/^\$/);
    await expect(precio(barata)).toBeVisible();
    await expect(precio(otra)).toBeVisible();
    const precioBarata = monto(await precio(barata).innerText());
    const precioOtra = monto(await precio(otra).innerText());
    await expect(total).toHaveText(pesos(precioBarata + precioOtra));

    // Una más de la otra pelota: su línea y el total suben
    await otra.getByRole("button", { name: "Uno más" }).click();
    await expect(otra.getByText("2", { exact: true })).toBeVisible();
    await expect(precio(otra)).toHaveText(pesos(2 * precioOtra));
    await expect(total).toHaveText(pesos(precioBarata + 2 * precioOtra));
    await expect(page.getByRole("link", { name: "Ir a pagar" })).toBeVisible();

    // Se quita la barata: queda solo la otra
    await barata.getByRole("button", { name: "Quitar" }).click();
    await expect(barata).toHaveCount(0);
    await expect(total).toHaveText(pesos(2 * precioOtra));
    await expect(page.getByRole("banner").getByRole("link", { name: "Carrito, 2 productos" })).toBeVisible();

    // Y sin nada, el carrito vacío
    await otra.getByRole("button", { name: "Quitar" }).click();
    await expect(page.getByText("Tu carrito está vacío.")).toBeVisible();
    await expect(page.getByRole("banner").getByRole("link", { name: "Carrito, 0 productos" })).toBeVisible();
  });
});
