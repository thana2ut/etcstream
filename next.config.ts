import type { NextConfig } from "next";

const isDevelopment = process.env.NODE_ENV === "development";
// Restrict production network access to the owner-confirmed Supabase project.
const onlineOrigin = "https://unohixcxthiilnkmjunc.supabase.co";
const onlineSocket = "wss://unohixcxthiilnkmjunc.supabase.co";
// Static App Router pages need inline Next hydration scripts and React styles.
// The 3D room's troika text worker imports generated blob scripts at runtime.
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' blob: 'unsafe-inline' 'wasm-unsafe-eval'${isDevelopment ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  // Live market CMS images come from the public catalog-media bucket of the confirmed project.
  `img-src 'self' data: blob: ${onlineOrigin}`,
  "font-src 'self' https://fonts.gstatic.com",
  "media-src 'self' blob:",
  // GLTFLoader decodes textures embedded in local GLB files through a temporary blob URL.
  `connect-src 'self' blob: ${onlineOrigin} ${onlineSocket}${isDevelopment ? " ws: wss:" : ""}`,
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(isDevelopment ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const nextConfig: NextConfig = {
  devIndicators: false,
  poweredByHeader: false,
  images: { remotePatterns: [{ protocol: "https", hostname: "unohixcxthiilnkmjunc.supabase.co", pathname: "/storage/v1/object/public/catalog-media/**" }] },
  async headers() {
    return [{
      source: "/:path*",
      headers: [
        { key: "Content-Security-Policy", value: contentSecurityPolicy },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
        { key: "X-DNS-Prefetch-Control", value: "off" },
        ...(!isDevelopment ? [{ key: "Strict-Transport-Security", value: "max-age=31536000" }] : []),
      ],
    }, {
      source: "/api/:path*",
      headers: [{ key: "Cache-Control", value: "private, no-store" }],
    }, {
      source: "/admin/:path*",
      headers: [{ key: "Cache-Control", value: "private, no-store" }, { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }],
    }];
  },
};

export default nextConfig;
