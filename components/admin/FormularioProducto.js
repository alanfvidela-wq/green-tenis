"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { erroresPorCampo, pedirApi } from "@/lib/clienteApi";
import { MATERIALES, SUPERFICIES, USOS, mayuscula } from "@/lib/fichas";
import {
  JUEGOS_CUERDA,
  JUEGOS_RAQUETA,
  MATERIALES_CUERDA,
  NIVELES,
  NOMBRES_TIPO,
  PERFILES_CUERDA,
  SUPERFICIES_PELOTA,
  TIPOS_CON_FICHA_LIBRE,
  TIPOS_POR_CATEGORIA,
  USOS_PELOTA,
} from "@/lib/tipos";
import styles from "@/app/admin/admin.module.css";
import formulario from "@/app/formulario.module.css";

// El formulario de un producto de la administración: los datos, la ficha de su
// tipo y las variantes (con precio y stock). Sin `id` crea el producto (POST
// /api/v1/productos); con `id` lo carga y lo guarda (GET y PATCH
// /api/v1/productos/[id]). Los números van como texto mientras se escriben y
// la validación es la del servidor: sus errores se muestran en cada campo.

let siguienteClave = 0;
const nuevaClave = () => `nueva-${++siguienteClave}`;

// Minúsculas, sin acentos y con guiones: «Babolat Pure Drive» → babolat-pure-drive
function slugDe(texto) {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

const aTexto = (valor) => (valor === null || valor === undefined ? "" : String(valor));
const aNumero = (texto) => (texto.trim() === "" ? null : Number(texto.replace(",", ".")));
const algunoLleno = (objeto, campos) => campos.some((campo) => objeto[campo].trim() !== "");

// Los campos de cada ficha que, vacíos todos, quieren decir «sin ficha» (el
// largo de la raqueta tiene un valor de entrada)
const CAMPOS_RAQUETA = [
  "cabezaPulg2",
  "balanceMm",
  "principales",
  "cruzadas",
  "rigidezRa",
  "tensionMin",
  "tensionMax",
  "nivel",
  "perfilJuego",
];
const CAMPOS_CUERDA = ["material", "calibreMm", "perfil", "perfilJuego"];
const CAMPOS_PELOTA = ["superficie", "uso"];

function fichaVacia(tipo) {
  if (tipo === "raqueta") {
    return {
      cabezaPulg2: "",
      largoMm: "685",
      balanceMm: "",
      principales: "",
      cruzadas: "",
      rigidezRa: "",
      tensionMin: "",
      tensionMax: "",
      nivel: "",
      perfilJuego: "",
    };
  }
  if (tipo === "cuerda") return { material: "", calibreMm: "", perfil: "", perfilJuego: "" };
  if (tipo === "pelota") return { superficie: "", uso: "", filas: [] };
  return { filas: [] };
}

// Las filas de rótulo y valor, como las edita el formulario
const aFilas = (filas) => filas.map(([rotulo, valor]) => ({ clave: nuevaClave(), rotulo, valor }));

function varianteVacia() {
  return {
    clave: nuevaClave(),
    id: null,
    sku: "",
    nombre: "",
    precio: "",
    stock: "",
    activa: true,
    grip: "",
    pesoG: "",
    largoM: "",
  };
}

function productoVacio(categoria) {
  const tipo = TIPOS_POR_CATEGORIA[categoria][0];
  return {
    categoria,
    tipo,
    marca: "",
    nombre: "",
    slug: "",
    descripcion: "",
    destacado: false,
    activo: true,
    ficha: fichaVacia(tipo),
    variantes: [varianteVacia()],
  };
}

// Lo que devuelve la API, como lo edita el formulario
function aFormulario(producto) {
  const { tipo, ficha } = producto;
  let fichaFormulario = fichaVacia(tipo);
  if (ficha && tipo === "raqueta") {
    fichaFormulario = {
      cabezaPulg2: aTexto(ficha.cabezaPulg2),
      largoMm: aTexto(ficha.largoMm),
      balanceMm: aTexto(ficha.balanceMm),
      principales: aTexto(ficha.patron?.[0]),
      cruzadas: aTexto(ficha.patron?.[1]),
      rigidezRa: aTexto(ficha.rigidezRa),
      tensionMin: aTexto(ficha.tensionKg?.[0]),
      tensionMax: aTexto(ficha.tensionKg?.[1]),
      nivel: aTexto(ficha.nivel),
      perfilJuego: aTexto(ficha.perfilJuego),
    };
  } else if (ficha && tipo === "cuerda") {
    fichaFormulario = {
      material: ficha.material,
      calibreMm: aTexto(ficha.calibreMm),
      perfil: ficha.perfil,
      perfilJuego: aTexto(ficha.perfilJuego),
    };
  } else if (ficha && tipo === "pelota") {
    fichaFormulario = {
      superficie: aTexto(ficha.superficie),
      uso: aTexto(ficha.uso),
      filas: aFilas(ficha.filas),
    };
  } else if (ficha) {
    fichaFormulario = { filas: aFilas(ficha) };
  }
  return {
    categoria: producto.categoria,
    tipo,
    marca: producto.marca,
    nombre: producto.nombre,
    slug: producto.slug,
    descripcion: producto.descripcion,
    destacado: producto.destacado,
    activo: producto.activo,
    ficha: fichaFormulario,
    variantes: producto.variantes.map((v) => ({
      ...varianteVacia(),
      clave: `variante-${v.id}`,
      id: v.id,
      sku: v.sku,
      nombre: v.nombre,
      precio: aTexto(v.precio),
      stock: aTexto(v.stock),
      activa: v.activa,
      grip: aTexto(v.grip),
      pesoG: aTexto(v.pesoG),
      largoM: aTexto(v.largoM),
    })),
  };
}

// El formulario como cuerpo de la API (ver ProductoAdmin en docs/API.md)
function aCuerpo(producto) {
  const { tipo, ficha } = producto;
  let fichaCuerpo = null;
  if (tipo === "raqueta") {
    if (algunoLleno(ficha, CAMPOS_RAQUETA)) {
      fichaCuerpo = {
        cabezaPulg2: aNumero(ficha.cabezaPulg2),
        largoMm: aNumero(ficha.largoMm) ?? 685,
        balanceMm: aNumero(ficha.balanceMm),
        patron: [aNumero(ficha.principales), aNumero(ficha.cruzadas)],
        rigidezRa: aNumero(ficha.rigidezRa),
        tensionKg: [aNumero(ficha.tensionMin), aNumero(ficha.tensionMax)],
        nivel: ficha.nivel,
        perfilJuego: ficha.perfilJuego,
      };
    }
  } else if (tipo === "cuerda") {
    if (algunoLleno(ficha, CAMPOS_CUERDA)) {
      fichaCuerpo = {
        material: ficha.material,
        calibreMm: aNumero(ficha.calibreMm),
        perfil: ficha.perfil,
        perfilJuego: ficha.perfilJuego,
      };
    }
  } else {
    const filas = ficha.filas
      .filter((fila) => fila.rotulo.trim() || fila.valor.trim())
      .map((fila) => [fila.rotulo, fila.valor]);
    if (tipo !== "pelota") fichaCuerpo = filas.length ? filas : null;
    else if (filas.length || algunoLleno(ficha, CAMPOS_PELOTA)) {
      fichaCuerpo = { superficie: ficha.superficie, uso: ficha.uso, filas };
    }
  }

  return {
    categoria: producto.categoria,
    tipo,
    marca: producto.marca,
    nombre: producto.nombre,
    slug: producto.slug,
    descripcion: producto.descripcion,
    destacado: producto.destacado,
    activo: producto.activo,
    ficha: fichaCuerpo,
    variantes: producto.variantes.map((v) => ({
      id: v.id,
      sku: v.sku,
      nombre: v.nombre,
      precio: aNumero(v.precio),
      stock: aNumero(v.stock),
      activa: v.activa,
      ...(tipo === "raqueta" && { grip: aNumero(v.grip), pesoG: aNumero(v.pesoG) }),
      ...(tipo === "cuerda" && { largoM: aNumero(v.largoM) }),
    })),
  };
}

export default function FormularioProducto({ id = null, categorias, recienCreado = false }) {
  const router = useRouter();
  const [producto, setProducto] = useState(() => (id ? null : productoVacio(categorias[0].slug)));
  const [errorCarga, setErrorCarga] = useState(null);
  const [slugTocado, setSlugTocado] = useState(Boolean(id));
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(null);
  const [aviso, setAviso] = useState(recienCreado ? "Producto creado." : "");

  useEffect(() => {
    if (!id) return;
    const control = new AbortController();
    pedirApi(`/api/v1/productos/${id}`, { signal: control.signal })
      .then((datos) => setProducto(aFormulario(datos.producto)))
      .catch((problema) => {
        if (problema.name !== "AbortError") setErrorCarga(problema.message);
      });
    return () => control.abort();
  }, [id]);

  if (errorCarga) {
    return (
      <p className={formulario.error} role="alert">
        {errorCarga}
      </p>
    );
  }
  if (!producto) return <p className={styles.estado}>Cargando…</p>;

  const errores = erroresPorCampo(error);
  const { tipo } = producto;
  // Al editar, el tipo no cambia: solo las categorías que lo admiten
  const categoriasPosibles = id
    ? categorias.filter((c) => TIPOS_POR_CATEGORIA[c.slug].includes(tipo))
    : categorias;

  function cambiar(campos) {
    setProducto((actual) => {
      const siguiente = { ...actual, ...campos };
      if (!slugTocado && ("marca" in campos || "nombre" in campos)) {
        siguiente.slug = slugDe(`${siguiente.marca} ${siguiente.nombre}`);
      }
      return siguiente;
    });
  }

  function cambiarFicha(campos) {
    setProducto((actual) => ({ ...actual, ficha: { ...actual.ficha, ...campos } }));
  }

  function cambiarCategoria(categoria) {
    setProducto((actual) => {
      const tipos = TIPOS_POR_CATEGORIA[categoria];
      const nuevoTipo = tipos.includes(actual.tipo) ? actual.tipo : tipos[0];
      return {
        ...actual,
        categoria,
        tipo: nuevoTipo,
        ficha: nuevoTipo === actual.tipo ? actual.ficha : fichaVacia(nuevoTipo),
      };
    });
  }

  function cambiarTipo(nuevoTipo) {
    setProducto((actual) => ({ ...actual, tipo: nuevoTipo, ficha: fichaVacia(nuevoTipo) }));
  }

  function cambiarVariante(clave, campos) {
    setProducto((actual) => ({
      ...actual,
      variantes: actual.variantes.map((v) => (v.clave === clave ? { ...v, ...campos } : v)),
    }));
  }

  async function guardar(evento) {
    evento.preventDefault();
    setEnviando(true);
    setError(null);
    setAviso("");
    const cuerpo = aCuerpo(producto);
    try {
      if (id) {
        // El tipo no se cambia: PATCH no lo acepta
        const cambios = { ...cuerpo };
        delete cambios.tipo;
        const datos = await pedirApi(`/api/v1/productos/${id}`, { method: "PATCH", cuerpo: cambios });
        setProducto(aFormulario(datos.producto));
        setAviso("Guardado.");
      } else {
        const datos = await pedirApi("/api/v1/productos", { method: "POST", cuerpo });
        router.push(`/admin/productos/${datos.producto.id}?creado=1`);
        return;
      }
    } catch (problema) {
      setError(problema);
    }
    setEnviando(false);
  }

  // Un campo con su etiqueta, su ayuda y su error (por la ruta del campo)
  function campo({ etiqueta, ruta, ayuda, ancho, children }) {
    const mensaje = errores[ruta];
    return (
      <label className={`${formulario.campo} ${ancho ? styles.ancho : ""}`}>
        <span className={formulario.etiqueta}>{etiqueta}</span>
        {children(mensaje ? { "aria-invalid": true } : {})}
        {ayuda && <span className={formulario.ayuda}>{ayuda}</span>}
        {mensaje && <span className={formulario.error}>{mensaje}</span>}
      </label>
    );
  }

  // Un input de texto para campo(): recibe de campo() el aria-invalid
  const entrada = (valor, alCambiar, extra = {}) =>
    function Entrada(props) {
      return (
        <input
          className={formulario.entrada}
          value={valor}
          onChange={(evento) => alCambiar(evento.target.value)}
          {...extra}
          {...props}
        />
      );
    };

  // Un select de una lista de valores para campo(), con «Elegí uno» primero.
  // `nombres` dice cómo se ve cada valor; sin él, va con mayúscula.
  const seleccion = (valor, alCambiar, valores, nombres = {}) =>
    function Seleccion(props) {
      return (
        <select
          className={formulario.entrada}
          value={valor}
          onChange={(evento) => alCambiar(evento.target.value)}
          {...props}
        >
          <option value="">Elegí uno</option>
          {valores.map((v) => (
            <option key={v} value={v}>
              {nombres[v] ?? mayuscula(v)}
            </option>
          ))}
        </select>
      );
    };

  // Las filas libres son la ficha (grip y bolso) o ficha.filas (pelota)
  const rutaFilas = tipo === "pelota" ? "ficha.filas" : "ficha";

  return (
    <form className={styles.formulario} onSubmit={guardar} noValidate>
      <p role="status" className={aviso ? styles.aviso : "solo-lectores"}>
        {aviso}
      </p>
      {error && (
        <p className={formulario.error} role="alert">
          {error.detalles.length ? "Revisá los campos marcados." : error.message}
          {error.codigo === "ya_existe" && ` ${error.message}`}
        </p>
      )}

      <fieldset className={styles.grupo}>
        <legend className={styles.grupoTitulo}>Datos</legend>
        <div className={styles.campos}>
          {campo({
            etiqueta: "Categoría",
            ruta: "categoria",
            children: (props) => (
              <select
                className={formulario.entrada}
                value={producto.categoria}
                onChange={(evento) => cambiarCategoria(evento.target.value)}
                {...props}
              >
                {categoriasPosibles.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            ),
          })}
          {campo({
            etiqueta: "Tipo",
            ruta: "tipo",
            ayuda: id ? "El tipo no se cambia: la ficha depende de él." : null,
            children: (props) => (
              <select
                className={formulario.entrada}
                value={tipo}
                disabled={Boolean(id) || TIPOS_POR_CATEGORIA[producto.categoria].length < 2}
                onChange={(evento) => cambiarTipo(evento.target.value)}
                {...props}
              >
                {(id ? [tipo] : TIPOS_POR_CATEGORIA[producto.categoria]).map((t) => (
                  <option key={t} value={t}>
                    {NOMBRES_TIPO[t]}
                  </option>
                ))}
              </select>
            ),
          })}
          {campo({
            etiqueta: "Marca",
            ruta: "marca",
            children: entrada(producto.marca, (marca) => cambiar({ marca }), { maxLength: 40 }),
          })}
          {campo({
            etiqueta: "Nombre",
            ruta: "nombre",
            children: entrada(producto.nombre, (nombre) => cambiar({ nombre }), { maxLength: 80 }),
          })}
          {campo({
            etiqueta: "Slug",
            ruta: "slug",
            ancho: true,
            ayuda: "La dirección del producto: /producto/" + (producto.slug || "…"),
            children: entrada(
              producto.slug,
              (slug) => {
                setSlugTocado(true);
                cambiar({ slug });
              },
              { maxLength: 120, spellCheck: false, autoCapitalize: "none" },
            ),
          })}
          {campo({
            etiqueta: "Descripción",
            ruta: "descripcion",
            ancho: true,
            children: (props) => (
              <textarea
                className={`${formulario.entrada} ${styles.texto}`}
                value={producto.descripcion}
                maxLength={600}
                onChange={(evento) => cambiar({ descripcion: evento.target.value })}
                {...props}
              />
            ),
          })}
        </div>
        <div className={styles.marcas}>
          <label className={styles.marca}>
            <input
              type="checkbox"
              checked={producto.activo}
              onChange={(evento) => cambiar({ activo: evento.target.checked })}
            />
            Activo (se ve en la tienda)
          </label>
          <label className={styles.marca}>
            <input
              type="checkbox"
              checked={producto.destacado}
              onChange={(evento) => cambiar({ destacado: evento.target.checked })}
            />
            Destacado (en «Lo que más sale»)
          </label>
        </div>
      </fieldset>

      <fieldset className={styles.grupo}>
        <legend className={styles.grupoTitulo}>Ficha técnica</legend>
        {tipo === "raqueta" && (
          <div className={styles.campos}>
            {campo({
              etiqueta: "Cabeza (pulg²)",
              ruta: "ficha.cabezaPulg2",
              children: entrada(producto.ficha.cabezaPulg2, (v) => cambiarFicha({ cabezaPulg2: v }), {
                inputMode: "numeric",
              }),
            })}
            {campo({
              etiqueta: "Largo (mm)",
              ruta: "ficha.largoMm",
              children: entrada(producto.ficha.largoMm, (v) => cambiarFicha({ largoMm: v }), {
                inputMode: "numeric",
              }),
            })}
            {campo({
              etiqueta: "Balance sin encordar (mm)",
              ruta: "ficha.balanceMm",
              children: entrada(producto.ficha.balanceMm, (v) => cambiarFicha({ balanceMm: v }), {
                inputMode: "numeric",
              }),
            })}
            {campo({
              etiqueta: "Rigidez (RA, opcional)",
              ruta: "ficha.rigidezRa",
              children: entrada(producto.ficha.rigidezRa, (v) => cambiarFicha({ rigidezRa: v }), {
                inputMode: "numeric",
              }),
            })}
            {campo({
              etiqueta: "Cuerdas principales",
              ruta: "ficha.patron.0",
              children: entrada(producto.ficha.principales, (v) => cambiarFicha({ principales: v }), {
                inputMode: "numeric",
              }),
            })}
            {campo({
              etiqueta: "Cuerdas cruzadas",
              ruta: "ficha.patron.1",
              children: entrada(producto.ficha.cruzadas, (v) => cambiarFicha({ cruzadas: v }), {
                inputMode: "numeric",
              }),
            })}
            {campo({
              etiqueta: "Tensión mínima (kg)",
              ruta: "ficha.tensionKg.0",
              children: entrada(producto.ficha.tensionMin, (v) => cambiarFicha({ tensionMin: v }), {
                inputMode: "decimal",
              }),
            })}
            {campo({
              etiqueta: "Tensión máxima (kg)",
              ruta: errores["ficha.tensionKg"] ? "ficha.tensionKg" : "ficha.tensionKg.1",
              children: entrada(producto.ficha.tensionMax, (v) => cambiarFicha({ tensionMax: v }), {
                inputMode: "decimal",
              }),
            })}
            {campo({
              etiqueta: "Nivel",
              ruta: "ficha.nivel",
              ayuda: "Lo usa el quiz para recomendar.",
              children: seleccion(producto.ficha.nivel, (v) => cambiarFicha({ nivel: v }), NIVELES),
            })}
            {campo({
              etiqueta: "Perfil de juego",
              ruta: "ficha.perfilJuego",
              ayuda: "Lo usa el quiz para recomendar.",
              children: seleccion(
                producto.ficha.perfilJuego,
                (v) => cambiarFicha({ perfilJuego: v }),
                JUEGOS_RAQUETA,
              ),
            })}
          </div>
        )}

        {tipo === "cuerda" && (
          <div className={styles.campos}>
            {campo({
              etiqueta: "Material",
              ruta: "ficha.material",
              children: (props) => (
                <select
                  className={formulario.entrada}
                  value={producto.ficha.material}
                  onChange={(evento) => cambiarFicha({ material: evento.target.value })}
                  {...props}
                >
                  <option value="">Elegí uno</option>
                  {MATERIALES_CUERDA.map((m) => (
                    <option key={m} value={m}>
                      {MATERIALES[m]}
                    </option>
                  ))}
                </select>
              ),
            })}
            {campo({
              etiqueta: "Calibre (mm)",
              ruta: "ficha.calibreMm",
              children: entrada(producto.ficha.calibreMm, (v) => cambiarFicha({ calibreMm: v }), {
                inputMode: "decimal",
                placeholder: "1,25",
              }),
            })}
            {campo({
              etiqueta: "Perfil (la forma)",
              ruta: "ficha.perfil",
              children: seleccion(producto.ficha.perfil, (v) => cambiarFicha({ perfil: v }), PERFILES_CUERDA),
            })}
            {campo({
              etiqueta: "Perfil de juego",
              ruta: "ficha.perfilJuego",
              ayuda: "Lo usa el quiz para recomendar.",
              children: seleccion(
                producto.ficha.perfilJuego,
                (v) => cambiarFicha({ perfilJuego: v }),
                JUEGOS_CUERDA,
              ),
            })}
          </div>
        )}

        {tipo === "pelota" && (
          <div className={styles.campos}>
            {campo({
              etiqueta: "Superficie",
              ruta: "ficha.superficie",
              ayuda: "Lo usa el quiz para recomendar.",
              children: seleccion(
                producto.ficha.superficie,
                (v) => cambiarFicha({ superficie: v }),
                SUPERFICIES_PELOTA,
                SUPERFICIES,
              ),
            })}
            {campo({
              etiqueta: "Uso",
              ruta: "ficha.uso",
              ayuda: "Lo usa el quiz para recomendar.",
              children: seleccion(producto.ficha.uso, (v) => cambiarFicha({ uso: v }), USOS_PELOTA, USOS),
            })}
          </div>
        )}

        {TIPOS_CON_FICHA_LIBRE.includes(tipo) && (
          <div className={styles.filas}>
            {producto.ficha.filas.map((fila, i) => (
              <div key={fila.clave} className={styles.fila}>
                {campo({
                  etiqueta: "Rótulo",
                  ruta: `${rutaFilas}.${i}.0`,
                  children: entrada(fila.rotulo, (rotulo) =>
                    cambiarFicha({
                      filas: producto.ficha.filas.map((f) => (f.clave === fila.clave ? { ...f, rotulo } : f)),
                    }),
                  ),
                })}
                {campo({
                  etiqueta: "Valor",
                  ruta: `${rutaFilas}.${i}.1`,
                  children: entrada(fila.valor, (valor) =>
                    cambiarFicha({
                      filas: producto.ficha.filas.map((f) => (f.clave === fila.clave ? { ...f, valor } : f)),
                    }),
                  ),
                })}
                <button
                  type="button"
                  className={`boton boton-secundario ${styles.chico} ${styles.alLado}`}
                  aria-label={`Quitar la fila ${fila.rotulo || i + 1}`}
                  onClick={() =>
                    cambiarFicha({ filas: producto.ficha.filas.filter((f) => f.clave !== fila.clave) })
                  }
                >
                  Quitar
                </button>
              </div>
            ))}
            {errores[rutaFilas] && <p className={formulario.error}>{errores[rutaFilas]}</p>}
            <button
              type="button"
              className={`boton boton-secundario ${styles.chico} ${styles.agregar}`}
              onClick={() =>
                cambiarFicha({
                  filas: [...producto.ficha.filas, { clave: nuevaClave(), rotulo: "", valor: "" }],
                })
              }
            >
              Agregar fila
            </button>
          </div>
        )}
      </fieldset>

      <fieldset className={styles.grupo}>
        <legend className={styles.grupoTitulo}>Variantes, precio y stock</legend>
        <p className={styles.bajada}>
          El precio va en pesos, sin centavos. Con el stock vacío no se controla. Una variante que ya
          se vendió no se puede quitar: se desactiva.
        </p>
        {errores.variantes && <p className={formulario.error}>{errores.variantes}</p>}
        <div className={styles.filas}>
          {producto.variantes.map((variante, i) => (
            <div key={variante.clave} className={styles.variante}>
              <div className={styles.varianteSku}>
                {campo({
                  etiqueta: "SKU",
                  ruta: `variantes.${i}.sku`,
                  children: entrada(variante.sku, (sku) => cambiarVariante(variante.clave, { sku }), {
                    spellCheck: false,
                    autoCapitalize: "characters",
                    placeholder: producto.slug ? `${producto.slug.toUpperCase()}-…` : "MARCA-MODELO-…",
                  }),
                })}
              </div>
              {campo({
                etiqueta: "Nombre",
                ruta: `variantes.${i}.nombre`,
                children: entrada(variante.nombre, (nombre) => cambiarVariante(variante.clave, { nombre }), {
                  maxLength: 60,
                }),
              })}
              {campo({
                etiqueta: "Precio",
                ruta: `variantes.${i}.precio`,
                children: entrada(variante.precio, (precio) => cambiarVariante(variante.clave, { precio }), {
                  inputMode: "numeric",
                }),
              })}
              {campo({
                etiqueta: "Stock",
                ruta: `variantes.${i}.stock`,
                children: entrada(variante.stock, (stock) => cambiarVariante(variante.clave, { stock }), {
                  inputMode: "numeric",
                  placeholder: "Sin control",
                }),
              })}
              {tipo === "raqueta" && (
                <>
                  {campo({
                    etiqueta: "Grip",
                    ruta: `variantes.${i}.grip`,
                    children: entrada(variante.grip, (grip) => cambiarVariante(variante.clave, { grip }), {
                      inputMode: "numeric",
                    }),
                  })}
                  {campo({
                    etiqueta: "Peso (g)",
                    ruta: `variantes.${i}.pesoG`,
                    children: entrada(variante.pesoG, (pesoG) => cambiarVariante(variante.clave, { pesoG }), {
                      inputMode: "numeric",
                    }),
                  })}
                </>
              )}
              {tipo === "cuerda" &&
                campo({
                  etiqueta: "Largo (m)",
                  ruta: `variantes.${i}.largoM`,
                  children: entrada(variante.largoM, (largoM) => cambiarVariante(variante.clave, { largoM }), {
                    inputMode: "numeric",
                  }),
                })}
              <label className={`${styles.marca} ${styles.alLado}`}>
                <input
                  type="checkbox"
                  checked={variante.activa}
                  onChange={(evento) => cambiarVariante(variante.clave, { activa: evento.target.checked })}
                />
                Activa
              </label>
              <button
                type="button"
                className={`boton boton-secundario ${styles.chico} ${styles.alLado}`}
                disabled={producto.variantes.length === 1}
                aria-label={`Quitar la variante ${variante.nombre || i + 1}`}
                onClick={() =>
                  setProducto((actual) => ({
                    ...actual,
                    variantes: actual.variantes.filter((v) => v.clave !== variante.clave),
                  }))
                }
              >
                Quitar
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          className={`boton boton-secundario ${styles.chico} ${styles.agregar}`}
          onClick={() =>
            setProducto((actual) => ({ ...actual, variantes: [...actual.variantes, varianteVacia()] }))
          }
        >
          Agregar variante
        </button>
      </fieldset>

      <div className={styles.pie}>
        <button type="submit" className="boton" disabled={enviando}>
          {enviando ? "Guardando…" : id ? "Guardar cambios" : "Crear producto"}
        </button>
        <Link href="/admin/productos" className="boton boton-secundario">
          Volver al listado
        </Link>
        {id && producto.activo && (
          <Link href={`/producto/${producto.slug}`} className={styles.secundario}>
            Ver en la tienda
          </Link>
        )}
      </div>
    </form>
  );
}
