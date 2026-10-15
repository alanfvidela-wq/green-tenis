import styles from "./Raqueta.module.css";

// Raqueta dibujada en SVG con código, de frente y vertical. Cada parte es un
// grupo con data-parte, para resaltarla o animarla desde afuera: aro,
// encordado, punto-dulce, antivibrador, garganta, mango, grip, overgrip y
// tapa. Es un componente de servidor: el que lo usa decide qué partes
// resaltar (`resaltadas`).
//
// Dos estilos (ver DESIGN.md):
// - «linea» (el del sitio): línea negra de 1,5px sobre blanco. Resaltar es
//   poner un marcador lima debajo de la línea; el resto baja a gris.
// - «inflada» (solo la sección «Anatomía de una raqueta»): plástico inflado,
//   con degradados suaves, una textura de ruido estática y contorno negro
//   grueso. Resaltar es pasar la parte a lima; el resto se desvanece. Todo lo
//   que se anima ahí es transform u opacity.

// Lienzo completo: la raqueta centrada, con aire a los costados para las
// etiquetas. Proporción 5:7.
export const LIENZO = { ancho: 400, alto: 560 };

// Encuadre ajustado a la raqueta, para usarla sola
const AJUSTADO = "96 8 208 540";

const CX = 200;
const CY = 145;

// Patrón de encordado: cuerdas verticales × horizontales
export const PATRON = { verticales: 16, horizontales: 19 };

const redondear = (n) => Math.round(n * 10) / 10;

// Cuerdas de lado a lado de un óvalo: primero las verticales, después las
// horizontales (es el orden en que se dibujan)
function trazarCuerdas(rx, ry) {
  const cuerdas = [];
  const pasoX = (2 * rx) / (PATRON.verticales + 1);
  for (let i = 0; i < PATRON.verticales; i++) {
    const x = CX + (i - (PATRON.verticales - 1) / 2) * pasoX;
    const alto = ry * Math.sqrt(1 - ((x - CX) / rx) ** 2);
    cuerdas.push({
      d: `M${redondear(x)} ${redondear(CY - alto)}V${redondear(CY + alto)}`,
      vertical: true,
    });
  }
  const pasoY = (2 * ry) / (PATRON.horizontales + 1);
  for (let j = 0; j < PATRON.horizontales; j++) {
    const y = CY + (j - (PATRON.horizontales - 1) / 2) * pasoY;
    const ancho = rx * Math.sqrt(1 - ((y - CY) / ry) ** 2);
    cuerdas.push({
      d: `M${redondear(CX - ancho)} ${redondear(y)}H${redondear(CX + ancho)}`,
      vertical: false,
    });
  }
  return cuerdas;
}

// Punto de referencia de cada parte, en coordenadas del lienzo: de ahí sale
// la línea guía de su etiqueta
export const ANCLAS = {
  aro: [253, 46],
  encordado: [154.5, 110],
  "punto-dulce": [200, 160],
  antivibrador: [200, 253],
  garganta: [154, 303],
  mango: [213, 365],
  grip: [215, 450],
  overgrip: [184, 470],
  tapa: [217, 530],
};

/* ---------- Estilo «linea» ---------- */

const CUERDAS_LINEA = trazarCuerdas(88, 117);

const OVERGRIP_LINEA = (() => {
  const vueltas = [];
  for (let y = 516; y >= 404; y -= 8) vueltas.push(`M186 ${y}L214 ${y - 9}`);
  vueltas.push("M186 397H214");
  return vueltas;
})();

const PARTES_LINEA = [
  {
    id: "aro",
    forma: (
      <>
        <ellipse cx={CX} cy={CY} rx={96} ry={125} />
        <ellipse cx={CX} cy={CY} rx={88} ry={117} />
      </>
    ),
  },
  {
    id: "encordado",
    forma: CUERDAS_LINEA.map(({ d }, i) => (
      <path key={d} d={d} pathLength="1" data-cuerda={i} />
    )),
  },
  { id: "punto-dulce", forma: <ellipse cx={CX} cy={160} rx={30} ry={38} /> },
  { id: "antivibrador", forma: <rect x={191} y={252.5} width={18} height={7} rx={3.5} /> },
  {
    id: "garganta",
    forma: (
      <>
        <path d="M124.4 222C134 290 170 330 188 364" />
        <path d="M275.6 222C266 290 230 330 212 364" />
        <path d="M168 263C176 292 190 318 196 336Q200 341 204 336C210 318 224 292 232 263" />
      </>
    ),
  },
  {
    id: "mango",
    forma: (
      <>
        <path d="M188 364V522M212 364V522" />
        <path d="M188 378H212" />
      </>
    ),
  },
  { id: "grip", forma: <path d="M194 380V520M200 380V520M206 380V520" /> },
  {
    id: "overgrip",
    forma: OVERGRIP_LINEA.map((d, i) => (
      <path key={d} d={d} pathLength="1" data-vuelta={i} />
    )),
  },
  { id: "tapa", forma: <path d="M186 522H214V530Q214 538 206 538H194Q186 538 186 530Z" /> },
];

function RaquetaLinea({ resaltadas }) {
  const capa = (nombre) => (
    <g data-capa={nombre}>
      {PARTES_LINEA.map(({ id, forma }) => (
        <g key={id} data-parte={id} data-resaltada={resaltadas.includes(id) ? "" : undefined}>
          {forma}
        </g>
      ))}
    </g>
  );
  return (
    <>
      {capa("resalte")}
      {capa("trazo")}
    </>
  );
}

/* ---------- Estilo «inflada» ---------- */

// Grosor del contorno negro, a cada lado del cuerpo
const BORDE = 2.6;

// El aro es un tubo: su línea central y su grosor
const ARO_TUBO = { rx: 92, ry: 121, ancho: 13 };
const CUERDAS_INFLADA = trazarCuerdas(ARO_TUBO.rx, ARO_TUBO.ry);

const OVERGRIP_INFLADA = (() => {
  const vueltas = [];
  for (let y = 520; y >= 404; y -= 9) vueltas.push(`M183.5 ${y}L216.5 ${y - 10}`);
  return vueltas;
})();

// Arco del aro entre dos ángulos (en grados, 0 a la derecha, sentido horario)
function arco(rx, ry, desde, hasta) {
  const punto = (grados) => {
    const a = (grados * Math.PI) / 180;
    return [redondear(CX + rx * Math.cos(a)), redondear(CY + ry * Math.sin(a))];
  };
  const [x1, y1] = punto(desde);
  const [x2, y2] = punto(hasta);
  const grande = hasta - desde > 180 ? 1 : 0;
  return `M${x1} ${y1}A${rx} ${ry} 0 ${grande} 1 ${x2} ${y2}`;
}

const ARO_D = `M${CX - ARO_TUBO.rx} ${CY}a${ARO_TUBO.rx} ${ARO_TUBO.ry} 0 1 0 ${2 * ARO_TUBO.rx} 0a${ARO_TUBO.rx} ${ARO_TUBO.ry} 0 1 0 ${-2 * ARO_TUBO.rx} 0Z`;

function RaquetaInflada({ resaltadas, prefijo }) {
  const url = (nombre) => `url(#${prefijo}-${nombre})`;

  // Un tubo: contorno negro debajo, cuerpo, versión lima (aparece al
  // resaltar), textura y brillo
  const tubo = (d, ancho, { brillo, ruido = true } = {}) => (
    <>
      <path d={d} stroke="#000" strokeWidth={ancho + 2 * BORDE} />
      <path d={d} stroke={url("cuerpo")} strokeWidth={ancho} />
      <path d={d} stroke={url("lima")} strokeWidth={ancho} data-lima="" />
      {ruido && <path d={d} stroke={url("ruido")} strokeWidth={ancho} />}
      {brillo && (
        <path d={brillo} stroke="#fff" strokeWidth={ancho * 0.28} strokeOpacity="0.9" />
      )}
    </>
  );

  // Un sólido: cuerpo, versión lima, textura, brillo y el contorno arriba
  const solido = (forma, { cuerpo = "cilindro", brillo } = {}) => (
    <>
      {forma({ fill: url(cuerpo) })}
      {forma({ fill: url(`${cuerpo}-lima`), "data-lima": "" })}
      {forma({ fill: url("ruido") })}
      {brillo}
      {forma({ fill: "none", stroke: "#000", strokeWidth: 2 * BORDE })}
    </>
  );

  const partes = [
    {
      id: "encordado",
      forma: CUERDAS_INFLADA.map(({ d, vertical }, i) => (
        <g key={d} data-cuerda={i} data-sentido={vertical ? "vertical" : "horizontal"}>
          <path d={d} stroke="#000" strokeWidth={3.6} />
          <path d={d} stroke={url("cuerpo")} strokeWidth={1.8} />
          <path d={d} stroke={url("lima")} strokeWidth={1.8} data-lima="" />
        </g>
      )),
    },
    {
      id: "garganta",
      forma: (
        <>
          {tubo("M129.5 222.8C136 285 168 326 194 366", 12, {
            brillo: "M133 240C138 280 158 312 178 340",
          })}
          {tubo("M270.5 222.8C264 285 232 326 206 366", 12)}
        </>
      ),
    },
    {
      id: "aro",
      forma: tubo(ARO_D, ARO_TUBO.ancho, {
        brillo: arco(ARO_TUBO.rx + 1.5, ARO_TUBO.ry + 1.5, 195, 285),
      }),
    },
    {
      id: "punto-dulce",
      forma: (
        <>
          <ellipse cx={CX} cy={160} rx={30} ry={38} fill={url("zona")} />
          <ellipse cx={CX} cy={160} rx={30} ry={38} fill={url("zona-lima")} data-lima="" />
          <ellipse
            cx={CX}
            cy={160}
            rx={30}
            ry={38}
            stroke="#000"
            strokeWidth={2.4}
            strokeDasharray="7 6"
          />
        </>
      ),
    },
    {
      id: "antivibrador",
      forma: solido((p) => <rect x={189} y={248} width={22} height={10} rx={5} {...p} />, {
        cuerpo: "burbuja",
      }),
    },
    {
      id: "mango",
      forma: solido((p) => <rect x={188} y={346} width={24} height={182} rx={8} {...p} />, {
        brillo: <path d="M194 354V376" stroke="#fff" strokeWidth={3} strokeOpacity="0.9" />,
      }),
    },
    {
      id: "grip",
      forma: solido((p) => <rect x={185} y={380} width={30} height={142} rx={9} {...p} />, {
        brillo: (
          <>
            <path d="M192.5 390V512" stroke="#fff" strokeWidth={3.4} strokeOpacity="0.85" />
            <path d="M205 386V516" stroke="#000" strokeWidth={1.2} strokeOpacity="0.35" />
          </>
        ),
      }),
    },
    {
      id: "overgrip",
      forma: (
        <>
          {OVERGRIP_INFLADA.map((d, i) => (
            <g key={d} data-vuelta={i}>
              <path d={d} stroke="#000" strokeWidth={6 + 2 * 1.8} />
              <path d={d} stroke={url("cuerpo")} strokeWidth={6} />
              <path d={d} stroke={url("lima")} strokeWidth={6} data-lima="" />
            </g>
          ))}
          <g data-vuelta={OVERGRIP_INFLADA.length}>
            <path d="M182 392H218" stroke="#000" strokeWidth={8 + 2 * 1.8} />
            <path d="M182 392H218" stroke={url("cuerpo")} strokeWidth={8} />
            <path d="M182 392H218" stroke={url("lima")} strokeWidth={8} data-lima="" />
          </g>
        </>
      ),
    },
    {
      id: "tapa",
      forma: solido(
        (p) => <path d="M182 518H218V528Q218 541 205 541H195Q182 541 182 528Z" {...p} />,
      ),
    },
  ];

  return (
    <>
      <defs>
        {/* Luz de arriba a la izquierda: blanco que va a un azul muy pálido */}
        <linearGradient id={`${prefijo}-cuerpo`} gradientUnits="userSpaceOnUse" x1="110" y1="10" x2="290" y2="545">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.45" stopColor="#eaf2fb" />
          <stop offset="1" stopColor="#c6d9f0" />
        </linearGradient>
        <linearGradient id={`${prefijo}-lima`} gradientUnits="userSpaceOnUse" x1="110" y1="10" x2="290" y2="545">
          <stop offset="0" stopColor="#f6ffb3" />
          <stop offset="0.5" stopColor="#dcf900" />
          <stop offset="1" stopColor="#b3ce00" />
        </linearGradient>
        {/* Cilindro: claro en el centro, más oscuro en los bordes */}
        <linearGradient id={`${prefijo}-cilindro`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#c4d7ef" />
          <stop offset="0.35" stopColor="#ffffff" />
          <stop offset="0.65" stopColor="#e4edf8" />
          <stop offset="1" stopColor="#b3c9e6" />
        </linearGradient>
        <linearGradient id={`${prefijo}-cilindro-lima`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#b4cd00" />
          <stop offset="0.35" stopColor="#f2ff9c" />
          <stop offset="0.65" stopColor="#dcf900" />
          <stop offset="1" stopColor="#a5bf00" />
        </linearGradient>
        <radialGradient id={`${prefijo}-burbuja`} cx="0.35" cy="0.3" r="0.85">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.55" stopColor="#e3edf9" />
          <stop offset="1" stopColor="#bcd0ea" />
        </radialGradient>
        <radialGradient id={`${prefijo}-burbuja-lima`} cx="0.35" cy="0.3" r="0.85">
          <stop offset="0" stopColor="#f7ffbd" />
          <stop offset="0.55" stopColor="#dcf900" />
          <stop offset="1" stopColor="#adc800" />
        </radialGradient>
        {/* El punto dulce es una zona, no una pieza: una burbuja traslúcida */}
        <radialGradient id={`${prefijo}-zona`} cx="0.4" cy="0.35" r="0.75">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.85" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0.15" />
        </radialGradient>
        <radialGradient id={`${prefijo}-zona-lima`} cx="0.4" cy="0.35" r="0.75">
          <stop offset="0" stopColor="#f3ff94" stopOpacity="0.95" />
          <stop offset="1" stopColor="#dcf900" stopOpacity="0.6" />
        </radialGradient>
        {/* Textura de ruido: un PNG estático, no un filtro */}
        <pattern id={`${prefijo}-ruido`} patternUnits="userSpaceOnUse" width="64" height="64">
          <image href="/texturas/ruido.png" width="64" height="64" />
        </pattern>
      </defs>

      {partes.map(({ id, forma }) => (
        <g key={id} data-parte={id} data-resaltada={resaltadas.includes(id) ? "" : undefined}>
          {forma}
        </g>
      ))}
    </>
  );
}

export const PARTES_RAQUETA = PARTES_LINEA.map((parte) => parte.id);

export default function Raqueta({
  ref,
  resaltadas = [],
  estilo = "linea",
  encuadre = "ajustado",
  prefijo = "raqueta",
  className = "",
}) {
  const viewBox = encuadre === "lienzo" ? `0 0 ${LIENZO.ancho} ${LIENZO.alto}` : AJUSTADO;
  const inflada = estilo === "inflada";

  return (
    <svg
      ref={ref}
      viewBox={viewBox}
      className={`${styles.raqueta} ${inflada ? styles.inflada : styles.linea} ${className}`}
      data-resaltando={resaltadas.length > 0 ? "" : undefined}
      aria-hidden="true"
      focusable="false"
    >
      {inflada ? (
        <RaquetaInflada resaltadas={resaltadas} prefijo={prefijo} />
      ) : (
        <RaquetaLinea resaltadas={resaltadas} />
      )}
    </svg>
  );
}
