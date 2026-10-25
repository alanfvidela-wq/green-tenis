import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import BotonPagar from "@/components/BotonPagar";
import ChequeoExito from "@/components/ChequeoExito";
import { conciliarPedido, pagoOnlineDisponible } from "@/lib/cobros";
import { getPedido } from "@/lib/pedidos";
import { getUsuario } from "@/lib/sesion";
import styles from "@/app/estados.module.css";

// Adonde vuelve Checkout Pro (las back_urls de la preferencia). El título dice
// qué contestó Mercado Pago, pero los parámetros de la URL nunca cambian el
// pedido: esta URL la puede abrir cualquiera con cualquier parámetro. Antes de
// mostrarla, si el pedido está pendiente, sus pagos se buscan en la API de
// Mercado Pago por external_reference y se concilian (conciliarPedido), igual
// que con el webhook.

const RESULTADOS = {
  aprobado: {
    titulo: "Pago aprobado",
    texto: (numero, acreditado) =>
      acreditado
        ? `Mercado Pago aprobó el pago del pedido #${numero} y ya está acreditado.`
        : `Mercado Pago aprobó el pago del pedido #${numero}. En unos segundos lo vas a ver acreditado en el pedido.`,
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

  let pedido = await getPedido(id);
  if (!pedido) notFound();
  if (await conciliarPedido(pedido)) pedido = await getPedido(id);
  // Reintentar solo si el pedido todavía se puede pagar
  const reintentar =
    resultado === "rechazado" && pedido.estado.clave === "pendiente_pago" && pagoOnlineDisponible();

  return (
    <main className={styles.estado}>
      {resultado === "aprobado" && <ChequeoExito />}
      <h1 className={`display ${styles.titulo}`}>{mensaje.titulo}</h1>
      <p className={styles.texto}>{mensaje.texto(pedido.numero, pedido.estado.clave === "pagado")}</p>
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
