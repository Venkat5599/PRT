// Build a chain spec whose genesis is Portaldot mainnet's current state, for upgrade tests on real
// accounts. Like fork-off-substrate: every pallet's storage is copied from a finalized mainnet
// block, except consensus and block-history pallets, which stay those of the dev chain spec so a
// single local authority (Alice) can produce blocks. Then:
//   - the dev accounts (Alice, Bob, ...) are added to System.Account and Balances.TotalIssuance,
//     so they can sign and the supply stays the sum of all balances;
//   - Staking.ForceEra = ForceNone, so no era is planned from mainnet's validator set (their
//     session keys are not on the fork; an election would leave no block author);
//   - the runtime code (`:code`) and Sudo key stay the dev chain's.
//
//   bun src/fork.ts --dev-spec dev.json --ws wss://mainnet.portaldot.io --out fork.json --meta fork-meta.json
import { WsProvider } from "@polkadot/api";
import { xxhashAsHex } from "@polkadot/util-crypto";
import { readFileSync, writeFileSync } from "node:fs";

const arg = (k: string, d?: string) => { const i = process.argv.indexOf(`--${k}`); return i > 0 ? process.argv[i + 1] : d; };
const devSpec = arg("dev-spec"), out = arg("out"), metaOut = arg("meta");
const ws = arg("ws", "wss://mainnet.portaldot.io")!;
if (!devSpec || !out || !metaOut) { console.error("usage: fork.ts --dev-spec dev.json --out fork.json --meta fork-meta.json [--ws url]"); process.exit(2); }

const h = (s: string) => xxhashAsHex(s, 128).slice(2);
/** Kept from the dev spec: consensus, authorship, block history, and the sudo key. */
export const KEEP_DEV = ["System", "Babe", "Grandpa", "Session", "Authorship", "ImOnline", "AuthorityDiscovery", "Offences",
  "Timestamp", "RandomnessCollectiveFlip", "Sudo", "ElectionProviderMultiPhase", "TransactionStorage", "MerkleMountainRange"];
const ACCOUNT = "0x" + h("System") + h("Account");
const ISSUANCE = "0x" + h("Balances") + h("TotalIssuance");
const FORCE_ERA = "0x" + h("Staking") + h("ForceEra");

const prov = new WsProvider(ws, 2_500, {}, 60_000);
await prov.isReady;
const rpc = <T>(m: string, p: unknown[]) => prov.send<T>(m, p);

const head = await rpc<string>("chain_getFinalizedHead", []);
const header = await rpc<{ number: string }>("chain_getHeader", [head]);
const version = await rpc<{ specName: string; specVersion: number }>("state_getRuntimeVersion", [head]);
const meta = await import("@polkadot/api").then(async ({ ApiPromise }) => {
  const api = await ApiPromise.create({ provider: prov, noInitWarn: true });
  const prefixes = (api.runtimeMetadata.asLatest.pallets as any[]).filter((p) => p.storage.isSome).map((p) => p.storage.unwrap().prefix.toString() as string);
  return { prefixes };
});

async function keys(prefix: string): Promise<string[]> {
  const all: string[] = [];
  let start: string | null = null;
  for (;;) {
    const page: string[] = await rpc<string[]>("state_getKeysPaged", [prefix, 1000, start, head]);
    all.push(...page);
    if (page.length < 1000) return all;
    start = page[page.length - 1];
  }
}
async function values(ks: string[]): Promise<[string, string][]> {
  const out: [string, string][] = [];
  for (let i = 0; i < ks.length; i += 500) {
    const [set] = await rpc<{ changes: [string, string | null][] }[]>("state_queryStorageAt", [ks.slice(i, i + 500), head]);
    for (const [k, v] of set.changes) if (v != null) out.push([k, v]);
  }
  return out;
}

const copy = meta.prefixes.filter((p) => !KEEP_DEV.includes(p));
const t0 = Date.now();
const mainnet = new Map<string, string>();
const perPallet: Record<string, number> = {};
await Promise.all([...copy.map((p) => ["0x" + h(p), p] as const), [ACCOUNT, "System.Account"] as const].map(async ([pre, name]) => {
  const kv = await values(await keys(pre));
  perPallet[name] = kv.length;
  for (const [k, v] of kv) mainnet.set(k, v);
}));

const spec = JSON.parse(readFileSync(devSpec, "utf8"));
const devTop: Record<string, string> = spec.genesis.raw.top;
const copied = new Set(copy.map((p) => "0x" + h(p)));
const top: Record<string, string> = {};
// Dev entries survive unless mainnet owns that pallet (or it is a System.Account entry mainnet has).
for (const [k, v] of Object.entries(devTop)) if (!copied.has(k.slice(0, 34)) && !(k.startsWith(ACCOUNT) && mainnet.has(k))) top[k] = v;
for (const [k, v] of mainnet) top[k] = v;

// Dev accounts that mainnet does not have: their balances join the supply.
const le = (hex: string) => { let n = 0n; for (let i = hex.length - 2; i >= 0; i -= 2) n = (n << 8n) | BigInt(parseInt(hex.slice(i, i + 2), 16)); return n; };
const toLe = (n: bigint, bytes: number) => { let s = ""; for (let i = 0; i < bytes; i++) { s += Number(n & 0xffn).toString(16).padStart(2, "0"); n >>= 8n; } return s; };
let extra = 0n, devAccounts = 0;
for (const [k, v] of Object.entries(devTop)) if (k.startsWith(ACCOUNT) && !mainnet.has(k)) {
  const data = v.slice(-128); // AccountData: free, reserved, misc_frozen, fee_frozen (u128 each)
  extra += le(data.slice(0, 32)) + le(data.slice(32, 64));
  devAccounts++;
}
const mainnetIssuance = le(mainnet.get(ISSUANCE)!.slice(2));
top[ISSUANCE] = "0x" + toLe(mainnetIssuance + extra, 16);
top[FORCE_ERA] = "0x02"; // Forcing::ForceNone

spec.name = `Portaldot mainnet fork #${parseInt(header.number, 16)}`;
spec.id = "portaldot_mainnet_fork";
spec.bootNodes = [];
spec.genesis.raw.top = top;
writeFileSync(out, JSON.stringify(spec));

const info = {
  source: ws, block: parseInt(header.number, 16), hash: head, spec: `${version.specName}#${version.specVersion}`,
  taken_unix: Math.floor(Date.now() / 1000), seconds: Math.round((Date.now() - t0) / 1000),
  accounts: perPallet["System.Account"], dev_accounts_added: devAccounts,
  mainnet_issuance: mainnetIssuance.toString(), fork_issuance: (mainnetIssuance + extra).toString(),
  pallets: Object.fromEntries(Object.entries(perPallet).filter(([, n]) => n > 0).sort()), kept_from_dev: KEEP_DEV, keys: Object.keys(top).length,
};
writeFileSync(metaOut, JSON.stringify(info, null, 2));
console.log(JSON.stringify(info));
await prov.disconnect();
process.exit(0);
