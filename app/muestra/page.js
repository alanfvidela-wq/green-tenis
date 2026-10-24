import { Archivo, Inter_Tight } from "next/font/google";
import Link from "next/link";
import Aparecer from "@/components/Aparecer";
import Estado from "@/components/Estado";
import FotoLugar from "@/components/FotoLugar";
import FotoVitrina from "@/components/FotoVitrina";
import Pelota from "@/components/Pelota";
import Raqueta, { ANCLAS, LIENZO } from "@/components/Raqueta";
import VideoFondo from "@/components/VideoFondo";
import { BAJADA_ANATOMIA, PASOS_ANATOMIA, TITULO_ANATOMIA } from "@/lib/anatomia";
import { LUGARES_FOTOS, lugaresDe, numeroDeLugar, orientacion } from "@/lib/fotos";
import generadas from "@/lib/fotosGeneradas.json";
import { contar, formatearPrecio } from "@/lib/formato";
import { CORTE_MOBILE, VIDEOS_HERO } from "@/lib/heroVideo";
import { CATEGORIAS, getProductos, tienePreciosDistintos, tieneStock } from "@/lib/productos";
import styles from "./muestra.module.css";

// Muestra del sistema nuevo (fase 1 del rediseño, ver DESIGN.md). Es una
// página de trabajo: se borra al terminar la fase 2. Archivo se carga solo acá
// hasta entonces, así no pesa en el resto del sitio. El header real se oculta
// en esta página: la cabecera del hero es la nueva. Un selector prueba los tres
// acentos en toda la página.

const archivo = Archivo({ subsets: ["latin"], axes: ["wdth"], variable: "--font-archivo" });
const texto = Inter_Tight({ subsets: ["latin"], weight: "400", variable: "--font-texto-nuevo" });

export const metadata = {
  title: "Muestra del sistema",
  robots: { index: false, follow: false },
};

// Los tres acentos: los mismos valores que muestra.module.css. «video» es el
// peor contraste del acento como texto sobre el video del hero, con la capa al
// 55%, medido en un cuadro cada medio segundo (el blanco da 5,58).
const ACENTOS = [
  { id: "verde", nombre: "Verde Wimbledon", corto: "Verde", hex: "#0f6e3c", video: 1.12, recomendado: true },
  { id: "naranja", nombre: "Naranja polvo", corto: "Naranja", hex: "#b3471c", video: 1.02 },
  { id: "azul", nombre: "Azul cancha", corto: "Azul", hex: "#1f5bbf", video: 1.13 },
];

function luminancia(hex) {
  const canal = (i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * canal(1) + 0.7152 * canal(3) + 0.0722 * canal(5);
}

function contraste(a, b) {
  const [x, y] = [luminancia(a), luminancia(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
}

const numero = (n) => n.toFixed(2).replace(".", ",");

// La vista previa de la anatomía: el marco activo, y tres partes nombradas
// desde afuera de la silueta (el marco a la izquierda; la garganta y el tapón a
// la derecha), así ninguna etiqueta pisa la raqueta, tampoco en 375px
const ACTIVA = "marco";
const PARTES_MUESTRA = [
  { id: "marco", lado: "izquierda" },
  { id: "garganta", lado: "derecha" },
  { id: "tapon", lado: "derecha" },
];

// Dónde va la celda de foto entre los productos de la vitrina
const POSICION_FOTO = 3;

function Wordmark({ className = "" }) {
  return (
    <span className={`${styles.wordmark} ${className}`}>
      green
      <Pelota className={styles.punto} />
    </span>
  );
}

// Maqueta de la cabecera (el header real es de la fase 2): el wordmark, links
// de texto y el carrito en píldora del acento. En la muestra ningún link está
// activo: no hay una página de categoría abierta.
function Cabecera({ sobreVideo = false, etiqueta }) {
  return (
    <div className={`${styles.cabecera} ${sobreVideo ? styles.sobreVideo : ""}`}>
      <Link href="/" className={styles.marca} aria-label="green.">
        <Wordmark />
      </Link>
      <nav aria-label={etiqueta} className={styles.cabeceraLinks}>
        {CATEGORIAS.map((categoria) => (
          <Link key={categoria.slug} href={`/categoria/${categoria.slug}`} className={styles.link}>
            {categoria.nombre}
          </Link>
        ))}
        <Link href="/combos" className={styles.link}>
          Combos
        </Link>
      </nav>
      <div className={styles.cabeceraAcciones}>
        <Link href="/mis-pedidos" className={styles.link}>
          Mi cuenta
        </Link>
        <Link href="/carrito" className={styles.carrito}>
          Carrito (0)
        </Link>
      </div>
    </div>
  );
}

// La celda de la vitrina: la foto del producto sobre estudio, debajo el nombre
// y el precio, y la barra de ancho completo. Toda la celda es un link.
function Celda({ producto }) {
  const disponible = tieneStock(producto);
  return (
    <li className={styles.celda}>
      <Link href={`/producto/${producto.slug}`} className={styles.enlace}>
        <div className={styles.foto}>
          <FotoVitrina
            foto={producto.fotos?.[0]}
            categoria={producto.categoria}
            sizes="(max-width: 999px) 50vw, 400px"
            className={styles.fotoVitrina}
          />
        </div>
        <div className={styles.filaNombre}>
          <h3 className={styles.nombre}>{producto.nombre}</h3>
          <span className={styles.precio}>
            {tienePreciosDistintos(producto) && "desde "}
            {formatearPrecio(producto.precioBase)}
          </span>
        </div>
        <span className={`${styles.barra} ${disponible ? "" : styles.barraAgotado}`}>
          {disponible ? "Ver producto" : "Sin stock"}
        </span>
      </Link>
    </li>
  );
}

// Una celda con una foto de gente jugando, del mismo tamaño, sin texto encima
function CeldaFoto({ lugar }) {
  return (
    <li className={`${styles.celda} ${styles.celdaFoto}`} aria-hidden="true">
      <Aparecer className={styles.llenar}>
        <FotoLugar
          lugar={lugar}
          foto={generadas.fotos[lugar.archivo]}
          sizes="(max-width: 999px) 50vw, 400px"
          llenar
        />
      </Aparecer>
    </li>
  );
}

// Un bloque grande de foto entre dos secciones
function Bloque({ lugar }) {
  return (
    <div className={`${styles.contenido} ${styles.bloque}`} aria-hidden="true">
      <Aparecer>
        <FotoLugar lugar={lugar} foto={generadas.fotos[lugar.archivo]} sizes="(max-width: 1280px) 100vw, 1216px" />
      </Aparecer>
    </div>
  );
}

export default async function PaginaMuestra() {
  const productos = await getProductos();
  const destacados = productos.filter((p) => p.destacado);
  const vitrina = (destacados.length >= 5 ? destacados : productos).slice(0, 5);
  const [celdaHome] = lugaresDe("home", "celda");
  const [bloqueUno, bloqueDos] = lugaresDe("home", "bloque");
  const activa = PASOS_ANATOMIA.find((paso) => paso.id === ACTIVA);
  const numeroActiva = PASOS_ANATOMIA.indexOf(activa) + 1;

  const celdas = vitrina.map((producto) => <Celda key={producto.id} producto={producto} />);
  celdas.splice(POSICION_FOTO, 0, <CeldaFoto key={celdaHome.archivo} lugar={celdaHome} />);

  return (
    <main className={`${archivo.variable} ${texto.variable} ${styles.muestra}`}>
      <h1 className="solo-lectores">Muestra del sistema de green.</h1>

      {/* El selector de acento, flotante: cambia el acento en toda la página */}
      <div className={styles.selector} role="radiogroup" aria-labelledby="selector-acento" data-selector>
        <span id="selector-acento" className={styles.selectorTitulo}>
          Acento
        </span>
        {ACENTOS.map((acento) => (
          <label key={acento.id} className={styles.opcion}>
            <input
              type="radio"
              name="acento"
              value={acento.id}
              defaultChecked={acento.recomendado}
              className="solo-lectores"
            />
            <span className={styles.opcionColor} style={{ background: acento.hex }} aria-hidden="true" />
            {acento.corto}
            {acento.recomendado && <span className="solo-lectores"> (recomendado)</span>}
          </label>
        ))}
      </div>

      {/* ---------- El hero: el video en un contenedor, con la cabecera ---------- */}
      <section className={styles.hero} aria-labelledby="muestra-hero">
        <div className={styles.heroCaja}>
          <picture className={styles.heroMedio}>
            <source media={CORTE_MOBILE} srcSet={VIDEOS_HERO.mobile.poster} />
            <img src={VIDEOS_HERO.desktop.poster} alt="" className={styles.heroPoster} />
          </picture>
          <VideoFondo className={styles.heroVideo} claseBoton={styles.pausa} claseIcono={styles.icono} />
          <div className={styles.heroCapa} aria-hidden="true" />

          <Cabecera sobreVideo etiqueta="Secciones (maqueta sobre el video)" />

          <div className={styles.heroTexto}>
            <h2 id="muestra-hero" className={`${styles.display} ${styles.heroTitulo}`}>
              Todo para jugar al tenis
            </h2>
            <p className={styles.heroFrase}>
              Raquetas, pelotas, cuerdas, grips y bolsos de las marcas que ya conocés.
            </p>
            <Link href="/categoria/raquetas" className={`${styles.boton} ${styles.botonHero}`}>
              Ver raquetas
            </Link>
          </div>
        </div>
      </section>

      {/* ---------- Lo que más sale: la vitrina, con una celda de foto ---------- */}
      <section className={styles.seccion} aria-labelledby="titulo-destacados">
        <div className={styles.contenido}>
          <h2 id="titulo-destacados" className={`${styles.display} ${styles.tituloSeccion}`}>
            Lo que más sale
          </h2>
          <ul className={styles.vitrina}>{celdas}</ul>
        </div>
      </section>

      {bloqueUno && <Bloque lugar={bloqueUno} />}

      {/* ---------- Anatomía: banda negra ---------- */}
      <section className={styles.anatomiaBanda} aria-labelledby="titulo-anatomia">
        <div className={`${styles.contenido} ${styles.anatomia}`}>
          <div className={styles.escena}>
            <span className={`${styles.display} ${styles.nombreGigante}`} aria-hidden="true">
              {activa.titulo}
            </span>
            <Raqueta
              estilo="inflada"
              encuadre="lienzo"
              prefijo="muestra"
              resaltadas={[ACTIVA]}
              className={styles.raqueta}
            />
            {PARTES_MUESTRA.map(({ id, lado }) => {
              const [x, y] = ANCLAS[id];
              const paso = PASOS_ANATOMIA.find((p) => p.id === id);
              return (
                <span
                  key={id}
                  className={`${styles.parte} ${lado === "izquierda" ? styles.parteIzquierda : ""}`}
                  style={{ left: `${(x / LIENZO.ancho) * 100}%`, top: `${(y / LIENZO.alto) * 100}%` }}
                  aria-hidden="true"
                >
                  <span className={styles.parteGuia} />
                  <span className={styles.parteNombre}>{paso.titulo}</span>
                </span>
              );
            })}
          </div>

          <div className={styles.anatomiaTexto}>
            <h2 id="titulo-anatomia" className={`${styles.display} ${styles.tituloAnatomia}`}>
              {TITULO_ANATOMIA}
            </h2>
            <p className={styles.entrada}>{BAJADA_ANATOMIA}</p>
            <div className={styles.paso}>
              <span className={styles.dato}>{String(numeroActiva).padStart(2, "0")}</span>
              <h3 className={`${styles.display} ${styles.pasoTitulo}`}>{activa.titulo}</h3>
              <p className={styles.pasoDato}>{activa.dato}</p>
              <p className={styles.texto}>{activa.frase}</p>
            </div>
          </div>
        </div>
      </section>

      {bloqueDos && <Bloque lugar={bloqueDos} />}

      {/* ---------- Categorías: sobre hormigón ---------- */}
      <section className={`${styles.seccion} ${styles.seccionHormigon}`} aria-labelledby="titulo-categorias">
        <div className={styles.contenido}>
          <h2 id="titulo-categorias" className={`${styles.display} ${styles.tituloSeccion}`}>
            Categorías
          </h2>
          <ul className={styles.categorias}>
            {CATEGORIAS.map((categoria) => (
              <li key={categoria.slug}>
                <Link href={`/categoria/${categoria.slug}`} className={styles.categoria}>
                  <span className={`${styles.display} ${styles.categoriaNombre}`}>{categoria.nombre}</span>
                  <span className={styles.categoriaDescripcion}>{categoria.descripcion}</span>
                  <span className={styles.categoriaPie}>
                    <span className={styles.dato}>
                      {contar(
                        productos.filter((p) => p.categoria === categoria.slug).length,
                        "producto",
                        "productos",
                      )}
                    </span>
                    <svg className={styles.flecha} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                      <path d="M4 12h15M13 6l6 6-6 6" />
                    </svg>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---------- Referencia: lo que no entra en las secciones ---------- */}
      <section className={styles.seccion} aria-labelledby="titulo-referencia">
        <div className={styles.contenido}>
          <h2 id="titulo-referencia" className={`${styles.display} ${styles.tituloSeccion}`}>
            Referencia
          </h2>

          <h3 className={styles.subtitulo}>Cabecera con scroll, sobre blanco</h3>
          <div className={styles.cabeceraBlanca}>
            <Cabecera etiqueta="Secciones (maqueta sobre blanco)" />
          </div>

          <h3 className={styles.subtitulo}>Botones</h3>
          <div className={styles.fila}>
            <button type="button" className={styles.boton}>
              Agregar al carrito
            </button>
            <button type="button" className={`${styles.boton} ${styles.secundario}`}>
              Cerrar sesión
            </button>
            <button type="button" className={styles.boton} disabled>
              Agregar al carrito
            </button>
          </div>

          <h3 className={styles.subtitulo}>Etiquetas de estado</h3>
          <div className={styles.fila}>
            <Estado tono="acento">Pagado</Estado>
            <Estado>Pendiente</Estado>
            <Estado>Pago en proceso</Estado>
            <Estado tono="negro">Sin stock</Estado>
            <Estado tono="negro">Cancelado</Estado>
            <Estado tono="negro">Vencido</Estado>
          </div>

          <h3 className={styles.subtitulo}>Campos</h3>
          <div className={styles.campos}>
            <div className={styles.campo}>
              <label htmlFor="muestra-nombre" className={styles.etiquetaCampo}>
                Nombre y apellido
              </label>
              <input id="muestra-nombre" type="text" className={styles.entradaCampo} autoComplete="off" />
            </div>
            <div className={styles.campo}>
              <label htmlFor="muestra-email" className={styles.etiquetaCampo}>
                Email
              </label>
              <input
                id="muestra-email"
                type="email"
                defaultValue="ana@"
                className={styles.entradaCampo}
                aria-invalid="true"
                aria-describedby="muestra-email-error"
                autoComplete="off"
              />
              <p id="muestra-email-error" className={styles.error}>
                Escribí un email completo, como nombre@dominio.com.
              </p>
            </div>
          </div>

          <h3 className={styles.subtitulo}>Los tres acentos</h3>
          <p className={styles.texto}>
            WCAG 2.1: 4,5 para texto, 3 para texto grande y para el borde de un componente. «Con blanco»
            vale en los dos sentidos: texto blanco sobre el acento, o el acento como texto sobre
            blanco. El acento como texto sobre el video no llega ni a 3: por eso el titular del hero va en blanco y el
            acento queda en el botón.
          </p>
          <div className={styles.tablaMarco} tabIndex={0} role="region" aria-label="Contrastes de los acentos">
            <table className={styles.tabla}>
              <thead>
                <tr>
                  <th scope="col">Acento</th>
                  <th scope="col">Con blanco</th>
                  <th scope="col">Contra el negro</th>
                  <th scope="col">Contra hormigón</th>
                  <th scope="col">Sobre el video</th>
                </tr>
              </thead>
              <tbody>
                {ACENTOS.map((acento) => (
                  <tr key={acento.id}>
                    <th scope="row">
                      <span className={styles.opcionColor} style={{ background: acento.hex }} aria-hidden="true" />
                      {acento.nombre} <span className={styles.dato}>{acento.hex.toUpperCase()}</span>
                    </th>
                    <td>{numero(contraste(acento.hex, "#ffffff"))}</td>
                    <td>{numero(contraste(acento.hex, "#000000"))}</td>
                    <td>{numero(contraste(acento.hex, "#e6e6e6"))}</td>
                    <td>{numero(acento.video)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3 className={styles.subtitulo}>Los 10 lugares de fotos</h3>
          <ol className={styles.lugares}>
            {LUGARES_FOTOS.map((lugar) => (
              <li key={lugar.archivo} className={styles.lugar}>
                <span className={styles.dato}>{numeroDeLugar(lugar.archivo)}</span>
                <span className={styles.lugarArchivo}>{lugar.archivo}</span>
                <span className={styles.dato}>
                  {lugar.tipo === "gente" ? "Gente" : "Objeto"}, {lugar.uso === "celda" ? "celda" : "bloque"},{" "}
                  {orientacion(lugar.proporcion)} {lugar.proporcion.join(":")}, {lugar.pagina}
                  {generadas.fotos[lugar.archivo] ? ", con foto" : ""}
                </span>
                <span className={styles.lugarDescripcion}>{lugar.descripcion}</span>
              </li>
            ))}
          </ol>
          {generadas.creditos.length > 0 && (
            <p className={styles.creditos}>
              Fotos:{" "}
              {generadas.creditos.map((credito, i) => (
                <span key={credito.archivo}>
                  {i > 0 && ", "}
                  {credito.url ? <a href={credito.url}>{credito.autor}</a> : credito.autor} (
                  {credito.fuente})
                </span>
              ))}
              .
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
