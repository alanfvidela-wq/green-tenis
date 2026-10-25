import "server-only";
import { ErrorApi, errorDeBase, noEncontrado } from "./api";
import { estadoDe } from "./pedidos";
import { aFicha } from "./productos";
import { ESTADOS_PEDIDO, SIGUIENTE_ESTADO } from "./tipos";

// Los datos de la administración. Cada función recibe el cliente con la sesión
// del admin (exigirAdminApi, lib/api.js): la base ve todo lo que RLS le deja
// ver al admin, también lo inactivo, y escribe con sus permisos. Nada de acá
// usa la clave secreta.

// Una consulta; si falla, el error de la base como error de la API
async function leer(consulta) {
  const { data, count, error } = await consulta;
  // Una página después de la última (PostgREST responde 416)
  if (error?.code === "PGRST103") return { filas: [], total: count ?? 0 };
  if (error) throw errorDeBase(error);
  return { filas: data, total: count };
}

// ---------------------------------------------------------------------------
// Productos
// ---------------------------------------------------------------------------

const LISTADO =
  "id,slug,categoria,tipo,marca,nombre,activo,destacado,variantes(id,precio,stock,activa)";

const DETALLE =
  "id,slug,categoria,tipo,marca,nombre,descripcion,destacado,activo,ficha," +
  "variantes(id,sku,nombre,precio,stock,activa,orden," +
  "variantes_raqueta(grip,peso_g),variantes_cuerda(largo_m))," +
  "fichas_raqueta(*),fichas_cuerda(*)";

// Una fila del listado: lo que hace falta para la tabla del admin
function aFilaProducto({ variantes, ...producto }) {
  const activas = variantes.filter((v) => v.activa);
  const conStock = activas.filter((v) => v.stock !== null);
  return {
    ...producto,
    variantes: variantes.length,
    precioDesde: activas.length ? Math.min(...activas.map((v) => v.precio)) : null,
    // null: ninguna variante activa controla stock
    stock: conStock.length ? conStock.reduce((suma, v) => suma + v.stock, 0) : null,
  };
}

// El producto como lo edita el formulario (y como lo recibe ProductoAdmin)
function aProductoAdmin(fila) {
  const { variantes, fichas_raqueta, fichas_cuerda, ...producto } = fila;
  return {
    ...producto,
    ficha: aFicha(fila),
    variantes: variantes.map((v) => ({
      id: v.id,
      sku: v.sku,
      nombre: v.nombre,
      precio: v.precio,
      stock: v.stock,
      activa: v.activa,
      ...(v.variantes_raqueta && { grip: v.variantes_raqueta.grip, pesoG: v.variantes_raqueta.peso_g }),
      ...(v.variantes_cuerda && { largoM: v.variantes_cuerda.largo_m }),
    })),
  };
}

// Todos los productos (activos o no), con búsqueda por palabras: cada una
// tiene que estar en la marca, el nombre o el slug. La búsqueda ya llega
// validada (solo letras, números, espacios y guiones: no rompe el filtro).
export async function listarProductos(supabase, { q, categoria, page, limit }) {
  let consulta = supabase
    .from("productos")
    .select(LISTADO, { count: "exact" })
    .neq("tipo", "servicio")
    .order("categoria")
    .order("orden")
    .order("id");
  if (categoria) consulta = consulta.eq("categoria", categoria);
  for (const palabra of q.split(/\s+/).filter(Boolean)) {
    const patron = `"%${palabra}%"`;
    consulta = consulta.or(`marca.ilike.${patron},nombre.ilike.${patron},slug.ilike.${patron}`);
  }
  const desde = (page - 1) * limit;
  const { filas, total } = await leer(consulta.range(desde, desde + limit - 1));
  return { productos: filas.map(aFilaProducto), total };
}

export async function getProductoAdmin(supabase, id) {
  const { filas } = await leer(
    supabase
      .from("productos")
      .select(DETALLE)
      .eq("id", id)
      .neq("tipo", "servicio")
      .order("orden", { referencedTable: "variantes" })
      .limit(1),
  );
  return filas[0] ? aProductoAdmin(filas[0]) : null;
}

// Crea (sin id) o actualiza un producto con su ficha y sus variantes, en una
// sola transacción (admin_guardar_producto, 0004_admin.sql). Devuelve el
// producto guardado.
export async function guardarProducto(supabase, producto, id = null) {
  const { data, error } = await supabase.rpc("admin_guardar_producto", {
    datos: { ...producto, id },
  });
  if (error) throw errorDeBase(error);
  return getProductoAdmin(supabase, data);
}

// Borra el producto con sus variantes, fichas y fotos (en cascada). Si tiene
// pedidos o está en un combo, la base no deja: 409 en_uso.
export async function borrarProducto(supabase, id) {
  const { data, error } = await supabase.from("productos").delete().eq("id", id).select("id");
  if (error) throw errorDeBase(error);
  if (data.length === 0) throw noEncontrado("No hay ningún producto con ese id.");
}

// ---------------------------------------------------------------------------
// Pedidos
// ---------------------------------------------------------------------------

const PEDIDO = "id,numero,estado,total,email,envio_datos,creado_en,pago_en_curso";

function aFilaPedido(fila) {
  const envio = fila.envio_datos ?? {};
  return {
    id: fila.id,
    numero: fila.numero,
    email: fila.email,
    nombre: envio.nombre ?? null,
    destino: [envio.ciudad, envio.provincia].filter(Boolean).join(", ") || null,
    total: fila.total,
    creadoEn: fila.creado_en,
    estado: estadoDe(fila),
    // A qué estado se lo puede pasar desde acá, o null
    siguiente: SIGUIENTE_ESTADO[fila.estado] ?? null,
  };
}

// Los pedidos de todos, el más nuevo primero, con filtro por estado (el de la
// base: pendiente_pago, pagado, preparando…)
export async function listarPedidos(supabase, { estado, page, limit }) {
  let consulta = supabase
    .from("pedidos")
    .select(PEDIDO, { count: "exact" })
    .order("creado_en", { ascending: false });
  if (estado) consulta = consulta.eq("estado", estado);
  const desde = (page - 1) * limit;
  const { filas, total } = await leer(consulta.range(desde, desde + limit - 1));
  return { pedidos: filas.map(aFilaPedido), total };
}

// Pasa un pedido al estado siguiente (de pagado a en preparación, de ahí a
// enviado). La condición sobre el estado de antes va en el mismo UPDATE: si
// otro admin ya lo movió, no se pisa.
export async function avanzarPedido(supabase, id, estado) {
  const anterior = Object.keys(SIGUIENTE_ESTADO).find((desde) => SIGUIENTE_ESTADO[desde] === estado);
  const { data, error } = await supabase
    .from("pedidos")
    .update({ estado })
    .eq("id", id)
    .eq("estado", anterior)
    .select(PEDIDO);
  if (error) throw errorDeBase(error);
  if (data.length > 0) return aFilaPedido(data[0]);

  const { filas } = await leer(supabase.from("pedidos").select("estado").eq("id", id).limit(1));
  if (filas.length === 0) throw noEncontrado("No hay ningún pedido con ese id.");
  const actual = ESTADOS_PEDIDO[filas[0].estado].toLowerCase();
  throw new ErrorApi(
    409,
    "transicion_invalida",
    `El pedido está ${actual}: a «${ESTADOS_PEDIDO[estado]}» se pasa desde «${ESTADOS_PEDIDO[anterior]}».`,
  );
}
