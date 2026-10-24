// Optimiza las fotos de los lugares de la home (lib/fotos.js) para next/image.
// Uso: npm run fotos  (ver docs/FOTOS.md)
//
// Lee public/fotos/fuente/<archivo>.<ext> (fuera de git) y, por cada lugar
// con foto: la endereza según el EXIF, la recorta a la proporción exacta del
// lugar mirando dónde está lo importante, y genera AVIF y WebP en varios
// anchos en public/fotos/<archivo>-<ancho>.<formato>, sin agrandar nunca. Arma
// también el blur del placeholder (16px, en base64) y lee los créditos de
// public/fotos/fuente/CREDITOS.txt. Todo eso queda en lib/fotosGeneradas.json,
// que es lo que mira la página para elegir entre la foto y el placeholder.
// Usa sharp, que ya viene con Next.
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { ANCHOS_FOTOS, LADO_MINIMO_FOTOS, LUGARES_FOTOS } from "../lib/fotos.js";

const RAIZ = path.resolve(import.meta.dirname, "..");
const FUENTE = path.join(RAIZ, "public", "fotos", "fuente");
const SALIDA = path.join(RAIZ, "public", "fotos");
const MANIFIESTO = path.join(RAIZ, "lib", "fotosGeneradas.json");
const CREDITOS = path.join(FUENTE, "CREDITOS.txt");

const EXTENSIONES = [".jpg", ".jpeg", ".png", ".webp", ".avif", ".tif", ".tiff"];
const FORMATOS = {
  avif: (imagen) => imagen.avif({ quality: 52, effort: 4 }),
  webp: (imagen) => imagen.webp({ quality: 78, effort: 5 }),
};
const ANCHO_BLUR = 16;

const avisos = [];
const avisar = (texto) => avisos.push(texto);

// Las fotos fuente, por nombre sin extensión
function leerFuentes() {
  if (!existsSync(FUENTE)) return new Map();
  const fuentes = new Map();
  for (const nombre of readdirSync(FUENTE)) {
    const ext = path.extname(nombre).toLowerCase();
    if (!EXTENSIONES.includes(ext)) continue;
    const base = path.basename(nombre, path.extname(nombre));
    if (fuentes.has(base)) avisar(`Hay dos fotos para «${base}»: uso ${fuentes.get(base)}.`);
    else fuentes.set(base, nombre);
  }
  return fuentes;
}

// CREDITOS.txt: una línea por foto, «archivo | autor | fuente | url» (la url
// es opcional). Las líneas vacías y las que empiezan con # no cuentan.
function leerCreditos() {
  if (!existsSync(CREDITOS)) return new Map();
  const creditos = new Map();
  readFileSync(CREDITOS, "utf8")
    .split(/\r?\n/)
    .map((linea) => linea.trim())
    .filter((linea) => linea && !linea.startsWith("#"))
    .forEach((linea) => {
      const [archivo, autor, fuente, url] = linea.split("|").map((parte) => parte?.trim());
      if (!archivo || !autor || !fuente) {
        avisar(`CREDITOS.txt: «${linea}» no tiene archivo, autor y fuente.`);
        return;
      }
      creditos.set(archivo, { archivo, autor, fuente, ...(url ? { url } : {}) });
    });
  return creditos;
}

// Borra lo generado antes para un lugar
function borrarGeneradas(archivo) {
  if (!existsSync(SALIDA)) return;
  const patron = new RegExp(`^${archivo}-\\d+\\.(avif|webp)$`);
  for (const nombre of readdirSync(SALIDA)) {
    if (patron.test(nombre)) rmSync(path.join(SALIDA, nombre));
  }
}

async function optimizar(lugar, nombreFuente) {
  const ruta = path.join(FUENTE, nombreFuente);
  const meta = await sharp(ruta).metadata();
  // Las medidas ya enderezadas según el EXIF
  const { width, height } = meta.autoOrient ?? meta;
  const [pa, pb] = lugar.proporcion;

  if (Math.max(width, height) < LADO_MINIMO_FOTOS) {
    avisar(`${nombreFuente}: el lado largo mide ${Math.max(width, height)}px (mínimo ${LADO_MINIMO_FOTOS}).`);
  }

  // El recorte más grande con la proporción del lugar
  const anchoRecorte = Math.floor(Math.min(width, (height * pa) / pb));
  const anchos = ANCHOS_FOTOS.filter((ancho) => ancho <= anchoRecorte);
  if (!anchos.length) anchos.push(anchoRecorte);

  borrarGeneradas(lugar.archivo);
  const recortar = (ancho) =>
    sharp(ruta)
      .rotate()
      .resize({
        width: ancho,
        height: Math.round((ancho * pb) / pa),
        fit: "cover",
        position: sharp.strategy.attention,
      });

  for (const ancho of anchos) {
    for (const [formato, codificar] of Object.entries(FORMATOS)) {
      await codificar(recortar(ancho)).toFile(path.join(SALIDA, `${lugar.archivo}-${ancho}.${formato}`));
    }
  }

  const blur = await recortar(ANCHO_BLUR).webp({ quality: 40 }).toBuffer();
  const mayor = anchos.at(-1);
  return {
    ancho: mayor,
    alto: Math.round((mayor * pb) / pa),
    anchos,
    blur: `data:image/webp;base64,${blur.toString("base64")}`,
  };
}

mkdirSync(SALIDA, { recursive: true });
const fuentes = leerFuentes();
const creditos = leerCreditos();
const archivos = new Set(LUGARES_FOTOS.map((lugar) => lugar.archivo));

for (const base of fuentes.keys()) {
  if (!archivos.has(base)) {
    avisar(`${fuentes.get(base)} no corresponde a ningún lugar de lib/fotos.js.`);
  }
}

const manifiesto = { fotos: {}, creditos: [] };
const faltan = [];

for (const lugar of LUGARES_FOTOS) {
  const nombreFuente = fuentes.get(lugar.archivo);
  if (!nombreFuente) {
    // Sin foto: si había versiones de antes, se van
    borrarGeneradas(lugar.archivo);
    faltan.push(lugar.archivo);
    continue;
  }
  const foto = await optimizar(lugar, nombreFuente);
  manifiesto.fotos[lugar.archivo] = foto;
  console.log(`${lugar.archivo}: ${foto.anchos.join(", ")}px (AVIF y WebP)`);

  const credito = creditos.get(lugar.archivo);
  if (credito) manifiesto.creditos.push(credito);
  else avisar(`${lugar.archivo} no tiene crédito en CREDITOS.txt.`);
}

for (const archivo of creditos.keys()) {
  if (!manifiesto.fotos[archivo]) avisar(`CREDITOS.txt nombra «${archivo}», que no tiene foto.`);
}

writeFileSync(MANIFIESTO, `${JSON.stringify(manifiesto, null, 2)}\n`);

const hechas = Object.keys(manifiesto.fotos).length;
console.log(`\n${hechas} de ${LUGARES_FOTOS.length} lugares con foto.`);
if (faltan.length) console.log(`Faltan: ${faltan.join(", ")}.`);
for (const aviso of avisos) console.warn(`Aviso: ${aviso}`);
