"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Un link de la navegación que se marca como activo (aria-current="page")
// solo en la página que corresponde: la misma ruta o una de adentro. `tambien`
// suma otro prefijo (los combos sueltos, para «Combos»).
export default function LinkNav({ href, tambien, className, children }) {
  const pathname = usePathname();
  const activo =
    pathname === href || pathname.startsWith(`${href}/`) || Boolean(tambien && pathname.startsWith(tambien));

  return (
    <Link href={href} className={className} aria-current={activo ? "page" : undefined}>
      {children}
    </Link>
  );
}
