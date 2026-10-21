// Portal Canary in the browser: a WebSocket JSON-RPC client for Substrate nodes,
// and the Rust compare engine (/engine/canary.wasm, built from crates/canary-wasm).
// Nothing to install: the page talks to the nodes directly.

type Pending = { resolve: (v: any) => void; reject: (e: Error) => void; method: string; timer: ReturnType<typeof setTimeout> };
type WsCtor = new (url: string, opts?: any) => WebSocket;

export class Node {
  url: string;
  timeout: number;
  ws?: WebSocket;
  ready: Promise<Node>;
  onclose?: (() => void) | null;
  private next = 1;
  private pending = new Map<number, Pending>();
  private subs = new Map<string, (r: any) => void>();

  constructor(url: string, { timeout = 20000, WS = globalThis.WebSocket as WsCtor, wsOptions }: { timeout?: number; WS?: WsCtor; wsOptions?: unknown } = {}) {
    this.url = url;
    this.timeout = timeout;
    this.ready = new Promise((resolve, reject) => {
      let ws: WebSocket;
      try {
        ws = wsOptions ? new WS(url, wsOptions) : new WS(url);
      } catch (e) {
        reject(new Error(`cannot open ${url}: ${(e as Error).message}`));
        return;
      }
      this.ws = ws;
      const t = setTimeout(() => { reject(new Error(`no answer from ${url} in ${timeout / 1000}s`)); ws.close(); }, timeout);
      ws.onopen = () => { clearTimeout(t); resolve(this); };
      ws.onerror = () => { clearTimeout(t); reject(new Error(`could not connect to ${url}`)); };
      ws.onclose = () => {
        clearTimeout(t);
        for (const p of this.pending.values()) p.reject(new Error(`${url} closed the connection`));
        this.pending.clear();
        this.onclose?.();
      };
      ws.onmessage = (ev) => this.message(ev.data);
    });
  }

  private message(raw: string | ArrayBuffer) {
    const msg = JSON.parse(typeof raw === "string" ? raw : new TextDecoder().decode(raw));
    if (msg.id != null && this.pending.has(msg.id)) {
      const p = this.pending.get(msg.id)!;
      this.pending.delete(msg.id);
      clearTimeout(p.timer);
      if (msg.error) p.reject(new Error(`${p.method}: ${msg.error.message}`));
      else p.resolve(msg.result);
    } else if (msg.params?.subscription != null) {
      this.subs.get(msg.params.subscription)?.(msg.params.result);
    }
  }

  async call<T = any>(method: string, params: unknown[] = [], timeout = this.timeout): Promise<T> {
    await this.ready;
    const id = this.next++;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => { this.pending.delete(id); reject(new Error(`${method} timed out on ${this.url}`)); }, timeout);
      this.pending.set(id, { resolve, reject, method, timer });
      this.ws!.send(JSON.stringify({ jsonrpc: "2.0", id, method, params }));
    });
  }

  /** Calls `fn(header)` on every new head. */
  async heads(fn: (header: { number: string }) => void) {
    const sub = await this.call<string>("chain_subscribeNewHeads");
    this.subs.set(sub, fn);
    return sub;
  }

  close() {
    this.onclose = null;
    this.ws?.close();
  }
}

export type Runtime = {
  endpoint: string;
  runtime_version: { specName: string; specVersion: number; transactionVersion: number; apis: unknown[] };
  metadata: string;
  genesis_hash: string | null;
  chain: string | null;
  version: string | null;
  head: number | null;
  bytes: number;
};

export type Change = { kind: "added" | "removed" | "modified"; path: string; baseline: string | null; candidate: string | null };
export type Side = { endpoint: string; spec_name: string | null; spec_version: number | null; pallets: number; apis: string[]; metadata: { version: number; size_bytes: number; sha256: string } };
export type Comparison = {
  baseline: Side;
  candidate: Side;
  changes: Change[];
  metadata_identical: boolean;
  unversioned_change: boolean;
  upgrade_hazards: { path: string; reason: string }[];
};

const num = (h: string) => parseInt(h, 16);

/** Everything `canary compare` reads from one node. `step(label)` reports progress. */
export async function readRuntime(node: Node, step: (label: string) => void = () => {}): Promise<Runtime> {
  step("connecting");
  await node.ready;
  step("runtime version");
  const [runtime_version, chain, version, genesis_hash, header] = await Promise.all([
    node.call("state_getRuntimeVersion"),
    node.call<string>("system_chain").catch(() => null),
    node.call<string>("system_version").catch(() => null),
    node.call<string>("chain_getBlockHash", [0]).catch(() => null),
    node.call<{ number: string }>("chain_getHeader").catch(() => null),
  ]);
  step("metadata");
  const metadata = await node.call<string>("state_getMetadata", [], 60000);
  return {
    endpoint: node.url,
    runtime_version,
    metadata,
    genesis_hash,
    chain,
    version,
    head: header ? num(header.number) : null,
    bytes: (metadata.length - 2) / 2,
  };
}

type Exports = {
  memory: WebAssembly.Memory;
  alloc(len: number): number;
  compare(ptr: number, len: number): void;
  result_ptr(): number;
  result_len(): number;
};

let engine: Promise<Exports> | undefined;
/** Load canary.wasm once. `source` is a URL (browser) or bytes (tests). */
export function loadEngine(source: string | Uint8Array = "/engine/canary.wasm"): Promise<Exports> {
  engine ??= (async () => {
    const bytes = source instanceof Uint8Array ? source : await (await fetch(source)).arrayBuffer();
    const { instance } = (await WebAssembly.instantiate(bytes as BufferSource, {})) as unknown as WebAssembly.WebAssemblyInstantiatedSource;
    return instance.exports as unknown as Exports;
  })();
  return engine;
}

/** Same result as `canary compare --json`. Throws on `{error}`. */
export async function compare(baseline: Runtime, candidate: Runtime): Promise<Comparison> {
  const x = await loadEngine();
  const pick = (s: Runtime) => ({ endpoint: s.endpoint, runtime_version: s.runtime_version, metadata: s.metadata, genesis_hash: s.genesis_hash });
  const req = new TextEncoder().encode(JSON.stringify({ baseline: pick(baseline), candidate: pick(candidate) }));
  const ptr = x.alloc(req.length);
  new Uint8Array(x.memory.buffer, ptr, req.length).set(req);
  x.compare(ptr, req.length);
  const out = JSON.parse(new TextDecoder().decode(new Uint8Array(x.memory.buffer, x.result_ptr(), x.result_len())));
  if (out.error) throw new Error(out.error);
  return out;
}

/** Group change paths the way the dashboard reports them. */
export function tally(changes: Change[]) {
  const t = { pallets: { added: 0, removed: 0, modified: 0 }, indices: 0, calls: { added: 0, removed: 0, modified: 0 }, events: 0, storage: 0, constants: 0, errors: 0, runtime: 0, extrinsic: 0 };
  for (const c of changes) {
    const parts = c.path.split(".");
    if (parts.length === 1) t.pallets[c.kind]++;
    else if (parts[0] === "runtime") t.runtime++;
    else if (parts[0] === "extrinsic") t.extrinsic++;
    else if (parts[1] === "index") t.indices++;
    else if (parts[1] === "call") t.calls[c.kind]++;
    else if (parts[1] === "event") t.events++;
    else if (parts[1] === "storage") t.storage++;
    else if (parts[1] === "constant") t.constants++;
    else if (parts[1] === "error") t.errors++;
  }
  return t;
}
