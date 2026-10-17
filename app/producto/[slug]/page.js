import Link from "next/link";
import { notFound } from "next/navigation";
import GaleriaProducto from "@/components/GaleriaProducto";
import SelectorVariante from "@/components/SelectorVariante";
import { getFicha } from "@/lib/fichas";
import { getCategoria, getProductoPorSlug, tienePreciosDistintos } from "@/lib/productos";
import styles from "../../detalle.module.css";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const producto = await getProductoPorSlug(slug);
  if (!producto) return { title: "Producto no encontrado" };
  return {
    title: `${producto.marca} ${producto.nombre}`,
    description: producto.descripcion,
  };
}

export default async function PaginaProducto({ params }) {
  const { slug } = await params;
  const producto = await getProductoPorSlug(slug);
  if (!producto) notFound();

  const categoria = getCategoria(producto.categoria);
  const ficha = [["Marca", producto.marca], ...getFicha(producto)];

  return (
    <main>
      <nav className="migas" aria-label="Ubicación">
        <Link href="/">Inicio</Link>
        <span aria-hidden="true">/</span>
        <Link href={`/categoria/${categoria.slug}`}>{categoria.nombre}</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{producto.nombre}</span>
      </nav>

      <div className={styles.detalle}>
        <GaleriaProducto producto={producto} />

        <div className={styles.info}>
          <p className={styles.marca}>{producto.marca}</p>
          <h1 className={styles.nombre}>{producto.nombre}</h1>
          <p className={styles.descripcion}>{producto.descripcion}</p>

          <section className={styles.ficha} aria-labelledby="titulo-ficha">
            <h2 id="titulo-ficha" className={styles.fichaTitulo}>
              Ficha técnica
            </h2>
            <dl>
              {ficha.map(([dato, valor]) => (
                <div key={dato} className={styles.fila}>
                  <dt>{dato}</dt>
                  <dd>{valor}</dd>
                </div>
              ))}
            </dl>
          </section>

          <SelectorVariante
            variantes={producto.variantes}
            elegir={producto.tipo === "raqueta" ? "grip y peso" : null}
            precioBase={producto.precioBase}
            preciosDistintos={tienePreciosDistintos(producto)}
          />
        </div>
      </div>
    </main>
  );
}
