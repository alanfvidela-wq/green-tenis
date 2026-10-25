import Link from "next/link";
import { redirect } from "next/navigation";
import Checkout from "@/components/Checkout";
import { pagoOnlineDisponible } from "@/lib/cobros";
import { getUsuario } from "@/lib/sesion";
import styles from "../listado.module.css";

export const metadata = { title: "Finalizar compra" };

export default async function PaginaCheckout() {
  // El proxy ya redirige sin sesión; esto es la verificación de verdad
  const usuario = await getUsuario();
  if (!usuario) redirect("/ingresar?siguiente=/checkout");

  return (
    <main className={styles.pantalla}>
      <header className={styles.encabezado}>
        <nav className="migas" aria-label="Ubicación">
          <Link href="/">Inicio</Link>
          <span aria-hidden="true">/</span>
          <Link href="/carrito">Carrito</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">Finalizar compra</span>
        </nav>
        <h1 className={`display ${styles.titulo}`}>Finalizar compra</h1>
      </header>

      <Checkout email={usuario.email} pagoOnline={pagoOnlineDisponible()} />
    </main>
  );
}
