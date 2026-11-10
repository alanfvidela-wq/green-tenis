import sharp from "sharp";
import { TAMANO_COMPARTIR } from "./sitio";

// La imagen de un producto o de un combo al compartir su link: sus fotos de
// estudio sobre el fondo de estudio, sin texto (ver «Vitrina de productos» en
// DESIGN.md), en un JPG de 1200 × 630. Hace falta armarla porque las fotos
// son recortes WebP de 4:5 con fondo transparente: una vista previa las
// mostraría sobre negro, o no las mostraría. Usa sharp, que ya viene con Next
// (ImageResponse no lee WebP).

const ESTUDIO = "#F4F5F2";

// La primera foto (en un combo, la raqueta), más alta que la imagen: el
// recorte trae margen (el producto ocupa el 65% del alto) y así el producto
// llega casi de borde a borde. De la foto queda la franja del medio.
const ALTO = 880;

// En un combo, la primera va atrás a la izquierda y las demás (hasta dos),
// más chicas, adelante a la derecha: como ComboImagen en la vitrina
const ALTO_RESTO = 600;
const IZQUIERDA_COMBO = 40;
const IZQUIERDA_RESTO = [[620], [480, 720]];

const ancho = (alto) => (alto * 4) / 5;

// La imagen de una ficha («/producto/<slug>», «/combo/<slug>»), para
// `compartir` (lib/sitio.js)
export function imagenDeFicha(ruta, alt) {
  return { url: `${ruta}/og.jpg`, ...TAMANO_COMPARTIR, alt };
}

// Las fotos de un combo para su imagen: la de cada cosa que trae (como
// ComboImagen, no es un archivo)
export function fotosDeCombo(combo) {
  return combo.items.map((item) => item.foto).filter(Boolean);
}

// Una foto a `alto` px, recortada al alto de la imagen si la pasa
async function capa(foto, alto) {
  const respuesta = await fetch(foto);
  if (!respuesta.ok) throw new Error(`No se pudo leer la foto ${foto}: ${respuesta.status}`);
  const visible = Math.min(alto, TAMANO_COMPARTIR.height);
  return sharp(Buffer.from(await respuesta.arrayBuffer()))
    .resize(ancho(alto), alto, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .extract({ left: 0, top: (alto - visible) / 2, width: ancho(alto), height: visible })
    .png()
    .toBuffer();
}

// La respuesta con la imagen. `fotos`: las URLs (se usan hasta tres). Una
// sola va centrada.
export async function imagenCompartir(fotos) {
  const { width, height } = TAMANO_COMPARTIR;
  const [primera, ...resto] = fotos.slice(0, 3);
  const capas = [
    {
      input: await capa(primera, ALTO),
      left: resto.length > 0 ? IZQUIERDA_COMBO : (width - ancho(ALTO)) / 2,
      top: 0,
    },
    ...(await Promise.all(
      resto.map(async (foto, i) => ({
        input: await capa(foto, ALTO_RESTO),
        left: IZQUIERDA_RESTO[resto.length - 1][i],
        top: height - ALTO_RESTO,
      })),
    )),
  ];

  const imagen = await sharp({ create: { width, height, channels: 3, background: ESTUDIO } })
    .composite(capas)
    .jpeg({ quality: 85, mozjpeg: true })
    .toBuffer();

  return new Response(imagen, {
    headers: {
      "Content-Type": "image/jpeg",
      // Una hora: la dirección no cambia cuando cambia la foto
      "Cache-Control": "public, max-age=3600",
    },
  });
}
