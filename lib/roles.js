// El rol de admin: {"rol": "admin"} en app_metadata, lo mismo que mira la base
// con es_admin() (ver supabase/migrations/0001_esquema.sql). app_metadata solo
// se escribe con la clave secreta o desde el SQL Editor: el usuario no se lo
// puede poner solo. Lo usan el proxy (con los claims del token) y el servidor
// (con el usuario que devuelve Supabase Auth).
export const ROL_ADMIN = "admin";

export function esAdmin(appMetadata) {
  return appMetadata?.rol === ROL_ADMIN;
}
