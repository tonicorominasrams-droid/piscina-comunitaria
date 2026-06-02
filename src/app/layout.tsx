import type { Metadata, Viewport } from "next";
import "./globals.css";
import Pwa from "@/components/Pwa";

export const metadata: Metadata = {
  title: "Piscina Comunitària",
  description:
    "Control de la qualitat de l'aigua de la piscina comunitària: pH, clor i aspiració.",
  manifest: "/manifest.json",
  applicationName: "Piscina",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Piscina",
  },
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1682f0",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ca">
      <body>
        {children}
        <Pwa />
      </body>
    </html>
  );
}
