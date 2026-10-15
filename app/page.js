import Link from "next/link";
import GrillaProductos from "@/components/GrillaProductos";
import Hero from "@/components/Hero";
import { CATEGORIAS, getProductos } from "@/lib/productos";
import styles from "./page.module.css";

export default async function Home() {
  const productos = await getProductos();
  const destacados = productos.filter((p) => p.destacado);

  return (
    <main className={styles.home}>
      <Hero />

      <section aria-labelledby="titulo-destacados">
        <div className={`${styles.contenido} ${styles.seccion}`}>
          <h2 id="titulo-destacados" className={styles.subtitulo}>
            Lo que más sale
          </h2>
          <GrillaProductos productos={destacados} columnas={3} />
        </div>
      </section>

      <section aria-labelledby="titulo-categorias">
        <div className={`${styles.contenido} ${styles.seccion}`}>
          <h2 id="titulo-categorias" className={styles.subtitulo}>
            Categorías
          </h2>
          <ul className={styles.categorias}>
            {CATEGORIAS.map((categoria) => {
              const cantidad = productos.filter(
                (p) => p.categoria === categoria.slug,
              ).length;
              return (
                <li key={categoria.slug}>
                  <Link
                    href={`/categoria/${categoria.slug}`}
                    className={styles.categoria}
                  >
                    <span className={styles.categoriaNombre}>
                      {categoria.nombre}
                    </span>
                    <span className={styles.categoriaDescripcion}>
                      {categoria.descripcion}
                    </span>
                    <span className={`dato ${styles.categoriaCantidad}`}>
                      {cantidad} productos
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </section>
    </main>
  );
}
