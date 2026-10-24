import { getImageProps } from "next/image";
import styles from "./FotoLugar.module.css";

const srcSet = (archivo, anchos, formato) =>
  anchos.map((ancho) => `/fotos/${archivo}-${ancho}.${formato} ${ancho}w`).join(", ");

// La foto optimizada por `npm run fotos`: AVIF con WebP de respaldo, en los
// anchos generados, lazy y con el blur del manifiesto mientras carga
function Foto({ archivo, foto, sizes }) {
  const cargador = ({ src, width }) => {
    const ancho = foto.anchos.find((a) => a >= width) ?? foto.anchos.at(-1);
    return `${src}-${ancho}.webp`;
  };
  const { props } = getImageProps({
    src: `/fotos/${archivo}`,
    alt: "",
    width: foto.ancho,
    height: foto.alto,
    sizes,
    loader: cargador,
    placeholder: "blur",
    blurDataURL: foto.blur,
  });
  return (
    <picture>
      <source type="image/avif" srcSet={srcSet(archivo, foto.anchos, "avif")} sizes={sizes} />
      <img {...props} alt="" srcSet={srcSet(archivo, foto.anchos, "webp")} className={styles.imagen} />
    </picture>
  );
}

// Una foto de un lugar de lib/fotos.js (ver «Fotos» en DESIGN.md): una celda
// de la vitrina (`llenar`: ocupa todo el alto de la celda) o un bloque grande
// entre secciones (con su proporción exacta, que reserva el espacio). Sin texto
// encima. Sin foto generada, el placeholder: gris claro, con el nombre del
// archivo y qué foto buscar.
export default function FotoLugar({ lugar, foto, sizes, llenar = false, className = "" }) {
  const [a, b] = lugar.proporcion;
  return (
    <div
      className={`${styles.foto} ${llenar ? styles.llenar : ""} ${className}`}
      style={llenar ? undefined : { aspectRatio: `${a} / ${b}` }}
    >
      {foto ? (
        <Foto archivo={lugar.archivo} foto={foto} sizes={sizes} />
      ) : (
        <div className={styles.placeholder}>
          <p className={styles.archivo}>
            {lugar.archivo} · {a}:{b}
          </p>
          <p className={styles.descripcion}>{lugar.descripcion}</p>
        </div>
      )}
    </div>
  );
}
