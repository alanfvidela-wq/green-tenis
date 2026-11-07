import { expect, test } from "@playwright/test";

// Una respuesta por pregunta, en orden (el texto de la opción)
const RESPUESTAS = [
  ["¿Cuál es tu nivel?", "Intermedio"],
  ["¿Cuántas veces por semana jugás?", "Dos o tres"],
  ["¿Desde dónde jugás más?", "Desde el fondo"],
  ["¿Qué preferís en tus golpes?", "Potencia"],
  ["¿Querés algo cómodo para el brazo?", "Sí"],
  ["¿En qué superficie jugás?", "Polvo de ladrillo"],
];

test("el quiz responde las seis preguntas y muestra un kit con motivos", async ({ page }) => {
  await page.goto("/quiz");
  await expect(page.getByRole("heading", { level: 1, name: "Quiz de juego" })).toBeVisible();
  const avance = page.getByRole("progressbar", { name: "Avance del quiz" });

  for (const [i, [pregunta, opcion]] of RESPUESTAS.entries()) {
    await expect(avance).toHaveAttribute("aria-valuetext", `Pregunta ${i + 1} de ${RESPUESTAS.length}`);
    const grupo = page.getByRole("group", { name: pregunta });
    await expect(grupo).toBeVisible();
    // Elegir pasa sola a la siguiente (salvo en la última)
    await grupo.getByRole("button", { name: new RegExp(`^${opcion}`) }).click();
  }

  const verKit = page.getByRole("button", { name: "Ver mi kit" });
  await expect(verKit).toBeEnabled();
  await verKit.click();

  // El resultado: las respuestas, las raquetas y la cuerda y la pelota
  await expect(page).toHaveURL(/\/quiz\/resultado\?/);
  await expect(page.getByRole("heading", { level: 1, name: "Tu kit" })).toBeVisible();
  await expect(page.getByText(/Nivel intermedio · Dos o tres veces por semana/)).toBeVisible();

  const raquetas = page.getByRole("region", { name: "Raquetas" });
  const celdas = raquetas.getByRole("link").filter({ has: page.getByRole("heading", { level: 3 }) });
  await expect(celdas.first()).toBeVisible();
  expect(await celdas.count()).toBeGreaterThanOrEqual(2);
  await expect(page.getByRole("region", { name: "Cuerda y pelota" })).toBeVisible();

  // Cada celda, además del precio, tiene un párrafo con el porqué
  for (const celda of await celdas.all()) {
    const motivo = celda.getByRole("paragraph").filter({ hasNotText: "$" });
    await expect(motivo).toHaveCount(1);
    await expect(motivo).not.toBeEmpty();
  }

  // Sin sesión, ofrece ingresar para guardarlo
  await expect(page.getByRole("link", { name: "Ingresá" })).toBeVisible();
});
