import TarjetaProducto from "./TarjetaProducto";
import styles from "./GrillaProductos.module.css";

// La vitrina: un marco de 1px con radio y, adentro, celdas pegadas separadas
// por líneas de 1px. 2 columnas en mobile, 3 desde 700px y `columnas` (3 o 4)
// desde 1000px.
export default function GrillaProductos({ productos, columnas = 4 }) {
  const sizes =
    columnas === 4
      ? "(max-width: 699px) 50vw, (max-width: 999px) 33vw, 320px"
      : "(max-width: 699px) 50vw, 430px";

  return (
    <div className={styles.marco}>
      <ul className={`${styles.vitrina} ${columnas === 4 ? styles.cuatro : ""}`}>
        {productos.map((producto) => (
          <TarjetaProducto key={producto.id} producto={producto} sizes={sizes} />
        ))}
      </ul>
    </div>
  );
}
