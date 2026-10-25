"use client";

import { useActionState } from "react";
import { pagarPedido } from "@/lib/checkout";
import formulario from "@/app/formulario.module.css";
import styles from "./BotonPagar.module.css";

// La píldora del acento para pagar un pedido pendiente: el servidor reusa la
// preferencia del pedido (o crea una) y lleva a Checkout Pro. Si no se puede
// pagar, dice por qué debajo.
export default function BotonPagar({ pedidoId, texto = "Pagar con Mercado Pago" }) {
  const [estado, pagar, abriendo] = useActionState(() => pagarPedido(pedidoId), null);

  return (
    <form action={pagar} className={styles.pagar}>
      <button type="submit" className="boton" disabled={abriendo}>
        {abriendo ? "Abriendo Mercado Pago…" : texto}
      </button>
      {estado?.error && (
        <p className={formulario.error} role="alert">
          {estado.error}
        </p>
      )}
    </form>
  );
}
