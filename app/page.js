import Image from "next/image";
import Link from "next/link";
import Hero from "@/components/Hero";
import Marquesina from "@/components/Marquesina";
import GrillaProductos from "@/components/GrillaProductos";
import FotoProducto from "@/components/FotoProducto";
import { RamaYerba } from "@/components/Ilustraciones";
import { LEYENDAS, MOMENTOS } from "@/lib/home";
import { CATEGORIAS, getProductos } from "@/lib/productos";
import styles from "./page.module.css";

export default async function Home() {
  const productos = await getProductos();
  const destacados = productos.filter((p) => p.destacado);

  return (
    <main className={styles.home}>
      <Hero />

      <Marquesina items={LEYENDAS} />

      {/* Manifiesto: dos líneas gigantes, corridas, y una rama que se dibuja */}
      <section className={styles.manifiesto} aria-labelledby="titulo-manifiesto">
        <div className={styles.contenido}>
          <h2 id="titulo-manifiesto" className={styles.manifiestoTitulo}>
            <span>Un mate bien cebado</span>
            <span className={styles.manifiestoCorrido}>
              arregla casi todo.
            </span>
          </h2>
          <div className={styles.manifiestoPie}>
            <RamaYerba className={`rama ${styles.rama}`} />
            <div className={styles.manifiestoTexto}>
              <p>
                Las yerbas, mates y bombillas de siempre, de marcas que ya
                conocés. Elegís cada parte y te armamos el combo.
              </p>
              <Link href="#categorias" className={styles.enlace}>
                Ver qué hay en el almacén
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section
        className={`ola ${styles.fondoPapel}`}
        aria-labelledby="titulo-destacados"
      >
        <div className={`${styles.contenido} ${styles.seccion}`}>
          <h2 id="titulo-destacados" className={styles.subtitulo}>
            Lo que más sale
          </h2>
          <GrillaProductos productos={destacados} columnas={3} />
        </div>
      </section>

      {/* Una ronda para cada momento, como las notas de un recetario */}
      <section className={`ola ${styles.momentos}`} aria-labelledby="titulo-momentos">
        <div className={`${styles.contenido} ${styles.seccion}`}>
          <div className={styles.encabezado}>
            <h2 id="titulo-momentos" className={styles.subtitulo}>
              Para cada ronda
            </h2>
            <p className={styles.encabezadoFrase}>
              Hay mate para la mañana, para la ruta y para la plaza. Cada una
              pide lo suyo.
            </p>
          </div>
          <ul className={styles.momentosLista}>
            {MOMENTOS.map((momento) => (
              <li key={momento.titulo} className={styles.momento}>
                <Link
                  href={`/categoria/${momento.categoria}`}
                  className={styles.momentoEnlace}
                  data-categoria={momento.categoria}
                >
                  <div className={styles.momentoFoto}>
                    <Image
                      src={momento.foto}
                      alt={momento.alt}
                      fill
                      sizes="(max-width: 760px) 80vw, 380px"
                      className={styles.momentoImagen}
                    />
                  </div>
                  <h3 className={styles.momentoTitulo}>{momento.titulo}</h3>
                  <p className={styles.momentoTexto}>{momento.texto}</p>
                  <span className={styles.enlace}>{momento.accion}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section
        id="categorias"
        className={`ola ${styles.fondoPapel}`}
        aria-labelledby="titulo-categorias"
      >
        <div className={`${styles.contenido} ${styles.seccion}`}>
          <h2 id="titulo-categorias" className={styles.subtitulo}>
            Qué hay en el almacén
          </h2>
          <ul className={styles.categorias}>
            {CATEGORIAS.map((categoria) => {
              const cantidad = productos.filter(
                (p) => p.categoria === categoria.slug,
              ).length;
              return (
                <li key={categoria.slug} data-categoria={categoria.slug}>
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
                    <span className={styles.categoriaDibujo}>
                      <FotoProducto src={categoria.imagen} sizes="140px" />
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
