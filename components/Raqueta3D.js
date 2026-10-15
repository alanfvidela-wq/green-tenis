"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, useGLTF } from "@react-three/drei";
import { Color, MathUtils, Vector3 } from "three";

// La raqueta 3D de «Anatomía de una raqueta» (ver DESIGN.md). Se carga con
// dynamic import y sin SSR desde AnatomiaRaqueta, que le pasa el progreso del
// scroll (estado.current.p), dónde está la escena dentro del lienzo (medidas)
// y a quién avisar dónde va el sticker del paso activo (onMarca).
//
// El modelo (public/models/raqueta.glb, optimizado con meshopt y texturas
// WebP) trae tres mallas: el marco entero (con garganta, mango y tapa) y el
// encordado en dos mallas. Por eso el encordado se resalta en lima y el resto
// de las partes se marca con el sticker anclado a su posición 3D.

export const URL_RAQUETA = "/models/raqueta.glb";

// Medidas del modelo, en centímetros: de la tapa (y = 0) a la punta
const LARGO = 70.5;
const COMPLETA = { y: LARGO / 2, zoom: 1 };
// El final: la raqueta entera, un poco más lejos y más arriba, para dejar
// lugar al botón debajo
const FINAL = { y: LARGO / 2 - 4, zoom: 0.82 };
// Tramos del final (fin va de 0 a 1): los stickers juntos, la vuelta de 360°
// y, después, la rotación lenta
const STICKERS = [0.1, 0.38];
const VUELTA = [0.36, 0.86];
const GIRO_LENTO = 0.18; // radianes por segundo
const VUELTA_COMPLETA = Math.PI * 2;
const FOV = 30;
// La cámara mira de frente, un poco desde la derecha y desde arriba
const AZIMUT = 0.32;
const ELEVACION = 0.1;
const LIMA = "#dcf900";

const limitar = (n, min, max) => Math.min(max, Math.max(min, n));
const suavizar = (t) => t * t * (3 - 2 * t);

function Escena({ pasos, estado, medidas, onMarca, onListo, mobile }) {
  const { scene } = useGLTF(URL_RAQUETA, false, true);
  const grupo = useRef(null);
  const disco = useRef(null);
  const { camera, size } = useThree();

  // El export viene acostado (una rotación en la raíz): se endereza para que
  // quede vertical, con la cara del encordado hacia la cámara. Las cuerdas
  // llevan su propio material para poder brillar en lima.
  useMemo(() => {
    const raiz = scene.children[0];
    raiz.position.set(0, 0, 0);
    raiz.quaternion.identity();
    raiz.scale.set(1, 1, 1);
    scene.traverse((objeto) => {
      if (objeto.isMesh && objeto.parent?.name?.startsWith("Tails_PowerShoot_l")) {
        objeto.material = objeto.material.clone();
        objeto.material.emissive = new Color(LIMA);
        objeto.material.emissiveIntensity = 0;
        objeto.userData.cuerda = true;
      }
    });
  }, [scene]);

  useEffect(() => {
    onListo();
  }, [onListo]);

  // Los materiales de las cuerdas cambian en cada cuadro: se buscan una vez
  // dentro del grupo y quedan en un ref
  const refCuerdas = useRef(null);

  const focos = useMemo(
    () => [COMPLETA, ...pasos.map((paso) => paso.foco3d), FINAL],
    [pasos],
  );
  const mirada = useRef(null);
  const giroLento = useRef(0);
  const ancla = useMemo(() => new Vector3(), []);

  useFrame((state, delta) => {
    const { p, fin } = estado.current;

    // Adónde mira la cámara: de foco en foco, con entrada y salida suaves
    const q = p + 1;
    const k = limitar(Math.floor(q), 0, focos.length - 2);
    const t = suavizar(limitar(q - k, 0, 1));
    const y = MathUtils.lerp(focos[k].y, focos[k + 1].y, t);
    const zoom = MathUtils.lerp(focos[k].zoom, focos[k + 1].zoom, t);

    // Distancia para que la raqueta entera ocupe el alto de la escena
    const completa =
      (LARGO * 1.06) / 2 / Math.tan((FOV * Math.PI) / 360) / medidas.current.fraccion;
    const distancia = completa / zoom;

    // Con un poco de inercia
    const m = mirada.current ?? (mirada.current = { y, distancia });
    m.y = MathUtils.damp(m.y, y, 4, delta);
    m.distancia = MathUtils.damp(m.distancia, distancia, 4, delta);
    camera.position.set(
      Math.sin(AZIMUT) * Math.cos(ELEVACION) * m.distancia,
      m.y + Math.sin(ELEVACION) * m.distancia,
      Math.cos(AZIMUT) * Math.cos(ELEVACION) * m.distancia,
    );
    camera.lookAt(0, m.y, 0);
    camera.updateMatrixWorld();

    // Flota y gira apenas. En el final da una vuelta entera atada al scroll y
    // después sigue girando muy lento; si se vuelve para atrás, el giro lento
    // se desarma hasta la vuelta más cercana, sin saltos.
    const tiempo = state.clock.elapsedTime;
    const vuelta = suavizar(limitar((fin - VUELTA[0]) / (VUELTA[1] - VUELTA[0]), 0, 1));
    if (fin >= VUELTA[1]) {
      giroLento.current += delta * GIRO_LENTO;
    } else {
      const cercana = Math.round(giroLento.current / VUELTA_COMPLETA) * VUELTA_COMPLETA;
      giroLento.current = MathUtils.damp(giroLento.current, cercana, 3, delta);
    }
    grupo.current.position.y = Math.sin(tiempo * 0.8) * 0.5;
    grupo.current.rotation.y =
      Math.sin(tiempo * 0.45) * 0.14 + vuelta * VUELTA_COMPLETA + giroLento.current;
    grupo.current.rotation.z = Math.sin(tiempo * 0.6) * 0.02;
    grupo.current.updateMatrixWorld();

    const indice = p > -0.5 && p < pasos.length - 0.5 ? Math.round(p) : -1;
    const paso = indice >= 0 ? pasos[indice] : null;

    // El encordado es una malla aparte: brilla en lima con un emissive suave
    const brillo = paso?.partes.includes("encordado") ? 0.55 : 0;
    if (!refCuerdas.current) {
      refCuerdas.current = [];
      grupo.current.traverse((objeto) => {
        if (objeto.userData.cuerda) refCuerdas.current.push(objeto.material);
      });
    }
    for (const material of refCuerdas.current) {
      material.emissiveIntensity = MathUtils.damp(material.emissiveIntensity, brillo, 6, delta);
    }

    // El punto dulce: un disco lima semitransparente que late sobre el encordado
    const materialDisco = disco.current.material;
    const opacidad = paso?.partes.includes("punto-dulce") ? 0.5 : 0;
    materialDisco.opacity = MathUtils.damp(materialDisco.opacity, opacidad, 6, delta);
    disco.current.visible = materialDisco.opacity > 0.01;
    const latido = 1 + Math.sin(tiempo * 3.4) * 0.07;
    disco.current.scale.set(4.2 * latido, 5.4 * latido, 1);

    // El sticker del paso activo, anclado a la posición 3D de su parte. En el
    // final, todos juntos alrededor de la raqueta entera.
    const escena = medidas.current.escena;
    const colocar = (i) => {
      ancla.set(...pasos[i].ancla3d);
      grupo.current.localToWorld(ancla);
      ancla.project(camera);
      const x = ((ancla.x + 1) / 2) * size.width;
      const yPantalla = ((1 - ancla.y) / 2) * size.height;
      onMarca(i, ((x - escena.x) / escena.ancho) * 100, ((yPantalla - escena.y) / escena.alto) * 100);
    };
    if (fin > STICKERS[0] && fin < STICKERS[1]) {
      pasos.forEach((_, i) => colocar(i));
    } else if (paso) {
      colocar(indice);
    }
  });

  return (
    <>
      <group ref={grupo}>
        <primitive object={scene} />
        <mesh ref={disco} position={[0, 47.5, 0.35]} renderOrder={2} visible={false}>
          <circleGeometry args={[1, 48]} />
          <meshBasicMaterial
            color={LIMA}
            transparent
            opacity={0}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      </group>

      {/* Sombra de contacto debajo de la tapa. En mobile se calcula una sola
          vez: así no traba. */}
      <ContactShadows
        position={[0, -1.5, 0]}
        scale={50}
        far={30}
        blur={2.6}
        opacity={0.35}
        color="#1d3a63"
        resolution={mobile ? 256 : 512}
        frames={mobile ? 1 : Infinity}
      />
    </>
  );
}

// Luz de estudio suave: un entorno chico armado con Lightformers (no baja
// ningún HDR) y una luz principal arriba a la derecha
function Estudio() {
  return (
    <>
      <ambientLight intensity={0.35} />
      <directionalLight position={[30, 90, 60]} intensity={1.1} />
      <Environment resolution={64} frames={1}>
        <Lightformer form="rect" intensity={2.4} position={[0, 60, 40]} scale={[60, 24, 1]} />
        <Lightformer form="rect" intensity={1.2} position={[-60, 30, 20]} scale={[30, 70, 1]} />
        <Lightformer form="rect" intensity={0.8} position={[60, 30, -20]} scale={[30, 70, 1]} />
        <Lightformer form="rect" intensity={0.5} color="#a3c4e8" position={[0, 20, -70]} scale={[90, 90, 1]} />
      </Environment>
    </>
  );
}

export default function Raqueta3D({ pasos, estado, medidas, onMarca, onListo }) {
  const ref = useRef(null);
  const [enVista, setEnVista] = useState(true);
  const [mobile] = useState(() => window.matchMedia("(max-width: 859px)").matches);

  // Deja de renderizar cuando la sección no está en pantalla
  useEffect(() => {
    const observador = new IntersectionObserver(([entrada]) => setEnVista(entrada.isIntersecting), {
      rootMargin: "100px 0px",
    });
    observador.observe(ref.current);
    return () => observador.disconnect();
  }, []);

  return (
    <div ref={ref} style={{ position: "absolute", inset: 0 }}>
      <Canvas
        dpr={[1, mobile ? 1.5 : 2]}
        frameloop={enVista ? "always" : "never"}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
        camera={{ fov: FOV, near: 1, far: 2000, position: [0, LARGO / 2, 220] }}
        aria-hidden="true"
      >
        <Estudio />
        <Suspense fallback={null}>
          <Escena
            pasos={pasos}
            estado={estado}
            medidas={medidas}
            onMarca={onMarca}
            onListo={onListo}
            mobile={mobile}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}

useGLTF.preload(URL_RAQUETA, false, true);
