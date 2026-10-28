"use client";

import { useSyncExternalStore } from "react";
import { MAX_CANTIDAD, claveDe, limpiarLineas } from "@/lib/lineas";

// El carrito vive en el navegador (localStorage), solo con ids y cantidades:
// los precios, los descuentos y el stock los calcula el servidor
// (cotizarCarrito, en lib/carrito.js). Se comparte entre componentes y entre
// pestañas sin provider: cada uno lo lee con useCarrito().

const CLAVE = "green.carrito";
const VERSION = 1;
const SIN_LINEAS = [];

const oyentes = new Set();
let guardado = { texto: undefined, lineas: SIN_LINEAS };

// Lo guardado, ya limpio. Devuelve la misma lista mientras no cambie, como
// pide useSyncExternalStore.
function leer() {
  let texto = null;
  try {
    texto = window.localStorage.getItem(CLAVE);
  } catch {
    // Sin acceso al almacenamiento (modo privado estricto): carrito vacío
  }
  if (texto !== guardado.texto) {
    let lineas = SIN_LINEAS;
    try {
      const dato = JSON.parse(texto ?? "null");
      if (dato?.version === VERSION) lineas = limpiarLineas(dato.lineas);
    } catch {
      // Lo que no se puede leer se descarta
    }
    guardado = { texto, lineas };
  }
  return guardado.lineas;
}

function escribir(lineas) {
  try {
    window.localStorage.setItem(CLAVE, JSON.stringify({ version: VERSION, lineas }));
  } catch {
    // Si no se puede guardar, el carrito sigue vacío
  }
  oyentes.forEach((avisar) => avisar());
}

// Avisa cuando cambia acá o en otra pestaña (el evento storage)
function suscribir(avisar) {
  const alCambiarOtraPestaña = (evento) => {
    if (evento.key === CLAVE || evento.key === null) avisar();
  };
  oyentes.add(avisar);
  window.addEventListener("storage", alCambiarOtraPestaña);
  return () => {
    oyentes.delete(avisar);
    window.removeEventListener("storage", alCambiarOtraPestaña);
  };
}

function agregar(linea) {
  escribir(limpiarLineas([...leer(), linea]));
}

function cambiarCantidad(clave, cantidad) {
  const acotada = Math.min(MAX_CANTIDAD, Math.max(1, cantidad));
  escribir(leer().map((l) => (claveDe(l) === clave ? { ...l, cantidad: acotada } : l)));
}

function quitar(clave) {
  escribir(leer().filter((l) => claveDe(l) !== clave));
}

function vaciar() {
  escribir([]);
}

const enCliente = () => true;
const enServidor = () => false;

export function useCarrito() {
  const lineas = useSyncExternalStore(suscribir, leer, () => SIN_LINEAS);
  // En el servidor (y al hidratar) todavía no se leyó el navegador
  const cargado = useSyncExternalStore(suscribir, enCliente, enServidor);

  return {
    lineas,
    cargado,
    cantidadTotal: lineas.reduce((suma, l) => suma + l.cantidad, 0),
    // `encordado` ({ cuerdaId, tensionKg }), solo para una raqueta encordada
    agregarProducto: (varianteId, cantidad = 1, encordado) =>
      agregar(
        encordado
          ? { tipo: "producto", varianteId, cantidad, encordado }
          : { tipo: "producto", varianteId, cantidad },
      ),
    agregarCombo: (comboId, elecciones, cantidad = 1) =>
      agregar({ tipo: "combo", comboId, elecciones, cantidad }),
    cambiarCantidad,
    quitar,
    vaciar,
  };
}
