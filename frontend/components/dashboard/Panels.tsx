"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Download, Loader2, RefreshCw, Plus, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Node, readRuntime } from "@/lib/canary";
import { readRegistry, sha256Of, REGISTRY, type OnChain } from "@/lib/registry";
import {
  detectApis, resolveHost, supplyConservation, formatUnits, findingHash, verifyAttestation, sha256Hex,
  type Api, type Supply, type Check, type Attestation,
} from "@/lib/checks";
import { V3 } from "@/lib/wallet";
import { Panel, KV, Stats, Status, Mark, Mono, Empty, ErrorText, fmt, download, type Tone } from "./kit";
import { cn } from "@/lib/utils";

export { fmt, download };

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
  const r: DocReport = { url, kind: evm ? "evm" : "substrate", healthy: false, done: false, layers: names.map((name) => ({ name, detail: "" })), json: { url } };
  const push = () => update({ ...r, layers: [...r.layers] });
  const set = (i: number, ok: boolean, detail: string) => { r.layers[i] = { ...r.layers[i], ok, detail }; push(); };
  const stop = (from: number) => { r.layers = r.layers.map((l, i) => (i >= from && l.ok === undefined ? { ...l, detail: "not reached" } : l)); push(); };
  const finish = () => { r.done = true; r.json.healthy = r.healthy; push(); return r; };
  let u: URL;
  try { u = new URL(url); } catch { set(0, false, "not a valid URL"); stop(1); return finish(); }
  if (!/^(wss?|https?):$/.test(u.protocol)) { set(0, false, "use wss:// (Substrate) or https:// (EVM)"); stop(1); return finish(); }
  const port = u.port || (/^(wss|https):$/.test(u.protocol) ? "443" : "80");
  const dns = await resolveHost(u.hostname);
  if (!dns.ok) { set(0, false, `DNS: ${dns.error}`); stop(1); r.json.reach = { dns_no_record: dns.error }; return finish(); }
  set(0, true, dns.ip ? `${dns.ip}:${port}` : `port ${port}`);
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
      set(1, true, `${Math.round(performance.now() - t0)} ms`);
      set(2, true, `${parseInt(id, 16)}`);
      const client = await rpc("web3_clientVersion").catch(() => null);
      set(3, !!client, client ?? "not answered");
      const bn = await rpc("eth_blockNumber").catch(() => null);
      set(4, !!bn, bn ? `#${fmt(parseInt(bn, 16))}` : "not answered");
      r.healthy = true;
      r.json = { ...r.json, chain_id: parseInt(id, 16), client, block: bn ? parseInt(bn, 16) : null };
    } catch (e) { set(1, false, (e as Error).message); stop(2); r.json.error = (e as Error).message; }
    return finish();
  }

  const node = new Node(url);
  try {
    try { await node.ready; set(1, true, `${Math.round(performance.now() - t0)} ms`); }
    catch (e) { set(1, false, (e as Error).message); stop(2); r.json.handshake_error = (e as Error).message; return finish(); }
    const [name, health] = await Promise.all([node.call<string>("system_name").catch(() => null), node.call<{ peers: number; isSyncing: boolean }>("system_health").catch(() => null)]);
    const rt = await readRuntime(node);
    set(2, !!rt.chain, `${rt.chain ?? "not answered"}${health ? ` · ${health.peers} peer${health.peers === 1 ? "" : "s"}${health.isSyncing ? " · syncing" : ""}` : ""}`);
    set(3, !!rt.genesis_hash, rt.genesis_hash ? `${rt.genesis_hash.slice(0, 18)}…` : "not answered");
    const rv = rt.runtime_version as unknown as { specName: string; specVersion: number; implVersion?: number; transactionVersion: number; apis: [string, number][] };
    set(4, true, `${rv.specName} ${rv.specVersion} · tx ${rv.transactionVersion}`);
    const bytes = Uint8Array.from((rt.metadata.slice(2).match(/../g) ?? []).map((x) => parseInt(x, 16)));
    const mv = bytes[4], sha = await sha256Hex(bytes);
    set(5, mv >= 13, `V${mv} · ${fmt(bytes.length)} bytes${mv < 13 ? " · not supported" : ""}`);
    const apis = detectApis(rv.apis);
    const caps = [...new Set(apis.map((a) => a.capability).filter((c): c is string => !!c))].sort();
    set(6, true, `${apis.length} (${apis.filter((a) => !a.name).length} unknown)`);
    r.apis = apis; r.caps = caps; r.healthy = mv >= 13;
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
  const add = () => { const u = custom.trim(); if (u && !urls.includes(u)) { const next = [...urls, u]; setUrls(next); run(next); } setCustom(""); };
  const done = reports.length > 0 && reports.every((r) => r.done);
  const healthy = reports.filter((r) => r.healthy).length;
  const summary = { substrate: reports.filter((r) => r.kind === "substrate").map((r) => r.json), evm: reports.filter((r) => r.kind === "evm").map((r) => r.json), healthy: healthy === reports.length };

  return (
    <div className="space-y-6">
      <Panel>
        <div className="flex flex-wrap items-center gap-2">
          {DOCTOR_TARGETS.map((t) => (
            <Button key={t.url} size="sm" variant={urls.includes(t.url) ? "secondary" : "ghost"} disabled={busy} onClick={() => toggle(t.url)}>{t.name}</Button>
          ))}
          {urls.filter((u) => !DOCTOR_TARGETS.some((t) => t.url === u)).map((u) => (
            <Button key={u} size="sm" variant="secondary" disabled={busy} onClick={() => toggle(u)} className="max-w-56 font-mono text-xs"><span className="truncate">{u.replace(/^\w+:\/\//, "")}</span></Button>
          ))}
          <div className="flex w-full gap-2 sm:ml-auto sm:w-auto">
            <Input value={custom} onChange={(e) => setCustom(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") add(); }} placeholder="wss:// or https:// endpoint" spellCheck={false} className="h-9 font-mono text-xs sm:w-64" />
            <Button size="sm" variant="outline" onClick={add} disabled={!custom.trim() || busy}><Plus />Add</Button>
            <Button size="sm" disabled={busy || !urls.length} onClick={() => run()}>{busy ? <Loader2 className="animate-spin" /> : <RefreshCw />}Check</Button>
          </div>
        </div>
      </Panel>

      <div className="flex items-center justify-between gap-3">
        <p className={cn("font-heading text-xl font-medium", done && (healthy === reports.length ? "text-success" : "text-destructive"))}>
          {done ? `${healthy} of ${reports.length} healthy` : "Checking…"}
        </p>
        {done && <Button variant="outline" size="sm" onClick={() => download("doctor.json", summary)}><Download />JSON</Button>}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {reports.map((r) => (
          <Panel key={r.url} flush title={<span className="flex min-w-0 items-center gap-2"><span className="truncate font-mono text-xs">{r.url}</span></span>}
            action={<Status tone={r.done ? (r.healthy ? "good" : "bad") : "muted"}>{r.done ? (r.healthy ? "Healthy" : "Unhealthy") : "Checking"}</Status>}>
            <ul className="divide-y text-sm">
              {r.layers.map((l) => (
                <li key={l.name} className="flex items-center gap-3 px-5 py-2.5">
                  <Mark state={l.ok === undefined ? (l.detail === "not reached" ? "skip" : "run") : l.ok ? "ok" : "bad"} />
                  <span className="w-28 shrink-0 text-muted-foreground">{l.name}</span>
                  <span className={cn("min-w-0 truncate", l.ok === false && "text-destructive")} title={l.detail}>{l.detail}</span>
                </li>
              ))}
            </ul>
            {r.caps && (
              <div className="flex flex-wrap gap-1.5 border-t px-5 py-3">
                {["wasm-contracts", "evm", "upgrade-testing"].map((c) => <Status key={c} tone={r.caps!.includes(c) ? "good" : "muted"}>{c}</Status>)}
              </div>
            )}
          </Panel>
        ))}
      </div>
    </div>
  );
}

/* ---------- recorded runs: shared types and detail ---------- */
export const RECORDED = [
  { id: "upgrade-halve-reserved", name: "halve-reserved", report: "output.txt" },
  { id: "upgrade-ed100x", name: "ed100x", report: "report.html" },
  { id: "upgrade-fee10x", name: "fee10x", report: "report.html" },
  { id: "self-compare", name: "control", report: "report.html" },
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

export function verdict(s: Summary): { text: string; tone: Tone; exit: number } {
  if (s.regression && s.headline) return { text: s.headline, tone: "bad", exit: 1 };
  if (s.regression) return { text: `${s.regression} regression${s.regression > 1 ? "s" : ""}`, tone: "bad", exit: 1 };
  if (s.inconclusive) return { text: `${s.inconclusive} inconclusive`, tone: "muted", exit: 2 };
  if (s.difference) return { text: `${s.difference} difference${s.difference > 1 ? "s" : ""}`, tone: "warn", exit: 0 };
  return { text: "All pass", tone: "good", exit: 0 };
}
export const verdictTone = (v: string): Tone => (({ REGRESSION: "bad", DIFFERENCE: "warn", PASS: "good" } as Record<string, Tone>)[v] ?? "muted");
const pot = (planck: string) => `${formatUnits(BigInt(planck.replace(/^\+/, "")), 14)} POT`;

async function checkAnchor(id: string): Promise<{ att: Attestation; checks: Check[] }> {
  const att: Attestation = await (await fetch(`/reports/${id}/attestation.json`)).json();
  const bytes = new Uint8Array(await (await fetch(`/reports/${id}/report.json`)).arrayBuffer());
  return { att, checks: await verifyAttestation(att, bytes) };
}

function Checks({ checks }: { checks: { what: string; ok: boolean; detail?: string }[] }) {
  return (
    <ul className="space-y-1.5 text-sm">
      {checks.map((c) => <li key={c.what} className="flex items-center gap-2"><Mark state={c.ok ? "ok" : "bad"} /><span>{c.what}</span></li>)}
    </ul>
  );
}

function AnchorBox({ id }: { id: string }) {
  const [s, setS] = useState<{ att?: Attestation; checks?: Check[]; err?: string; busy: boolean }>({ busy: true });
  const run = () => { setS({ busy: true }); checkAnchor(id).then((x) => setS({ ...x, busy: false }), (e) => setS({ err: (e as Error).message, busy: false })); };
  useEffect(run, [id]); // eslint-disable-line react-hooks/exhaustive-deps
  const ok = s.checks?.every((c) => c.ok);
  return (
    <div className="space-y-3 rounded-lg border p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium">On-chain anchor</span>
        <Status tone={s.busy ? "muted" : s.err || !ok ? "bad" : "good"}>{s.busy ? "Verifying" : s.err ? "Unavailable" : ok ? "Verified" : "Failed"}</Status>
      </div>
      {s.att && <p className="text-xs text-muted-foreground">Block #{fmt(s.att.block_number)} on {s.att.chain} · tx <Mono>{s.att.tx_hash.slice(0, 14)}…</Mono></p>}
      {s.err && <ErrorText>{s.err}</ErrorText>}
      {s.checks && <Checks checks={s.checks} />}
    </div>
  );
}

/** Every workflow finding of a run, each finding hash recomputed here. */
export function RunDetail({ id, d, attest }: { id: string; d: RunData; attest?: ReactNode | false }) {
  const [repro, setRepro] = useState<Record<string, boolean>>({});
  const [up, setUp] = useState<Upgrade | null>(null);
  const [open, setOpen] = useState<string | null>(d.results.find((r) => r.finding.verdict === "REGRESSION")?.finding.workflow ?? null);
  useEffect(() => {
    const evidence = d.manifest.kind === "upgrade"
      ? fetch(`/reports/${id}/upgrade.json`).then((r) => r.arrayBuffer()).then((b) => sha256Hex(new Uint8Array(b))).catch(() => "")
      : Promise.resolve("");
    Promise.all(d.results.map(async (r) => [r.finding.workflow,
      (d.manifest.kind === "upgrade" && r.finding.workflow === "upgrade.state" ? await evidence : await findingHash(r.finding)) === r.finding.finding_hash] as const))
      .then((x) => setRepro(Object.fromEntries(x)));
    if (d.manifest.kind === "upgrade") fetch(`/reports/${id}/upgrade.json`).then((r) => r.json()).then(setUp).catch(() => {});
  }, [id, d]);
  const same = Object.values(repro).filter(Boolean).length;
  return (
    <div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b px-5 py-3 text-xs text-muted-foreground">
        <span>spec {d.manifest.baseline.spec_version} → {d.manifest.candidate.spec_version}</span>
        {d.manifest.injected && <span>{d.manifest.injected}</span>}
        {Object.keys(repro).length > 0 && <span className={same === d.results.length ? "text-success" : "text-destructive"}>{same}/{d.results.length} finding hashes reproduced</span>}
      </div>
      {up && (
        <div className="border-b">
          <Table>
            <TableHeader><TableRow><TableHead className="pl-5" /><TableHead>Block</TableHead><TableHead>Accounts</TableHead><TableHead>Reserved</TableHead><TableHead>Issuance</TableHead><TableHead>Delta</TableHead></TableRow></TableHeader>
            <TableBody>{(["before", "after"] as const).map((k) => { const s = up.state[k]; return (
              <TableRow key={k}><TableCell className="pl-5 capitalize">{k}</TableCell><TableCell>#{s.block_number}</TableCell><TableCell>{s.accounts}</TableCell><TableCell>{pot(s.sum_reserved)}</TableCell><TableCell>{pot(s.total_issuance)}</TableCell><TableCell className={s.delta === "+0" ? "" : "text-destructive"}>{s.delta === "+0" ? "0" : pot(s.delta)}</TableCell></TableRow>); })}</TableBody>
          </Table>
        </div>
      )}
      <div className="divide-y">
        {d.results.map((r) => {
          const k = r.finding.workflow;
          return (
            <Collapsible key={k} open={open === k} onOpenChange={(o) => setOpen(o ? k : null)}>
              <CollapsibleTrigger className="flex w-full items-center gap-3 px-5 py-3 text-left text-sm hover:bg-muted/50">
                <ChevronRight className={cn("size-4 shrink-0 text-muted-foreground transition-transform", open === k && "rotate-90")} />
                <Status tone={verdictTone(r.finding.verdict)} className="shrink-0 justify-center capitalize sm:w-24">{r.finding.verdict.toLowerCase()}</Status>
                <span className="min-w-0 flex-1 truncate font-mono text-xs">{k}</span>
                <span className={cn("hidden font-mono text-[11px] sm:inline", repro[k] === false ? "text-destructive" : "text-muted-foreground")} title={r.finding.finding_hash}>
                  {repro[k] === undefined ? "…" : repro[k] ? r.finding.finding_hash.slice(0, 10) : "hash differs"}
                </span>
              </CollapsibleTrigger>
              <CollapsibleContent className="border-t bg-muted/30">
                <p className="px-5 py-3 text-sm text-muted-foreground">{r.finding.rationale}</p>
                {r.baseline?.expectations ? (
                  <div className="border-t bg-background">
                    <Table>
                      <TableHeader><TableRow><TableHead className="pl-5">Expectation</TableHead><TableHead>Baseline</TableHead><TableHead>Candidate</TableHead></TableRow></TableHeader>
                      <TableBody>{r.baseline.expectations.map((e, i) => { const c = r.candidate?.expectations?.[i]; return (
                        <TableRow key={i}>
                          <TableCell className="pl-5 whitespace-normal">{e.description}</TableCell>
                          <TableCell className="whitespace-normal"><span className="flex items-start gap-1.5"><Mark state={e.pass ? "ok" : "bad"} /><span className="text-xs">{e.observed}</span></span></TableCell>
                          <TableCell className="whitespace-normal"><span className="flex items-start gap-1.5"><Mark state={c?.pass ? "ok" : "bad"} /><span className="text-xs">{c?.observed}</span></span></TableCell>
                        </TableRow>); })}</TableBody>
                    </Table>
                  </div>
                ) : r.finding.regressed.length > 0 && (
                  <div className="border-t bg-background">
                    <Table>
                      <TableHeader><TableRow><TableHead className="pl-5">Check</TableHead><TableHead>Before</TableHead><TableHead>After</TableHead></TableRow></TableHeader>
                      <TableBody>{r.finding.regressed.map((c) => <TableRow key={c.what}><TableCell className="pl-5 whitespace-normal">{c.what}</TableCell><TableCell className="whitespace-normal">{c.baseline}</TableCell><TableCell className="whitespace-normal text-destructive">{c.candidate}</TableCell></TableRow>)}</TableBody>
                    </Table>
                  </div>
                )}
                {r.reproduce && <p className="border-t px-5 py-2.5"><Mono className="text-muted-foreground">{r.reproduce}</Mono></p>}
              </CollapsibleContent>
            </Collapsible>
          );
        })}
      </div>
      {attest !== false && <div className="border-t p-5">{attest ?? <AnchorBox id={id} />}</div>}
    </div>
  );
}

/* ---------- on-chain registry (PortaldotV3 EVM) + V3 remark anchors ---------- */
type Row = OnChain & { run?: (typeof RECORDED)[number]; matches: boolean; tx?: string; remark?: boolean | "error" };

export function RegistryPanel() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [block, setBlock] = useState(0);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    setBusy(true); setErr(null);
    try {
      const [{ list, block }, local] = await Promise.all([
        readRegistry(),
        Promise.all(RECORDED.map(async (r) => ({
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
    <div className="space-y-6">
      <Stats items={[
        { label: "Reports on-chain", value: rows ? rows.length : "…" },
        { label: "Match this site", value: rows ? `${matched}/${rows.length}` : "…", tone: rows ? (matched === rows.length ? "good" : "warn") : undefined },
        { label: "Remark anchors", value: rows ? `${remarks}/${anchored}` : "…", tone: rows && anchored ? (remarks === anchored ? "good" : "warn") : undefined },
        { label: "EVM block", value: block ? `#${fmt(block)}` : "…" },
      ]} />
      <Panel flush title={<span className="flex items-center gap-2">CanaryRegistry <Mono className="text-muted-foreground">{REGISTRY.slice(0, 8)}…{REGISTRY.slice(-6)}</Mono></span>}
        description={`PortaldotV3 · chain id ${V3.chainId}`}
        action={<Button size="sm" variant="outline" disabled={busy} onClick={load}>{busy ? <Loader2 className="animate-spin" /> : <RefreshCw />}Read</Button>}>
        {err && <div className="px-5 py-4"><ErrorText>{err}</ErrorText></div>}
        {rows && (rows.length ? (
          <Table>
            <TableHeader><TableRow><TableHead className="pl-5">#</TableHead><TableHead>Run</TableHead><TableHead>Result</TableHead><TableHead>Spec</TableHead><TableHead>File</TableHead><TableHead>Remark</TableHead><TableHead /></TableRow></TableHeader>
            <TableBody>{rows.map((a) => {
              const v = verdict({ workflows: 0, regression: a.regressions, difference: a.differences, inconclusive: a.inconclusive, pass: a.passes });
              return (
                <TableRow key={a.id}>
                  <TableCell className="pl-5 text-muted-foreground">{a.id}</TableCell>
                  <TableCell className="font-medium">{a.run?.name ?? "unknown"}</TableCell>
                  <TableCell><Status tone={v.tone}>{v.text}</Status></TableCell>
                  <TableCell className="text-muted-foreground">{a.baselineSpec} → {a.candidateSpec}</TableCell>
                  <TableCell>{a.matches ? <Mark state="ok" /> : <Mark state="bad" />}</TableCell>
                  <TableCell>{a.run ? <Mark state={a.remark === undefined ? "run" : a.remark === true ? "ok" : "bad"} /> : "–"}</TableCell>
                  <TableCell className="pr-5 text-right">{a.run && <Button variant="link" size="sm" asChild className="h-auto p-0"><a href={`/reports/${a.run.id}/${a.run.report}`} target="_blank" rel="noreferrer">Report</a></Button>}</TableCell>
                </TableRow>
              );
            })}</TableBody>
          </Table>
        ) : <Empty>No reports on-chain.</Empty>)}
        {!rows && !err && <Empty>Reading the contract…</Empty>}
      </Panel>
    </div>
  );
}

/* ---------- supply invariant: live ---------- */
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
  const tone: Tone = out ? (out.verdict === "PASS" ? "good" : out.verdict === "FAIL" ? "bad" : "muted") : err ? "bad" : "muted";
  return (
    <div className="space-y-6">
      <Panel>
        <div className="flex flex-wrap items-center gap-2">
          {INV_TARGETS.map((t) => (
            <Button key={t.url} size="sm" variant={url === t.url ? "secondary" : "ghost"} disabled={busy} onClick={() => { setUrl(t.url); run(t.url); }}>{t.name}</Button>
          ))}
          <Button size="sm" className="ml-auto" disabled={busy} onClick={() => run()}>{busy ? <Loader2 className="animate-spin" /> : <RefreshCw />}Run</Button>
        </div>
        {busy && <div className="mt-4 space-y-1.5"><Progress value={Math.min(95, 5 + Math.log10(count + 1) * 23)} /><p className="text-xs text-muted-foreground">{fmt(count)} accounts read</p></div>}
        {err && <div className="mt-3"><ErrorText>{err}</ErrorText></div>}
      </Panel>
      {out && (
        <>
          <Stats items={[
            { label: "Supply", value: out.verdict === "PASS" ? "Conserved" : out.verdict === "FAIL" ? "Broken" : "Inconclusive", tone },
            { label: "Delta (planck)", value: `${out.delta >= 0n ? "+" : ""}${out.delta.toString()}`, tone: out.delta === 0n ? "good" : "bad" },
            { label: "Accounts", value: fmt(out.accounts) },
            { label: "Finalized block", value: `#${fmt(out.block.number)}` },
          ]} />
          <Panel flush title="Totals" action={<Button variant="outline" size="sm" onClick={() => download("invariants.json", { invariant: "supply_conservation", ...out })}><Download />JSON</Button>}>
            <KV rows={[
              ["Free", u(out.sum_free)],
              ["Reserved", u(out.sum_reserved)],
              ["Total issuance", u(out.total_issuance)],
              ["Decode errors", fmt(out.decode_errors)],
              ["Block hash", <Mono key="h">{out.block.hash.slice(0, 22)}…</Mono>],
            ]} />
          </Panel>
        </>
      )}
    </div>
  );
}
