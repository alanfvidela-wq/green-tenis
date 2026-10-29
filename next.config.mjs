import { VERSION_FOTOS } from "./lib/versionFotos.mjs";

// Las fotos de producto se sirven desde el bucket «productos» de Supabase
// Storage (ver «Fotos de producto» en DESIGN.md), siempre con la versión del
// formato en la URL (lib/versionFotos.mjs)
const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL)
  : null;

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: supabase
      ? [
          {
            protocol: "https",
            hostname: supabase.hostname,
            pathname: "/storage/v1/object/public/productos/**",
            search: `?v=${VERSION_FOTOS}`,
          },
        ]
      : [],
  },
};

export default nextConfig;
