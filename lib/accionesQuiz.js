"use server";

import { redirect } from "next/navigation";
import { RespuestasQuiz } from "./esquemas";
import { armarKit, guardarKitDe } from "./kits";
import { aBusqueda } from "./quiz";
import { getUsuario } from "./sesion";

// Las acciones del quiz. Las respuestas llegan de un formulario y pasan por
// RespuestasQuiz (lib/esquemas.js): si falta alguna o no es de las opciones,
// se vuelve a empezar el quiz.

function leerRespuestas(formData) {
  const datos = formData instanceof FormData ? Object.fromEntries(formData) : {};
  const respuestas = RespuestasQuiz.safeParse(datos);
  if (!respuestas.success) redirect("/quiz");
  return respuestas.data;
}

// El final del quiz: con sesión, guarda el kit en la cuenta, y va al
// resultado, que lo vuelve a armar con las respuestas de la URL. Si no se
// puede guardar, el resultado se ve igual (y ofrece guardarlo).
export async function responderQuiz(formData) {
  const respuestas = leerRespuestas(formData);
  const usuario = await getUsuario();
  if (usuario) {
    try {
      await guardarKitDe(usuario, respuestas, await armarKit(respuestas));
    } catch (error) {
      console.error(error.message);
    }
  }
  redirect(`/quiz/resultado?${aBusqueda(respuestas)}`);
}

// «Guardar en mi cuenta», desde el resultado: para quien hizo el quiz sin
// sesión e ingresó después. Sin sesión, a ingresar y de vuelta al resultado.
export async function guardarKit(formData) {
  const respuestas = leerRespuestas(formData);
  const resultado = `/quiz/resultado?${aBusqueda(respuestas)}`;
  const usuario = await getUsuario();
  if (!usuario) redirect(`/ingresar?siguiente=${encodeURIComponent(resultado)}`);

  await guardarKitDe(usuario, respuestas, await armarKit(respuestas));
  redirect(resultado);
}
