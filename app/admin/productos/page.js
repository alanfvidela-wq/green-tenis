import { exigirAdmin } from "@/lib/sesion";
import styles from "../admin.module.css";

export const metadata = { title: "Productos" };

export default async function PaginaAdminProductos() {
  await exigirAdmin("/admin/productos");

  return (
    <main className={styles.pagina}>
      <h1 className={`display ${styles.titulo}`}>Productos</h1>
    </main>
  );
}
