import Image from "next/image";
import styles from "./FotoVitrina.module.css";

// Siluetas planas por categoría para el placeholder, dibujadas en la caja de
// producto (proporción 96:100), con el mismo encuadre que pide la spec de
// fotos. Tocan la caja por su lado más largo.
const SILUETAS = {
  // De frente y vertical: el marco de la cabeza, el puente y el mango
  raquetas: (
    <>
      <path
        fillRule="evenodd"
        d="M25 30a23 30 0 1 0 46 0a23 30 0 1 0-46 0ZM29 30a19 26 0 1 0 38 0a19 26 0 1 0-38 0Z"
      />
      <path d="M36 53 45 72h6l9-19-5 2-7 12-7-12Z" />
      <rect x="44.5" y="70" width="7" height="30" rx="1.5" />
    </>
  ),
  // El tubo cerrado, parado, con una pelota al lado
  pelotas: (
    <>
      <rect x="16" y="0" width="40" height="8" rx="3" />
      <rect x="18" y="6" width="36" height="94" rx="4" />
      <circle cx="70" cy="88" r="12" />
    </>
  ),
  // El rollo de cuerda
  "cuerdas-y-grips": (
    <path
      fillRule="evenodd"
      d="M6 50a42 42 0 1 0 84 0a42 42 0 1 0-84 0ZM22 50a26 26 0 1 0 52 0a26 26 0 1 0-52 0Z"
    />
  ),
  // El raquetero parado, con su manija
  bolsos: (
    <>
      <path d="M38 16V8q0-8 10-8t10 8v8h-5V9q0-4-5-4t-5 4v7Z" />
      <rect x="22" y="14" width="52" height="86" rx="18" />
    </>
  ),
};

// La foto de un producto en la vitrina (ver «Vitrina de productos» en
// DESIGN.md). Llena una celda 4:5 con fondo de estudio y position: relative.
// Con foto de estudio, la foto entera (ya trae el fondo). Sin ella, el
// placeholder neutro con la silueta de la categoría: los recortes no entran
// en la vitrina porque no tienen la misma luz.
export default function FotoVitrina({
  foto,
  categoria,
  alt = "",
  sizes,
  prioridad = false,
  className = "",
}) {
  if (!foto) {
    return (
      <div className={`${styles.foto} ${className}`}>
        <svg className={styles.caja} viewBox="0 0 96 100" aria-hidden="true">
          <g className={styles.silueta}>
            {SILUETAS[categoria] ?? SILUETAS.raquetas}
          </g>
        </svg>
      </div>
    );
  }

  return (
    <div className={`${styles.foto} ${className}`}>
      <Image
        src={foto}
        alt={alt}
        fill
        sizes={sizes}
        fetchPriority={prioridad ? "high" : undefined}
        loading={prioridad ? "eager" : undefined}
        className={styles.estudio}
      />
    </div>
  );
}
