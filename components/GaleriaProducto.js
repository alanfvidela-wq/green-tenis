import FotoVitrina from "./FotoVitrina";
import styles from "./GaleriaProducto.module.css";

// Galería de la página de producto, en las celdas de la vitrina: la primera
// vista grande y las demás de a dos debajo, sin texto encima. Mientras no
// haya fotos de estudio, una sola celda con el placeholder.
export default function GaleriaProducto({ producto }) {
  const fotos = producto.fotos?.length ? producto.fotos : [null];

  return (
    <div className={styles.galeria}>
      <div className={styles.vistas}>
        {fotos.map((foto, i) => (
        <div key={foto ?? i} className={styles.vista}>
          <FotoVitrina
            foto={foto}
            categoria={producto.categoria}
            alt={
              i === 0
                ? `${producto.nombre} ${producto.marca}`
                : `${producto.nombre} ${producto.marca}, vista ${i + 1}`
            }
            sizes={
              i === 0
                ? "(max-width: 859px) 100vw, 560px"
                : "(max-width: 859px) 50vw, 280px"
            }
            prioridad={i === 0}
          />
        </div>
        ))}
      </div>
    </div>
  );
}
