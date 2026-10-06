import type { NextConfig } from "next";

const isDevelopment = process.env.NODE_ENV === "development";
// Static App Router pages need inline Next hydration scripts and React styles.
// The 3D room's troika text worker imports generated blob scripts at runtime.
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' blob: 'unsafe-inline' 'wasm-unsafe-eval'${isDevelopment ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: blob:",
  "font-src 'self' https://fonts.gstatic.com",
  "media-src 'self' blob:",
  // GLTFLoader decodes textures embedded in local GLB files through a temporary blob URL.
  `connect-src 'self' blob:${isDevelopment ? " ws: wss:" : ""}`,
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const nextConfig: NextConfig = {
  devIndicators: false,
  poweredByHeader: false,
  async headers() {
    return [{
      source: "/:path*",
      headers: [
        { key: "Content-Security-Policy", value: contentSecurityPolicy },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      ],
    }];
  },
};

export default nextConfig;
