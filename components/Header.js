import { CATEGORIAS } from "@/lib/productos";
import BotonCarrito from "./BotonCarrito";
import CabeceraFlotante from "./CabeceraFlotante";
import LinkNav from "./LinkNav";
import Logo from "./Logo";
import styles from "./Header.module.css";

// El header (ver «Header» en DESIGN.md): el wordmark, los links de texto y, a
// la derecha, «Mi cuenta» y el carrito, la única píldora.
export default function Header() {
  return (
    <CabeceraFlotante className={styles.header}>
      <div className={styles.contenido}>
        <Logo className={styles.logo} />

        <nav className={styles.nav} aria-label="Secciones">
          {CATEGORIAS.map((categoria) => (
            <LinkNav
              key={categoria.slug}
              href={`/categoria/${categoria.slug}`}
              className={styles.link}
            >
              {categoria.nombre}
            </LinkNav>
          ))}
          <LinkNav href="/combos" tambien="/combo/" className={styles.link}>
            Combos
          </LinkNav>
          <LinkNav href="/quiz" className={styles.link}>
            Quiz
          </LinkNav>
        </nav>

        <div className={styles.acciones}>
          <LinkNav href="/mis-pedidos" className={styles.link}>
            Mi cuenta
          </LinkNav>
          <BotonCarrito className={styles.carrito} />
        </div>
      </div>
    </CabeceraFlotante>
  );
}
