import Link from "next/link";
import { notFound } from "next/navigation";
import Acordeon from "@/components/Acordeon";
import ColumnaFija from "@/components/ColumnaFija";
import GaleriaFicha from "@/components/GaleriaFicha";
import GrillaProductos from "@/components/GrillaProductos";
import Medidores from "@/components/Medidores";
import PanelCompra from "@/components/PanelCompra";
import { getCombosConProducto } from "@/lib/combos";
import { ENVIOS_Y_DEVOLUCIONES } from "@/lib/envio";
import { getFicha } from "@/lib/fichas";
import { medidoresDe } from "@/lib/medidores";
import {
  getCategoria,
  getCuerdasCompatibles,
  getProductoPorSlug,
  getServicioEncordado,
  setDeCuerda,
} from "@/lib/productos";
import styles from "./ficha.module.css";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const producto = await getProductoPorSlug(slug);
  if (!producto) return { title: "Producto no encontrado" };
  return {
    title: `${producto.marca} ${producto.nombre}`,
    description: producto.descripcion,
  };
}

// La frase del panel: la primera oración de la descripción
function primeraOracion(texto) {
  return texto.match(/^.*?[.!?](?=\s|$)/)?.[0] ?? texto;
}

// El encordado que ofrece el panel de una raqueta: el servicio, el rango de
// tensión de la raqueta y las cuerdas compatibles que se venden en set de
// 12 m. null si falta algo (entonces no se ofrece).
function encordadoDe(producto, cuerdas, servicio) {
  const tensionKg = producto.ficha?.tensionKg;
  if (!servicio || !tensionKg) return null;
  const sets = cuerdas.flatMap((cuerda) => {
    const set = setDeCuerda(cuerda);
    if (!set) return [];
    return [
      {
        id: set.id,
        marca: cuerda.marca,
        nombre: cuerda.nombre,
        precio: set.precio,
        stock: set.stock,
        recomendada: cuerda.recomendada,
      },
    ];
  });
  return sets.length > 0 ? { servicio, tensionKg, cuerdas: sets } : null;
}

// La página de un producto (ver «Producto» en DESIGN.md): la galería a la
// izquierda y el panel de compra a la derecha, con los medidores y el
// acordeón; en mobile, una debajo de la otra. Al final, «Combina con»: las
// cuerdas compatibles (en las raquetas) y los combos que lo llevan.
export default async function PaginaProducto({ params }) {
  const { slug } = await params;
  const producto = await getProductoPorSlug(slug);
  if (!producto) notFound();

  const esRaqueta = producto.tipo === "raqueta";
  const [cuerdas, combos, servicio] = await Promise.all([
    esRaqueta ? getCuerdasCompatibles(producto.id) : [],
    getCombosConProducto(producto.slug),
    esRaqueta ? getServicioEncordado() : null,
  ]);

  const categoria = getCategoria(producto.categoria);
  const ficha = [["Marca", producto.marca], ...getFicha(producto)];
  const medidores = medidoresDe(producto);

  const secciones = [
    {
      titulo: "Descripción",
      abierta: true,
      contenido: <p className={styles.descripcion}>{producto.descripcion}</p>,
    },
    {
      titulo: "Ficha técnica",
      contenido: (
        <dl className={styles.filas}>
          {ficha.map(([dato, valor]) => (
            <div key={dato} className={styles.fila}>
              <dt>{dato}</dt>
              <dd>{valor}</dd>
            </div>
          ))}
        </dl>
      ),
    },
    {
      titulo: "Envíos y devoluciones",
      contenido: (
        <ul className={styles.lista}>
          {ENVIOS_Y_DEVOLUCIONES.map((texto) => (
            <li key={texto}>{texto}</li>
          ))}
        </ul>
      ),
    },
  ];

  return (
    <main>
      <nav className="migas" aria-label="Ubicación">
        <Link href="/">Inicio</Link>
        <span aria-hidden="true">/</span>
        <Link href={`/categoria/${categoria.slug}`}>{categoria.nombre}</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{producto.nombre}</span>
      </nav>

      <div className={styles.ficha}>
        <GaleriaFicha producto={producto} />

        <ColumnaFija className={styles.columnaPanel}>
          <PanelCompra
            producto={producto}
            frase={primeraOracion(producto.descripcion)}
            encordado={esRaqueta ? encordadoDe(producto, cuerdas, servicio) : null}
          />
          {medidores && <Medidores medidores={medidores} />}
          <Acordeon secciones={secciones} />
        </ColumnaFija>
      </div>

      {(cuerdas.length > 0 || combos.length > 0) && (
        <section className={styles.combina} aria-labelledby="titulo-combina">
          <h2 id="titulo-combina" className={`display ${styles.tituloCombina}`}>
            Combina con
          </h2>
          <GrillaProductos productos={cuerdas} combos={combos} />
        </section>
      )}
    </main>
  );
}
