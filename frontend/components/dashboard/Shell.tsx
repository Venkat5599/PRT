"use client";

import { useEffect, useState, type ReactNode } from "react";
import WalletButton from "@/components/WalletButton";
import { CliPanel, DoctorPanel, InvariantsPanel, RegistryPanel, RunsPanel } from "./Panels";
import { TestPanel } from "./TestPanel";

// Dashboard layout: a sidebar of every feature, one panel at a time, selected by
// the URL hash so each panel can be linked. Compare is server-rendered markup
// (shared with the landing page), so it stays mounted and is only hidden.
const ITEMS = [
  { id: "compare", label: "Compare", hint: "Diff two live runtimes", icon: <path d="M5 5h6v14H5zM13 5h6v14h-6z" /> },
  { id: "test", label: "Test", hint: "Run workflows, attest", icon: <><path d="M9 4h6M10 4v5l-5 9a1.5 1.5 0 0 0 1.3 2h11.4a1.5 1.5 0 0 0 1.3-2l-5-9V4" /><path d="M7.5 14h9" /></> },
  { id: "doctor", label: "Doctor", hint: "Check one endpoint", icon: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></> },
  { id: "runs", label: "Test runs", hint: "Recorded upgrades", icon: <><path d="M4 8h5l2-4 3 9 2-5h4" /><path d="M4 17h5l2-2 2 2h7" /></> },
  { id: "registry", label: "Registry", hint: "Verdicts on V3 testnet", icon: <><path d="M6 4h12v16H6z" /><path d="M9 9h6M9 13h6M9 17h3" /></> },
  { id: "invariants", label: "Invariants", hint: "Mainnet supply", icon: <path d="M5 9h14M5 15h14" /> },
  { id: "cli", label: "CLI", hint: "Commands and CI", icon: <path d="M5 7l5 5-5 5M12 17h7" /> },
] as const;
type Id = (typeof ITEMS)[number]["id"];

export default function Shell({ compare }: { compare: ReactNode }) {
  const [active, setActive] = useState<Id>("compare");
  const [seen, setSeen] = useState<Set<Id>>(new Set(["compare"]));
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const read = () => {
      const h = location.hash.slice(1) as Id;
      if (ITEMS.some((i) => i.id === h)) { setActive(h); setSeen((s) => new Set(s).add(h)); }
      setOpen(false);
    };
    read();
    addEventListener("hashchange", read);
    return () => removeEventListener("hashchange", read);
  }, []);

  const current = ITEMS.find((i) => i.id === active)!;
  return (
    <div className="dash-shell">
      <nav className={open ? "side open" : "side"} aria-label="Dashboard">
        <a className="side-brand" href="/" aria-label="Portal Canary home">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/images/header/logo.png" width={28} height={28} alt="" />
          <span>Portal Canary</span>
        </a>
        <p className="side-title">Dashboard</p>
        {ITEMS.map((i) => (
          <a key={i.id} href={`#${i.id}`} aria-current={active === i.id ? "page" : undefined} className="side-item">
            <svg viewBox="0 0 24 24" aria-hidden="true">{i.icon}</svg>
            <span><b>{i.label}</b><small>{i.hint}</small></span>
          </a>
        ))}
        <p className="side-foot"><i aria-hidden="true" />Live against Portaldot mainnet and the V3 testnet. Nothing to install.</p>
      </nav>
      <div className="dash-main">
        <header className="dash-top">
          <button type="button" className="dash-menu" aria-label="Menu" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
            <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 6h14M3 10h14M3 14h14" /></svg>
          </button>
          <div className="dash-title"><h1>{current.label}</h1><span>{current.hint}</span></div>
          <div className="dash-actions">
            <a className="dash-gh" href="https://github.com/Venkat5599/PRT">GitHub <svg className="arr" viewBox="0 0 12 12" aria-hidden="true"><path d="M3.5 8.5l5-5M4.5 3.5h4v4" /></svg></a>
            <WalletButton />
          </div>
        </header>
        <div className="dash-body">
          <div hidden={active !== "compare"}>{compare}</div>
          {/* Other panels mount the first time they are opened, then stay mounted. */}
          {seen.has("test") && <div hidden={active !== "test"}><TestPanel /></div>}
          {seen.has("doctor") && <div hidden={active !== "doctor"}><DoctorPanel /></div>}
          {seen.has("runs") && <div hidden={active !== "runs"}><RunsPanel /></div>}
          {seen.has("registry") && <div hidden={active !== "registry"}><RegistryPanel /></div>}
          {seen.has("invariants") && <div hidden={active !== "invariants"}><InvariantsPanel /></div>}
          {seen.has("cli") && <div hidden={active !== "cli"}><CliPanel /></div>}
        </div>
      </div>
    </div>
  );
}
