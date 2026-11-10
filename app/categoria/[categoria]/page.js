import Link from "next/link";
import { notFound } from "next/navigation";
import BloqueFoto from "@/components/BloqueFoto";
import FiltrosListado from "@/components/FiltrosListado";
import GrillaProductos from "@/components/GrillaProductos";
import { lugaresDe } from "@/lib/fotos";
import { contar } from "@/lib/formato";
import { armarListado } from "@/lib/listado";
import { getCategoria, getProductosPorCategoria } from "@/lib/productos";
import { compartir, tituloCompartir } from "@/lib/sitio";
import styles from "../../listado.module.css";

export async function generateMetadata({ params }) {
  const { categoria: slug } = await params;
  const categoria = getCategoria(slug);
  if (!categoria) return { title: "Categoría no encontrada" };
  return {
    title: categoria.nombre,
    description: categoria.descripcion,
    ...compartir({
      titulo: tituloCompartir(categoria.nombre),
      descripcion: categoria.descripcion,
      ruta: `/categoria/${categoria.slug}`,
    }),
  };
}

// El orden y los filtros vienen en la URL («?orden=precio-asc&marca=wilson»)
// y se resuelven acá, en el servidor (lib/listado.js). La URL canónica es
// siempre la de la categoría sin parámetros.
export default async function PaginaCategoria({ params, searchParams }) {
  const { categoria: slug } = await params;
  const categoria = getCategoria(slug);
  if (!categoria) notFound();

  const ruta = `/categoria/${slug}`;
  // Las raquetas se filtran por nivel, que está en la ficha
  const todos = await getProductosPorCategoria(slug, { conFicha: slug === "raquetas" });
  const { productos, grupos, filtrado } = armarListado(todos, await searchParams, ruta);
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
          {filtrado && `${productos.length} de `}
          {contar(filtrado ? todos.length : productos.length, "producto", "productos")}
        </p>
      </header>

      {todos.length > 1 && <FiltrosListado grupos={grupos} />}

      {productos.length > 0 ? (
        <GrillaProductos productos={productos} foto={celda} />
      ) : (
        <p className={styles.vacio}>
          Ningún producto con esos filtros.{" "}
          <Link href={ruta} scroll={false}>
            Quitar los filtros
          </Link>
        </p>
      )}
      <BloqueFoto lugar={bloque} className={styles.bloque} />
    </main>
  );
}
