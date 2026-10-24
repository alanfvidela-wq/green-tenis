import styles from "./Raqueta.module.css";

// Raqueta dibujada en SVG con código, de frente y vertical. Cada parte es un
// grupo con data-parte, para resaltarla o animarla desde afuera: marco,
// protector, ojales, encordado, punto-dulce, antivibrador, garganta,
// empunadura, grip, overgrip y tapon. Es un componente de servidor: el que lo
// usa decide qué partes resaltar (`resaltadas`).
//
// Dos estilos (ver DESIGN.md):
// - «linea» (el de «Armá tu raqueta»): línea negra de 1,5px sobre blanco.
//   Resaltar es poner un marcador del acento debajo de la línea; el resto baja
//   a gris.
// - «inflada» (la de «Anatomía de una raqueta»): cada parte con cuerpo, en
//   relleno blanco plano y contorno negro grueso. Resaltar es pasar la parte al
//   acento (currentColor de [data-lima], ver Raqueta.module.css); las demás no
//   se apagan. Todo lo que se anima ahí es transform u opacity.

// Lienzo completo: la raqueta centrada, con aire a los costados para las
// etiquetas. Proporción 5:7.
export const LIENZO = { ancho: 400, alto: 560 };

// Encuadre ajustado a la raqueta, para usarla sola
const AJUSTADO = "96 8 208 540";

const CX = 200;
const CY = 145;

// Patrón de encordado: cuerdas principales (verticales) × cruzadas
// (horizontales)
export const PATRON = { principales: 16, cruzadas: 19 };

const redondear = (n) => Math.round(n * 10) / 10;

// Dónde va cada cuerda, igual en los dos estilos: las principales de lado a
// lado y las cruzadas desde arriba, con lugar abajo para el antivibrador (va
// fuera de la zona donde se cruzan las cuerdas). Los pasos están elegidos para
// que ningún ojal se pise con otro.
const PRINCIPALES = Array.from(
  { length: PATRON.principales },
  (_, i) => CX + (i - (PATRON.principales - 1) / 2) * 10.83,
);
const CRUZADAS = Array.from({ length: PATRON.cruzadas }, (_, j) => 37.75 + j * 11.29);

// La línea media del marco: ahí están los ojales, en los dos estilos
const MEDIA = { rx: 92, ry: 121 };

// Medio ancho de un óvalo a una altura (o medio alto a un ancho)
const mitad = (radio, otroRadio, desplazamiento) =>
  radio * Math.sqrt(1 - (desplazamiento / otroRadio) ** 2);

// Cuerdas de lado a lado de un óvalo: primero las principales, después las
// cruzadas (es el orden en que se dibujan)
function trazarCuerdas(rx, ry) {
  const principales = PRINCIPALES.map((x) => {
    const alto = mitad(ry, rx, x - CX);
    return { d: `M${redondear(x)} ${redondear(CY - alto)}V${redondear(CY + alto)}`, vertical: true };
  });
  const cruzadas = CRUZADAS.map((y) => {
    const ancho = mitad(rx, ry, y - CY);
    return { d: `M${redondear(CX - ancho)} ${redondear(y)}H${redondear(CX + ancho)}`, vertical: false };
  });
  return [...principales, ...cruzadas];
}

// Un ojal en cada punta de cada cuerda, sobre la línea media del marco: uno
// arriba y otro abajo por principal, y uno a cada lado por cruzada
const OJALES = [
  ...PRINCIPALES.flatMap((x) => {
    const alto = mitad(MEDIA.ry, MEDIA.rx, x - CX);
    return [
      [x, CY - alto],
      [x, CY + alto],
    ];
  }),
  ...CRUZADAS.flatMap((y) => {
    const ancho = mitad(MEDIA.rx, MEDIA.ry, y - CY);
    return [
      [CX - ancho, y],
      [CX + ancho, y],
    ];
  }),
].map(([x, y]) => [redondear(x), redondear(y)]);

// Un punto de un óvalo centrado en la cabeza, a un ángulo (en grados, 0 a la
// derecha, sentido horario)
function puntoOvalo(rx, ry, grados) {
  const a = (grados * Math.PI) / 180;
  return [redondear(CX + rx * Math.cos(a)), redondear(CY + ry * Math.sin(a))];
}

// Arco de un óvalo centrado en la cabeza, entre dos ángulos
function arco(rx, ry, desde, hasta) {
  const [x1, y1] = puntoOvalo(rx, ry, desde);
  const [x2, y2] = puntoOvalo(rx, ry, hasta);
  const grande = hasta - desde > 180 ? 1 : 0;
  return `M${x1} ${y1}A${rx} ${ry} 0 ${grande} 1 ${x2} ${y2}`;
}

// El protector cubre la punta del marco, de las 10 a las 2 si la cabeza fuera
// un reloj
const PROTECTOR = { desde: 222, hasta: 318 };

// Punto de referencia de cada parte, en coordenadas del lienzo: de ahí sale
// la línea guía de su etiqueta
export const ANCLAS = {
  marco: [105, 145],
  protector: [233, 26],
  ojales: [283.5, 94.2],
  encordado: [151.3, 222],
  "punto-dulce": [200, 160],
  antivibrador: [200, 250],
  garganta: [245.6, 302.7],
  empunadura: [191, 363],
  grip: [213, 383],
  overgrip: [186, 455],
  tapon: [217, 530],
};

/* ---------- Estilo «linea» ---------- */

const CUERDAS_LINEA = trazarCuerdas(88, 117);

const OVERGRIP_LINEA = (() => {
  const vueltas = [];
  for (let y = 516; y >= 404; y -= 8) vueltas.push(`M186 ${y}L214 ${y - 9}`);
  vueltas.push("M186 397H214");
  return vueltas;
})();

// El protector, por fuera del marco: el arco de afuera y sus dos puntas
const PROTECTOR_LINEA = (() => {
  const { desde, hasta } = PROTECTOR;
  const punta = (grados) =>
    `M${puntoOvalo(96, 125, grados).join(" ")}L${puntoOvalo(100, 129, grados).join(" ")}`;
  return [arco(100, 129, desde, hasta), punta(desde), punta(hasta)];
})();

const PARTES_LINEA = [
  {
    id: "marco",
    forma: (
      <>
        <ellipse cx={CX} cy={CY} rx={96} ry={125} />
        <ellipse cx={CX} cy={CY} rx={88} ry={117} />
      </>
    ),
  },
  { id: "protector", forma: PROTECTOR_LINEA.map((d) => <path key={d} d={d} />) },
  {
    id: "ojales",
    forma: OJALES.map(([x, y]) => <circle key={`${x} ${y}`} cx={x} cy={y} r={1.6} />),
  },
  {
    id: "encordado",
    forma: CUERDAS_LINEA.map(({ d }, i) => (
      <path key={d} d={d} pathLength="1" data-cuerda={i} />
    )),
  },
  { id: "punto-dulce", forma: <ellipse cx={CX} cy={160} rx={30} ry={38} /> },
  { id: "antivibrador", forma: <rect x={191} y={245} width={18} height={7} rx={3.5} /> },
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
    // Octogonal: de frente se ven tres de sus ocho biseles
    id: "empunadura",
    forma: (
      <>
        <path d="M188 364V522M212 364V522" />
        <path d="M195 364V522M205 364V522" />
        <path d="M188 378H212" />
      </>
    ),
  },
  { id: "grip", forma: <rect x={186} y={380} width={28} height={140} rx={2} /> },
  {
    id: "overgrip",
    forma: OVERGRIP_LINEA.map((d, i) => (
      <path key={d} d={d} pathLength="1" data-vuelta={i} />
    )),
  },
  { id: "tapon", forma: <path d="M186 522H214V530Q214 538 206 538H194Q186 538 186 530Z" /> },
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

// El marco es un tubo sobre la línea media, y el protector, un tubo más ancho
// que lo cubre arriba y asoma un poco por fuera
const MARCO_TUBO = { ...MEDIA, ancho: 13 };
const PROTECTOR_TUBO = { rx: MEDIA.rx + 2, ry: MEDIA.ry + 2, ancho: 15 };
const CUERDAS_INFLADA = trazarCuerdas(MARCO_TUBO.rx, MARCO_TUBO.ry);

const OVERGRIP_INFLADA = (() => {
  const vueltas = [];
  for (let y = 520; y >= 404; y -= 9) vueltas.push(`M183.5 ${y}L216.5 ${y - 10}`);
  return vueltas;
})();

const MARCO_D = `M${CX - MARCO_TUBO.rx} ${CY}a${MARCO_TUBO.rx} ${MARCO_TUBO.ry} 0 1 0 ${2 * MARCO_TUBO.rx} 0a${MARCO_TUBO.rx} ${MARCO_TUBO.ry} 0 1 0 ${-2 * MARCO_TUBO.rx} 0Z`;

function RaquetaInflada({ resaltadas }) {
  // Un tubo: contorno negro debajo, cuerpo blanco y la versión del acento, que
  // aparece al resaltar
  const tubo = (d, ancho) => (
    <>
      <path d={d} stroke="#000" strokeWidth={ancho + 2 * BORDE} />
      <path d={d} stroke="#fff" strokeWidth={ancho} />
      <path d={d} stroke="currentColor" strokeWidth={ancho} data-lima="" />
    </>
  );

  // Un sólido: cuerpo blanco, versión del acento, detalle y el contorno arriba
  const solido = (forma, { detalle } = {}) => (
    <>
      {forma({ fill: "#fff" })}
      {forma({ fill: "currentColor", "data-lima": "" })}
      {detalle}
      {forma({ fill: "none", stroke: "#000", strokeWidth: 2 * BORDE })}
    </>
  );

  const partes = [
    {
      id: "encordado",
      forma: CUERDAS_INFLADA.map(({ d, vertical }, i) => (
        <g key={d} data-cuerda={i} data-sentido={vertical ? "vertical" : "horizontal"}>
          <path d={d} stroke="#000" strokeWidth={3.6} />
          <path d={d} stroke="#fff" strokeWidth={1.8} />
          <path d={d} stroke="currentColor" strokeWidth={1.8} data-lima="" />
        </g>
      )),
    },
    {
      id: "garganta",
      forma: (
        <>
          {tubo("M129.5 222.8C136 285 168 326 194 366", 12)}
          {tubo("M270.5 222.8C264 285 232 326 206 366", 12)}
        </>
      ),
    },
    {
      id: "marco",
      forma: tubo(MARCO_D, MARCO_TUBO.ancho),
    },
    {
      id: "protector",
      forma: tubo(
        arco(PROTECTOR_TUBO.rx, PROTECTOR_TUBO.ry, PROTECTOR.desde, PROTECTOR.hasta),
        PROTECTOR_TUBO.ancho,
      ),
    },
    {
      // Los agujeros, por encima del marco y del protector: negros, con el
      // centro del acento al resaltarlos
      id: "ojales",
      forma: OJALES.map(([x, y]) => (
        <g key={`${x} ${y}`}>
          <circle cx={x} cy={y} r={2.1} fill="#000" />
          <circle cx={x} cy={y} r={1.1} fill="currentColor" data-lima="" />
        </g>
      )),
    },
    {
      // El punto dulce es una zona, no una pieza: una mancha blanca traslúcida
      id: "punto-dulce",
      forma: (
        <>
          <ellipse cx={CX} cy={160} rx={30} ry={38} fill="#fff" fillOpacity="0.3" />
          <ellipse cx={CX} cy={160} rx={30} ry={38} fill="currentColor" fillOpacity="0.8" data-lima="" />
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
      forma: solido((p) => <rect x={188} y={245} width={24} height={10} rx={5} {...p} />),
    },
    {
      // Octogonal: arriba del grip se ven dos aristas de sus biseles
      id: "empunadura",
      forma: solido((p) => <rect x={188} y={346} width={24} height={182} rx={8} {...p} />, {
        detalle: (
          <path d="M196 352V378M204 352V378" stroke="#000" strokeWidth={1.2} strokeOpacity="0.35" />
        ),
      }),
    },
    {
      id: "grip",
      forma: solido((p) => <rect x={185} y={380} width={30} height={142} rx={9} {...p} />, {
        detalle: <path d="M205 386V516" stroke="#000" strokeWidth={1.2} strokeOpacity="0.35" />,
      }),
    },
    {
      id: "overgrip",
      forma: (
        <>
          {OVERGRIP_INFLADA.map((d, i) => (
            <g key={d} data-vuelta={i}>
              <path d={d} stroke="#000" strokeWidth={6 + 2 * 1.8} />
              <path d={d} stroke="#fff" strokeWidth={6} />
              <path d={d} stroke="currentColor" strokeWidth={6} data-lima="" />
            </g>
          ))}
          <g data-vuelta={OVERGRIP_INFLADA.length}>
            <path d="M182 392H218" stroke="#000" strokeWidth={8 + 2 * 1.8} />
            <path d="M182 392H218" stroke="#fff" strokeWidth={8} />
            <path d="M182 392H218" stroke="currentColor" strokeWidth={8} data-lima="" />
          </g>
        </>
      ),
    },
    {
      id: "tapon",
      forma: solido(
        (p) => <path d="M182 518H218V528Q218 541 205 541H195Q182 541 182 528Z" {...p} />,
      ),
    },
  ];

  return partes.map(({ id, forma }) => (
    <g key={id} data-parte={id} data-resaltada={resaltadas.includes(id) ? "" : undefined}>
      {forma}
    </g>
  ));
}

export const PARTES_RAQUETA = PARTES_LINEA.map((parte) => parte.id);

export default function Raqueta({
  ref,
  resaltadas = [],
  estilo = "linea",
  encuadre = "ajustado",
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
        <RaquetaInflada resaltadas={resaltadas} />
      ) : (
        <RaquetaLinea resaltadas={resaltadas} />
      )}
    </svg>
  );
}
