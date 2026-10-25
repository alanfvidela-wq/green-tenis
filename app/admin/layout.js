import LinkNav from "@/components/LinkNav";
import { exigirAdmin } from "@/lib/sesion";
import styles from "../seccion.module.css";

export const metadata = {
  title: { default: "Administración", template: "%s · Administración | green." },
  robots: { index: false, follow: false },
};

// La administración (ver «Administración» en docs/API.md): una barra hormigón
// con su navegación, Productos y Pedidos. La entrada ya la filtran el proxy y
// esta verificación, pero cada página la repite: un layout no se vuelve a
// renderizar al navegar entre sus páginas.
export default async function LayoutAdmin({ children }) {
  await exigirAdmin();

  return (
    <>
      <div className={`${styles.barra} ${styles.admin}`}>
        <div className={styles.caja}>
          <p className={styles.nombre}>Administración</p>
          <nav className={styles.nav} aria-label="Administración">
            <LinkNav href="/admin/productos" className={styles.link}>
              Productos
            </LinkNav>
            <LinkNav href="/admin/pedidos" className={styles.link}>
              Pedidos
            </LinkNav>
          </nav>
        </div>
      </div>
      {children}
    </>
  );
}
