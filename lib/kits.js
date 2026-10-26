import "server-only";
import { KitGuardado } from "./esquemas";
import { getCatalogoQuiz } from "./productos";
import { recomendarKit } from "./quiz";
import { crearClienteConSesion, getUsuario } from "./sesion";

// El kit del quiz: se arma con el catálogo de hoy (lib/quiz.js) y, con sesión,
// se guarda en la cuenta (kits_quiz, 0005_quiz.sql). Cada usuario tiene uno,
// el último, y la base solo le deja ver y escribir el suyo (RLS).

// El kit como lista, en el orden en que se muestra: las raquetas, la cuerda y
// la pelota. Cada ítem: { rol, producto, varianteId, motivo, disponible }.
function aItems({ raquetas, cuerda, pelota }) {
  return [
    ...raquetas.map((item) => ({ rol: "raqueta", ...item })),
    ...(cuerda ? [{ rol: "cuerda", ...cuerda }] : []),
    ...(pelota ? [{ rol: "pelota", ...pelota }] : []),
  ];
}

// El kit para estas respuestas, con el catálogo y el stock de hoy
export async function armarKit(respuestas) {
  return aItems(recomendarKit(respuestas, await getCatalogoQuiz()));
}

// Guarda el kit del usuario: reemplaza al que tenía. De cada producto quedan
// el id, la variante sugerida y el motivo; el precio y el stock se leen al
// mostrarlo.
export async function guardarKitDe(usuario, respuestas, items) {
  const supabase = await crearClienteConSesion();
  const { error } = await supabase.from("kits_quiz").upsert({
    usuario_id: usuario.id,
    respuestas,
    productos: items.map(({ rol, producto, varianteId, motivo }) => ({
      rol,
      productoId: producto.id,
      varianteId,
      motivo,
    })),
    actualizado_en: new Date().toISOString(),
  });
  if (error) throw new Error(`No se pudo guardar el kit: ${error.message}`);
}

// El kit guardado del usuario con sesión, tal como quedó: { respuestas,
// productos, actualizado_en }. null sin sesión, sin kit o si la fila no tiene
// la forma esperada.
export async function getKitGuardado() {
  const usuario = await getUsuario();
  if (!usuario) return null;
  const supabase = await crearClienteConSesion();
  const { data, error } = await supabase
    .from("kits_quiz")
    .select("respuestas,productos,actualizado_en")
    .eq("usuario_id", usuario.id)
    .maybeSingle();
  if (error) throw new Error(`No se pudo leer tu kit: ${error.message}`);
  if (!data) return null;
  const kit = KitGuardado.safeParse(data);
  return kit.success ? kit.data : null;
}

// El kit guardado con los productos de hoy, para «Tu kit»: los ítems en el
// orden en que se guardaron. Lo que ya no está a la venta se saltea.
export async function getTuKit() {
  const guardado = await getKitGuardado();
  if (!guardado) return null;
  const porId = new Map((await getCatalogoQuiz()).map((producto) => [producto.id, producto]));
  const items = guardado.productos
    .map((item) => ({ ...item, producto: porId.get(item.productoId) }))
    .filter((item) => item.producto)
    .map(({ productoId, ...item }) => ({
      ...item,
      disponible: item.producto.variantes.some((v) => v.stock === null || v.stock > 0),
    }));
  return { respuestas: guardado.respuestas, actualizadoEn: guardado.actualizado_en, items };
}
