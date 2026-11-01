import Link from "next/link";
import generadas from "@/lib/fotosGeneradas.json";
import { CREDITOS_VIDEOS } from "@/lib/heroVideo";
import { CATEGORIAS } from "@/lib/productos";
import Logo from "./Logo";
import styles from "./Footer.module.css";

// Los clips del hero, agrupados por autor: «jugador, pique y derecha, de
// cottonbro studio (Pexels)», cada clip con el link a su página
function porAutor(creditos) {
  const grupos = [];
  for (const credito of creditos) {
    const clave = `${credito.autor}|${credito.fuente}`;
    let grupo = grupos.find((g) => g.clave === clave);
    if (!grupo) grupos.push((grupo = { clave, autor: credito.autor, fuente: credito.fuente, clips: [] }));
    grupo.clips.push(credito);
  }
  return grupos;
}

// Banda negra: el wordmark gigante, los links de texto, los créditos de las
// fotos y de los videos (solo si hay alguno, ver docs/FOTOS.md y MEDIOS.md) y
// los legales
export default function Footer() {
  const { creditos } = generadas;
  const videos = porAutor(CREDITOS_VIDEOS);

  return (
    <footer className={styles.footer}>
      <div className={styles.contenido}>
        <Logo className={styles.logo} />

        <nav aria-label="Secciones del pie">
          <ul className={styles.lista}>
            {CATEGORIAS.map((categoria) => (
              <li key={categoria.slug}>
                <Link href={`/categoria/${categoria.slug}`}>
                  {categoria.nombre}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/combos">Combos</Link>
            </li>
            <li>
              <Link href="/mis-pedidos">Mi cuenta</Link>
            </li>
          </ul>
        </nav>

        <div className={styles.legales}>
          {creditos.length > 0 && (
            <p>
              Fotos:{" "}
              {creditos.map((credito, i) => (
                <span key={credito.archivo}>
                  {i > 0 && ", "}
                  {credito.url ? <a href={credito.url}>{credito.autor}</a> : credito.autor} (
                  {credito.fuente})
                </span>
              ))}
              .
            </p>
          )}
          {videos.length > 0 && (
            <p>
              Videos:{" "}
              {videos.map((grupo, i) => (
                <span key={grupo.clave}>
                  {i > 0 && "; "}
                  {grupo.clips.map((clip, j) => (
                    <span key={clip.archivo}>
                      {j > 0 && (j === grupo.clips.length - 1 ? " y " : ", ")}
                      {clip.url ? <a href={clip.url}>{clip.clip}</a> : clip.clip}
                    </span>
                  ))}
                  , de {grupo.autor} ({grupo.fuente})
                </span>
              ))}
              .
            </p>
          )}
          <p>
            Proyecto académico — Programación Web, ITBA. Precios ficticios. Las
            marcas son de sus dueños.
          </p>
        </div>
      </div>
    </footer>
  );
}
