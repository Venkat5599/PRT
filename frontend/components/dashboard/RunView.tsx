"use client";

import { useEffect, useMemo, useState } from "react";
import { walletStore, type Connected } from "@/lib/wallet";
import { verdictOf, file, potOf, dur, type Files, type Result, type Upgrade, type Comparison } from "@/lib/runresult";
import { RunDetail, download, type RunData } from "./Panels";
import { Proof } from "./Proof";

// One run on GitHub's runners: its steps while it runs, then the verdict and the evidence behind
// it (the upgrade, the runtime diff, every workflow), all read from the files the CLI wrote.
type Step = { name: string; status: string; conclusion: string | null; started_at: string | null; completed_at: string | null };
type Run = { id: string; candidate?: string; status: string; conclusion?: string | null; created_at?: string; updated_at?: string; html_url?: string; steps: Step[]; files: Files | null; error?: string };

const OURS = /^(Check inputs|Build the canary CLI|Get the candidate runtime|Start two fresh|Write existing state|Upgrade the|Compare the two|Run the workflow suite|Write the result)/;
const STEP_EXIT: Record<string, keyof Result["exit"]> = { "Upgrade the candidate (liveness, accounts, supply)": "upgrade", "Compare the two runtimes": "compare", "Run the workflow suite on both": "test" };
const LEVEL_LABEL = { pass: "Pass", diff: "Difference", reg: "Regression", crit: "Critical", error: "Error" };

// A check step exits 1 when it FOUND a problem (that is its job) and 2 when it could not decide.
function stepState(s: Step, r: Result | undefined): "done" | "found" | "fail" | "run" | "wait" | "skip" {
  if (s.status === "in_progress") return "run";
  if (s.status !== "completed") return "wait";
  if (s.conclusion === "skipped") return "skip";
  const k = STEP_EXIT[s.name];
  const code = k && r ? r.exit[k] : null;
  if (code === 1) return "found";
  if (code != null && code !== 0) return "fail";
  return s.conclusion === "success" ? "done" : "fail";
}
// "T::Balance = 100000000000000 (0x00407a…)" -> "T::Balance = 100000000000000"
const plain = (v: string | null) => (v ?? "").replace(/\s*\(0x[0-9a-f]+\)$/i, "");

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

  const steps = (run?.steps ?? []).filter((s) => OURS.test(s.name));
  const done = run?.status === "completed";
  const [showAll, setShowAll] = useState(false);
  const changes = useMemo(() => (cmp?.changes ?? []).filter((c) => c.path !== "System.constant.Version"), [cmp]);

  if (run?.error && !run.steps?.length) return <div className="cx-page"><p className="cx-err">{run.error}</p></div>;
  return (
    <div className="cx-page run">
      <section className="cx-card run-head">
        <div className="run-title">
          <span className={`pill ${done ? (v?.level ?? "error") : "live"}`}>{done ? (v ? LEVEL_LABEL[v.level] : "Finished") : run?.status === "in_progress" ? "Running" : "Queued"}</span>
          <h2>{run?.candidate === "url" ? (result?.candidate.label ?? "Your runtime") : (run?.candidate ?? "…")}</h2>
          {result?.candidate.label && run?.candidate !== "url" && <span className="muted">{result.candidate.label}</span>}
        </div>
        <dl className="kv row">
          <div><dt>Started</dt><dd>{run?.created_at ? new Date(run.created_at).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" }) : "…"}</dd></div>
          <div><dt>Duration</dt><dd>{run?.created_at ? dur(run.created_at, done ? run.updated_at : null) : "…"}</dd></div>
          <div><dt>Candidate sha256</dt><dd><code>{result?.candidate.sha256?.slice(0, 16) ?? "…"}</code></dd></div>
          <div><dt>Log</dt><dd>{run?.html_url ? <a href={run.html_url} target="_blank" rel="noreferrer">GitHub Actions ↗</a> : "…"}</dd></div>
        </dl>
      </section>

      {v && (
        <section className={`run-verdict ${v.level}`}>
          <b>{v.title}</b>
          {v.detail && <span>{v.detail}</span>}
        </section>
      )}

      {f && done && <Proof id={id} files={f} wallet={wallet} />}

      <div className="run-grid">
        <section className="cx-card">
          <header className="cx-card-h"><h2>Steps</h2><span>{steps.filter((s) => s.status === "completed").length}/{steps.length || 8}</span></header>
          <ol className="run-steps">
            {(steps.length ? steps : [{ name: "Waiting for a runner", status: "queued", conclusion: null, started_at: null, completed_at: null }]).map((s) => {
              const st = stepState(s, result);
              return (
                <li key={s.name} className={st}>
                  <i aria-hidden="true">{st === "done" ? "✓" : st === "found" ? "!" : st === "fail" ? "✕" : st === "skip" ? "–" : ""}</i>
                  <span>{s.name}</span>
                  <small>{st === "skip" ? "skipped" : s.started_at ? dur(s.started_at, s.completed_at) : ""}</small>
                </li>
              );
            })}
          </ol>
        </section>

        <section className="cx-card">
          <header className="cx-card-h"><h2>Upgrade</h2><span>{up ? `spec ${up.spec_before} → ${up.spec_after}` : ""}</span></header>
          {up ? (
            <>
              <dl className="kv">
                <div><dt>Liveness</dt><dd className={up.liveness.startsWith("ok") ? "ok" : "bad"}>{up.liveness}</dd></div>
                {result?.panic && <div><dt>Node</dt><dd className="bad"><code>{result.panic}</code></dd></div>}
                {up.state && <>
                  <div><dt>Supply</dt><dd className={up.state.after.supply_conservation === "PASS" ? "ok" : "bad"}>{up.state.after.supply_conservation === "PASS" ? "conserved" : "broken"} · {potOf(up.state.after.total_issuance)} issued</dd></div>
                  <div><dt>Accounts</dt><dd>{up.state.after.accounts} · {up.state.changed_accounts} changed by the migration</dd></div>
                </>}
                <div><dt>setCode</dt><dd><code>{up.tx_hash?.slice(0, 18)}…</code></dd></div>
              </dl>
              {up.state && up.state.changes.length > 0 && (
                <table className="cx-table"><thead><tr><th>Account</th><th>Reserved before</th><th>After</th><th>Change</th></tr></thead>
                  <tbody>{up.state.changes.map((c) => <tr key={c.address}><td><code>{c.address.slice(0, 8)}…{c.address.slice(-6)}</code></td><td>{potOf(c.reserved_before)}</td><td>{potOf(c.reserved_after)}</td><td className="bad">{potOf(c.total_delta)}</td></tr>)}</tbody></table>
              )}
            </>
          ) : <p className="muted pad">{done ? "not run" : "waiting for the upgrade step"}</p>}
        </section>
      </div>

      <section className="cx-card">
        <header className="cx-card-h"><h2>Runtime diff</h2><span>{cmp ? `${changes.length} change${changes.length === 1 ? "" : "s"} · ${cmp.upgrade_hazards.length} hazard${cmp.upgrade_hazards.length === 1 ? "" : "s"}${cmp.unversioned_change ? " · changed without a version bump" : ""}` : ""}</span></header>
        {cmp ? (
          <>
            {cmp.upgrade_hazards.map((h) => <p key={h.path} className="cx-err"><code>{h.path}</code> {h.reason}</p>)}
            <table className="cx-table">
              <thead><tr><th /><th>Path</th><th>Baseline</th><th>Candidate</th></tr></thead>
              <tbody>{(showAll ? changes : changes.slice(0, 12)).map((c) => (
                <tr key={c.path}><td><span className={`kind ${c.kind}`}>{c.kind === "added" ? "+" : c.kind === "removed" ? "−" : "~"}</span></td><td><code>{c.path}</code></td><td className="val" title={c.baseline ?? ""}>{plain(c.baseline)}</td><td className="val" title={c.candidate ?? ""}>{plain(c.candidate)}</td></tr>
              ))}</tbody>
            </table>
            {changes.length > 12 && <button type="button" className="cx-link" onClick={() => setShowAll((s) => !s)}>{showAll ? "Show fewer" : `Show all ${changes.length}`}</button>}
          </>
        ) : <p className="muted pad">{done ? (result?.halted ? "not run: the candidate chain halted" : "not run") : "waiting for the compare step"}</p>}
      </section>

      <section className="cx-card">
        <header className="cx-card-h"><h2>Workflows</h2><span>{report ? report.summary.statement : ""}</span></header>
        {report ? (
          <RunDetail id={`gh-${id}`} d={report} />
        ) : <p className="muted pad">{done ? (result?.halted ? "not run: the candidate chain halted" : "not run") : "waiting for the workflow step"}</p>}
      </section>

      {f && (
        <section className="cx-card">
          <header className="cx-card-h"><h2>Files</h2><span>written by the CLI on the runner</span></header>
          <ul className="files">
            {Object.keys(f).sort().map((n) => <li key={n}><button type="button" className="cx-link" onClick={() => download(n.replace(/^.*\//, ""), f[n].text)}>{n}</button><small>{(f[n].text.length / 1024).toFixed(1)} kB</small></li>)}
          </ul>
        </section>
      )}
    </div>
  );
}
