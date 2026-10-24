import styles from "./muestra.module.css";

// Mientras llegan los productos: un bloque del alto de la pantalla, del color
// del hero, así cuando aparece la página no se mueve nada (ni el footer). Lleva
// la clase de la muestra para que el header de hoy ya esté oculto.
export default function CargaMuestra() {
  return (
    <main className={styles.muestra} aria-busy="true">
      <div className={styles.carga}>
        <p className="solo-lectores">Cargando…</p>
      </div>
    </main>
  );
}
