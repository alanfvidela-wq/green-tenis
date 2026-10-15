import Link from "next/link";
import { CATEGORIAS } from "@/lib/productos";
import Logo from "./Logo";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.contenido}>
        <Logo className={styles.logo} />
        <p className={styles.frase}>El que pierde paga las pelotas.</p>

        <nav aria-label="Categorías del pie">
          <ul className={styles.lista}>
            {CATEGORIAS.map((categoria) => (
              <li key={categoria.slug}>
                <Link href={`/categoria/${categoria.slug}`}>
                  {categoria.nombre}
                </Link>
              </li>
            ))}
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
