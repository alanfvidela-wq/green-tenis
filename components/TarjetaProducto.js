import Link from "next/link";
import FotoVitrina from "./FotoVitrina";
import { describirVariante, formatearPrecio } from "@/lib/formato";
import { tieneStock, tienePreciosDistintos } from "@/lib/productos";
import styles from "./TarjetaProducto.module.css";

// Celda de la vitrina: el producto sobre el fondo de estudio, el nombre chico
// arriba a la izquierda y abajo el precio y un «Comprar» discreto.
// Toda la celda es un solo link. Va dentro de GrillaProductos.
export default function TarjetaProducto({ producto, sizes }) {
  const disponible = tieneStock(producto);

  return (
    <li className={styles.celda}>
      <Link
        href={`/producto/${producto.slug}`}
        className={`${styles.producto} ${disponible ? "" : styles.agotado}`}
      >
        <FotoVitrina
          foto={producto.fotos?.[0]}
          categoria={producto.categoria}
          sizes={sizes}
          className={styles.foto}
        />
        <div className={styles.rotulo}>
          <h3 className={styles.nombre}>{producto.nombre}</h3>
          <p className={styles.variante}>{describirVariante(producto)}</p>
        </div>
        <div className={styles.pie}>
          <p className={styles.precio}>
            {tienePreciosDistintos(producto) && "desde "}
            {formatearPrecio(producto.precioBase)}
          </p>
          <span className={styles.comprar}>
            {disponible ? "Comprar" : "Sin stock"}
          </span>
        </div>
      </Link>
    </li>
  );
}
