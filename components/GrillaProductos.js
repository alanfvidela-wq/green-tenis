import generadas from "@/lib/fotosGeneradas.json";
import Aparecer from "./Aparecer";
import FotoLugar from "./FotoLugar";
import TarjetaCombo from "./TarjetaCombo";
import TarjetaProducto from "./TarjetaProducto";
import styles from "./GrillaProductos.module.css";

// Dónde va la celda de foto entre los productos (la cuarta)
const POSICION_FOTO = 3;
const SIZES = "(max-width: 999px) 50vw, 400px";

// La vitrina (ver «Vitrina de productos» en DESIGN.md): celdas grandes, tres
// por fila desde 1000px y dos abajo. Muestra productos, combos o los dos (los
// combos primero) y, con `foto` (un lugar de lib/fotos.js), una celda con una
// foto de gente jugando, del mismo tamaño y sin texto encima.
export default function GrillaProductos({ productos = [], combos = [], foto }) {
  const celdas = [
    ...combos.map((combo) => <TarjetaCombo key={`combo-${combo.id}`} combo={combo} sizes={SIZES} />),
    ...productos.map((producto) => (
      <TarjetaProducto key={producto.id} producto={producto} sizes={SIZES} />
    )),
  ];
  if (foto) {
    celdas.splice(
      Math.min(POSICION_FOTO, celdas.length),
      0,
      <li key={`foto-${foto.archivo}`} className={styles.celdaFoto} aria-hidden="true">
        <Aparecer className={styles.llenar}>
          <FotoLugar lugar={foto} foto={generadas.fotos[foto.archivo]} sizes={SIZES} llenar />
        </Aparecer>
      </li>,
    );
  }

  return <ul className={styles.vitrina}>{celdas}</ul>;
}
