import Link from "next/link";
import { CATEGORIAS } from "@/lib/productos";
import Logo from "./Logo";
import styles from "./Footer.module.css";

export default function Footer() {
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
          </ul>
        </nav>

        <p className={styles.legal}>
          Proyecto académico — Programación Web, ITBA. Precios ficticios. Las
          marcas son de sus dueños.
        </p>
      </div>
    </footer>
  );
}
