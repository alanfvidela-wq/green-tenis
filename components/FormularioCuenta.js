"use client";

import { useActionState } from "react";
import { ingresar, registrarme } from "@/lib/cuenta";
import styles from "@/app/formulario.module.css";

// Email y contraseña para ingresar o crear la cuenta. Si sale bien, la acción
// redirige a «siguiente»; si no, devuelve el error y el email escrito.
export default function FormularioCuenta({ modo, siguiente }) {
  const registro = modo === "registrarme";
  const [estado, enviar, enviando] = useActionState(registro ? registrarme : ingresar, null);

  let textoBoton = registro ? "Crear cuenta" : "Ingresar";
  if (enviando) textoBoton = "Un momento…";

  return (
    <form action={enviar} className={styles.formulario}>
      <input type="hidden" name="siguiente" value={siguiente} />

      <label className={styles.campo}>
        <span className={styles.etiqueta}>Email</span>
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          defaultValue={estado?.email ?? ""}
          className={styles.entrada}
        />
      </label>

      <label className={styles.campo}>
        <span className={styles.etiqueta}>Contraseña</span>
        <input
          type="password"
          name="contrasena"
          required
          minLength={registro ? 8 : undefined}
          autoComplete={registro ? "new-password" : "current-password"}
          aria-describedby={registro ? "ayuda-contrasena" : undefined}
          className={styles.entrada}
        />
        {registro && (
          <span id="ayuda-contrasena" className={styles.ayuda}>
            Al menos 8 caracteres.
          </span>
        )}
      </label>

      {estado?.error && (
        <p className={styles.error} role="alert">
          {estado.error}
        </p>
      )}

      <button type="submit" className={`boton ${styles.enviar}`} disabled={enviando}>
        {textoBoton}
      </button>
    </form>
  );
}
