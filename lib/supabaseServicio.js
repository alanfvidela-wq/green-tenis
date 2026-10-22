import "server-only";
import { createClient } from "@supabase/supabase-js";

// Cliente de Supabase con la clave secreta (rol service_role). Saltea RLS, así
// que es solo del servidor y solo para las funciones que ejecuta service_role:
// conciliar_pago y guardar_preferencia. La clave nunca lleva NEXT_PUBLIC_.
export function crearClienteDeServicio() {
  const clave = process.env.SUPABASE_SECRET_KEY;
  if (!clave) throw new Error("Falta la variable SUPABASE_SECRET_KEY");
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, clave, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
