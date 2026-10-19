"use client";

import { useActionState } from "react";
import CamposContrasena from "./CamposContrasena";
import { ingresar, registrarme } from "@/lib/cuenta";
import styles from "@/app/formulario.module.css";

// Email y contraseña para ingresar o crear la cuenta (al crearla, la
// contraseña se repite). Si sale bien, la acción redirige a «siguiente»; si
// no, devuelve el error y el email escrito.
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

      {registro ? (
        <CamposContrasena />
      ) : (
        <label className={styles.campo}>
          <span className={styles.etiqueta}>Contraseña</span>
          <input
            type="password"
            name="contrasena"
            required
            autoComplete="current-password"
            className={styles.entrada}
          />
        </label>
      )}

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
