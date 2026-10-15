import Link from "next/link";
import GrillaProductos from "@/components/GrillaProductos";
import Hero from "@/components/Hero";
import Marquesina from "@/components/Marquesina";
import { LEYENDAS } from "@/lib/home";
import { CATEGORIAS, getProductos } from "@/lib/productos";
import styles from "./page.module.css";

export default async function Home() {
  const productos = await getProductos();
  const destacados = productos.filter((p) => p.destacado);

  return (
    <main className={styles.home}>
      <Hero />

      <Marquesina items={LEYENDAS} />

      {/* Manifiesto: dos líneas display, la segunda corrida a la derecha */}
      <section className={styles.manifiesto} aria-labelledby="titulo-manifiesto">
        <div className={styles.contenido}>
          <h2 id="titulo-manifiesto" className={styles.manifiestoTitulo}>
            <span>La raqueta no</span>
            <span className={styles.manifiestoCorrido}>tiene la culpa.</span>
          </h2>
          <div className={styles.manifiestoTexto}>
            <p>
              Casi nunca. Traemos las marcas que ya conocés, en el modelo que te
              va, para que la única excusa que quede sea el viento.
            </p>
            <Link href="#categorias" className={styles.enlace}>
              Ver qué hay en el club
            </Link>
          </div>
        </div>
      </section>

      <section aria-labelledby="titulo-destacados">
        <div className={`${styles.contenido} ${styles.seccion}`}>
          <h2 id="titulo-destacados" className={styles.subtitulo}>
            Lo que más sale
          </h2>
          <GrillaProductos productos={destacados} columnas={3} />
        </div>
      </section>

      <section id="categorias" className={styles.anclaje} aria-labelledby="titulo-categorias">
        <div className={`${styles.contenido} ${styles.seccion}`}>
          <h2 id="titulo-categorias" className={styles.subtitulo}>
            Qué hay en el club
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
