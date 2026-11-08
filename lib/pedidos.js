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

// Las líneas de un pedido, con sus combos y, de cada servicio de encordado, a
// qué raqueta y con qué cuerda (pedido_encordados, desde 0001). La usa también
// la administración (lib/admin.js).
export const LINEAS =
  "pedido_combos(id,combo_id,nombre,descuento_pct,precio_lista,descuento)," +
  "pedido_items(id,pedido_combo_id,producto_slug,marca,producto_nombre,variante_nombre," +
  "precio_unitario,cantidad,subtotal," +
  "pedido_encordados!pedido_encordados_servicio_item_id_fkey(raqueta_item_id,cuerda_item_id,tension_kg))";

// Los pagos se piden por pagos.pedido_id: con pedidos.pago_id (el pago que lo
// pagó) hay dos relaciones entre las tablas y PostgREST necesita saber cuál
const DETALLE =
  "id,numero,estado,subtotal,descuento,envio,total,envio_datos,email,creado_en," +
  "pago_en_curso,cancelado_por,mp_init_point," +
  LINEAS +
  ",pagos!pagos_pedido_id_fkey(id,estado,actualizado_en)";

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
    ...lineasDe(fila),
  };
}

// La relación de un servicio de encordado (una fila de pedido_encordados), o null
const encordadoDe = (item) => [item.pedido_encordados].flat().find(Boolean) ?? null;

// Una línea del pedido. El encordado es un servicio: no tiene página, y su
// línea dice la tensión
function aLinea(item) {
  const encordado = encordadoDe(item);
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
}

// Junta cada encordado con la raqueta que encorda. La raqueta suma
// `encordado`: el texto («Encordada con Babolat RPM Blast 1.25 a 24 kg») y el
// total con la cuerda y el servicio. La línea de la cuerda y las del servicio
// suman `encordaA`, el id de esa raqueta. Todas siguen en la lista con sus
// precios de siempre (la API no cambia de forma): quien las muestra deja
// afuera las que tienen `encordaA` y las pone debajo de su raqueta. Un
// servicio sin su raqueta o su cuerda en la misma lista queda como una línea
// más, como antes.
function agruparEncordados(lineas, items) {
  const enLaLista = new Set(lineas.map((linea) => linea.id));
  const itemPorId = new Map(items.map((item) => [item.id, item]));
  const porRaqueta = new Map();
  for (const item of items) {
    const relacion = encordadoDe(item);
    if (!relacion || !enLaLista.has(item.id)) continue;
    const { raqueta_item_id: raqueta, cuerda_item_id: cuerda } = relacion;
    if (!enLaLista.has(raqueta) || !enLaLista.has(cuerda) || raqueta === cuerda) continue;
    const grupo = porRaqueta.get(raqueta) ?? [];
    grupo.push({ servicio: item.id, cuerda, tensionKg: Number(relacion.tension_kg) });
    porRaqueta.set(raqueta, grupo);
  }

  const encordaA = new Map();
  const encordados = new Map();
  for (const [raqueta, grupo] of porRaqueta) {
    const cantidad = itemPorId.get(raqueta).cantidad;
    // Lo común: todas las unidades con la misma cuerda y tensión. Si no, cada
    // combinación con cuántas lleva
    const porCombinacion = new Map();
    for (const { cuerda, tensionKg } of grupo) {
      const clave = `${cuerda}|${tensionKg}`;
      porCombinacion.set(clave, { cuerda, tensionKg, n: (porCombinacion.get(clave)?.n ?? 0) + 1 });
    }
    const textos = [...porCombinacion.values()].map(({ cuerda, tensionKg, n }) => {
      const { marca, producto_nombre: nombre } = itemPorId.get(cuerda);
      const con = `con ${marca} ${nombre} a ${formatearKg(tensionKg)}`;
      return porCombinacion.size === 1 && n === cantidad ? `Encordada ${con}` : `${n} encordada${n > 1 ? "s" : ""} ${con}`;
    });

    const partes = [...new Set(grupo.flatMap(({ servicio, cuerda }) => [cuerda, servicio]))];
    for (const parte of partes) encordaA.set(parte, raqueta);
    const total = [raqueta, ...partes].reduce((suma, id) => suma + itemPorId.get(id).subtotal, 0);
    encordados.set(raqueta, { texto: textos.join("; "), total });
  }

  return lineas.map((linea) => {
    if (encordados.has(linea.id)) return { ...linea, encordado: encordados.get(linea.id) };
    if (encordaA.has(linea.id)) return { ...linea, encordaA: encordaA.get(linea.id) };
    return linea;
  });
}

// Los combos con sus productos y las líneas sueltas de una fila de pedidos
// leída con LINEAS, de la más cara a la más barata (una raqueta encordada, por
// lo que suma con su cuerda y el servicio)
export function lineasDe(fila) {
  const items = fila.pedido_items;
  const total = (linea) => linea.encordado?.total ?? linea.subtotal;
  const ordenar = (lineas) => agruparEncordados(lineas, items).sort((a, b) => total(b) - total(a));
  return {
    combos: fila.pedido_combos.map((combo) => ({
      id: combo.id,
      comboId: combo.combo_id,
      nombre: combo.nombre,
      descuentoPct: combo.descuento_pct,
      lista: combo.precio_lista,
      descuento: combo.descuento,
      precio: combo.precio_lista - combo.descuento,
      lineas: ordenar(items.filter((item) => item.pedido_combo_id === combo.id).map(aLinea)),
    })),
    sueltas: ordenar(items.filter((item) => item.pedido_combo_id === null).map(aLinea)),
  };
}
