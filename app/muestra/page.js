import { Archivo, Inter_Tight } from "next/font/google";
import Link from "next/link";
import AgregarDirecto from "@/components/AgregarDirecto";
import BandaFotos from "@/components/BandaFotos";
import Estado from "@/components/Estado";
import FotoVitrina from "@/components/FotoVitrina";
import Pelota from "@/components/Pelota";
import Raqueta, { ANCLAS, LIENZO } from "@/components/Raqueta";
import Superficie from "@/components/Superficie";
import VideoFondo from "@/components/VideoFondo";
import { BAJADA_ANATOMIA, PASOS_ANATOMIA, TITULO_ANATOMIA } from "@/lib/anatomia";
import { LUGARES_FOTOS, numeroDeLugar, orientacion } from "@/lib/fotos";
import generadas from "@/lib/fotosGeneradas.json";
import { contar, formatearPrecio } from "@/lib/formato";
import { CORTE_MOBILE, VIDEOS_HERO } from "@/lib/heroVideo";
import { CATEGORIAS, getProductos, tienePreciosDistintos, tieneStock } from "@/lib/productos";
import styles from "./muestra.module.css";

// Muestra del sistema nuevo (fase 1 del rediseño, ver DESIGN.md). Es una
// página de trabajo: se borra al terminar la fase 2. Archivo y el Inter Tight
// 600 se cargan solo acá hasta entonces, así no pesan en el resto del sitio.
// El header real se oculta en esta página: la cabecera del hero es la nueva.

const archivo = Archivo({ subsets: ["latin"], axes: ["wdth"], variable: "--font-archivo" });
const texto = Inter_Tight({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-texto-nuevo",
});

export const metadata = {
  title: "Muestra del sistema",
  robots: { index: false, follow: false },
};

// Los mismos valores que app/globals.css: la tabla se calcula con ellos
const FONDOS = [
  { token: "--polvo", nombre: "Polvo de ladrillo", hex: "#d46c3f", grano: true, textos: ["tinta"] },
  { token: "--cancha", nombre: "Cancha rápida", hex: "#5a8fe6", grano: true, textos: ["tinta"] },
  { token: "--cesped", nombre: "Césped", hex: "#5a9e4a", grano: true, textos: ["tinta"] },
  { token: "--cal", nombre: "Cal", hex: "#fbf6ee", textos: ["tinta", "grafito"] },
  { token: "--blanco", nombre: "Blanco", hex: "#ffffff", textos: ["tinta", "grafito"] },
  { token: "--estudio", nombre: "Estudio", hex: "#f4f5f2", textos: ["tinta", "grafito"] },
  { token: "--hormigon", nombre: "Hormigón", hex: "#e6e6e6", textos: ["tinta", "grafito"] },
  { token: "--tinta", nombre: "Tinta", hex: "#1a1411", textos: ["blanco", "lima"] },
  { token: "--lima", nombre: "Lima", hex: "#dcf900", textos: ["tinta"] },
];

const TEXTOS = [
  { id: "tinta", nombre: "Tinta", hex: "#1a1411" },
  { id: "grafito", nombre: "Grafito", hex: "#4a403a" },
  { id: "blanco", nombre: "Blanco", hex: "#ffffff" },
  { id: "lima", nombre: "Lima", hex: "#dcf900" },
];

// El grano al 50% mezcla cada píxel con hasta un 7,8% de negro o de blanco.
// El peor caso es el que acerca el fondo al color del texto.
const ALFA_GRANO = (0.5 * 40) / 255;

// grano: -1 oscurece el fondo, 1 lo aclara, 0 lo deja como está
function luminancia(hex, grano = 0) {
  const canal = (i) => {
    let v = parseInt(hex.slice(i, i + 2), 16);
    if (grano < 0) v *= 1 - ALFA_GRANO;
    if (grano > 0) v = v * (1 - ALFA_GRANO) + 255 * ALFA_GRANO;
    const c = v / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * canal(1) + 0.7152 * canal(3) + 0.0722 * canal(5);
}

function contraste(a, b) {
  const [x, y] = [a, b].sort((m, n) => n - m);
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

// La grilla editorial: en cada tanda de seis, la primera y la última son
// grandes (medio ancho) y las otras cuatro, chicas (un cuarto)
const esGrande = (i) => i % 6 === 0 || i % 6 === 5;

function Wordmark({ className = "" }) {
  return (
    <span className={`${styles.wordmark} ${className}`}>
      green
      <Pelota className={styles.punto} />
    </span>
  );
}

// Maqueta de la cabecera (el header real es de la fase 2): el wordmark, links
// de texto y solo el carrito en píldora. En la muestra ningún link está activo:
// no hay una página de categoría abierta.
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

// La celda nueva de la vitrina: la foto sola sobre estudio y, debajo, el
// nombre, el precio y el «+». Toda la celda es un link al producto; con una
// sola variante, el «+» la agrega directo.
function Celda({ producto, grande }) {
  const disponible = tieneStock(producto);
  const unica = producto.variantes.length === 1 ? producto.variantes[0] : null;
  const directo = disponible && unica;

  return (
    <li
      className={`${styles.celda} ${grande ? styles.grande : ""} ${disponible ? "" : styles.agotado} ${directo ? styles.conDirecto : ""}`}
    >
      <Link href={`/producto/${producto.slug}`} className={styles.enlace}>
        <div className={styles.foto}>
          <FotoVitrina
            foto={producto.fotos?.[0]}
            categoria={producto.categoria}
            sizes={grande ? "(max-width: 959px) 50vw, 640px" : "(max-width: 959px) 50vw, 320px"}
            className={styles.fotoVitrina}
          />
        </div>
        <div className={styles.pie}>
          <div className={styles.pieTexto}>
            <h3 className={styles.nombre}>{producto.nombre}</h3>
            <span className={styles.precio}>
              {tienePreciosDistintos(producto) && "desde "}
              {formatearPrecio(producto.precioBase)}
            </span>
          </div>
          {!disponible && <Estado tono="tinta">Sin stock</Estado>}
          {disponible && !directo && (
            <span className={styles.mas} aria-hidden="true">
              <svg viewBox="0 0 24 24" focusable="false">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </span>
          )}
        </div>
      </Link>
      {directo && (
        <AgregarDirecto
          varianteId={unica.id}
          nombre={producto.nombre}
          className={`${styles.mas} ${styles.masDirecto}`}
        />
      )}
    </li>
  );
}

export default async function PaginaMuestra() {
  const productos = await getProductos();
  const destacados = productos.filter((p) => p.destacado);
  const vitrina = (destacados.length >= 6 ? destacados : productos).slice(0, 6);
  const lugaresBanda = LUGARES_FOTOS.filter((lugar) => lugar.banda === 1);
  const activa = PASOS_ANATOMIA.find((paso) => paso.id === ACTIVA);
  const numeroActiva = PASOS_ANATOMIA.indexOf(activa) + 1;
  const demo = productos.find((p) => tieneStock(p));

  return (
    <main className={`${archivo.variable} ${texto.variable} ${styles.muestra}`}>
      <h1 className="solo-lectores">Muestra del sistema de green.</h1>

      {/* ---------- El hero real, con la cabecera nueva encima ---------- */}
      <section className={styles.hero} aria-labelledby="muestra-hero">
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
      </section>

      {/* ---------- Lo que más sale: polvo, con la vitrina editorial ---------- */}
      <Superficie tipo="polvo" marca="lineas" className={styles.seccion} aria-labelledby="titulo-destacados">
        <div className={styles.contenido}>
          <h2 id="titulo-destacados" className={`${styles.display} ${styles.tituloSeccion}`}>
            Lo que más sale
          </h2>
          <ul className={styles.vitrina}>
            {vitrina.map((producto, i) => (
              <Celda key={producto.id} producto={producto} grande={esGrande(i)} />
            ))}
          </ul>
        </div>
      </Superficie>

      {/* ---------- Banda de fotos 1: sobre polvo, sin marca de agua ---------- */}
      <Superficie tipo="polvo" as="div">
        <BandaFotos lugares={lugaresBanda} />
      </Superficie>

      {/* ---------- Cancha rápida: la anatomía ---------- */}
      <Superficie tipo="cancha" className={styles.cancha} aria-labelledby="titulo-cancha">
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
            <h2 id="titulo-cancha" className={`${styles.display} ${styles.tituloAnatomia}`}>
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
      </Superficie>

      {/* ---------- Césped: las categorías ---------- */}
      <Superficie tipo="cesped" marca="costuras" className={styles.seccion} aria-labelledby="titulo-cesped">
        <div className={styles.contenido}>
          <h2 id="titulo-cesped" className={`${styles.display} ${styles.tituloSeccion}`}>
            Categorías
          </h2>
          <ul className={styles.categorias}>
            {CATEGORIAS.map((categoria) => (
              <li key={categoria.slug}>
                <Link href={`/categoria/${categoria.slug}`} className={styles.categoria}>
                  <span className={`${styles.display} ${styles.categoriaNombre}`}>
                    {categoria.nombre}
                  </span>
                  <span className={styles.categoriaDescripcion}>{categoria.descripcion}</span>
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
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Superficie>

      {/* ---------- Referencia: lo que no entra en las secciones ---------- */}
      <Superficie tipo="cal" className={styles.seccion} aria-labelledby="titulo-referencia">
        <div className={styles.contenido}>
          <h2 id="titulo-referencia" className={`${styles.display} ${styles.tituloSeccion}`}>
            Referencia
          </h2>

          <h3 className={styles.subtitulo}>Cabecera con scroll, sobre cal</h3>
          <div className={styles.cabeceraCal}>
            <Cabecera etiqueta="Secciones (maqueta sobre cal)" />
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
            <Estado tono="lima">Pagado</Estado>
            <Estado>Pendiente</Estado>
            <Estado>Pago en proceso</Estado>
            <Estado tono="tinta">Sin stock</Estado>
            <Estado tono="tinta">Cancelado</Estado>
            <Estado tono="tinta">Vencido</Estado>
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

          {demo && (
            <>
              <h3 className={styles.subtitulo}>El «+» que agrega directo</h3>
              <div className={styles.demoMas}>
                <AgregarDirecto
                  varianteId={demo.variantes[0].id}
                  nombre={demo.nombre}
                  className={`${styles.mas} ${styles.masDirecto}`}
                />
                <p className={styles.texto}>
                  En la vitrina va solo en productos de una variante (hoy no hay ninguno). Este ejemplo
                  agrega de verdad la primera variante de {demo.nombre} al carrito.
                </p>
              </div>
            </>
          )}

          <h3 className={styles.subtitulo}>Contrastes</h3>
          <p className={styles.texto}>
            WCAG 2.1: 4,5 para texto, 3 para texto grande. Sobre las superficies con grano, el número
            de abajo es el peor píxel. En negrita, las combinaciones permitidas.
          </p>
          <div className={styles.tablaMarco} tabIndex={0} role="region" aria-label="Tabla de contrastes">
            <table className={styles.tabla}>
              <thead>
                <tr>
                  <th scope="col">Fondo</th>
                  {TEXTOS.map((t) => (
                    <th key={t.id} scope="col">
                      {t.nombre}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {FONDOS.map((fondo) => (
                  <tr key={fondo.token}>
                    <th scope="row">
                      <span className={styles.muestraColor} style={{ background: fondo.hex }} />
                      {fondo.nombre}
                    </th>
                    {TEXTOS.map((t) => {
                      const base = contraste(luminancia(fondo.hex), luminancia(t.hex));
                      const claro = luminancia(t.hex) > luminancia(fondo.hex);
                      const peor = fondo.grano
                        ? contraste(luminancia(fondo.hex, claro ? 1 : -1), luminancia(t.hex))
                        : null;
                      const permitida = fondo.textos.includes(t.id);
                      return (
                        <td key={t.id} className={permitida ? styles.permitida : styles.noPermitida}>
                          {numero(base)}
                          {peor !== null && <span className={styles.peor}>{numero(peor)}</span>}
                          <span className="solo-lectores">{permitida ? ", permitida" : ", no se usa"}</span>
                        </td>
                      );
                    })}
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
                  {lugar.tipo === "gente" ? "Gente" : "Objeto"}, {orientacion(lugar.proporcion)}{" "}
                  {lugar.proporcion.join(":")}, banda {lugar.banda}
                  {lugar.mobile ? ", también en mobile" : ""}
                  {generadas.fotos[lugar.archivo] ? ", con foto" : ""}
                </span>
                <span className={styles.lugarDescripcion}>
                  «{lugar.pie}». {lugar.descripcion}
                </span>
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
      </Superficie>
    </main>
  );
}
