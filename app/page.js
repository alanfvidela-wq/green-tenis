import Link from "next/link";
import AnatomiaRaqueta from "@/components/AnatomiaRaqueta";
import GrillaProductos from "@/components/GrillaProductos";
import Aparecer from "@/components/Aparecer";
import FotoLugar from "@/components/FotoLugar";
import Hero from "@/components/Hero";
import {
  BAJADA_ANATOMIA,
  CIERRE_ANATOMIA,
  PASOS_ANATOMIA,
  TITULO_ANATOMIA,
} from "@/lib/anatomia";
import { lugaresDe } from "@/lib/fotos";
import generadas from "@/lib/fotosGeneradas.json";
import { contar } from "@/lib/formato";
import { CATEGORIAS, getProductos } from "@/lib/productos";
import styles from "./page.module.css";

export default async function Home() {
  const productos = await getProductos();
  // Cinco destacados y la celda de foto: dos filas llenas de tres
  const destacados = productos.filter((p) => p.destacado).slice(0, 5);
  const [celda] = lugaresDe("home", "celda");
  const [bloqueUno, bloqueDos] = lugaresDe("home", "bloque");
  const bloque = (lugar) =>
    lugar && (
      <div className={`${styles.contenido} ${styles.bloque}`} aria-hidden="true">
        <Aparecer>
          <FotoLugar lugar={lugar} foto={generadas.fotos[lugar.archivo]} sizes="(max-width: 1280px) 100vw, 1216px" />
        </Aparecer>
      </div>
    );

  return (
    <main className={styles.home}>
      <Hero />

      <section aria-labelledby="titulo-destacados">
        <div className={`${styles.contenido} ${styles.seccion}`}>
          <h2 id="titulo-destacados" className={`display ${styles.subtitulo}`}>
            Lo que más sale
          </h2>
          <GrillaProductos productos={destacados} foto={celda} />
        </div>
      </section>

      {bloque(bloqueUno)}

      {/* Anatomía de una raqueta: la banda negra, con la raqueta fija y los
          pasos con el scroll (ver DESIGN.md) */}
      <AnatomiaRaqueta
        titulo={TITULO_ANATOMIA}
        bajada={BAJADA_ANATOMIA}
        cierre={CIERRE_ANATOMIA}
        pasos={PASOS_ANATOMIA}
      />

      {bloque(bloqueDos)}

      <section aria-labelledby="titulo-categorias" className={styles.hormigon}>
        <div className={`${styles.contenido} ${styles.seccion}`}>
          <h2 id="titulo-categorias" className={`display ${styles.subtitulo}`}>
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
                    <span className={`display ${styles.categoriaNombre}`}>
                      {categoria.nombre}
                    </span>
                    <span className={styles.categoriaDescripcion}>
                      {categoria.descripcion}
                    </span>
                    <span className={styles.categoriaPie}>
                      <span className="dato">{contar(cantidad, "producto", "productos")}</span>
                      <svg className={styles.flecha} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                        <path d="M4 12h15M13 6l6 6-6 6" />
                      </svg>
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
