import Link from "next/link";
import styles from "./estados.module.css";

export const metadata = {
  title: "Página no encontrada",
};

export default function NotFound() {
  return (
    <main className={styles.estado}>
      <p className={styles.codigo}>404</p>
      <h1 className={styles.titulo}>Se fue larga</h1>
      <p className={styles.texto}>
        Lo que buscás no está, o picó afuera. Volvé al inicio, que siempre hay
        otra pelota.
      </p>
      <div className={styles.acciones}>
        <Link href="/" className="boton">
          Volver al inicio
        </Link>
      </div>
    </main>
  );
}
