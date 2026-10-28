import type { Metadata } from "next";
import Shell from "@/components/dashboard/Shell";

export const metadata: Metadata = {
  title: "Dashboard · Portal Canary",
  description: "Upgrade a fresh Portaldot chain to your candidate runtime, test it, and get a verdict. Compare live runtimes, check nodes and the mainnet supply.",
};

export default function Dashboard() {
  return (
    <>
      <main>
        <Shell />
      </main>
    </>
  );
}
