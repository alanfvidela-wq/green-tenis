import Image from "next/image";
import styles from "./FotoVitrina.module.css";

// Siluetas planas por categoría para el placeholder, dibujadas en la caja de
// producto (proporción 96:100). Tocan la caja por su lado más largo.
const SILUETAS = {
  mates: (
    <>
      <rect x="57" y="0" width="5" height="40" rx="2.5" transform="rotate(14 59 40)" />
      <rect x="27" y="30" width="42" height="14" rx="3" />
      <ellipse cx="48" cy="69" rx="31" ry="31" />
    </>
  ),
  bombillas: (
    <>
      <rect x="40" y="0" width="12" height="5" rx="2.5" />
      <rect x="43" y="2" width="6" height="82" rx="3" />
      <ellipse cx="46" cy="90" rx="9" ry="10" />
    </>
  ),
  termos: (
    <>
      <rect x="41" y="0" width="12" height="6" rx="2" />
      <rect x="34" y="4" width="28" height="14" rx="3" />
      <rect x="30" y="16" width="36" height="84" rx="4" />
    </>
  ),
  yerbas: (
    <>
      <path d="M18 8 30 0h36l12 8Z" />
      <rect x="18" y="8" width="60" height="92" />
    </>
  ),
  accesorios: (
    <>
      <rect x="42" y="6" width="12" height="8" rx="2" />
      <rect x="17" y="12" width="62" height="12" rx="3" />
      <rect x="20" y="22" width="56" height="78" rx="3" />
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
            {SILUETAS[categoria] ?? SILUETAS.accesorios}
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
