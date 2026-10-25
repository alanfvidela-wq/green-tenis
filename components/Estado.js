import styles from "./Estado.module.css";

// Etiqueta de estado (ver «Etiquetas de estado» en DESIGN.md): texto chico en
// mayúsculas sobre un fondo plano, en píldora y sin borde. Solo para estados,
// nunca de adorno. El texto siempre dice el estado: el color no es la única
// señal.
// - tono: «acento» (pagado), «neutro» (pendiente, pago en proceso) o «negro»
//   (sin stock, cancelado, vencido).
// El tono de cada estado de un pedido (las claves de lib/pedidos.js)
const TONOS_PEDIDO = {
  pagado: "acento",
  preparando: "acento",
  enviado: "acento",
  entregado: "acento",
  pendiente_pago: "neutro",
  procesando: "neutro",
  vencido: "negro",
  cancelado: "negro",
};

export function tonoDePedido(clave) {
  return TONOS_PEDIDO[clave] ?? "neutro";
}

export default function Estado({ tono = "neutro", className = "", children }) {
  return <span className={`${styles.estado} ${styles[tono]} ${className}`}>{children}</span>;
}
