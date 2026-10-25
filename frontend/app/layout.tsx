import type { Metadata, Viewport } from "next";

// Bare root: each surface loads its own stylesheet (the landing in app/page.tsx,
// the dashboard in app/dashboard/layout.tsx), so neither leaks into the other.
export const metadata: Metadata = {
  metadataBase: new URL("https://portal-canary-app.vercel.app"),
  openGraph: { type: "website", siteName: "Portal Canary", title: "Portal Canary", description: "Mainnet vs PortaldotV3: 948 runtime changes, 3 would halt the chain. Compare any two Portaldot runtimes live in your browser." },
  twitter: { card: "summary_large_image" },
  title: "Portal Canary",
  description:
    "Differential runtime-upgrade testing for Portaldot. Run the same workflows before and after an upgrade, see exactly what diverged, and reproduce it with one command. Live on the PortaldotV3 testnet.",
  icons: { icon: { url: "/favicon.svg", type: "image/svg+xml" } },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#111110" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
