"use client";

import { useEffect, useState } from "react";
import { useCarrito } from "@/hooks/useCarrito";

// El «+» de la vitrina para un producto de una sola variante: lo agrega al
// carrito sin pasar por su página (con más de una variante, el «+» es parte
// del link al producto). Usa el mismo agregarProducto que el selector de la
// página de producto. Avisa con un tilde un momento y lo dice para lectores de
// pantalla.
export default function AgregarDirecto({ varianteId, nombre, className = "" }) {
  const { agregarProducto } = useCarrito();
  const [agregado, setAgregado] = useState(false);

  useEffect(() => {
    if (!agregado) return;
    const tiempo = setTimeout(() => setAgregado(false), 1800);
    return () => clearTimeout(tiempo);
  }, [agregado]);

  return (
    <>
      <button
        type="button"
        className={className}
        data-agregado={agregado || undefined}
        aria-label={`Agregar ${nombre} al carrito`}
        onClick={() => {
          agregarProducto(varianteId);
          setAgregado(true);
        }}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          {agregado ? <path d="M5 12.5l4.5 4.5L19 7.5" /> : <path d="M12 5v14M5 12h14" />}
        </svg>
      </button>
      <span role="status" className="solo-lectores">
        {agregado ? `Agregaste ${nombre} al carrito.` : ""}
      </span>
    </>
  );
}
