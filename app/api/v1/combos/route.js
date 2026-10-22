import { conErrores } from "@/lib/api";
import { getCombos } from "@/lib/combos";

// GET /api/v1/combos: los combos a la venta, con sus ítems y sus precios
export const GET = conErrores(async () => {
  return Response.json({ combos: await getCombos() });
});
