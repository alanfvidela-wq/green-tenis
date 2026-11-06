"use client";

import { createContext, useContext, useState } from "react";

// La variante elegida en la ficha, compartida entre el panel, que la elige, y
// la galería, que muestra su foto. Arranca con la que el panel elige de
// entrada (varianteInicial), así el servidor ya pinta la foto que corresponde.
const Contexto = createContext({ varianteId: null, setVarianteId: () => {} });

export function ProveedorVariante({ inicial = null, children }) {
  const [varianteId, setVarianteId] = useState(inicial);
  return <Contexto.Provider value={{ varianteId, setVarianteId }}>{children}</Contexto.Provider>;
}

export function useVarianteElegida() {
  return useContext(Contexto);
}
