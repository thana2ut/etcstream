import type { Metadata, Viewport } from "next";
import { academyCopy } from "@/game/content/academy-copy";
import { AudioProvider } from "@/components/audio/audio-provider";
import { PageLock } from "@/components/ui/page-lock";
import "./globals.css";
import "./app-shell.css";
import "./cultivation-theme.css";
import "./xianxia-theme.css";
import "./cable-lobby.css";

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
    <html lang="th">
      <body><PageLock /><AudioProvider>{children}</AudioProvider></body>
    </html>
  );
}
