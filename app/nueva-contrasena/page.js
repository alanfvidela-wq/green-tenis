import { redirect } from "next/navigation";
import FormularioNuevaContrasena from "@/components/FormularioNuevaContrasena";
import { getUsuario } from "@/lib/sesion";
import styles from "../formulario.module.css";

export const metadata = { title: "Contraseña nueva" };

export default async function PaginaNuevaContrasena() {
  // El proxy ya redirige sin sesión; esto es la verificación de verdad
  const usuario = await getUsuario();
  if (!usuario) redirect("/ingresar?siguiente=/nueva-contrasena");

  return (
    <main className={styles.pagina}>
      <h1 className={styles.titulo}>Contraseña nueva</h1>
      <p className={styles.bajada}>Elegí la contraseña nueva para {usuario.email}.</p>

      <FormularioNuevaContrasena />
    </main>
  );
}
