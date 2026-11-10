import { headers } from "next/headers";

// La dirección del sitio desde donde llega el pedido (localhost o Vercel), para
// que los links que salen del servidor (el mail de recuperación, las vueltas
// de Mercado Pago) vuelvan al mismo lugar
export async function origenDelSitio() {
  const encabezados = await headers();
  const host = encabezados.get("x-forwarded-host") ?? encabezados.get("host");
  const protocolo =
    encabezados.get("x-forwarded-proto")?.split(",")[0] ??
    (host?.startsWith("localhost") ? "http" : "https");
  return `${protocolo}://${host}`;
}

// El dominio de producción, fijo: es el que va en lo que leen los buscadores y
// las vistas previas al compartir (metadataBase, las URLs canónicas, el
// sitemap y robots.txt). origenDelSitio sigue al pedido porque sus links
// tienen que volver al mismo lugar (localhost, un preview de Vercel); esto no:
// un preview no tiene que indexarse ni compartirse con su propia dirección.
export const URL_SITIO = "https://green-tenis.vercel.app";

export const NOMBRE_SITIO = "green.";
export const TITULO_SITIO = "green. — Todo para el tenis";
export const DESCRIPCION_SITIO =
  "Raquetas, pelotas, cuerdas, grips y bolsos de tenis de las marcas que ya conocés, y combos armados con descuento.";

// La imagen general de la tienda al compartir un link (1200 × 630, JPG: las
// vistas previas no siempre leen WebP). Es un recorte de la foto
// raqueta-cancha-01 de public/fotos.
export const TAMANO_COMPARTIR = { width: 1200, height: 630 };
const IMAGEN_SITIO = {
  url: "/compartir.jpg",
  ...TAMANO_COMPARTIR,
  alt: "Una raqueta y una pelota sobre una cancha rápida azul",
};

// El título de una página como sale al compartirla: el openGraph no pasa por
// la plantilla de `title` (app/layout.js)
export function tituloCompartir(titulo) {
  return `${titulo} | ${NOMBRE_SITIO}`;
}

// Lo que va en `metadata` para que un link se vea bien al compartirlo (Open
// Graph y Twitter card) y, con `ruta`, su URL canónica. Sin `imagen`, la
// general de la tienda. Va entero en cada página: el openGraph de una página
// reemplaza al del layout, no lo completa.
export function compartir({ titulo, descripcion, ruta, imagen = IMAGEN_SITIO }) {
  return {
    ...(ruta && { alternates: { canonical: ruta } }),
    openGraph: {
      type: "website",
      siteName: NOMBRE_SITIO,
      locale: "es_AR",
      title: titulo,
      description: descripcion,
      ...(ruta && { url: ruta }),
      images: [imagen],
    },
    twitter: {
      card: "summary_large_image",
      title: titulo,
      description: descripcion,
      images: [imagen],
    },
  };
}

// El precio de una ficha en sus metadatos (las etiquetas de producto de Open
// Graph), en pesos enteros. Va en `other`.
export function precioCompartir(precio) {
  return { "product:price:amount": String(precio), "product:price:currency": "ARS" };
}
