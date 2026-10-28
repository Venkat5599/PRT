"use client";

import { useEffect, useState } from "react";
import { verdictOf, ago, dur, type Files, type Level } from "@/lib/runresult";
import { RunDetail, verdict as recordedVerdict, type RunData } from "./Panels";

// Every run started from this site (newest first, read from GitHub Actions), then the four runs
// recorded with the CLI in a VM before the site could start runs.
type Row = { id: string; candidate: string; status: string; conclusion: string | null; created_at: string; updated_at: string; html_url: string };
const LEVEL_LABEL: Record<Level, string> = { pass: "Pass", diff: "Difference", reg: "Regression", crit: "Critical", error: "Error" };
const RECORDED = [
  { id: "upgrade-halve-reserved", name: "halve-reserved", when: "recorded in a VM" },
  { id: "upgrade-ed100x", name: "ed100x", when: "recorded in a VM" },
  { id: "upgrade-fee10x", name: "fee10x", when: "recorded in a VM" },
  { id: "self-compare", name: "control (mainnet × 2)", when: "recorded" },
];

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
        // Verdicts of finished runs come from their result files (cached by the API once finished).
        for (const r of (d.runs as Row[]).filter((x) => x.status === "completed").slice(0, 12)) {
          fetch(`/api/runs/${r.id}`).then((x) => x.json()).then((x: { files: Files | null }) => {
            if (live && x.files) { const v = verdictOf(x.files); setVerdicts((m) => ({ ...m, [r.id]: v })); }
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
    <div className="cx-page">
      <section className="cx-card">
        <header className="cx-card-h"><h2>Runs</h2><span>{rows ? `${rows.length} started from this site` : ""}</span><a className="cx-btn sm" href="#new">New run</a></header>
        {err && <p className="cx-err pad">{err}</p>}
        {rows && rows.length === 0 && <p className="muted pad">No runs yet. <a href="#new">Start one</a>.</p>}
        {rows && rows.length > 0 && (
          <table className="cx-table rows">
            <thead><tr><th>Run</th><th>Candidate</th><th>Result</th><th>Started</th><th>Duration</th></tr></thead>
            <tbody>{rows.map((r) => {
              const v = verdicts[r.id];
              const running = r.status !== "completed";
              return (
                <tr key={r.id} onClick={() => { location.hash = `run/${r.id}`; }}>
                  <td><a href={`#run/${r.id}`}><code>{r.id}</code></a></td>
                  <td>{r.candidate === "url" ? "your runtime" : r.candidate}</td>
                  <td>{running ? <span className="pill live">{r.status === "queued" ? "Queued" : "Running"}</span> : v ? <span className={`pill ${v.level}`} title={v.title}>{LEVEL_LABEL[v.level]}</span> : <span className="muted">…</span>}{v && <small className="why">{v.title}</small>}</td>
                  <td>{ago(r.created_at)}</td>
                  <td>{dur(r.created_at, running ? null : r.updated_at)}</td>
                </tr>
              );
            })}</tbody>
          </table>
        )}
        {!rows && !err && <p className="muted pad">Loading…</p>}
      </section>

      <section className="cx-card">
        <header className="cx-card-h"><h2>Recorded with the CLI</h2><span>reports in this repository</span></header>
        <table className="cx-table rows">
          <thead><tr><th>Run</th><th>Candidate</th><th>Result</th><th>Spec</th><th /></tr></thead>
          <tbody>{RECORDED.map((r) => {
            const d = rec[r.id];
            const v = d ? recordedVerdict(d.summary) : null;
            const lvl = v ? ({ reg: "reg", diff: "diff", same: "pass", base: "error" } as Record<string, Level>)[v.cls] ?? "error" : null;
            return [
              <tr key={r.id} onClick={() => setOpen(open === r.id ? null : r.id)} aria-expanded={open === r.id}>
                <td><code>{r.id}</code></td>
                <td>{r.name}</td>
                <td>{v && lvl ? <><span className={`pill ${lvl}`}>{LEVEL_LABEL[lvl]}</span><small className="why">{v.text}</small></> : <span className="muted">…</span>}</td>
                <td>{d ? `${d.manifest.baseline.spec_version} → ${d.manifest.candidate.spec_version}` : ""}</td>
                <td className="chev">{open === r.id ? "▾" : "▸"}</td>
              </tr>,
              open === r.id && d ? <tr key={`${r.id}-d`} className="detail"><td colSpan={5}><RunDetail id={r.id} d={d} /></td></tr> : null,
            ];
          })}</tbody>
        </table>
      </section>
    </div>
  );
}
