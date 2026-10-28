"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Node, readRuntime, compare, type Comparison, type Runtime } from "@/lib/canary";
import { RiskList, ChangeTable, riskCounts, SEVERITY } from "./Findings";
import { Panel, Stats, Status, download } from "./kit";
import { cn } from "@/lib/utils";

// Any two nodes: read both runtimes, diff them with the wasm build of `canary compare`, judge the
// diff with the same risk rules as the CLI, and show the rows behind every finding.
const MAINNET = "wss://mainnet.portaldot.io", V3 = "wss://test-node-v3.portaldot.dev";
const PRESETS: [string, string, string][] = [
  ["Mainnet → V3", MAINNET, V3],
  ["V3 → V3", V3, V3],
  ["Mainnet → Mainnet", MAINNET, MAINNET],
];
type SideState = { step?: string; error?: string; rt?: Runtime };

/** A node address the page can open, or the reason it cannot. */
export function checkEndpoint(raw: string): { url?: string; error?: string } {
  const v = raw.trim();
  if (!v) return { error: "Enter a node address" };
  if (/^https?:\/\//i.test(v)) return { error: `Use the WebSocket address: ${v.replace(/^http/i, "ws")}` };
  let u: URL;
  try { u = new URL(v); } catch { return { error: "Not a valid address (ws://… or wss://…)" }; }
  if (u.protocol !== "ws:" && u.protocol !== "wss:") return { error: "Only ws:// and wss:// addresses" };
  if (typeof location !== "undefined" && location.protocol === "https:" && u.protocol === "ws:" && !/^(127\.0\.0\.1|localhost|\[::1\])$/.test(u.hostname))
    return { error: "Remote nodes need wss:// on an https page" };
  return { url: u.toString().replace(/\/$/, "") };
}

function explain(e: unknown, url: string): string {
  const m = (e as Error)?.message ?? String(e);
  if (/method not found|-32601/i.test(m)) return "Not a Substrate node";
  if (/no answer|timed out|timeout/i.test(m)) return `No answer from ${url}`;
  if (/could not connect|cannot open|closed the connection/i.test(m)) return `Could not connect to ${url}`;
  return m;
}

export function ComparePanel() {
  const [a, setA] = useState(MAINNET);
  const [b, setB] = useState(V3);
  const [sides, setSides] = useState<{ a: SideState; b: SideState }>({ a: {}, b: {} });
  const [result, setResult] = useState<Comparison | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const runId = useRef(0);

  async function run(x = a, y = b) {
    const ca = checkEndpoint(x), cb = checkEndpoint(y);
    setSides({ a: { error: ca.error }, b: { error: cb.error } });
    setErr(null);
    if (!ca.url || !cb.url) return;
    const id = ++runId.current;
    setBusy(true); setResult(null);
    const read = async (k: "a" | "b", url: string) => {
      const n = new Node(url, { timeout: 20000 });
      try {
        const rt = await readRuntime(n, (step) => id === runId.current && setSides((s) => ({ ...s, [k]: { step } })));
        if (id === runId.current) setSides((s) => ({ ...s, [k]: { rt } }));
        return rt;
      } catch (e) {
        if (id === runId.current) setSides((s) => ({ ...s, [k]: { error: explain(e, url) } }));
        throw e;
      } finally { n.close(); }
    };
    try {
      const [ra, rb] = await Promise.all([read("a", ca.url), read("b", cb.url)]);
      const c = await compare(ra, rb).catch((e) => { throw new Error(`Could not decode these runtimes: ${(e as Error).message}`); });
      if (id === runId.current) setResult(c);
    } catch (e) {
      if (id === runId.current && /decode/.test((e as Error).message)) setErr((e as Error).message);
    } finally { if (id === runId.current) setBusy(false); }
  }
  useEffect(() => { run(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const side = (label: string, s: SideState, value: string, set: (v: string) => void) => (
    <div className="min-w-0 flex-1 space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Input value={value} onChange={(e) => set(e.target.value)} spellCheck={false} aria-invalid={!!s.error} className="font-mono text-sm" />
      <p className={cn("h-4 truncate text-xs", s.error ? "text-destructive" : "text-muted-foreground")}>
        {s.error ?? (s.rt ? `${s.rt.runtime_version.specName} ${s.rt.runtime_version.specVersion} · #${s.rt.head?.toLocaleString("en") ?? "?"}` : s.step ? `${s.step}…` : "")}
      </p>
    </div>
  );

  const r = result;
  const counts = r ? riskCounts(r.risks) : [];
  const severe = r ? r.risks.filter((x) => x.severity === "critical" || x.severity === "breaking").length : 0;
  return (
    <div className="space-y-6">
      <Panel>
        <div className="mb-4 flex flex-wrap gap-2">
          {PRESETS.map(([n, x, y]) => (
            <Button key={n} type="button" size="sm" variant={a === x && b === y ? "secondary" : "ghost"} disabled={busy} onClick={() => { setA(x); setB(y); run(x, y); }}>{n}</Button>
          ))}
        </div>
        <form className="flex flex-col gap-3 md:flex-row md:items-start" onSubmit={(e) => { e.preventDefault(); run(); }}>
          {side("Baseline", sides.a, a, setA)}
          <ArrowRight className="mt-8 hidden size-4 shrink-0 text-muted-foreground md:block" />
          {side("Candidate", sides.b, b, setB)}
          <Button type="submit" disabled={busy} className="md:mt-[22px]">{busy && <Loader2 className="animate-spin" />}{busy ? "Comparing" : "Compare"}</Button>
        </form>
        {err && <p className="mt-2 text-sm text-destructive">{err}</p>}
      </Panel>

      {r && (
        <>
          <Stats items={[
            { label: "Spec version", value: `${r.baseline.spec_version} → ${r.candidate.spec_version}` },
            { label: "Changes", value: r.changes.length.toLocaleString("en") },
            { label: "Risks", value: r.risks.length, tone: severe ? "bad" : r.risks.length ? "warn" : "good" },
            { label: "Pallets", value: `${r.baseline.pallets} → ${r.candidate.pallets}` },
          ]} />
          <Panel flush title="Risks" action={<div className="flex flex-wrap gap-1.5">{counts.map(({ s, n }) => <Status key={s} tone={SEVERITY[s].tone}>{n} {SEVERITY[s].label.toLowerCase()}</Status>)}</div>}>
            <RiskList risks={r.risks} />
          </Panel>
          <Panel flush title="Changes" action={<Button variant="outline" size="sm" onClick={() => download("compare.json", r)}><Download />JSON</Button>}>
            <ChangeTable changes={r.changes} />
          </Panel>
        </>
      )}
    </div>
  );
}
