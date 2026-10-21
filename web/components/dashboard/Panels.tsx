"use client";

import { useEffect, useState } from "react";
import { Node, readRuntime, type Runtime } from "@/lib/canary";

const fmt = (n: number | null | undefined) => (n == null ? "–" : n.toLocaleString("en"));

/* ---------- doctor: one endpoint, live ---------- */
type Health = { peers: number; isSyncing: boolean };
type Report = { rt: Runtime; health: Health | null; ms: number };
const DOCTOR_TARGETS = [
  { name: "V3 testnet", url: "wss://test-node-v3.portaldot.dev" },
  { name: "Mainnet", url: "wss://mainnet.portaldot.io" },
];

export function DoctorPanel() {
  const [url, setUrl] = useState("wss://test-node-v3.portaldot.dev");
  const [busy, setBusy] = useState(false);
  const [out, setOut] = useState<Report | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function run(target = url) {
    setBusy(true); setErr(null); setOut(null);
    const node = new Node(target.trim());
    try {
      const t0 = performance.now();
      await node.ready;
      await node.call("system_chain");
      const ms = Math.round(performance.now() - t0);
      const [rt, health] = await Promise.all([readRuntime(node), node.call<Health>("system_health").catch(() => null)]);
      setOut({ rt, health, ms });
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      node.close();
      setBusy(false);
    }
  }
  useEffect(() => { run(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const rows: [string, string][] = out ? [
    ["chain", out.rt.chain ?? "–"],
    ["node", out.rt.version ?? "–"],
    ["runtime", `${out.rt.runtime_version.specName} spec ${out.rt.runtime_version.specVersion} · tx ${out.rt.runtime_version.transactionVersion}`],
    ["metadata", `V${parseInt(out.rt.metadata.slice(10, 12), 16)} · ${fmt(out.rt.bytes)} bytes`],
    ["runtime apis", `${out.rt.runtime_version.apis.length}`],
    ["best block", `#${fmt(out.rt.head)}`],
    ["peers", out.health ? `${out.health.peers}${out.health.isSyncing ? " · syncing" : ""}` : "not exposed"],
    ["first answer", `${out.ms} ms`],
    ["genesis", out.rt.genesis_hash ? `${out.rt.genesis_hash.slice(0, 18)}…` : "–"],
  ] : [];

  return (
    <section className="frame panel" aria-labelledby="doc-title">
      <header className="live-head">
        <h2 id="doc-title">Is this node <em>healthy?</em></h2>
        <p className="lead">The browser version of <code>canary doctor</code>: connect, fingerprint the runtime and report what is actually running behind an endpoint.</p>
      </header>
      <div className="live-form pairs">
        <div className="pair-group" role="group" aria-label="Endpoint to check">
          {DOCTOR_TARGETS.map((t) => (
            <button key={t.url} type="button" className="pair" aria-pressed={url === t.url} disabled={busy} onClick={() => { setUrl(t.url); run(t.url); }}>
              <b>{t.name}</b><small>{t.url.replace("wss://", "")}</small>
            </button>
          ))}
        </div>
        <button type="button" className="btn btn-blue run-btn" disabled={busy} onClick={() => run()}>{busy ? "Checking…" : "Check again"}</button>
      </div>
      <div className="live-verdict" aria-live="polite">
        <p className={`verdict-line ${err ? "reg" : out ? "same" : ""}`}>{err ? "Unhealthy." : out ? "Healthy." : "Connecting…"}</p>
        <p className="verdict-sub">{err ?? (out ? `${out.rt.endpoint} answered in ${out.ms} ms` : "")}</p>
      </div>
      {out && (
        <dl className="facts">
          {rows.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
        </dl>
      )}
    </section>
  );
}

/* ---------- recorded test runs ---------- */
const RUNS = [
  { id: "self-compare", name: "Control", hint: "Same node twice. Nothing should differ." },
  { id: "upgrade-fee10x", name: "Byte fee ×10", hint: "Injected via setCode. Fees move." },
  { id: "upgrade-ed100x", name: "Deposit ×100", hint: "Injected via setCode. A transfer breaks." },
  { id: "injected-faulty-migration", name: "Faulty migration", hint: "Injected setStorage. Supply stops adding up." },
];
type Summary = { workflows: number; regression: number; difference: number; inconclusive: number; pass: number };
type RunData = { summary: Summary; manifest: { baseline: { spec_version: number }; candidate: { spec_version: number } } };

function verdict(s: Summary) {
  if (s.regression) return { text: `${s.regression} regression${s.regression > 1 ? "s" : ""}`, cls: "reg", exit: 1 };
  if (s.inconclusive) return { text: `${s.inconclusive} inconclusive`, cls: "base", exit: 2 };
  if (s.difference) return { text: `${s.difference} difference${s.difference > 1 ? "s" : ""}`, cls: "diff", exit: 0 };
  return { text: "All pass", cls: "same", exit: 0 };
}

export function RunsPanel() {
  const [data, setData] = useState<Record<string, RunData | "error">>({});
  useEffect(() => {
    for (const r of RUNS) {
      fetch(`/reports/${r.id}/report.json`).then((x) => x.json()).then((d) => setData((m) => ({ ...m, [r.id]: d })), () => setData((m) => ({ ...m, [r.id]: "error" })));
    }
  }, []);
  return (
    <section className="frame panel" aria-labelledby="runs-title">
      <header className="live-head">
        <h2 id="runs-title">Four upgrades, <em>recorded.</em></h2>
        <p className="lead">Each run is <code>canary test</code> against a local Portaldot dev node, with the candidate pushed through <code>system.setCode</code>. Open the report for every expectation, side by side.</p>
      </header>
      <ul className="run-list">
        {RUNS.map((r) => {
          const d = data[r.id];
          const v = d && d !== "error" ? verdict(d.summary) : null;
          return (
            <li key={r.id}>
              <div className="rl-main"><b>{r.name}</b><span>{r.hint}</span></div>
              <div className="rl-verdict">
                {v ? <><strong className={v.cls}>{v.text}</strong><span>{(d as RunData).summary.workflows} workflows · spec {(d as RunData).manifest.baseline.spec_version} → {(d as RunData).manifest.candidate.spec_version} · exit {v.exit}</span></> : <span>{d === "error" ? "report unavailable" : "loading…"}</span>}
              </div>
              <div className="rl-links"><a href={`/reports/${r.id}/report.html`}>Report</a><a href={`/reports/${r.id}/report.json`}>JSON</a></div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/* ---------- invariants ---------- */
export function InvariantsPanel() {
  return (
    <section className="frame panel" aria-labelledby="inv-title">
      <header className="live-head">
        <h2 id="inv-title">Every planck, <em>accounted for.</em></h2>
        <p className="lead">Supply conservation on Portaldot mainnet: the free and reserved balance of every account must add up to <code>Balances.TotalIssuance</code>. The same check runs before and after every upgrade.</p>
      </header>
      <div className="live-verdict"><p className="verdict-line same">Pass. Delta 0 planck.</p><p className="verdict-sub">canary invariants · wss://mainnet.portaldot.io · recorded 15 Oct 2026</p></div>
      <dl className="facts">
        <div><dt>block</dt><dd>#2,727,345</dd></div>
        <div><dt>accounts</dt><dd>4,719</dd></div>
        <div><dt>sum free + reserved</dt><dd>1,016,781,509.44019349511407 POT</dd></div>
        <div><dt>total issuance</dt><dd>1,016,781,509.44019349511407 POT</dd></div>
        <div><dt>delta</dt><dd>0 planck</dd></div>
      </dl>
    </section>
  );
}

/* ---------- CLI ---------- */
const COMMANDS: [string, string][] = [
  ["Build", "cargo build --release"],
  ["Diagnose an endpoint", "canary doctor --ws wss://test-node-v3.portaldot.dev"],
  ["Diff two runtimes", "canary compare --baseline wss://mainnet.portaldot.io --candidate wss://test-node-v3.portaldot.dev"],
  ["Check supply", "canary invariants --ws wss://mainnet.portaldot.io"],
  ["Test an upgrade", "canary test --baseline ws://127.0.0.1:9944 --candidate ws://127.0.0.1:9945"],
  ["Reproduce a finding", "canary reproduce balances.transfer.basic --run runs/<id>"],
  ["In GitHub Actions", "uses: Venkat5599/PRT@main"],
];

function Copy({ text }: { text: string }) {
  const [label, setLabel] = useState("copy");
  return (
    <button type="button" className="copy" onClick={async () => {
      try { await navigator.clipboard.writeText(text); setLabel("copied"); } catch { setLabel("select + copy"); }
      setTimeout(() => setLabel("copy"), 1600);
    }}><code>{text}</code><span>{label}</span></button>
  );
}

export function CliPanel() {
  return (
    <section className="frame panel" aria-labelledby="cli-title">
      <header className="live-head">
        <h2 id="cli-title">The same engine, <em>in your terminal.</em></h2>
        <p className="lead">Everything on this dashboard runs from the <code>canary</code> CLI too, with exit codes CI can gate on: 0 pass, 1 regression, 2 inconclusive.</p>
      </header>
      <ul className="cmd-list">
        {COMMANDS.map(([k, c]) => <li key={k}><span>{k}</span><Copy text={c} /></li>)}
      </ul>
      <a className="frame-link" href="https://github.com/Venkat5599/PRT">GET THE SOURCE <svg className="arr" viewBox="0 0 12 12" aria-hidden="true"><path d="M3.5 8.5l5-5M4.5 3.5h4v4" /></svg></a>
    </section>
  );
}
