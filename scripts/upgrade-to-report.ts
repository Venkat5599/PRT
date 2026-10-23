// Turn a `canary upgrade --out upgrade.json` result into the run format the site
// renders (/reports/<id>/report.json), so a migration check shows in the same
// console and ledger as `canary test` runs. Every number comes from upgrade.json.
//
//   bun scripts/upgrade-to-report.ts <upgrade.json> <out-dir> "<injected label>"
//
// Columns: baseline = chain state before setCode, candidate = after the migration.
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const [src, outDir, injected] = process.argv.slice(2);
if (!src || !outDir) throw new Error("usage: upgrade-to-report.ts <upgrade.json> <out-dir> [injected label]");
const raw = readFileSync(src, "utf8");
const u = JSON.parse(raw);
const st = u.state;
if (!st) throw new Error(`${src} has no state check (chain halted or old format)`);

const PLANCK = 10n ** 14n;
const pot = (v: string) => {
  const n = BigInt(v);
  const frac = (n % PLANCK).toString().padStart(14, "0").replace(/0+$/, "");
  return `${(n / PLANCK).toLocaleString("en")}${frac ? `.${frac}` : ""} POT`;
};
const held = (p: any) => (BigInt(p.sum_free) + BigInt(p.sum_reserved)).toString();
const short = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`;

type Exp = { description: string; observed: string; pass: boolean };
const base: Exp[] = [];
const cand: Exp[] = [];
const add = (description: string, b: string, c: string, passB: boolean, passC: boolean) => {
  base.push({ description, observed: b, pass: passB });
  cand.push({ description, observed: c, pass: passC });
};

add("supply: accounts hold TotalIssuance",
  `${pot(held(st.before))} of ${pot(st.before.total_issuance)}`,
  `${pot(held(st.after))} of ${pot(st.after.total_issuance)}`,
  st.before.supply_conservation === "PASS", st.after.supply_conservation === "PASS");
for (const c of st.changes) {
  add(`${short(c.address)} reserved kept`, c.reserved_before, c.reserved_after, true, c.reserved_before === c.reserved_after);
}
add("block production", `live, spec ${u.spec_before}`, `${u.liveness.split(" (")[0]}, spec ${u.spec_after}`, true, u.liveness.startsWith("ok"));

const regressed = base
  .map((b, i) => ({ what: b.description, baseline: b.observed, candidate: cand[i].observed, pass: cand[i].pass }))
  .filter((r) => !r.pass)
  .map(({ pass, ...r }) => r);
const destroyed = BigInt(st.after.total_issuance) - BigInt(held(st.after));
const verdict = st.verdict as string;
const detail = destroyed > 0n
  ? `${pot(destroyed.toString())} destroyed · ${st.reserved_changed} accounts · chain live`
  : st.rationale;
const id = `${u.endpoint} ${u.wasm_sha256}`;
const finding_hash = createHash("sha256").update(raw).digest("hex");

const report = {
  manifest: {
    kind: "upgrade",
    command: `canary upgrade --ws ${u.endpoint} --wasm ${u.wasm}`,
    detail,
    injected: injected || null,
    baseline: { endpoint: u.endpoint, spec_version: u.spec_before, block: st.before.block_number },
    candidate: { endpoint: u.endpoint, spec_version: u.spec_after, block: st.after.block_number, wasm_sha256: u.wasm_sha256 },
  },
  summary: {
    workflows: 1,
    pass: verdict === "PASS" ? 1 : 0,
    difference: 0,
    inconclusive: verdict === "INCONCLUSIVE" ? 1 : 0,
    regression: verdict === "REGRESSION" ? 1 : 0,
    headline: verdict === "REGRESSION" && destroyed > 0n ? "Funds destroyed" : undefined,
    statement: st.rationale,
  },
  results: [
    {
      finding: {
        workflow: "upgrade.state",
        verdict,
        severity: (st.severity ?? "info").toLowerCase(),
        rationale: st.rationale,
        regressed,
        baseline_failures: [],
        differences: [{ what: "spec_version", baseline: String(u.spec_before), candidate: String(u.spec_after) }],
        normalised: [],
        finding_hash,
      },
      baseline: { side: "baseline", endpoint: u.endpoint, setup_error: null, pre_block: st.before.block_hash, post_block: st.before.block_hash, expectations: base },
      candidate: { side: "candidate", endpoint: u.endpoint, setup_error: null, pre_block: st.after.block_hash, post_block: st.after.block_hash, expectations: cand },
      reproduce: "bash scripts/migration-demo.sh",
    },
  ],
  source: { file: "upgrade.json", id },
};

mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "report.json"), `${JSON.stringify(report, null, 2)}\n`);
writeFileSync(join(outDir, "upgrade.json"), raw);
console.log(`${join(outDir, "report.json")}: ${verdict} · ${detail}`);
