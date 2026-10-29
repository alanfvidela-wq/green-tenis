import Link from "next/link";
import { CORTE_MOBILE, VIDEOS_HERO } from "@/lib/heroVideo";
import VideoFondo from "./VideoFondo";
import styles from "./Hero.module.css";

// Hero de la home: el video de la cancha en un contenedor con radio, con el
// header flotando encima, una capa negra plana y el titular blanco centrado.
// El poster va en un <picture> del servidor, así se ve desde el primer pintado.
export default function Hero() {
  return (
    <section className={styles.hero} aria-labelledby="hero-titulo" data-hero>
      <div className={styles.caja}>
      <picture className={styles.medio}>
        <source media={CORTE_MOBILE} srcSet={VIDEOS_HERO.mobile.poster} />
        <img
          src={VIDEOS_HERO.desktop.poster}
          alt=""
          fetchPriority="high"
          className={styles.poster}
        />
      </picture>

      <VideoFondo
        className={styles.video}
        claseBoton={styles.pausa}
        claseIcono={styles.icono}
      />

      <div className={styles.capa} aria-hidden="true" />

      <div className={styles.texto}>
        {/* En una línea. En inglés, como se dice en la cancha: lang para que
            los lectores de pantalla lo pronuncien bien */}
        <h1 id="hero-titulo" className={`display ${styles.titulo}`} lang="en">
          Game, set, match
        </h1>
        <p className={styles.frase}>
          raquetas, pelotas, cuerdas, grips y bolsos de las marcas que ya
          conocés.
        </p>
        <Link href="/categoria/raquetas" className={`boton ${styles.cta}`}>
          Ver raquetas
        </Link>
      </div>
      </div>
    </section>
  );
}
