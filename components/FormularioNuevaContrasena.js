"use client";

import { useActionState } from "react";
import CamposContrasena from "./CamposContrasena";
import { cambiarContrasena } from "@/lib/cuenta";
import styles from "@/app/formulario.module.css";

// La contraseña nueva, repetida. Si sale bien, la acción vuelve a
// /mis-pedidos con el aviso de que se cambió.
export default function FormularioNuevaContrasena() {
  const [estado, enviar, enviando] = useActionState(cambiarContrasena, null);

  return (
    <form action={enviar} className={styles.formulario}>
      <CamposContrasena etiqueta="Contraseña nueva" />

      {estado?.error && (
        <p className={styles.error} role="alert">
          {estado.error}
        </p>
      )}

      <button type="submit" className={`boton ${styles.enviar}`} disabled={enviando}>
        {enviando ? "Un momento…" : "Guardar la contraseña"}
      </button>
    </form>
  );
}
