import Link from "next/link";
import FormularioRecuperar from "@/components/FormularioRecuperar";
import styles from "../formulario.module.css";

export const metadata = { title: "Recuperar la contraseña" };

export default async function PaginaRecuperar({ searchParams }) {
  const { error } = await searchParams;

  return (
    <main className={styles.pagina}>
      <h1 className={`display ${styles.titulo}`}>Recuperar la contraseña</h1>
      <p className={styles.bajada}>
        Escribí el email de tu cuenta y te mandamos un link para elegir una contraseña nueva.
      </p>

      {error === "link" && (
        <p className={styles.error} role="alert">
          El link venció o ya se usó. Pedí uno nuevo.
        </p>
      )}
      {error === "navegador" && (
        <p className={styles.error} role="alert">
          El link se tiene que abrir en el mismo navegador donde lo pediste: no desde la app de
          mail del celular, otro navegador ni una ventana privada. Si pediste varios, sirve solo
          el último. Pedí uno nuevo y abrilo acá.
        </p>
      )}

      <FormularioRecuperar />

      <p className={styles.alternativa}>
        ¿Te acordaste? <Link href="/ingresar">Ingresá</Link>
      </p>
    </main>
  );
}
