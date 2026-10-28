"use client";

import { useEffect, useState } from "react";
import { ExternalLink, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { walletStore, type Connected } from "@/lib/wallet";
import { verdictOf, file, potOf, dur, type Files, type Result, type Upgrade, type Comparison } from "@/lib/runresult";
import { RunDetail, type RunData } from "./Panels";
import { Proof } from "./Proof";
import { RiskList, ChangeTable, riskCounts, SEVERITY } from "./Findings";
import { LEVEL } from "./RunsList";
import { Panel, KV, Status, Mark, Mono, Empty, ErrorText, download, toneText } from "./kit";
import { cn } from "@/lib/utils";

// One run on GitHub's runners: its steps while it runs, then the verdict and the evidence,
// all read from the files the CLI wrote.
type Step = { name: string; status: string; conclusion: string | null; started_at: string | null; completed_at: string | null };
type Run = { id: string; candidate?: string; status: string; conclusion?: string | null; created_at?: string; updated_at?: string; html_url?: string; steps: Step[]; files: Files | null; error?: string };

const OURS: [RegExp, string][] = [
  [/^Check inputs/, "Inputs"], [/^Build the canary CLI/, "Build"], [/^Get the candidate runtime/, "Fetch runtime"],
  [/^Start two fresh/, "Start chains"], [/^Write existing state/, "Write state"], [/^Upgrade the baseline/, "Baseline upgrade"],
  [/^Upgrade the candidate/, "Candidate upgrade"], [/^Compare the two/, "Compare"], [/^Run the workflow suite/, "Workflows"],
  [/^Write the result/, "Result"], [/^Record the result/, "On-chain record"],
];
const STEP_EXIT: Record<string, keyof Result["exit"]> = { "Candidate upgrade": "upgrade", Compare: "compare", Workflows: "test" };

// A check step exits 1 when it found a problem (its job) and 2 when it could not decide.
function stepState(label: string, s: Step, r: Result | undefined): "ok" | "bad" | "run" | "wait" | "skip" {
  if (s.status === "in_progress") return "run";
  if (s.status !== "completed") return "wait";
  if (s.conclusion === "skipped") return "skip";
  const k = STEP_EXIT[label];
  const code = k && r ? r.exit[k] : null;
  if (code != null && code !== 0) return "bad";
  return s.conclusion === "success" ? "ok" : "bad";
}

export function RunView({ id }: { id: string }) {
  const [run, setRun] = useState<Run | null>(null);
  const [wallet, setWallet] = useState<Connected | null>(walletStore.get());
  const [, tick] = useState(0);
  useEffect(() => walletStore.subscribe(setWallet), []);

  useEffect(() => {
    let live = true, t: ReturnType<typeof setTimeout>;
    const load = async () => {
      try {
        const r = await fetch(`/api/runs/${id}`).then((x) => x.json());
        if (!live) return;
        setRun(r);
        if (r.status === "completed" && r.files) return;
      } catch (e) { if (live) setRun((x) => ({ ...(x ?? { id, steps: [], files: null, status: "pending" }), error: (e as Error).message })); }
      t = setTimeout(load, 4000);
    };
    load();
    const clock = setInterval(() => tick((n) => n + 1), 1000);
    return () => { live = false; clearTimeout(t); clearInterval(clock); };
  }, [id]);

  const f = run?.files ?? null;
  const result = file<Result>(f, "result.json");
  const up = file<Upgrade>(f, "upgrade.json");
  const cmp = file<Comparison>(f, "compare.json");
  const report = file<RunData>(f, "report.json");
  const v = f ? verdictOf(f) : null;
  const done = run?.status === "completed";
  const steps = (run?.steps ?? []).flatMap((s) => { const m = OURS.find(([re]) => re.test(s.name)); return m ? [{ label: m[1], s }] : []; });
  const changes = (cmp?.changes ?? []).filter((c) => c.path !== "runtime.spec_version");

  if (run?.error && !run.steps?.length) return <ErrorText>{run.error}</ErrorText>;
  const name = run?.candidate === "url" ? (result?.candidate.label ?? "Your runtime") : (run?.candidate ?? "…");
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            {done ? (v ? <Status tone={LEVEL[v.level].tone}>{LEVEL[v.level].label}</Status> : <Status tone="muted">Finished</Status>) : <Status tone="info">{run?.status === "in_progress" ? "Running" : "Queued"}</Status>}
            <span className="text-xs text-muted-foreground">
              {run?.created_at && new Date(run.created_at).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}
              {run?.created_at && ` · ${dur(run.created_at, done ? run.updated_at : null)}`}
            </span>
          </div>
          <h2 className="font-heading text-3xl font-medium tracking-tight">{name}</h2>
          {result?.candidate.label && run?.candidate !== "url" && <p className="text-sm text-muted-foreground">{result.candidate.label}</p>}
        </div>
        {run?.html_url && <Button variant="outline" size="sm" asChild><a href={run.html_url} target="_blank" rel="noreferrer"><ExternalLink />Log</a></Button>}
      </div>

      {v && (
        <div className={cn("rounded-xl border p-5", v.level === "pass" ? "border-success/30 bg-success/5" : v.level === "diff" ? "border-warning/30 bg-warning/5" : v.level === "error" ? "bg-muted/40" : "border-destructive/30 bg-destructive/5")}>
          <p className={cn("font-heading text-xl font-medium", toneText[LEVEL[v.level].tone])}>{v.title}</p>
          {v.detail && <p className="mt-1 text-sm break-words text-muted-foreground">{v.detail}</p>}
        </div>
      )}

      {f && done && <Proof id={id} files={f} wallet={wallet} />}

      <div className="grid items-start gap-6 lg:grid-cols-2">
        <Panel flush title="Steps" description={steps.length ? `${steps.filter(({ s }) => s.status === "completed").length} of ${steps.length}` : undefined}>
          {steps.length ? (
            <ul className="divide-y text-sm">
              {steps.map(({ label, s }) => {
                const st = stepState(label, s, result);
                return (
                  <li key={label} className="flex items-center gap-3 px-5 py-2.5">
                    <Mark state={st} />
                    <span className={cn("flex-1", (st === "wait" || st === "skip") && "text-muted-foreground")}>{label}</span>
                    <span className="font-mono text-xs text-muted-foreground tabular-nums">{st === "skip" ? "skipped" : s.started_at ? dur(s.started_at, s.completed_at) : ""}</span>
                  </li>
                );
              })}
            </ul>
          ) : <Empty>Waiting for a runner…</Empty>}
        </Panel>

        <Panel flush title="Upgrade" description={up ? `spec ${up.spec_before} → ${up.spec_after}` : undefined}>
          {up ? (
            <>
              <KV rows={[
                ["Liveness", <span key="l" className={up.liveness.startsWith("ok") ? "text-success" : "text-destructive"}>{up.liveness}</span>],
                ...(result?.panic ? [["Node", <Mono key="p" className="text-destructive">{result.panic}</Mono>] as [string, React.ReactNode]] : []),
                ...(up.state ? [
                  ["Supply", <span key="s" className={up.state.after.supply_conservation === "PASS" ? "text-success" : "text-destructive"}>{up.state.after.supply_conservation === "PASS" ? "Conserved" : "Broken"} · {potOf(up.state.after.total_issuance)}</span>],
                  ["Accounts", `${up.state.after.accounts} · ${up.state.changed_accounts} changed`],
                ] as [string, React.ReactNode][] : []),
                ["setCode", <Mono key="t">{up.tx_hash?.slice(0, 18)}…</Mono>],
              ]} />
              {up.state && up.state.changes.length > 0 && (
                <div className="border-t">
                  <Table>
                    <TableHeader><TableRow><TableHead className="pl-5">Account</TableHead><TableHead>Reserved</TableHead><TableHead className="pr-5 text-right">Change</TableHead></TableRow></TableHeader>
                    <TableBody>{up.state.changes.map((c) => (
                      <TableRow key={c.address}>
                        <TableCell className="pl-5 font-mono text-xs">{c.address.slice(0, 6)}…{c.address.slice(-4)}</TableCell>
                        <TableCell className="text-xs">{potOf(c.reserved_before)} → {potOf(c.reserved_after)}</TableCell>
                        <TableCell className="pr-5 text-right text-xs text-destructive">{potOf(c.total_delta)}</TableCell>
                      </TableRow>
                    ))}</TableBody>
                  </Table>
                </div>
              )}
            </>
          ) : <Empty>{done ? "Not run" : "Waiting…"}</Empty>}
        </Panel>
      </div>

      <Panel flush title="Risks" action={cmp?.risks ? <div className="flex flex-wrap gap-1.5">{riskCounts(cmp.risks).map(({ s, n }) => <Status key={s} tone={SEVERITY[s].tone}>{n} {SEVERITY[s].label.toLowerCase()}</Status>)}</div> : undefined}>
        {cmp ? (cmp.risks ? <RiskList risks={cmp.risks} /> : cmp.upgrade_hazards.length ? (
          <ul className="divide-y text-sm">{cmp.upgrade_hazards.map((h) => <li key={h.path} className="px-5 py-3"><Mono>{h.path}</Mono> <span className="text-muted-foreground">{h.reason}</span></li>)}</ul>
        ) : <Empty>No hazards.</Empty>) : <Empty>{done ? (result?.halted ? "Not run: the chain halted" : "Not run") : "Waiting…"}</Empty>}
      </Panel>

      {cmp && <Panel flush title="Changes" description={`${changes.length} against the clean runtime`}><ChangeTable changes={changes} /></Panel>}

      <Panel flush title="Workflows" description={report?.summary.statement}>
        {report ? <RunDetail id={`gh-${id}`} d={report} attest={false} /> : <Empty>{done ? (result?.halted ? "Not run: the chain halted" : "Not run") : "Waiting…"}</Empty>}
      </Panel>

      {f && (
        <Panel flush title="Files">
          <div className="grid gap-px sm:grid-cols-2 lg:grid-cols-3">
            {Object.keys(f).sort().map((n) => (
              <button key={n} type="button" onClick={() => download(n.replace(/^.*\//, ""), f[n].text)} className="flex items-center justify-between gap-2 px-5 py-2.5 text-left text-sm hover:bg-muted/50">
                <span className="flex min-w-0 items-center gap-2"><Download className="size-3.5 shrink-0 text-muted-foreground" /><span className="truncate font-mono text-xs">{n}</span></span>
                <span className="text-xs text-muted-foreground tabular-nums">{(f[n].text.length / 1024).toFixed(1)} kB</span>
              </button>
            ))}
          </div>
        </Panel>
      )}
    </div>
  );
}
