import FotoVitrina from "./FotoVitrina";
import styles from "./GaleriaProducto.module.css";

// Las vistas de un producto: sus fotos de estudio o, mientras no haya, una
// sola con el placeholder
function vistasDe(producto) {
  const fotos = producto.fotos?.length ? producto.fotos : [null];
  return fotos.map((foto, i) => ({
    foto,
    categoria: producto.categoria,
    alt:
      i === 0
        ? `${producto.nombre} ${producto.marca}`
        : `${producto.nombre} ${producto.marca}, vista ${i + 1}`,
  }));
}

// Galería de la página de producto (o de combo, que arma sus propias vistas),
// en las celdas de la vitrina: la primera vista grande y las demás de a dos
// debajo, sin texto encima.
export default function GaleriaProducto({ producto, vistas = vistasDe(producto) }) {
  return (
    <div className={styles.galeria}>
      <div className={styles.vistas}>
        {vistas.map((vista, i) => (
          <div key={i} className={styles.vista}>
            <FotoVitrina
              foto={vista.foto}
              categoria={vista.categoria}
              alt={vista.alt}
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
