import type { MetadataRoute } from "next";
import { academyCopy } from "@/game/content/academy-copy";

/** Installable web app ("Add to Home Screen"): app icon, full-screen launch, dark splash. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${academyCopy.brand} | ${academyCopy.worldTitle}`,
    short_name: "etcstream",
    description: academyCopy.description,
    start_url: "/",
    display: "fullscreen",
    background_color: "#070b1e",
    theme_color: "#070b1e",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
