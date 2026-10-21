import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Portal Canary",
  description:
    "Differential runtime-upgrade testing for Portaldot. Run the same workflows before and after an upgrade, see exactly what diverged, and reproduce it with one command. Live on the PortaldotV3 testnet.",
  icons: { icon: { url: "/favicon.svg", type: "image/svg+xml" } },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#111110" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preload" href="/fonts/sentient-300.woff2" as="font" type="font/woff2" crossOrigin="" />
        <link rel="preload" href="/fonts/sentient-300i.woff2" as="font" type="font/woff2" crossOrigin="" />
      </head>
      <body>{children}</body>
    </html>
  );
}
