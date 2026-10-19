"use client";

import { useEffect, useRef, useState } from "react";
import styles from "@/app/formulario.module.css";

const MINIMO = 8;

// «Contraseña» y «Repetir contraseña». Si lo repetido no coincide, lo avisa en
// el momento y frena el envío del formulario; la acción del servidor lo vuelve
// a revisar. Los usan el registro y /nueva-contrasena.
export default function CamposContrasena({ etiqueta = "Contraseña" }) {
  const [contrasena, setContrasena] = useState("");
  const [repetida, setRepetida] = useState("");
  const refRepetida = useRef(null);
  const distintas = repetida !== "" && repetida !== contrasena;

  // El navegador no deja enviar el formulario mientras haya un mensaje acá
  useEffect(() => {
    refRepetida.current?.setCustomValidity(distintas ? "Las contraseñas no coinciden." : "");
  }, [distintas]);

  return (
    <>
      <label className={styles.campo}>
        <span className={styles.etiqueta}>{etiqueta}</span>
        <input
          type="password"
          name="contrasena"
          required
          minLength={MINIMO}
          autoComplete="new-password"
          aria-describedby="ayuda-contrasena"
          value={contrasena}
          onChange={(evento) => setContrasena(evento.target.value)}
          className={styles.entrada}
        />
        <span id="ayuda-contrasena" className={styles.ayuda}>
          Al menos {MINIMO} caracteres.
        </span>
      </label>

      <label className={styles.campo}>
        <span className={styles.etiqueta}>Repetir {etiqueta.toLowerCase()}</span>
        <input
          ref={refRepetida}
          type="password"
          name="repetir"
          required
          autoComplete="new-password"
          aria-invalid={distintas}
          aria-describedby={distintas ? "aviso-repetir" : undefined}
          value={repetida}
          onChange={(evento) => setRepetida(evento.target.value)}
          className={styles.entrada}
        />
        {distintas && (
          <span id="aviso-repetir" className={styles.error} role="alert">
            Las contraseñas no coinciden.
          </span>
        )}
      </label>
    </>
  );
}
