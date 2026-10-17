import Link from "next/link";
import AnatomiaRaqueta from "@/components/AnatomiaRaqueta";
import GrillaProductos from "@/components/GrillaProductos";
import Hero from "@/components/Hero";
import {
  BAJADA_ANATOMIA,
  CIERRE_ANATOMIA,
  PASOS_ANATOMIA,
  TITULO_ANATOMIA,
} from "@/lib/anatomia";
import { contar } from "@/lib/formato";
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

      {/* Anatomía de una raqueta: la excepción inflada, con la raqueta fija y
          los pasos con el scroll (ver DESIGN.md) */}
      <AnatomiaRaqueta
        titulo={TITULO_ANATOMIA}
        bajada={BAJADA_ANATOMIA}
        cierre={CIERRE_ANATOMIA}
        pasos={PASOS_ANATOMIA}
      />

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
                      {contar(cantidad, "producto", "productos")}
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
