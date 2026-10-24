import styles from "./Sticker.module.css";

// Sticker para etiquetas y estados (ver «Stickers» en DESIGN.md): borde de
// 2px en tinta, en mayúsculas, apenas girado. No es interactivo.
// - tono: «blanco» (informativo, pendiente), «lima» (activo, nuevo, pagado) o
//   «tinta» (sin stock, cancelado).
// - forma: «pildora» o «esquinas» (radio de 12px).
// - giro: en grados, entre −3 y 3. Derecho (0) no cuenta como decorativo.
export default function Sticker({
  tono = "blanco",
  forma = "pildora",
  giro = 0,
  className = "",
  children,
  ...resto
}) {
  return (
    <span
      className={`${styles.sticker} ${styles[tono]} ${forma === "esquinas" ? styles.esquinas : ""} ${className}`}
      style={giro ? { "--giro": `${giro}deg` } : undefined}
      {...resto}
    >
      {children}
    </span>
  );
}
