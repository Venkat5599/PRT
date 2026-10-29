"use client";

import { useEffect, useMemo, useState } from "react";
import { Upload, Loader2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { dur } from "@/lib/runresult";
import { Panel, KV, ErrorText } from "./kit";
import { cn } from "@/lib/utils";

// Pick a candidate runtime (one built from the public source, your file, or a URL); it is
// upgraded onto a fresh Portaldot dev chain next to a clean baseline and tested.
type Runtime = { name: string; spec: number | null; sha256: string; bytes: number; changes: { before: string | null; after: string | null }[] };
type Mode = { kind: "preset"; name: string } | { kind: "file" } | { kind: "url" };
type Change = Runtime["changes"][number];

// `pub const ExistentialDeposit: Balance = 1 * DOLLARS;` -> ["ExistentialDeposit", "1 * DOLLARS"]
const CONST = /^pub const (\w+):[^=]+=\s*(.+?);?$/;
function ChangeLine({ c }: { c: Change }) {
  const a = c.before ? CONST.exec(c.before) : null, b = c.after ? CONST.exec(c.after) : null;
  if (a && b && a[1] === b[1]) {
    return (
      <div className="text-xs">
        <div className="font-mono font-medium break-all">{a[1]}</div>
        <div className="mt-1 flex flex-wrap items-center gap-1.5 font-mono">
          <span className="rounded bg-destructive/10 px-1.5 py-0.5 text-destructive">{a[2]}</span>→<span className="rounded bg-success/10 px-1.5 py-0.5 text-success">{b[2]}</span>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-0.5 font-mono text-[11px]">
      {c.before && <div className="truncate rounded bg-destructive/10 px-1.5 py-0.5 text-destructive">− {c.before}</div>}
      {c.after && <div className="truncate rounded bg-success/10 px-1.5 py-0.5 text-success">+ {c.after}</div>}
    </div>
  );
}

export function NewRun() {
  const [runtimes, setRuntimes] = useState<Runtime[]>([]);
  const [workflows, setWorkflows] = useState<string[]>([]);
  const [mode, setMode] = useState<Mode>({ kind: "preset", name: "ed100x" });
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState("");
  const [label, setLabel] = useState("");
  const [state, setState] = useState<"mainnet" | "dev">("mainnet");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [typical, setTypical] = useState<string | null>(null);
  const [active, setActive] = useState<number | null>(null);

  useEffect(() => {
    fetch("/engine/runtimes.json").then((r) => r.json()).then(setRuntimes).catch(() => {});
    fetch("/engine/workflows.json").then((r) => r.json()).then((s: { workflow: { id: string } }[]) => setWorkflows(s.map((x) => x.workflow.id))).catch(() => {});
    fetch("/api/runs").then((r) => r.json()).then((d: { runs?: { status: string; conclusion: string | null; created_at: string; updated_at: string }[] }) => {
      const done = (d.runs ?? []).filter((r) => r.status === "completed" && r.conclusion === "success").slice(0, 9)
        .map((r) => Date.parse(r.updated_at) - Date.parse(r.created_at)).sort((a, b) => a - b);
      if (done.length) setTypical(dur(new Date(0).toISOString(), new Date(done[Math.floor(done.length / 2)]).toISOString()));
      setActive((d.runs ?? []).filter((r) => r.status !== "completed").length);
    }).catch(() => {});
  }, []);

  const clean = runtimes.find((r) => r.name === "clean");
  const picked = mode.kind === "preset" ? runtimes.find((r) => r.name === mode.name) : null;
  const urlOk = /^https:\/\/\S+$/.test(url.trim());
  const ready = mode.kind === "preset" || (mode.kind === "file" ? !!file : urlOk);

  function pickFile(f: File | undefined) {
    if (!f) return;
    if (!/\.wasm$/i.test(f.name)) { setErr("Choose a .wasm runtime"); return; }
    if (f.size > 4 * 1024 * 1024) { setErr(`${f.name} is ${(f.size / 1e6).toFixed(1)} MB; the limit is 4 MB`); return; }
    setErr(null); setFile(f); setMode({ kind: "file" });
  }

  async function start() {
    setBusy(true); setErr(null);
    try {
      let res: Response;
      if (mode.kind === "file" && file) {
        const fd = new FormData();
        fd.set("wasm", file); fd.set("label", label); fd.set("state", state);
        res = await fetch("/api/runs", { method: "POST", body: fd });
      } else {
        res = await fetch("/api/runs", {
          method: "POST", headers: { "content-type": "application/json" },
          body: JSON.stringify(mode.kind === "url" ? { wasm_url: url.trim(), label, state } : { candidate: (mode as { name: string }).name, label, state }),
        });
      }
      const body = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
      if (!res.ok) throw new Error(body.error ?? `HTTP ${res.status}`);
      location.hash = `run/${body.id}`;
    } catch (e) { setErr((e as Error).message); setBusy(false); }
  }

  const steps = useMemo<[string, string][]>(() => [
    ["State", state === "mainnet" ? "mainnet, latest finalized block" : "fresh dev chain + deposits"],
    ["Baseline", clean ? `clean · spec ${clean.spec}` : "clean"],
    ["Candidate", picked ? `${picked.name} · spec ${picked.spec}` : mode.kind === "file" ? (file?.name ?? "your file") : (url.trim() || "your URL")],
    ["Checks", "upgrade · liveness · supply · diff · risks"],
    ["Workflows", workflows.length ? `${workflows.length}, on both chains` : "…"],
    ["Proof", "recorded on the V3 testnet"],
  ], [clean, picked, mode, file, url, workflows, state]);

  const card = "flex min-w-0 flex-col gap-3 rounded-xl border bg-card p-4 text-left transition-colors hover:border-foreground/20";
  const on = "border-primary ring-1 ring-primary hover:border-primary";
  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {runtimes.map((r) => (
          <button key={r.name} type="button" className={cn(card, mode.kind === "preset" && mode.name === r.name && on)} aria-pressed={mode.kind === "preset" && mode.name === r.name} onClick={() => setMode({ kind: "preset", name: r.name })}>
            <div className="flex items-baseline justify-between gap-2">
              <span className="font-heading font-medium">{r.name}</span>
              <span className="font-mono text-xs text-muted-foreground">spec {r.spec}</span>
            </div>
            <div className="min-h-10 space-y-1.5">
              {r.changes.slice(0, 2).map((c, i) => <ChangeLine key={i} c={c} />)}
              {r.changes.length > 2 && <div className="text-xs text-muted-foreground">+{r.changes.length - 2} more lines</div>}
              {!r.changes.length && <div className="text-xs text-muted-foreground">no source change</div>}
            </div>
            <div className="mt-auto flex justify-between border-t pt-2.5 font-mono text-[11px] text-muted-foreground">
              <span>{r.sha256.slice(0, 12)}</span><span>{(r.bytes / 1e6).toFixed(2)} MB</span>
            </div>
          </button>
        ))}
        <div className={cn(card, "hover:border-border", mode.kind !== "preset" && on)}>
          <div className="flex items-center justify-between gap-2">
            <span className="font-heading font-medium">Your runtime</span>
            <Tabs value={mode.kind === "url" ? "url" : "file"} onValueChange={(x) => setMode({ kind: x as "file" | "url" })}>
              <TabsList className="h-8"><TabsTrigger value="file" className="text-xs">File</TabsTrigger><TabsTrigger value="url" className="text-xs">URL</TabsTrigger></TabsList>
            </Tabs>
          </div>
          {mode.kind === "url" ? (
            <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…/runtime.compact.wasm" spellCheck={false} aria-invalid={!!url && !urlOk} className="font-mono text-xs" />
          ) : (
            <label className={cn("flex min-h-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed p-3 text-center", file && "border-primary bg-primary/5")}
              onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); pickFile(e.dataTransfer.files[0]); }} onClick={() => setMode({ kind: "file" })}>
              <input type="file" accept=".wasm" hidden onChange={(e) => pickFile(e.target.files?.[0])} />
              <Upload className="size-4 text-muted-foreground" />
              <span className="text-sm font-medium break-all">{file ? file.name : "Drop a .wasm"}</span>
              <span className="text-xs text-muted-foreground">{file ? `${(file.size / 1e6).toFixed(2)} MB` : "up to 4 MB"}</span>
            </label>
          )}
        </div>
      </div>

      <Panel flush title="Run" description={[typical && `typically ${typical}`, active ? `${active} running` : null].filter(Boolean).join(" · ") || undefined} className="lg:sticky lg:top-20">
        <div className="border-b px-5 py-3">
          <Tabs value={state} onValueChange={(x) => setState(x as "mainnet" | "dev")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="mainnet">Mainnet state</TabsTrigger>
              <TabsTrigger value="dev">Fresh chain</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <KV rows={steps} />
        <div className="space-y-3 border-t px-5 py-4">
          <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Label (optional)" maxLength={200} />
          <Button className="w-full" size="lg" disabled={!ready || busy} onClick={start}>{busy ? <Loader2 className="animate-spin" /> : <Play />}{busy ? "Starting" : "Start run"}</Button>
          {err && <ErrorText>{err}</ErrorText>}
        </div>
      </Panel>
    </div>
  );
}
