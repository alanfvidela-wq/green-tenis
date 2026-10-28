// Fotos de producto para la vitrina: recortes sin fondo, centrados y con el
// mismo margen. Uso (ver «Fotos de producto» en DESIGN.md):
//   npm run fotos:productos                    todas las de la carpeta
//   npm run fotos:productos -- babolat-pure-drive   solo las de esos slugs
//   npm run fotos:productos -- --sin-subir     procesa y no sube nada
//
// Lee public/productos/fuente/<slug>-<n>.(png|jpg|jpeg|webp) (fuera de git),
// donde <slug> es el de un producto o un combo y <n> el orden de la foto (1 es
// la de la vitrina). A cada una le saca el fondo (si ya venía sin fondo, lo
// transparente se respeta), borra los restos sueltos, la recorta al contorno
// del producto y la centra en un cuadrado transparente con el mismo margen que
// las demás. Exporta AVIF y WebP con transparencia en
// public/productos/fuente/procesadas/ (para revisarlas) y los sube al bucket
// «productos» de Supabase Storage como recortes/<slug>-<n>.(webp|avif). La
// fila en la tabla fotos (la ruta del WebP y el orden) la escribe la función
// guardar_foto (0006_guardar_foto.sql): la clave secreta no tiene permisos
// sobre las tablas. Volver a correrlo reemplaza la foto y la fila de ese orden.
//
// Viene del script de fotos de la época de Amargo (en el historial de git).
import { existsSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { removeBackground } from "@imgly/background-removal-node";
import { createClient } from "@supabase/supabase-js";

// Se usa el sharp que trae @imgly/background-removal-node: si se cargan dos
// versiones de sharp (libvips) en el mismo proceso, Node se cae.
const requerir = createRequire(import.meta.url);
const sharp = createRequire(requerir.resolve("@imgly/background-removal-node"))("sharp");

const RAIZ = path.resolve(import.meta.dirname, "..");
const FUENTE = path.join(RAIZ, "public", "productos", "fuente");
const PROCESADAS = path.join(FUENTE, "procesadas");
const BUCKET = "productos";
const CARPETA = "recortes";

// Un cuadrado de 1600px; el producto entra en la caja del medio, con el mismo
// margen transparente (5% por lado) en todas
const LADO = 1600;
const CAJA = 1440;

const EXTENSIONES = [".png", ".jpg", ".jpeg", ".webp"];
const NOMBRE = /^(?<slug>[a-z0-9]+(?:-[a-z0-9]+)*)-(?<orden>\d+)$/;

const argumentos = process.argv.slice(2);
const sinSubir = argumentos.includes("--sin-subir");
const pedidos = argumentos.filter((a) => !a.startsWith("--"));

// Afirma la máscara y borra los restos sueltos que deja el recorte del fondo
// (un pedazo de cartel, una sombra): se queda con las piezas de al menos 10%
// del tamaño de la mayor.
async function limpiar(png) {
  const { data, info } = await sharp(png).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height } = info;
  // El modelo deja semitransparentes las zonas claras o lisas del producto (el
  // blanco de un tubo, una manija): se vuelven opacas y el borde queda suave.
  for (let i = 3; i < data.length; i += 4) {
    data[i] = data[i] < 24 ? 0 : Math.min(255, (data[i] - 24) * 2.5);
  }
  const etiquetas = new Int32Array(width * height);
  const areas = [0];
  const pila = [];
  for (let inicio = 0; inicio < width * height; inicio++) {
    if (etiquetas[inicio] || data[inicio * 4 + 3] <= 16) continue;
    const etiqueta = areas.length;
    let area = 0;
    etiquetas[inicio] = etiqueta;
    pila.push(inicio);
    while (pila.length) {
      const i = pila.pop();
      area++;
      const x = i % width;
      const vecinos = [x > 0 ? i - 1 : -1, x < width - 1 ? i + 1 : -1, i - width, i + width];
      for (const v of vecinos) {
        if (v < 0 || v >= width * height) continue;
        if (etiquetas[v] || data[v * 4 + 3] <= 16) continue;
        etiquetas[v] = etiqueta;
        pila.push(v);
      }
    }
    areas.push(area);
  }
  const minimo = Math.max(...areas) * 0.1;
  for (let i = 0; i < width * height; i++) {
    if (etiquetas[i] && areas[etiquetas[i]] < minimo) data[i * 4 + 3] = 0;
  }
  return sharp(data, { raw: { width, height, channels: 4 } }).png().toBuffer();
}

// Caja mínima que contiene los píxeles visibles (alfa > 16)
async function contorno(png) {
  const { data, info } = await sharp(png).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let [x0, y0, x1, y1] = [info.width, info.height, -1, -1];
  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      if (data[(y * info.width + x) * 4 + 3] > 16) {
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
      }
    }
  }
  if (x1 < 0) throw new Error("no quedó nada después de sacar el fondo");
  return { left: x0, top: y0, width: x1 - x0 + 1, height: y1 - y0 + 1 };
}

// Lo que en el original ya era transparente sigue transparente. Con una foto
// que viene sin fondo, el modelo vuelve opacas zonas como el hueco entre las
// cuerdas y deja ver el color que el original tenía escondido ahí. Con una foto
// con fondo (sin transparencia), no cambia nada.
async function respetarAlfa(png, original) {
  const { data, info } = await sharp(png).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const alfa = await sharp(original)
    .ensureAlpha()
    .resize(info.width, info.height, { fit: "fill" })
    .extractChannel(3)
    .raw()
    .toBuffer();
  for (let i = 0; i < alfa.length; i++) {
    if (alfa[i] < data[i * 4 + 3]) data[i * 4 + 3] = alfa[i];
  }
  return sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } }).png().toBuffer();
}

// La foto lista: sin fondo, recortada y centrada en el cuadrado transparente
async function recortar(ruta) {
  const entrada = await sharp(ruta).rotate().png().toBuffer();
  const sinFondo = await removeBackground(new Blob([entrada], { type: "image/png" }), {
    model: "medium",
    output: { format: "image/png" },
  });
  const png = await respetarAlfa(await limpiar(Buffer.from(await sinFondo.arrayBuffer())), entrada);
  const recortada = await sharp(png)
    .extract(await contorno(png))
    .resize(CAJA, CAJA, { fit: "inside", withoutEnlargement: false })
    .toBuffer({ resolveWithObject: true });
  const { width, height } = recortada.info;
  return sharp({
    create: { width: LADO, height: LADO, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite([
      {
        input: recortada.data,
        left: Math.round((LADO - width) / 2),
        top: Math.round((LADO - height) / 2),
      },
    ])
    .png()
    .toBuffer();
}

// Sube el WebP y el AVIF y anota la foto con guardar_foto, que busca el
// producto o combo por el slug y crea o reemplaza la fila de ese orden.
// Devuelve false si no hay producto ni combo con ese slug: entonces borra lo
// que acaba de subir.
async function subir(supabase, { slug, orden, webp, avif }) {
  const ruta = `${CARPETA}/${slug}-${orden}.webp`;
  const archivos = [
    [ruta, webp, "image/webp"],
    [`${CARPETA}/${slug}-${orden}.avif`, avif, "image/avif"],
  ];
  for (const [archivo, datos, tipo] of archivos) {
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(archivo, datos, { contentType: tipo, upsert: true, cacheControl: "3600" });
    if (error) throw new Error(`no se pudo subir ${archivo}: ${error.message}`);
  }
  const { data: guardada, error } = await supabase.rpc("guardar_foto", { slug, orden });
  if (error) throw new Error(`no se pudo guardar la foto ${slug}-${orden}: ${error.message}`);
  if (guardada === null) {
    await supabase.storage.from(BUCKET).remove(archivos.map(([archivo]) => archivo));
    return false;
  }
  // La ruta la arma la base; si no es la del archivo subido, la tienda no lo encontraría
  if (guardada !== ruta) throw new Error(`guardar_foto guardó ${guardada} en vez de ${ruta}`);
  return true;
}

if (!existsSync(FUENTE)) {
  console.log(`No hay fotos: poné los originales en ${path.relative(RAIZ, FUENTE)}/`);
  process.exit(0);
}
mkdirSync(PROCESADAS, { recursive: true });

const fotos = readdirSync(FUENTE)
  .filter((nombre) => EXTENSIONES.includes(path.extname(nombre).toLowerCase()))
  .map((nombre) => ({ nombre, partes: NOMBRE.exec(path.basename(nombre, path.extname(nombre)))?.groups }))
  .filter(({ nombre, partes }) => {
    if (partes) return true;
    console.warn(`Aviso: ${nombre} no se llama <slug>-<n>; se saltea.`);
    return false;
  })
  .filter(({ partes }) => !pedidos.length || pedidos.includes(partes.slug));

let supabase = null;
if (!sinSubir && fotos.length) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const clave = process.env.SUPABASE_SECRET_KEY;
  if (!url || !clave) {
    throw new Error("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SECRET_KEY (en .env.local)");
  }
  supabase = createClient(url, clave, { auth: { persistSession: false, autoRefreshToken: false } });
}

let hechas = 0;
for (const { nombre, partes } of fotos) {
  const slug = partes.slug;
  const orden = Number(partes.orden);
  process.stdout.write(`${nombre}… `);
  const png = await recortar(path.join(FUENTE, nombre));
  const webp = await sharp(png).webp({ quality: 82, alphaQuality: 90, effort: 5 }).toBuffer();
  const avif = await sharp(png).avif({ quality: 60, effort: 4 }).toBuffer();
  writeFileSync(path.join(PROCESADAS, `${slug}-${orden}.webp`), webp);
  writeFileSync(path.join(PROCESADAS, `${slug}-${orden}.avif`), avif);
  if (supabase && !(await subir(supabase, { slug, orden, webp, avif }))) {
    console.log(`no hay producto ni combo «${slug}»: no se subió`);
    continue;
  }
  hechas++;
  console.log(sinSubir ? "lista (sin subir)" : "subida");
}

console.log(`\n${hechas} de ${fotos.length} fotos. Revisalas en ${path.relative(RAIZ, PROCESADAS)}/.`);
