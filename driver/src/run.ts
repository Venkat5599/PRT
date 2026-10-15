// Canary step driver.
//
// Reads a job on stdin, executes each step as a signed extrinsic, and prints one
// JSON result on stdout. All orchestration, state reads and verdicts live in the
// Rust core; this process only signs, submits and decodes events.
//
// Job:    { "ws": "ws://127.0.0.1:9944", "steps": [ { "call": "Balances.transfer",
//           "signer": "alice", "args": { "dest": "bob", "value": "1000" } } ] }
// Output: { "ok": true, "results": [ { "index", "call", "status", "block_hash",
//           "dispatch_error", "events": [ { "name", "data" } ] } ] }
// Keys are the public Substrate development accounts only. No real secrets.

import { ApiPromise, WsProvider } from "@polkadot/api";
import { Keyring } from "@polkadot/keyring";
import { cryptoWaitReady } from "@polkadot/util-crypto";

type Step = { call: string; signer: string; args?: Record<string, unknown> | unknown[]; sudo?: boolean };
type Job = { ws: string; steps: Step[]; timeout_ms?: number };

const DEV = ["alice", "bob", "charlie", "dave", "eve", "ferdie"];

function camel(s: string): string {
  return s.charAt(0).toLowerCase() + s.slice(1);
}

function deriveFrom(keyring: Keyring, name: string) {
  const uri = name.startsWith("//") ? name : `//${name.charAt(0).toUpperCase()}${name.slice(1)}`;
  return keyring.addFromUri(uri);
}

async function main() {
  const job: Job = JSON.parse(await Bun.stdin.text());
  await cryptoWaitReady();
  const api = await ApiPromise.create({ provider: new WsProvider(job.ws), noInitWarn: true, throwOnConnect: true });
  const keyring = new Keyring({ type: "sr25519", ss58Format: 42 });

  // Account names in args resolve to addresses; anything else passes through untouched.
  const resolve = (v: unknown): unknown => {
    if (typeof v === "string" && (DEV.includes(v) || v.startsWith("//"))) return deriveFrom(keyring, v).address;
    if (Array.isArray(v)) return v.map(resolve);
    return v;
  };

  const results = [];
  for (const [index, step] of job.steps.entries()) {
    const [pallet, method] = step.call.split(".");
    const fn = api.tx[camel(pallet)]?.[method];
    if (!fn) {
      results.push({ index, call: step.call, status: "unknown_call", block_hash: null, dispatch_error: null, events: [] });
      continue;
    }
    const names = fn.meta.args.map((a) => a.name.toString());
    const ordered = Array.isArray(step.args)
      ? step.args.map(resolve)
      : names.map((n) => resolve((step.args ?? {})[n] ?? (step.args ?? {})[camelToSnake(n)]));
    let tx = fn(...ordered);
    if (step.sudo) tx = api.tx.sudo.sudo(tx);
    const signer = deriveFrom(keyring, step.signer);

    const outcome = await new Promise<any>((resolveP) => {
      const timer = setTimeout(() => resolveP({ status: "timeout", block_hash: null, dispatch_error: null, events: [] }),
        job.timeout_ms ?? 60_000);
      tx.signAndSend(signer, { nonce: -1 }, ({ status, events, dispatchError }) => {
        if (status.isInvalid || status.isDropped || status.isUsurped) {
          clearTimeout(timer);
          resolveP({ status: status.type.toLowerCase(), block_hash: null, dispatch_error: null, events: [] });
        }
        if (!status.isInBlock) return;
        clearTimeout(timer);
        let err: string | null = null;
        if (dispatchError) {
          if (dispatchError.isModule) {
            const meta = api.registry.findMetaError(dispatchError.asModule);
            err = `${meta.section}.${meta.name}`;
          } else {
            err = dispatchError.toString();
          }
        }
        resolveP({
          status: err ? "failed" : "success",
          block_hash: status.asInBlock.toHex(),
          dispatch_error: err,
          events: events.map(({ event }) => ({ name: `${event.section}.${event.method}`, data: event.data.toJSON() })),
        });
      }).catch((e: Error) => {
        clearTimeout(timer);
        resolveP({ status: "rejected", block_hash: null, dispatch_error: e.message, events: [] });
      });
    });
    results.push({ index, call: step.call, signer: step.signer, ...outcome });
  }

  console.log(JSON.stringify({ ok: true, results }));
  await api.disconnect();
}

function camelToSnake(s: string): string {
  return s.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
}

main().catch((e) => {
  console.log(JSON.stringify({ ok: false, error: String(e?.message ?? e) }));
  process.exit(1);
});
