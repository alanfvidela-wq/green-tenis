import GrillaProductos from "./GrillaProductos";
import styles from "./Kit.module.css";

function Grupo({ id, titulo, items }) {
  if (items.length === 0) return null;
  return (
    <section className={styles.grupo} aria-labelledby={id}>
      <h2 id={id} className={`display ${styles.titulo}`}>
        {titulo}
      </h2>
      <GrillaProductos
        productos={items.map((item) => item.producto)}
        motivos={Object.fromEntries(items.map((item) => [item.producto.id, item.motivo]))}
      />
    </section>
  );
}

// El kit del quiz (ver «Quiz» en DESIGN.md): las raquetas y, abajo, la cuerda
// y la pelota, con las celdas del catálogo (GrillaProductos) y, debajo del
// nombre, por qué encaja cada uno. Cada celda lleva a la página del producto,
// donde se elige todo. `items` son los de armarKit o getTuKit (lib/kits.js):
// { rol, producto, motivo, disponible }.
export default function Kit({ items }) {
  return (
    <div className={styles.kit}>
      <Grupo
        id="kit-raquetas"
        titulo="Raquetas"
        items={items.filter((item) => item.rol === "raqueta")}
      />
      <Grupo
        id="kit-cuerda-y-pelota"
        titulo="Cuerda y pelota"
        items={items.filter((item) => item.rol !== "raqueta")}
      />
    </div>
  );
}
