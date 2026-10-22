"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState } from "react";
import Totales from "./Totales";
import { useCarrito } from "@/hooks/useCarrito";
import { useCotizacion } from "@/hooks/useCotizacion";
import { confirmarPedido } from "@/lib/checkout";
import { CAMPOS_ENVIO } from "@/lib/envio";
import { formatearPrecio } from "@/lib/formato";
import formulario from "@/app/formulario.module.css";
import base from "./Carrito.module.css";
import styles from "./Checkout.module.css";

// El nombre de una línea en el resumen: marca y nombre («Babolat Pure
// Drive»); los combos, por su nombre
function nombreDe(linea) {
  if (!linea.nombre) return "Un producto que ya no está a la venta";
  return linea.tipo === "producto" ? `${linea.marca} ${linea.nombre}` : linea.nombre;
}

// Lo que se compra, tal como lo cotiza el servidor: una fila por línea y los
// totales
function Resumen({ cotizacion, alDia }) {
  return (
    <section className={base.resumen} aria-labelledby="titulo-resumen">
      <h2 id="titulo-resumen" className={base.resumenTitulo}>
        Tu pedido
      </h2>
      {cotizacion ? (
        <>
          <ul className={styles.lineas}>
            {cotizacion.lineas.map((linea) => (
              <li key={linea.clave} className={styles.linea}>
                <div>
                  <p>
                    {linea.cantidad} × {nombreDe(linea)}
                  </p>
                  {linea.detalle?.map((texto) => (
                    <p key={texto} className={styles.detalle}>
                      {texto}
                    </p>
                  ))}
                  {linea.problema && <p className={styles.problema}>{linea.problema}</p>}
                </div>
                {linea.subtotal !== undefined && (
                  <p className={styles.monto}>{formatearPrecio(linea.subtotal)}</p>
                )}
              </li>
            ))}
          </ul>
          <Totales
            lista={cotizacion.lista}
            descuento={cotizacion.descuento}
            total={cotizacion.total}
            alDia={alDia}
          />
        </>
      ) : (
        <p className={base.nota}>Calculando…</p>
      )}
      <Link href="/carrito" className={styles.editar}>
        Cambiar el carrito
      </Link>
    </section>
  );
}

// Un campo de envío: texto o la lista de provincias
function CampoEnvio({ campo, valor }) {
  const comun = {
    name: campo.nombre,
    required: !campo.opcional,
    autoComplete: campo.autoComplete,
    defaultValue: valor ?? "",
    className: formulario.entrada,
  };
  return (
    <label className={formulario.campo}>
      <span className={formulario.etiqueta}>
        {campo.etiqueta}
        {campo.opcional && " (opcional)"}
      </span>
      {campo.opciones ? (
        <select {...comun}>
          <option value="" disabled>
            Elegí una
          </option>
          {campo.opciones.map((opcion) => (
            <option key={opcion}>{opcion}</option>
          ))}
        </select>
      ) : (
        <input type={campo.tipo ?? "text"} maxLength={campo.maximo} {...comun} />
      )}
    </label>
  );
}

// El checkout: quién compra, los datos de envío y el resumen del pedido. Al
// confirmar, el servidor crea el pedido (crear_pedido) y su preferencia de
// Checkout Pro; si sale bien, se vacía el carrito y se va a Mercado Pago. Si
// Mercado Pago no respondió, se va al pedido, que tiene «Pagar».
export default function Checkout({ email }) {
  const router = useRouter();
  const { lineas, cargado, vaciar } = useCarrito();
  const { cotizacion, alDia, error } = useCotizacion();

  const [estado, confirmar, confirmando] = useActionState(async (_previo, formData) => {
    const datos = Object.fromEntries(formData);
    const resultado = await confirmarPedido(lineas, datos);
    if (resultado.pedidoId) {
      vaciar();
      if (resultado.pagoUrl) window.location.assign(resultado.pagoUrl);
      else router.push(`/mis-pedidos/${resultado.pedidoId}?nuevo=1`);
      return { listo: true, aMercadoPago: Boolean(resultado.pagoUrl) };
    }
    return { error: resultado.error, datos };
  }, null);

  if (estado?.listo) {
    return (
      <p className={base.estado}>
        {estado.aMercadoPago
          ? "Pedido confirmado. Te llevamos a Mercado Pago para pagarlo…"
          : "Pedido confirmado. Te llevamos a verlo…"}
      </p>
    );
  }
  if (!cargado) return <p className={base.estado}>Cargando…</p>;

  if (lineas.length === 0) {
    return (
      <div className={base.vacio}>
        <p className={base.estado}>Tu carrito está vacío.</p>
        <Link href="/categoria/raquetas" className="boton">
          Ver raquetas
        </Link>
      </div>
    );
  }

  const puedeConfirmar = alDia && cotizacion.puedeComprar && !confirmando;

  let nota = null;
  if (error) nota = "No se pudo calcular el pedido. Probá de nuevo en un rato.";
  else if (!alDia) nota = "Calculando…";
  else if (!cotizacion.puedeComprar) nota = "Revisá el carrito: hay líneas que no se pueden comprar.";

  return (
    <div className={base.carrito}>
      <section className={styles.datos} aria-labelledby="titulo-envio">
        <p className={styles.cuenta}>
          Comprás como <span className={styles.email}>{email}</span>
        </p>

        <form action={confirmar} className={`${formulario.formulario} ${styles.formulario}`}>
          <h2 id="titulo-envio" className={base.resumenTitulo}>
            Envío
          </h2>
          {CAMPOS_ENVIO.map((campo) => (
            <CampoEnvio key={campo.nombre} campo={campo} valor={estado?.datos?.[campo.nombre]} />
          ))}

          {estado?.error && (
            <p className={formulario.error} role="alert">
              {estado.error}
            </p>
          )}

          <button type="submit" className={`boton ${formulario.enviar}`} disabled={!puedeConfirmar}>
            {confirmando ? "Confirmando…" : "Confirmar y pagar"}
          </button>
          <p className={base.nota}>
            {nota ??
              "Al confirmar, te llevamos a Mercado Pago para pagar. Si el pago no llega en 30 minutos, el pedido se cancela."}
          </p>
        </form>
      </section>

      <Resumen cotizacion={cotizacion} alDia={alDia} />
    </div>
  );
}
