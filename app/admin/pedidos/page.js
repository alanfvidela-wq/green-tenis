import ListaPedidos from "@/components/admin/ListaPedidos";
import { exigirAdmin } from "@/lib/sesion";
import styles from "../admin.module.css";

export const metadata = { title: "Pedidos" };

// Los pedidos de todos: los pide ListaPedidos en el navegador, con la API
export default async function PaginaAdminPedidos() {
  await exigirAdmin("/admin/pedidos");

  return (
    <main className={styles.pagina}>
      <header className={styles.encabezado}>
        <h1 className={`display ${styles.titulo}`}>Pedidos</h1>
      </header>
      <p className={styles.bajada}>
        Un pedido pagado pasa a en preparación y, de ahí, a enviado. Los demás estados los mueven el
        pago y el vencimiento.
      </p>
      <ListaPedidos />
    </main>
  );
}
