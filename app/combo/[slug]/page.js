import Link from "next/link";
import { notFound } from "next/navigation";
import GaleriaProducto from "@/components/GaleriaProducto";
import SelectorCombo from "@/components/SelectorCombo";
import { comboTienePreciosDistintos, getComboPorSlug } from "@/lib/combos";
import styles from "../../detalle.module.css";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const combo = await getComboPorSlug(slug);
  if (!combo) return { title: "Combo no encontrado" };
  return { title: combo.nombre, description: combo.descripcion };
}

export default async function PaginaCombo({ params }) {
  const { slug } = await params;
  const combo = await getComboPorSlug(slug);
  if (!combo) notFound();

  // La galería: las fotos del combo, si tiene, y la primera de cada producto
  const vistas = [
    ...combo.fotos.map((foto, i) => ({
      foto,
      categoria: combo.items[0].producto.categoria,
      alt: i === 0 ? combo.nombre : `${combo.nombre}, vista ${i + 1}`,
    })),
    ...combo.items.map(({ producto }) => ({
      foto: producto.fotos[0] ?? null,
      categoria: producto.categoria,
      alt: `${producto.nombre} ${producto.marca}`,
    })),
  ];

  return (
    <main>
      <nav className="migas" aria-label="Ubicación">
        <Link href="/">Inicio</Link>
        <span aria-hidden="true">/</span>
        <Link href="/combos">Combos</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{combo.nombre}</span>
      </nav>

      <div className={styles.detalle}>
        <GaleriaProducto vistas={vistas} />

        <div className={styles.info}>
          <p className={styles.marca}>Combo</p>
          <h1 className={styles.nombre}>{combo.nombre}</h1>
          <p className={styles.descripcion}>{combo.descripcion}</p>

          <section className={styles.ficha} aria-labelledby="titulo-ficha">
            <h2 id="titulo-ficha" className={styles.fichaTitulo}>
              Qué trae
            </h2>
            <dl>
              {combo.items.map((item) => (
                <div key={item.id} className={styles.fila}>
                  <dt>
                    <Link href={`/producto/${item.producto.slug}`} className={styles.enlace}>
                      {item.producto.marca} {item.producto.nombre}
                    </Link>
                  </dt>
                  <dd>
                    {item.cantidad} × {item.elige ? "a elección" : item.variantes[0].nombre}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          <SelectorCombo
            comboId={combo.id}
            items={combo.items}
            precios={combo.precios}
            descuentoPct={combo.descuentoPct}
            precioDesde={combo.precioDesde}
            preciosDistintos={comboTienePreciosDistintos(combo)}
          />
        </div>
      </div>
    </main>
  );
}
