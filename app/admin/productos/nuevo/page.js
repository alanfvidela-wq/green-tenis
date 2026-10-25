import FormularioProducto from "@/components/admin/FormularioProducto";
import { CATEGORIAS } from "@/lib/productos";
import { exigirAdmin } from "@/lib/sesion";
import styles from "../../admin.module.css";

export const metadata = { title: "Nuevo producto" };

export default async function PaginaNuevoProducto() {
  await exigirAdmin("/admin/productos/nuevo");

  return (
    <main className={styles.pagina}>
      <header className={styles.encabezado}>
        <h1 className={`display ${styles.titulo}`}>Nuevo producto</h1>
      </header>
      <FormularioProducto categorias={CATEGORIAS.map(({ slug, nombre }) => ({ slug, nombre }))} />
    </main>
  );
}
