"use client";

import { useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { responderQuiz } from "@/lib/accionesQuiz";
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

// El quiz (ver «Quiz» en DESIGN.md): una pregunta por pantalla, con la barra
// de progreso arriba. Elegir una opción la marca en el acento y, al ratito,
// pasa a la siguiente; «Atrás» vuelve sin perder lo elegido. En la última,
// «Ver mi kit» manda las respuestas a responderQuiz, que lleva al resultado.
// `preguntas` es PREGUNTAS (lib/quiz.js).
export default function Quiz({ preguntas }) {
  const [paso, setPaso] = useState(0);
  const [respuestas, setRespuestas] = useState({});
  const [direccion, setDireccion] = useState("adelante");
  const titulo = useRef(null);
  const montado = useRef(false);
  const temporizador = useRef(0);

  const total = preguntas.length;
  const pregunta = preguntas[paso];
  const ultima = paso === total - 1;
  const completo = preguntas.every((p) => respuestas[p.id]);

  // Al cambiar de pregunta (no al cargar), el foco va a la pregunta nueva: el
  // lector de pantalla la lee y el teclado sigue desde ahí
  useEffect(() => {
    if (!montado.current) {
      montado.current = true;
      return;
    }
    titulo.current?.focus();
  }, [paso]);

  useEffect(() => () => clearTimeout(temporizador.current), []);

  function ir(destino) {
    clearTimeout(temporizador.current);
    setDireccion(destino > paso ? "adelante" : "atras");
    setPaso(destino);
  }

  function elegir(valor) {
    setRespuestas((anteriores) => ({ ...anteriores, [pregunta.id]: valor }));
    if (ultima) return;
    clearTimeout(temporizador.current);
    temporizador.current = setTimeout(() => ir(paso + 1), PAUSA_MS);
  }

  return (
    <form action={responderQuiz} className={styles.quiz}>
      {preguntas.map((p) => (
        <input key={p.id} type="hidden" name={p.id} value={respuestas[p.id] ?? ""} />
      ))}

      <div className={styles.progreso}>
        <p className={styles.cuenta} aria-hidden="true">
          {String(paso + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
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

      {/* La key hace que cada pregunta entre con su animación */}
      <div
        key={pregunta.id}
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
        <div className={styles.opciones} data-cantidad={pregunta.opciones.length}>
          {pregunta.opciones.map((opcion) => {
            const elegida = respuestas[pregunta.id] === opcion.valor;
            return (
              <button
                key={opcion.valor}
                type="button"
                className={styles.opcion}
                aria-pressed={elegida}
                onClick={() => elegir(opcion.valor)}
              >
                <span className={styles.opcionTexto}>{opcion.texto}</span>
                {opcion.detalle && <span className={styles.opcionDetalle}>{opcion.detalle}</span>}
              </button>
            );
          })}
        </div>
      </div>

      <div className={styles.pie}>
        {paso > 0 && (
          <button type="button" className="boton boton-secundario" onClick={() => ir(paso - 1)}>
            Atrás
          </button>
        )}
        {ultima ? (
          <BotonVerKit completo={completo} />
        ) : (
          respuestas[pregunta.id] && (
            <button type="button" className="boton boton-secundario" onClick={() => ir(paso + 1)}>
              Siguiente
            </button>
          )
        )}
      </div>
    </form>
  );
}
