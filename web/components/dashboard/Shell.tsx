"use client";

import { useEffect, useState, type ReactNode } from "react";
import { CliPanel, DoctorPanel, InvariantsPanel, RunsPanel } from "./Panels";

// Dashboard layout: a sidebar of every feature, one panel at a time, selected by
// the URL hash so each panel can be linked. Compare is server-rendered markup
// (shared with the landing page), so it stays mounted and is only hidden.
const ITEMS = [
  { id: "compare", label: "Compare", hint: "Diff two live runtimes", icon: <path d="M5 5h6v14H5zM13 5h6v14h-6z" /> },
  { id: "doctor", label: "Doctor", hint: "Check one endpoint", icon: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></> },
  { id: "runs", label: "Test runs", hint: "Recorded upgrades", icon: <><path d="M4 8h5l2-4 3 9 2-5h4" /><path d="M4 17h5l2-2 2 2h7" /></> },
  { id: "invariants", label: "Invariants", hint: "Mainnet supply", icon: <path d="M5 9h14M5 15h14" /> },
  { id: "cli", label: "CLI", hint: "Commands and CI", icon: <path d="M5 7l5 5-5 5M12 17h7" /> },
] as const;
type Id = (typeof ITEMS)[number]["id"];

export default function Shell({ compare }: { compare: ReactNode }) {
  const [active, setActive] = useState<Id>("compare");
  const [seen, setSeen] = useState<Set<Id>>(new Set(["compare"]));

  useEffect(() => {
    const read = () => {
      const h = location.hash.slice(1) as Id;
      if (ITEMS.some((i) => i.id === h)) { setActive(h); setSeen((s) => new Set(s).add(h)); }
    };
    read();
    addEventListener("hashchange", read);
    return () => removeEventListener("hashchange", read);
  }, []);

  return (
    <div className="dash-shell">
      <nav className="side" aria-label="Dashboard">
        <p className="side-title">Dashboard</p>
        {ITEMS.map((i) => (
          <a key={i.id} href={`#${i.id}`} aria-current={active === i.id ? "page" : undefined} className="side-item">
            <svg viewBox="0 0 24 24" aria-hidden="true">{i.icon}</svg>
            <span><b>{i.label}</b><small>{i.hint}</small></span>
          </a>
        ))}
        <p className="side-foot">Live against Portaldot mainnet and the V3 testnet. Nothing to install.</p>
      </nav>
      <div className="dash-main">
        <div hidden={active !== "compare"}>{compare}</div>
        {/* Other panels mount the first time they are opened, then stay mounted. */}
        {seen.has("doctor") && <div hidden={active !== "doctor"}><DoctorPanel /></div>}
        {seen.has("runs") && <div hidden={active !== "runs"}><RunsPanel /></div>}
        {seen.has("invariants") && <div hidden={active !== "invariants"}><InvariantsPanel /></div>}
        {seen.has("cli") && <div hidden={active !== "cli"}><CliPanel /></div>}
      </div>
    </div>
  );
}
