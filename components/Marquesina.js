import Pelota from "./Pelota";
import styles from "./Marquesina.module.css";

// Cinta negra con las leyendas de la casa, que corre sola de derecha a
// izquierda, separadas por pelotitas. Van dos copias seguidas para que el loop
// no tenga corte; la segunda es solo decorativa.
export default function Marquesina({ items }) {
  const cinta = (oculta) => (
    <ul className={styles.cinta} aria-hidden={oculta || undefined}>
      {items.map((item) => (
        <li key={item}>
          {item}
          <Pelota className={styles.pelota} />
        </li>
      ))}
    </ul>
  );

  return (
    <div className={styles.marquesina} role="region" aria-label="Leyendas de la casa">
      {cinta(false)}
      {cinta(true)}
    </div>
  );
}
