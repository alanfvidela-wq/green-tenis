import { createClient } from "@supabase/supabase-js";

// Cliente de servidor para leer el catálogo, que es público: va con la clave
// publicable y sin sesión. Lo que no está activo lo esconde la base (RLS).
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

// Los datos de una consulta; si falla, un error que atrapa app/error.js
export async function leer(consulta) {
  const { data, error } = await consulta;
  if (error) throw new Error(`No se pudo leer el catálogo: ${error.message}`);
  return data;
}

// Una página de una consulta con { count: "exact" }: sus filas y el total sin
// paginar. null si la página empieza después de la última fila (PostgREST
// responde 416, PGRST103).
export async function leerPagina(consulta) {
  const { data, count, error } = await consulta;
  if (error?.code === "PGRST103") return null;
  if (error) throw new Error(`No se pudo leer el catálogo: ${error.message}`);
  return { filas: data, total: count };
}

// URL pública de una foto del bucket «productos» (ver «Fotos de producto» en
// DESIGN.md). En la base se guarda solo la ruta: «estudio/<slug>-1.webp».
export function urlFoto(ruta) {
  return supabase.storage.from("productos").getPublicUrl(ruta).data.publicUrl;
}
