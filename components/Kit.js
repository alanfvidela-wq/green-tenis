import { tienePreciosDistintos } from "@/lib/productos";
import ProductoKit from "./ProductoKit";
import VitrinaEscalonada from "./VitrinaEscalonada";
import styles from "./Kit.module.css";

const SIZES = "(max-width: 699px) 100vw, (max-width: 999px) 50vw, 400px";

// Lo que necesita cada producto en el navegador, nada más
function aProps({ rol, producto, varianteId, motivo, disponible }) {
  return {
    rol,
    varianteId,
    motivo,
    disponible,
    producto: {
      slug: producto.slug,
      marca: producto.marca,
      nombre: producto.nombre,
      categoria: producto.categoria,
      foto: producto.fotos[0] ?? null,
      precioBase: producto.precioBase,
      preciosDistintos: tienePreciosDistintos(producto),
      variantes: producto.variantes.map(({ id, nombre, precio, stock }) => ({ id, nombre, precio, stock })),
    },
  };
}

function Grupo({ id, titulo, items }) {
  if (items.length === 0) return null;
  return (
    <section className={styles.grupo} aria-labelledby={id}>
      <h2 id={id} className={`display ${styles.titulo}`}>
        {titulo}
      </h2>
      <VitrinaEscalonada className={styles.grilla}>
        {items.map((item) => (
          <ProductoKit key={`${item.rol}-${item.producto.id}`} {...aProps(item)} sizes={SIZES} />
        ))}
      </VitrinaEscalonada>
    </section>
  );
}

// El kit del quiz (ver «Quiz» en DESIGN.md): las raquetas y, abajo, la cuerda
// y la pelota, en celdas como las de la vitrina. `items` son los de armarKit o
// getTuKit (lib/kits.js): { rol, producto, varianteId, motivo, disponible }.
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
