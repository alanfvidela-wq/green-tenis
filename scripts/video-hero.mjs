// Genera los clips del hero de la home a partir de los videos fuente.
// Uso: npm run video:hero  (requiere ffmpeg; en Windows: winget install Gyan.FFmpeg)
//
// Cada clip sale en dos versiones (desktop, el cuadro entero en 1080p, y
// mobile, un recorte 9:16 en 720p), cada una en MP4 (H.264) y WebM (VP9), sin
// audio, con su poster en WebP (el primer cuadro). El hero los pasa en
// secuencia con un fundido entre uno y otro (VideoFondo). Todo queda anotado
// en lib/videosHero.json, con los créditos de
// public/videos/fuentes/CREDITOS.txt, que el footer muestra.
//
// Si cambiás un video fuente, revisá su configuración de abajo (tramo y
// recorte de mobile) y volvé a correrlo.
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";

const RAIZ = path.resolve(import.meta.dirname, "..");
const FUENTES = path.join(RAIZ, "public", "videos", "fuentes");
const SALIDA = path.join(RAIZ, "public", "videos");
const MANIFIESTO = path.join(RAIZ, "lib", "videosHero.json");
const CREDITOS = path.join(FUENTES, "CREDITOS.txt");
const FPS = 25;

// Los clips, en el orden en que pasan. Las fuentes son 4096×2160 a 25 fps.
// `inicio` y `fin` son el tramo que se usa, en segundos (de 5 a 8). `mobile`
// es la `x` del recorte 9:16 (1215×2160, a alto completo): un número fijo, o
// puntos clave [segundo, x] (el centro del jugador menos medio recorte) que
// se interpolan en línea recta.
const CLIPS = [
  {
    nombre: "jugador",
    fuente: "tenis.mp4",
    inicio: 0,
    fin: 172 / 25,
    // El jugador se mueve entre el 43% y el 79% del ancho, más de lo que
    // entra en un recorte fijo
    mobile: [
      [0, 1728],
      [0.8, 1359],
      [1.6, 1154],
      [2.4, 1318],
      [3.2, 2178],
      [4.0, 2629],
      [4.8, 2219],
      [5.6, 1605],
      [6.4, 1523],
      [6.88, 1728],
    ],
  },
  {
    nombre: "pique",
    fuente: "pexels-5730485.mp4",
    // El pique antes del saque (los pies) y la cámara que sube hasta el
    // jugador. El saque, de 9,5 a 12 s, queda afuera.
    inicio: 0,
    fin: 7,
    // Los pies y después el jugador, siempre cerca del centro (49%)
    mobile: 1400,
  },
  {
    nombre: "derecha",
    fuente: "pexels-5740600.mp4",
    // Entero: la derecha frente al cartel y el jugador que se acerca
    inicio: 0,
    fin: 190 / 25,
    mobile: [
      [0, 867],
      [1, 1154],
      [2, 1031],
      [2.75, 785],
      [3.5, 1031],
      [4.5, 1154],
      [5, 1318],
      [5.5, 1522],
      [6, 1600],
      [6.5, 1600],
      [7, 1522],
      [7.6, 1440],
    ],
  },
];

// Las dos versiones. El tope de peso es por archivo: se arranca con buena
// calidad y se comprime más hasta quedar por debajo. La capa negra del hero
// (55%) disimula la compresión.
const VERSIONES = [
  {
    nombre: "desktop",
    recorte: () => ({ x: 0, ancho: 4096 }),
    escala: { ancho: 1920, alto: 1012 },
    maxBytes: 2.5 * 1024 * 1024,
  },
  {
    nombre: "mobile",
    recorte: (clip) => ({ x: clip.mobile, ancho: 1215 }),
    escala: { ancho: 720, alto: 1280 },
    maxBytes: 1.5 * 1024 * 1024,
  },
];

const FORMATOS = [
  {
    extension: "mp4",
    calidades: [22, 24, 26, 28, 30, 32],
    argumentos: (crf) => [
      "-c:v", "libx264",
      "-preset", "slow",
      "-crf", String(crf),
      "-profile:v", "high",
      "-pix_fmt", "yuv420p",
      "-movflags", "+faststart",
    ],
  },
  {
    extension: "webm",
    calidades: [34, 36, 38, 40, 42, 44],
    argumentos: (crf) => [
      "-c:v", "libvpx-vp9",
      "-crf", String(crf),
      "-b:v", "0",
      "-deadline", "good",
      "-cpu-used", "2",
      "-row-mt", "1",
      "-pix_fmt", "yuv420p",
    ],
  },
];

function buscarFfmpeg() {
  const links = process.env.LOCALAPPDATA
    ? path.join(process.env.LOCALAPPDATA, "Microsoft", "WinGet", "Links", "ffmpeg.exe")
    : null;
  for (const bin of ["ffmpeg", links].filter(Boolean)) {
    try {
      execFileSync(bin, ["-version"], { stdio: "ignore" });
      return bin;
    } catch {}
  }
  throw new Error("No encontré ffmpeg. En Windows: winget install Gyan.FFmpeg");
}

const FFMPEG = buscarFfmpeg();

function ffmpeg(args) {
  execFileSync(FFMPEG, ["-hide_banner", "-loglevel", "error", "-y", ...args], {
    stdio: "inherit",
  });
}

// Posición del recorte: un número fijo, o puntos clave [segundo, x] que se
// interpolan en línea recta (una expresión de ffmpeg evaluada en cada cuadro)
function posicion(valor) {
  if (!Array.isArray(valor)) return valor;
  let expresion = String(valor.at(-1)[1]);
  for (let i = valor.length - 2; i >= 0; i--) {
    const [t0, x0] = valor[i];
    const [t1, x1] = valor[i + 1];
    expresion = `if(lt(t,${t1}),${x0}+(${x1 - x0})*(t-${t0})/${t1 - t0},${expresion})`;
  }
  return `'${expresion}'`;
}

// Se corta el tramo, se recorta y después se escala a la resolución de salida
function filtro(clip, version) {
  const { x, ancho } = version.recorte(clip);
  return [
    `trim=${clip.inicio}:${clip.fin}`,
    "setpts=PTS-STARTPTS",
    `fps=${FPS}`,
    `crop=${ancho}:2160:${posicion(x)}:0`,
    `scale=${version.escala.ancho}:${version.escala.alto}:flags=lanczos`,
    "format=yuv420p",
  ].join(",");
}

function codificar(clip, version, formato) {
  const archivo = `hero-${clip.nombre}-${version.nombre}.${formato.extension}`;
  const destino = path.join(SALIDA, archivo);
  for (const crf of formato.calidades) {
    ffmpeg([
      "-i", path.join(FUENTES, clip.fuente),
      "-vf", filtro(clip, version),
      "-an",
      ...formato.argumentos(crf),
      destino,
    ]);
    const bytes = statSync(destino).size;
    if (bytes < version.maxBytes) {
      console.log(`  ${archivo}: ${(bytes / 1024 / 1024).toFixed(2)} MB (crf ${crf})`);
      return { archivo, bytes };
    }
  }
  throw new Error(`${archivo} no baja de ${version.maxBytes} bytes`);
}

// El primer cuadro del MP4 final, para que el cambio poster → video no se note
function poster(clip, version, mp4) {
  const archivo = `hero-${clip.nombre}-${version.nombre}.webp`;
  ffmpeg(["-i", path.join(SALIDA, mp4), "-frames:v", "1", "-c:v", "libwebp", "-quality", "80", path.join(SALIDA, archivo)]);
  console.log(`  ${archivo}: ${(statSync(path.join(SALIDA, archivo)).size / 1024).toFixed(0)} KB`);
  return archivo;
}

// CREDITOS.txt: una línea por video fuente, «archivo | autor | fuente | url»
// (la url es opcional; las líneas con # se saltean), como el de las fotos
function leerCreditos() {
  if (!existsSync(CREDITOS)) return new Map();
  const creditos = new Map();
  for (const linea of readFileSync(CREDITOS, "utf8").split(/\r?\n/)) {
    if (!linea.trim() || linea.trim().startsWith("#")) continue;
    const [archivo, autor, fuente, url] = linea.split("|").map((parte) => parte.trim());
    if (!archivo || !autor || !fuente) {
      console.warn(`Aviso: CREDITOS.txt: «${linea}» no tiene archivo, autor y fuente.`);
      continue;
    }
    creditos.set(archivo, { archivo, autor, fuente, ...(url ? { url } : {}) });
  }
  return creditos;
}

const creditos = leerCreditos();
const manifiesto = { clips: [], creditos: [] };
for (const clip of CLIPS) {
  if (!existsSync(path.join(FUENTES, clip.fuente))) {
    throw new Error(`No encontré el video fuente public/videos/fuentes/${clip.fuente}`);
  }
  console.log(`${clip.nombre} (${clip.fuente}, de ${clip.inicio} a ${clip.fin.toFixed(2)} s)`);
  const salida = { nombre: clip.nombre, duracion: Number((clip.fin - clip.inicio).toFixed(2)) };
  for (const version of VERSIONES) {
    const [mp4, webm] = FORMATOS.map((formato) => codificar(clip, version, formato));
    salida[version.nombre] = {
      mp4: `/videos/${mp4.archivo}`,
      webm: `/videos/${webm.archivo}`,
      poster: `/videos/${poster(clip, version, mp4.archivo)}`,
    };
  }
  manifiesto.clips.push(salida);
  // Con el nombre del clip, que el footer usa de texto del link
  const credito = creditos.get(clip.fuente);
  if (credito) manifiesto.creditos.push({ ...credito, clip: clip.nombre });
  else console.warn(`Aviso: ${clip.fuente} no tiene crédito en CREDITOS.txt.`);
}
writeFileSync(MANIFIESTO, `${JSON.stringify(manifiesto, null, 2)}\n`);
console.log(`\n${manifiesto.clips.length} clips anotados en ${path.relative(RAIZ, MANIFIESTO)}.`);
