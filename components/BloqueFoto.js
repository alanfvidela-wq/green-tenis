import generadas from "@/lib/fotosGeneradas.json";
import Aparecer from "./Aparecer";
import FotoLugar from "./FotoLugar";

// Un bloque de foto entre secciones (un lugar de lib/fotos.js con uso
// «bloque»): de ancho completo dentro del contenido, decorativo
export default function BloqueFoto({ lugar, className }) {
  if (!lugar) return null;
  return (
    <div className={className} aria-hidden="true">
      <Aparecer>
        <FotoLugar
          lugar={lugar}
          foto={generadas.fotos[lugar.archivo]}
          sizes="(max-width: 1280px) 100vw, 1216px"
        />
      </Aparecer>
    </div>
  );
}
