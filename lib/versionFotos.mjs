// La versión del formato de las fotos de producto, que va en la URL de cada una
// (?v=2). next/image guarda cada foto optimizada 4 horas por URL, y el script
// reemplaza los archivos con el mismo nombre: si cambia el formato de todas
// (como el paso del cuadrado al 4:5), se sube este número para que las URLs
// cambien y no quede en caché la versión anterior. La usan urlFoto
// (lib/supabase.js) y next.config.mjs, que solo deja optimizar las URLs con
// esta versión.
export const VERSION_FOTOS = "2";
