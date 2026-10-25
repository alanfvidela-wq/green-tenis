import Link from "next/link";
import styles from "./estados.module.css";

export const metadata = {
  title: "Página no encontrada",
};

export default function NotFound() {
  return (
    <main className={styles.estado}>
      <p className={`display ${styles.codigo}`}>404</p>
      <h1 className={styles.subtitulo}>Página no encontrada</h1>
      <p className={styles.texto}>Lo que buscás no está o ya no existe.</p>
      <div className={styles.acciones}>
        <Link href="/" className="boton">
          Volver al inicio
        </Link>
      </div>
    </main>
  );
}
