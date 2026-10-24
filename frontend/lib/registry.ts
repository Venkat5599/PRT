// Read the CanaryRegistry contract on the PortaldotV3 EVM with a raw eth_call and
// decode it by hand: one static struct array, no ABI library needed.
import { V3 } from "./wallet";

export const REGISTRY = "0x62Eacc58CE0FA37F06F24074AFb7B3F22Df708FF";
const ALL = "0x10c4e8b0"; // all()

export type OnChain = {
  id: number;
  reportHash: string;
  candidate: string;
  baselineSpec: number;
  candidateSpec: number;
  regressions: number;
  differences: number;
  inconclusive: number;
  passes: number;
  attester: string;
  timestamp: number;
};

export async function readRegistry(): Promise<{ list: OnChain[]; block: number }> {
  const rpc = (method: string, params: unknown[]) =>
    fetch(V3.evmRpc, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
    })
      .then((r) => r.json())
      .then(({ result, error }) => {
        if (error) throw new Error(error.message);
        return result as string;
      });
  const [raw, block] = await Promise.all([rpc("eth_call", [{ to: REGISTRY, data: ALL }, "latest"]), rpc("eth_blockNumber", [])]);
  const h = raw.slice(2);
  const word = (i: number) => h.slice(i * 64, i * 64 + 64);
  const num = (i: number) => Number(BigInt(`0x${word(i)}`));
  // [offset][length][length × 10 inline words]
  const n = num(1);
  const list: OnChain[] = [];
  for (let k = 0; k < n; k++) {
    const b = 2 + k * 10;
    list.push({
      id: k,
      reportHash: `0x${word(b)}`,
      candidate: `0x${word(b + 1)}`,
      baselineSpec: num(b + 2),
      candidateSpec: num(b + 3),
      regressions: num(b + 4),
      differences: num(b + 5),
      inconclusive: num(b + 6),
      passes: num(b + 7),
      attester: `0x${word(b + 8).slice(24)}`,
      timestamp: num(b + 9),
    });
  }
  return { list, block: parseInt(block, 16) };
}

/** sha256 of a published file, hex with 0x, computed in the browser. */
export async function sha256Of(url: string): Promise<string> {
  const buf = await (await fetch(url, { cache: "no-store" })).arrayBuffer();
  const d = new Uint8Array(await crypto.subtle.digest("SHA-256", buf));
  return `0x${[...d].map((x) => x.toString(16).padStart(2, "0")).join("")}`;
}
