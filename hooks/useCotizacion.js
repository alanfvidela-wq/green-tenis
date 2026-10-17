"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useCarrito } from "@/hooks/useCarrito";
import { cotizarCarrito } from "@/lib/carrito";

// La cotización del carrito, hecha en el servidor (cotizarCarrito) cada vez
// que el carrito cambia. Si llegan respuestas fuera de orden, se queda con la
// última pedida. `alDia` dice si la cotización es la del carrito de ahora.
export function useCotizacion() {
  const { lineas, cargado } = useCarrito();
  const [cotizacion, setCotizacion] = useState(null);
  const [error, setError] = useState(false);
  const [calculando, startTransition] = useTransition();
  const ultima = useRef(0);
  const firma = JSON.stringify(lineas);

  useEffect(() => {
    if (!cargado || lineas.length === 0) return;
    const numero = ++ultima.current;
    startTransition(async () => {
      try {
        const resultado = await cotizarCarrito(lineas);
        if (numero === ultima.current) {
          setCotizacion({ ...resultado, firma: JSON.stringify(lineas) });
          setError(false);
        }
      } catch {
        if (numero === ultima.current) setError(true);
      }
    });
  }, [lineas, cargado]);

  return {
    cotizacion,
    calculando,
    alDia: !calculando && cotizacion?.firma === firma,
    error,
  };
}
