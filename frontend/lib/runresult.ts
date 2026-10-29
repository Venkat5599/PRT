// Reading a finished run: its files (from the canary-run artifact) and the verdict they add up to.
// Every value here comes from a file the CLI wrote on the runner; nothing is inferred elsewhere.

export type FileEntry = { text: string; json?: unknown };
export type Files = Record<string, FileEntry>;

export type Result = {
  run_id: string;
  candidate: { name: string; url: string | null; label: string | null; sha256: string | null; bytes: number | null };
  baseline: { name: string; sha256: string | null };
  exit: { upgrade: number | null; compare: number | null; test: number | null };
  halted: boolean;
  /** Starting state: a fresh dev chain, or mainnet forked at `block` (backend/driver/src/fork.ts). */
  state?: { kind: "dev" } | { kind: "mainnet"; block: number; hash: string; accounts: number; spec: string; taken_unix: number };
  panic: string | null;
  files: string[];
  /** sha256 of every other file in the run; the on-chain record anchors result.json, so it covers them all */
  sha256?: Record<string, string | null>;
};

/** The CLI's `canary attest` record for a run (attest.rs), signed on the V3 testnet. */
export type RunAttestation = {
  network: string; chain: string | null; genesis_hash: string | null; payload: string; payload_hex: string;
  report_sha256: string; signer: string; tx_hash: string; block_hash: string; block_number: number | null;
};

export async function sha256Hex(text: string) {
  const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** The remark `canary attest` writes for a run directory with result.json (same format as attest.rs). */
export async function runPayload(resultText: string) {
  const r = JSON.parse(resultText) as Result;
  const code = (v: number | null) => (v == null ? "-" : String(v));
  const sha = await sha256Hex(resultText);
  return { sha, payload: `canary-run/1 ${sha} ${r.run_id ?? "-"} u=${code(r.exit.upgrade)} c=${code(r.exit.compare)} t=${code(r.exit.test)} h=${r.halted ? 1 : 0}` };
}

export const V3_WS = "wss://test-node-v3.portaldot.dev";
export const explorerBlock = (blockHash: string, ws = V3_WS) => `https://polkadot.js.org/apps/?rpc=${encodeURIComponent(ws)}#/explorer/query/${blockHash}`;
export type Snap = { block_number: number; accounts: number; sum_free: string; sum_reserved: string; total_issuance: string; delta: string; supply_conservation: string };
export type Upgrade = {
  spec_before: number | null; spec_after: number | null; tx_hash: string | null; liveness: string; verdict: string; wasm_sha256: string;
  state: null | { before: Snap; after: Snap; changed_accounts: number; reserved_changed: number; verdict: string; severity: string | null; rationale: string;
    changes: { address: string; free_before: string; free_after: string; reserved_before: string; reserved_after: string; total_delta: string }[] };
};
export type Comparison = {
  baseline: { spec_name: string | null; spec_version: number | null; pallets: number };
  candidate: { spec_name: string | null; spec_version: number | null; pallets: number };
  changes: { kind: "added" | "removed" | "modified"; path: string; baseline: string | null; candidate: string | null }[];
  metadata_identical: boolean; unversioned_change: boolean; upgrade_hazards: { path: string; reason: string }[];
  /** absent in runs made before the risk rules existed */
  risks?: import("./canary").Risk[];
};
export type TestSummary = { workflows: number; pass: number; difference: number; inconclusive: number; regression: number; statement: string };

export const file = <T,>(f: Files | null | undefined, name: string) => (f?.[name]?.json as T | undefined) ?? undefined;

export type Level = "pass" | "diff" | "reg" | "crit" | "error";
export type Verdict = { level: Level; title: string; detail: string | null };

/** The run's verdict, worst finding first: halt, broken migration, regressions, hazards, differences. */
export function verdictOf(f: Files): Verdict {
  const r = file<Result>(f, "result.json");
  const up = file<Upgrade>(f, "upgrade.json");
  const cmp = file<Comparison>(f, "compare.json");
  const rep = file<{ summary: TestSummary }>(f, "report.json");
  if (!r) return { level: "error", title: "No result", detail: "the run stopped before it wrote result.json" };
  if (r.halted) return { level: "crit", title: "Chain halts after the upgrade", detail: [up?.liveness, r.panic].filter(Boolean).join(" · ") };
  if (!up || r.exit.upgrade === 2) return { level: "error", title: "Runtime not applied", detail: f["upgrade.txt"]?.text.trim().split("\n").pop() ?? "setCode did not take effect" };
  if (up.state?.verdict === "REGRESSION") return { level: "crit", title: "Migration breaks balances", detail: up.state.rationale };
  const s = rep?.summary;
  const hz = cmp?.upgrade_hazards.length ?? 0;
  if (s?.regression) return { level: "reg", title: `${s.regression} workflow regression${s.regression > 1 ? "s" : ""}`, detail: s.statement };
  if (hz) return { level: "reg", title: `${hz} upgrade hazard${hz > 1 ? "s" : ""}`, detail: cmp!.upgrade_hazards.map((h) => h.path).join(", ") };
  const severe = (cmp?.risks ?? []).filter((x) => x.severity === "critical" || x.severity === "breaking");
  if (severe.length) return { level: "reg", title: `${severe.length} breaking change${severe.length > 1 ? "s" : ""}`, detail: severe.map((x) => x.title).join(" · ") };
  if (s?.inconclusive) return { level: "diff", title: `${s.inconclusive} workflow${s.inconclusive > 1 ? "s" : ""} inconclusive`, detail: s.statement };
  if (s?.difference) return { level: "diff", title: `${s.difference} behaviour difference${s.difference > 1 ? "s" : ""}, nothing broke`, detail: s.statement };
  if (!s) return { level: "error", title: "Workflows did not run", detail: f["test.txt"]?.text.trim().split("\n").pop() ?? null };
  return { level: "pass", title: "No regressions", detail: s.statement };
}

export const potOf = (planck: string | bigint, decimals = 14) => {
  const v = BigInt(String(planck).replace(/^\+/, ""));
  const neg = v < 0n, a = neg ? -v : v, base = 10n ** BigInt(decimals);
  const frac = (a % base).toString().padStart(decimals, "0").replace(/0+$/, "").slice(0, 4);
  return `${neg ? "−" : ""}${(a / base).toLocaleString("en")}${frac ? `.${frac}` : ""} POT`;
};
export const ago = (iso: string) => {
  const s = Math.max(0, (Date.now() - Date.parse(iso)) / 1000);
  return s < 60 ? `${Math.round(s)}s ago` : s < 3600 ? `${Math.round(s / 60)}m ago` : s < 86400 ? `${Math.round(s / 3600)}h ago` : `${Math.round(s / 86400)}d ago`;
};
export const dur = (a?: string | null, b?: string | null) => {
  if (!a) return "";
  const s = Math.max(0, ((b ? Date.parse(b) : Date.now()) - Date.parse(a)) / 1000);
  return s < 60 ? `${Math.round(s)}s` : `${Math.floor(s / 60)}m ${String(Math.round(s % 60)).padStart(2, "0")}s`;
};
