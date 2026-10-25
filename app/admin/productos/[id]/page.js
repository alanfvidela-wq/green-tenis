import { notFound } from "next/navigation";
import FormularioProducto from "@/components/admin/FormularioProducto";
import { CATEGORIAS } from "@/lib/productos";
import { exigirAdmin } from "@/lib/sesion";
import styles from "../../admin.module.css";

export const metadata = { title: "Editar producto" };

// El producto lo pide FormularioProducto a la API (GET /api/v1/productos/[id])
export default async function PaginaEditarProducto({ params, searchParams }) {
  const { id } = await params;
  await exigirAdmin(`/admin/productos/${id}`);
  if (!/^[1-9]\d{0,17}$/.test(id)) notFound();
  const { creado } = await searchParams;

  return (
    <main className={styles.pagina}>
      <header className={styles.encabezado}>
        <h1 className={`display ${styles.titulo}`}>Editar producto</h1>
      </header>
      <FormularioProducto
        id={Number(id)}
        recienCreado={creado === "1"}
        categorias={CATEGORIAS.map(({ slug, nombre }) => ({ slug, nombre }))}
      />
    </main>
  );
}
