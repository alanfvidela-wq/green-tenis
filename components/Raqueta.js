import styles from "./Raqueta.module.css";

// Raqueta dibujada en línea, de frente y vertical (ver «Anatomía de una
// raqueta» en DESIGN.md). Cada parte es un grupo con data-parte, para
// resaltarla o animarla desde afuera: aro, encordado, punto-dulce,
// antivibrador, garganta, mango, grip, overgrip y tapa.
//
// Se dibuja en dos capas: abajo el resalte (un trazo lima grueso, como un
// marcador) y arriba la línea negra. Así la parte resaltada se ve lima sin
// perder la línea, que sobre blanco el lima solo no se leería.
//
// Componente de servidor: el que lo usa decide qué partes resaltar
// (`resaltadas`) y, si hace falta, mueve la cámara cambiando el viewBox.

// Lienzo completo: la raqueta centrada, con aire a los costados para las
// etiquetas. Proporción 5:7.
export const LIENZO = { ancho: 400, alto: 560 };

// Encuadre ajustado a la raqueta, para usarla sola
const AJUSTADO = "96 12 208 532";

const CX = 200;
const CY = 145;
const ARO = { rx: 96, ry: 125 };
const ARO_INTERNO = { rx: 88, ry: 117 };

// Patrón de encordado: cuerdas verticales × horizontales
export const PATRON = { verticales: 16, horizontales: 19 };

const redondear = (n) => Math.round(n * 10) / 10;

// Las cuerdas van de lado a lado del aro interno: primero las verticales,
// después las horizontales (es el orden en que se dibujan)
function trazarCuerdas() {
  const { rx, ry } = ARO_INTERNO;
  const cuerdas = [];
  const pasoX = (2 * rx) / (PATRON.verticales + 1);
  for (let i = 0; i < PATRON.verticales; i++) {
    const x = CX + (i - (PATRON.verticales - 1) / 2) * pasoX;
    const alto = ry * Math.sqrt(1 - ((x - CX) / rx) ** 2);
    cuerdas.push(`M${redondear(x)} ${redondear(CY - alto)}V${redondear(CY + alto)}`);
  }
  const pasoY = (2 * ry) / (PATRON.horizontales + 1);
  for (let j = 0; j < PATRON.horizontales; j++) {
    const y = CY + (j - (PATRON.horizontales - 1) / 2) * pasoY;
    const ancho = rx * Math.sqrt(1 - ((y - CY) / ry) ** 2);
    cuerdas.push(`M${redondear(CX - ancho)} ${redondear(y)}H${redondear(CX + ancho)}`);
  }
  return cuerdas;
}

// El overgrip: vueltas en diagonal sobre el grip, de abajo hacia arriba (es
// el orden en que se enrolla), y la cinta que lo cierra arriba
function trazarOvergrip() {
  const vueltas = [];
  for (let y = 516; y >= 404; y -= 8) {
    vueltas.push(`M186 ${y}L214 ${y - 9}`);
  }
  vueltas.push("M186 397H214");
  return vueltas;
}

const CUERDAS = trazarCuerdas();
const OVERGRIP = trazarOvergrip();

// Punto de referencia de cada parte, en coordenadas del lienzo: de ahí sale
// la línea guía de su etiqueta
export const ANCLAS = {
  aro: [255, 42.6],
  encordado: [154.5, 110],
  "punto-dulce": [200, 160],
  antivibrador: [200, 256],
  garganta: [186, 313],
  mango: [212, 372],
  grip: [212, 440],
  overgrip: [187, 470],
  tapa: [214, 530],
};

const PARTES = [
  {
    id: "aro",
    forma: (
      <>
        <ellipse cx={CX} cy={CY} rx={ARO.rx} ry={ARO.ry} />
        <ellipse cx={CX} cy={CY} rx={ARO_INTERNO.rx} ry={ARO_INTERNO.ry} />
      </>
    ),
  },
  {
    id: "encordado",
    forma: CUERDAS.map((d, i) => (
      <path key={d} d={d} pathLength="1" data-cuerda={i} />
    )),
  },
  {
    id: "punto-dulce",
    forma: <ellipse cx={CX} cy={160} rx={30} ry={38} />,
  },
  {
    id: "antivibrador",
    forma: <rect x={191} y={252.5} width={18} height={7} rx={3.5} />,
  },
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
  {
    id: "grip",
    forma: <path d="M194 380V520M200 380V520M206 380V520" />,
  },
  {
    id: "overgrip",
    forma: OVERGRIP.map((d, i) => (
      <path key={d} d={d} pathLength="1" data-vuelta={i} />
    )),
  },
  {
    id: "tapa",
    forma: <path d="M186 522H214V530Q214 538 206 538H194Q186 538 186 530Z" />,
  },
];

export const PARTES_RAQUETA = PARTES.map((parte) => parte.id);

export default function Raqueta({
  ref,
  resaltadas = [],
  encuadre = "ajustado",
  className = "",
}) {
  const viewBox =
    encuadre === "lienzo" ? `0 0 ${LIENZO.ancho} ${LIENZO.alto}` : AJUSTADO;

  const capa = (nombre) => (
    <g data-capa={nombre}>
      {PARTES.map(({ id, forma }) => (
        <g
          key={id}
          data-parte={id}
          data-resaltada={resaltadas.includes(id) ? "" : undefined}
        >
          {forma}
        </g>
      ))}
    </g>
  );

  return (
    <svg
      ref={ref}
      viewBox={viewBox}
      className={`${styles.raqueta} ${className}`}
      data-resaltando={resaltadas.length > 0 ? "" : undefined}
      aria-hidden="true"
      focusable="false"
    >
      {capa("resalte")}
      {capa("trazo")}
    </svg>
  );
}
