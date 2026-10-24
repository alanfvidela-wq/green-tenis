import styles from "./Superficie.module.css";

// Las marcas de agua: dibujos de línea en blanco, detrás del texto. Al ser más
// claras que la superficie, el texto en tinta gana contraste en vez de perderlo.
const MARCAS = {
  // Una cancha vista desde arriba (23,77 × 10,97 m, en cm): el rectángulo de
  // dobles, los laterales de singles, la red, las líneas de saque, la línea
  // central y las marcas del centro en el fondo
  lineas: (
    <svg viewBox="-20 -20 2417 1137" aria-hidden="true" focusable="false">
      <rect x="0" y="0" width="2377" height="1097" />
      <path d="M0 137H2377M0 960H2377M1188.5 0V1097M548.5 137V960M1828.5 137V960M548.5 548.5H1828.5M0 548.5H30M2347 548.5H2377" />
    </svg>
  ),
  // Una pelota gigante con sus dos costuras
  costuras: (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="11.25" />
      <path d="M4.2 3.9c3.6 3.3 3.6 12.9 0 16.2M19.8 3.9c-3.6 3.3-3.6 12.9 0 16.2" />
    </svg>
  ),
};

// Una sección sobre una superficie del sistema (ver «Paleta» en DESIGN.md).
// - tipo: «polvo», «cancha», «cesped» (llevan grano), «cal» o «tinta».
// - marca: «lineas» (líneas de cancha) o «costuras» (de pelota), opcional. Va
//   recortada por la sección y nunca en una pantalla con fotos inclinadas.
// Pone el color del texto y del foco que corresponde a la superficie.
export default function Superficie({
  tipo = "polvo",
  marca,
  as: Etiqueta = "section",
  className = "",
  children,
  ...resto
}) {
  return (
    <Etiqueta className={`${styles.superficie} ${styles[tipo]} ${className}`} {...resto}>
      {marca && <div className={`${styles.marca} ${styles[marca]}`}>{MARCAS[marca]}</div>}
      {children}
    </Etiqueta>
  );
}
