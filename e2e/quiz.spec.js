import { expect, test } from "@playwright/test";

// Una respuesta por pregunta, en orden: la pregunta, su nombre en el panel y
// el texto de la opción
const RESPUESTAS = [
  ["¿Cuál es tu nivel?", "Nivel", "Intermedio"],
  ["¿Cuántas veces por semana jugás?", "Frecuencia", "Dos o tres"],
  ["¿Desde dónde jugás más?", "Estilo", "Desde el fondo"],
  ["¿Qué preferís en tus golpes?", "Preferencia", "Potencia"],
  ["¿Querés algo cómodo para el brazo?", "Brazo", "Sí"],
  ["¿En qué superficie jugás?", "Superficie", "Polvo de ladrillo"],
];

// Responde las primeras `cuantas` preguntas; elegir pasa sola a la siguiente
async function responder(page, cuantas) {
  for (const [pregunta, , opcion] of RESPUESTAS.slice(0, cuantas)) {
    await page.getByRole("group", { name: pregunta }).getByRole("button", { name: new RegExp(`^${opcion}`) }).click();
  }
}

test("el quiz responde las seis preguntas y muestra un kit con motivos", async ({ page }) => {
  await page.goto("/quiz");
  await expect(page.getByRole("heading", { level: 1, name: "Quiz de juego" })).toBeVisible();
  const avance = page.getByRole("progressbar", { name: "Avance del quiz" });
  const panel = page.getByRole("navigation", { name: "Preguntas del quiz" });

  for (const [i, [pregunta, etiqueta, opcion]] of RESPUESTAS.entries()) {
    await expect(avance).toHaveAttribute("aria-valuetext", `Pregunta ${i + 1} de ${RESPUESTAS.length}`);
    // En el panel, la pregunta actual
    await expect(panel.locator('[aria-current="step"]')).toContainText(etiqueta);
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

test("el panel muestra lo respondido, lleva a cambiarlo y empieza de nuevo", async ({ page }) => {
  await page.goto("/quiz");
  const panel = page.getByRole("navigation", { name: "Preguntas del quiz" });
  await responder(page, 2);

  // En la tercera: lo respondido es un botón con la respuesta; la actual y lo
  // que falta, no
  await expect(page.getByRole("group", { name: "¿Desde dónde jugás más?" })).toBeVisible();
  await expect(panel.locator('[aria-current="step"]')).toContainText("Estilo");
  await expect(panel.getByRole("button")).toHaveCount(2);
  await expect(panel.getByRole("button", { name: /Frecuencia.*Dos o tres/ })).toBeVisible();

  // Tocar «Nivel» vuelve a esa pregunta, con lo elegido y el foco en ella
  await panel.getByRole("button", { name: /Nivel.*Intermedio/ }).click();
  const nivel = page.getByRole("group", { name: "¿Cuál es tu nivel?" });
  await expect(nivel.getByRole("button", { name: /^Intermedio/ })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("heading", { level: 2, name: /¿Cuál es tu nivel\?/ })).toBeFocused();

  // Cambiarla pasa a la siguiente, que ya estaba respondida
  await nivel.getByRole("button", { name: /^Avanzado/ }).click();
  await expect(page.getByRole("group", { name: "¿Cuántas veces por semana jugás?" })).toBeVisible();
  await expect(panel.getByRole("button", { name: /Nivel.*Avanzado/ })).toBeVisible();
  await expect(page.getByRole("button", { name: "Siguiente" })).toBeVisible();

  // «Anterior» vuelve sin perder lo elegido
  await page.getByRole("button", { name: "Anterior" }).click();
  await expect(nivel.getByRole("button", { name: /^Avanzado/ })).toHaveAttribute("aria-pressed", "true");

  // «Empezar de nuevo» borra todo y vuelve a la primera
  await page.getByRole("button", { name: "Empezar de nuevo" }).click();
  await expect(nivel.getByRole("button", { name: /^Avanzado/ })).toHaveAttribute("aria-pressed", "false");
  await expect(panel.getByRole("button")).toHaveCount(0);
  await expect(panel.locator('[aria-current="step"]')).toContainText("Nivel");
});

test("en mobile, las respuestas se pliegan en un resumen que se despliega", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/quiz");
  await responder(page, 2);
  await expect(page.getByRole("group", { name: "¿Desde dónde jugás más?" })).toBeVisible();

  const resumen = page.getByRole("button", { name: "Tus respuestas (2 de 6)" });
  const panel = page.getByRole("navigation", { name: "Preguntas del quiz" });
  await expect(resumen).toHaveAttribute("aria-expanded", "false");
  await expect(panel).toBeHidden();

  await resumen.click();
  await expect(resumen).toHaveAttribute("aria-expanded", "true");
  await expect(panel).toBeVisible();

  // Tocar una respuesta lleva a esa pregunta y vuelve a plegar el resumen
  await panel.getByRole("button", { name: /Nivel.*Intermedio/ }).click();
  await expect(page.getByRole("group", { name: "¿Cuál es tu nivel?" })).toBeVisible();
  await expect(panel).toBeHidden();
});
