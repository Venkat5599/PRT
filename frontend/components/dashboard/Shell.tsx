"use client";

import { useEffect, useState, type ReactNode } from "react";
import WalletButton from "@/components/WalletButton";
import { Node } from "@/lib/canary";
import { DoctorPanel, InvariantsPanel, RegistryPanel } from "./Panels";
import { TestPanel } from "./TestPanel";
import { NewRun } from "./NewRun";
import { RunView } from "./RunView";
import { RunsList } from "./RunsList";

// The console: start a run, follow it, read its verdict; tools to inspect live chains beside it.
// Routing is the URL hash (#new, #run/<id>, #runs, #compare ...) so every view can be linked.
// Compare is server-rendered markup driven by lib/live.ts, so it stays mounted and is only hidden.
type Route = { view: string; arg?: string };
const NAV: { group: string; items: { id: string; label: string; icon: ReactNode }[] }[] = [
  { group: "Test", items: [
    { id: "runs", label: "Runs", icon: <path d="M4 6h16M4 12h16M4 18h10" /> },
    { id: "node", label: "On your node", icon: <><rect x="4" y="5" width="16" height="6" rx="1.5" /><rect x="4" y="13" width="16" height="6" rx="1.5" /><path d="M8 8h.01M8 16h.01" /></> },
  ] },
  { group: "Inspect", items: [
    { id: "compare", label: "Compare", icon: <path d="M5 5h6v14H5zM13 5h6v14h-6z" /> },
    { id: "doctor", label: "Doctor", icon: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></> },
    { id: "invariants", label: "Invariants", icon: <path d="M5 9h14M5 15h14" /> },
    { id: "registry", label: "Registry", icon: <><path d="M6 4h12v16H6z" /><path d="M9 9h6M9 13h6M9 17h3" /></> },
  ] },
];
const TITLES: Record<string, string> = { new: "New run", run: "Run", runs: "Runs", node: "On your node", compare: "Compare", doctor: "Doctor", invariants: "Invariants", registry: "Registry" };

function read(): Route {
  const [view, arg] = location.hash.replace(/^#\/?/, "").split("/");
  return TITLES[view] ? { view, arg } : { view: "new" };
}

/** Head block of each public chain, read live every 12 s. */
function ChainStatus() {
  const [heads, setHeads] = useState<Record<string, number | "down" | undefined>>({});
  useEffect(() => {
    const chains = [["Mainnet", "wss://mainnet.portaldot.io"], ["V3 testnet", "wss://test-node-v3.portaldot.dev"]];
    let live = true;
    const poll = () => chains.forEach(async ([name, url]) => {
      const n = new Node(url, { timeout: 10000 });
      try {
        const h = await n.call<{ number: string }>("chain_getHeader");
        if (live) setHeads((x) => ({ ...x, [name]: parseInt(h.number, 16) }));
      } catch { if (live) setHeads((x) => ({ ...x, [name]: "down" })); } finally { n.close(); }
    });
    poll();
    const t = setInterval(poll, 12000);
    return () => { live = false; clearInterval(t); };
  }, []);
  return (
    <ul className="cx-chains">
      {["Mainnet", "V3 testnet"].map((c) => {
        const v = heads[c];
        return <li key={c}><i className={v === "down" ? "down" : v ? "up" : ""} /><span>{c}</span><code>{v === "down" ? "unreachable" : v ? `#${v.toLocaleString("en")}` : "…"}</code></li>;
      })}
    </ul>
  );
}

export default function Shell({ compare }: { compare: ReactNode }) {
  const [route, setRoute] = useState<Route>({ view: "new" });
  const [seen, setSeen] = useState<Set<string>>(new Set());
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const go = () => { const r = read(); setRoute(r); setSeen((s) => new Set(s).add(r.view)); setOpen(false); window.scrollTo(0, 0); };
    go();
    addEventListener("hashchange", go);
    return () => removeEventListener("hashchange", go);
  }, []);

  const v = route.view;
  // Panels mount the first time they are opened, then stay mounted (their live state survives).
  const keep = (id: string, el: ReactNode) => (seen.has(id) || v === id ? <div hidden={v !== id}>{el}</div> : null);
  return (
    <div className={open ? "cx menu-open" : "cx"}>
      <aside className="cx-side" aria-label="Console">
        <a className="cx-brand" href="/">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/images/header/logo.png" width={24} height={24} alt="" />
          <span>Portal Canary</span>
        </a>
        <a className={`cx-new${v === "new" ? " on" : ""}`} href="#new">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>New run
        </a>
        {NAV.map((g) => (
          <nav key={g.group} className="cx-group" aria-label={g.group}>
            <p>{g.group}</p>
            {g.items.map((i) => (
              <a key={i.id} href={`#${i.id}`} aria-current={v === i.id || (i.id === "runs" && v === "run") ? "page" : undefined}>
                <svg viewBox="0 0 24 24" aria-hidden="true">{i.icon}</svg>{i.label}
              </a>
            ))}
          </nav>
        ))}
        <div className="cx-side-foot"><ChainStatus /></div>
      </aside>
      <button type="button" className="cx-scrim" aria-label="Close menu" onClick={() => setOpen(false)} />
      <div className="cx-main">
        <header className="cx-top">
          <button type="button" className="cx-menu" aria-label="Menu" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
            <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 6h14M3 10h14M3 14h14" /></svg>
          </button>
          <h1>{v === "run" && route.arg ? <><a href="#runs">Runs</a><span>/</span><code>{route.arg}</code></> : TITLES[v]}</h1>
          <div className="cx-top-actions">
            <a className="cx-ghost" href="https://github.com/Venkat5599/PRT" target="_blank" rel="noreferrer">GitHub</a>
            <WalletButton />
          </div>
        </header>
        <div className="cx-body">
          {v === "new" && <NewRun />}
          {v === "run" && route.arg && <RunView key={route.arg} id={route.arg} />}
          {keep("runs", <RunsList />)}
          {keep("node", <TestPanel />)}
          <div hidden={v !== "compare"} className="cx-compare">{compare}</div>
          {keep("doctor", <DoctorPanel />)}
          {keep("invariants", <InvariantsPanel />)}
          {keep("registry", <RegistryPanel />)}
        </div>
      </div>
    </div>
  );
}
