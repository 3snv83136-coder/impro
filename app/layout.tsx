import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Impro Coach — Qui Quoi Où",
  description: "Outil de gestion de séance d'improvisation théâtrale",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#6b2fa0",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-dvh bg-white">{children}</body>
    </html>
  );
}
