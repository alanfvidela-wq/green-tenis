import { connection } from "next/server";
import { supabase, urlFoto } from "./supabase";

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
// orden de la tienda
function catalogo(campos) {
  return supabase
    .from("productos")
    .select(campos)
    .eq("activo", true)
    .neq("tipo", "servicio")
    .eq("variantes.activa", true)
    .order("orden")
    .order("id")
    .order("orden", { referencedTable: "variantes" })
    .order("orden", { referencedTable: "fotos" });
}

async function leer(consulta) {
  const { data, error } = await consulta;
  if (error) throw new Error(`No se pudo leer el catálogo: ${error.message}`);
  return data;
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
// tienen una fila o ninguna
function aFicha({ tipo, ficha, fichas_raqueta, fichas_cuerda }) {
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

export async function getProductoPorSlug(slug) {
  await connection();
  const fila = await leer(catalogo(DETALLE).eq("slug", slug).maybeSingle());
  return fila ? aProducto(fila) : null;
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
