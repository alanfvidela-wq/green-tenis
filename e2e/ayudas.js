// Lo que comparten los tests E2E.

import { createClient } from "@supabase/supabase-js";

// Productos del catálogo que usan los tests. Los tests no cambian el
// catálogo: si alguno deja de existir, hay que cambiarlo acá.
export const PELOTA_BARATA = { slug: "penn-championship", nombre: "Championship", opcion: "Tubo x3" };
export const OTRA_PELOTA = { slug: "head-tour-xt", nombre: "Tour XT", opcion: "Tubo x3" };

// Un precio en pesos como lo muestra la tienda («$ 12.900»), como expresión
// regular: el espacio después del $ depende del navegador (a veces es un
// espacio duro), así que se compara por los números.
export function pesos(monto) {
  const miles = String(monto).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return new RegExp(`^\\$\\s?${miles.replace(/\./g, "\\.")}$`);
}

// El monto de un texto en pesos: «$ 12.900» → 12900
export function monto(texto) {
  return Number(texto.replace(/\D/g, ""));
}

// Una raqueta con grip y peso que tenga una combinación sin stock y, con el
// mismo grip, otra que sí tenga. Sale de la API pública (la misma que lee la
// tienda), así el test no depende de cuál esté agotada hoy.
export async function raquetaConVarianteAgotada(request) {
  const listado = await request.get("/api/v1/productos?categoria=raquetas&limit=48");
  const { productos } = await listado.json();

  for (const { slug } of productos) {
    const { producto } = await (await request.get(`/api/v1/productos/${slug}`)).json();
    const variantes = producto.variantes.filter((v) => v.grip != null && v.pesoG != null);
    const agotada = variantes.find((v) => v.stock === 0);
    const conStock = agotada && variantes.find((v) => v.grip === agotada.grip && v.stock > 0);
    if (conStock) return { producto, agotada, conStock };
  }
  return null;
}

// Cancela los pedidos pendientes de la cuenta de prueba que llevan `marca` en
// «Piso o departamento» (la pone el test del checkout) y devuelve su stock,
// con cancelar_pedido (supabase/migrations/0010_cancelar_pedido.sql). Entra
// con la sesión de la cuenta de prueba, como en la tienda: no usa la clave
// secreta. Devuelve los números de los pedidos cancelados; si alguno no se
// pudo cancelar, tira, así el test falla y se sabe que quedó algo en la base.
export async function cancelarPedidosDePrueba(marca) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
  const { error: errorIngreso } = await supabase.auth.signInWithPassword({
    email: process.env.E2E_EMAIL,
    password: process.env.E2E_PASSWORD,
  });
  if (errorIngreso) throw new Error(`Limpieza: no se pudo ingresar con la cuenta de prueba (${errorIngreso.message})`);

  try {
    const { data: pedidos, error } = await supabase
      .from("pedidos")
      .select("id, numero")
      .eq("estado", "pendiente_pago")
      .eq("envio_datos->>piso", marca);
    if (error) throw new Error(`Limpieza: no se pudieron leer los pedidos (${error.message})`);

    const cancelados = [];
    for (const { id, numero } of pedidos) {
      const { data: cancelado, error: errorCancelar } = await supabase.rpc("cancelar_pedido", { pedido: id });
      if (errorCancelar) {
        throw new Error(`Limpieza: no se pudo cancelar el pedido #${numero} (${errorCancelar.message})`);
      }
      if (!cancelado) throw new Error(`Limpieza: el pedido #${numero} no se canceló (¿tiene un pago en curso?)`);
      cancelados.push(numero);
    }
    return cancelados;
  } finally {
    // Cierra solo esta sesión: la del navegador de otro test sigue andando
    await supabase.auth.signOut({ scope: "local" });
  }
}

// Ingresa con la cuenta de prueba desde /ingresar, como alguien de verdad, y
// espera «Mis pedidos», a donde lleva la tienda sin otro destino. Las cookies
// de la sesión quedan en el contexto: las usan la página y page.request.
export async function ingresar(page, email, contrasena) {
  await page.goto("/ingresar");
  await page.getByRole("textbox", { name: "Email" }).fill(email);
  await page.getByLabel("Contraseña", { exact: true }).fill(contrasena);
  await page.getByRole("button", { name: "Ingresar" }).click();
  await page.getByRole("heading", { level: 1, name: "Mis pedidos" }).waitFor();
}

// Agrega al carrito la opción de un producto (que no sea raqueta) desde su
// ficha y espera el aviso
export async function agregarAlCarrito(page, { slug, opcion }) {
  await page.goto(`/producto/${slug}`);
  await page.getByRole("group", { name: /Opción|Presentación/ }).getByRole("button", { name: opcion }).click();
  await page.getByRole("button", { name: "Agregar al carrito" }).click();
  await page.getByRole("status").filter({ hasText: "Agregado al carrito." }).waitFor();
}
