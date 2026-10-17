// A dónde volver después de ingresar o registrarse: solo rutas de este sitio
// («/checkout»), nunca otro sitio («//otro.com», «https://…») ni las mismas
// páginas de cuenta, para no dar vueltas.
export function rutaSiguiente(valor, porDefecto = "/mis-pedidos") {
  if (
    typeof valor !== "string" ||
    !valor.startsWith("/") ||
    valor.startsWith("//") ||
    valor.startsWith("/\\") ||
    valor.startsWith("/ingresar") ||
    valor.startsWith("/registrarme")
  ) {
    return porDefecto;
  }
  return valor;
}
