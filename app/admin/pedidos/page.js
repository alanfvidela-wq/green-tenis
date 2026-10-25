import { exigirAdmin } from "@/lib/sesion";
import styles from "../admin.module.css";

export const metadata = { title: "Pedidos" };

export default async function PaginaAdminPedidos() {
  await exigirAdmin("/admin/pedidos");

  return (
    <main className={styles.pagina}>
      <h1 className={`display ${styles.titulo}`}>Pedidos</h1>
    </main>
  );
}
