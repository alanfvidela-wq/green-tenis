import Link from "next/link";
import styles from "./FiltrosListado.module.css";

// El orden y los filtros de un listado (ver «Orden y filtros» en DESIGN.md):
// un grupo por cosa que se elige, con sus opciones en píldoras. Cada opción es
// un link a la misma página con otros parámetros (los arma armarListado, en
// lib/listado.js): no hace falta JavaScript y la página no vuelve arriba.
export default function FiltrosListado({ grupos }) {
  return (
    <nav className={styles.filtros} aria-label="Ordenar y filtrar">
      {grupos.map(({ parametro, rotulo, opciones }) => (
        <div key={parametro} className={styles.grupo}>
          <p id={`filtro-${parametro}`} className={styles.rotulo}>
            {rotulo}
          </p>
          <ul className={styles.opciones} aria-labelledby={`filtro-${parametro}`}>
            {opciones.map(({ nombre, href, activa }) => (
              <li key={nombre}>
                <Link
                  href={href}
                  scroll={false}
                  className={`${styles.opcion} ${activa ? styles.activa : ""}`}
                  aria-current={activa ? "true" : undefined}
                >
                  {nombre}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}
