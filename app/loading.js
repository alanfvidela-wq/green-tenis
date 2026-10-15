import styles from "./estados.module.css";

export default function Loading() {
  return (
    <main className={styles.carga} aria-busy="true">
      <p className={styles.cargaTexto} role="status">
        Peloteando…
      </p>
      <div className={styles.marco} aria-hidden="true">
        <div className={styles.gondola}>
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className={styles.hueco} />
          ))}
        </div>
      </div>
    </main>
  );
}
