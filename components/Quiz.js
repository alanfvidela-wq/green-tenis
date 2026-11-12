"use client";

import { useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { responderQuiz } from "@/lib/accionesQuiz";
import IconoOpcion, { tieneIcono } from "./IconoOpcion";
import styles from "./Quiz.module.css";

// Cuánto se ve la opción elegida antes de pasar a la pregunta siguiente
const PAUSA_MS = 320;

function BotonVerKit({ completo }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={`boton ${styles.ver}`} disabled={!completo || pending}>
      {pending ? "Armando tu kit…" : "Ver mi kit"}
    </button>
  );
}

// La tilde de una pregunta respondida, trazada al aparecer
function Tilde() {
  return (
    <svg className={styles.tilde} viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      <path d="M4 8.5 6.8 11.2 12 5.2" pathLength="1" />
    </svg>
  );
}

// El quiz (ver «Quiz» en DESIGN.md), en dos columnas. A la izquierda, el
// panel: el título (`children`, lo pone la página), y las seis preguntas con
// lo respondido; tocar una respondida vuelve a ella. En mobile, el panel se
// pliega en «Tus respuestas (2 de 6)». A la derecha, una pregunta por vez,
// con el avance arriba. Elegir una opción la marca en el acento y, al ratito,
// pasa a la siguiente; «Anterior» vuelve sin perder lo elegido. En la última,
// «Ver mi kit» manda las respuestas a responderQuiz, que lleva al resultado.
// `preguntas` es PREGUNTAS (lib/quiz.js).
export default function Quiz({ preguntas, children }) {
  const [paso, setPaso] = useState(0);
  const [respuestas, setRespuestas] = useState({});
  const [direccion, setDireccion] = useState("adelante");
  // Cuántas veces se cambió de pregunta: cada cambio lleva el foco a la nueva
  const [cambios, setCambios] = useState(0);
  // El resumen plegado de mobile (en desktop la lista se ve siempre)
  const [abierto, setAbierto] = useState(false);
  const titulo = useRef(null);
  const temporizador = useRef(0);

  const total = preguntas.length;
  const pregunta = preguntas[paso];
  const ultima = paso === total - 1;
  const respondidas = preguntas.filter((p) => respuestas[p.id]).length;
  const completo = respondidas === total;

  // Al cambiar de pregunta (no al cargar), el foco va a la pregunta nueva: el
  // lector de pantalla la lee y el teclado sigue desde ahí
  useEffect(() => {
    if (cambios > 0) titulo.current?.focus();
  }, [cambios]);

  useEffect(() => () => clearTimeout(temporizador.current), []);

  function ir(destino) {
    clearTimeout(temporizador.current);
    setDireccion(destino >= paso ? "adelante" : "atras");
    setPaso(destino);
    setCambios((c) => c + 1);
  }

  // Desde el panel: en mobile, además, vuelve a plegar el resumen
  function irDesdePanel(destino) {
    setAbierto(false);
    ir(destino);
  }

  function elegir(valor) {
    setRespuestas((anteriores) => ({ ...anteriores, [pregunta.id]: valor }));
    if (ultima) return;
    clearTimeout(temporizador.current);
    temporizador.current = setTimeout(() => ir(paso + 1), PAUSA_MS);
  }

  function empezarDeNuevo() {
    setRespuestas({});
    irDesdePanel(0);
    setDireccion("atras");
  }

  return (
    <form action={responderQuiz} className={styles.quiz}>
      {preguntas.map((p) => (
        <input key={p.id} type="hidden" name={p.id} value={respuestas[p.id] ?? ""} />
      ))}

      <div className={styles.panel}>
        <div className={styles.cabecera}>{children}</div>

        <div className={styles.resumen} data-abierto={abierto || undefined}>
          <button
            type="button"
            className={styles.desplegar}
            aria-expanded={abierto}
            aria-controls="respuestas-quiz"
            onClick={() => setAbierto((a) => !a)}
          >
            <span>
              Tus respuestas{" "}
              <span className={styles.contador}>
                ({respondidas} de {total})
              </span>
            </span>
            <span className={styles.signo} aria-hidden="true" />
          </button>

          <div id="respuestas-quiz" className={styles.respuestas}>
            <nav aria-label="Preguntas del quiz">
              <ol className={styles.lista}>
                {preguntas.map((p, i) => {
                  const respuesta = p.opciones.find((o) => o.valor === respuestas[p.id]);
                  const actual = i === paso;
                  const estado = actual ? "actual" : respuesta ? "respondida" : "pendiente";
                  const contenido = (
                    <>
                      <span className={styles.marca} data-tilde={Boolean(respuesta) || undefined} aria-hidden="true">
                        {respuesta ? <Tilde /> : i + 1}
                      </span>
                      <span className={styles.paso}>
                        <span className={styles.etiqueta}>{p.etiqueta}</span>
                        {respuesta ? (
                          <span className={styles.respuesta}>{respuesta.texto}</span>
                        ) : (
                          <span className="solo-lectores">, sin responder</span>
                        )}
                      </span>
                    </>
                  );
                  return (
                    <li key={p.id} className={styles.item} data-estado={estado}>
                      {/* Lo respondido se puede tocar para cambiarlo; la
                          pregunta actual y las que faltan, no */}
                      {estado === "respondida" ? (
                        <button type="button" className={styles.fila} onClick={() => irDesdePanel(i)}>
                          {contenido}
                        </button>
                      ) : (
                        <span className={styles.fila} aria-current={actual ? "step" : undefined}>
                          {contenido}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ol>
            </nav>

            <button
              type="button"
              className={styles.reiniciar}
              onClick={empezarDeNuevo}
              disabled={respondidas === 0}
            >
              Empezar de nuevo
            </button>
          </div>
        </div>
      </div>

      <div className={styles.principal}>
        <div className={styles.progreso}>
          <p className={styles.cuenta} aria-hidden="true">
            Pregunta {paso + 1} de {total}
          </p>
          <div
            className={styles.barra}
            role="progressbar"
            aria-label="Avance del quiz"
            aria-valuemin={1}
            aria-valuemax={total}
            aria-valuenow={paso + 1}
            aria-valuetext={`Pregunta ${paso + 1} de ${total}`}
          >
            <span className={styles.relleno} style={{ transform: `scaleX(${(paso + 1) / total})` }} />
          </div>
        </div>

        {/* La key hace que cada pregunta entre con su animación, también al
            empezar de nuevo desde la primera */}
        <div
          key={`${pregunta.id}-${cambios}`}
          className={styles.pregunta}
          data-direccion={direccion}
          role="group"
          aria-labelledby="pregunta-quiz"
        >
          <h2 id="pregunta-quiz" ref={titulo} tabIndex={-1} className={`display ${styles.titulo}`}>
            <span className="solo-lectores">
              Pregunta {paso + 1} de {total}:{" "}
            </span>
            {pregunta.pregunta}
          </h2>
          <div
            className={styles.opciones}
            data-cantidad={pregunta.opciones.length}
            data-iconos={tieneIcono(pregunta.id) || undefined}
          >
            {pregunta.opciones.map((opcion, i) => (
              <button
                key={opcion.valor}
                type="button"
                className={styles.opcion}
                style={{ "--orden": i }}
                aria-pressed={respuestas[pregunta.id] === opcion.valor}
                onClick={() => elegir(opcion.valor)}
              >
                <IconoOpcion pregunta={pregunta.id} valor={opcion.valor} className={styles.icono} />
                <span className={styles.opcionTexto}>{opcion.texto}</span>
                <span className={styles.opcionDetalle}>{opcion.detalle}</span>
              </button>
            ))}
          </div>
        </div>

        <div className={styles.pie}>
          {paso > 0 && (
            <button type="button" className="boton boton-secundario" onClick={() => ir(paso - 1)}>
              Anterior
            </button>
          )}
          {ultima ? (
            <BotonVerKit completo={completo} />
          ) : (
            respuestas[pregunta.id] && (
              <button type="button" className={`boton boton-secundario ${styles.siguiente}`} onClick={() => ir(paso + 1)}>
                Siguiente
              </button>
            )
          )}
        </div>
      </div>
    </form>
  );
}
