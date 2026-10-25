import Link from "next/link";
import Carrito from "@/components/Carrito";
import styles from "../listado.module.css";

export const metadata = { title: "Carrito" };

export default function PaginaCarrito() {
  return (
    <main className={styles.pantalla}>
      <header className={styles.encabezado}>
        <nav className="migas" aria-label="Ubicación">
          <Link href="/">Inicio</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">Carrito</span>
        </nav>
        <h1 className={`display ${styles.titulo}`}>Carrito</h1>
      </header>

      <Carrito />
    </main>
  );
}
