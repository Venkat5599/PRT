// Live check of the browser engine: same module the site loads, same wasm,
// against real Portaldot nodes, sending a browser Origin header so CORS/origin
// rejections would show up here first.
//   bun scripts/engine-live.test.ts
import { readFileSync } from "node:fs";
import { Node, readRuntime, loadEngine, compare, tally } from "../web/lib/canary.ts";

const ORIGIN = process.env.CANARY_ORIGIN ?? "https://portal-canary.vercel.app";
const BASE = process.env.CANARY_BASELINE ?? "wss://mainnet.portaldot.io";
const CAND = process.env.CANARY_CANDIDATE ?? "wss://test-node-v3.portaldot.dev";

await loadEngine(new Uint8Array(readFileSync(new URL("../web/public/engine/canary.wasm", import.meta.url))));
const open = (url: string) => new Node(url, { wsOptions: { headers: { Origin: ORIGIN } } });

const t0 = performance.now();
const [a, b] = await Promise.all([readRuntime(open(BASE)), readRuntime(open(CAND))]);
console.log(`fetched ${a.chain} (${a.bytes} B) and ${b.chain} (${b.bytes} B) in ${Math.round(performance.now() - t0)} ms`);

const t1 = performance.now();
const c = await compare(a, b);
console.log(`compared in ${Math.round(performance.now() - t1)} ms`);
console.log(`pallets ${c.baseline.pallets} vs ${c.candidate.pallets}, ${c.changes.length} changes, ${c.upgrade_hazards.length} hazards`);
console.log(JSON.stringify(tally(c.changes)));
for (const h of c.upgrade_hazards) console.log("HAZARD", h.path);

const self = await compare(b, b);
console.log(`control (candidate vs itself): ${self.changes.length} changes`);
if (self.changes.length !== 0) process.exit(1);
process.exit(0);
