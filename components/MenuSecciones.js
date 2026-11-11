"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import LinkNav from "./LinkNav";
import styles from "./Header.module.css";

// Las secciones del header (ver «Header» en DESIGN.md). Con lugar, son una
// fila de links. En el celular (menos de 640px) no entran: las abre el botón
// «Menú», en una hoja blanca debajo del header, una debajo de la otra y con
// «Mi cuenta» al final.
//
// Es un disclosure, no un modal: el botón dice si está abierta
// (aria-expanded) y los links siguen en el orden de tabulación. Se cierra con
// el mismo botón, con Escape (el foco vuelve al botón), al elegir un link, al
// tocar afuera o cuando el foco sale del menú.
const MOBILE = "(max-width: 639px)";

export default function MenuSecciones({ secciones }) {
  const pathname = usePathname();
  // La ruta donde se abrió: al cambiar de página queda cerrado solo
  const [abiertoEn, setAbiertoEn] = useState(null);
  const abierto = abiertoEn === pathname;
  const refNav = useRef(null);
  const refBoton = useRef(null);

  useEffect(() => {
    if (!abierto) return;
    const nav = refNav.current;
    const consulta = window.matchMedia(MOBILE);

    function alTeclado(evento) {
      if (evento.key !== "Escape") return;
      setAbiertoEn(null);
      refBoton.current?.focus();
    }
    function alTocar(evento) {
      if (!nav.contains(evento.target)) setAbiertoEn(null);
    }
    // Si la pantalla se agranda, la fila vuelve y el menú no tiene sentido
    function alCambiar() {
      if (!consulta.matches) setAbiertoEn(null);
    }

    document.addEventListener("keydown", alTeclado);
    document.addEventListener("pointerdown", alTocar);
    consulta.addEventListener("change", alCambiar);
    return () => {
      document.removeEventListener("keydown", alTeclado);
      document.removeEventListener("pointerdown", alTocar);
      consulta.removeEventListener("change", alCambiar);
    };
  }, [abierto]);

  return (
    <nav
      ref={refNav}
      className={styles.nav}
      aria-label="Secciones"
      data-abierto={abierto || undefined}
      onBlur={(evento) => {
        if (evento.relatedTarget && !evento.currentTarget.contains(evento.relatedTarget)) {
          setAbiertoEn(null);
        }
      }}
    >
      <button
        ref={refBoton}
        type="button"
        className={`${styles.link} ${styles.menu}`}
        aria-expanded={abierto}
        aria-controls="menu-secciones"
        onClick={() => setAbiertoEn(abierto ? null : pathname)}
      >
        Menú
      </button>

      <ul
        id="menu-secciones"
        className={styles.lista}
        onClick={(evento) => {
          if (evento.target.closest("a")) setAbiertoEn(null);
        }}
      >
        {secciones.map((seccion) => (
          <li key={seccion.href}>
            <LinkNav href={seccion.href} tambien={seccion.tambien} className={styles.link}>
              {seccion.nombre}
            </LinkNav>
          </li>
        ))}
        {/* En el celular, «Mi cuenta» no entra en la fila de arriba: va acá */}
        <li className={styles.soloMenu}>
          <LinkNav href="/mis-pedidos" className={styles.link}>
            Mi cuenta
          </LinkNav>
        </li>
      </ul>
    </nav>
  );
}
