"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { verdictOf, ago, dur, type Files, type Level } from "@/lib/runresult";
import { RunDetail, verdict as recordedVerdict, RECORDED, type RunData } from "./Panels";
import { Panel, Status, Empty, ErrorText, type Tone } from "./kit";

// Runs started from this site (GitHub Actions), then the runs recorded with the CLI.
type Row = { id: string; candidate: string; status: string; conclusion: string | null; created_at: string; updated_at: string };
export const LEVEL: Record<Level, { label: string; tone: Tone }> = {
  pass: { label: "Pass", tone: "good" }, diff: { label: "Difference", tone: "warn" }, reg: { label: "Regression", tone: "bad" },
  crit: { label: "Critical", tone: "bad" }, error: { label: "Error", tone: "muted" },
};

export function RunsList() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [verdicts, setVerdicts] = useState<Record<string, { level: Level; title: string }>>({});
  const [rec, setRec] = useState<Record<string, RunData>>({});
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    let live = true, t: ReturnType<typeof setTimeout>;
    const load = async () => {
      try {
        const d = await fetch("/api/runs").then(async (r) => { const j = await r.json(); if (!r.ok) throw new Error(j.error ?? `HTTP ${r.status}`); return j; });
        if (!live) return;
        setRows(d.runs); setErr(null);
        for (const r of (d.runs as Row[]).filter((x) => x.status === "completed").slice(0, 15)) {
          fetch(`/api/runs/${r.id}`).then((x) => x.json()).then((x: { files: Files | null }) => {
            if (live && x.files) setVerdicts((m) => ({ ...m, [r.id]: verdictOf(x.files!) }));
          }).catch(() => {});
        }
        if ((d.runs as Row[]).some((x) => x.status !== "completed")) t = setTimeout(load, 8000);
      } catch (e) { if (live) setErr((e as Error).message); }
    };
    load();
    for (const r of RECORDED) fetch(`/reports/${r.id}/report.json`).then((x) => x.json()).then((d) => live && setRec((m) => ({ ...m, [r.id]: d }))).catch(() => {});
    return () => { live = false; clearTimeout(t); };
  }, []);

  return (
    <div className="space-y-6">
      <Panel flush title="Runs" description={rows ? `${rows.length} started here` : undefined} action={<Button size="sm" asChild><a href="#new"><Plus />New run</a></Button>}>
        {err && <div className="px-5 py-4"><ErrorText>{err}</ErrorText></div>}
        {rows && rows.length === 0 && <Empty>No runs yet.</Empty>}
        {!rows && !err && <Empty>Loading…</Empty>}
        {rows && rows.length > 0 && (
          <Table>
            <TableHeader><TableRow><TableHead className="pl-5">Candidate</TableHead><TableHead>Result</TableHead><TableHead className="hidden md:table-cell">Run</TableHead><TableHead>Started</TableHead><TableHead className="hidden pr-5 text-right sm:table-cell">Took</TableHead></TableRow></TableHeader>
            <TableBody>{rows.map((r) => {
              const v = verdicts[r.id];
              const running = r.status !== "completed";
              return (
                <TableRow key={r.id} className="cursor-pointer" onClick={() => { location.hash = `run/${r.id}`; }}>
                  <TableCell className="pl-5 font-medium"><a href={`#run/${r.id}`}>{r.candidate === "url" ? "your runtime" : r.candidate}</a></TableCell>
                  <TableCell className="max-w-80 whitespace-normal">
                    {running ? <Status tone="info">{r.status === "queued" ? "Queued" : "Running"}</Status>
                      : v ? <span className="flex flex-wrap items-center gap-2"><Status tone={LEVEL[v.level].tone}>{LEVEL[v.level].label}</Status><span className="text-xs text-muted-foreground">{v.title}</span></span>
                      : <span className="text-muted-foreground">…</span>}
                  </TableCell>
                  <TableCell className="hidden font-mono text-xs text-muted-foreground md:table-cell">{r.id}</TableCell>
                  <TableCell className="text-muted-foreground">{ago(r.created_at)}</TableCell>
                  <TableCell className="hidden pr-5 text-right text-muted-foreground tabular-nums sm:table-cell">{dur(r.created_at, running ? null : r.updated_at)}</TableCell>
                </TableRow>
              );
            })}</TableBody>
          </Table>
        )}
      </Panel>

      <Panel flush title="Recorded with the CLI">
        <Table>
          <TableHeader><TableRow><TableHead className="pl-5">Candidate</TableHead><TableHead>Result</TableHead><TableHead className="pr-5 text-right">Spec</TableHead></TableRow></TableHeader>
          <TableBody>{RECORDED.map((r) => {
            const d = rec[r.id];
            const v = d ? recordedVerdict(d.summary) : null;
            return [
              <TableRow key={r.id} className="cursor-pointer" onClick={() => setOpen(open === r.id ? null : r.id)} aria-expanded={open === r.id}>
                <TableCell className="pl-5 font-medium">{r.name}</TableCell>
                <TableCell>{v ? <Status tone={v.tone}>{v.text}</Status> : <span className="text-muted-foreground">…</span>}</TableCell>
                <TableCell className="pr-5 text-right text-muted-foreground">{d ? `${d.manifest.baseline.spec_version} → ${d.manifest.candidate.spec_version}` : ""}</TableCell>
              </TableRow>,
              open === r.id && d ? <TableRow key={`${r.id}-d`} className="hover:bg-transparent"><TableCell colSpan={3} className="p-0 whitespace-normal"><RunDetail id={r.id} d={d} /></TableCell></TableRow> : null,
            ];
          })}</TableBody>
        </Table>
      </Panel>
    </div>
  );
}
