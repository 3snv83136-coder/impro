import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Impro Coach — Qui Quoi Où",
  description: "Outil de gestion de séance d'improvisation théâtrale",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
