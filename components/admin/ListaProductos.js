"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Estado from "@/components/Estado";
import { pedirApi } from "@/lib/clienteApi";
import { formatearPrecio } from "@/lib/formato";
import { NOMBRES_TIPO } from "@/lib/tipos";
import styles from "@/app/admin/admin.module.css";
import formulario from "@/app/formulario.module.css";

// Lo que espera la búsqueda después de la última tecla antes de preguntar
const ESPERA_MS = 250;

// El listado de productos de la administración: lo pide a la API
// (GET /api/v1/productos?todos=1) con la búsqueda, la categoría y la página, y
// borra con DELETE /api/v1/productos/[id] después de confirmar.
export default function ListaProductos({ categorias }) {
  const [q, setQ] = useState("");
  const [categoria, setCategoria] = useState("");
  const [page, setPage] = useState(1);
  const [recarga, setRecarga] = useState(0);
  const [resultado, setResultado] = useState(null);
  const [aBorrar, setABorrar] = useState(null);
  const [aviso, setAviso] = useState("");

  // Qué se está pidiendo: si el resultado es de otra consulta, está cargando
  const busqueda = q.trim();
  const clave = JSON.stringify({ busqueda, categoria, page, recarga });
  const cargando = resultado?.clave !== clave;
  const nombreCategoria = Object.fromEntries(categorias.map((c) => [c.slug, c.nombre]));

  useEffect(() => {
    const control = new AbortController();
    const parametros = new URLSearchParams({ todos: "1", page: String(page) });
    if (busqueda) parametros.set("q", busqueda);
    if (categoria) parametros.set("categoria", categoria);
    const temporizador = setTimeout(async () => {
      try {
        const datos = await pedirApi(`/api/v1/productos?${parametros}`, { signal: control.signal });
        setResultado({ clave, ...datos });
      } catch (error) {
        if (error.name !== "AbortError") setResultado({ clave, error: error.message });
      }
    }, ESPERA_MS);
    return () => {
      clearTimeout(temporizador);
      control.abort();
    };
  }, [clave, busqueda, categoria, page]);

  function terminar(mensaje) {
    setABorrar(null);
    setAviso(mensaje);
    setRecarga((n) => n + 1);
  }

  const { productos = [], paginacion, error } = resultado ?? {};

  return (
    <>
      <div className={styles.filtros}>
        <label className={`${formulario.campo} ${styles.filtro}`}>
          <span className={formulario.etiqueta}>Buscar</span>
          <input
            type="search"
            className={formulario.entrada}
            value={q}
            placeholder="Marca, nombre o slug"
            onChange={(evento) => {
              setQ(evento.target.value);
              setPage(1);
            }}
          />
        </label>
        <label className={formulario.campo}>
          <span className={formulario.etiqueta}>Categoría</span>
          <select
            className={formulario.entrada}
            value={categoria}
            onChange={(evento) => {
              setCategoria(evento.target.value);
              setPage(1);
            }}
          >
            <option value="">Todas</option>
            {categorias.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.nombre}
              </option>
            ))}
          </select>
        </label>
      </div>

      <p role="status" className={aviso ? styles.aviso : "solo-lectores"}>
        {aviso}
      </p>

      {error && (
        <p className={formulario.error} role="alert">
          {error}
        </p>
      )}
      {/* Sin filas no hay tabla: queda solo el mensaje de abajo */}
      {!error && productos.length > 0 && (
        <div className={styles.desplazar} aria-busy={cargando}>
          <table className={styles.tabla}>
            <thead>
              <tr>
                <th scope="col">Producto</th>
                <th scope="col">Categoría</th>
                <th scope="col" className={styles.numero}>
                  Variantes
                </th>
                <th scope="col" className={styles.numero}>
                  Desde
                </th>
                <th scope="col" className={styles.numero}>
                  Stock
                </th>
                <th scope="col">Estado</th>
                <th scope="col">
                  <span className="solo-lectores">Acciones</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {productos.map((producto) => (
                <tr key={producto.id} className={producto.activo ? "" : styles.apagada}>
                  <td>
                    <p className={styles.principal}>
                      <Link href={`/admin/productos/${producto.id}`}>
                        {producto.marca} {producto.nombre}
                      </Link>
                    </p>
                    <p className={styles.secundario}>{producto.slug}</p>
                  </td>
                  <td>
                    {nombreCategoria[producto.categoria]}
                    <p className={styles.secundario}>{NOMBRES_TIPO[producto.tipo]}</p>
                  </td>
                  <td className={styles.numero}>{producto.variantes}</td>
                  <td className={styles.numero}>
                    {producto.precioDesde === null ? "—" : formatearPrecio(producto.precioDesde)}
                  </td>
                  <td className={styles.numero}>{producto.stock ?? "Sin control"}</td>
                  <td>
                    <span className={styles.etiquetas}>
                      <Estado tono={producto.activo ? "acento" : "neutro"}>
                        {producto.activo ? "Activo" : "Inactivo"}
                      </Estado>
                      {producto.destacado && <Estado tono="negro">Destacado</Estado>}
                    </span>
                  </td>
                  <td>
                    <span className={styles.acciones}>
                      <Link
                        href={`/admin/productos/${producto.id}`}
                        className={`boton boton-secundario ${styles.chico}`}
                        aria-label={`Editar ${producto.marca} ${producto.nombre}`}
                      >
                        Editar
                      </Link>
                      <button
                        type="button"
                        className={`boton boton-secundario ${styles.chico}`}
                        aria-label={`Borrar ${producto.marca} ${producto.nombre}`}
                        onClick={() => {
                          setAviso("");
                          setABorrar(producto);
                        }}
                      >
                        Borrar
                      </button>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {/* Fuera del scroll de la tabla: así no se corren con él */}
      {!error && !cargando && productos.length === 0 && (
        <p className={styles.vacio}>
          {busqueda || categoria ? "Ningún producto coincide con la búsqueda." : "Todavía no hay productos."}
        </p>
      )}
      {cargando && !resultado && <p className={styles.estado}>Cargando…</p>}

      {paginacion?.paginas > 1 && (
        <div className={styles.paginas}>
          <button
            type="button"
            className={`boton boton-secundario ${styles.chico}`}
            disabled={page <= 1}
            onClick={() => setPage((n) => n - 1)}
          >
            Anterior
          </button>
          <span>
            Página {paginacion.page} de {paginacion.paginas} · {paginacion.total} productos
          </span>
          <button
            type="button"
            className={`boton boton-secundario ${styles.chico}`}
            disabled={page >= paginacion.paginas}
            onClick={() => setPage((n) => n + 1)}
          >
            Siguiente
          </button>
        </div>
      )}

      {aBorrar && (
        <ConfirmarBorrado producto={aBorrar} onCerrar={() => setABorrar(null)} onHecho={terminar} />
      )}
    </>
  );
}

// «¿Borrar …?» en un diálogo modal. Si la base no deja (ya tiene pedidos o está
// en un combo), ofrece desactivarlo: deja de verse en la tienda y los pedidos
// siguen intactos.
function ConfirmarBorrado({ producto, onCerrar, onHecho }) {
  const dialogo = useRef(null);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(null);
  const nombre = `${producto.marca} ${producto.nombre}`;

  useEffect(() => {
    dialogo.current.showModal();
  }, []);

  async function hacer(accion) {
    setEnviando(true);
    setError(null);
    try {
      if (accion === "borrar") {
        await pedirApi(`/api/v1/productos/${producto.id}`, { method: "DELETE" });
        onHecho(`Borraste ${nombre}.`);
      } else {
        await pedirApi(`/api/v1/productos/${producto.id}`, {
          method: "PATCH",
          cuerpo: { activo: false },
        });
        onHecho(`Desactivaste ${nombre}: ya no se ve en la tienda.`);
      }
    } catch (problema) {
      setError(problema);
      setEnviando(false);
    }
  }

  const enUso = error?.codigo === "en_uso";

  return (
    <dialog
      ref={dialogo}
      className={styles.dialogo}
      aria-labelledby="titulo-borrar"
      onClose={onCerrar}
    >
      <h2 id="titulo-borrar" className={styles.dialogoTitulo}>
        ¿Borrar {nombre}?
      </h2>
      <p className={styles.dialogoTexto}>
        Se borra con sus variantes y su ficha. No se puede deshacer.
      </p>
      {error && (
        <p className={formulario.error} role="alert">
          {enUso
            ? "Ya tiene pedidos o está en un combo, así que no se puede borrar. Podés desactivarlo: deja de verse en la tienda y los pedidos quedan como están."
            : error.message}
        </p>
      )}
      <div className={styles.dialogoAcciones}>
        <button
          type="button"
          className="boton boton-secundario"
          autoFocus
          disabled={enviando}
          onClick={() => dialogo.current.close()}
        >
          Cancelar
        </button>
        {enUso && producto.activo ? (
          <button type="button" className="boton" disabled={enviando} onClick={() => hacer("desactivar")}>
            Desactivar
          </button>
        ) : (
          <button
            type="button"
            className="boton"
            disabled={enviando || enUso}
            onClick={() => hacer("borrar")}
          >
            Borrar
          </button>
        )}
      </div>
    </dialog>
  );
}
