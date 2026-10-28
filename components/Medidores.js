import Aparecer from "./Aparecer";
import styles from "./Medidores.module.css";

// El semicírculo: el mismo trazo para el fondo y para el valor
const ARCO = "M 6 50 A 44 44 0 0 1 94 50";

// Potencia, Control y Confort de una raqueta o una cuerda (lib/medidores.js),
// cada uno en un semicírculo de 1 a 10: el fondo en hormigón y el valor en
// negro. El arco se dibuja hasta su valor al entrar en pantalla (Aparecer), y
// el número va en mono en el medio.
export default function Medidores({ medidores }) {
  return (
    <Aparecer>
      <ul className={styles.medidores} aria-label="Cómo juega, de 1 a 10">
        {medidores.map(({ clave, rotulo, valor }) => (
          <li key={clave} className={styles.medidor}>
            <div className={styles.dibujo}>
              <svg viewBox="0 0 100 54" aria-hidden="true">
                <path className={styles.fondo} d={ARCO} pathLength="1" />
                <path className={styles.arco} d={ARCO} pathLength="1" style={{ "--valor": valor / 10 }} />
              </svg>
              <span className={styles.valor} aria-hidden="true">
                {valor}
              </span>
            </div>
            <p className={styles.rotulo}>
              {rotulo}
              <span className="solo-lectores">: {valor} de 10</span>
            </p>
          </li>
        ))}
      </ul>
    </Aparecer>
  );
}
