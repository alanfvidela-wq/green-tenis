import styles from "./Separador.module.css";

// Separador punteado entre bloques grandes (ver DESIGN.md): puntos de 4px cada
// 12px, del color del texto que lo rodea. Las filas de las tablas siguen con
// líneas de 1px.
export default function Separador({ className = "" }) {
  return <hr className={`${styles.separador} ${className}`} />;
}
