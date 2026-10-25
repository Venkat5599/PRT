"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { V3, formatUnits, short, walletStore, type Connected } from "@/lib/wallet";
import { RunDetail, Tick, download, fmt, verdict, vcls, type RunData } from "./Panels";
import type { Signer, ChainInfo, Attestation, SuiteEntry } from "@/lib/tx/tx";

// `canary test` and `canary attest` from the page: the workflow suite runs as real signed
// extrinsics on both endpoints, each finding is classified exactly like the CLI does, and the
// report can be anchored with system.remark and verified on-chain. On a local dev chain the
// public dev accounts sign; on any other chain the visitor's Substrate wallet signs and pays.
const txm = () => import("@/lib/tx/tx");
const DEV_A = "ws://127.0.0.1:9944";
const DEV_B = "ws://127.0.0.1:9945";
const PRESETS = [
  { name: "Local dev chains", hint: ":9944 → :9945", b: DEV_A, c: DEV_B },
  { name: "Local control", hint: ":9944 → :9944", b: DEV_A, c: DEV_A },
  { name: "V3 testnet control", hint: "your wallet signs", b: V3.ws, c: V3.ws },
];
const LAST = "canary.lastRun";

type Lane = { ws: string; info?: ChainInfo; balance?: bigint; err?: string; busy: boolean };
type Report = RunData & { manifest: RunData["manifest"] & { run_id: string } };
type Saved = { text: string; att?: Attestation };

async function contractFile(path: string) {
  if (path !== "tests/contracts/counter.wasm") throw new Error(`unknown workflow file ${path}`);
  const b = new Uint8Array(await (await fetch("/engine/contracts/counter.wasm")).arrayBuffer());
  return "0x" + [...b].map((x) => x.toString(16).padStart(2, "0")).join("");
}
const amount = (v: bigint, info?: ChainInfo) => (info ? `${formatUnits(v, info.decimals, 2)} ${info.symbol}` : v.toString());
const isLocal = (ws: string) => /^ws:\/\/(127\.0\.0\.1|localhost)(:|\/|$)/.test(ws);

/** Who can sign on these endpoints, or why nobody can. */
function signerFor(lanes: Lane[], wallet: Connected | null, useWallet: boolean): { signer?: Signer; label: string; reason?: string } {
  const infos = lanes.map((l) => l.info);
  if (infos.some((i) => !i)) return { label: "", reason: "checking the endpoints" };
  const dev = infos.every((i) => i!.dev);
  const sub = wallet?.wallet.kind === "substrate" ? wallet : null;
  if (dev && !(useWallet && sub)) return { signer: { kind: "dev", name: "charlie" }, label: "//Charlie, public dev account" };
  if (!dev && infos.some((i) => i!.dev)) return { label: "", reason: "one endpoint is a local dev chain and the other is not: one signer must pay on both" };
  if (!sub) return { label: "", reason: wallet ? "an EVM wallet cannot sign Substrate extrinsics: connect Portaldot, Talisman, SubWallet or Polkadot.js" : "connect a Substrate wallet to sign on this chain" };
  return { signer: { kind: "wallet", extension: sub.wallet.id, address: sub.address }, label: `${sub.wallet.name} ${short(sub.address)}` };
}

export function TestPanel() {
  const [suite, setSuite] = useState<SuiteEntry[] | null>(null);
  const [pick, setPick] = useState<Set<string>>(new Set());
  const [b, setB] = useState(DEV_A);
  const [c, setC] = useState(DEV_B);
  const [lanes, setLanes] = useState<Lane[]>([]);
  const [wallet, setWallet] = useState<Connected | null>(walletStore.get());
  const [useWallet, setUseWallet] = useState(false);
  const [injected, setInjected] = useState("");
  const [busy, setBusy] = useState(false);
  const [started, setStarted] = useState(0);
  const [now, setNow] = useState(0);
  const [log, setLog] = useState<string[]>([]);
  const [rows, setRows] = useState<Record<string, { verdict: string; severity: string; hash: string } | "running">>({});
  const [err, setErr] = useState<string | null>(null);
  const [run, setRun] = useState<Saved | null>(null);
  const logBox = useRef<HTMLPreElement>(null);

  useEffect(() => walletStore.subscribe(setWallet), []);
  useEffect(() => {
    fetch("/engine/workflows.json").then((r) => r.json()).then((s: SuiteEntry[]) => { setSuite(s); setPick(new Set(s.map((x) => x.workflow.id))); });
    try { const s = localStorage.getItem(LAST); if (s) setRun(JSON.parse(s)); } catch {}
  }, []);
  useEffect(() => { if (!busy) return; const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, [busy]);
  useEffect(() => { logBox.current?.scrollTo(0, logBox.current.scrollHeight); }, [log]);

  const selected = useMemo(() => (suite ?? []).filter((s) => pick.has(s.workflow.id)), [suite, pick]);
  // Workflows run one after another and each sweeps its accounts back, so the signer needs the
  // largest single funding (times two when both sides are the same chain), plus fees.
  const need = useMemo(() => {
    const most = selected.reduce((m, s) => { const f = (s.workflow.fund ?? []).reduce((a, x) => a + BigInt(x.amount), 0n); return f > m ? f : m; }, 0n);
    return b === c ? most * 2n : most;
  }, [selected, b, c]);
  const who = signerFor(lanes.length === 2 ? lanes : [{ ws: b, busy: true }], wallet, useWallet);

  async function check() {
    const eps = [b.trim(), c.trim()];
    setLanes(eps.map((ws) => ({ ws, busy: true })));
    const t = await txm();
    const read = async (ws: string, i: number) => {
      try {
        const info = await t.chainInfo(ws);
        setLanes((l) => l.map((x, k) => (k === i ? { ...x, info, busy: false } : x)));
      } catch (e) {
        setLanes((l) => l.map((x, k) => (k === i ? { ...x, busy: false, err: isLocal(ws) ? `${(e as Error).message}: start a dev node on this port` : (e as Error).message } : x)));
      }
    };
    await Promise.all(eps.map(read));
  }
  useEffect(() => { const t = setTimeout(check, 350); return () => clearTimeout(t); }, [b, c]); // eslint-disable-line react-hooks/exhaustive-deps

  // Balance of whoever will sign, on each endpoint.
  const signerKey = JSON.stringify(who.signer ?? null);
  useEffect(() => {
    if (!who.signer || lanes.length !== 2 || lanes.some((l) => !l.info)) return;
    let live = true;
    (async () => {
      const t = await txm();
      const addr = t.signerAddress(who.signer!);
      for (const [i, l] of lanes.entries()) {
        const bal = await t.freeBalance(l.ws, addr).catch(() => undefined);
        if (live) setLanes((ls) => ls.map((x, k) => (k === i ? { ...x, balance: bal } : x)));
      }
    })();
    return () => { live = false; };
  }, [signerKey, lanes.length, lanes.map((l) => l.ws + !!l.info).join()]); // eslint-disable-line react-hooks/exhaustive-deps

  const short_ = lanes.find((l) => l.balance !== undefined && l.balance < need);
  const blocked = !suite ? "loading the workflow suite"
    : !selected.length ? "pick at least one workflow"
    : lanes.some((l) => l.err) ? lanes.find((l) => l.err)!.err
    : who.reason ? who.reason
    : short_ ? `${who.label} holds ${amount(short_.balance!, short_.info)} on ${short_.info?.chain}; this run needs ${amount(need, short_.info)} at a time${short_.info?.chain?.includes("V3") ? " (tPOT from the Portaldot Discord faucet)" : ""}`
    : null;

  async function start() {
    if (blocked || !who.signer) return;
    setBusy(true); setErr(null); setLog([]); setStarted(Date.now()); setNow(Date.now());
    setRows(Object.fromEntries(selected.map((s) => [s.workflow.id, "running" as const])));
    const push = (m: string) => setLog((l) => [...l, `${new Date().toLocaleTimeString("en-GB")}  ${m}`]);
    try {
      const t = await txm();
      push(`signer ${who.label}`);
      const report = await t.runTest({
        baseline: b.trim(), candidate: c.trim(), suite: selected, funder: who.signer, injected: injected.trim() || null,
        fetchFile: contractFile, log: push,
        onResult: (r: { finding: { workflow: string; verdict: string; severity: string; finding_hash: string } }) =>
          setRows((x) => ({ ...x, [r.finding.workflow]: { verdict: r.finding.verdict, severity: r.finding.severity, hash: r.finding.finding_hash } })),
      });
      const saved = { text: JSON.stringify(report, null, 2) };
      push(`${report.summary.statement} · exit ${t.exitCode(report.summary)}`);
      setRun(saved);
      try { localStorage.setItem(LAST, JSON.stringify(saved)); } catch {}
    } catch (e) {
      setErr((e as Error).message ?? String(e));
    } finally {
      setBusy(false);
    }
  }

  const data = useMemo(() => (run ? (JSON.parse(run.text) as Report) : null), [run]);
  const v = data ? verdict(data.summary) : null;
  const toggle = (id: string) => setPick((p) => { const n = new Set(p); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const devBoth = lanes.length === 2 && lanes.every((l) => l.info?.dev);

  return (
    <section className="frame panel" aria-labelledby="test-title">
      <header className="live-head">
        <h2 id="test-title">Run the suite, <em>sign the verdict.</em></h2>
        <p className="lead">The browser version of <code>canary test</code> and <code>canary attest</code>: every workflow runs as real signed extrinsics on both endpoints, is classified like the CLI does, and the report can be anchored on-chain and verified.</p>
      </header>

      <div className="live-form pairs">
        <div className="pair-group" role="group" aria-label="Endpoints">
          {PRESETS.map((p) => (
            <button key={p.name} type="button" className="pair" aria-pressed={b === p.b && c === p.c} disabled={busy} onClick={() => { setB(p.b); setC(p.c); }}>
              <b>{p.name}</b><small>{p.hint}</small>
            </button>
          ))}
        </div>
      </div>
      <div className="live-form test-eps">
        <label className="ep"><span>Baseline</span><input value={b} onChange={(e) => setB(e.target.value)} disabled={busy} spellCheck={false} /></label>
        <label className="ep"><span>Candidate</span><input value={c} onChange={(e) => setC(e.target.value)} disabled={busy} spellCheck={false} /></label>
      </div>

      <ol className="layer-list lanes">
        {lanes.map((l, i) => (
          <li key={i}>
            <Tick ok={!!l.info} wait={l.busy} />
            <b>{i === 0 ? "baseline" : "candidate"}</b>
            <span>{l.busy ? "connecting…" : l.err ?? `${l.info!.chain} · ${l.info!.spec}${l.info!.dev ? " · dev chain" : ""}${l.balance !== undefined && who.signer ? ` · signer holds ${amount(l.balance, l.info)}` : ""}`}</span>
          </li>
        ))}
      </ol>

      <div className="wf-pick">
        {(suite ?? []).map((s) => (
          <label key={s.workflow.id} className="wf-opt">
            <input type="checkbox" checked={pick.has(s.workflow.id)} disabled={busy} onChange={() => toggle(s.workflow.id)} />
            <span><code>{s.workflow.id}</code>{s.workflow.importance === "core" && <i className="kind-pill">core</i>}<small>{s.workflow.steps.map((x) => x.call).join(" · ")}</small></span>
          </label>
        ))}
      </div>

      <div className="live-form test-go">
        <label className="ep"><span>Change under test, recorded in the report (optional)</span>
          <input value={injected} onChange={(e) => setInjected(e.target.value)} disabled={busy} placeholder="ed100x: ExistentialDeposit 1 → 100 POT" spellCheck={false} />
        </label>
        <button type="button" className="btn btn-blue run-btn" disabled={busy || !!blocked} onClick={start}>
          {busy ? `Running… ${Math.max(0, Math.round((now - started) / 1000))}s` : "Run workflows"}
        </button>
      </div>
      <dl className="facts test-facts">
        <div><dt>signer</dt><dd>{who.label || "–"}{devBoth && wallet?.wallet.kind === "substrate" && (
          <button type="button" className="more" disabled={busy} onClick={() => setUseWallet((u) => !u)}>{useWallet ? "use the dev account" : "sign with my wallet"}</button>)}</dd></div>
        <div><dt>funding</dt><dd>{selected.length ? `${amount(need, lanes[0]?.info)} at a time, swept back after each workflow; fees and deposits are spent` : "–"}</dd></div>
        {blocked && !busy && <div><dt>status</dt><dd className="bad">{blocked}</dd></div>}
      </dl>

      {(busy || log.length > 0) && (
        <div className="sub-card">
          <div className="sub-head"><b>Live run</b><span className={`state-pill ${busy ? "" : err ? "bad" : "ok"}`}>{busy ? "running" : err ? "stopped" : "finished"}</span></div>
          <div className="tbl"><table className="mini"><thead><tr><th>workflow</th><th>verdict</th><th>severity</th><th>finding hash</th></tr></thead>
            <tbody>{Object.entries(rows).map(([id, r]) => (
              <tr key={id}><td><code>{id}</code></td>
                {r === "running" ? <td colSpan={3} className="muted">{busy ? "queued" : "not run"}</td> : <><td><span className={`v-pill ${vcls(r.verdict)}`}>{r.verdict.toLowerCase()}</span></td><td>{r.severity}</td><td><code>{r.hash.slice(0, 16)}</code></td></>}
              </tr>))}</tbody></table></div>
          <pre className="run-log" ref={logBox}>{log.join("\n")}</pre>
          {err && <p className="sub-note bad">{err}</p>}
        </div>
      )}

      {data && v && !busy && (
        <div className="sub-card">
          <div className="sub-head"><b>Your run {data.manifest.run_id}</b>
            <strong className={`v-pill ${v.cls}`}>{v.text}</strong>
            <button type="button" className="more" onClick={() => download("report.json", run!.text)}>Download report.json</button>
          </div>
          <RunDetail id={`web-${data.manifest.run_id}`} d={data} attest={<AttestRun saved={run!} wallet={wallet} onSaved={(s) => { setRun(s); try { localStorage.setItem(LAST, JSON.stringify(s)); } catch {} }} />} />
        </div>
      )}
    </section>
  );
}

/** Anchor a report made on this page with system.remark, then verify it from the chain. */
function AttestRun({ saved, wallet, onSaved }: { saved: Saved; wallet: Connected | null; onSaved: (s: Saved) => void }) {
  const first = (JSON.parse(saved.text) as Report).manifest.baseline.endpoint ?? DEV_A;
  const [ws, setWs] = useState(saved.att?.network ?? first);
  const [busy, setBusy] = useState<"sign" | "verify" | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [checks, setChecks] = useState<{ what: string; ok: boolean; detail: string }[] | null>(null);
  const bytes = () => new TextEncoder().encode(saved.text);

  async function verifyNow(att: Attestation) {
    setBusy("verify");
    try { setChecks(await (await txm()).verify(att, bytes(), ws)); } catch (e) { setErr((e as Error).message); } finally { setBusy(null); }
  }
  async function sign() {
    setBusy("sign"); setErr(null); setChecks(null);
    try {
      const t = await txm();
      const info = await t.chainInfo(ws);
      const sub = wallet?.wallet.kind === "substrate" ? wallet : null;
      // A connected Substrate wallet signs wherever it is connected; a dev chain falls back to //Alice.
      const signer: Signer | null = sub ? { kind: "wallet", extension: sub.wallet.id, address: sub.address } : info.dev ? { kind: "dev", name: "alice" } : null;
      if (!signer) throw new Error(`${info.chain} is not a local dev chain: connect a Substrate wallet to sign the remark`);
      const bal = await t.freeBalance(ws, t.signerAddress(signer));
      if (bal === 0n) throw new Error(`${t.signerAddress(signer)} holds no ${info.symbol} on ${info.chain}${info.chain.includes("V3") ? ": get tPOT from the Portaldot Discord faucet" : ""}`);
      const att = await t.attest(ws, bytes(), signer);
      onSaved({ ...saved, att });
      await verifyNow(att);
    } catch (e) { setErr((e as Error).message); setBusy(null); }
  }
  useEffect(() => { if (saved.att) verifyNow(saved.att); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const att = saved.att;
  const ok = checks?.every((c) => c.ok);
  const sub = wallet?.wallet.kind === "substrate" ? wallet : null;
  const signs = sub ? `${sub.wallet.name} ${short(sub.address)}` : ws === V3.ws ? "connect a Substrate wallet" : "//Alice on a dev chain";
  return (
    <div className="sub-card">
      <div className="sub-head"><b>Anchor this report on-chain</b>
        <span className={`state-pill ${busy ? "" : checks ? (ok ? "ok" : "bad") : ""}`}>{busy === "sign" ? "signing" : busy === "verify" ? "verifying" : checks ? (ok ? "verified on-chain" : "failed") : att ? "anchored" : "not anchored"}</span>
      </div>
      <div className="live-form test-eps">
        <div className="pair-group" role="group" aria-label="Network">
          <button type="button" className="pair" aria-pressed={ws === first} disabled={!!busy} onClick={() => setWs(first)}><b>Baseline chain</b><small>{first.replace(/^\w+:\/\//, "")}</small></button>
          <button type="button" className="pair" aria-pressed={ws === V3.ws} disabled={!!busy} onClick={() => setWs(V3.ws)}><b>V3 testnet</b><small>your wallet signs</small></button>
        </div>
        <p className="sub-note">signer: {signs}</p>
        <button type="button" className="btn btn-blue run-btn" disabled={!!busy} onClick={sign}>{busy === "sign" ? "Signing…" : att ? "Anchor again" : "Attest"}</button>
      </div>
      {att && (
        <dl className="facts">
          <div><dt>payload</dt><dd><code>{att.payload}</code></dd></div>
          <div><dt>block</dt><dd>#{fmt(att.block_number)} on {att.chain} · {att.block_hash.slice(0, 18)}…</dd></div>
          <div><dt>extrinsic</dt><dd><code>{att.tx_hash.slice(0, 18)}…</code> · signed by {att.signer.length > 20 ? short(att.signer) : `//${att.signer[0].toUpperCase()}${att.signer.slice(1)}`}</dd></div>
          <div><dt>files</dt><dd><button type="button" className="more" onClick={() => download("attestation.json", att)}>Download attestation.json</button></dd></div>
        </dl>
      )}
      {err && <p className="sub-note bad">{err}</p>}
      {checks && <ol className="layer-list compact">{checks.map((c) => <li key={c.what}><Tick ok={c.ok} /><b>{c.what}</b><span>{c.detail}</span></li>)}</ol>}
    </div>
  );
}
