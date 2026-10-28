"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Node, readRuntime } from "@/lib/canary";
import { readRegistry, sha256Of, REGISTRY, type OnChain } from "@/lib/registry";
import {
  detectApis, resolveHost, supplyConservation, formatUnits, findingHash, verifyAttestation, sha256Hex,
  type Api, type Supply, type Check, type Attestation,
} from "@/lib/checks";
import { V3 } from "@/lib/wallet";

export const fmt = (n: number | null | undefined) => (n == null ? "–" : n.toLocaleString("en"));
export function download(name: string, data: unknown) {
  const text = typeof data === "string" ? data : JSON.stringify(data, (_k, v) => (typeof v === "bigint" ? v.toString() : v), 2);
  const url = URL.createObjectURL(new Blob([text], { type: "application/json" }));
  Object.assign(document.createElement("a"), { href: url, download: name }).click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export const Tick = ({ ok, wait }: { ok?: boolean; wait?: boolean }) => (
  <span className={`tick ${wait ? "wait" : ok ? "ok" : "bad"}`} aria-hidden="true">{wait ? "·" : ok ? "✓" : "✕"}</span>
);

/* ---------- doctor: any endpoints, layer by layer ---------- */
const DOCTOR_TARGETS = [
  { name: "Mainnet", url: "wss://mainnet.portaldot.io" },
  { name: "V3 testnet", url: "wss://test-node-v3.portaldot.dev" },
  { name: "V3 EVM", url: "https://test-evm-rpc-v3.portaldot.dev" },
];
type Layer = { name: string; ok?: boolean; detail: string };
type DocReport = { url: string; kind: "substrate" | "evm"; healthy: boolean; done: boolean; layers: Layer[]; apis?: Api[]; caps?: string[]; json: Record<string, unknown> };

async function diagnose(url: string, update: (r: DocReport) => void): Promise<DocReport> {
  const evm = /^https?:/i.test(url);
  const names = evm ? ["Network", "JSON-RPC", "Chain id", "Client", "Best block"] : ["Network", "WebSocket", "Chain", "Genesis", "Runtime", "Metadata", "Runtime APIs"];
  const r: DocReport = { url, kind: evm ? "evm" : "substrate", healthy: false, done: false, layers: names.map((name) => ({ name, detail: "waiting" })), json: { url } };
  const push = () => update({ ...r, layers: [...r.layers] });
  const set = (i: number, ok: boolean, detail: string) => { r.layers[i] = { ...r.layers[i], ok, detail }; push(); };
  const stop = (from: number) => { r.layers = r.layers.map((l, i) => (i >= from && l.ok === undefined ? { ...l, detail: "not reached" } : l)); push(); };
  const finish = () => { r.done = true; r.json.healthy = r.healthy; push(); return r; };
  let u: URL;
  try { u = new URL(url); } catch { set(0, false, "not a valid URL"); stop(1); return finish(); }
  const port = u.port || (/^(wss|https):$/.test(u.protocol) ? "443" : "80");
  const dns = await resolveHost(u.hostname);
  if (!dns.ok) { set(0, false, `FAIL dns: ${dns.error}`); stop(1); r.json.reach = { dns_no_record: dns.error }; return finish(); }
  set(0, true, dns.ip ? `ok (${dns.ip}:${port})` : `ok (port ${port})`);
  r.json.reach = dns.ip ? `${dns.ip}:${port}` : `port ${port}`;
  const t0 = performance.now();

  if (evm) {
    const rpc = async (method: string) => {
      const j = await (await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params: [] }) })).json();
      if (j.error) throw new Error(j.error.message);
      return j.result;
    };
    try {
      const id = await rpc("eth_chainId");
      set(1, true, `answers · ${Math.round(performance.now() - t0)} ms`);
      set(2, true, `${parseInt(id, 16)}`);
      const client = await rpc("web3_clientVersion").catch(() => null);
      set(3, !!client, client ?? "web3_clientVersion not answered");
      const bn = await rpc("eth_blockNumber").catch(() => null);
      set(4, !!bn, bn ? `#${fmt(parseInt(bn, 16))}` : "not answered");
      r.healthy = true;
      r.json = { ...r.json, chain_id: parseInt(id, 16), client, block: bn ? parseInt(bn, 16) : null };
    } catch (e) { set(1, false, (e as Error).message); stop(2); r.json.error = (e as Error).message; }
    return finish();
  }

  const node = new Node(url);
  try {
    try { await node.ready; set(1, true, `handshake ok · ${Math.round(performance.now() - t0)} ms`); }
    catch (e) { set(1, false, (e as Error).message); stop(2); r.json.handshake_error = (e as Error).message; return finish(); }
    const [name, health] = await Promise.all([node.call<string>("system_name").catch(() => null), node.call<{ peers: number; isSyncing: boolean }>("system_health").catch(() => null)]);
    const rt = await readRuntime(node);
    set(2, !!rt.chain, `${rt.chain ?? "system_chain not answered"} (node ${[name, rt.version].filter(Boolean).join(" ")})${health ? ` · ${health.peers} peer${health.peers === 1 ? "" : "s"}${health.isSyncing ? " · syncing" : ""}` : ""}`);
    set(3, !!rt.genesis_hash, rt.genesis_hash ?? "not answered");
    const rv = rt.runtime_version as unknown as { specName: string; specVersion: number; implVersion?: number; transactionVersion: number; apis: [string, number][] };
    set(4, true, `${rv.specName} spec_version=${rv.specVersion} impl=${rv.implVersion ?? 0} tx_version=${rv.transactionVersion}`);
    const bytes = Uint8Array.from((rt.metadata.slice(2).match(/../g) ?? []).map((x) => parseInt(x, 16)));
    const mv = bytes[4], sha = await sha256Hex(bytes);
    set(5, true, `V${mv} (${fmt(bytes.length)} bytes, sha256 ${sha.slice(0, 16)}…)${mv < 14 ? " · pre-V14: modern subxt cannot decode this" : ""}`);
    const apis = detectApis(rv.apis);
    const caps = [...new Set(apis.map((a) => a.capability).filter((c): c is string => !!c))].sort();
    set(6, true, `${apis.length} total, ${apis.filter((a) => !a.name).length} unrecognised; capabilities: ${caps.join(", ")}`);
    r.apis = apis; r.caps = caps; r.healthy = true;
    r.json = { ...r.json, runtime: { chain: rt.chain, node_name: name, node_version: rt.version, genesis_hash: rt.genesis_hash, spec_name: rv.specName,
      spec_version: rv.specVersion, tx_version: rv.transactionVersion, metadata_version: mv, metadata_bytes: bytes.length, metadata_sha256: sha, apis, capabilities: caps, head: rt.head } };
  } catch (e) {
    const i = r.layers.findIndex((l) => l.ok === undefined);
    set(i < 0 ? 4 : i, false, (e as Error).message); stop(i + 1); r.json.error = (e as Error).message;
  } finally {
    node.close();
  }
  return finish();
}

export function DoctorPanel() {
  const [urls, setUrls] = useState<string[]>(DOCTOR_TARGETS.map((t) => t.url));
  const [custom, setCustom] = useState("");
  const [busy, setBusy] = useState(false);
  const [reports, setReports] = useState<DocReport[]>([]);

  async function run(list = urls) {
    if (!list.length) return;
    setBusy(true);
    setReports(list.map((url) => ({ url, kind: /^https?:/i.test(url) ? "evm" : "substrate", healthy: false, done: false, layers: [], json: {} })));
    const put = (i: number) => (r: DocReport) => setReports((all) => all.map((x, k) => (k === i ? r : x)));
    await Promise.all(list.map((url, i) => diagnose(url, put(i)).then(put(i))));
    setBusy(false);
  }
  useEffect(() => { run(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const toggle = (u: string) => setUrls((l) => (l.includes(u) ? l.filter((x) => x !== u) : [...l, u]));
  const add = () => { const u = custom.trim(); if (u && !urls.includes(u)) setUrls((l) => [...l, u]); setCustom(""); };
  const done = reports.length > 0 && reports.every((r) => r.done);
  const healthy = reports.filter((r) => r.healthy).length;
  const summary = { substrate: reports.filter((r) => r.kind === "substrate").map((r) => r.json), evm: reports.filter((r) => r.kind === "evm").map((r) => r.json), healthy: healthy === reports.length };

  return (
    <section className="frame panel" aria-label="Doctor">
      <div className="live-form pairs">
        <div className="pair-group" role="group" aria-label="Endpoints to check">
          {DOCTOR_TARGETS.map((t) => (
            <button key={t.url} type="button" className="pair" aria-pressed={urls.includes(t.url)} disabled={busy} onClick={() => toggle(t.url)}>
              <b>{t.name}</b><small>{t.url.replace(/^\w+:\/\//, "")}</small>
            </button>
          ))}
          {urls.filter((u) => !DOCTOR_TARGETS.some((t) => t.url === u)).map((u) => (
            <button key={u} type="button" className="pair" aria-pressed disabled={busy} onClick={() => toggle(u)}><b>Custom</b><small>{u.replace(/^\w+:\/\//, "")}</small></button>
          ))}
        </div>
        <button type="button" className="btn btn-blue run-btn" disabled={busy || !urls.length} onClick={() => run()}>{busy ? "Checking…" : "Diagnose"}</button>
      </div>
      <div className="live-form custom-ep">
        <label className="ep"><span>Add an endpoint: wss:// for a Substrate node, https:// for EVM JSON-RPC</span>
          <input value={custom} onChange={(e) => setCustom(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") add(); }} placeholder="wss://your-node.example" spellCheck={false} />
        </label>
        <button type="button" className="btn btn-ghost" onClick={add} disabled={!custom.trim()}>Add</button>
      </div>
      <div className="live-verdict" aria-live="polite">
        <p className={`verdict-line ${done ? (healthy === reports.length ? "same" : "reg") : ""}`}>{done ? `${healthy} of ${reports.length} healthy.` : "Checking…"}</p>
        <div className="verdict-row">
          <p className="verdict-sub">{done ? `canary doctor · exit ${healthy === reports.length ? 0 : 2}` : ""}</p>
          {done && <button type="button" className="more" onClick={() => download("doctor.json", summary)}>Download doctor.json</button>}
        </div>
      </div>
      {reports.map((r) => (
        <div key={r.url} className="doc-ep">
          <div className="doc-head">
            <span className="kind-pill">{r.kind}</span><code className="doc-url">{r.url}</code>
            <span className={`state-pill ${r.done ? (r.healthy ? "ok" : "bad") : ""}`}>{r.done ? (r.healthy ? "healthy" : "unhealthy") : "checking"}</span>
          </div>
          <ol className="layer-list">
            {r.layers.map((l) => <li key={l.name}><Tick ok={l.ok} wait={l.ok === undefined} /><b>{l.name}</b><span>{l.detail}</span></li>)}
          </ol>
          {r.caps && r.apis && (
            <div className="caps">
              <div className="cap-row">{["wasm-contracts", "evm", "upgrade-testing"].map((c) => <span key={c} className={`cap ${r.caps!.includes(c) ? "on" : ""}`}>{c} {r.caps!.includes(c) ? "present" : "absent"}</span>)}</div>
              <div className="api-list">{r.apis.map((a) => <span key={a.id} className={a.name ? "" : "anon"} title={`${a.id}${a.capability ? ` · ${a.capability}` : ""}`}>{a.name ?? a.id}@{a.version}</span>)}</div>
            </div>
          )}
        </div>
      ))}
    </section>
  );
}

/* ---------- recorded test runs ---------- */
const RUNS = [
  { id: "upgrade-halve-reserved", name: "Migration bug", hint: "Injected migration. Funds vanish, chain stays live.", report: "output.txt" },
  { id: "self-compare", name: "Control", hint: "Same node twice. Nothing should differ.", report: "report.html" },
  { id: "upgrade-fee10x", name: "Byte fee ×10", hint: "Injected via setCode. Fees move.", report: "report.html" },
  { id: "upgrade-ed100x", name: "Deposit ×100", hint: "Injected via setCode. A transfer breaks.", report: "report.html" },
];
type Summary = { workflows: number; regression: number; difference: number; inconclusive: number; pass: number; headline?: string; statement?: string };
type Expectation = { description: string; pass: boolean; observed: string };
type SideRun = { endpoint: string; setup_error: string | null; expectations?: Expectation[] };
type Contrast = { what: string; baseline: string; candidate: string };
type Finding = { workflow: string; verdict: string; finding_hash: string; severity: string; rationale: string; regressed: Contrast[]; differences: Contrast[]; baseline_failures: Contrast[] };
type Result = { finding: Finding; baseline?: SideRun; candidate?: SideRun; reproduce?: string };
export type RunData = {
  summary: Summary;
  manifest: { kind?: string; detail?: string; injected?: string | null;
    baseline: { endpoint?: string; spec_version: number; metadata_version?: number }; candidate: { endpoint?: string; spec_version: number; metadata_version?: number } };
  results: Result[];
};
type StateSnap = { block_number: number; accounts: number; sum_free: string; sum_reserved: string; total_issuance: string; delta: string; supply_conservation: string };
type Upgrade = { wasm: string; spec_before: number; spec_after: number; liveness: string;
  state: { before: StateSnap; after: StateSnap; changes: { address: string; reserved_before: string; reserved_after: string; total_delta: string }[] } };

export function verdict(s: Summary) {
  if (s.regression && s.headline) return { text: s.headline, cls: "reg", exit: 1 };
  if (s.regression) return { text: `${s.regression} regression${s.regression > 1 ? "s" : ""}`, cls: "reg", exit: 1 };
  if (s.inconclusive) return { text: `${s.inconclusive} inconclusive`, cls: "base", exit: 2 };
  if (s.difference) return { text: `${s.difference} difference${s.difference > 1 ? "s" : ""}`, cls: "diff", exit: 0 };
  return { text: "All pass", cls: "same", exit: 0 };
}
export const vcls = (v: string) => ({ REGRESSION: "reg", DIFFERENCE: "diff", PASS: "same" } as Record<string, string>)[v] ?? "base";
const pot = (planck: string) => `${formatUnits(BigInt(planck.replace(/^\+/, "")), 14)} POT`;

async function checkAnchor(id: string): Promise<{ att: Attestation; checks: Check[] }> {
  const att: Attestation = await (await fetch(`/reports/${id}/attestation.json`)).json();
  const bytes = new Uint8Array(await (await fetch(`/reports/${id}/report.json`)).arrayBuffer());
  return { att, checks: await verifyAttestation(att, bytes) };
}

function AttestBox({ id }: { id: string }) {
  const [s, setS] = useState<{ att?: Attestation; checks?: Check[]; err?: string; busy: boolean }>({ busy: true });
  const run = () => { setS({ busy: true }); checkAnchor(id).then((x) => setS({ ...x, busy: false }), (e) => setS({ err: (e as Error).message, busy: false })); };
  useEffect(run, [id]); // eslint-disable-line react-hooks/exhaustive-deps
  const ok = s.checks?.every((c) => c.ok);
  return (
    <div className="sub-card">
      <div className="sub-head"><b>Anchor on the V3 testnet</b>
        <span className={`state-pill ${s.busy ? "" : s.err || !ok ? "bad" : "ok"}`}>{s.busy ? "verifying" : s.err ? "unavailable" : ok ? "verified on-chain" : "failed"}</span>
        <button type="button" className="more" disabled={s.busy} onClick={run}>Verify again</button>
      </div>
      {s.att && <p className="sub-note"><code>system.remark</code> by the run&apos;s signer in block #{fmt(s.att.block_number)} on {s.att.chain} · tx {s.att.tx_hash.slice(0, 18)}…</p>}
      {s.err && <p className="sub-note bad">{s.err}</p>}
      {s.checks && <ol className="layer-list compact">{s.checks.map((c) => <li key={c.what}><Tick ok={c.ok} /><b>{c.what}</b><span>{c.detail}</span></li>)}</ol>}
    </div>
  );
}

/** One run: every finding with its expectations, each finding hash recomputed here, and the
 * on-chain anchor. `attest` replaces the recorded-anchor box for a run made in this browser. */
export function RunDetail({ id, d, attest }: { id: string; d: RunData; attest?: ReactNode }) {
  const [repro, setRepro] = useState<Record<string, boolean>>({});
  const [up, setUp] = useState<Upgrade | null>(null);
  useEffect(() => {
    // canary test findings hash which checks broke (verdict.rs); the canary upgrade finding
    // hashes its raw evidence file (scripts/upgrade-to-report.ts). Recompute whichever applies.
    const evidence = d.manifest.kind === "upgrade"
      ? fetch(`/reports/${id}/upgrade.json`).then((r) => r.arrayBuffer()).then((b) => sha256Hex(new Uint8Array(b))).catch(() => "")
      : Promise.resolve("");
    Promise.all(d.results.map(async (r) => [r.finding.workflow,
      (d.manifest.kind === "upgrade" && r.finding.workflow === "upgrade.state" ? await evidence : await findingHash(r.finding)) === r.finding.finding_hash] as const))
      .then((x) => setRepro(Object.fromEntries(x)));
    if (d.manifest.kind === "upgrade") fetch(`/reports/${id}/upgrade.json`).then((r) => r.json()).then(setUp).catch(() => {});
  }, [id, d]);
  const m = d.manifest;
  const same = Object.values(repro).filter(Boolean).length;
  return (
    <div className="run-detail">
      <dl className="facts">
        <div><dt>baseline</dt><dd>{m.baseline.endpoint ?? "–"} · spec {m.baseline.spec_version}{m.baseline.metadata_version ? ` · V${m.baseline.metadata_version}` : ""}</dd></div>
        <div><dt>candidate</dt><dd>{m.candidate.endpoint ?? "–"} · spec {m.candidate.spec_version}{m.candidate.metadata_version ? ` · V${m.candidate.metadata_version}` : ""}</dd></div>
        <div><dt>change under test</dt><dd>{m.injected ?? "none (control)"}</dd></div>
      </dl>
      <p className="sub-note">{d.summary.statement ?? ""} {Object.keys(repro).length ? <b className={same === d.results.length ? "ok" : "bad"}>{same} of {d.results.length} finding hashes recomputed in your browser and identical.</b> : null}</p>
      {up && (
        <div className="sub-card">
          <div className="sub-head"><b>Across the upgrade</b><span className={`state-pill ${up.state.after.supply_conservation === "PASS" ? "ok" : "bad"}`}>supply {up.state.after.supply_conservation.toLowerCase()} after</span></div>
          <p className="sub-note"><code>{up.wasm}</code> · spec {up.spec_before} → {up.spec_after} · liveness {up.liveness}</p>
          <div className="tbl"><table className="mini"><thead><tr><th /><th>block</th><th>accounts</th><th>sum reserved</th><th>total issuance</th><th>delta</th></tr></thead>
            <tbody>{(["before", "after"] as const).map((k) => { const s = up.state[k]; return (
              <tr key={k}><td>{k}</td><td>#{s.block_number}</td><td>{s.accounts}</td><td>{pot(s.sum_reserved)}</td><td>{pot(s.total_issuance)}</td><td className={s.delta === "+0" ? "" : "bad"}>{s.delta === "+0" ? "0" : pot(s.delta)}</td></tr>); })}</tbody></table></div>
          <div className="tbl"><table className="mini"><thead><tr><th>account</th><th>reserved before</th><th>reserved after</th><th>change</th></tr></thead>
            <tbody>{up.state.changes.map((c) => <tr key={c.address}><td><code>{c.address.slice(0, 8)}…{c.address.slice(-6)}</code></td><td>{pot(c.reserved_before)}</td><td>{pot(c.reserved_after)}</td><td className="bad">{pot(c.total_delta)}</td></tr>)}</tbody></table></div>
        </div>
      )}
      <div className="wf-list">
        {d.results.map((r) => (
          <details key={r.finding.workflow} className="wf-item" open={r.finding.verdict === "REGRESSION"}>
            <summary>
              <span className={`v-pill ${vcls(r.finding.verdict)}`}>{r.finding.verdict.toLowerCase()}</span>
              <code>{r.finding.workflow}</code><span className="sev">{r.finding.severity}</span>
              <span className={`repro ${repro[r.finding.workflow] === false ? "bad" : ""}`} title={r.finding.finding_hash}>{repro[r.finding.workflow] === undefined ? "hash…" : repro[r.finding.workflow] ? `✓ ${r.finding.finding_hash.slice(0, 12)}` : "✕ hash differs"}</span>
            </summary>
            <p className="sub-note">{r.finding.rationale}</p>
            {r.baseline?.expectations ? (
              <div className="tbl"><table className="mini"><thead><tr><th>expectation</th><th>baseline</th><th>candidate</th></tr></thead>
                <tbody>{r.baseline.expectations.map((e, i) => { const c = r.candidate?.expectations?.[i]; return (
                  <tr key={i}><td>{e.description}</td><td><Tick ok={e.pass} /> {e.observed}</td><td><Tick ok={c?.pass} /> {c?.observed}</td></tr>); })}</tbody></table></div>
            ) : r.finding.regressed.length > 0 && (
              <div className="tbl"><table className="mini"><thead><tr><th>check</th><th>before</th><th>after</th></tr></thead>
                <tbody>{r.finding.regressed.map((c) => <tr key={c.what}><td>{c.what}</td><td>{c.baseline}</td><td className="bad">{c.candidate}</td></tr>)}</tbody></table></div>
            )}
            {r.reproduce && <p className="sub-note"><code>{r.reproduce}</code></p>}
          </details>
        ))}
      </div>
      {attest ?? <AttestBox id={id} />}
    </div>
  );
}

/* ---------- on-chain registry (PortaldotV3 EVM) + V3 remark anchors ---------- */
type Row = OnChain & { run?: (typeof RUNS)[number]; matches: boolean; tx?: string; remark?: boolean | "error" };

export function RegistryPanel() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [block, setBlock] = useState(0);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    setBusy(true); setErr(null);
    try {
      // Hash every report this site serves, then match it against the contract.
      const [{ list, block }, local] = await Promise.all([
        readRegistry(),
        Promise.all(RUNS.map(async (r) => ({
          r,
          hash: await sha256Of(`/reports/${r.id}/report.json`).catch(() => ""),
          tx: await fetch(`/reports/${r.id}/registry.json`).then((x) => x.json()).then((j) => j.tx_hash as string).catch(() => undefined),
        }))),
      ]);
      setBlock(block);
      const base: Row[] = list.map((a) => {
        const hit = local.find((l) => l.hash === a.reportHash);
        return { ...a, run: hit?.r, matches: !!hit, tx: hit?.tx };
      });
      setRows(base);
      // Second, independent anchor: the same report hash in a system.remark on the V3 Substrate chain.
      for (const row of base) {
        const id = row.run?.id;
        if (!id) continue;
        checkAnchor(id).then(
          ({ checks }) => setRows((rs) => rs?.map((x) => (x.run?.id === id ? { ...x, remark: checks.every((c) => c.ok) } : x)) ?? null),
          () => setRows((rs) => rs?.map((x) => (x.run?.id === id ? { ...x, remark: "error" } : x)) ?? null),
        );
      }
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const matched = rows?.filter((r) => r.matches).length ?? 0;
  const anchored = rows?.filter((r) => r.run).length ?? 0;
  const remarks = rows?.filter((r) => r.remark === true).length ?? 0;
  return (
    <section className="frame panel" aria-label="Registry">
      <div className="live-form pairs">
        <p className="verdict-sub">Contract <code>{REGISTRY}</code> · PortaldotV3 · chain id {V3.chainId}</p>
        <button type="button" className="btn btn-blue run-btn" disabled={busy} onClick={load}>{busy ? "Reading…" : "Read again"}</button>
      </div>
      <div className="live-verdict" aria-live="polite">
        <p className={`verdict-line ${err ? "reg" : rows ? (matched === rows.length ? "same" : "diff") : ""}`}>
          {err ? "Registry unreachable." : rows ? `${matched} of ${rows.length} on-chain reports match this site.` : "Reading the contract…"}
        </p>
        <p className="verdict-sub">{err ?? (rows ? `eth_call all() · ${V3.evmRpc.replace("https://", "")} · block #${fmt(block)} · ${remarks} of ${anchored} remark anchors verified on ${V3.ws.replace("wss://", "")}` : "")}</p>
      </div>
      {rows && (
        <ul className="run-list">
          {rows.map((a) => {
            const v = verdict({ workflows: 0, regression: a.regressions, difference: a.differences, inconclusive: a.inconclusive, pass: a.passes });
            return (
              <li key={a.id}>
                <div className="rl-main">
                  <b>#{a.id} {a.run?.name ?? "Unknown report"}</b>
                  <span>report {a.reportHash.slice(0, 12)}… · {a.matches ? "hash matches the published file" : "no matching file on this site"}</span>
                  {a.run && <span className={`anchor ${a.remark === true ? "ok" : a.remark === undefined ? "" : "bad"}`}>{a.remark === undefined ? "checking the system.remark anchor…" : a.remark === true ? "✓ system.remark anchor verified on V3" : "✕ remark anchor not verified"}</span>}
                </div>
                <div className="rl-verdict">
                  <strong className={v.cls}>{v.text}</strong>
                  <span>spec {a.baselineSpec} → {a.candidateSpec} · {new Date(a.timestamp * 1000).toUTCString().slice(5, 22)} UTC{a.tx ? ` · tx ${a.tx.slice(0, 10)}…` : ""}</span>
                </div>
                <div className="rl-links">
                  {a.run && <a href={`/reports/${a.run.id}/${a.run.report}`}>{a.run.report === "output.txt" ? "Log" : "Report"}</a>}
                  {a.run && <a href={`/reports/${a.run.id}/registry.json`}>Receipt</a>}
                  {a.run && <a href={`/reports/${a.run.id}/attestation.json`}>Anchor</a>}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

/* ---------- invariants: live ---------- */
const INV_TARGETS = [
  { name: "Mainnet", url: "wss://mainnet.portaldot.io" },
  { name: "V3 testnet", url: "wss://test-node-v3.portaldot.dev" },
];
export function InvariantsPanel() {
  const [url, setUrl] = useState(INV_TARGETS[0].url);
  const [busy, setBusy] = useState(false);
  const [count, setCount] = useState(0);
  const [out, setOut] = useState<Supply | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function run(target = url) {
    setBusy(true); setErr(null); setOut(null); setCount(0);
    try { setOut(await supplyConservation(target, setCount)); }
    catch (e) { setErr((e as Error).message); }
    finally { setBusy(false); }
  }
  useEffect(() => { run(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const u = (n: bigint) => (out ? `${formatUnits(n, out.decimals)} ${out.symbol}` : "");
  const exit = out ? { PASS: 0, FAIL: 1, INCONCLUSIVE: 2 }[out.verdict] : 2;
  return (
    <section className="frame panel" aria-label="Invariants">
      <div className="live-form pairs">
        <div className="pair-group" role="group" aria-label="Network">
          {INV_TARGETS.map((t) => (
            <button key={t.url} type="button" className="pair" aria-pressed={url === t.url} disabled={busy} onClick={() => { setUrl(t.url); run(t.url); }}>
              <b>{t.name}</b><small>{t.url.replace("wss://", "")}</small>
            </button>
          ))}
        </div>
        <button type="button" className="btn btn-blue run-btn" disabled={busy} onClick={() => run()}>{busy ? "Reading…" : "Run again"}</button>
      </div>
      <div className="live-verdict" aria-live="polite">
        <p className={`verdict-line ${out ? (out.verdict === "PASS" ? "same" : out.verdict === "FAIL" ? "reg" : "base") : err ? "reg" : ""}`}>
          {out ? (out.verdict === "PASS" ? "Pass. Delta 0 planck." : out.verdict === "FAIL" ? `Fail. Delta ${out.delta} planck.` : "Inconclusive.") : err ? "Inconclusive." : `Reading every account…${count ? ` ${fmt(count)}` : ""}`}
        </p>
        <div className="verdict-row">
          <p className="verdict-sub">{err ?? (out ? `canary invariants · ${out.endpoint} · finalized #${fmt(out.block.number)} · exit ${exit}` : url)}</p>
          {out && <button type="button" className="more" onClick={() => download("invariants.json", { invariant: "supply_conservation", ...out })}>Download JSON</button>}
        </div>
        {busy && <div className="progress"><span style={{ width: `${Math.min(95, 5 + Math.log10(count + 1) * 23)}%` }} /></div>}
      </div>
      {out && (
        <dl className="facts">
          <div><dt>block</dt><dd>#{fmt(out.block.number)} · {out.block.hash.slice(0, 18)}…</dd></div>
          <div><dt>accounts</dt><dd>{fmt(out.accounts)} · {Object.entries(out.layouts).map(([k, v]) => `${k} ${fmt(v)}`).join(", ")} · {out.decode_errors} decode errors</dd></div>
          <div><dt>delta</dt><dd className={out.delta === 0n ? "" : "bad"}>{out.delta >= 0n ? "+" : ""}{out.delta.toString()} planck</dd></div>
          <div><dt>sum free</dt><dd>{u(out.sum_free)}</dd></div>
          <div><dt>sum reserved</dt><dd>{u(out.sum_reserved)}</dd></div>
          <div><dt>total issuance</dt><dd>{u(out.total_issuance)}</dd></div>
        </dl>
      )}
    </section>
  );
}
