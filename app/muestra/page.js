import { Anton, Archivo, Big_Shoulders, Inter_Tight } from "next/font/google";
import Link from "next/link";
import BandaFotos from "@/components/BandaFotos";
import FotoVitrina from "@/components/FotoVitrina";
import Pelota from "@/components/Pelota";
import Raqueta, { ANCLAS, LIENZO } from "@/components/Raqueta";
import Separador from "@/components/Separador";
import Sticker from "@/components/Sticker";
import Superficie from "@/components/Superficie";
import VideoFondo from "@/components/VideoFondo";
import { BAJADA_ANATOMIA, PASOS_ANATOMIA, TITULO_ANATOMIA } from "@/lib/anatomia";
import { LUGARES_FOTOS, numeroDeLugar, orientacion } from "@/lib/fotos";
import generadas from "@/lib/fotosGeneradas.json";
import { contar, describirVariante, formatearPrecio } from "@/lib/formato";
import { CORTE_MOBILE, VIDEOS_HERO } from "@/lib/heroVideo";
import { CATEGORIAS, getProductos, tienePreciosDistintos, tieneStock } from "@/lib/productos";
import styles from "./muestra.module.css";

// Muestra del sistema nuevo (fase 1 del rediseño, ver DESIGN.md). Es una
// página de trabajo: se borra al terminar la fase 2. Las tres displays y el
// Inter Tight 600 se cargan solo acá, así no pesan en el resto del sitio.

const archivo = Archivo({ subsets: ["latin"], axes: ["wdth"], variable: "--font-archivo" });
const anton = Anton({ subsets: ["latin"], weight: "400", variable: "--font-anton" });
const bigShoulders = Big_Shoulders({
  subsets: ["latin"],
  axes: ["opsz"],
  variable: "--font-big-shoulders",
});
const texto = Inter_Tight({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-texto-nuevo",
});

export const metadata = {
  title: "Muestra del sistema",
  robots: { index: false, follow: false },
};

const DISPLAYS = [
  {
    id: "archivo",
    nombre: "Archivo",
    detalle: "Variable, ancho 62 y peso 900",
    clase: styles.archivo,
    recomendada: true,
    nota: "Una grotesca como Inter Tight, así que no chocan. Es la más cercana a la display de Slush y, con el eje de ancho, se puede abrir un poco en los tamaños chicos.",
  },
  {
    id: "anton",
    nombre: "Anton",
    detalle: "400, pesada por diseño",
    clase: styles.anton,
    nota: "La más de afiche. Tiene un solo ancho y las mayúsculas muy altas: pide más interlineado para que los acentos no toquen la línea de arriba.",
  },
  {
    id: "big-shoulders",
    nombre: "Big Shoulders",
    detalle: "Display (opsz 72), peso 900",
    clase: styles.bigShoulders,
    nota: "La más angosta y con más carácter, de cartel de estadio. Entra en cualquier ancho, pero se aleja del tenis.",
  },
];

// Los mismos valores que app/globals.css: la tabla se calcula con ellos
const FONDOS = [
  { token: "--polvo", nombre: "Polvo de ladrillo", hex: "#d46c3f", uso: "La base cálida de la marca", grano: true, textos: ["tinta"] },
  { token: "--cancha", nombre: "Cancha rápida", hex: "#5a8fe6", uso: "La anatomía y su banda de fotos", grano: true, textos: ["tinta"] },
  { token: "--cesped", nombre: "Césped", hex: "#5a9e4a", uso: "Las categorías y su banda de fotos", grano: true, textos: ["tinta"] },
  { token: "--cal", nombre: "Cal", hex: "#fbf6ee", uso: "Las páginas de trámite", textos: ["tinta", "grafito"] },
  { token: "--blanco", nombre: "Blanco", hex: "#ffffff", uso: "Líneas, píldoras, campos y stickers", textos: ["tinta", "grafito"] },
  { token: "--estudio", nombre: "Estudio", hex: "#f4f5f2", uso: "Solo las celdas de la vitrina", textos: ["tinta", "grafito"] },
  { token: "--tinta", nombre: "Tinta", hex: "#1a1411", uso: "Texto, bordes y footer", textos: ["blanco", "lima"] },
  { token: "--lima", nombre: "Lima", hex: "#dcf900", uso: "Marca y acción, siempre con texto tinta", textos: ["tinta"] },
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

// Las partes de la vista previa de la anatomía: todas a la derecha, así
// entran también en una pantalla de 375px
const PARTES_MUESTRA = [
  { id: "encordado", giro: 3, activa: true },
  { id: "empunadura", giro: -2 },
  { id: "tapon", giro: 2 },
];

function Wordmark({ className = "" }) {
  return (
    <span className={`${styles.wordmark} ${className}`}>
      green
      <Pelota className={styles.punto} />
    </span>
  );
}

// Maqueta de la navegación en píldoras (el header real es de la fase 2)
function NavPildoras({ etiqueta }) {
  return (
    <div className={styles.nav}>
      <Link href="/" className={styles.navMarca} aria-label="green.">
        <Wordmark />
      </Link>
      <nav aria-label={etiqueta} className={styles.navLinks}>
        {CATEGORIAS.map((categoria, i) => (
          <Link
            key={categoria.slug}
            href={`/categoria/${categoria.slug}`}
            className={`${styles.pildora} ${i === 0 ? styles.activa : ""}`}
          >
            {categoria.nombre}
          </Link>
        ))}
        <Link href="/combos" className={styles.pildora}>
          Combos
        </Link>
      </nav>
      <div className={styles.navAcciones}>
        <Link href="/mis-pedidos" className={styles.pildora}>
          Mi cuenta
        </Link>
        <Link href="/carrito" className={`${styles.pildora} ${styles.pildoraLima}`}>
          Carrito (0)
        </Link>
      </div>
    </div>
  );
}

// La tarjeta de producto nueva: el mismo marcado y el mismo link que
// TarjetaProducto, con el estilo del sistema
function Tarjeta({ producto }) {
  const disponible = tieneStock(producto);
  return (
    <li className={styles.tarjeta}>
      <Link
        href={`/producto/${producto.slug}`}
        className={`${styles.producto} ${disponible ? "" : styles.agotado}`}
      >
        <FotoVitrina
          foto={producto.fotos?.[0]}
          categoria={producto.categoria}
          sizes="(max-width: 999px) 45vw, 300px"
          className={styles.tarjetaFoto}
        />
        <div className={styles.rotulo}>
          <h3 className={styles.nombre}>{producto.nombre}</h3>
          <p className={styles.variante}>{describirVariante(producto)}</p>
        </div>
        <div className={styles.pie}>
          <p className={styles.precio}>
            {tienePreciosDistintos(producto) && "desde "}
            {formatearPrecio(producto.precioBase)}
          </p>
          {disponible ? (
            <span className={styles.comprar}>Comprar</span>
          ) : (
            <Sticker tono="tinta">Sin stock</Sticker>
          )}
        </div>
      </Link>
    </li>
  );
}

function PanelPolvo({ conMarca, productos }) {
  const rotulo = conMarca ? "Con marca de agua" : "Sin marca de agua";
  return (
    <Superficie
      tipo="polvo"
      marca={conMarca ? "lineas" : undefined}
      className={styles.panel}
      aria-label={`Polvo de ladrillo, ${rotulo.toLowerCase()}`}
    >
      <Sticker className={styles.panelRotulo}>{rotulo}</Sticker>
      <div className={styles.panelCabecera}>
        <h2 className={`${styles.display} ${styles.panelTitulo}`}>Lo que más sale</h2>
        <Sticker tono="lima" giro={3} className={styles.panelSticker}>
          Más vendidos
        </Sticker>
      </div>
      <p className={styles.entrada}>Los productos que más se venden en la tienda.</p>
      <div className={styles.acciones}>
        <Link href="/categoria/raquetas" className={styles.boton}>
          Ver raquetas
        </Link>
        <Link href="/combos" className={`${styles.boton} ${styles.secundario}`}>
          Ver combos
        </Link>
      </div>
      <ul className={styles.vitrina}>
        {productos.map((producto) => (
          <Tarjeta key={producto.id} producto={producto} />
        ))}
      </ul>
    </Superficie>
  );
}

export default async function PaginaMuestra() {
  const productos = await getProductos();
  const destacados = productos.filter((p) => p.destacado);
  const muestraVitrina = (destacados.length >= 2 ? destacados : productos).slice(0, 2);

  // La banda 1 de la home: sobre polvo, con los placeholders en cancha
  const lugaresBanda = LUGARES_FOTOS.filter((lugar) => lugar.banda === 1);
  const encordado = PASOS_ANATOMIA.find((paso) => paso.id === "encordado");
  const pasoEncordado = PASOS_ANATOMIA.indexOf(encordado) + 1;

  return (
    <main
      className={`${archivo.variable} ${anton.variable} ${bigShoulders.variable} ${texto.variable} ${styles.muestra} ${styles.archivo}`}
    >
      <h1 className={styles.oculto}>Muestra del sistema de green.</h1>

      {/* ---------- El hero real, con la capa de tinta al 55% ---------- */}
      <section className={styles.hero} aria-labelledby="muestra-hero">
        <picture className={styles.heroMedio}>
          <source media={CORTE_MOBILE} srcSet={VIDEOS_HERO.mobile.poster} />
          <img src={VIDEOS_HERO.desktop.poster} alt="" className={styles.heroPoster} />
        </picture>
        <VideoFondo className={styles.heroVideo} claseBoton={styles.pausa} claseIcono={styles.icono} />
        <div className={styles.heroCapa} aria-hidden="true" />

        <div className={styles.heroNav}>
          <NavPildoras etiqueta="Secciones (maqueta sobre el video)" />
        </div>

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

        <div className={styles.selector} role="radiogroup" aria-labelledby="selector-display">
          <span id="selector-display" className={styles.selectorTitulo}>
            Display
          </span>
          {DISPLAYS.map((display) => (
            <label key={display.id} className={styles.opcion}>
              <input
                type="radio"
                name="display-hero"
                value={display.id}
                defaultChecked={display.recomendada}
                className={styles.oculto}
              />
              {display.nombre}
            </label>
          ))}
        </div>
      </section>

      {/* ---------- Índice ---------- */}
      <Superficie tipo="cal" className={styles.bloque} aria-labelledby="muestra-indice">
        <div className={`${styles.contenido} ${styles.intro}`}>
          <h2 id="muestra-indice" className={`${styles.display} ${styles.tituloSeccion}`}>
            Muestra del sistema
          </h2>
          <p className={styles.entrada}>
            Todo el sistema nuevo junto: tipografía, paleta, componentes, una sección por superficie
            y las fotos al scrollear. Es una página de trabajo; el resto del sitio sigue igual hasta
            la fase 2.
          </p>
          <nav aria-label="Partes de la muestra" className={styles.indice}>
            {[
              ["tipografia", "Tipografía"],
              ["paleta", "Paleta"],
              ["componentes", "Componentes"],
              ["polvo", "Polvo"],
              ["fotos", "Fotos"],
              ["cancha", "Cancha"],
              ["cesped", "Césped"],
            ].map(([id, nombre]) => (
              <a key={id} href={`#${id}`} className={styles.pildora}>
                {nombre}
              </a>
            ))}
          </nav>
        </div>
      </Superficie>

      {/* ---------- Tipografía ---------- */}
      <Superficie tipo="cal" id="tipografia" className={styles.bloque} aria-labelledby="titulo-tipografia">
        <div className={styles.contenido}>
          <h2 id="titulo-tipografia" className={`${styles.display} ${styles.tituloSeccion}`}>
            Tipografía
          </h2>
          <p className={styles.entrada}>
            Tres displays gratuitas con el mismo titular. Debajo, una línea con acentos para probar
            el interlineado. El texto corrido sigue en Inter Tight, ahora en 400 y 600.
          </p>

          {DISPLAYS.map((display) => (
            <article key={display.id} className={`${styles.tipo} ${display.clase}`}>
              <Separador />
              <header className={styles.tipoCabecera}>
                <h3 className={styles.tipoNombre}>{display.nombre}</h3>
                <p className={styles.dato}>{display.detalle}</p>
                {display.recomendada && (
                  <Sticker tono="lima" giro={-3}>
                    Recomendada
                  </Sticker>
                )}
              </header>
              <p className={`${styles.display} ${styles.tipoTitular}`}>Todo para jugar al tenis</p>
              <p className={`${styles.display} ${styles.tipoAcentos}`}>
                Césped, polvo de ladrillo y cancha rápida
              </p>
              <div className={styles.tipoPie}>
                <p className={`${styles.display} ${styles.tipoChica}`}>Lo que más sale</p>
                <Wordmark className={styles.tipoWordmark} />
                <p className={styles.tipoNota}>{display.nota}</p>
              </div>
            </article>
          ))}

          <Separador />
          <div className={styles.wordmarks}>
            <h3 className={styles.subtitulo}>El wordmark, para comparar</h3>
            <div className={styles.wordmarksFila}>
              <figure>
                <span className={`${styles.wordmarkTexto} ${styles.wordmarkActual}`}>
                  green
                  <Pelota className={styles.punto} />
                </span>
                <figcaption className={styles.dato}>Actual: Inter Tight 400</figcaption>
              </figure>
              <figure>
                <span className={`${styles.wordmarkTexto} ${styles.wordmark600}`}>
                  green
                  <Pelota className={styles.punto} />
                </span>
                <figcaption className={styles.dato}>Inter Tight 600</figcaption>
              </figure>
              <figure>
                <Wordmark className={styles.tipoWordmark} />
                <figcaption className={styles.dato}>Archivo, la recomendada</figcaption>
              </figure>
            </div>
          </div>
        </div>
      </Superficie>

      {/* ---------- Paleta ---------- */}
      <Superficie tipo="cal" id="paleta" className={styles.bloque} aria-labelledby="titulo-paleta">
        <div className={styles.contenido}>
          <Separador />
          <h2 id="titulo-paleta" className={`${styles.display} ${styles.tituloSeccion}`}>
            Paleta
          </h2>
          <p className={styles.entrada}>
            Las superficies del tenis, dos neutros y el lima. Sobre polvo, cancha y césped todo el
            texto es tinta; nunca hay más de dos superficies de color a la vista.
          </p>
          <ul className={styles.colores}>
            {FONDOS.map((fondo) => (
              <li key={fondo.token} className={styles.color}>
                <span
                  className={`${styles.colorMuestra} ${fondo.grano ? styles.conGrano : ""}`}
                  style={{ background: fondo.hex }}
                />
                <span className={styles.colorNombre}>{fondo.nombre}</span>
                <span className={styles.dato}>
                  {fondo.token} · {fondo.hex.toUpperCase()}
                </span>
                <span className={styles.colorUso}>{fondo.uso}</span>
              </li>
            ))}
          </ul>

          <h3 className={styles.subtitulo}>Contrastes</h3>
          <p className={styles.texto}>
            WCAG 2.1: 4,5 para texto, 3 para texto grande. Sobre las superficies con grano, el
            número de abajo es el peor píxel. En negrita, las combinaciones permitidas.
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
                    <th scope="row">{fondo.nombre}</th>
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
                          <span className={styles.oculto}>{permitida ? ", permitida" : ", no se usa"}</span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Superficie>

      {/* ---------- Componentes ---------- */}
      <Superficie tipo="cal" id="componentes" className={styles.bloque} aria-labelledby="titulo-componentes">
        <div className={styles.contenido}>
          <Separador />
          <h2 id="titulo-componentes" className={`${styles.display} ${styles.tituloSeccion}`}>
            Componentes
          </h2>

          <h3 className={styles.subtitulo}>Botones</h3>
          <div className={styles.fila}>
            <figure className={styles.ejemplo}>
              <button type="button" className={styles.boton}>
                Agregar al carrito
              </button>
              <figcaption className={styles.dato}>Principal</figcaption>
            </figure>
            <figure className={styles.ejemplo}>
              <span className={`${styles.boton} ${styles.comoHover}`}>Agregar al carrito</span>
              <figcaption className={styles.dato}>Hover: tinta y sube 2px</figcaption>
            </figure>
            <figure className={styles.ejemplo}>
              <span className={`${styles.boton} ${styles.comoFoco}`}>Agregar al carrito</span>
              <figcaption className={styles.dato}>Foco: anillo de 3px</figcaption>
            </figure>
            <figure className={styles.ejemplo}>
              <button type="button" className={styles.boton} disabled>
                Agregar al carrito
              </button>
              <figcaption className={styles.dato}>Apagado</figcaption>
            </figure>
            <figure className={styles.ejemplo}>
              <button type="button" className={`${styles.boton} ${styles.secundario}`}>
                Cerrar sesión
              </button>
              <figcaption className={styles.dato}>Secundario</figcaption>
            </figure>
          </div>

          <Superficie tipo="tinta" as="div" className={styles.oscuro}>
            <div className={styles.fila}>
              <figure className={styles.ejemplo}>
                <button type="button" className={styles.boton}>
                  Ver raquetas
                </button>
                <figcaption className={styles.dato}>Sobre tinta y video: lima</figcaption>
              </figure>
              <figure className={styles.ejemplo}>
                <button type="button" className={`${styles.boton} ${styles.claro}`}>
                  Ver combos
                </button>
                <figcaption className={styles.dato}>Secundario sobre oscuro</figcaption>
              </figure>
            </div>
            <Separador />
            <p className={styles.dato}>Separador sobre tinta: puntos blancos</p>
          </Superficie>

          <h3 className={styles.subtitulo}>Navegación en píldoras</h3>
          <div className={styles.navMuestra}>
            <NavPildoras etiqueta="Secciones (maqueta)" />
          </div>
          <p className={styles.texto}>
            Cada link es una píldora blanca opaca de 44px: se lee igual sobre el video y sobre
            cualquier superficie. La sección activa va en lima y el carrito, siempre en lima.
          </p>

          <h3 className={styles.subtitulo}>Stickers</h3>
          <div className={styles.fila}>
            <Sticker tono="lima" giro={-3}>
              Nuevo
            </Sticker>
            <Sticker>Pendiente</Sticker>
            <Sticker tono="lima">Pagado</Sticker>
            <Sticker forma="esquinas" giro={2}>
              Pago en proceso
            </Sticker>
            <Sticker tono="tinta">Sin stock</Sticker>
            <Sticker tono="lima" forma="esquinas" giro={3}>
              10 % menos
            </Sticker>
            <Sticker tono="tinta">Cancelado</Sticker>
          </div>
          <p className={styles.texto}>
            Lima para lo activo, lo nuevo y lo pagado; blanco para lo pendiente o informativo; tinta
            para lo que no está. El texto siempre dice el estado. Derechos dentro de tarjetas y
            filas; girados (hasta 3°) solo como acento.
          </p>

          <h3 className={styles.subtitulo}>Separador punteado</h3>
          <Separador />
          <p className={styles.texto}>
            Puntos de 4px cada 12px, del color del texto. Entre bloques grandes; las filas de las
            tablas siguen con 1px.
          </p>

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
        </div>
      </Superficie>

      {/* ---------- Polvo, con y sin marca de agua ---------- */}
      <div id="polvo" className={styles.comparacion}>
        <PanelPolvo conMarca productos={muestraVitrina} />
        <PanelPolvo productos={muestraVitrina} />
      </div>

      {/* ---------- Fotos al scrollear ---------- */}
      <Superficie tipo="polvo" id="fotos" className={styles.fotos} aria-labelledby="titulo-fotos">
        <div className={styles.contenido}>
          <Separador />
          <h2 id="titulo-fotos" className={`${styles.display} ${styles.tituloSeccion}`}>
            Fotos al scrollear
          </h2>
          <p className={styles.entrada}>
            Mientras no estén las fotos, cada lugar muestra su placeholder: la proporción exacta,
            el color de una superficie y qué foto va. Tiene el mismo tamaño, el mismo giro y el
            mismo movimiento que va a tener la foto.
          </p>
        </div>

        <BandaFotos lugares={lugaresBanda} />

        <div className={styles.contenido}>
          <Separador />
          <h3 className={styles.subtitulo}>Los 10 lugares</h3>
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
      </Superficie>

      {/* ---------- Cancha rápida: la anatomía, con el sistema ---------- */}
      <Superficie tipo="cancha" id="cancha" className={styles.cancha} aria-labelledby="titulo-cancha">
        <div className={`${styles.contenido} ${styles.anatomia}`}>
          <div className={styles.escena}>
            <span className={`${styles.display} ${styles.nombreGigante}`} aria-hidden="true">
              {encordado.titulo}
            </span>
            <Raqueta
              estilo="inflada"
              encuadre="lienzo"
              prefijo="muestra"
              resaltadas={["encordado"]}
              className={styles.raqueta}
            />
            {PARTES_MUESTRA.map((parte) => {
              const [x, y] = ANCLAS[parte.id];
              const paso = PASOS_ANATOMIA.find((p) => p.id === parte.id);
              return (
                <span
                  key={parte.id}
                  className={styles.parte}
                  style={{ left: `${(x / LIENZO.ancho) * 100}%`, top: `${(y / LIENZO.alto) * 100}%` }}
                  aria-hidden="true"
                >
                  <span className={styles.parteGuia} />
                  <Sticker tono={parte.activa ? "lima" : "blanco"} giro={parte.giro}>
                    {paso.titulo}
                  </Sticker>
                </span>
              );
            })}
          </div>

          <div className={styles.anatomiaTexto}>
            <h2 id="titulo-cancha" className={`${styles.display} ${styles.tituloAnatomia}`}>
              {TITULO_ANATOMIA}
            </h2>
            <p className={styles.entrada}>{BAJADA_ANATOMIA}</p>
            <Separador />
            <div className={styles.paso}>
              <span className={styles.dato}>{String(pasoEncordado).padStart(2, "0")}</span>
              <h3 className={`${styles.display} ${styles.pasoTitulo}`}>{encordado.titulo}</h3>
              <p className={styles.pasoDato}>{encordado.dato}</p>
              <p className={styles.texto}>{encordado.frase}</p>
            </div>
          </div>
        </div>
      </Superficie>

      {/* ---------- Césped: las categorías ---------- */}
      <Superficie tipo="cesped" marca="costuras" id="cesped" className={styles.cesped} aria-labelledby="titulo-cesped">
        <div className={styles.contenido}>
          <h2 id="titulo-cesped" className={`${styles.display} ${styles.tituloSeccion}`}>
            Categorías
          </h2>
          <ul className={styles.categorias}>
            {CATEGORIAS.map((categoria) => (
              <li key={categoria.slug}>
                <Separador />
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
                </Link>
              </li>
            ))}
          </ul>
          <Separador />
        </div>
      </Superficie>
    </main>
  );
}
