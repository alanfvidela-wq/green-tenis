"use server";

import { redirect } from "next/navigation";
import { cotizarCarrito } from "./carrito";
import { linkDePago } from "./cobros";
import { Envio, Lineas } from "./esquemas";
import { argumentosDePedido } from "./lineas";
import { crearClienteConSesion, getUsuario } from "./sesion";

// Qué corregir en el envío: todos los campos que faltan juntos («Faltan datos:
// nombre y apellido, teléfono.», con comas porque algunas etiquetas ya llevan
// su «y»); si no falta ninguno, el primer problema
function errorDeEnvio({ issues }) {
  const faltan = issues
    .filter((problema) => problema.code === "too_small" || problema.code === "invalid_type")
    .map((problema) => problema.message);
  return faltan.length > 0 ? `Faltan datos: ${faltan.join(", ")}.` : issues[0].message;
}

// Confirma el pedido del usuario con sesión: valida el carrito y el envío, lo
// crea con crear_pedido, que recalcula precios y descuentos, reserva el stock
// y lo deja en pendiente_pago, y arma el link a Checkout Pro con lo que quedó
// guardado. Devuelve { pedidoId, pagoUrl } o { error }. Si Mercado Pago no
// responde o no está configurado, pagoUrl es null: el pedido ya está hecho y
// se va a su página.
export async function confirmarPedido(entrada, datosEnvio) {
  const usuario = await getUsuario();
  if (!usuario) return { error: "Tu sesión se cerró. Ingresá de nuevo para confirmar." };

  const envio = Envio.safeParse(datosEnvio);
  if (!envio.success) return { error: errorDeEnvio(envio.error) };

  const validadas = Lineas.safeParse(entrada);
  if (!validadas.success) return { error: "Algo cambió en tu carrito. Revisalo antes de confirmar." };
  const lineas = validadas.data;
  if (lineas.length === 0) return { error: "Tu carrito está vacío." };

  // Lo mismo que ve el cliente: si alguna línea tiene un problema, no sigue
  const cotizacion = await cotizarCarrito(lineas);
  if (!cotizacion.puedeComprar) {
    return { error: "Algo cambió en tu carrito. Revisalo antes de confirmar." };
  }

  const supabase = await crearClienteConSesion();
  const { data, error } = await supabase.rpc("crear_pedido", {
    ...argumentosDePedido(lineas),
    envio_datos: envio.data,
  });

  if (error) {
    // Los rechazos de crear_pedido ya vienen en castellano («No hay stock
    // suficiente de …»); lo demás, no se muestra tal cual
    if (error.code === "P0001") return { error: error.message };
    if (error.code === "42501") {
      return { error: "Tu sesión se cerró. Ingresá de nuevo para confirmar." };
    }
    return { error: "No se pudo confirmar el pedido. Probá de nuevo en un rato." };
  }

  const { url } = await linkDePago(data, usuario.email);
  return { pedidoId: data, pagoUrl: url ?? null };
}

// «Pagar» desde la página del pedido: reusa la preferencia del pedido (o crea
// una) y lleva a Checkout Pro. Devuelve { error } si no se puede pagar.
export async function pagarPedido(pedidoId) {
  const usuario = await getUsuario();
  if (!usuario) return { error: "Tu sesión se cerró. Ingresá de nuevo para pagar." };

  const { url, error } = await linkDePago(String(pedidoId), usuario.email);
  if (error) return { error };
  redirect(url);
}
