import { redirect } from "next/navigation";
import { exigirAdmin } from "@/lib/sesion";

// /admin lleva a los productos
export default async function PaginaAdmin() {
  await exigirAdmin();
  redirect("/admin/productos");
}
