import type { Metadata } from "next";
import Landing from "@/components/landing/Landing";
import LandingRuntime from "@/components/landing/LandingRuntime";
import "@/components/landing/landing.css";

const description =
  "Differential runtime-upgrade testing for Portaldot: same workflows before and after an upgrade, every difference classified, one command to reproduce.";

export const metadata: Metadata = {
  title: "Portal Canary · Runtime upgrade testing for Portaldot",
  description,
  openGraph: { title: "Portal Canary", description },
  twitter: { card: "summary_large_image", description },
  icons: {
    icon: [
      { url: "/assets/images/favicons/favicon.png", sizes: "16x16", type: "image/png" },
      { url: "/assets/images/favicons/favicon@2x.png", sizes: "32x32", type: "image/png" },
      { url: "/assets/images/favicons/favicon@3x.png", sizes: "48x48", type: "image/png" },
      { url: "/assets/images/favicons/favicon@12x.png", sizes: "192x192", type: "image/png" },
      { url: "/assets/images/favicons/favicon.ico", sizes: "any" },
    ],
    apple: { url: "/assets/images/favicons/favicon@11.25x.png", sizes: "180x180" },
  },
};

export const viewport = { width: "device-width" };

export default function Home() {
  return (
    <>
      <Landing />
      <LandingRuntime />
    </>
  );
}
