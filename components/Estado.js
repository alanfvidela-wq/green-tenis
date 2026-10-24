import styles from "./Estado.module.css";

// Etiqueta de estado (ver «Etiquetas de estado» en DESIGN.md): texto chico en
// mayúsculas sobre un fondo plano, en píldora y sin borde. Solo para estados,
// nunca de adorno. El texto siempre dice el estado: el color no es la única
// señal.
// - tono: «acento» (pagado), «neutro» (pendiente, pago en proceso) o «negro»
//   (sin stock, cancelado, vencido).
export default function Estado({ tono = "neutro", className = "", children }) {
  return <span className={`${styles.estado} ${styles[tono]} ${className}`}>{children}</span>;
}
