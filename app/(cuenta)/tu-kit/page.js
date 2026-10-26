import Link from "next/link";
import { redirect } from "next/navigation";
import Kit from "@/components/Kit";
import { formatearFecha } from "@/lib/formato";
import { getTuKit } from "@/lib/kits";
import { resumirRespuestas } from "@/lib/quiz";
import { getUsuario } from "@/lib/sesion";
import listado from "@/app/listado.module.css";
import quiz from "@/app/quiz/quiz.module.css";

export const metadata = { title: "Tu kit" };

// El kit del último quiz que se hizo con sesión, con los precios y el stock
// de hoy (getTuKit, lib/kits.js)
export default async function PaginaTuKit() {
  // El proxy ya redirige sin sesión; esto es la verificación de verdad
  const usuario = await getUsuario();
  if (!usuario) redirect("/ingresar?siguiente=/tu-kit");

  const kit = await getTuKit();
  const conProductos = kit && kit.items.length > 0;

  return (
    <main>
      <header className={listado.encabezado}>
        <nav className="migas" aria-label="Ubicación">
          <Link href="/">Inicio</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">Tu kit</span>
        </nav>
        <h1 className={`display ${listado.titulo}`}>Tu kit</h1>
        {kit && (
          <>
            <p className={quiz.respuestas}>
              <span className="solo-lectores">Tus respuestas: </span>
              {resumirRespuestas(kit.respuestas).join(" · ")}
            </p>
            <p className={listado.cuenta}>
              <span className="dato">Del quiz del {formatearFecha(kit.actualizadoEn)}</span>
            </p>
          </>
        )}
        <div className={quiz.acciones}>
          <Link href="/quiz" className={conProductos ? "boton boton-secundario" : "boton"}>
            {kit ? "Volver a hacer el quiz" : "Hacer el quiz"}
          </Link>
        </div>
      </header>

      {conProductos ? (
        <Kit items={kit.items} />
      ) : (
        <p className={listado.vacio}>
          {kit
            ? "Los productos de tu kit ya no están a la venta."
            : "Todavía no hiciste el quiz de juego. Son seis preguntas y el kit queda guardado acá."}
        </p>
      )}
    </main>
  );
}
