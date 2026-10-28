import { formatearKg } from "./formato";
import { crearClienteConSesion, getUsuario } from "./sesion";

// Los pedidos del usuario con sesión. La base solo devuelve los suyos (RLS),
// con los precios y nombres que quedaron copiados al comprar; al admin le deja
// ver todos, así que «Mis pedidos» filtra además por el usuario.

const VENCE_EN_MINUTOS = 30;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const ESTADOS = {
  pendiente_pago: "Pendiente de pago",
  procesando: "Pago en proceso",
  vencido: "Vencido",
  pagado: "Pagado",
  preparando: "En preparación",
  enviado: "Enviado",
  entregado: "Entregado",
  cancelado: "Cancelado",
};

// Los pagos se piden por pagos.pedido_id: con pedidos.pago_id (el pago que lo
// pagó) hay dos relaciones entre las tablas y PostgREST necesita saber cuál
const DETALLE =
  "id,numero,estado,subtotal,descuento,envio,total,envio_datos,email,creado_en," +
  "pago_en_curso,cancelado_por,mp_init_point," +
  "pedido_combos(id,combo_id,nombre,descuento_pct,precio_lista,descuento)," +
  "pedido_items(id,pedido_combo_id,producto_slug,marca,producto_nombre,variante_nombre," +
  "precio_unitario,cantidad,subtotal," +
  "pedido_encordados!pedido_encordados_servicio_item_id_fkey(tension_kg))," +
  "pagos!pagos_pedido_id_fkey(id,estado,actualizado_en)";

async function leer(consulta) {
  const { data, error } = await consulta;
  if (error) throw new Error(`No se pudieron leer los pedidos: ${error.message}`);
  return data;
}

// Hasta cuándo se puede pagar un pedido pendiente
function venceEn(creadoEn) {
  return new Date(new Date(creadoEn).getTime() + VENCE_EN_MINUTOS * 60 * 1000);
}

// El estado para mostrar. Un pedido pendiente con un pago en curso (pending o
// in_process en Mercado Pago) se ve «Pago en proceso» y no vence. Sin pago en
// curso, pasados los 30 minutos se ve «Vencido»: la base lo cancela (y
// devuelve el stock) en el próximo crear_pedido o aviso de Mercado Pago.
export function estadoDe({ estado, creado_en: creadoEn, pago_en_curso: enCurso }) {
  let clave = estado;
  if (estado === "pendiente_pago" && enCurso) clave = "procesando";
  else if (estado === "pendiente_pago" && Date.now() > venceEn(creadoEn).getTime()) clave = "vencido";
  return { clave, texto: ESTADOS[clave] };
}

export async function getPedidos() {
  const usuario = await getUsuario();
  if (!usuario) return [];
  const supabase = await crearClienteConSesion();
  const filas = await leer(
    supabase
      .from("pedidos")
      .select("id,numero,estado,total,creado_en,pago_en_curso")
      .eq("usuario_id", usuario.id)
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

// Si getPedido encontraría el pedido, sin leerlo entero. Lo pregunta el proxy
// antes de la página, para responder 404 (ver proxy.js), con su cliente: ahí
// no hay cookies() para crearClienteConSesion.
export async function existePedido(supabase, id) {
  if (!UUID.test(id)) return false;
  return Boolean(await leer(supabase.from("pedidos").select("id").eq("id", id).maybeSingle()));
}

// El pedido con sus líneas (primero cada combo con sus productos, después los
// sueltos) y lo que hace falta para cobrarlo. null si no existe o no es del
// usuario.
export async function getPedido(id) {
  if (!UUID.test(id)) return null;
  const supabase = await crearClienteConSesion();
  const fila = await leer(supabase.from("pedidos").select(DETALLE).eq("id", id).maybeSingle());
  if (!fila) return null;

  // El encordado es un servicio: no tiene página, y su línea dice la tensión
  const aLinea = (item) => {
    const encordado = [item.pedido_encordados].flat().find(Boolean);
    return {
      id: item.id,
      slug: item.producto_slug,
      href: encordado ? null : `/producto/${item.producto_slug}`,
      nombre: encordado ? item.producto_nombre : `${item.marca} ${item.producto_nombre}`,
      variante: encordado ? `Tensión ${formatearKg(Number(encordado.tension_kg))}` : item.variante_nombre,
      precioUnitario: item.precio_unitario,
      cantidad: item.cantidad,
      subtotal: item.subtotal,
    };
  };
  const porPrecio = (a, b) => b.subtotal - a.subtotal;
  const pagos = [...fila.pagos].sort((a, b) => b.actualizado_en.localeCompare(a.actualizado_en));

  return {
    id: fila.id,
    numero: fila.numero,
    email: fila.email,
    creadoEn: fila.creado_en,
    estado: estadoDe(fila),
    venceEn: venceEn(fila.creado_en).toISOString(),
    canceladoPor: fila.cancelado_por,
    initPoint: fila.mp_init_point,
    // El estado del último intento de pago en Mercado Pago, o null
    ultimoPago: pagos[0]?.estado ?? null,
    // Un pago aprobado que llegó cuando el pedido ya estaba cancelado: está en
    // revisión (pedido_revisiones)
    pagoTrasCancelar: fila.estado === "cancelado" && pagos.some((pago) => pago.estado === "approved"),
    lista: fila.subtotal,
    descuento: fila.descuento,
    envio: fila.envio,
    total: fila.total,
    envioDatos: fila.envio_datos,
    combos: fila.pedido_combos.map((combo) => ({
      id: combo.id,
      comboId: combo.combo_id,
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
