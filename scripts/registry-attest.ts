// Record a Canary run in the CanaryRegistry contract on the PortaldotV3 EVM.
//
//   bun scripts/registry-attest.ts examples/upgrade-halve-reserved [more run dirs...]
//
// Reads <run>/report.json, writes <run>/registry.json with the tx hash and attestation id.
// Signs with CANARY_EVM_KEY from .env.canary (dedicated testnet key; never printed or saved).
// Needs Foundry's `cast` on PATH.
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

export const REGISTRY = {
  address: "0x62Eacc58CE0FA37F06F24074AFb7B3F22Df708FF",
  rpc: "https://test-evm-rpc-v3.portaldot.dev",
  chainId: 420420777,
};
const SIG = "attest(bytes32,bytes32,uint32,uint32,uint16,uint16,uint16,uint16)";

function env(name: string): string {
  if (process.env[name]) return process.env[name]!;
  const file = join(import.meta.dir, "..", ".env.canary");
  const line = existsSync(file) ? readFileSync(file, "utf8").split("\n").find((l) => l.startsWith(`${name}=`)) : undefined;
  if (!line) throw new Error(`${name} not set (env or .env.canary)`);
  return line.slice(name.length + 1).trim();
}

function cast(args: string[], secret?: string): string {
  const p = Bun.spawnSync(["cast", ...args, ...(secret ? ["--private-key", secret] : [])], { stderr: "pipe" });
  if (p.exitCode !== 0) throw new Error(`cast ${args[0]} failed: ${p.stderr.toString().trim()}`);
  return p.stdout.toString().trim();
}

const hex32 = (s: string | undefined) => {
  const h = (s ?? "").replace(/^0x/, "");
  if (!/^[0-9a-f]{64}$/i.test(h)) throw new Error(`not a 32-byte hash: ${s}`);
  return `0x${h}`;
};

export function payload(runDir: string) {
  const raw = readFileSync(join(runDir, "report.json"));
  const r = JSON.parse(raw.toString());
  const c = r.manifest.candidate;
  const s = r.summary;
  return {
    reportHash: `0x${createHash("sha256").update(raw).digest("hex")}`,
    // The runtime under judgment: its wasm when Canary applied one, else its metadata.
    candidate: hex32(c.wasm_sha256 ?? c.metadata_sha256),
    baselineSpec: r.manifest.baseline.spec_version ?? 0,
    candidateSpec: c.spec_version ?? 0,
    counts: [s.regression, s.difference, s.inconclusive, s.pass].map((n: number) => n ?? 0),
  };
}

if (import.meta.main) {
  const key = env("CANARY_EVM_KEY");
  const runs = process.argv.slice(2);
  if (!runs.length) throw new Error("usage: bun scripts/registry-attest.ts <run dir>...");
  for (const run of runs) {
    const p = payload(run);
    const [found, id] = cast(["call", "--rpc-url", REGISTRY.rpc, REGISTRY.address, "forReport(bytes32)(bool,uint256)", p.reportHash]).split("\n");
    if (found === "true") {
      console.log(`${run}: already attested as #${id}`);
      continue;
    }
    const args = [p.reportHash, p.candidate, String(p.baselineSpec), String(p.candidateSpec), ...p.counts.map(String)];
    const receipt = JSON.parse(cast(["send", "--json", "--rpc-url", REGISTRY.rpc, REGISTRY.address, SIG, ...args], key));
    if (receipt.status !== "0x1") throw new Error(`${run}: tx ${receipt.transactionHash} reverted`);
    const [, newId] = cast(["call", "--rpc-url", REGISTRY.rpc, REGISTRY.address, "forReport(bytes32)(bool,uint256)", p.reportHash]).split("\n");
    const out = { registry: REGISTRY.address, chain_id: REGISTRY.chainId, rpc: REGISTRY.rpc, id: Number(newId), ...p, tx_hash: receipt.transactionHash, block_number: Number(receipt.blockNumber) };
    writeFileSync(join(run, "registry.json"), JSON.stringify(out, null, 2) + "\n");
    console.log(`${run}: #${newId} tx ${receipt.transactionHash} block ${Number(receipt.blockNumber)}`);
  }
}
