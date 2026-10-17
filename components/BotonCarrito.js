"use client";

import Link from "next/link";
import { useCarrito } from "@/hooks/useCarrito";
import { contar } from "@/lib/formato";

// «Carrito (n)» del header. La cantidad sale del carrito guardado en el
// navegador; hasta leerlo, dice solo «Carrito».
export default function BotonCarrito({ className }) {
  const { cantidadTotal, cargado } = useCarrito();

  return (
    <Link
      href="/carrito"
      className={className}
      aria-label={cargado ? `Carrito, ${contar(cantidadTotal, "producto", "productos")}` : "Carrito"}
    >
      {cargado ? `Carrito (${cantidadTotal})` : "Carrito"}
    </Link>
  );
}
