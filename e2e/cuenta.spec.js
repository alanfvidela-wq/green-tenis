import { expect, test } from "@playwright/test";
import { RAQUETA_ENCORDABLE, TEXTO_ENCORDADO, agregarRaquetaEncordada, cancelarPedidosDePrueba } from "./ayudas";

// Mercado Pago (Checkout Pro): el test llega hasta la redirección y no carga
// su página
const MERCADO_PAGO = /^https:\/\/([\w-]+\.)*mercadopago\.com(\.ar)?\//;

test.describe("Cuenta", () => {
  test("entrar a /checkout sin sesión lleva a /ingresar", async ({ page }) => {
    await page.goto("/checkout");

    await expect(page).toHaveURL("/ingresar?siguiente=%2Fcheckout");
    await expect(page.getByRole("heading", { level: 1, name: "Ingresar" })).toBeVisible();
    await expect(page.getByText("Para terminar la compra, ingresá con tu cuenta.")).toBeVisible();
    await expect(page.getByRole("button", { name: "Ingresar" })).toBeVisible();
  });
});

// Este test escribe en la base: crea un pedido y reserva stock. Lleva el tag
// @escribe-en-base para poder dejarlo afuera (npm run test:e2e:ci) y, al
// terminar, pase o falle, cancela su pedido y devuelve el stock.
test.describe("Checkout con sesión", () => {
  // Va en «Piso o departamento»: así la limpieza encuentra solo el pedido de
  // esta corrida, aunque haya otros de la misma cuenta
  let marca = null;

  test.afterEach(async () => {
    if (!marca) return;
    const cancelados = await cancelarPedidosDePrueba(marca);
    marca = null;
    test.info().annotations.push({
      type: "limpieza",
      description: cancelados.length > 0 ? `Pedido cancelado: #${cancelados.join(", #")}` : "No quedó ningún pedido",
    });
  });

  test(
    "con la cuenta de prueba, una raqueta encordada llega a Mercado Pago sin pagar y el pedido la agrupa",
    { tag: "@escribe-en-base" },
    async ({ page, request }) => {
      const email = process.env.E2E_EMAIL;
      const contrasena = process.env.E2E_PASSWORD;
      test.skip(!email || !contrasena, "Faltan E2E_EMAIL y E2E_PASSWORD (ver .env.example)");
      marca = `E2E ${Date.now()}`;
      const { marca: marcaRaqueta, nombre } = RAQUETA_ENCORDABLE;

      // La página de Mercado Pago no se carga: se responde una vacía
      await page.route(MERCADO_PAGO, (ruta) =>
        ruta.fulfill({ contentType: "text/html", body: "<title>Mercado Pago (simulado)</title>" }),
      );

      // La misma raqueta dos veces, una encordada y otra no: el caso en que
      // hay que saber cuál de las dos lleva el encordado
      const variante = await agregarRaquetaEncordada(page, request, RAQUETA_ENCORDABLE);
      await page.getByRole("checkbox", { name: /Llevala encordada/ }).uncheck();
      await page.getByRole("button", { name: "Agregar al carrito" }).click();
      await expect(page.getByRole("banner").getByRole("link", { name: "Carrito, 2 productos" })).toBeVisible();

      // En el carrito, dos líneas: el encordado va en la suya, debajo de la opción
      await page.goto("/carrito");
      const lineasCarrito = page
        .getByRole("main")
        .getByRole("listitem")
        .filter({ has: page.getByRole("link", { name: nombre }) });
      await expect(lineasCarrito).toHaveCount(2);
      const encordada = lineasCarrito.filter({ has: page.getByText(TEXTO_ENCORDADO) });
      await expect(encordada).toHaveCount(1);
      await expect(encordada.getByText(variante.nombre, { exact: true })).toBeVisible();
      const textoEncordado = await encordada.getByText(TEXTO_ENCORDADO).innerText();
      await page.getByRole("link", { name: "Ir a pagar" }).click();

      // Sin sesión, pide ingresar y vuelve al checkout
      await expect(page).toHaveURL(/\/ingresar\?siguiente=%2Fcheckout$/);
      await page.getByRole("textbox", { name: "Email" }).fill(email);
      await page.getByLabel("Contraseña", { exact: true }).fill(contrasena);
      await page.getByRole("button", { name: "Ingresar" }).click();

      await expect(page).toHaveURL("/checkout");
      await expect(page.getByRole("heading", { level: 1, name: "Finalizar compra" })).toBeVisible();
      await expect(page.getByText(`Comprás como ${email}`)).toBeVisible();
      const resumen = page.getByRole("region", { name: "Tu pedido" });
      await expect(resumen.getByText(`1 × ${marcaRaqueta} ${nombre}`)).toHaveCount(2);
      await expect(resumen.getByText(textoEncordado, { exact: true })).toHaveCount(1);

      // Los datos de envío, con la marca de esta corrida en el piso
      await page.getByRole("textbox", { name: "Nombre y apellido" }).fill("Prueba E2E");
      await page.getByRole("textbox", { name: "Teléfono" }).fill("11 5555-0000");
      await page.getByRole("textbox", { name: "Calle y número" }).fill("Av. Siempre Viva 742");
      await page.getByRole("textbox", { name: /^Piso o departamento/ }).fill(marca);
      await page.getByRole("textbox", { name: "Ciudad" }).fill("Buenos Aires");
      await page.getByRole("combobox", { name: "Provincia" }).selectOption("Ciudad Autónoma de Buenos Aires");
      await page.getByRole("textbox", { name: "Código postal" }).fill("1425");

      // Confirmar crea el pedido y lleva a Checkout Pro con su preferencia
      const confirmar = page.getByRole("button", { name: "Confirmar y pagar" });
      await expect(confirmar).toBeEnabled();
      await confirmar.click();
      // (Si los ítems de la preferencia no sumaran el total, no habría
      // redirección: itemsDelPedido lo revisa antes de crearla)
      await expect(page).toHaveURL(MERCADO_PAGO, { timeout: 20_000 });
      expect(new URL(page.url()).searchParams.get("pref_id")).toBeTruthy();

      // El pedido, el más nuevo de «Mis pedidos»: las dos raquetas, y el
      // encordado debajo de la que lo lleva; la cuerda y el servicio no van
      // sueltos
      await page.goto("/mis-pedidos");
      await page.getByRole("link", { name: /^Pedido #\d+$/ }).first().click();
      const compra = page.getByRole("region", { name: "Qué compraste" });
      const lineas = compra.getByRole("listitem");
      await expect(lineas).toHaveCount(2);
      await expect(lineas.getByRole("link", { name: `${marcaRaqueta} ${nombre}` })).toHaveCount(2);
      const conEncordado = lineas.filter({ hasText: textoEncordado });
      await expect(conEncordado).toHaveCount(1);
      await expect(conEncordado.getByText(/^Cuerda: Set 12 m · 1 × \$/)).toBeVisible();
      await expect(conEncordado.getByText(/^Servicio de encordado · 1 × \$/)).toBeVisible();
      await expect(compra.getByText(/Tensión/)).toHaveCount(0);
    },
  );
});
