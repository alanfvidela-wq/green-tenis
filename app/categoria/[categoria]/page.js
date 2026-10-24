import Link from "next/link";
import { notFound } from "next/navigation";
import BloqueFoto from "@/components/BloqueFoto";
import GrillaProductos from "@/components/GrillaProductos";
import { lugaresDe } from "@/lib/fotos";
import { contar } from "@/lib/formato";
import { getCategoria, getProductosPorCategoria } from "@/lib/productos";
import styles from "../../listado.module.css";

export async function generateMetadata({ params }) {
  const { categoria: slug } = await params;
  const categoria = getCategoria(slug);
  if (!categoria) return { title: "Categoría no encontrada" };
  return { title: categoria.nombre, description: categoria.descripcion };
}

export default async function PaginaCategoria({ params }) {
  const { categoria: slug } = await params;
  const categoria = getCategoria(slug);
  if (!categoria) notFound();

  const productos = await getProductosPorCategoria(slug);
  const [celda] = lugaresDe(slug, "celda");
  const [bloque] = lugaresDe(slug, "bloque");

  return (
    <main>
      <header className={styles.encabezado}>
        <nav className="migas" aria-label="Ubicación">
          <Link href="/">Inicio</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{categoria.nombre}</span>
        </nav>
        <h1 className={`display ${styles.titulo}`}>{categoria.nombre}</h1>
        <p className={styles.descripcion}>{categoria.descripcion}</p>
        <p className={`dato ${styles.cuenta}`}>
          {contar(productos.length, "producto", "productos")}
        </p>
      </header>

      <GrillaProductos productos={productos} foto={celda} />
      <BloqueFoto lugar={bloque} className={styles.bloque} />
    </main>
  );
}
