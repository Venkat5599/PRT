"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, Play, Download, PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { V3, formatUnits, short, walletStore, type Connected } from "@/lib/wallet";
import { RunDetail, verdict, verdictTone, type RunData } from "./Panels";
import { Panel, KV, Status, Mark, Mono, ErrorText, fmt, download } from "./kit";
import type { Signer, ChainInfo, Attestation, SuiteEntry } from "@/lib/tx/tx";
import { cn } from "@/lib/utils";

// `canary test` and `canary attest` against your own nodes: real signed extrinsics on both
// endpoints, classified like the CLI, anchored with system.remark. Dev chains sign with public dev
// accounts; any other chain needs your Substrate wallet.
const txm = () => import("@/lib/tx/tx");
const DEV_A = "ws://127.0.0.1:9944";
const DEV_B = "ws://127.0.0.1:9945";
const PRESETS = [
  { name: "Local :9944 → :9945", b: DEV_A, c: DEV_B },
  { name: "Local control", b: DEV_A, c: DEV_A },
  { name: "V3 control", b: V3.ws, c: V3.ws },
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

function signerFor(lanes: Lane[], wallet: Connected | null, useWallet: boolean): { signer?: Signer; label: string; reason?: string } {
  const infos = lanes.map((l) => l.info);
  if (infos.some((i) => !i)) return { label: "", reason: "checking the endpoints" };
  const dev = infos.every((i) => i!.dev);
  const sub = wallet?.wallet.kind === "substrate" ? wallet : null;
  if (dev && !(useWallet && sub)) return { signer: { kind: "dev", name: "charlie" }, label: "//Charlie (dev)" };
  if (!dev && infos.some((i) => i!.dev)) return { label: "", reason: "mixing a local dev chain with a live chain: one signer must pay on both" };
  if (!sub) return { label: "", reason: wallet ? "an EVM wallet cannot sign Substrate extrinsics" : "connect a Substrate wallet" };
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
  const need = useMemo(() => {
    const most = selected.reduce((m, s) => { const f = (s.workflow.fund ?? []).reduce((a, x) => a + BigInt(x.amount), 0n); return f > m ? f : m; }, 0n);
    return b === c ? most * 2n : most;
  }, [selected, b, c]);
  const who = signerFor(lanes.length === 2 ? lanes : [{ ws: b, busy: true }], wallet, useWallet);

  async function check() {
    const eps = [b.trim(), c.trim()];
    setLanes(eps.map((ws) => ({ ws, busy: true })));
    const t = await txm();
    await Promise.all(eps.map(async (ws, i) => {
      try {
        const info = await t.chainInfo(ws);
        setLanes((l) => l.map((x, k) => (k === i ? { ...x, info, busy: false } : x)));
      } catch (e) {
        setLanes((l) => l.map((x, k) => (k === i ? { ...x, busy: false, err: isLocal(ws) ? "no dev node on this port (or local network access was blocked)" : (e as Error).message } : x)));
      }
    }));
  }
  useEffect(() => { const t = setTimeout(check, 350); return () => clearTimeout(t); }, [b, c]); // eslint-disable-line react-hooks/exhaustive-deps

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

  const low = lanes.find((l) => l.balance !== undefined && l.balance < need);
  const blocked = !suite ? "loading the suite"
    : !selected.length ? "pick at least one workflow"
    : lanes.some((l) => l.err) ? lanes.find((l) => l.err)!.err
    : who.reason ? who.reason
    : low ? `signer holds ${amount(low.balance!, low.info)} on ${low.info?.chain}, needs ${amount(need, low.info)}`
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
    <div className="space-y-6">
      <Panel>
        <div className="mb-4 flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <Button key={p.name} size="sm" variant={b === p.b && c === p.c ? "secondary" : "ghost"} disabled={busy} onClick={() => { setB(p.b); setC(p.c); }}>{p.name}</Button>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {[["Baseline", b, setB], ["Candidate", c, setC]].map(([label, val, set], i) => {
            const l = lanes[i];
            return (
              <div key={label as string} className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">{label as string}</Label>
                <Input value={val as string} onChange={(e) => (set as (v: string) => void)(e.target.value)} disabled={busy} spellCheck={false} className="font-mono text-sm" aria-invalid={!!l?.err} />
                <p className={cn("flex items-center gap-1.5 truncate text-xs", l?.err ? "text-destructive" : "text-muted-foreground")}>
                  {l && <Mark state={l.busy ? "run" : l.info ? "ok" : "bad"} />}
                  {l ? (l.busy ? "connecting…" : l.err ?? `${l.info!.chain} · ${l.info!.spec}${l.balance !== undefined && who.signer ? ` · ${amount(l.balance, l.info)}` : ""}`) : ""}
                </p>
              </div>
            );
          })}
        </div>
      </Panel>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Panel flush title="Workflows" description={suite ? `${selected.length} of ${suite.length}` : undefined}>
          <ul className="divide-y">
            {(suite ?? []).map((s) => (
              <li key={s.workflow.id}>
                <label className="flex cursor-pointer items-start gap-3 px-5 py-3 hover:bg-muted/40">
                  <input type="checkbox" className="mt-0.5 size-4 accent-primary" checked={pick.has(s.workflow.id)} disabled={busy} onChange={() => toggle(s.workflow.id)} />
                  <span className="min-w-0">
                    <span className="flex items-center gap-2"><Mono>{s.workflow.id}</Mono>{s.workflow.importance === "core" && <Status tone="info">core</Status>}</span>
                    <span className="mt-0.5 block truncate text-xs text-muted-foreground">{s.workflow.steps.map((x) => x.call).join(" · ")}</span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel flush title="Run" className="lg:sticky lg:top-20">
          <KV rows={[
            ["Signer", <span key="s" className="flex flex-wrap items-center gap-2">{who.label || "–"}{devBoth && wallet?.wallet.kind === "substrate" && <Button variant="link" size="sm" className="h-auto p-0" disabled={busy} onClick={() => setUseWallet((u) => !u)}>{useWallet ? "use dev account" : "use my wallet"}</Button>}</span>],
            ["Funding", selected.length && lanes[0]?.info ? `${amount(need, lanes[0].info)} at a time` : "–"],
          ]} />
          <div className="space-y-3 border-t px-5 py-4">
            <Input value={injected} onChange={(e) => setInjected(e.target.value)} disabled={busy} placeholder="Change under test (optional)" spellCheck={false} />
            <Button className="w-full" disabled={busy || !!blocked} onClick={start}>{busy ? <Loader2 className="animate-spin" /> : <Play />}{busy ? `Running ${Math.max(0, Math.round((now - started) / 1000))}s` : "Run workflows"}</Button>
            {blocked && !busy && <p className="text-xs text-muted-foreground">{blocked}</p>}
          </div>
        </Panel>
      </div>

      {(busy || log.length > 0) && (
        <Panel flush title="Live" action={<Status tone={busy ? "info" : err ? "bad" : "good"}>{busy ? "Running" : err ? "Stopped" : "Finished"}</Status>}>
          <Table>
            <TableHeader><TableRow><TableHead className="pl-5">Workflow</TableHead><TableHead>Verdict</TableHead><TableHead>Severity</TableHead><TableHead className="pr-5">Hash</TableHead></TableRow></TableHeader>
            <TableBody>{Object.entries(rows).map(([id, r]) => (
              <TableRow key={id}><TableCell className="pl-5 font-mono text-xs">{id}</TableCell>
                {r === "running" ? <TableCell colSpan={3} className="text-muted-foreground">{busy ? "queued" : "not run"}</TableCell>
                  : <><TableCell><Status tone={verdictTone(r.verdict)} className="capitalize">{r.verdict.toLowerCase()}</Status></TableCell><TableCell>{r.severity}</TableCell><TableCell className="pr-5 font-mono text-xs">{r.hash.slice(0, 14)}</TableCell></>}
              </TableRow>))}</TableBody>
          </Table>
          <pre ref={logBox} className="max-h-56 overflow-auto border-t bg-muted/40 px-5 py-3 font-mono text-[11.5px] leading-relaxed text-muted-foreground">{log.join("\n")}</pre>
          {err && <div className="border-t px-5 py-3"><ErrorText>{err}</ErrorText></div>}
        </Panel>
      )}

      {data && v && !busy && (
        <Panel flush title={<span className="flex items-center gap-2">Run <Mono className="text-muted-foreground">{data.manifest.run_id}</Mono></span>}
          action={<div className="flex items-center gap-2"><Status tone={v.tone}>{v.text}</Status><Button size="sm" variant="outline" onClick={() => download("report.json", run!.text)}><Download />report.json</Button></div>}>
          <RunDetail id={`web-${data.manifest.run_id}`} d={data} attest={<AttestRun saved={run!} wallet={wallet} onSaved={(s) => { setRun(s); try { localStorage.setItem(LAST, JSON.stringify(s)); } catch {} }} />} />
        </Panel>
      )}
    </div>
  );
}

/** Anchor a report made here with system.remark, then verify it from the chain. */
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
      const signer: Signer | null = sub ? { kind: "wallet", extension: sub.wallet.id, address: sub.address } : info.dev ? { kind: "dev", name: "alice" } : null;
      if (!signer) throw new Error("connect a Substrate wallet to sign on this chain");
      const bal = await t.freeBalance(ws, t.signerAddress(signer));
      if (bal === 0n) throw new Error(`${short(t.signerAddress(signer))} holds no ${info.symbol} on ${info.chain}`);
      const att = await t.attest(ws, bytes(), signer);
      onSaved({ ...saved, att });
      await verifyNow(att);
    } catch (e) { setErr((e as Error).message); setBusy(null); }
  }
  useEffect(() => { if (saved.att) verifyNow(saved.att); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const att = saved.att;
  const ok = checks?.every((c) => c.ok);
  return (
    <div className="space-y-3 rounded-lg border p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-auto text-sm font-medium">On-chain anchor</span>
        <Button size="sm" variant={ws === first ? "secondary" : "ghost"} disabled={!!busy} onClick={() => setWs(first)}>Baseline chain</Button>
        <Button size="sm" variant={ws === V3.ws ? "secondary" : "ghost"} disabled={!!busy} onClick={() => setWs(V3.ws)}>V3 testnet</Button>
        <Button size="sm" disabled={!!busy} onClick={sign}>{busy === "sign" ? <Loader2 className="animate-spin" /> : <PenLine />}{att ? "Anchor again" : "Anchor"}</Button>
      </div>
      {att && <p className="text-xs text-muted-foreground">Block #{fmt(att.block_number)} on {att.chain} · <Mono>{att.tx_hash.slice(0, 14)}…</Mono> · {checks ? (ok ? <span className="text-success">verified</span> : <span className="text-destructive">failed</span>) : busy === "verify" ? "verifying…" : ""}</p>}
      {err && <ErrorText>{err}</ErrorText>}
      {checks && <ul className="space-y-1 text-sm">{checks.map((c) => <li key={c.what} className="flex items-center gap-2"><Mark state={c.ok ? "ok" : "bad"} />{c.what}</li>)}</ul>}
    </div>
  );
}
