import { getImageProps } from "next/image";
import { orientacion } from "@/lib/fotos";
import styles from "./FotoLugar.module.css";

// El ancho que ocupa cada orientación (igual que en FotoLugar.module.css)
const SIZES = {
  vertical: "(max-width: 759px) 76vw, 28vw",
  horizontal: "(max-width: 759px) 88vw, 40vw",
  cuadrada: "(max-width: 759px) 72vw, 30vw",
};

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

// Un lugar de foto de la banda (ver «Fotos al scrollear» en DESIGN.md). La
// caja de afuera queda quieta y reserva el espacio (la foto con su proporción
// exacta y el pie); el recuadro de adentro es lo que gira y se mueve
// (MovimientoFotos). Debajo de la foto, el pie dice lo que se ve. Sin foto
// generada, el placeholder: el color de una superficie, con grano, el nombre
// del archivo y qué foto buscar.
export default function FotoLugar({ lugar, foto }) {
  const [a, b] = lugar.proporcion;
  const forma = orientacion(lugar.proporcion);

  return (
    <div className={styles.lugar} data-lado={lugar.lado} data-mobile={lugar.mobile ? "" : undefined}>
      <figure
        className={`${styles.caja} ${styles[forma]}`}
        style={{ "--proporcion": `${a} / ${b}`, "--relacion": a / b, "--giro": `${lugar.giro}deg` }}
        data-foto
        data-giro={lugar.giro}
        data-velocidad={lugar.velocidad}
      >
        <div className={styles.recuadro} data-recuadro>
          {foto ? (
            <div className={styles.marco}>
              <Foto archivo={lugar.archivo} foto={foto} sizes={SIZES[forma]} />
            </div>
          ) : (
            <div className={`${styles.marco} ${styles.placeholder} ${styles[lugar.superficie]}`}>
              <p className={styles.archivo}>
                {lugar.archivo} · {a}:{b}
              </p>
              <p className={styles.descripcion}>{lugar.descripcion}</p>
            </div>
          )}
          <figcaption className={styles.pie}>{lugar.pie}</figcaption>
        </div>
      </figure>
    </div>
  );
}
