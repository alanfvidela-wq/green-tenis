import { borrarProducto, getProductoAdmin, guardarProducto } from "@/lib/admin";
import { ErrorApi, conErrores, exigirAdminApi, leerJson, noEncontrado, validar } from "@/lib/api";
import { CambiosProducto, ParametroProducto, ProductoAdmin } from "@/lib/esquemasAdmin";
import { getProductoPorSlug } from "@/lib/productos";

const PRIVADO = { "Cache-Control": "private, no-store" };

// PATCH y DELETE van con el id: el slug se puede cambiar
async function idDe(params) {
  const { producto } = validar(ParametroProducto, await params);
  if (typeof producto !== "number") {
    throw new ErrorApi(400, "datos_invalidos", "Para cambiar o borrar un producto va su id.", [
      { campo: "producto", mensaje: "Tiene que ser el id (un número)." },
    ]);
  }
  return producto;
}

// GET /api/v1/productos/[slug]: un producto a la venta, con sus variantes y su
// ficha. GET /api/v1/productos/[id] (solo el admin): el producto como lo edita
// la administración, activo o no, con sus skus.
export const GET = conErrores(async (_request, { params }) => {
  const { producto: clave } = validar(ParametroProducto, await params);

  if (typeof clave === "number") {
    const supabase = await exigirAdminApi();
    const producto = await getProductoAdmin(supabase, clave);
    if (!producto) throw noEncontrado("No hay ningún producto con ese id.");
    return Response.json({ producto }, { headers: PRIVADO });
  }

  const producto = await getProductoPorSlug(clave);
  if (!producto) throw noEncontrado("No hay ningún producto con ese slug.");
  return Response.json({ producto });
});

// PATCH /api/v1/productos/[id] (solo el admin): cambia los campos que llegan.
// `variantes`, si llega, es la lista completa: las que no están se borran. El
// resultado entero (lo guardado más los cambios) vuelve a pasar por el mismo
// esquema que un producto nuevo.
export const PATCH = conErrores(async (request, { params }) => {
  const supabase = await exigirAdminApi();
  const id = await idDe(params);
  const cambios = validar(CambiosProducto, await leerJson(request));

  const actual = await getProductoAdmin(supabase, id);
  if (!actual) throw noEncontrado("No hay ningún producto con ese id.");
  const producto = validar(ProductoAdmin, { ...actual, ...cambios, tipo: actual.tipo });

  const guardado = await guardarProducto(supabase, producto, id);
  return Response.json({ producto: guardado }, { headers: PRIVADO });
});

// DELETE /api/v1/productos/[id] (solo el admin): borra el producto con sus
// variantes. Si ya se vendió o está en un combo, 409 en_uso: se desactiva.
export const DELETE = conErrores(async (_request, { params }) => {
  const supabase = await exigirAdminApi();
  const id = await idDe(params);

  await borrarProducto(supabase, id);
  return new Response(null, { status: 204 });
});
