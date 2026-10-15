import type { Metadata, Viewport } from "next";
import { Charm, Sarabun } from "next/font/google";
import localFont from "next/font/local";
import { academyCopy } from "@/game/content/academy-copy";
import { AudioProvider } from "@/components/audio/audio-provider";
import { PageLock } from "@/components/ui/page-lock";
import "./globals.css";
import "./app-shell.css";
import "./cultivation-theme.css";
import "./xianxia-theme.css";
import "./cable-lobby.css";

// Fonts are self-hosted and preloaded with the page (no flash of a fallback font on load or reload).
const sarabun = Sarabun({ subsets: ["thai", "latin"], weight: ["300", "400", "500", "600", "700"], variable: "--font-sarabun", display: "swap" });
const charm = Charm({ subsets: ["thai", "latin"], weight: ["400", "700"], variable: "--font-charm", display: "block" });
const kart = localFont({ src: "../public/fonts/Kart-chinesestyle.ttf", variable: "--font-kart", display: "block" });

export const metadata: Metadata = {
  title: `${academyCopy.brand} | ${academyCopy.worldTitle}`,
  description: academyCopy.description,
  applicationName: academyCopy.brand,
  // app/icon.png + app/apple-icon.png are picked up by Next's file conventions (favicon + iOS home-screen icon).
  appleWebApp: { capable: true, title: "etcstream", statusBarStyle: "black-translucent" },
  openGraph: {
    title: `${academyCopy.brand} | ${academyCopy.worldTitle}`,
    description: academyCopy.description,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#070b1e",
  interactiveWidget: "resizes-content",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className={`${sarabun.variable} ${charm.variable} ${kart.variable}`}>
      <body><PageLock /><AudioProvider>{children}</AudioProvider></body>
    </html>
  );
}
