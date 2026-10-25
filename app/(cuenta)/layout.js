import LinkNav from "@/components/LinkNav";
import { salir } from "@/lib/cuenta";
import { getUsuario, usuarioEsAdmin } from "@/lib/sesion";
import styles from "../seccion.module.css";

// Las páginas de la cuenta (mis pedidos, cada pedido y la contraseña nueva):
// arriba, la navegación de la cuenta, con quién se ingresó y «Cerrar sesión».
// Al admin le suma el link a la administración. El layout solo muestra: cada
// página vuelve a verificar la sesión, porque un layout no se vuelve a
// renderizar al navegar entre sus páginas.
export default async function LayoutCuenta({ children }) {
  const usuario = await getUsuario();

  return (
    <>
      {usuario && (
        <div className={styles.barra}>
          <nav className={styles.nav} aria-label="Tu cuenta">
            <LinkNav href="/mis-pedidos" className={styles.link}>
              Mis pedidos
            </LinkNav>
            <LinkNav href="/nueva-contrasena" className={styles.link}>
              Cambiar contraseña
            </LinkNav>
            {usuarioEsAdmin(usuario) && (
              <LinkNav href="/admin" className={styles.link}>
                Administración
              </LinkNav>
            )}
          </nav>
          <div className={styles.extra}>
            <p>
              Ingresaste como <span className={styles.email}>{usuario.email}</span>
            </p>
            <form action={salir}>
              <button type="submit" className={`boton boton-secundario ${styles.salir}`}>
                Cerrar sesión
              </button>
            </form>
          </div>
        </div>
      )}
      {children}
    </>
  );
}
