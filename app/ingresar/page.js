import Link from "next/link";
import FormularioCuenta from "@/components/FormularioCuenta";
import { rutaSiguiente } from "@/lib/siguiente";
import styles from "../formulario.module.css";

export const metadata = { title: "Ingresar" };

export default async function PaginaIngresar({ searchParams }) {
  const siguiente = rutaSiguiente((await searchParams).siguiente);

  return (
    <main className={styles.pagina}>
      <h1 className={styles.titulo}>Ingresar</h1>
      <p className={styles.bajada}>
        {siguiente === "/checkout"
          ? "Para terminar la compra, ingresá con tu cuenta. El carrito queda como está."
          : "Ingresá con tu email y tu contraseña."}
      </p>

      <FormularioCuenta modo="ingresar" siguiente={siguiente} />

      <p className={styles.alternativa}>
        ¿No tenés cuenta?{" "}
        <Link href={`/registrarme?siguiente=${encodeURIComponent(siguiente)}`}>Creá una</Link>
      </p>
    </main>
  );
}
