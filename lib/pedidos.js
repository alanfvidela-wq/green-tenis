import { crearClienteConSesion } from "./sesion";

// Los pedidos del usuario con sesión. La base solo devuelve los suyos (RLS),
// con los precios y nombres que quedaron copiados al comprar.

const VENCE_EN_MINUTOS = 30;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const ESTADOS = {
  pendiente_pago: "Pendiente de pago",
  pagado: "Pagado",
  preparando: "Preparando",
  enviado: "Enviado",
  entregado: "Entregado",
  cancelado: "Cancelado",
};

const DETALLE =
  "id,numero,estado,subtotal,descuento,envio,total,envio_datos,email,creado_en," +
  "pedido_combos(id,nombre,descuento_pct,precio_lista,descuento)," +
  "pedido_items(id,pedido_combo_id,producto_slug,marca,producto_nombre,variante_nombre," +
  "precio_unitario,cantidad,subtotal)";

async function leer(consulta) {
  const { data, error } = await consulta;
  if (error) throw new Error(`No se pudieron leer los pedidos: ${error.message}`);
  return data;
}

// El estado para mostrar. Un pedido pendiente con más de 30 minutos se ve
// «Vencido»: la base lo cancela (y devuelve el stock) en el próximo
// crear_pedido.
function estadoDe({ estado, creado_en: creadoEn }) {
  const vencido =
    estado === "pendiente_pago" &&
    Date.now() - new Date(creadoEn).getTime() > VENCE_EN_MINUTOS * 60 * 1000;
  return { clave: vencido ? "vencido" : estado, texto: vencido ? "Vencido" : ESTADOS[estado] };
}

export async function getPedidos() {
  const supabase = await crearClienteConSesion();
  const filas = await leer(
    supabase
      .from("pedidos")
      .select("id,numero,estado,total,creado_en")
      .order("creado_en", { ascending: false }),
  );
  return filas.map((fila) => ({
    id: fila.id,
    numero: fila.numero,
    total: fila.total,
    creadoEn: fila.creado_en,
    estado: estadoDe(fila),
  }));
}

// El pedido con sus líneas: primero cada combo con sus productos, después los
// sueltos. null si no existe o no es del usuario.
export async function getPedido(id) {
  if (!UUID.test(id)) return null;
  const supabase = await crearClienteConSesion();
  const fila = await leer(supabase.from("pedidos").select(DETALLE).eq("id", id).maybeSingle());
  if (!fila) return null;

  const aLinea = (item) => ({
    id: item.id,
    href: `/producto/${item.producto_slug}`,
    nombre: `${item.marca} ${item.producto_nombre}`,
    variante: item.variante_nombre,
    precioUnitario: item.precio_unitario,
    cantidad: item.cantidad,
    subtotal: item.subtotal,
  });
  const porPrecio = (a, b) => b.subtotal - a.subtotal;

  return {
    id: fila.id,
    numero: fila.numero,
    email: fila.email,
    creadoEn: fila.creado_en,
    estado: estadoDe(fila),
    lista: fila.subtotal,
    descuento: fila.descuento,
    envio: fila.envio,
    total: fila.total,
    envioDatos: fila.envio_datos,
    combos: fila.pedido_combos.map((combo) => ({
      id: combo.id,
      nombre: combo.nombre,
      descuentoPct: combo.descuento_pct,
      lista: combo.precio_lista,
      descuento: combo.descuento,
      precio: combo.precio_lista - combo.descuento,
      lineas: fila.pedido_items
        .filter((item) => item.pedido_combo_id === combo.id)
        .sort(porPrecio)
        .map(aLinea),
    })),
    sueltas: fila.pedido_items
      .filter((item) => item.pedido_combo_id === null)
      .sort(porPrecio)
      .map(aLinea),
  };
}
