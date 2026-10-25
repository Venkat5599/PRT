import "../globals.css";
import "../motion.css";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <link rel="preload" href="/fonts/sentient-300.woff2" as="font" type="font/woff2" crossOrigin="" />
      <link rel="preload" href="/fonts/sentient-300i.woff2" as="font" type="font/woff2" crossOrigin="" />
      {children}
    </>
  );
}
