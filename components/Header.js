import Link from "next/link";
import { CATEGORIAS } from "@/lib/productos";
import BotonCarrito from "./BotonCarrito";
import CabeceraFlotante from "./CabeceraFlotante";
import Logo from "./Logo";
import styles from "./Header.module.css";

export default function Header() {
  return (
    <CabeceraFlotante className={styles.header}>
      <div className={styles.contenido}>
        <Logo className={styles.logo} />

        <nav className={styles.nav} aria-label="Secciones">
          {CATEGORIAS.map((categoria) => (
            <Link key={categoria.slug} href={`/categoria/${categoria.slug}`}>
              {categoria.nombre}
            </Link>
          ))}
          <Link href="/combos">Combos</Link>
        </nav>

        <div className={styles.acciones}>
          <Link href="/mis-pedidos" className={styles.cuenta}>
            Mi cuenta
          </Link>
          <BotonCarrito className={styles.carrito} />
        </div>
      </div>
    </CabeceraFlotante>
  );
}
