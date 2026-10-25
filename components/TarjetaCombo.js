import Link from "next/link";
import FotoVitrina from "./FotoVitrina";
import { formatearPrecio } from "@/lib/formato";
import { comboTieneStock, comboTienePreciosDistintos } from "@/lib/combos";
import styles from "./TarjetaProducto.module.css";

// Celda de la vitrina para un combo: la misma que la de un producto (ver
// TarjetaProducto), con el descuento debajo del precio. Sin foto propia, el
// placeholder es el de su primer producto.
export default function TarjetaCombo({ combo, sizes }) {
  const disponible = comboTieneStock(combo);

  return (
    <li className={styles.celda} data-escalonar="">
      <Link href={`/combo/${combo.slug}`} className={styles.enlace}>
        <div className={styles.marco}>
          <FotoVitrina
            foto={combo.fotos[0]}
            categoria={combo.items[0].producto.categoria}
            sizes={sizes}
            className={styles.foto}
          />
        </div>
        <div className={styles.fila}>
          <h3 className={styles.nombre}>{combo.nombre}</h3>
          <div className={styles.precios}>
            <p className={styles.precio}>
              {comboTienePreciosDistintos(combo) && "desde "}
              {formatearPrecio(combo.precioDesde)}
            </p>
            <p className={styles.precio}>{combo.descuentoPct} % menos</p>
          </div>
        </div>
        <span className={`${styles.barra} ${disponible ? "" : styles.agotado}`}>
          {disponible ? "Ver combo" : "Sin stock"}
        </span>
      </Link>
    </li>
  );
}
