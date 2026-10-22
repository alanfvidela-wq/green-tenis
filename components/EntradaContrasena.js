"use client";

import { useEffect, useRef, useState } from "react";
import styles from "@/app/formulario.module.css";

// El ojo, en línea, del color del texto. Tachado cuando la contraseña se ve.
function Ojo({ tachado }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
      {tachado && <path d="M4 4l16 16" />}
    </svg>
  );
}

// Un campo de contraseña con su botón para mostrar u ocultar lo escrito. Pasa
// todo lo demás al <input> (name, autoComplete, value…), así el gestor de
// contraseñas del navegador lo sigue reconociendo. Con `invalido` (un texto),
// el navegador no deja enviar el formulario.
export default function EntradaContrasena({ invalido = "", ...props }) {
  const [visible, setVisible] = useState(false);
  const entrada = useRef(null);

  useEffect(() => {
    entrada.current?.setCustomValidity(invalido);
  }, [invalido]);

  // Al enviar, vuelve a ocultarla: el navegador ofrece guardar la contraseña
  // solo si el campo es type="password" en ese momento
  useEffect(() => {
    const formulario = entrada.current?.form;
    if (!formulario) return;
    const ocultar = () => {
      entrada.current.type = "password";
      setVisible(false);
    };
    formulario.addEventListener("submit", ocultar);
    return () => formulario.removeEventListener("submit", ocultar);
  }, []);

  return (
    <span className={styles.conBoton}>
      <input {...props} ref={entrada} type={visible ? "text" : "password"} className={styles.entrada} />
      <button
        type="button"
        className={styles.ojo}
        aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
        aria-pressed={visible}
        // Que tocar el ojo no le saque el foco al campo
        onPointerDown={(evento) => evento.preventDefault()}
        onClick={() => setVisible((antes) => !antes)}
      >
        <Ojo tachado={visible} />
      </button>
    </span>
  );
}
