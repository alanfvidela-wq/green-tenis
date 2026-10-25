import styles from "./ChequeoExito.module.css";

// El círculo con la tilde de «Pago aprobado»: al cargar, el aro se dibuja,
// toma el color del acento y después se traza la tilde. Solo CSS. Es
// decorativo: el título ya dice que el pago se aprobó.
// Inspirado en Kinetics (kinetics.colorion.co) por Csaba Kissi:
// https://kinetics.colorion.co/effects/success-check/
export default function ChequeoExito() {
  return (
    <span className={styles.chequeo} aria-hidden="true">
      <svg viewBox="0 0 52 52" className={styles.dibujo}>
        <circle className={styles.aro} cx="26" cy="26" r="24" pathLength="1" />
        <path className={styles.tilde} d="M16 26.5 23 33.5 37 19" pathLength="1" />
      </svg>
    </span>
  );
}
