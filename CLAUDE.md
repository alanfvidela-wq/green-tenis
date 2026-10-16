@AGENTS.md
# Proyecto "green."

E-commerce de "green.", una tienda de tenis: raquetas, pelotas, cuerdas y grips, y bolsos,
más combos armados por la tienda con descuento. Vende productos de marcas reales. Mecánica
principal (pendiente, va en un pedido aparte): "Armá tu raqueta", un armador por pasos.

El sistema de diseño está en DESIGN.md: blanco y negro con un único acento lima, una
grotesca suiza en un solo peso y la vitrina de productos sobre fondo de estudio.

## Stack
- Next.js con App Router, JavaScript (sin TypeScript), sin Tailwind.
- Estilos: CSS Modules + variables CSS en app/globals.css.
- Datos simulados en lib/ con funciones async; después se migra a Supabase.

## Cómo trabajar
- Trabajá de forma autónoma, sin pedir confirmación en cada paso. Respuestas breves.
- Al terminar cada tarea, verificá que `npm run build` no tenga errores y hacé un commit descriptivo.
- No instales dependencias nuevas salvo que sea imprescindible.
- Server Components por defecto; "use client" solo donde haya interactividad.
- Precios, descuentos y stock siempre se calculan y validan en el servidor.
- Precios en ARS como enteros.
- Después de cada commit, hacé git push a main (Vercel publica automáticamente).