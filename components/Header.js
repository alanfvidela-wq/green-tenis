import { CATEGORIAS } from "@/lib/productos";
import BotonCarrito from "./BotonCarrito";
import CabeceraFlotante from "./CabeceraFlotante";
import LinkNav from "./LinkNav";
import Logo from "./Logo";
import MenuSecciones from "./MenuSecciones";
import styles from "./Header.module.css";

const SECCIONES = [
  ...CATEGORIAS.map((categoria) => ({
    href: `/categoria/${categoria.slug}`,
    nombre: categoria.nombre,
  })),
  { href: "/combos", tambien: "/combo/", nombre: "Combos" },
  { href: "/quiz", nombre: "Quiz" },
];

// El header (ver «Header» en DESIGN.md): el wordmark, los links de texto y, a
// la derecha, «Mi cuenta» y el carrito, la única píldora. En el celular, las
// secciones y «Mi cuenta» van en el menú (MenuSecciones).
export default function Header() {
  return (
    <CabeceraFlotante className={styles.header}>
      <div className={styles.contenido}>
        <Logo className={styles.logo} />

        <MenuSecciones secciones={SECCIONES} />

        <div className={styles.acciones}>
          <LinkNav href="/mis-pedidos" className={`${styles.link} ${styles.cuenta}`}>
            Mi cuenta
          </LinkNav>
          <BotonCarrito className={styles.carrito} />
        </div>
      </div>
    </CabeceraFlotante>
  );
}
