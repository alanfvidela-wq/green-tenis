import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import { rutaSiguiente } from "./lib/siguiente";

// Corre antes de las rutas de cuenta y de compra (ver `matcher`). Renueva la
// sesión de Supabase si venció y redirige:
// - sin sesión, /checkout, /mis-pedidos y /nueva-contrasena llevan a
//   /ingresar, con la ruta en «siguiente» para volver después;
// - con sesión, /ingresar y /registrarme llevan a «siguiente».
// Es un control optimista (lee la sesión de la cookie): cada página y cada
// acción protegida vuelve a pedir el usuario con getUsuario().

const PROTEGIDAS = ["/checkout", "/mis-pedidos", "/nueva-contrasena"];
const DE_CUENTA = ["/ingresar", "/registrarme"];

export async function proxy(request) {
  let respuesta = NextResponse.next({ request });
  // Los encabezados que pide Supabase cuando escribe cookies (sin caché)
  let sinCache = {};

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (aGuardar, encabezados) => {
          aGuardar.forEach(({ name, value }) => request.cookies.set(name, value));
          respuesta = NextResponse.next({ request });
          aGuardar.forEach(({ name, value, options }) =>
            respuesta.cookies.set(name, value, options),
          );
          sinCache = { ...sinCache, ...encabezados };
          Object.entries(sinCache).forEach(([nombre, valor]) => respuesta.headers.set(nombre, valor));
        },
      },
    },
  );

  // Verifica la sesión y, si hace falta, la renueva (escribe cookies nuevas)
  const { data } = await supabase.auth.getClaims();
  const conSesion = Boolean(data?.claims?.sub);

  // Una redirección que conserva las cookies renovadas
  const redirigir = (destino) => {
    const redireccion = NextResponse.redirect(destino);
    respuesta.cookies.getAll().forEach((cookie) => redireccion.cookies.set(cookie));
    Object.entries(sinCache).forEach(([nombre, valor]) => redireccion.headers.set(nombre, valor));
    return redireccion;
  };

  const { pathname, search, searchParams } = request.nextUrl;

  if (!conSesion && PROTEGIDAS.some((r) => pathname === r || pathname.startsWith(`${r}/`))) {
    const destino = new URL("/ingresar", request.url);
    destino.searchParams.set("siguiente", pathname + search);
    return redirigir(destino);
  }

  if (conSesion && DE_CUENTA.includes(pathname)) {
    return redirigir(new URL(rutaSiguiente(searchParams.get("siguiente")), request.url));
  }

  return respuesta;
}

export const config = {
  matcher: [
    "/checkout/:path*",
    "/mis-pedidos/:path*",
    "/nueva-contrasena",
    "/ingresar",
    "/registrarme",
  ],
};
