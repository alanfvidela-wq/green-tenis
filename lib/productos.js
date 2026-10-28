import { connection } from "next/server";
import { leer, leerPagina, supabase, urlFoto } from "./supabase";

// Copia de las filas visibles de la tabla `categorias`. Sigue en código porque
// el header, el footer y las siluetas dependen de ella, y getCategoria tiene
// que ser síncrona. Sumar una categoría ya pide código (silueta, encuadre).
export const CATEGORIAS = [
  {
    slug: "raquetas",
    nombre: "Raquetas",
    descripcion: "Raquetas de Babolat, Wilson, Head y Yonex, con grip y peso a elección.",
  },
  {
    slug: "pelotas",
    nombre: "Pelotas",
    descripcion: "Pelotas presurizadas por tubo, por pack o por caja.",
  },
  {
    slug: "cuerdas-y-grips",
    nombre: "Cuerdas y grips",
    descripcion: "Cuerdas en set o en rollo, y overgrips por pack.",
  },
  {
    slug: "bolsos",
    nombre: "Bolsos",
    descripcion: "Raqueteros y mochilas para llevar raquetas, ropa y pelotas.",
  },
];

// Lo que necesitan la vitrina y los listados
const LISTADO =
  "id,slug,categoria,tipo,marca,nombre,descripcion,destacado," +
  "variantes!inner(id,nombre,precio,stock,orden),fotos(ruta,orden)";

// La página de producto suma la ficha: tipada para raqueta y cuerda, en
// `ficha` (pares de rótulo y valor) para los demás tipos, y las dos cosas para
// la pelota
const DETALLE =
  "id,slug,categoria,tipo,marca,nombre,descripcion,destacado,ficha," +
  "variantes!inner(id,nombre,precio,stock,orden," +
  "variantes_raqueta(grip,peso_g),variantes_cuerda(largo_m))," +
  "fotos(ruta,orden),fichas_raqueta(*),fichas_cuerda(*),fichas_pelota(*)";

// Lo activo y vendible (el encordado es un servicio y no se lista): con
// `variantes!inner` en los campos, solo lo que tiene alguna variante activa.
// `opciones` va a select(): { count: "exact" } cuenta el total.
function vendibles(campos, opciones) {
  return supabase
    .from("productos")
    .select(campos, opciones)
    .eq("activo", true)
    .neq("tipo", "servicio")
    .eq("variantes.activa", true);
}

// Lo vendible, en el orden de la tienda
function catalogo(campos, opciones) {
  return vendibles(campos, opciones)
    .order("orden")
    .order("id")
    .order("orden", { referencedTable: "variantes" })
    .order("orden", { referencedTable: "fotos" });
}

function aVariante({ id, nombre, precio, stock, variantes_raqueta, variantes_cuerda }) {
  const variante = { id, nombre, precio, stock };
  if (variantes_raqueta) {
    variante.grip = variantes_raqueta.grip;
    variante.pesoG = variantes_raqueta.peso_g;
  }
  if (variantes_cuerda) variante.largoM = variantes_cuerda.largo_m;
  return variante;
}

// Las fichas tipadas llegan como lista (la FK es compuesta): tienen una fila o
// ninguna. También la usa la administración (lib/admin.js): es la misma forma
// que recibe ProductoAdmin.
export function aFicha({ tipo, ficha, fichas_raqueta, fichas_cuerda, fichas_pelota }) {
  const [raqueta] = fichas_raqueta ?? [];
  if (tipo === "raqueta" && raqueta) {
    return {
      cabezaPulg2: raqueta.cabeza_pulg2,
      largoMm: raqueta.largo_mm,
      balanceMm: raqueta.balance_mm,
      patron: [raqueta.patron_principales, raqueta.patron_cruzadas],
      rigidezRa: raqueta.rigidez_ra,
      tensionKg: [Number(raqueta.tension_min_kg), Number(raqueta.tension_max_kg)],
      nivel: raqueta.nivel,
      perfilJuego: raqueta.perfil_juego,
    };
  }
  const [cuerda] = fichas_cuerda ?? [];
  if (tipo === "cuerda" && cuerda) {
    return {
      material: cuerda.material,
      calibreMm: Number(cuerda.calibre_mm),
      perfil: cuerda.perfil,
      perfilJuego: cuerda.perfil_juego,
    };
  }
  // La pelota: superficie y uso en su tabla, y las filas en `ficha`
  const [pelota] = fichas_pelota ?? [];
  if (tipo === "pelota" && (pelota || ficha)) {
    return {
      superficie: pelota?.superficie ?? null,
      uso: pelota?.uso ?? null,
      filas: ficha ?? [],
    };
  }
  return ficha ?? null;
}

// La misma forma que tenía el catálogo en memoria. precioBase es el precio de
// la variante más barata ("desde"); fotos, las URLs de las fotos de estudio,
// la de catálogo primero (sin ellas, la vitrina muestra el placeholder).
function aProducto(fila) {
  const { variantes, fotos, ficha, fichas_raqueta, fichas_cuerda, fichas_pelota, ...producto } =
    fila;
  const resultado = {
    ...producto,
    precioBase: Math.min(...variantes.map((v) => v.precio)),
    variantes: variantes.map(aVariante),
    fotos: fotos.map((f) => urlFoto(f.ruta)),
  };
  if (ficha !== undefined || fichas_raqueta || fichas_cuerda || fichas_pelota) {
    resultado.ficha = aFicha(fila);
  }
  return resultado;
}

export async function getProductos() {
  // El stock se lee en cada request, no en el build
  await connection();
  return (await leer(catalogo(LISTADO))).map(aProducto);
}

export async function getProductosPorCategoria(categoria) {
  await connection();
  return (await leer(catalogo(LISTADO).eq("categoria", categoria))).map(aProducto);
}

// Una página del catálogo, para GET /api/v1/productos: los productos de la
// página `page` (desde 1) de a `limit`, y cuántos hay en total. La paginación
// la hace la base (offset y limit), con el mismo orden que la tienda.
export async function getPaginaDeProductos({ categoria, page, limit }) {
  await connection();
  const filtrar = (consulta) => (categoria ? consulta.eq("categoria", categoria) : consulta);
  const desde = (page - 1) * limit;

  const pagina = await leerPagina(
    filtrar(catalogo(LISTADO, { count: "exact" })).range(desde, desde + limit - 1),
  );
  if (pagina) return { productos: pagina.filas.map(aProducto), total: pagina.total };

  // Después de la última página: ningún producto, y el total por separado
  const { total } = await leerPagina(filtrar(catalogo(LISTADO, { count: "exact", head: true })));
  return { productos: [], total };
}

export async function getProductoPorSlug(slug) {
  await connection();
  const fila = await leer(catalogo(DETALLE).eq("slug", slug).maybeSingle());
  return fila ? aProducto(fila) : null;
}

// Lo que recomienda el quiz (lib/quiz.js): las raquetas, las cuerdas y las
// pelotas a la venta, con la ficha y el peso y el largo de cada variante. Las
// que no tienen stock también: el quiz las baja, no las saca.
export async function getCatalogoQuiz() {
  await connection();
  return (await leer(catalogo(DETALLE).in("tipo", ["raqueta", "cuerda", "pelota"]))).map(
    aProducto,
  );
}

// Si getProductoPorSlug encontraría el producto, sin leerlo entero. Lo
// pregunta el proxy antes de la página, para responder 404 (ver proxy.js).
export async function existeProducto(slug) {
  return Boolean(await leer(vendibles("id,variantes!inner(id)").eq("slug", slug).maybeSingle()));
}

// Las cuerdas de la vitrina con el largo de cada variante, para saber cuál es
// el set de 12 m (el que lleva un encordado)
const LISTADO_CUERDA =
  "id,slug,categoria,tipo,marca,nombre,descripcion,destacado," +
  "variantes!inner(id,nombre,precio,stock,orden,variantes_cuerda(largo_m)),fotos(ruta,orden)";

// El set de 12 m de una cuerda, o null si no se vende en set
export function setDeCuerda(cuerda) {
  return cuerda.variantes.find((v) => v.largoM === 12) ?? null;
}

// Las cuerdas que la tienda ofrece para una raqueta (compatibilidades, la
// tabla del armador), las recomendadas primero y después en el orden de la
// tienda. Cada una lleva `recomendada`.
export async function getCuerdasCompatibles(raquetaId) {
  await connection();
  const compatibles = await leer(
    supabase
      .from("compatibilidades")
      .select("accesorio_id,recomendado")
      .eq("raqueta_id", raquetaId)
      .eq("accesorio_tipo", "cuerda"),
  );
  if (compatibles.length === 0) return [];
  const recomendada = new Map(compatibles.map((c) => [c.accesorio_id, c.recomendado]));
  const cuerdas = (await leer(catalogo(LISTADO_CUERDA).in("id", [...recomendada.keys()]))).map(
    aProducto,
  );
  return cuerdas
    .map((cuerda) => ({ ...cuerda, recomendada: recomendada.get(cuerda.id) }))
    .sort((a, b) => Number(b.recomendada) - Number(a.recomendada));
}

// La variante del servicio de encordado: la misma que elige crear_pedido (la
// primera activa del producto «encordado»). null si no está a la venta.
export async function getServicioEncordado() {
  const fila = await leer(
    supabase
      .from("productos")
      .select("variantes!inner(id,precio,orden)")
      .eq("slug", "encordado")
      .eq("tipo", "servicio")
      .eq("activo", true)
      .eq("variantes.activa", true)
      .order("orden", { referencedTable: "variantes" })
      .order("id", { referencedTable: "variantes" })
      .maybeSingle(),
  );
  const variante = fila?.variantes[0];
  return variante ? { id: variante.id, precio: variante.precio } : null;
}

// Lo que hace falta para cotizar raquetas encordadas: el servicio y, de cada
// raqueta (por id de producto), el rango de tensión y las cuerdas
// compatibles (ids de producto)
export async function getReglasEncordado(raquetaIds) {
  const [servicio, fichas, compatibles] = await Promise.all([
    getServicioEncordado(),
    leer(
      supabase
        .from("fichas_raqueta")
        .select("producto_id,tension_min_kg,tension_max_kg")
        .in("producto_id", raquetaIds),
    ),
    leer(
      supabase
        .from("compatibilidades")
        .select("raqueta_id,accesorio_id")
        .in("raqueta_id", raquetaIds)
        .eq("accesorio_tipo", "cuerda"),
    ),
  ]);
  const raquetas = new Map(
    fichas.map((f) => [
      f.producto_id,
      {
        tensionKg: [Number(f.tension_min_kg), Number(f.tension_max_kg)],
        cuerdas: new Set(
          compatibles.filter((c) => c.raqueta_id === f.producto_id).map((c) => c.accesorio_id),
        ),
      },
    ]),
  );
  return { servicio, raquetas };
}

// Para cotizar el carrito (desde una Server Action, que ya corre por request):
// cada variante activa con su producto, y el largo si es una cuerda. Los
// servicios no se venden sueltos.
const VARIANTE =
  "id,nombre,precio,stock,variantes_cuerda(largo_m)," +
  "productos!inner(id,slug,categoria,tipo,marca,nombre,fotos(ruta,orden))";

export async function getVariantesPorId(ids) {
  if (ids.length === 0) return [];
  const filas = await leer(
    supabase
      .from("variantes")
      .select(VARIANTE)
      .in("id", ids)
      .eq("activa", true)
      .eq("productos.activo", true)
      .neq("productos.tipo", "servicio")
      .order("orden", { referencedTable: "productos.fotos" }),
  );
  return filas.map(({ productos: producto, ...variante }) => ({
    ...aVariante(variante),
    producto: {
      id: producto.id,
      slug: producto.slug,
      categoria: producto.categoria,
      tipo: producto.tipo,
      marca: producto.marca,
      nombre: producto.nombre,
      fotos: producto.fotos.map((f) => urlFoto(f.ruta)),
    },
  }));
}

export function getCategoria(slug) {
  return CATEGORIAS.find((c) => c.slug === slug) ?? null;
}

// stock null: no se controla (servicios)
export function tieneStock(producto) {
  return producto.variantes.some((v) => v.stock === null || v.stock > 0);
}

export function tienePreciosDistintos(producto) {
  return producto.variantes.some((v) => v.precio !== producto.precioBase);
}
