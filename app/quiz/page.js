import Link from "next/link";
import Quiz from "@/components/Quiz";
import { PREGUNTAS } from "@/lib/quiz";
import styles from "./quiz.module.css";

export const metadata = {
  title: "Quiz de juego",
  description:
    "Seis preguntas sobre cómo jugás para recomendarte raquetas, una cuerda y una pelota del catálogo.",
};

export default function PaginaQuiz() {
  return (
    <main className={styles.pagina}>
      <nav className="migas" aria-label="Ubicación">
        <Link href="/">Inicio</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">Quiz de juego</span>
      </nav>
      <Quiz preguntas={PREGUNTAS}>
        <h1 className={`display ${styles.nombre}`}>Quiz de juego</h1>
        <p className={styles.bajada}>Seis preguntas y te armamos un kit para tu forma de jugar.</p>
      </Quiz>
    </main>
  );
}
