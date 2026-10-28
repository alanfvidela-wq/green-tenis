"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useCarrito } from "@/hooks/useCarrito";
import { formatearKg, formatearPrecio } from "@/lib/formato";
import { MAX_CANTIDAD } from "@/lib/lineas";
import {
  dimensionesDe,
  eleccionInicial,
  faltaElegir,
  hayStock,
  sePuedeElegir,
  tensionDelMedio,
  tensionesDe,
  varianteElegida,
} from "@/lib/opciones";
import AvisoAgregado, { useAvisoAgregado } from "./AvisoAgregado";
import FotoVitrina from "./FotoVitrina";
import SelectorCantidad from "./SelectorCantidad";
import styles from "./PanelCompra.module.css";

function textoStock(stock) {
  if (stock === null) return "En stock";
  if (stock === 0) return "Sin stock";
  if (stock === 1) return "¡Queda 1!";
  if (stock <= 3) return `¡Quedan ${stock}!`;
  return "En stock";
}

// Una dimensión (grip, peso, la opción) como grilla de botones: el elegido en
// el acento; lo que no tiene stock con lo ya elegido, tachado y deshabilitado
function GrillaOpciones({ dimension, elegido, sePuede, onElegir }) {
  return (
    <fieldset className={styles.grupo}>
      <legend className={styles.rotulo}>{dimension.rotulo}</legend>
      <div className={styles.opciones} data-clave={dimension.clave}>
        {dimension.valores.map(({ valor, etiqueta, detalle }) => {
          const activa = valor === elegido;
          return (
            <button
              key={valor}
              type="button"
              className={styles.opcion}
              data-activa={activa || undefined}
              disabled={!sePuede(valor)}
              aria-pressed={activa}
              onClick={() => onElegir(valor)}
            >
              <span className={styles.etiqueta}>{etiqueta}</span>
              {detalle && <span className={styles.detalle}>{detalle}</span>}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

// «Llevala encordada»: el servicio de encordado con una cuerda compatible (en
// set de 12 m) y la tensión, de a medio kilo dentro del rango de la raqueta
function Encordado({ encordado, activo, onActivo, cuerdaId, onCuerda, tension, onTension, cantidad }) {
  return (
    <div className={styles.encordado}>
      <label className={styles.check}>
        <input type="checkbox" checked={activo} onChange={(e) => onActivo(e.target.checked)} />
        <span>Llevala encordada</span>
        <span className={styles.suma}>+ {formatearPrecio(encordado.servicio.precio)} y la cuerda</span>
      </label>

      {activo && (
        <div className={styles.encordadoOpciones}>
          <fieldset className={styles.grupo}>
            <legend className={styles.rotulo}>Cuerda, en set de 12 m</legend>
            <div className={styles.cuerdas}>
              {encordado.cuerdas.map((cuerda) => {
                const activa = cuerda.id === cuerdaId;
                return (
                  <button
                    key={cuerda.id}
                    type="button"
                    className={`${styles.opcion} ${styles.cuerda}`}
                    data-activa={activa || undefined}
                    disabled={!hayStock(cuerda, cantidad)}
                    aria-pressed={activa}
                    onClick={() => onCuerda(cuerda.id)}
                  >
                    <span className={styles.etiqueta}>
                      {cuerda.marca} {cuerda.nombre}
                      {cuerda.recomendada && <span className={styles.recomendada}> · Recomendada</span>}
                    </span>
                    <span className={styles.detalle}>{formatearPrecio(cuerda.precio)}</span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          <label className={styles.tension}>
            <span className={styles.rotulo}>Tensión</span>
            <select value={tension} onChange={(e) => onTension(Number(e.target.value))}>
              {tensionesDe(encordado.tensionKg).map((kg) => (
                <option key={kg} value={kg}>
                  {formatearKg(kg)}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}
    </div>
  );
}

// El panel de compra de la página de producto: marca, nombre, la frase, el
// precio, las opciones en grillas, el encordado (raquetas), la cantidad y
// «Agregar al carrito». Cuando ese botón sale de la pantalla por arriba,
// aparece abajo una barra fija con la foto, el nombre, el precio y «Agregar».
// Los precios que se muestran son los de la base; el carrito los vuelve a
// cotizar en el servidor (cotizarCarrito).
export default function PanelCompra({ producto, frase, encordado = null }) {
  const { agregarProducto } = useCarrito();
  const [avisoVisible, mostrarAviso] = useAvisoAgregado();
  const opciones = useMemo(() => dimensionesDe(producto), [producto]);
  const { dimensiones, valoresDe } = opciones;
  const [eleccion, setEleccion] = useState(() => eleccionInicial(producto, opciones));
  const [cantidad, setCantidad] = useState(1);
  const [conEncordado, setConEncordado] = useState(false);
  const cuerdaInicial = encordado?.cuerdas.find((c) => hayStock(c)) ?? null;
  const [cuerdaId, setCuerdaId] = useState(cuerdaInicial?.id ?? null);
  const [tension, setTension] = useState(encordado ? tensionDelMedio(encordado.tensionKg) : null);
  const [barraVisible, setBarraVisible] = useState(false);
  const boton = useRef(null);
  const zonaOpciones = useRef(null);

  const variante = varianteElegida(producto.variantes, valoresDe, eleccion);
  const cuerda = conEncordado ? (encordado.cuerdas.find((c) => c.id === cuerdaId) ?? null) : null;
  const agotado = !producto.variantes.some((v) => hayStock(v));
  const maximo = Math.min(MAX_CANTIDAD, variante?.stock ?? MAX_CANTIDAD, cuerda?.stock ?? MAX_CANTIDAD);
  const cantidadValida = Math.max(1, Math.min(cantidad, maximo));
  const falta = faltaElegir(dimensiones, eleccion);
  const sePuedeAgregar =
    Boolean(variante) &&
    hayStock(variante, cantidadValida) &&
    (!conEncordado || (Boolean(cuerda) && hayStock(cuerda, cantidadValida)));

  // El precio de una unidad: la variante (o el «desde») más la cuerda y el
  // servicio si va encordada
  const extra = cuerda ? cuerda.precio + encordado.servicio.precio : 0;
  const precio = (variante ? variante.precio : producto.precioBase) + extra;
  const preciosDistintos = producto.variantes.some((v) => v.precio !== producto.precioBase);
  const desde = !variante && preciosDistintos;

  // Cada vez que cambia el precio, el número sube 6px y aparece (no al cargar)
  const [precioVisto, setPrecioVisto] = useState(precio);
  const [cambiosDePrecio, setCambiosDePrecio] = useState(0);
  if (precio !== precioVisto) {
    setPrecioVisto(precio);
    setCambiosDePrecio(cambiosDePrecio + 1);
  }

  // La barra fija: visible cuando el botón principal quedó arriba, fuera de
  // la pantalla o tapado por el header fijo. Se mira en cada scroll (de a un
  // cuadro) y no con un IntersectionObserver, que no avisa si un scroll rápido
  // salta de tener el botón abajo a tenerlo arriba sin pasar por la pantalla.
  useEffect(() => {
    let cuadro = 0;
    const mirar = () => {
      cancelAnimationFrame(cuadro);
      cuadro = requestAnimationFrame(() => {
        const header = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--alto-header")) || 0;
        setBarraVisible(boton.current.getBoundingClientRect().bottom < header);
      });
    };
    mirar();
    window.addEventListener("scroll", mirar, { passive: true });
    window.addEventListener("resize", mirar);
    return () => {
      cancelAnimationFrame(cuadro);
      window.removeEventListener("scroll", mirar);
      window.removeEventListener("resize", mirar);
    };
  }, []);

  function elegir(clave, valor) {
    setEleccion((anterior) => ({ ...anterior, [clave]: valor }));
  }

  function agregar() {
    if (!sePuedeAgregar) {
      // Desde la barra, sin todo elegido: lleva a las opciones y deja el foco
      // en la primera que falta
      const reducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const primeraQueFalta = dimensiones.find((d) => eleccion[d.clave] === null);
      zonaOpciones.current.scrollIntoView({ behavior: reducido ? "auto" : "smooth", block: "center" });
      zonaOpciones.current
        .querySelector(`[data-clave="${primeraQueFalta?.clave}"] button:not(:disabled)`)
        ?.focus({ preventScroll: true });
      return;
    }
    agregarProducto(
      variante.id,
      cantidadValida,
      cuerda ? { cuerdaId: cuerda.id, tensionKg: tension } : undefined,
    );
    mostrarAviso();
  }

  let nota = null;
  if (!agotado && falta) nota = `Falta elegir ${falta}.`;
  else if (variante && !hayStock(variante)) nota = "Esta opción no tiene stock.";

  return (
    <div className={styles.panel}>
      <p className={styles.marca}>{producto.marca}</p>
      <h1 className={`display ${styles.nombre}`}>{producto.nombre}</h1>
      {frase && <p className={styles.frase}>{frase}</p>}

      <div className={styles.precios}>
        <p key={cambiosDePrecio} className={styles.precio} data-cambio={cambiosDePrecio > 0 || undefined}>
          {desde && <span className={styles.desde}>desde </span>}
          {formatearPrecio(precio)}
        </p>
        {cuerda && (
          <p className={styles.desglose}>
            {producto.nombre} {formatearPrecio(variante?.precio ?? producto.precioBase)} · cuerda{" "}
            {formatearPrecio(cuerda.precio)} · encordado {formatearPrecio(encordado.servicio.precio)}
          </p>
        )}
      </div>

      <div ref={zonaOpciones} className={styles.zonaOpciones}>
        {dimensiones.map((dimension) => (
          <GrillaOpciones
            key={dimension.clave}
            dimension={dimension}
            elegido={eleccion[dimension.clave]}
            sePuede={(valor) => sePuedeElegir(producto.variantes, valoresDe, eleccion, dimension.clave, valor)}
            onElegir={(valor) => elegir(dimension.clave, valor)}
          />
        ))}
        {variante && <p className={styles.stock}>{textoStock(variante.stock)}</p>}
      </div>

      {encordado && cuerdaInicial && !agotado && (
        <Encordado
          encordado={encordado}
          activo={conEncordado}
          onActivo={setConEncordado}
          cuerdaId={cuerdaId}
          onCuerda={setCuerdaId}
          tension={tension}
          onTension={setTension}
          cantidad={cantidadValida}
        />
      )}

      <div className={styles.compra}>
        {!agotado && (
          <SelectorCantidad
            valor={cantidadValida}
            maximo={maximo}
            onCambiar={setCantidad}
            deshabilitado={!sePuedeAgregar}
          />
        )}
        <button
          ref={boton}
          type="button"
          className={`boton ${styles.agregar}`}
          disabled={!sePuedeAgregar}
          onClick={agregar}
        >
          {agotado ? "Sin stock" : "Agregar al carrito"}
        </button>
      </div>
      {nota && (
        <p className={styles.nota} role="status">
          {nota}
        </p>
      )}

      <BarraCompra
        visible={barraVisible && !agotado}
        producto={producto}
        precio={precio}
        desde={desde}
        onAgregar={agregar}
      />
      <AvisoAgregado visible={avisoVisible} />
    </div>
  );
}

// La barra fija de abajo: la foto, el nombre, el precio y «Agregar». Entra
// desde abajo (solo transform y opacity) y, mientras se ve, publica su alto en
// --alto-barra-compra para que el aviso «Agregado al carrito» quede encima.
function BarraCompra({ visible, producto, precio, desde, onAgregar }) {
  const barra = useRef(null);

  useEffect(() => {
    const raiz = document.documentElement;
    raiz.style.setProperty("--alto-barra-compra", visible ? `${barra.current.offsetHeight}px` : "0px");
    return () => raiz.style.removeProperty("--alto-barra-compra");
  }, [visible]);

  return (
    <div ref={barra} className={styles.barra} data-visible={visible || undefined} inert={!visible}>
      <div className={styles.barraFoto}>
        <FotoVitrina foto={producto.fotos?.[0]} categoria={producto.categoria} sizes="56px" />
      </div>
      <div className={styles.barraTexto}>
        <p className={styles.barraNombre}>
          {producto.marca} {producto.nombre}
        </p>
        <p className={styles.barraPrecio}>
          {desde && "desde "}
          {formatearPrecio(precio)}
        </p>
      </div>
      <button type="button" className={`boton ${styles.barraBoton}`} onClick={onAgregar}>
        Agregar
      </button>
    </div>
  );
}
