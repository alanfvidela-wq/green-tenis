import Link from "next/link";
import ListaProductos from "@/components/admin/ListaProductos";
import { CATEGORIAS } from "@/lib/productos";
import { exigirAdmin } from "@/lib/sesion";
import styles from "../admin.module.css";

export const metadata = { title: "Productos" };

// El listado de productos: lo arma ListaProductos en el navegador, con la API
export default async function PaginaAdminProductos() {
  await exigirAdmin("/admin/productos");

  return (
    <main className={styles.pagina}>
      <header className={styles.encabezado}>
        <h1 className={`display ${styles.titulo}`}>Productos</h1>
        <Link href="/admin/productos/nuevo" className="boton">
          Nuevo producto
        </Link>
      </header>
      <ListaProductos categorias={CATEGORIAS.map(({ slug, nombre }) => ({ slug, nombre }))} />
    </main>
  );
}
