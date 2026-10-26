import Link from "next/link";
import { redirect } from "next/navigation";
import Kit from "@/components/Kit";
import { guardarKit } from "@/lib/accionesQuiz";
import { RespuestasQuiz } from "@/lib/esquemas";
import { armarKit, getKitGuardado } from "@/lib/kits";
import { PREGUNTAS, aBusqueda, mismasRespuestas, resumirRespuestas } from "@/lib/quiz";
import { getUsuario } from "@/lib/sesion";
import listado from "@/app/listado.module.css";
import styles from "../quiz.module.css";

export const metadata = {
  title: "Tu kit",
  description: "Las raquetas, la cuerda y la pelota que te recomienda el quiz de juego.",
  robots: { index: false },
};

// El resultado del quiz: las respuestas llegan en la URL (las pone
// responderQuiz) y el kit se arma acá, con el catálogo y el stock de hoy. Con
// sesión, dice si quedó guardado en la cuenta o deja guardarlo; sin sesión,
// lleva a ingresar y de vuelta acá.
export default async function PaginaResultado({ searchParams }) {
  const validadas = RespuestasQuiz.safeParse(await searchParams);
  if (!validadas.success) redirect("/quiz");
  const respuestas = validadas.data;

  const [items, usuario] = await Promise.all([armarKit(respuestas), getUsuario()]);
  const guardado = usuario ? await getKitGuardado() : null;
  const estaGuardado = Boolean(guardado) && mismasRespuestas(guardado.respuestas, respuestas);
  const aca = `/quiz/resultado?${aBusqueda(respuestas)}`;

  return (
    <main>
      <header className={listado.encabezado}>
        <nav className="migas" aria-label="Ubicación">
          <Link href="/">Inicio</Link>
          <span aria-hidden="true">/</span>
          <Link href="/quiz">Quiz de juego</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">Tu kit</span>
        </nav>
        <h1 className={`display ${listado.titulo}`}>Tu kit</h1>
        <p className={styles.respuestas}>
          <span className="solo-lectores">Tus respuestas: </span>
          {resumirRespuestas(respuestas).join(" · ")}
        </p>
        <div className={styles.acciones}>
          <Link href="/quiz" className="boton boton-secundario">
            Volver a hacer el quiz
          </Link>
          {estaGuardado && (
            <p className={styles.guardado}>
              Quedó guardado en tu cuenta: lo ves en <Link href="/tu-kit">Tu kit</Link>.
            </p>
          )}
          {usuario && !estaGuardado && (
            <form action={guardarKit}>
              {PREGUNTAS.map((p) => (
                <input key={p.id} type="hidden" name={p.id} value={respuestas[p.id]} />
              ))}
              <button type="submit" className="boton boton-secundario">
                Guardar en mi cuenta
              </button>
            </form>
          )}
          {!usuario && (
            <p className={styles.guardado}>
              <Link href={`/ingresar?siguiente=${encodeURIComponent(aca)}`}>Ingresá</Link> para
              guardarlo en tu cuenta.
            </p>
          )}
        </div>
      </header>

      {items.length > 0 ? (
        <Kit items={items} />
      ) : (
        <p className={listado.vacio}>Ahora no hay productos para recomendarte.</p>
      )}
    </main>
  );
}
