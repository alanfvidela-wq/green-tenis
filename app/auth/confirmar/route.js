import { isAuthPKCECodeVerifierMissingError } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { crearClienteConSesion } from "@/lib/sesion";

// Adonde llega el link del mail de recuperación. Inicia la sesión y lleva a
// /nueva-contrasena; si no puede, vuelve a /recuperar diciendo por qué. Acepta
// los dos formatos de link:
//
// - ?code=… (plantilla por defecto de Supabase, {{ .ConfirmationURL }}): flujo
//   PKCE. exchangeCodeForSession necesita el verificador que guardó
//   resetPasswordForEmail en una cookie de este navegador (pedirRecuperacion,
//   en lib/cuenta.js). Abierto en otro navegador, no hay cookie y no sirve.
// - ?token_hash=…&type=recovery (la plantilla en castellano, cuando haya SMTP
//   propio): verifyOtp no depende de ninguna cookie y sirve en cualquier
//   navegador.
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const codigo = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const tipo = searchParams.get("type");

  if (tokenHash && tipo === "recovery") {
    const supabase = await crearClienteConSesion();
    const { error } = await supabase.auth.verifyOtp({ type: tipo, token_hash: tokenHash });
    redirect(error ? "/recuperar?error=link" : "/nueva-contrasena");
  }

  if (codigo) {
    const supabase = await crearClienteConSesion();
    const { error } = await supabase.auth.exchangeCodeForSession(codigo);
    if (!error) redirect("/nueva-contrasena");
    redirect(
      isAuthPKCECodeVerifierMissingError(error)
        ? "/recuperar?error=navegador"
        : "/recuperar?error=link",
    );
  }

  // Sin token, o con el error que agrega Supabase cuando el link venció
  redirect("/recuperar?error=link");
}
