// Las fotos de producto se sirven desde el bucket «productos» de Supabase
// Storage (ver «Fotos de producto» en DESIGN.md)
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
          },
        ]
      : [],
  },
};

export default nextConfig;
