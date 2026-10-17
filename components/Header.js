import Link from "next/link";
import { getCantidadCarrito } from "@/lib/carrito";
import { contar } from "@/lib/formato";
import { CATEGORIAS } from "@/lib/productos";
import CabeceraFlotante from "./CabeceraFlotante";
import Logo from "./Logo";
import styles from "./Header.module.css";

export default async function Header() {
  const cantidad = await getCantidadCarrito();

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

        <Link
          href="/carrito"
          className={styles.carrito}
          aria-label={`Carrito, ${contar(cantidad, "producto", "productos")}`}
        >
          Carrito ({cantidad})
        </Link>
      </div>
    </CabeceraFlotante>
  );
}
