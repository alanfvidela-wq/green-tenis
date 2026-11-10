import { NIVELES } from "./tipos";

// El orden y los filtros de un listado de productos (la página de categoría).
// Es lógica pura: todo sale de los parámetros de la URL
// («?orden=precio-asc&marca=wilson&nivel=intermedio») y se resuelve en el
// servidor, así un listado filtrado se puede compartir y anda sin JavaScript.
// Lo que no se reconoce se ignora: queda el listado como lo ordena la tienda.

// El primero de cada grupo es el que vale sin parámetro
const ORDENES = [
  { valor: "", nombre: "Recomendados" },
  { valor: "precio-asc", nombre: "Menor precio" },
  { valor: "precio-desc", nombre: "Mayor precio" },
];

const mayuscula = (texto) => texto.charAt(0).toUpperCase() + texto.slice(1);

// «Tourna Grip» → «tourna-grip»
function slug(texto) {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const nivelDe = (producto) => producto.ficha?.nivel ?? null;

// Los grupos de opciones que tiene sentido ofrecer para estos productos: el
// orden siempre; la marca, si hay más de una; el nivel, si hay raquetas de
// más de uno. Cada opción: { valor, nombre }; la primera es «todas».
function gruposDe(productos) {
  const grupos = [{ parametro: "orden", rotulo: "Ordenar", opciones: ORDENES }];

  const marcas = [...new Set(productos.map((p) => p.marca))].sort((a, b) => a.localeCompare(b, "es"));
  if (marcas.length > 1) {
    grupos.push({
      parametro: "marca",
      rotulo: "Marca",
      opciones: [{ valor: "", nombre: "Todas" }, ...marcas.map((m) => ({ valor: slug(m), nombre: m }))],
    });
  }

  const niveles = NIVELES.filter((nivel) => productos.some((p) => nivelDe(p) === nivel));
  if (niveles.length > 1) {
    grupos.push({
      parametro: "nivel",
      rotulo: "Nivel",
      opciones: [{ valor: "", nombre: "Todos" }, ...niveles.map((n) => ({ valor: n, nombre: mayuscula(n) }))],
    });
  }
  return grupos;
}

function aplicar(productos, { orden, marca, nivel }) {
  const filtrados = productos.filter(
    (p) => (!marca || slug(p.marca) === marca) && (!nivel || nivelDe(p) === nivel),
  );
  // sort es estable: con el mismo precio queda el orden de la tienda
  if (orden === "precio-asc") filtrados.sort((a, b) => a.precioBase - b.precioBase);
  if (orden === "precio-desc") filtrados.sort((a, b) => b.precioBase - a.precioBase);
  return filtrados;
}

// El listado de `ruta` («/categoria/raquetas») según los parámetros de la URL:
// - productos: los que quedan, en orden;
// - grupos: las opciones para elegir, cada una con su link (que conserva lo
//   elegido en los otros grupos) y si es la activa;
// - filtrado: si hay algún filtro puesto (el orden no cuenta).
export function armarListado(productos, parametros, ruta) {
  const grupos = gruposDe(productos);

  // Lo elegido: solo valores que estén entre las opciones
  const elegido = {};
  for (const { parametro, opciones } of grupos) {
    const valor = parametros[parametro];
    elegido[parametro] = opciones.some((o) => o.valor === valor) ? valor : "";
  }

  const href = (cambio) => {
    const consulta = new URLSearchParams();
    for (const [parametro, valor] of Object.entries({ ...elegido, ...cambio })) {
      if (valor) consulta.set(parametro, valor);
    }
    return consulta.size > 0 ? `${ruta}?${consulta}` : ruta;
  };

  return {
    productos: aplicar(productos, elegido),
    filtrado: Boolean(elegido.marca || elegido.nivel),
    grupos: grupos.map(({ parametro, rotulo, opciones }) => ({
      parametro,
      rotulo,
      opciones: opciones.map(({ valor, nombre }) => ({
        nombre,
        href: href({ [parametro]: valor }),
        activa: elegido[parametro] === valor,
      })),
    })),
  };
}
