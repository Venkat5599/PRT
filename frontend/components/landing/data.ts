"use client";

// Real data for the landing page's animated cards. Each loader runs once per page and is shared:
// - liveCompare: mainnet vs the V3 testnet, read from both nodes and diffed by the wasm engine
// - latestRun:   the newest finished dashboard run (GitHub Actions), or the recorded ed100x run
// - issuance:    mainnet's TotalIssuance at each new head
import { Node, readRuntime, compare, type Comparison, type Runtime } from "@/lib/canary";
import type { Files, Result, Upgrade, Comparison as RunComparison } from "@/lib/runresult";
import { verdictOf, file, type Verdict } from "@/lib/runresult";

export const MAINNET = "wss://mainnet.portaldot.io";
export const V3 = "wss://test-node-v3.portaldot.dev";

const once = <T,>(f: () => Promise<T>) => { let p: Promise<T> | null = null; return () => (p ??= f().catch((e) => { p = null; throw e; })); };

const runtimeOf = (url: string) => once(async () => { const n = new Node(url); try { return await readRuntime(n); } finally { n.close(); } });
export const mainnetRuntime = runtimeOf(MAINNET);
export const v3Runtime = runtimeOf(V3);

export const liveCompare = once(async (): Promise<Comparison> => compare(await mainnetRuntime(), await v3Runtime()));

export type Kind = "added" | "removed" | "modified";
export const CATEGORIES = ["call", "event", "storage", "constant"] as const;
/** Changes per item category and kind, e.g. calls: {added 120, removed 3, modified 40}. */
export function byCategory(c: Comparison) {
  const out = Object.fromEntries(CATEGORIES.map((k) => [k, { added: 0, removed: 0, modified: 0 }])) as Record<(typeof CATEGORIES)[number], Record<Kind, number>>;
  for (const ch of c.changes) {
    const kind = ch.path.split(".")[1] as (typeof CATEGORIES)[number];
    if (out[kind]) out[kind][ch.kind]++;
  }
  return out;
}

export const specOf = (r: Runtime) => {
  const rv = r.runtime_version as unknown as { specName: string; specVersion: number };
  return { name: rv.specName, version: rv.specVersion, metadata: parseInt(r.metadata.slice(10, 12), 16) };
};

export type LatestRun = { id: string; source: "site" | "recorded"; candidate: string; verdict: Verdict; result?: Result; upgrade?: Upgrade; compare?: RunComparison; summary?: { workflows: number; regression: number; difference: number; pass: number; statement: string } };
export const latestRun = once(async (): Promise<LatestRun> => {
  try {
    const list = await fetch("/api/runs").then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))));
    for (const row of (list.runs ?? []).filter((r: { status: string; conclusion: string }) => r.status === "completed" && r.conclusion === "success").slice(0, 5)) {
      const d = await fetch(`/api/runs/${row.id}`).then((r) => r.json());
      const f: Files | null = d.files;
      if (!f?.["result.json"] || !f["upgrade.json"]) continue;
      const rep = file<{ summary: LatestRun["summary"] }>(f, "report.json");
      return { id: row.id, source: "site", candidate: row.candidate, verdict: verdictOf(f), result: file<Result>(f, "result.json"), upgrade: file<Upgrade>(f, "upgrade.json"), compare: file<RunComparison>(f, "compare.json"), summary: rep?.summary };
    }
  } catch { /* runs are not enabled on this deployment: use the recorded run */ }
  const rep = await fetch("/reports/upgrade-ed100x/report.json").then((r) => r.json());
  const v: Verdict = rep.summary.regression ? { level: "reg", title: `${rep.summary.regression} workflow regression${rep.summary.regression > 1 ? "s" : ""}`, detail: rep.summary.statement } : { level: "pass", title: "No regressions", detail: rep.summary.statement };
  return { id: "upgrade-ed100x", source: "recorded", candidate: "ed100x", verdict: v, summary: rep.summary };
});

// twox128("Balances") ++ twox128("TotalIssuance")
const TOTAL_ISSUANCE = "0xc2261276cc9d1f8598ea4b6a74b15c2f57c875e4cff74148e4628f264b974c80";
const le = (hex: string) => { const b = hex.slice(2); let v = 0n; for (let i = b.length - 2; i >= 0; i -= 2) v = (v << 8n) | BigInt(parseInt(b.slice(i, i + 2), 16)); return v; };

/** Calls `on` with mainnet's head and TotalIssuance each time a new block appears. */
export function watchIssuance(on: (r: { block: number; issuance: bigint; at: number }) => void) {
  let stopped = false, last = -1;
  const node = new Node(MAINNET, { timeout: 15000 });
  const tick = async () => {
    try {
      const h = await node.call<{ number: string }>("chain_getHeader");
      const block = parseInt(h.number, 16);
      if (block !== last) {
        const hash = await node.call<string>("chain_getBlockHash", [block]);
        const raw = await node.call<string | null>("state_getStorage", [TOTAL_ISSUANCE, hash]);
        last = block;
        if (!stopped && raw) on({ block, issuance: le(raw), at: Date.now() });
      }
    } catch { /* keep polling; a dropped socket reconnects on the next call */ }
    if (!stopped) setTimeout(tick, 3000);
  };
  tick();
  return () => { stopped = true; node.close(); };
}
