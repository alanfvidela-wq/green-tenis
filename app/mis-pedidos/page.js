import Link from "next/link";
import { redirect } from "next/navigation";
import Estado, { tonoDePedido } from "@/components/Estado";
import { salir } from "@/lib/cuenta";
import { formatearFecha, formatearPrecio } from "@/lib/formato";
import { getPedidos } from "@/lib/pedidos";
import { getUsuario } from "@/lib/sesion";
import listado from "../listado.module.css";
import styles from "./pedidos.module.css";

export const metadata = { title: "Mis pedidos" };

export default async function PaginaMisPedidos({ searchParams }) {
  // El proxy ya redirige sin sesión; esto es la verificación de verdad
  const usuario = await getUsuario();
  if (!usuario) redirect("/ingresar?siguiente=/mis-pedidos");

  const pedidos = await getPedidos();
  const { contrasena } = await searchParams;

  return (
    <main>
      <header className={listado.encabezado}>
        <nav className="migas" aria-label="Ubicación">
          <Link href="/">Inicio</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">Mis pedidos</span>
        </nav>
        {contrasena === "cambiada" && (
          <p className={styles.aviso} role="status">
            Listo: cambiaste tu contraseña.
          </p>
        )}
        <h1 className={`display ${listado.titulo}`}>Mis pedidos</h1>
        <p className={listado.descripcion}>Ingresaste como {usuario.email}.</p>
        <form action={salir}>
          <button type="submit" className="boton boton-secundario">
            Cerrar sesión
          </button>
        </form>
      </header>

      {pedidos.length === 0 ? (
        <div className={listado.vacio}>
          <p>Todavía no hiciste pedidos.</p>
        </div>
      ) : (
        <ul className={styles.lista}>
          {pedidos.map((pedido) => (
            <li key={pedido.id} className={styles.pedido}>
              <Link href={`/mis-pedidos/${pedido.id}`} className={styles.numero}>
                Pedido #{pedido.numero}
              </Link>
              <p className={styles.fecha}>{formatearFecha(pedido.creadoEn)}</p>
              <p className={styles.estado}>
                <Estado tono={tonoDePedido(pedido.estado.clave)}>{pedido.estado.texto}</Estado>
              </p>
              <p className={styles.monto}>{formatearPrecio(pedido.total)}</p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
