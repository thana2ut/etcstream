import type { Metadata, Viewport } from "next";
import { academyCopy } from "@/game/content/academy-copy";
import { AudioProvider } from "@/components/audio/audio-provider";
import "./globals.css";
import "./app-shell.css";
import "./cultivation-theme.css";
import "./xianxia-theme.css";

export const metadata: Metadata = {
  title: `${academyCopy.brand} | ${academyCopy.worldTitle}`,
  description: academyCopy.description,
  applicationName: academyCopy.brand,
  icons: { icon: "/icon.png" },
  openGraph: {
    title: `${academyCopy.brand} | ${academyCopy.worldTitle}`,
    description: academyCopy.description,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body><AudioProvider>{children}</AudioProvider></body>
    </html>
  );
}
