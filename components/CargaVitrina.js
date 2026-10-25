import styles from "@/app/estados.module.css";

// La carga de un listado: el lugar del título y la vitrina vacía, con las
// mismas celdas que van a tener los productos
export default function CargaVitrina() {
  return (
    <main className={styles.carga} aria-busy="true">
      <p className="solo-lectores" role="status">
        Cargando…
      </p>
      <div aria-hidden="true">
        <div className={styles.cargaTitulo} />
        <div className={styles.vitrina}>
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className={styles.hueco} />
          ))}
        </div>
      </div>
    </main>
  );
}
