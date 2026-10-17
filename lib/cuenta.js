"use server";

import { redirect } from "next/navigation";
import { crearClienteConSesion } from "./sesion";
import { rutaSiguiente } from "./siguiente";

// Registro, ingreso y salida con Supabase Auth (email y contraseña). Sin
// confirmación por mail: al registrarse ya queda la sesión iniciada. El largo
// mínimo de la contraseña lo aplica también Supabase (Authentication).

const MINIMO = 8;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function leerFormulario(formData) {
  return {
    email: String(formData.get("email") ?? "").trim().toLowerCase(),
    contrasena: String(formData.get("contrasena") ?? ""),
    siguiente: rutaSiguiente(formData.get("siguiente")),
  };
}

// Los errores de Supabase Auth, en castellano
function traducir(error) {
  switch (error.code) {
    case "invalid_credentials":
      return "El email o la contraseña no coinciden.";
    case "user_already_exists":
    case "email_exists":
      return "Ya hay una cuenta con ese email. Probá ingresar.";
    case "weak_password":
      return `La contraseña es muy corta: usá al menos ${MINIMO} caracteres.`;
    case "email_address_invalid":
      return "Ese email no es válido.";
    case "over_request_rate_limit":
    case "over_email_send_rate_limit":
      return "Hubo demasiados intentos. Probá de nuevo en unos minutos.";
    default:
      return "No se pudo completar. Probá de nuevo en un rato.";
  }
}

export async function ingresar(_estado, formData) {
  const { email, contrasena, siguiente } = leerFormulario(formData);
  if (!EMAIL.test(email) || !contrasena) {
    return { error: "Escribí tu email y tu contraseña.", email };
  }

  const supabase = await crearClienteConSesion();
  const { error } = await supabase.auth.signInWithPassword({ email, password: contrasena });
  if (error) return { error: traducir(error), email };

  redirect(siguiente);
}

export async function registrarme(_estado, formData) {
  const { email, contrasena, siguiente } = leerFormulario(formData);
  if (!EMAIL.test(email)) return { error: "Escribí un email válido.", email };
  if (contrasena.length < MINIMO) {
    return { error: `La contraseña tiene que tener al menos ${MINIMO} caracteres.`, email };
  }

  const supabase = await crearClienteConSesion();
  const { data, error } = await supabase.auth.signUp({ email, password: contrasena });
  if (error) return { error: traducir(error), email };
  // Sin sesión: la cuenta ya existía o el proyecto volvió a pedir confirmación
  if (!data.session) {
    return { error: "No se pudo iniciar la sesión con esa cuenta. Probá ingresar.", email };
  }

  redirect(siguiente);
}

export async function salir() {
  const supabase = await crearClienteConSesion();
  await supabase.auth.signOut();
  redirect("/");
}
