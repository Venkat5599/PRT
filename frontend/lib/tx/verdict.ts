// Port of canary-cli's workflow.rs (describe/kind), verdict.rs (classify) and
// report.rs (summarize). Kept line-for-line close to the Rust so recorded reports
// re-classify to the identical finding and finding hash (see test/golden.test.ts).

export type Importance = "core" | "normal";
export type Expect =
  | { dispatch: { step: number; status: string; error?: string | null } }
  | { delta: { account: string; field: "free" | "reserved"; eq?: string | null; gt?: string | null; lt?: string | null } }
  | { event: { step: number; name: string; absent?: boolean; contains?: string | null } }
  | { invariant: string };

export type Workflow = {
  id: string;
  description?: string;
  importance?: Importance;
  accounts?: string[];
  fund?: { account: string; amount: string }[];
  steps: { call: string; signer: string; args?: unknown; sudo?: boolean }[];
  expect: Expect[];
  delta_tolerance_ppm?: number;
  history_events?: string[];
};

export type EventRec = { name: string; data: unknown };
export type StepOutcome = {
  index: number; call: string; status: string; block_hash: string | null; dispatch_error: string | null;
  tx_hash?: string | null; signer?: string; events: EventRec[];
};
export type ExpectOutcome = { description: string; kind: string; pass: boolean; observed: string };
export type SideRun = {
  side: string; endpoint: string; setup_error: string | null; pre_block: string | null; post_block: string | null;
  steps: StepOutcome[]; deltas: Record<string, string>; expectations: ExpectOutcome[];
};
export type Contrast = { what: string; baseline: string; candidate: string };
export type Verdict = "PASS" | "DIFFERENCE" | "INCONCLUSIVE" | "REGRESSION";
export type Severity = "info" | "low" | "medium" | "high" | "critical";
export type Finding = {
  workflow: string; verdict: Verdict; severity: Severity; rationale: string;
  regressed: Contrast[]; baseline_failures: Contrast[]; differences: Contrast[]; normalised: Contrast[]; finding_hash: string;
};

const SEV: Severity[] = ["info", "low", "medium", "high", "critical"];
const maxSev = (a: Severity, b: Severity) => (SEV.indexOf(a) >= SEV.indexOf(b) ? a : b);

export function describe(e: Expect): string {
  if ("dispatch" in e) {
    const { step, status, error } = e.dispatch;
    return error != null ? `step ${step} dispatch ${status} (${error})` : `step ${step} dispatch ${status}`;
  }
  if ("delta" in e) {
    const { account, field, eq, gt, lt } = e.delta;
    const op = eq != null ? `== ${eq}` : gt != null ? `> ${gt}` : lt != null ? `< ${lt}` : "observed";
    return `delta ${account}.${field} ${op}`;
  }
  if ("event" in e) {
    const { step, name, absent, contains } = e.event;
    const pa = absent ? "absent" : "present";
    return contains != null ? `step ${step} event ${name} ${pa} with ${contains}` : `step ${step} event ${name} ${pa}`;
  }
  return `invariant ${e.invariant}`;
}
export function kind(e: Expect): string {
  return "dispatch" in e ? "dispatch" : "delta" in e ? "delta" : "event" in e ? "event" : "invariant";
}

function severityFor(k: string, importance: Importance): Severity {
  if (k === "invariant") return "critical";
  if (k === "dispatch" || k === "delta") return importance === "core" ? "high" : "medium";
  return "medium";
}

const parseI = (s: string): bigint | null => {
  const t = s.replace(/^\+/, "");
  return /^-?\d+$/.test(t) ? BigInt(t) : null;
};
const abs = (x: bigint) => (x < 0n ? -x : x);
function withinPpm(a: string, b: string, ppm: number): boolean {
  const x = parseI(a), y = parseI(b);
  if (x === null || y === null) return false;
  const scale = abs(x) > abs(y) ? abs(x) : abs(y);
  return abs(x - y) * 1_000_000n <= scale * BigInt(ppm);
}

// Rust BTreeMap iterates keys in byte order; JS sort on plain strings matches for ASCII keys.
const sortedKeys = (o: Record<string, string>) => Object.keys(o).sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));

function differences(b: SideRun, c: SideRun, wf: Workflow): [Contrast[], Contrast[]] {
  const out: Contrast[] = [], normalised: Contrast[] = [];
  const hist = (wf.history_events ?? []).map((h) => h.toLowerCase());
  const n = Math.min(b.steps.length, c.steps.length);
  for (let i = 0; i < n; i++) {
    const sb = b.steps[i], sc = c.steps[i];
    if (sb.status !== sc.status) out.push({ what: `step ${i} status`, baseline: sb.status, candidate: sc.status });
    const names = (s: StepOutcome, skip: boolean) =>
      s.events.filter((e) => !skip || !hist.includes(e.name.toLowerCase())).map((e) => e.name).join(", ");
    if (names(sb, false) !== names(sc, false)) {
      const item = { what: `step ${i} events`, baseline: names(sb, false), candidate: names(sc, false) };
      (names(sb, true) === names(sc, true) ? normalised : out).push(item);
    }
  }
  const ppm = wf.delta_tolerance_ppm ?? 1;
  for (const k of sortedKeys(b.deltas)) {
    const vb = b.deltas[k], vc = c.deltas[k] ?? "-";
    if (vb !== vc) {
      const item = { what: `delta ${k}`, baseline: vb, candidate: vc };
      (withinPpm(vb, vc, ppm) ? normalised : out).push(item);
    }
  }
  return [out, normalised];
}

export async function sha256Hex(data: string | Uint8Array): Promise<string> {
  const bytes = typeof data === "string" ? new TextEncoder().encode(data) : data;
  const d = await crypto.subtle.digest("SHA-256", bytes as Uint8Array<ArrayBuffer>);
  return [...new Uint8Array(d)].map((x) => x.toString(16).padStart(2, "0")).join("");
}

export async function classify(wf: Workflow, b: SideRun, c: SideRun): Promise<Finding> {
  const regressed: Contrast[] = [], baseline_failures: Contrast[] = [];
  let worst: Severity | null = null;
  const n = Math.min(b.expectations.length, c.expectations.length);
  for (let i = 0; i < n; i++) {
    const eb = b.expectations[i], ec = c.expectations[i];
    const contrast = { what: eb.description, baseline: eb.observed, candidate: ec.observed };
    if (!eb.pass) baseline_failures.push(contrast);
    else if (!ec.pass) {
      const s = severityFor(eb.kind, wf.importance ?? "normal");
      worst = worst === null ? s : maxSev(worst, s);
      regressed.push(contrast);
    }
  }
  const [diffs, normalised] = differences(b, c, wf);
  let verdict: Verdict, severity: Severity, rationale: string;
  const setup = b.setup_error ?? c.setup_error;
  if (setup != null) {
    [verdict, severity, rationale] = ["INCONCLUSIVE", "info", `setup failed, runs not comparable: ${setup}`];
  } else if (baseline_failures.length) {
    [verdict, severity, rationale] = ["INCONCLUSIVE", "info",
      `${baseline_failures.length} expectation(s) fail on the baseline itself; fix the workflow or the baseline first`];
  } else if (worst !== null) {
    [verdict, severity, rationale] = ["REGRESSION", worst,
      `${regressed.length} expectation(s) hold on the baseline and fail on the candidate under identical setup; worst kind drives severity (${(wf.importance ?? "normal") === "core" ? "core" : "normal"} workflow)`];
  } else if (diffs.length) {
    [verdict, severity, rationale] = ["DIFFERENCE", "low", `${diffs.length} observable difference(s), but every declared expectation still holds`];
  } else {
    [verdict, severity, rationale] = ["PASS", "info", "all expectations hold on both runtimes; no observable differences"];
  }
  const whats = (v: Contrast[]) => v.map((x) => x.what);
  // serde_json's json! map is a BTreeMap: keys serialise sorted, output compact.
  const digest = JSON.stringify({ baseline_failures: whats(baseline_failures), differences: whats(diffs), regressed: whats(regressed), verdict, workflow: wf.id });
  return { workflow: wf.id, verdict, severity, rationale, regressed, baseline_failures, differences: diffs, normalised, finding_hash: await sha256Hex(digest) };
}

export type Summary = { workflows: number; pass: number; difference: number; inconclusive: number; regression: number; statement: string };
export function summarize(results: { finding: Finding; baseline: SideRun }[]): Summary {
  const count = (v: Verdict) => results.filter((r) => r.finding.verdict === v).length;
  const [pass, difference, inconclusive, regression] = [count("PASS"), count("DIFFERENCE"), count("INCONCLUSIVE"), count("REGRESSION")];
  const expectations = results.reduce((a, r) => a + r.baseline.expectations.length, 0);
  const statement = regression > 0
    ? `${regression} regression(s) detected across ${results.length} workflow(s).`
    : `No regression detected in the configured corpus (${results.length} workflows, ${expectations} expectations).${inconclusive > 0 ? ` ${inconclusive} workflow(s) inconclusive.` : ""}`;
  return { workflows: results.length, pass, difference, inconclusive, regression, statement };
}

export function exitCode(s: Summary): number {
  return s.regression > 0 ? 1 : s.inconclusive > 0 ? 2 : 0;
}

/** `canary/1 <report sha256> b=<spec>:<meta16> c=<spec>:<meta16> R<n> D<n> I<n> P<n>` (attest.rs build_payload). */
export async function attestPayload(reportBytes: Uint8Array): Promise<{ payload: string; report_sha256: string }> {
  const report_sha256 = await sha256Hex(reportBytes);
  const r = JSON.parse(new TextDecoder().decode(reportBytes));
  const side = (m: any) => `${m?.spec_version ?? "-"}:${typeof m?.metadata_sha256 === "string" ? m.metadata_sha256.slice(0, 16) : "-"}`;
  const s = r.summary ?? {};
  const n = (k: string) => (typeof s[k] === "number" ? s[k] : 0);
  return {
    payload: `canary/1 ${report_sha256} b=${side(r.manifest?.baseline)} c=${side(r.manifest?.candidate)} R${n("regression")} D${n("difference")} I${n("inconclusive")} P${n("pass")}`,
    report_sha256,
  };
}
