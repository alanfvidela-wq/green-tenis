import styles from "./OpcionesVariante.module.css";

// Si alcanza el stock de una variante para `cantidad` unidades. stock null:
// no se controla (servicios).
export function alcanza(variante, cantidad = 1) {
  return variante.stock === null || variante.stock >= cantidad;
}

function textoStock(stock) {
  if (stock === null) return "En stock";
  if (stock === 0) return "Sin stock";
  if (stock === 1) return "¡Queda 1!";
  if (stock <= 3) return `¡Quedan ${stock}!`;
  return "En stock";
}

// Las opciones de un producto en píldoras: la elegida en el acento y las que no
// alcanzan, en hormigón. Va dentro de SelectorVariante y de SelectorCombo, que
// son los que guardan la elección.
export default function OpcionesVariante({
  leyenda,
  variantes,
  elegidaId,
  onElegir,
  cantidad = 1,
}) {
  return (
    <fieldset className={styles.fieldset}>
      <legend className={styles.legend}>{leyenda}</legend>
      <div className={styles.opciones}>
        {variantes.map((variante) => {
          const sinStock = !alcanza(variante, cantidad);
          const activa = variante.id === elegidaId;
          const pocas = variante.stock > 0 && variante.stock <= 3;
          return (
            <button
              key={variante.id}
              type="button"
              className={`${styles.opcion} ${activa ? styles.activa : ""}`}
              disabled={sinStock}
              aria-pressed={activa}
              onClick={() => onElegir(variante.id)}
            >
              <span className={styles.opcionNombre}>{variante.nombre}</span>
              <span className={`${styles.opcionStock} ${pocas ? styles.pocas : ""}`}>
                {textoStock(variante.stock)}
              </span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
