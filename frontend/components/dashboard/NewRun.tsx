"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { dur } from "@/lib/runresult";

// Start a run: pick the candidate runtime (one of the repo's built runtimes, your file, or a URL),
// and it is upgraded onto a fresh Portaldot dev chain next to a clean baseline and tested.
type Runtime = { name: string; spec: number | null; sha256: string; bytes: number; changes: { before: string | null; after: string | null }[] };
type Mode = { kind: "preset"; name: string } | { kind: "file" } | { kind: "url" };
type Change = Runtime["changes"][number];

// `pub const ExistentialDeposit: Balance = 1 * DOLLARS;` -> ["ExistentialDeposit", "1 * DOLLARS"]
const CONST = /^pub const (\w+):[^=]+=\s*(.+?);?$/;
function ChangeLine({ c }: { c: Change }) {
  const a = c.before ? CONST.exec(c.before) : null, b = c.after ? CONST.exec(c.after) : null;
  if (a && b && a[1] === b[1]) {
    return <span className="rt-const"><b>{a[1]}</b><code className="del">{a[2]}</code><i>→</i><code className="add">{b[2]}</code></span>;
  }
  return <span>{c.before && <code className="del line">{c.before}</code>}{c.after && <code className="add line">{c.after}</code>}</span>;
}

export function NewRun() {
  const [runtimes, setRuntimes] = useState<Runtime[]>([]);
  const [workflows, setWorkflows] = useState<string[]>([]);
  const [mode, setMode] = useState<Mode>({ kind: "preset", name: "ed100x" });
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState("");
  const [label, setLabel] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [typical, setTypical] = useState<string | null>(null);
  const [active, setActive] = useState<number | null>(null);
  const drop = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/engine/runtimes.json").then((r) => r.json()).then(setRuntimes).catch(() => {});
    fetch("/engine/workflows.json").then((r) => r.json()).then((s: { workflow: { id: string } }[]) => setWorkflows(s.map((x) => x.workflow.id))).catch(() => {});
    // Median duration of the last finished runs, and how many are running now.
    fetch("/api/runs").then((r) => r.json()).then((d: { runs?: { status: string; conclusion: string | null; created_at: string; updated_at: string }[] }) => {
      const done = (d.runs ?? []).filter((r) => r.status === "completed" && r.conclusion === "success").slice(0, 9)
        .map((r) => Date.parse(r.updated_at) - Date.parse(r.created_at)).sort((a, b) => a - b);
      if (done.length) setTypical(dur(new Date(0).toISOString(), new Date(done[Math.floor(done.length / 2)]).toISOString()));
      setActive((d.runs ?? []).filter((r) => r.status !== "completed").length);
    }).catch(() => {});
  }, []);

  const clean = runtimes.find((r) => r.name === "clean");
  const picked = mode.kind === "preset" ? runtimes.find((r) => r.name === mode.name) : null;
  const ready = mode.kind === "preset" || (mode.kind === "file" ? !!file : /^https:\/\/\S+$/.test(url));

  async function start() {
    setBusy(true); setErr(null);
    try {
      let res: Response;
      if (mode.kind === "file" && file) {
        const fd = new FormData();
        fd.set("wasm", file); fd.set("label", label);
        res = await fetch("/api/runs", { method: "POST", body: fd });
      } else {
        res = await fetch("/api/runs", {
          method: "POST", headers: { "content-type": "application/json" },
          body: JSON.stringify(mode.kind === "url" ? { wasm_url: url.trim(), label } : { candidate: (mode as { name: string }).name, label }),
        });
      }
      const body = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
      if (!res.ok) throw new Error(body.error ?? `HTTP ${res.status}`);
      location.hash = `run/${body.id}`;
    } catch (e) { setErr((e as Error).message); setBusy(false); }
  }

  const steps = useMemo(() => [
    ["Chains", "2 fresh Portaldot dev chains"],
    ["Baseline", clean ? `clean · spec ${clean.spec} · ${clean.sha256.slice(0, 10)}` : "clean"],
    ["Candidate", picked ? `${picked.name} · spec ${picked.spec} · ${picked.sha256.slice(0, 10)}` : mode.kind === "file" ? (file?.name ?? "your file") : (url || "your URL")],
    ["State", "identities with reserved deposits on both"],
    ["Upgrade", "setCode · liveness · every account · supply"],
    ["Compare", "pallets, calls, events, storage, constants, errors · hazards"],
    ["Workflows", workflows.length ? `${workflows.length} on both chains` : "…"],
  ], [clean, picked, mode, file, url, workflows]);

  return (
    <div className="cx-page cx-new-run">
      <section className="cx-card">
        <header className="cx-card-h"><h2>Candidate runtime</h2><span>{runtimes.length ? `${runtimes.length} built from the public source` : ""}</span></header>
        <div className="rt-grid">
          {runtimes.map((r) => (
            <button key={r.name} type="button" className="rt" aria-pressed={mode.kind === "preset" && mode.name === r.name} onClick={() => setMode({ kind: "preset", name: r.name })}>
              <span className="rt-h"><b>{r.name}</b><code>spec {r.spec}</code></span>
              <span className="rt-diff">
                {r.changes.slice(0, 3).map((c, i) => <ChangeLine key={i} c={c} />)}
                {r.changes.length > 3 && <small>+{r.changes.length - 3} more lines</small>}
              </span>
              <span className="rt-f"><code>{r.sha256.slice(0, 16)}</code><small>{(r.bytes / 1e6).toFixed(2)} MB</small></span>
            </button>
          ))}
          <div className={`rt rt-own${mode.kind !== "preset" ? " on" : ""}`}>
            <span className="rt-h"><b>Your runtime</b><code>.compact.wasm</code></span>
            <div className="seg" role="tablist">
              <button type="button" role="tab" aria-selected={mode.kind === "file"} onClick={() => setMode({ kind: "file" })}>File</button>
              <button type="button" role="tab" aria-selected={mode.kind === "url"} onClick={() => setMode({ kind: "url" })}>URL</button>
            </div>
            {mode.kind === "url" ? (
              <input className="cx-input" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…/runtime.compact.wasm" spellCheck={false} autoFocus />
            ) : (
              <label className={`drop${file ? " has" : ""}`}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) { setFile(f); setMode({ kind: "file" }); } }}
                onClick={() => setMode({ kind: "file" })}>
                <input ref={drop} type="file" accept=".wasm" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) setFile(f); }} />
                {file ? <><b>{file.name}</b><small>{(file.size / 1e6).toFixed(2)} MB</small></> : <><b>Drop a runtime</b><small>or click · up to 4 MB</small></>}
              </label>
            )}
          </div>
        </div>
      </section>

      <section className="cx-card cx-launch">
        <header className="cx-card-h"><h2>Run</h2><span>{typical ? `typically ${typical}` : ""}{active ? ` · ${active} running` : ""}</span></header>
        <dl className="kv">{steps.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
        <div className="cx-launch-f">
          <input className="cx-input" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Label (optional): what changed" maxLength={200} />
          <button type="button" className="cx-btn" disabled={!ready || busy} onClick={start}>{busy ? "Starting…" : "Start run"}</button>
        </div>
        {err && <p className="cx-err">{err}</p>}
      </section>
    </div>
  );
}
