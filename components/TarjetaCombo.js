import Link from "next/link";
import FotoVitrina from "./FotoVitrina";
import { formatearPrecio } from "@/lib/formato";
import { comboTieneStock, comboTienePreciosDistintos } from "@/lib/combos";
import styles from "./TarjetaProducto.module.css";

// Celda de la vitrina para un combo: la misma que la de un producto (ver
// TarjetaProducto), con cuántos productos trae y el descuento en la línea de
// la variante. Sin foto propia, el placeholder es el de su primer producto.
export default function TarjetaCombo({ combo, sizes }) {
  const disponible = comboTieneStock(combo);

  return (
    <li className={styles.celda}>
      <Link
        href={`/combo/${combo.slug}`}
        className={`${styles.producto} ${disponible ? "" : styles.agotado}`}
      >
        <FotoVitrina
          foto={combo.fotos[0]}
          categoria={combo.items[0].producto.categoria}
          sizes={sizes}
          className={styles.foto}
        />
        <div className={styles.rotulo}>
          <h3 className={styles.nombre}>{combo.nombre}</h3>
          <p className={styles.variante}>
            {combo.items.length} productos, {combo.descuentoPct} % menos
          </p>
        </div>
        <div className={styles.pie}>
          <p className={styles.precio}>
            {comboTienePreciosDistintos(combo) && "desde "}
            {formatearPrecio(combo.precioDesde)}
          </p>
          <span className={styles.comprar}>
            {disponible ? "Comprar" : "Sin stock"}
          </span>
        </div>
      </Link>
    </li>
  );
}
