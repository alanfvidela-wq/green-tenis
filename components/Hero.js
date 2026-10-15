import Link from "next/link";
import { CORTE_MOBILE, VIDEOS_HERO } from "@/lib/heroVideo";
import VideoFondo from "./VideoFondo";
import styles from "./Hero.module.css";

// Hero de la home: el video de la cancha a pantalla completa, con el header
// flotando encima, una capa negra plana y el titular lima centrado.
// El poster va en un <picture> del servidor, así se ve desde el primer pintado.
export default function Hero() {
  return (
    <section className={styles.hero} aria-labelledby="hero-titulo" data-hero>
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
        <h1 id="hero-titulo" className={styles.titulo}>
          Todo para jugar al tenis
        </h1>
        <p className={styles.frase}>
          Raquetas, zapatillas, pelotas, cuerdas, bolsos y ropa de las marcas
          que ya conocés.
        </p>
        <Link href="/categoria/raquetas" className={`boton ${styles.cta}`}>
          Ver raquetas
        </Link>
      </div>
    </section>
  );
}
