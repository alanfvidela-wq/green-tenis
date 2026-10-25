"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Estado, { tonoDePedido } from "@/components/Estado";
import { pedirApi } from "@/lib/clienteApi";
import { formatearDia, formatearHora, formatearPrecio } from "@/lib/formato";
import styles from "@/app/admin/admin.module.css";
import formulario from "@/app/formulario.module.css";

// Los filtros, con el estado de la base que piden (null: todos)
const FILTROS = [
  [null, "Todos"],
  ["pagado", "Pagados"],
  ["preparando", "En preparación"],
  ["enviado", "Enviados"],
  ["entregado", "Entregados"],
  ["pendiente_pago", "Pendientes de pago"],
  ["cancelado", "Cancelados"],
];

// El botón de cada salto (ver SIGUIENTE_ESTADO en lib/tipos.js)
const ACCIONES = {
  preparando: "Pasar a en preparación",
  enviado: "Marcar como enviado",
};

// El listado de pedidos de la administración: lo pide a la API
// (GET /api/v1/pedidos?todos=1, con el filtro por estado) y pasa cada pedido
// al estado siguiente con PATCH /api/v1/pedidos/[id].
export default function ListaPedidos() {
  const [estado, setEstado] = useState(null);
  const [page, setPage] = useState(1);
  const [recarga, setRecarga] = useState(0);
  const [resultado, setResultado] = useState(null);
  const [cambiados, setCambiados] = useState({});
  const [enviando, setEnviando] = useState(null);
  const [aviso, setAviso] = useState("");
  const [error, setError] = useState("");

  const clave = JSON.stringify({ estado, page, recarga });
  const cargando = resultado?.clave !== clave;

  useEffect(() => {
    const control = new AbortController();
    const parametros = new URLSearchParams({ todos: "1", page: String(page) });
    if (estado) parametros.set("estado", estado);
    pedirApi(`/api/v1/pedidos?${parametros}`, { signal: control.signal })
      .then((datos) => setResultado({ clave, ...datos }))
      .catch((problema) => {
        if (problema.name !== "AbortError") setResultado({ clave, error: problema.message });
      });
    return () => control.abort();
  }, [clave, estado, page]);

  async function avanzar(pedido) {
    setEnviando(pedido.id);
    setAviso("");
    setError("");
    try {
      const datos = await pedirApi(`/api/v1/pedidos/${pedido.id}`, {
        method: "PATCH",
        cuerpo: { estado: pedido.siguiente },
      });
      // El pedido queda en la lista con su estado nuevo hasta que se recargue
      setCambiados((actuales) => ({ ...actuales, [pedido.id]: datos.pedido }));
      setAviso(`Pedido #${pedido.numero}: ${datos.pedido.estado.texto.toLowerCase()}.`);
    } catch (problema) {
      setError(problema.message);
      // Si otro admin lo movió (409), la lista vuelve a pedirse
      if (problema.codigo === "transicion_invalida") setRecarga((n) => n + 1);
    }
    setEnviando(null);
  }

  const { pedidos = [], paginacion, error: errorLista } = resultado ?? {};

  return (
    <>
      <div className={styles.pildoras} role="group" aria-label="Filtrar por estado">
        {FILTROS.map(([valor, texto]) => (
          <button
            key={texto}
            type="button"
            className={styles.pildora}
            aria-pressed={estado === valor}
            onClick={() => {
              setEstado(valor);
              setPage(1);
              setCambiados({});
            }}
          >
            {texto}
          </button>
        ))}
      </div>

      <p role="status" className={aviso ? styles.aviso : "solo-lectores"}>
        {aviso}
      </p>
      {error && (
        <p className={formulario.error} role="alert">
          {error}
        </p>
      )}

      {errorLista ? (
        <p className={formulario.error} role="alert">
          {errorLista}
        </p>
      ) : (
        <div className={styles.desplazar} aria-busy={cargando}>
          <table className={styles.tabla}>
            <thead>
              <tr>
                <th scope="col">Pedido</th>
                <th scope="col">Fecha</th>
                <th scope="col">Cliente</th>
                <th scope="col">Estado</th>
                <th scope="col" className={styles.numero}>
                  Total
                </th>
                <th scope="col">
                  <span className="solo-lectores">Acciones</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {pedidos.map((original) => {
                const pedido = cambiados[original.id] ?? original;
                return (
                  <tr key={pedido.id}>
                    <td className={styles.principal}>
                      <Link href={`/mis-pedidos/${pedido.id}`} className={styles.numeroPedido}>
                        #{pedido.numero}
                      </Link>
                    </td>
                    <td className={styles.fecha}>
                      {formatearDia(pedido.creadoEn)}
                      <p className={styles.secundario}>{formatearHora(pedido.creadoEn)}</p>
                    </td>
                    <td>
                      {pedido.nombre ?? pedido.email}
                      <p className={styles.secundario}>
                        {pedido.nombre ? pedido.email : null}
                        {pedido.destino && (pedido.nombre ? ` · ${pedido.destino}` : pedido.destino)}
                      </p>
                    </td>
                    <td>
                      <Estado tono={tonoDePedido(pedido.estado.clave)}>{pedido.estado.texto}</Estado>
                    </td>
                    <td className={styles.numero}>{formatearPrecio(pedido.total)}</td>
                    <td>
                      <span className={styles.acciones}>
                        {pedido.siguiente && (
                          <button
                            type="button"
                            className={`boton ${styles.chico}`}
                            disabled={enviando !== null}
                            aria-label={`${ACCIONES[pedido.siguiente]}: pedido #${pedido.numero}`}
                            onClick={() => avanzar(pedido)}
                          >
                            {enviando === pedido.id ? "Guardando…" : ACCIONES[pedido.siguiente]}
                          </button>
                        )}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!cargando && pedidos.length === 0 && (
            <p className={styles.vacio}>
              {estado ? "No hay pedidos en este estado." : "Todavía no hay pedidos."}
            </p>
          )}
          {cargando && !resultado && <p className={styles.estado}>Cargando…</p>}
        </div>
      )}

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
            Página {paginacion.page} de {paginacion.paginas} · {paginacion.total} pedidos
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
    </>
  );
}
