// Genera los videos del hero de la home a partir del video fuente.
// Uso: npm run video:hero  (requiere ffmpeg; en Windows: winget install Gyan.FFmpeg)
//
// Si cambiás el video fuente, revisá la configuración de abajo (tramo y recortes)
// y volvé a correrlo.
import { execFileSync } from "node:child_process";
import { existsSync, statSync } from "node:fs";
import path from "node:path";

const RAIZ = path.resolve(import.meta.dirname, "..");
const SALIDA = path.join(RAIZ, "public", "videos");

const CONFIG = {
  fuente: buscarFuente(),
  // Tramo del video fuente que se usa, en segundos: el clip entero (172
  // cuadros a 25 fps)
  inicio: 0,
  fin: 172 / 25,
  // Fundido cruzado entre el final y el principio. La fuente no cierra sola
  // (primer cuadro contra último: SSIM 0,58), así que el final se funde con el
  // principio para que el loop no salte.
  fundido: 1,
  fps: 25,
  maxBytes: 4 * 1024 * 1024,
  // Recortes en píxeles del video fuente (x, y, ancho, alto), sobre 4096×2160,
  // y la escala de salida: la fuente es 4K y entera no baja de 4 MB con buena
  // calidad
  versiones: [
    {
      nombre: "hero-desktop",
      // Entero
      recorte: { x: 0, y: 0, ancho: 4096, alto: 2160 },
      escala: { ancho: 1920, alto: 1012 },
      espejar: false,
    },
    {
      nombre: "hero-mobile",
      // 9:16 a alto completo que sigue al jugador: se mueve entre el 43% y el
      // 79% del ancho, más de lo que entra en un recorte fijo. `x` son puntos
      // clave [segundo, x] (el centro del jugador cada 20 cuadros, menos medio
      // recorte) y se interpola entre ellos. Termina donde empieza, así el
      // paneo también cierra el loop.
      recorte: {
        x: [
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
        y: 0,
        ancho: 1215,
        alto: 2160,
      },
      escala: { ancho: 720, alto: 1280 },
      espejar: false,
    },
  ],
};

function buscarFuente() {
  const candidatos = [
    "public/videos/fuentes/tenis.mp4",
  ].map((p) => path.join(RAIZ, p));
  const fuente = candidatos.find((p) => existsSync(p));
  if (!fuente) {
    throw new Error(`No encontré el video fuente. Probé:\n${candidatos.join("\n")}`);
  }
  return fuente;
}

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

function filtro({ recorte, escala, espejar }) {
  const { inicio, fin, fundido, fps } = CONFIG;
  const { x, y, ancho, alto } = recorte;
  const largo = fin - inicio;
  // Se recorta y después se escala a la resolución de salida
  const base = [
    `trim=${inicio}:${fin}`,
    "setpts=PTS-STARTPTS",
    `fps=${fps}`,
    `crop=${ancho}:${alto}:${posicion(x)}:${y}`,
    escala && `scale=${escala.ancho}:${escala.alto}:flags=lanczos`,
    espejar && "hflip",
    "format=yuv420p",
  ]
    .filter(Boolean)
    .join(",");

  if (!fundido) return `[0:v]${base}[v]`;

  // El cuerpo arranca en `fundido` y termina fundiéndose con los primeros
  // `fundido` segundos: al volver a empezar, el loop continúa sin salto.
  return [
    `[0:v]${base},split[a][b]`,
    `[a]trim=${fundido}:${largo},setpts=PTS-STARTPTS[cuerpo]`,
    `[b]trim=0:${fundido},setpts=PTS-STARTPTS[cola]`,
    `[cuerpo][cola]xfade=transition=fade:duration=${fundido}:offset=${largo - 2 * fundido}[v]`,
  ].join(";");
}

function codificar(version) {
  const destino = path.join(SALIDA, `${version.nombre}.mp4`);
  // Arranca con buena calidad y comprime más hasta quedar por debajo del límite
  for (let crf = 18; crf <= 36; crf += 2) {
    ffmpeg([
      "-i", CONFIG.fuente,
      "-filter_complex", filtro(version),
      "-map", "[v]",
      "-an",
      "-c:v", "libx264",
      "-preset", "slow",
      "-crf", String(crf),
      "-profile:v", "high",
      "-pix_fmt", "yuv420p",
      "-movflags", "+faststart",
      destino,
    ]);
    const bytes = statSync(destino).size;
    if (bytes < CONFIG.maxBytes) {
      console.log(`${version.nombre}.mp4: ${(bytes / 1024 / 1024).toFixed(2)} MB (crf ${crf})`);
      return destino;
    }
  }
  throw new Error(`${version.nombre}.mp4 no baja de ${CONFIG.maxBytes} bytes`);
}

function poster(version, video) {
  // El primer frame del video final, para que el cambio poster → video no se note
  const destino = path.join(SALIDA, `${version.nombre}.webp`);
  ffmpeg(["-i", video, "-frames:v", "1", "-c:v", "libwebp", "-quality", "80", destino]);
  const kb = statSync(destino).size / 1024;
  console.log(`${version.nombre}.webp: ${kb.toFixed(0)} KB`);
}

console.log(`Fuente: ${path.relative(RAIZ, CONFIG.fuente)}`);
for (const version of CONFIG.versiones) {
  poster(version, codificar(version));
}
