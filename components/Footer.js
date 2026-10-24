import Link from "next/link";
import generadas from "@/lib/fotosGeneradas.json";
import { CATEGORIAS } from "@/lib/productos";
import Logo from "./Logo";
import styles from "./Footer.module.css";

// Banda negra: el wordmark gigante, los links de texto, los créditos de las
// fotos (solo si hay alguna, ver docs/FOTOS.md) y los legales
export default function Footer() {
  const { creditos } = generadas;

  return (
    <footer className={styles.footer}>
      <div className={styles.contenido}>
        <Logo className={styles.logo} />

        <nav aria-label="Secciones del pie">
          <ul className={styles.lista}>
            {CATEGORIAS.map((categoria) => (
              <li key={categoria.slug}>
                <Link href={`/categoria/${categoria.slug}`}>
                  {categoria.nombre}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/combos">Combos</Link>
            </li>
            <li>
              <Link href="/mis-pedidos">Mi cuenta</Link>
            </li>
          </ul>
        </nav>

        <div className={styles.legales}>
          {creditos.length > 0 && (
            <p>
              Fotos:{" "}
              {creditos.map((credito, i) => (
                <span key={credito.archivo}>
                  {i > 0 && ", "}
                  {credito.url ? <a href={credito.url}>{credito.autor}</a> : credito.autor} (
                  {credito.fuente})
                </span>
              ))}
              .
            </p>
          )}
          <p>
            Proyecto académico — Programación Web, ITBA. Precios ficticios. Las
            marcas son de sus dueños.
          </p>
        </div>
      </div>
    </footer>
  );
}
