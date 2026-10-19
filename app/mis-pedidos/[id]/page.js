import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import Totales from "@/components/Totales";
import { formatearFecha, formatearPrecio } from "@/lib/formato";
import { getPedido } from "@/lib/pedidos";
import { getUsuario } from "@/lib/sesion";
import listado from "../../listado.module.css";
import styles from "../pedidos.module.css";

export const metadata = { title: "Pedido" };

// Lo que dice cada estado debajo del título
const NOTAS = {
  pendiente_pago:
    "El pago con Mercado Pago llega más adelante. Si el pedido no se paga en 30 minutos, se cancela y el stock vuelve a estar disponible.",
  vencido:
    "Pasaron 30 minutos sin el pago: el pedido se cancela y el stock vuelve a estar disponible.",
  cancelado: "El pedido se canceló y el stock volvió a estar disponible.",
};

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

  const pedido = await getPedido(id);
  if (!pedido) notFound();
  const { nuevo } = await searchParams;
  const envio = pedido.envioDatos ?? {};

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
        {nuevo && (
          <p className={styles.aviso} role="status">
            Listo: tu pedido quedó registrado.
          </p>
        )}
        <h1 className={listado.titulo}>Pedido #{pedido.numero}</h1>
        <p className={styles.fecha}>{formatearFecha(pedido.creadoEn)}</p>
        <p className={styles.estado}>{pedido.estado.texto}</p>
        {NOTAS[pedido.estado.clave] && (
          <p className={listado.descripcion}>{NOTAS[pedido.estado.clave]}</p>
        )}
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
