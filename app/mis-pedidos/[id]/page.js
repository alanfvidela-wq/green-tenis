import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import BotonPagar from "@/components/BotonPagar";
import Estado, { tonoDePedido } from "@/components/Estado";
import Totales from "@/components/Totales";
import { SIN_PAGO_ONLINE, conciliarPedido, pagoOnlineDisponible } from "@/lib/cobros";
import { formatearFecha, formatearHora, formatearPrecio } from "@/lib/formato";
import { getPedido } from "@/lib/pedidos";
import { getUsuario } from "@/lib/sesion";
import listado from "../../listado.module.css";
import styles from "../pedidos.module.css";

export const metadata = { title: "Pedido" };

// Lo que significa el estado, debajo del título. Sin pago online, un
// pendiente solo dice cuándo vence.
function notaDe(pedido, pagoOnline) {
  const hora = formatearHora(pedido.venceEn);
  switch (pedido.estado.clave) {
    case "pendiente_pago":
      if (!pagoOnline) {
        return `El pedido quedó pendiente de pago. Si no se paga antes de las ${hora}, se cancela y el stock vuelve a estar disponible.`;
      }
      return pedido.ultimoPago === "rejected" || pedido.ultimoPago === "cancelled"
        ? `Mercado Pago no aprobó el último intento de pago. Podés probar de nuevo, con otro medio si querés, hasta las ${hora}.`
        : `Tenés hasta las ${hora} para pagarlo con Mercado Pago. Si no, el pedido se cancela y el stock vuelve a estar disponible.`;
    case "procesando":
      return "Mercado Pago está procesando el pago. Mientras tanto, el pedido no vence y el stock sigue reservado.";
    case "vencido":
      return "Pasaron 30 minutos sin el pago: el pedido se cancela y el stock vuelve a estar disponible.";
    case "pagado":
      return "Mercado Pago acreditó el pago.";
    case "cancelado":
      if (pedido.pagoTrasCancelar) {
        return "Mercado Pago aprobó un pago cuando el pedido ya se había cancelado. Lo estamos revisando para seguir con el pedido o devolverte el dinero.";
      }
      return pedido.canceladoPor === "devolucion"
        ? "Se devolvió el pago por Mercado Pago y el pedido se canceló."
        : "El pedido se canceló y el stock volvió a estar disponible.";
    default:
      return null;
  }
}

function Linea({ linea }) {
  return (
    <li className={styles.linea}>
      <div>
        <Link href={linea.href} className={styles.nombre}>
          {linea.nombre}
        </Link>
        <p className={styles.dato}>
          {linea.variante} · {linea.cantidad} × {formatearPrecio(linea.precioUnitario)}
        </p>
      </div>
      <p className={styles.monto}>{formatearPrecio(linea.subtotal)}</p>
    </li>
  );
}

export default async function PaginaPedido({ params, searchParams }) {
  const { id } = await params;
  const usuario = await getUsuario();
  if (!usuario) redirect(`/ingresar?siguiente=/mis-pedidos/${encodeURIComponent(id)}`);

  let pedido = await getPedido(id);
  if (!pedido) notFound();
  // Si está pendiente (o se canceló por vencido), sus pagos se buscan en
  // Mercado Pago antes de mostrarlo: por si el aviso del webhook no llegó o no
  // pasó la firma
  if (await conciliarPedido(pedido)) pedido = await getPedido(id);
  const { nuevo } = await searchParams;
  const envio = pedido.envioDatos ?? {};
  const pagoOnline = pagoOnlineDisponible();
  const nota = notaDe(pedido, pagoOnline);
  const pendiente = pedido.estado.clave === "pendiente_pago";

  // Arriba: recién confirmado, o un pendiente que no se puede pagar online
  let aviso = null;
  if (pendiente && !pagoOnline) {
    aviso = nuevo ? `Listo: tu pedido quedó registrado. ${SIN_PAGO_ONLINE}` : SIN_PAGO_ONLINE;
  } else if (nuevo && pendiente) {
    // Mercado Pago no respondió a tiempo al confirmar
    aviso = "Tu pedido quedó registrado, pero no pudimos abrir Mercado Pago. Pagalo desde acá.";
  }

  return (
    <main>
      <header className={listado.encabezado}>
        <nav className="migas" aria-label="Ubicación">
          <Link href="/">Inicio</Link>
          <span aria-hidden="true">/</span>
          <Link href="/mis-pedidos">Mis pedidos</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">Pedido #{pedido.numero}</span>
        </nav>
        {aviso && (
          <p className={styles.aviso} role="status">
            {aviso}
          </p>
        )}
        <h1 className={`display ${listado.titulo}`}>Pedido #{pedido.numero}</h1>
        <p className={styles.fecha}>{formatearFecha(pedido.creadoEn)}</p>
        <p className={styles.estado}>
          <Estado tono={tonoDePedido(pedido.estado.clave)}>{pedido.estado.texto}</Estado>
        </p>
        {nota && <p className={listado.descripcion}>{nota}</p>}
        {pendiente && pagoOnline && <BotonPagar pedidoId={pedido.id} />}
      </header>

      <div className={styles.detalle}>
        <section aria-labelledby="titulo-productos">
          <h2 id="titulo-productos" className={styles.titulo}>
            Qué compraste
          </h2>
          <ul className={styles.lineas}>
            {pedido.combos.map((combo) => (
              <li key={combo.id} className={styles.linea}>
                <div>
                  <p>{combo.nombre}</p>
                  <p className={styles.dato}>
                    Combo con {combo.descuentoPct} % menos: ahorraste{" "}
                    {formatearPrecio(combo.descuento)}
                  </p>
                  <ul className={styles.items}>
                    {combo.lineas.map((linea) => (
                      <Linea key={linea.id} linea={linea} />
                    ))}
                  </ul>
                </div>
                <p className={styles.monto}>{formatearPrecio(combo.precio)}</p>
              </li>
            ))}
            {pedido.sueltas.map((linea) => (
              <Linea key={linea.id} linea={linea} />
            ))}
          </ul>
        </section>

        <div className={styles.lateral}>
          <section aria-labelledby="titulo-total">
            <h2 id="titulo-total" className={styles.titulo}>
              Total
            </h2>
            <Totales
              lista={pedido.lista}
              descuento={pedido.descuento}
              envio={pedido.envio}
              total={pedido.total}
            />
          </section>

          <section aria-labelledby="titulo-envio">
            <h2 id="titulo-envio" className={styles.titulo}>
              Envío
            </h2>
            <dl className={styles.envio}>
              <div>
                <dt>Recibe</dt>
                <dd>{envio.nombre}</dd>
              </div>
              <div>
                <dt>Teléfono</dt>
                <dd>{envio.telefono}</dd>
              </div>
              <div>
                <dt>Dirección</dt>
                <dd>
                  {envio.calle}
                  {envio.piso && `, ${envio.piso}`}
                </dd>
              </div>
              <div>
                <dt>Ciudad</dt>
                <dd>
                  {envio.ciudad}, {envio.provincia} ({envio.codigoPostal})
                </dd>
              </div>
              <div>
                <dt>Email</dt>
                <dd>{pedido.email}</dd>
              </div>
            </dl>
          </section>
        </div>
      </div>
    </main>
  );
}
