// Browser ports of canary checks that the dashboard runs live: runtime API
// detection (canary-chain/src/apis.rs), the supply invariant (invariant.rs),
// the finding hash (canary-cli/src/verdict.rs) and attestation verification
// (canary-cli/src/attest.rs). No server; every read goes straight to a node.
import { blake2b } from "@noble/hashes/blake2b";
import { Node } from "./canary";

const hex = (b: Uint8Array) => [...b].map((x) => x.toString(16).padStart(2, "0")).join("");

/* ---------- runtime APIs ---------- */
export const KNOWN_APIS: [string, string][] = [
  ["Core", "core"], ["Metadata", "core"], ["BlockBuilder", "core"], ["TaggedTransactionQueue", "core"],
  ["AccountNonceApi", "signing"], ["TransactionPaymentApi", "fees"], ["ContractsApi", "wasm-contracts"],
  ["EthereumRuntimeRPCApi", "evm"], ["ConvertTransactionRuntimeApi", "evm"], ["ReviveApi", "evm"],
  ["TransactionPaymentCallApi", "fees"], ["OffchainWorkerApi", "core"], ["GenesisBuilder", "core"],
  ["AuthorityDiscoveryApi", "consensus"], ["TryRuntime", "upgrade-testing"], ["BabeApi", "consensus"],
  ["AuraApi", "consensus"], ["GrandpaApi", "finality"], ["SessionKeys", "consensus"],
];
const API_IDS = new Map(KNOWN_APIS.map(([n, c]) => [`0x${hex(blake2b(new TextEncoder().encode(n), { dkLen: 8 }))}`, [n, c] as const]));
export type Api = { id: string; name: string | null; capability: string | null; version: number };
export function detectApis(apis: [string, number][]): Api[] {
  return apis.map(([id, version]) => {
    const hit = API_IDS.get(id.toLowerCase());
    return { id: id.toLowerCase(), name: hit?.[0] ?? null, capability: hit?.[1] ?? null, version };
  });
}

/* ---------- network layer: DNS over HTTPS (browsers cannot resolve directly) ---------- */
export async function resolveHost(host: string): Promise<{ ok: boolean; ip?: string; error?: string }> {
  if (/^[\d.]+$/.test(host) || host === "localhost") return { ok: true, ip: host };
  try {
    const j = await (await fetch(`https://dns.google/resolve?name=${encodeURIComponent(host)}&type=A`)).json();
    const a = (j.Answer ?? []).filter((x: { type: number }) => x.type === 1).map((x: { data: string }) => x.data);
    return a.length ? { ok: true, ip: a[a.length - 1] } : { ok: false, error: j.Status === 3 ? "NXDOMAIN" : "no A record" };
  } catch {
    return { ok: true }; // DoH blocked: the WebSocket/HTTP layer below still proves reachability
  }
}

/* ---------- units ---------- */
export function formatUnits(amount: bigint, decimals: number): string {
  const base = 10n ** BigInt(decimals);
  const neg = amount < 0n, a = neg ? -amount : amount;
  const frac = (a % base).toString().padStart(decimals, "0").replace(/0+$/, "");
  return `${neg ? "-" : ""}${(a / base).toLocaleString("en")}${frac ? "." + frac : ""}`;
}

/* ---------- supply invariant ---------- */
const SYSTEM_ACCOUNT = "0x26aa394eea5630e07c48ae0c9558cef7b99d880ec681799c0cf30e8886371da9";
const TOTAL_ISSUANCE = "0xc2261276cc9d1f8598ea4b6a74b15c2f57c875e4cff74148e4628f264b974c80";
function leU128(h: string, offset: number): bigint {
  const s = h.slice(2 + offset * 2, 2 + offset * 2 + 32);
  let n = 0n;
  for (let i = s.length - 2; i >= 0; i -= 2) n = (n << 8n) | BigInt(parseInt(s.slice(i, i + 2), 16));
  return n;
}
const LAYOUTS: Record<number, [string, number]> = { 72: ["ref_count", 8], 76: ["consumers_providers", 12], 80: ["with_sufficients", 16] };

export type Supply = {
  endpoint: string; block: { number: number; hash: string }; accounts: number; layouts: Record<string, number>; decode_errors: number;
  sum_free: bigint; sum_reserved: bigint; total_issuance: bigint; delta: bigint; verdict: "PASS" | "FAIL" | "INCONCLUSIVE"; decimals: number; symbol: string;
};
export async function supplyConservation(url: string, onProgress?: (accounts: number) => void): Promise<Supply> {
  const node = new Node(url);
  try {
    type Props = { tokenDecimals?: number | number[]; tokenSymbol?: string | string[] };
    const props: Props = await node.call<Props>("system_properties").catch(() => ({}));
    const decimals = Number(([] as (number | undefined)[]).concat(props.tokenDecimals)[0] ?? 14);
    const symbol = String(([] as (string | undefined)[]).concat(props.tokenSymbol)[0] ?? "POT");
    const fin = await node.call<string>("chain_getFinalizedHead");
    const header = await node.call<{ number: string }>("chain_getHeader", [fin]);
    const ti = await node.call<string | null>("state_getStorage", [TOTAL_ISSUANCE, fin]);
    if (!ti) throw new Error("Balances.TotalIssuance is empty at this block");
    const s: Supply = { endpoint: url, block: { number: parseInt(header.number, 16), hash: fin }, accounts: 0, layouts: {}, decode_errors: 0,
      sum_free: 0n, sum_reserved: 0n, total_issuance: leU128(ti, 0), delta: 0n, verdict: "INCONCLUSIVE", decimals, symbol };
    let start: string | null = null;
    for (;;) {
      const keys = await node.call<string[]>("state_getKeysPaged", [SYSTEM_ACCOUNT, 1000, start, fin]);
      if (!keys.length) break;
      const res = await node.call<{ changes: [string, string | null][] }[]>("state_queryStorageAt", [keys, fin]);
      for (const [, v] of res[0]?.changes ?? []) {
        if (!v) continue;
        s.accounts++;
        const l = LAYOUTS[(v.length - 2) / 2];
        if (!l) { s.decode_errors++; continue; }
        s.sum_free += leU128(v, l[1]); s.sum_reserved += leU128(v, l[1] + 16);
        s.layouts[l[0]] = (s.layouts[l[0]] ?? 0) + 1;
      }
      onProgress?.(s.accounts);
      start = keys[keys.length - 1];
      if (keys.length < 1000) break;
    }
    s.delta = s.sum_free + s.sum_reserved - s.total_issuance;
    s.verdict = s.decode_errors ? "INCONCLUSIVE" : s.delta === 0n ? "PASS" : "FAIL";
    return s;
  } finally {
    node.close();
  }
}

/* ---------- reproduce: finding hash ---------- */
type Contrast = { what: string };
export type FindingLike = { workflow: string; verdict: string; regressed: Contrast[]; baseline_failures: Contrast[]; differences: Contrast[]; finding_hash: string };
export async function sha256Hex(data: string | Uint8Array): Promise<string> {
  const bytes = typeof data === "string" ? new TextEncoder().encode(data) : data;
  return hex(new Uint8Array(await crypto.subtle.digest("SHA-256", bytes as BufferSource)));
}
/** serde_json's json! map is a BTreeMap: keys serialise sorted, output compact. */
export function findingHash(f: FindingLike): Promise<string> {
  const w = (v: Contrast[]) => (v ?? []).map((c) => c.what);
  return sha256Hex(JSON.stringify({ baseline_failures: w(f.baseline_failures), differences: w(f.differences), regressed: w(f.regressed), verdict: f.verdict, workflow: f.workflow }));
}

/* ---------- attestation (canary attest / verify) ---------- */
export type Attestation = {
  network: string; chain: string | null; genesis_hash: string | null; payload: string; payload_hex: string;
  report_sha256: string; signer: string; tx_hash: string; block_hash: string; block_number: number | null;
};
export async function attestPayload(reportBytes: Uint8Array) {
  const report_sha256 = await sha256Hex(reportBytes);
  const r = JSON.parse(new TextDecoder().decode(reportBytes));
  const side = (m: { spec_version?: number; metadata_sha256?: string } | undefined) =>
    `${m?.spec_version ?? "-"}:${typeof m?.metadata_sha256 === "string" ? m.metadata_sha256.slice(0, 16) : "-"}`;
  const n = (k: string) => (typeof r.summary?.[k] === "number" ? r.summary[k] : 0);
  return { report_sha256, payload: `canary/1 ${report_sha256} b=${side(r.manifest?.baseline)} c=${side(r.manifest?.candidate)} R${n("regression")} D${n("difference")} I${n("inconclusive")} P${n("pass")}` };
}
export type Check = { what: string; ok: boolean; detail: string };
export async function verifyAttestation(att: Attestation, reportBytes: Uint8Array): Promise<Check[]> {
  const { payload, report_sha256 } = await attestPayload(reportBytes);
  const checks: Check[] = [
    { what: "report file matches attested hash", ok: report_sha256 === att.report_sha256, detail: report_sha256 },
    { what: "payload rebuilt from report matches", ok: payload === att.payload, detail: payload },
  ];
  const node = new Node(att.network);
  try {
    const genesis = await node.call<string>("chain_getBlockHash", [0]);
    checks.push({ what: "same chain (genesis hash)", ok: genesis === att.genesis_hash, detail: genesis });
    const block = await node.call<{ block: { extrinsics: string[] } } | null>("chain_getBlock", [att.block_hash]);
    const needle = att.payload_hex.replace(/^0x/, "").toLowerCase();
    const found = !!block?.block.extrinsics.some((x) => x.toLowerCase().includes(needle));
    checks.push({ what: "remark present in attested block", ok: found, detail: `#${att.block_number ?? "?"} ${att.block_hash}` });
  } finally {
    node.close();
  }
  return checks;
}
