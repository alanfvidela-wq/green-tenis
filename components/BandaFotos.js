import generadas from "@/lib/fotosGeneradas.json";
import { numeroDeLugar } from "@/lib/fotos";
import FotoLugar from "./FotoLugar";
import MovimientoFotos from "./MovimientoFotos";
import styles from "./FotoLugar.module.css";

// Una banda de fotos al scrollear, entre dos secciones. Es decorativa (no
// suma contenido), así que va oculta para lectores de pantalla. Las fotos no
// salen de la banda: nunca pisan texto ni botones.
export default function BandaFotos({ lugares, className = "" }) {
  return (
    <div className={`${styles.banda} ${className}`} aria-hidden="true">
      <MovimientoFotos>
        {lugares.map((lugar) => (
          <FotoLugar
            key={lugar.archivo}
            lugar={lugar}
            foto={generadas.fotos[lugar.archivo]}
            numero={numeroDeLugar(lugar.archivo)}
          />
        ))}
      </MovimientoFotos>
    </div>
  );
}
