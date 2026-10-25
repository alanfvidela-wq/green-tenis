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

// La página de producto suma la ficha: tipada para raqueta y cuerda, y en
// `ficha` (pares de rótulo y valor) para los demás tipos
const DETALLE =
  "id,slug,categoria,tipo,marca,nombre,descripcion,destacado,ficha," +
  "variantes!inner(id,nombre,precio,stock,orden," +
  "variantes_raqueta(grip,peso_g),variantes_cuerda(largo_m))," +
  "fotos(ruta,orden),fichas_raqueta(*),fichas_cuerda(*)";

// Lo activo y vendible (el encordado es un servicio y no se lista), en el
// orden de la tienda. `opciones` va a select(): { count: "exact" } cuenta el
// total.
function catalogo(campos, opciones) {
  return supabase
    .from("productos")
    .select(campos, opciones)
    .eq("activo", true)
    .neq("tipo", "servicio")
    .eq("variantes.activa", true)
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

// La ficha de raqueta y la de cuerda llegan como lista (la FK es compuesta):
// tienen una fila o ninguna. También la usa la administración (lib/admin.js):
// es la misma forma que recibe ProductoAdmin.
export function aFicha({ tipo, ficha, fichas_raqueta, fichas_cuerda }) {
  const [raqueta] = fichas_raqueta ?? [];
  if (tipo === "raqueta" && raqueta) {
    return {
      cabezaPulg2: raqueta.cabeza_pulg2,
      largoMm: raqueta.largo_mm,
      balanceMm: raqueta.balance_mm,
      patron: [raqueta.patron_principales, raqueta.patron_cruzadas],
      rigidezRa: raqueta.rigidez_ra,
      tensionKg: [Number(raqueta.tension_min_kg), Number(raqueta.tension_max_kg)],
    };
  }
  const [cuerda] = fichas_cuerda ?? [];
  if (tipo === "cuerda" && cuerda) {
    return {
      material: cuerda.material,
      calibreMm: Number(cuerda.calibre_mm),
      perfil: cuerda.perfil,
    };
  }
  return ficha ?? null;
}

// La misma forma que tenía el catálogo en memoria. precioBase es el precio de
// la variante más barata ("desde"); fotos, las URLs de las fotos de estudio,
// la de catálogo primero (sin ellas, la vitrina muestra el placeholder).
function aProducto(fila) {
  const { variantes, fotos, ficha, fichas_raqueta, fichas_cuerda, ...producto } = fila;
  const resultado = {
    ...producto,
    precioBase: Math.min(...variantes.map((v) => v.precio)),
    variantes: variantes.map(aVariante),
    fotos: fotos.map((f) => urlFoto(f.ruta)),
  };
  if (ficha !== undefined || fichas_raqueta || fichas_cuerda) {
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

// Para cotizar el carrito (desde una Server Action, que ya corre por request):
// cada variante activa con su producto. Los servicios no se venden sueltos.
const VARIANTE =
  "id,nombre,precio,stock," +
  "productos!inner(slug,categoria,tipo,marca,nombre,fotos(ruta,orden))";

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
