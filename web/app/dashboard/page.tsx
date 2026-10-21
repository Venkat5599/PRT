import type { Metadata } from "next";
import DashboardBehaviors from "@/components/DashboardBehaviors";
import Shell from "@/components/dashboard/Shell";
import Live from "@/components/Live";
import Nav from "@/components/Nav";

export const metadata: Metadata = {
  title: "Dashboard · Portal Canary",
  description: "Compare any two Portaldot runtimes, check an endpoint's health, read recorded upgrade tests and the mainnet supply invariant, live in your browser.",
};

export default function Dashboard() {
  return (
    <>
      <Nav base="/" solid />
      <main className="dash-page">
        <Shell compare={<Live standalone />} />
      </main>
      <DashboardBehaviors />
    </>
  );
}
