import type { Metadata } from "next";
import DashboardBehaviors from "@/components/DashboardBehaviors";
import Live from "@/components/Live";
import Nav from "@/components/Nav";

export const metadata: Metadata = {
  title: "Dashboard · Portal Canary",
  description: "Compare any two Portaldot runtimes live in your browser: every changed pallet, call, event, storage item and constant, with the upgrade hazards that would halt a chain.",
};

export default function Dashboard() {
  return (
    <>
      <Nav base="/" solid />
      <main className="dash-page">
        <Live standalone />
      </main>
      <DashboardBehaviors />
    </>
  );
}
