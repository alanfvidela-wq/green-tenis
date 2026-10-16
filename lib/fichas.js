// Ficha técnica de cada producto, por slug. Es contenido de presentación: no
// cambia precios, stock ni variantes.

const FICHAS = {
  // Raquetas
  "babolat-pure-drive": [
    ["Cabeza", "100 pulg²"],
    ["Peso sin encordar", "300 g o 285 g"],
    ["Balance", "320 mm"],
    ["Patrón", "16 × 19"],
  ],
  "wilson-blade-98": [
    ["Cabeza", "98 pulg²"],
    ["Peso sin encordar", "305 g"],
    ["Balance", "320 mm"],
    ["Patrón", "16 × 19"],
  ],
  "head-speed-mp": [
    ["Cabeza", "100 pulg²"],
    ["Peso sin encordar", "300 g"],
    ["Balance", "320 mm"],
    ["Patrón", "16 × 19"],
  ],
  "yonex-ezone-100": [
    ["Cabeza", "100 pulg²"],
    ["Peso sin encordar", "300 g o 285 g"],
    ["Balance", "320 mm"],
    ["Patrón", "16 × 19"],
  ],
  "wilson-clash-100": [
    ["Cabeza", "100 pulg²"],
    ["Peso sin encordar", "295 g"],
    ["Balance", "310 mm"],
    ["Patrón", "16 × 19"],
  ],

  // Pelotas
  "head-tour-xt": [
    ["Tipo", "Presurizada"],
    ["Superficie", "Todas"],
    ["Felpa", "Regular"],
  ],
  "wilson-us-open": [
    ["Tipo", "Presurizada"],
    ["Superficie", "Cancha dura"],
    ["Felpa", "Extra duty"],
  ],
  "dunlop-fort-clay-court": [
    ["Tipo", "Presurizada"],
    ["Superficie", "Polvo de ladrillo"],
    ["Felpa", "Regular"],
  ],
  "babolat-gold-all-court": [
    ["Tipo", "Presurizada"],
    ["Superficie", "Todas"],
    ["Pelotas por tubo", "4"],
  ],
  "penn-championship": [
    ["Tipo", "Presurizada"],
    ["Superficie", "Todas"],
    ["Uso", "Entrenamiento y peloteo"],
  ],

  // Cuerdas y grips
  "luxilon-alu-power-125": [
    ["Material", "Copoliéster"],
    ["Calibre", "1,25 mm"],
    ["Perfil", "Redondo"],
  ],
  "babolat-rpm-blast-125": [
    ["Material", "Copoliéster"],
    ["Calibre", "1,25 mm"],
    ["Perfil", "Octogonal"],
  ],
  "solinco-hyper-g-125": [
    ["Material", "Copoliéster"],
    ["Calibre", "1,25 mm"],
    ["Perfil", "Cuadrado"],
  ],
  "wilson-pro-overgrip": [
    ["Espesor", "0,6 mm"],
    ["Tacto", "Pegajoso"],
  ],
  "tourna-grip-original": [
    ["Espesor", "0,6 mm"],
    ["Tacto", "Seco"],
  ],

  // Bolsos
  "wilson-super-tour-9": [
    ["Capacidad", "9 raquetas"],
    ["Compartimentos", "3"],
    ["Térmico", "Sí"],
  ],
  "babolat-pure-aero-rh": [
    ["Capacidad", "6 o 12 raquetas"],
    ["Compartimentos", "2 o 3"],
    ["Térmico", "Sí"],
  ],
  "head-tour-racquet-bag": [
    ["Capacidad", "6 o 9 raquetas"],
    ["Compartimentos", "2"],
    ["Bolsillo para zapatillas", "Sí"],
  ],
  "yonex-pro-backpack": [
    ["Capacidad", "2 raquetas"],
    ["Compartimentos", "2"],
    ["Bolsillo para notebook", "Sí"],
  ],
};

export function getFicha(slug) {
  return FICHAS[slug] ?? [];
}
