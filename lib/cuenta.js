"use server";

import { redirect } from "next/navigation";
import {
  ContrasenaNueva,
  Ingreso,
  MINIMO_CONTRASENA,
  Recuperacion,
  Registro,
} from "./esquemas";
import { crearClienteConSesion, getUsuario } from "./sesion";
import { rutaSiguiente } from "./siguiente";
import { origenDelSitio } from "./sitio";

// Registro, ingreso, salida y recuperación de la contraseña con Supabase Auth
// (email y contraseña). Sin confirmación por mail: al registrarse ya queda la
// sesión iniciada. Cada formulario pasa por su esquema (lib/esquemas.js): si no
// pasa, vuelve el primer problema, en castellano.

// Lo que llegó del formulario, como objeto (vacío si no llegó un formulario)
function leerFormulario(formData) {
  return formData instanceof FormData ? Object.fromEntries(formData) : {};
}

// El email como se escribió, para volver a mostrarlo si algo falla
function emailEscrito(datos) {
  return typeof datos.email === "string" ? datos.email : "";
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
      return `La contraseña es muy corta: usá al menos ${MINIMO_CONTRASENA} caracteres.`;
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
  const datos = leerFormulario(formData);
  const ingreso = Ingreso.safeParse(datos);
  if (!ingreso.success) {
    return { error: "Escribí tu email y tu contraseña.", email: emailEscrito(datos) };
  }
  const { email, contrasena } = ingreso.data;

  const supabase = await crearClienteConSesion();
  const { error } = await supabase.auth.signInWithPassword({ email, password: contrasena });
  if (error) return { error: traducir(error), email };

  redirect(rutaSiguiente(datos.siguiente));
}

export async function registrarme(_estado, formData) {
  const datos = leerFormulario(formData);
  const registro = Registro.safeParse(datos);
  if (!registro.success) {
    return { error: registro.error.issues[0].message, email: emailEscrito(datos) };
  }
  const { email, contrasena } = registro.data;

  const supabase = await crearClienteConSesion();
  const { data, error } = await supabase.auth.signUp({ email, password: contrasena });
  if (error) return { error: traducir(error), email };
  // Sin sesión: la cuenta ya existía o el proyecto volvió a pedir confirmación
  if (!data.session) {
    return { error: "No se pudo iniciar la sesión con esa cuenta. Probá ingresar.", email };
  }

  redirect(rutaSiguiente(datos.siguiente));
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
  const datos = leerFormulario(formData);
  const recuperacion = Recuperacion.safeParse(datos);
  if (!recuperacion.success) {
    return { error: recuperacion.error.issues[0].message, email: emailEscrito(datos) };
  }
  const { email } = recuperacion.data;

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

  const nueva = ContrasenaNueva.safeParse(leerFormulario(formData));
  if (!nueva.success) return { error: nueva.error.issues[0].message };

  const supabase = await crearClienteConSesion();
  const { error } = await supabase.auth.updateUser({ password: nueva.data.contrasena });
  if (error) return { error: traducir(error) };

  redirect("/mis-pedidos?contrasena=cambiada");
}
