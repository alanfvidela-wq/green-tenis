"use client";

import { useState } from "react";
import EntradaContrasena from "./EntradaContrasena";
import styles from "@/app/formulario.module.css";

const MINIMO = 8;

// «Contraseña» y «Repetir contraseña», cada una con su botón para mostrarla.
// Si lo repetido no coincide, lo avisa en el momento y frena el envío del
// formulario; la acción del servidor lo vuelve a revisar. Los usan el
// registro y /nueva-contrasena.
export default function CamposContrasena({ etiqueta = "Contraseña" }) {
  const [contrasena, setContrasena] = useState("");
  const [repetida, setRepetida] = useState("");
  const distintas = repetida !== "" && repetida !== contrasena;

  return (
    <>
      <label className={styles.campo}>
        <span className={styles.etiqueta}>{etiqueta}</span>
        <EntradaContrasena
          name="contrasena"
          required
          minLength={MINIMO}
          autoComplete="new-password"
          aria-describedby="ayuda-contrasena"
          value={contrasena}
          onChange={(evento) => setContrasena(evento.target.value)}
        />
        <span id="ayuda-contrasena" className={styles.ayuda}>
          Al menos {MINIMO} caracteres.
        </span>
      </label>

      <label className={styles.campo}>
        <span className={styles.etiqueta}>Repetir {etiqueta.toLowerCase()}</span>
        <EntradaContrasena
          name="repetir"
          required
          autoComplete="new-password"
          aria-invalid={distintas}
          aria-describedby={distintas ? "aviso-repetir" : undefined}
          invalido={distintas ? "Las contraseñas no coinciden." : ""}
          value={repetida}
          onChange={(evento) => setRepetida(evento.target.value)}
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
