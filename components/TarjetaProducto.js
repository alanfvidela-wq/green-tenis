import Link from "next/link";
import FotoVitrina from "./FotoVitrina";
import { formatearPrecio } from "@/lib/formato";
import { tieneStock, tienePreciosDistintos } from "@/lib/productos";
import styles from "./TarjetaProducto.module.css";

// Celda de la vitrina (ver «Vitrina de productos» en DESIGN.md): la foto del
// producto sobre estudio; debajo, el nombre y el precio; y la barra de ancho
// completo («Ver producto», o «Sin stock» en negro). Toda la celda es un solo
// link. Va dentro de GrillaProductos.
export default function TarjetaProducto({ producto, sizes }) {
  const disponible = tieneStock(producto);

  return (
    <li className={styles.celda} data-escalonar="">
      <Link href={`/producto/${producto.slug}`} className={styles.enlace}>
        <div className={styles.marco}>
          <FotoVitrina
            foto={producto.fotos?.[0]}
            categoria={producto.categoria}
            sizes={sizes}
            className={styles.foto}
          />
        </div>
        <div className={styles.fila}>
          <h3 className={styles.nombre}>{producto.nombre}</h3>
          <p className={styles.precio}>
            {tienePreciosDistintos(producto) && "desde "}
            {formatearPrecio(producto.precioBase)}
          </p>
        </div>
        <span className={`${styles.barra} ${disponible ? "" : styles.agotado}`}>
          {disponible ? "Ver producto" : "Sin stock"}
        </span>
      </Link>
    </li>
  );
}
