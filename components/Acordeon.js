import styles from "./Acordeon.module.css";

// Secciones que se abren y cierran (Descripción, Ficha técnica, Envíos y
// devoluciones), con <details>: andan sin JavaScript y con el teclado. El
// signo pasa de + a − (la barra vertical se achica) y el contenido baja 8px y
// aparece al abrir.
export default function Acordeon({ secciones }) {
  return (
    <div className={styles.acordeon}>
      {secciones.map(({ titulo, abierta = false, contenido }) => (
        <details key={titulo} className={styles.seccion} open={abierta}>
          <summary className={styles.titulo}>
            {titulo}
            <span className={styles.signo} aria-hidden="true" />
          </summary>
          <div className={styles.contenido}>{contenido}</div>
        </details>
      ))}
    </div>
  );
}
