"use client";

import Link from "next/link";
import { useState } from "react";
import { useCarrito } from "@/hooks/useCarrito";
import { formatearPrecio } from "@/lib/formato";
import AvisoAgregado, { useAvisoAgregado } from "./AvisoAgregado";
import Estado from "./Estado";
import FotoVitrina from "./FotoVitrina";
import OpcionesVariante, { alcanza } from "./OpcionesVariante";
import styles from "./Kit.module.css";

// Un producto del kit del quiz: la foto sobre estudio, la marca, el nombre y
// el precio, por qué encaja y «Agregar al carrito». En las raquetas se elige
// grip y peso, como en su página; la cuerda y la pelota van con la
// presentación que sugiere el quiz (el set, el tubo o el pack). Sin stock,
// la etiqueta «Sin stock» y ningún botón. Va dentro de Kit.
export default function ProductoKit({ rol, producto, varianteId, motivo, disponible, sizes }) {
  const { agregarProducto } = useCarrito();
  const [avisoVisible, mostrarAviso] = useAvisoAgregado();
  const [elegidaId, setElegidaId] = useState(null);
  const eligeVariante = rol === "raqueta" && producto.variantes.length > 1;
  const sugerida = producto.variantes.find((v) => v.id === varianteId) ?? producto.variantes[0];
  const variante = eligeVariante
    ? (producto.variantes.find((v) => v.id === elegidaId) ?? null)
    : sugerida;
  const sePuedeAgregar = disponible && Boolean(variante) && alcanza(variante);
  const href = `/producto/${producto.slug}`;

  return (
    <li className={styles.producto} data-escalonar="">
      {/* La foto lleva a la página del producto, como el nombre: un solo paso
          de Tab, el del nombre */}
      <Link href={href} className={styles.marco} tabIndex={-1} aria-hidden="true">
        <FotoVitrina
          foto={producto.foto}
          categoria={producto.categoria}
          sizes={sizes}
          className={styles.foto}
        />
      </Link>

      <div className={styles.info}>
        <p className={styles.marca}>{producto.marca}</p>
        <div className={styles.fila}>
          <h3 className={styles.nombre}>
            <Link href={href}>{producto.nombre}</Link>
          </h3>
          <p className={styles.precio}>
            {!variante && producto.preciosDistintos && "desde "}
            {formatearPrecio(variante ? variante.precio : producto.precioBase)}
          </p>
        </div>
        <p className={styles.motivo}>{motivo}</p>
      </div>

      {disponible ? (
        <div className={styles.compra}>
          {eligeVariante ? (
            <OpcionesVariante
              leyenda="Elegí grip y peso"
              variantes={producto.variantes}
              elegidaId={elegidaId}
              onElegir={setElegidaId}
            />
          ) : (
            <p className={styles.presentacion}>{sugerida.nombre}</p>
          )}
          <button
            type="button"
            className={`boton ${styles.agregar}`}
            disabled={!sePuedeAgregar}
            onClick={() => {
              agregarProducto(variante.id);
              mostrarAviso();
            }}
          >
            Agregar al carrito
          </button>
          {eligeVariante && !variante && (
            <p className={styles.nota} role="status">
              Falta elegir grip y peso.
            </p>
          )}
          <AvisoAgregado visible={avisoVisible} />
        </div>
      ) : (
        <p className={`${styles.compra} ${styles.agotado}`}>
          <Estado tono="negro">Sin stock</Estado>
        </p>
      )}
    </li>
  );
}
