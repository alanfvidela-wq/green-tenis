import { Inter_Tight, JetBrains_Mono } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "./globals.css";

// Grotesca suiza (alternativa gratuita a Whyte). En todo el sitio va en 400;
// el 800 es solo para la excepción de «Anatomía de una raqueta».
const texto = Inter_Tight({
  variable: "--font-texto",
  subsets: ["latin"],
  weight: ["400", "800"],
});

// Voz técnica para precios, talles y la ficha
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
    "Raquetas, zapatillas, pelotas, cuerdas, bolsos y ropa de tenis.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={`${texto.variable} ${datos.variable}`}>
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
