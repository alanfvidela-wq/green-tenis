import Link from "next/link";
import { redirect } from "next/navigation";
import { salir } from "@/lib/cuenta";
import { getUsuario } from "@/lib/sesion";
import styles from "../listado.module.css";

export const metadata = { title: "Mis pedidos" };

export default async function PaginaMisPedidos() {
  // El proxy ya redirige sin sesión; esto es la verificación de verdad
  const usuario = await getUsuario();
  if (!usuario) redirect("/ingresar?siguiente=/mis-pedidos");

  return (
    <main>
      <header className={styles.encabezado}>
        <nav className="migas" aria-label="Ubicación">
          <Link href="/">Inicio</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">Mis pedidos</span>
        </nav>
        <h1 className={styles.titulo}>Mis pedidos</h1>
        <p className={styles.descripcion}>Ingresaste como {usuario.email}.</p>
        <form action={salir}>
          <button type="submit" className="boton boton-secundario">
            Cerrar sesión
          </button>
        </form>
      </header>

      <p className={styles.vacio}>Todavía no hiciste pedidos.</p>
    </main>
  );
}
