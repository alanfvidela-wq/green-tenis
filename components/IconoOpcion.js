// Los íconos de las opciones del quiz: dibujos de línea de 1,5px en el color
// del texto (blanco cuando la opción está elegida). Solo donde hay uno que se
// entiende solo; el brazo y la superficie van sin ícono. Son decorativos: el
// texto de la opción ya lo dice.

// Tres barras de menor a mayor, rellenas hasta el nivel
function Barras({ llenas }) {
  const barras = [
    { x: 4, y: 14, alto: 6 },
    { x: 10, y: 9, alto: 11 },
    { x: 16, y: 4, alto: 16 },
  ];
  return barras.map(({ x, y, alto }, i) => (
    <rect
      key={x}
      x={x}
      y={y}
      width="4"
      height={alto}
      rx="1"
      fill={i < llenas ? "currentColor" : "none"}
    />
  ));
}

// Un calendario con un día marcado por cada vez que se juega
function Calendario({ dias }) {
  return (
    <>
      <rect x="3" y="5" width="18" height="15" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
      {[8, 12, 16].slice(0, dias).map((cx) => (
        <circle key={cx} cx={cx} cy="15" r="1.4" fill="currentColor" stroke="none" />
      ))}
    </>
  );
}

// La cancha vista de arriba, con la red al medio y quien juega en la mitad de
// la izquierda: en el fondo, junto a la red o yendo de uno a otro
function Cancha({ lugar }) {
  return (
    <>
      <rect x="2" y="5" width="20" height="14" rx="1" />
      <path d="M12 3v18" />
      {lugar === "fondo" && <circle cx="5" cy="12" r="1.8" fill="currentColor" stroke="none" />}
      {lugar === "red" && <circle cx="9.2" cy="12" r="1.8" fill="currentColor" stroke="none" />}
      {lugar === "toda" && <path d="M4 12h6M5.6 10.4 4 12l1.6 1.6M8.4 10.4 10 12l-1.6 1.6" />}
    </>
  );
}

const DIBUJOS = {
  nivel: {
    principiante: <Barras llenas={1} />,
    intermedio: <Barras llenas={2} />,
    avanzado: <Barras llenas={3} />,
  },
  frecuencia: {
    ocasional: <Calendario dias={1} />,
    regular: <Calendario dias={2} />,
    intensiva: <Calendario dias={3} />,
  },
  estilo: {
    fondo: <Cancha lugar="fondo" />,
    red: <Cancha lugar="red" />,
    "all-court": <Cancha lugar="toda" />,
  },
  preferencia: {
    // La pelota, con sus costuras y las líneas de velocidad atrás
    potencia: (
      <>
        <circle cx="15" cy="12" r="6" />
        <path d="M11 8q2.8 4 0 8M19 8q-2.8 4 0 8M2.5 9H7M1.5 12H7M2.5 15H7" />
      </>
    ),
    // Un blanco: dos aros y el centro
    control: (
      <>
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="5" />
        <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
      </>
    ),
  },
};

export function tieneIcono(pregunta) {
  return Boolean(DIBUJOS[pregunta]);
}

export default function IconoOpcion({ pregunta, valor, className }) {
  const dibujo = DIBUJOS[pregunta]?.[valor];
  if (!dibujo) return null;
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {dibujo}
    </svg>
  );
}
