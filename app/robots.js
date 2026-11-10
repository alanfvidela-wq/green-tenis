import { URL_SITIO } from "@/lib/sitio";

// /robots.txt: todo lo público se puede recorrer; la administración, la compra,
// la cuenta y la API, no
export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/checkout", "/mis-pedidos", "/tu-kit", "/api"],
    },
    sitemap: `${URL_SITIO}/sitemap.xml`,
  };
}
