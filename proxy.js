import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import { existeCombo } from "./lib/combos";
import { existePedido } from "./lib/pedidos";
import { existeProducto, getCategoria } from "./lib/productos";
import { esAdmin } from "./lib/roles";
import { rutaSiguiente } from "./lib/siguiente";

// Corre antes de las rutas de cuenta y de compra (ver `matcher`). Renueva la
// sesión de Supabase si venció y redirige:
// - sin sesión, /checkout, /mis-pedidos, /tu-kit, /nueva-contrasena y /admin
//   llevan a /ingresar, con la ruta en «siguiente» para volver después;
// - con sesión pero sin el rol de admin, /admin lleva a la home;
// - con sesión, /ingresar y /registrarme llevan a «siguiente».
// Es un control optimista (lee la sesión de la cookie): cada página y cada
// acción protegida vuelve a pedir el usuario con getUsuario().
//
// También corre antes de cada producto, combo, categoría y pedido, para que lo
// que no existe responda 404 de verdad. La página no puede: se manda en
// streaming detrás de app/loading.js, y para cuando llama a notFound() el 200
// ya salió (solo le queda el noindex). Acá se pregunta antes si existe, con el
// mismo criterio que la página, y si no se reescribe a una ruta que no existe.

const PROTEGIDAS = ["/checkout", "/mis-pedidos", "/tu-kit", "/nueva-contrasena", "/admin"];
const ADMIN = "/admin";
const DE_CUENTA = ["/ingresar", "/registrarme"];

// Lo que se pregunta en /producto/<slug>, /combo/<slug> y /categoria/<slug>
const CATALOGO = {
  producto: existeProducto,
  combo: existeCombo,
  categoria: (slug) => Boolean(getCategoria(slug)),
};

// /mis-pedidos/<id> y /mis-pedidos/<id>/pago/<resultado>, con los resultados
// a los que vuelve Checkout Pro (RESULTADOS en la página del resultado)
const PEDIDO = /^\/mis-pedidos\/([^/]+)(?:\/pago\/([^/]+))?$/;
const RESULTADOS_PAGO = ["aprobado", "pendiente", "rechazado"];

// Una ruta que no puede existir (las carpetas con _ no son rutas): Next
// responde 404 con app/not-found.js y la URL no cambia
const NO_ENCONTRADO = "/_no-encontrado";

// Si existe lo que se pide. Si no se puede saber (la base no responde, la URL
// está mal codificada), sigue de largo: la página se encarga.
async function existe(preguntar) {
  try {
    return await preguntar();
  } catch {
    return true;
  }
}

export async function proxy(request) {
  const { pathname, search, searchParams } = request.nextUrl;

  const [, seccion, slug] = pathname.split("/");
  if (CATALOGO[seccion]) {
    return (await existe(() => CATALOGO[seccion](decodeURIComponent(slug))))
      ? NextResponse.next()
      : NextResponse.rewrite(new URL(NO_ENCONTRADO, request.url));
  }

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
  const claims = data?.claims;
  const conSesion = Boolean(claims?.sub);

  // Otra respuesta, con las cookies renovadas
  const conCookies = (otra) => {
    respuesta.cookies.getAll().forEach((cookie) => otra.cookies.set(cookie));
    Object.entries(sinCache).forEach(([nombre, valor]) => otra.headers.set(nombre, valor));
    return otra;
  };
  const redirigir = (destino) => conCookies(NextResponse.redirect(destino));

  const en = (ruta) => pathname === ruta || pathname.startsWith(`${ruta}/`);

  if (!conSesion && PROTEGIDAS.some(en)) {
    const destino = new URL("/ingresar", request.url);
    destino.searchParams.set("siguiente", pathname + search);
    return redirigir(destino);
  }

  // El rol viaja en el token (app_metadata); cada página de /admin y cada
  // endpoint que escribe lo vuelven a pedir a Supabase Auth
  if (en(ADMIN) && !esAdmin(claims.app_metadata)) {
    return redirigir(new URL("/", request.url));
  }

  if (conSesion && DE_CUENTA.includes(pathname)) {
    return redirigir(new URL(rutaSiguiente(searchParams.get("siguiente")), request.url));
  }

  // Un pedido que no existe o que no es del usuario (lo esconde la base)
  const pedido = pathname.match(PEDIDO);
  if (pedido) {
    const [, id, resultado] = pedido;
    const valido = resultado === undefined || RESULTADOS_PAGO.includes(resultado);
    if (!valido || !(await existe(() => existePedido(supabase, id)))) {
      return conCookies(NextResponse.rewrite(new URL(NO_ENCONTRADO, request.url), { request }));
    }
  }

  return respuesta;
}

// Los valores tienen que ser literales: Next los lee en el build. Los prefetch
// del router no pasan por el catálogo: no cambiarían nada y serían una
// consulta por cada link a la vista.
export const config = {
  matcher: [
    "/checkout/:path*",
    "/mis-pedidos/:path*",
    "/tu-kit",
    "/nueva-contrasena",
    "/admin/:path*",
    "/ingresar",
    "/registrarme",
    {
      source: "/producto/:slug",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
    {
      source: "/combo/:slug",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
    {
      source: "/categoria/:slug",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
