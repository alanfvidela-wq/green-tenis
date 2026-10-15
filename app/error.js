"use client";

import { useEffect } from "react";
import Link from "next/link";
import styles from "./estados.module.css";

export default function Error({ error, retry }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className={styles.estado}>
      <p className={styles.codigo}>Error</p>
      <h1 className={styles.titulo}>Algo salió mal</h1>
      <p className={styles.texto}>
        Falló algo de nuestro lado. Probá de nuevo en un momento.
      </p>
      <div className={styles.acciones}>
        <button type="button" className="boton" onClick={() => retry()}>
          Reintentar
        </button>
        <Link href="/" className="boton boton-secundario">
          Volver al inicio
        </Link>
      </div>
    </main>
  );
}
