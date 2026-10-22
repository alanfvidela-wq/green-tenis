import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import BotonPagar from "@/components/BotonPagar";
import { getPedido } from "@/lib/pedidos";
import { getUsuario } from "@/lib/sesion";
import styles from "../../../../estados.module.css";

// Adonde vuelve Checkout Pro (las back_urls de la preferencia). Solo dice qué
// contestó Mercado Pago: nunca cambia el pedido. Eso lo hace el webhook, con
// el pago consultado a Mercado Pago, porque esta URL la puede abrir cualquiera
// con cualquier parámetro.

const RESULTADOS = {
  aprobado: {
    titulo: "Pago aprobado",
    texto: (numero) =>
      `Mercado Pago aprobó el pago del pedido #${numero}. En unos segundos lo vas a ver acreditado en el pedido.`,
  },
  pendiente: {
    titulo: "Pago en proceso",
    texto: (numero) =>
      `Mercado Pago está procesando el pago del pedido #${numero}. Cuando se resuelva, lo vas a ver en el pedido; mientras tanto, no vence.`,
  },
  rechazado: {
    titulo: "Pago rechazado",
    texto: (numero) =>
      `Mercado Pago no aprobó el pago del pedido #${numero}. Podés probar de nuevo con otra tarjeta o con otro medio.`,
  },
};

export async function generateMetadata({ params }) {
  const { resultado } = await params;
  return { title: RESULTADOS[resultado]?.titulo ?? "Pago" };
}

export default async function PaginaResultadoPago({ params }) {
  const { id, resultado } = await params;
  const mensaje = RESULTADOS[resultado];
  if (!mensaje) notFound();

  const usuario = await getUsuario();
  if (!usuario) {
    redirect(`/ingresar?siguiente=/mis-pedidos/${encodeURIComponent(id)}/pago/${resultado}`);
  }

  const pedido = await getPedido(id);
  if (!pedido) notFound();
  // Reintentar solo si el pedido todavía se puede pagar
  const reintentar = resultado === "rechazado" && pedido.estado.clave === "pendiente_pago";

  return (
    <main className={styles.estado}>
      <h1 className={styles.titulo}>{mensaje.titulo}</h1>
      <p className={styles.texto}>{mensaje.texto(pedido.numero)}</p>
      {resultado === "rechazado" && pedido.estado.clave === "vencido" && (
        <p className={styles.texto}>El pedido ya venció: para comprar, armalo de nuevo.</p>
      )}
      <div className={styles.acciones}>
        {reintentar && <BotonPagar pedidoId={pedido.id} texto="Probar de nuevo" />}
        <Link
          href={`/mis-pedidos/${pedido.id}`}
          className={reintentar ? "boton boton-secundario" : "boton"}
        >
          Ver el pedido
        </Link>
      </div>
    </main>
  );
}
