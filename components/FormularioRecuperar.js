"use client";

import { useActionState } from "react";
import { pedirRecuperacion } from "@/lib/cuenta";
import styles from "@/app/formulario.module.css";

// Pide el email para mandar el link de recuperación. La respuesta es siempre
// la misma, tenga cuenta o no ese email.
export default function FormularioRecuperar() {
  const [estado, enviar, enviando] = useActionState(pedirRecuperacion, null);

  if (estado?.enviado) {
    return (
      <p className={styles.aviso} role="status">
        Si ese email tiene cuenta, te mandamos un link para elegir una contraseña nueva. Revisá
        también el correo no deseado.
      </p>
    );
  }

  return (
    <form action={enviar} className={styles.formulario}>
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

      {estado?.error && (
        <p className={styles.error} role="alert">
          {estado.error}
        </p>
      )}

      <button type="submit" className={`boton ${styles.enviar}`} disabled={enviando}>
        {enviando ? "Un momento…" : "Mandarme el link"}
      </button>
    </form>
  );
}
