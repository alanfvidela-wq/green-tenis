import Link from "next/link";
import ComboImagen from "./ComboImagen";
import { formatearPrecio } from "@/lib/formato";
import { comboTieneStock, comboTienePreciosDistintos, lineasDeCombo } from "@/lib/combos";
import base from "./TarjetaProducto.module.css";
import styles from "./TarjetaCombo.module.css";

// Celda de la vitrina para un combo: la misma que la de un producto (ver
// TarjetaProducto), con la imagen armada con las fotos de sus productos
// (ComboImagen). Debajo del nombre, lo que trae; a la derecha, lo que sale por
// separado tachado y el precio del combo, y abajo cuánto se ahorra. Si el
// precio cambia con las opciones, son los del «desde».
export default function TarjetaCombo({ combo, sizes }) {
  const disponible = comboTieneStock(combo);
  const desde = comboTienePreciosDistintos(combo);
  const lineas = lineasDeCombo(combo);

  return (
    <li className={base.celda} data-escalonar="">
      <Link href={`/combo/${combo.slug}`} className={base.enlace}>
        <div className={base.marco}>
          <ComboImagen
            combo={combo}
            alt={`${combo.nombre}: ${lineas.join(", ")}`}
            sizes={sizes}
            className={base.foto}
          />
        </div>
        <div className={base.fila}>
          <h3 className={base.nombre}>{combo.nombre}</h3>
          <div className={base.precios}>
            <p className={`${base.precio} ${styles.lista}`}>
              <span className="solo-lectores">Por separado: </span>
              <s>{formatearPrecio(combo.precioListaDesde)}</s>
            </p>
            <p className={base.precio}>
              <span className="solo-lectores">En el combo: </span>
              {desde && "desde "}
              {formatearPrecio(combo.precioDesde)}
            </p>
          </div>
        </div>
        <ul className={styles.incluye} aria-label="Incluye">
          {lineas.map((linea) => (
            <li key={linea}>{linea}</li>
          ))}
        </ul>
        <p className={styles.ahorro}>
          Ahorrás {desde && "desde "}
          {formatearPrecio(combo.ahorroDesde)}
        </p>
        <span className={`${base.barra} ${disponible ? "" : base.agotado}`}>
          {disponible ? "Ver combo" : "Sin stock"}
        </span>
      </Link>
    </li>
  );
}
