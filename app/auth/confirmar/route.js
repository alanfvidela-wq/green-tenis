import { redirect } from "next/navigation";
import { crearClienteConSesion } from "@/lib/sesion";

// Adonde llega el link del mail de recuperación
// (…/auth/confirmar?token_hash=…&type=recovery, ver la plantilla en Supabase).
// verifyOtp valida el token e inicia la sesión (escribe las cookies), sin
// depender del navegador donde se pidió el link. Sin token, o si venció o ya
// se usó, vuelve a /recuperar para pedir otro.
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const tipo = searchParams.get("type");

  if (tokenHash && tipo === "recovery") {
    const supabase = await crearClienteConSesion();
    const { error } = await supabase.auth.verifyOtp({ type: tipo, token_hash: tokenHash });
    if (!error) redirect("/nueva-contrasena");
  }

  redirect("/recuperar?error=link");
}
