import { Archivo, Inter_Tight, JetBrains_Mono } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "./globals.css";

// La display: Archivo extra condensada (ancho 62, peso 900), en mayúsculas en
// los titulares y en minúscula en el wordmark. Variable, con el eje de ancho.
const display = Archivo({
  variable: "--font-display",
  subsets: ["latin"],
  axes: ["wdth"],
});

// El texto: grotesca suiza (alternativa gratuita a Whyte), en un solo peso
const texto = Inter_Tight({
  variable: "--font-texto",
  subsets: ["latin"],
  weight: "400",
});

// Voz técnica para precios, contadores y la ficha
const datos = JetBrains_Mono({
  variable: "--font-datos",
  subsets: ["latin"],
  weight: "400",
});

export const metadata = {
  title: {
    default: "green. — Todo para el tenis",
    template: "%s | green.",
  },
  description:
    "Raquetas, pelotas, cuerdas, grips y bolsos de tenis.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={`${display.variable} ${texto.variable} ${datos.variable}`}>
      <body>
        <a href="#contenido" className="saltar">
          Ir al contenido
        </a>
        <Header />
        <div id="contenido" className="contenido-principal">
          {children}
        </div>
        <Footer />
      </body>
    </html>
  );
}
