import Link from "next/link";
import GrillaProductos from "@/components/GrillaProductos";
import { getCombos } from "@/lib/combos";
import { contar } from "@/lib/formato";
import styles from "../listado.module.css";

// Qué es un combo, en una línea: la bajada del encabezado y la descripción
// de la página
const DESCRIPCION =
  "Raqueta, cuerda y pelotas elegidas para cada forma de jugar, o pelotas y grips para entrenar: juntos salen menos que comprando cada producto por separado.";

export const metadata = { title: "Combos", description: DESCRIPCION };

export default async function PaginaCombos() {
  const combos = await getCombos();

  return (
    <main>
      <header className={styles.encabezado}>
        <nav className="migas" aria-label="Ubicación">
          <Link href="/">Inicio</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">Combos</span>
        </nav>
        <h1 className={`display ${styles.titulo}`}>Combos</h1>
        <p className={styles.descripcion}>{DESCRIPCION}</p>
        <p className={`dato ${styles.cuenta}`}>
          {contar(combos.length, "combo", "combos")}
        </p>
      </header>

      {combos.length > 0 ? (
        <GrillaProductos combos={combos} />
      ) : (
        <p className={styles.vacio}>Por ahora no hay combos.</p>
      )}
    </main>
  );
}
