"use client";

import { useEffect, useState } from "react";
import { Node } from "@/lib/canary";
import { short, type Connected } from "@/lib/wallet";
import { file, runPayload, sha256Hex, explorerBlock, V3_WS, type Files, type Result, type RunAttestation } from "@/lib/runresult";

// The run's on-chain record on the Portaldot V3 testnet, re-checked from this page: the files the
// run wrote hash to result.json, result.json hashes to the remark, and the remark is in that block.
type Check = { what: string; ok: boolean | null; detail?: string };
type CoSign = { tx_hash: string; block_hash: string; block_number: number | null; signer: string };
const txm = () => import("@/lib/tx/tx");

async function v3(method: string, params: unknown[] = []) {
  const n = new Node(V3_WS, { timeout: 20000 });
  try { return await n.call<any>(method, params); } finally { n.close(); }
}
async function remarkInBlock(blockHash: string, payload: string) {
  const hex = [...new TextEncoder().encode(payload)].map((b) => b.toString(16).padStart(2, "0")).join("");
  const block = await v3("chain_getBlock", [blockHash]);
  return (block?.block?.extrinsics ?? []).some((x: string) => x.toLowerCase().includes(hex));
}

export function Proof({ id, files, wallet }: { id: string; files: Files; wallet: Connected | null }) {
  const att = file<RunAttestation>(files, "attestation.json");
  const result = file<Result>(files, "result.json");
  const failed = files["attest-error.txt"]?.text.trim().split("\n").filter(Boolean).pop() ?? null;
  const [checks, setChecks] = useState<Check[] | null>(null);
  const [co, setCo] = useState<CoSign | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => { try { const s = localStorage.getItem(`canary.cosign.${id}`); if (s) setCo(JSON.parse(s)); } catch {} }, [id]);

  useEffect(() => {
    if (!att || !files["result.json"]) return;
    let live = true;
    (async () => {
      const text = files["result.json"].text;
      const out: Check[] = [];
      const { sha, payload } = await runPayload(text);
      out.push({ what: "result.json matches the recorded hash", ok: sha === att.report_sha256 && payload === att.payload, detail: sha.slice(0, 16) });
      const listed = Object.entries(result?.sha256 ?? {});
      let same = 0;
      for (const [name, want] of listed) if (files[name] && (await sha256Hex(files[name].text)) === want) same++;
      out.push({ what: `${same} of ${listed.length} files match result.json`, ok: listed.length > 0 && same === listed.length });
      if (live) setChecks([...out, { what: "remark in the block on V3", ok: null }]);
      try {
        const [genesis, found] = await Promise.all([v3("chain_getBlockHash", [0]), remarkInBlock(att.block_hash, att.payload)]);
        out.push({ what: "remark in the block on V3", ok: found && genesis === att.genesis_hash, detail: `#${att.block_number?.toLocaleString("en")}` });
      } catch (e) { out.push({ what: "remark in the block on V3", ok: false, detail: (e as Error).message }); }
      if (live) setChecks(out);
    })();
    return () => { live = false; };
  }, [att?.block_hash]); // eslint-disable-line react-hooks/exhaustive-deps

  const sub = wallet?.wallet.kind === "substrate" ? wallet : null;
  async function cosign() {
    if (!sub || !files["result.json"]) return;
    setBusy(true); setErr(null);
    try {
      const t = await txm();
      const info = await t.chainInfo(V3_WS);
      const bal = await t.freeBalance(V3_WS, sub.address);
      if (bal === 0n) throw new Error(`${short(sub.address)} holds no ${info.symbol} on ${info.chain}`);
      const { payload } = await runPayload(files["result.json"].text);
      const r = await t.remark(V3_WS, payload, { kind: "wallet", extension: sub.wallet.id, address: sub.address });
      if (!(await remarkInBlock(r.block_hash, payload))) throw new Error("the remark is not in the block the node reported");
      const c = { ...r, signer: sub.address };
      setCo(c);
      try { localStorage.setItem(`canary.cosign.${id}`, JSON.stringify(c)); } catch {}
    } catch (e) { setErr((e as Error).message); } finally { setBusy(false); }
  }

  const allOk = checks?.every((c) => c.ok === true);
  return (
    <section className="cx-card proof">
      <header className="cx-card-h"><h2>On-chain record</h2><span>Portaldot V3 testnet</span></header>
      {att ? (
        <div className="proof-body">
          <div className="proof-main">
            <p className={`proof-state ${checks ? (allOk ? "ok" : checks.some((c) => c.ok === false) ? "bad" : "") : ""}`}>
              {checks ? (allOk ? "Verified against the chain" : checks.some((c) => c.ok === false) ? "Does not match the chain" : "Checking the chain…") : "Checking…"}
            </p>
            <a className="cx-btn" href={explorerBlock(att.block_hash)} target="_blank" rel="noreferrer">View block #{att.block_number?.toLocaleString("en")} on the explorer ↗</a>
          </div>
          <dl className="kv">
            <div><dt>Extrinsic</dt><dd><code>{att.tx_hash.slice(0, 20)}…</code></dd></div>
            <div><dt>Signed by</dt><dd><code>{att.signer === "env" ? "the run key" : short(att.signer)}</code></dd></div>
            <div><dt>Remark</dt><dd><code className="wrap">{att.payload}</code></dd></div>
          </dl>
          {checks && <ul className="proof-checks">{checks.map((c) => <li key={c.what} className={c.ok === null ? "wait" : c.ok ? "ok" : "bad"}><span>{c.what}</span>{c.detail && <code>{c.detail}</code>}</li>)}</ul>}
        </div>
      ) : (
        <p className="pad muted">{failed ? `Not recorded: ${failed}` : "This run finished before runs were recorded on-chain."}</p>
      )}
      {files["result.json"] && (
        <div className="proof-cosign">
          {co ? (
            <p>Also signed by your wallet <code>{short(co.signer)}</code> in <a href={explorerBlock(co.block_hash)} target="_blank" rel="noreferrer">block #{co.block_number?.toLocaleString("en")} ↗</a></p>
          ) : (
            <>
              <button type="button" className="cx-ghost" disabled={!sub || busy} onClick={cosign}>{busy ? "Signing…" : att ? "Co-sign with your wallet" : "Record with your wallet"}</button>
              <small>{sub ? `${sub.wallet.name} ${short(sub.address)} signs the same remark on V3` : "Connect a Polkadot wallet (top right) to sign it yourself"}</small>
            </>
          )}
          {err && <p className="bad">{err}</p>}
        </div>
      )}
    </section>
  );
}
