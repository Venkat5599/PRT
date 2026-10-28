import type { Metadata } from "next";
import DashboardBehaviors from "@/components/DashboardBehaviors";
import Shell from "@/components/dashboard/Shell";
import Live from "@/components/Live";
import "./theme.css";
import "./console.css";

export const metadata: Metadata = {
  title: "Dashboard · Portal Canary",
  description: "Upgrade a fresh Portaldot chain to your candidate runtime, test it, and get a verdict. Compare live runtimes, check nodes and the mainnet supply.",
};

export default function Dashboard() {
  return (
    <>
      <main className="dash-page pcd">
        <Shell compare={<Live standalone />} />
      </main>
      <DashboardBehaviors />
    </>
  );
}
