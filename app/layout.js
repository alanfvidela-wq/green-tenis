import { Archivo, Inter_Tight } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { DESCRIPCION_SITIO, TITULO_SITIO, URL_SITIO, compartir } from "@/lib/sitio";
import "./globals.css";

// La display: Archivo extra condensada (ancho 62, peso 900), en mayúsculas en
// los titulares y en minúscula en el wordmark. Variable, con el eje de ancho.
const display = Archivo({
  variable: "--font-display",
  subsets: ["latin"],
  axes: ["wdth"],
});

// El texto: grotesca suiza (alternativa gratuita a Whyte), en un solo peso.
// También los números chicos (precios, contadores, la ficha), con cifras de
// ancho fijo (tabular-nums)
const texto = Inter_Tight({
  variable: "--font-texto",
  subsets: ["latin"],
  weight: "400",
});

// metadataBase: contra qué se resuelven las URLs relativas de los metadatos
// (la canónica, las imágenes al compartir). Lo de compartir es lo general de
// la tienda: vale para las páginas que no definen lo suyo.
export const metadata = {
  metadataBase: new URL(URL_SITIO),
  title: {
    default: TITULO_SITIO,
    template: "%s | green.",
  },
  description: DESCRIPCION_SITIO,
  ...compartir({ titulo: TITULO_SITIO, descripcion: DESCRIPCION_SITIO }),
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={`${display.variable} ${texto.variable}`}>
      <body>
        <a href="#contenido" className="saltar">
          Ir al contenido
        </a>
        <Header />
        <div id="contenido" className="contenido-principal">
          {children}
        </div>
        <Footer />
        {/* Core Web Vitals de visitas reales (Vercel Speed Insights, ver
            docs/CI.md). Solo mide en Vercel: en local el script no existe */}
        <SpeedInsights />
      </body>
    </html>
  );
}
