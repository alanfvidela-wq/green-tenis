import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { esAdmin } from "./roles";

// Cliente de Supabase con la sesión del usuario, que viaja en cookies. Va uno
// nuevo por request, como pide @supabase/ssr. Las cookies se pueden escribir
// desde Server Actions; desde un Server Component no, y no hace falta: el
// proxy (proxy.js) ya renovó la sesión antes de renderizar.
export async function crearClienteConSesion() {
  const almacen = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll: () => almacen.getAll(),
        setAll: (aGuardar) => {
          try {
            aGuardar.forEach(({ name, value, options }) => almacen.set(name, value, options));
          } catch {
            // Desde un Server Component: lo escribe el proxy
          }
        },
      },
    },
  );
}

// El usuario con sesión, verificado contra Supabase Auth; null si no hay. Lo
// piden las páginas y acciones protegidas aunque el proxy ya haya mirado: el
// proxy es solo un control optimista. En un mismo render (un layout y su
// página) se pregunta una sola vez.
export const getUsuario = cache(async () => {
  const supabase = await crearClienteConSesion();
  const { data } = await supabase.auth.getUser();
  return data.user ?? null;
});

// Si el usuario tiene el rol de admin (ver lib/roles.js)
export function usuarioEsAdmin(usuario) {
  return esAdmin(usuario?.app_metadata);
}

// Para cada página de /admin: sin sesión, a ingresar (y de vuelta acá); con
// sesión pero sin el rol, a la home. Devuelve el usuario.
export async function exigirAdmin(desde = "/admin") {
  const usuario = await getUsuario();
  if (!usuario) redirect(`/ingresar?siguiente=${encodeURIComponent(desde)}`);
  if (!usuarioEsAdmin(usuario)) redirect("/");
  return usuario;
}
