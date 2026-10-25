import Link from "next/link";
import FormularioCuenta from "@/components/FormularioCuenta";
import { rutaSiguiente } from "@/lib/siguiente";
import styles from "../formulario.module.css";

export const metadata = { title: "Crear cuenta" };

export default async function PaginaRegistrarme({ searchParams }) {
  const siguiente = rutaSiguiente((await searchParams).siguiente);

  return (
    <main className={styles.pagina}>
      <h1 className={`display ${styles.titulo}`}>Crear cuenta</h1>
      <p className={styles.bajada}>
        {siguiente === "/checkout"
          ? "Con una cuenta podés terminar la compra y seguir tus pedidos. El carrito queda como está."
          : "Con una cuenta podés comprar y seguir tus pedidos."}
      </p>

      <FormularioCuenta modo="registrarme" siguiente={siguiente} />

      <p className={styles.alternativa}>
        ¿Ya tenés cuenta?{" "}
        <Link href={`/ingresar?siguiente=${encodeURIComponent(siguiente)}`}>Ingresá</Link>
      </p>
    </main>
  );
}
