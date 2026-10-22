"use server";

import { redirect } from "next/navigation";
import { crearClienteConSesion, getUsuario } from "./sesion";
import { rutaSiguiente } from "./siguiente";
import { origenDelSitio } from "./sitio";

// Registro, ingreso, salida y recuperación de la contraseña con Supabase Auth
// (email y contraseña). Sin confirmación por mail: al registrarse ya queda la
// sesión iniciada. El largo mínimo de la contraseña lo aplica también
// Supabase (Authentication).

const MINIMO = 8;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function leerFormulario(formData) {
  return {
    email: String(formData.get("email") ?? "").trim().toLowerCase(),
    contrasena: String(formData.get("contrasena") ?? ""),
    repetida: String(formData.get("repetir") ?? ""),
    siguiente: rutaSiguiente(formData.get("siguiente")),
  };
}

// Lo que falla en una contraseña nueva, o null si está bien
function problemaContrasena(contrasena, repetida) {
  if (contrasena.length < MINIMO) {
    return `La contraseña tiene que tener al menos ${MINIMO} caracteres.`;
  }
  if (contrasena !== repetida) return "Las contraseñas no coinciden.";
  return null;
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
    case "same_password":
      return "La contraseña nueva tiene que ser distinta de la anterior.";
    case "reauthentication_needed":
      return "Por seguridad, cerrá la sesión, volvé a ingresar y probá de nuevo.";
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
  const { email, contrasena, repetida, siguiente } = leerFormulario(formData);
  if (!EMAIL.test(email)) return { error: "Escribí un email válido.", email };
  const problema = problemaContrasena(contrasena, repetida);
  if (problema) return { error: problema, email };

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

// Manda el link para elegir una contraseña nueva. Responde siempre lo mismo,
// exista o no la cuenta y salga o no el mail, para no contar qué emails tienen
// cuenta. El link vuelve a /auth/confirmar, que inicia la sesión. Va con el
// cliente con sesión a propósito: en el flujo PKCE, resetPasswordForEmail
// guarda el verificador en una cookie de este navegador, y sin ella el ?code=
// del link no se puede canjear.
export async function pedirRecuperacion(_estado, formData) {
  const { email } = leerFormulario(formData);
  if (!EMAIL.test(email)) return { error: "Escribí un email válido.", email };

  const supabase = await crearClienteConSesion();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${await origenDelSitio()}/auth/confirmar`,
  });
  if (error) console.error("No se pudo mandar el mail de recuperación:", error.code ?? error.message);

  return { enviado: true, email };
}

// Cambia la contraseña del usuario con sesión (la que abrió el link del mail)
export async function cambiarContrasena(_estado, formData) {
  const usuario = await getUsuario();
  if (!usuario) redirect("/ingresar?siguiente=/nueva-contrasena");

  const { contrasena, repetida } = leerFormulario(formData);
  const problema = problemaContrasena(contrasena, repetida);
  if (problema) return { error: problema };

  const supabase = await crearClienteConSesion();
  const { error } = await supabase.auth.updateUser({ password: contrasena });
  if (error) return { error: traducir(error) };

  redirect("/mis-pedidos?contrasena=cambiada");
}
