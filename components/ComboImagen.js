import Image from "next/image";
import FotoVitrina from "./FotoVitrina";
import styles from "./ComboImagen.module.css";

// Dónde va cada foto en la celda de 4:5, en % del ancho de la celda (x y
// ancho) y de su alto (y). Las fotos son recortes en un lienzo de 4:5 con
// margen (el producto entero ocupa el 65% del alto), así que una capa de
// ancho a ocupa el a% del alto de la celda y su producto, bastante menos: la
// raqueta va más ancha que la celda para que se vea grande. Con raqueta, ella
// atrás y lo demás más chico adelante, abajo a la derecha; sin raqueta, el
// primero grande y los otros al lado, más chicos.
const CON_RAQUETA = {
  raqueta: { x: -18, y: -8, ancho: 110 },
  resto: [
    [{ x: 48, y: 48, ancho: 50 }],
    [
      { x: 26, y: 46, ancho: 50 },
      { x: 50, y: 50, ancho: 50 },
    ],
    [
      { x: 6, y: 50, ancho: 48 },
      { x: 28, y: 46, ancho: 48 },
      { x: 52, y: 50, ancho: 48 },
    ],
  ],
};

const SIN_RAQUETA = [
  [{ x: 0, y: 0, ancho: 100 }],
  [
    { x: -4, y: 4, ancho: 70 },
    { x: 42, y: 40, ancho: 58 },
  ],
  [
    { x: -4, y: 2, ancho: 62 },
    { x: 40, y: 10, ancho: 56 },
    { x: 24, y: 50, ancho: 50 },
  ],
];

function lugares(conRaqueta, cuantos) {
  if (conRaqueta) {
    const resto = CON_RAQUETA.resto[Math.min(cuantos, 3) - 1] ?? [];
    return [CON_RAQUETA.raqueta, ...resto];
  }
  return SIN_RAQUETA[Math.min(cuantos, 3) - 1];
}

// La imagen de un combo, armada con las fotos de sus productos (ver «Combos»
// en DESIGN.md): no es un archivo, así que cambia sola si cambia un producto
// o su foto. Llena una celda con position: relative, como FotoVitrina. Es una
// sola imagen para los lectores de pantalla (`alt`). Sin ninguna foto, el
// placeholder de su primer producto.
export default function ComboImagen({ combo, alt, sizes, prioridad = false, className = "" }) {
  const conFoto = combo.items.filter((item) => item.foto).slice(0, 4);
  if (conFoto.length === 0) {
    return <FotoVitrina foto={null} categoria={combo.items[0].producto.categoria} className={className} />;
  }

  const raqueta = conFoto.find((item) => item.producto.categoria === "raquetas");
  const capas = raqueta ? [raqueta, ...conFoto.filter((item) => item !== raqueta)] : conFoto;
  const posiciones = lugares(Boolean(raqueta), raqueta ? capas.length - 1 : capas.length);

  return (
    <div className={`${styles.imagen} ${className}`} role="img" aria-label={alt}>
      {capas.slice(0, posiciones.length).map((item, i) => (
        <div
          key={item.id}
          className={styles.capa}
          style={{
            "--x": `${posiciones[i].x}%`,
            "--y": `${posiciones[i].y}%`,
            "--ancho": `${posiciones[i].ancho}%`,
          }}
        >
          <Image
            src={item.foto}
            alt=""
            fill
            sizes={sizes}
            fetchPriority={prioridad && i === 0 ? "high" : undefined}
            loading={prioridad ? "eager" : undefined}
            className={styles.foto}
          />
        </div>
      ))}
    </div>
  );
}
