import { createClient } from "@supabase/supabase-js";

// Cliente de servidor para leer el catálogo, que es público: va con la clave
// publicable y sin sesión. Lo que no está activo lo esconde la base (RLS).
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

// URL pública de una foto del bucket «productos» (ver «Fotos de producto» en
// DESIGN.md). En la base se guarda solo la ruta: «estudio/<slug>-1.webp».
export function urlFoto(ruta) {
  return supabase.storage.from("productos").getPublicUrl(ruta).data.publicUrl;
}
