import FotoVitrina from "./FotoVitrina";
import styles from "./GaleriaProducto.module.css";

// Galería de la página de producto, en las celdas de la vitrina: la primera
// vista grande y las demás de a dos debajo, sin texto encima. Mientras no
// haya fotos de estudio, una sola vista con el recorte.
export default function GaleriaProducto({ producto }) {
  const vistas = producto.fotos?.length
    ? producto.fotos.map((foto) => ({ foto }))
    : [{ recorte: producto.imagen }];

  return (
    <div className={styles.galeria}>
      {vistas.map((vista, i) => (
        <div key={vista.foto ?? vista.recorte ?? i} className={styles.vista}>
          <FotoVitrina
            foto={vista.foto}
            recorte={vista.recorte}
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
  );
}
