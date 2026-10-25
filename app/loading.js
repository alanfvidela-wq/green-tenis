import styles from "./estados.module.css";

// Mientras llega la página: un bloque blanco de una pantalla (ver «Carga» en
// DESIGN.md)
export default function Loading() {
  return (
    <main className={styles.carga} aria-busy="true">
      <p className="solo-lectores" role="status">
        Cargando…
      </p>
    </main>
  );
}
