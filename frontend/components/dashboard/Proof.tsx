"use client";

import { useEffect, useState } from "react";
import { ExternalLink, Loader2, PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Node } from "@/lib/canary";
import { short, type Connected } from "@/lib/wallet";
import { file, runPayload, sha256Hex, explorerBlock, V3_WS, type Files, type Result, type RunAttestation } from "@/lib/runresult";
import { Panel, KV, Status, Mark, Mono, ErrorText } from "./kit";

// The run's record on the Portaldot V3 testnet, re-checked from this page: the run's files hash to
// result.json, result.json hashes to the remark, and the remark is in that block.
type Check = { what: string; ok: boolean | null };
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
      out.push({ what: "result.json matches the remark", ok: sha === att.report_sha256 && payload === att.payload });
      const listed = Object.entries(result?.sha256 ?? {});
      let same = 0;
      for (const [name, want] of listed) if (files[name] && (await sha256Hex(files[name].text)) === want) same++;
      out.push({ what: `${same} of ${listed.length} files match result.json`, ok: listed.length > 0 && same === listed.length });
      if (live) setChecks([...out, { what: "Remark is in the block", ok: null }]);
      try {
        const [genesis, found] = await Promise.all([v3("chain_getBlockHash", [0]), remarkInBlock(att.block_hash, att.payload)]);
        out.push({ what: "Remark is in the block", ok: found && genesis === att.genesis_hash });
      } catch { out.push({ what: "Remark is in the block", ok: false }); }
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
  const anyBad = checks?.some((c) => c.ok === false);
  return (
    <Panel flush title="On-chain record" description="Portaldot V3 testnet"
      action={att ? <Status tone={!checks ? "muted" : allOk ? "good" : anyBad ? "bad" : "muted"}>{!checks ? "Checking" : allOk ? "Verified" : anyBad ? "Mismatch" : "Checking"}</Status> : <Status tone="muted">Not recorded</Status>}>
      {att ? (
        <div className="grid md:grid-cols-[1fr_auto]">
          <KV rows={[
            ["Block", <a key="b" href={explorerBlock(att.block_hash)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">#{att.block_number?.toLocaleString("en")}<ExternalLink className="size-3" /></a>],
            ["Extrinsic", <Mono key="x">{att.tx_hash.slice(0, 22)}…</Mono>],
            ["Remark", <Mono key="r" className="break-all">{att.payload}</Mono>],
          ]} />
          {checks && (
            <ul className="space-y-2 border-t px-5 py-4 text-sm md:min-w-64 md:border-t-0 md:border-l">
              {checks.map((c) => <li key={c.what} className="flex items-center gap-2"><Mark state={c.ok === null ? "run" : c.ok ? "ok" : "bad"} />{c.what}</li>)}
            </ul>
          )}
        </div>
      ) : (
        <p className="px-5 py-4 text-sm text-muted-foreground">{failed ?? "This run predates on-chain records."}</p>
      )}
      {files["result.json"] && (
        <div className="flex flex-wrap items-center gap-3 border-t px-5 py-3">
          {co ? (
            <p className="text-sm">Co-signed by <Mono>{short(co.signer)}</Mono> in <a className="text-primary hover:underline" href={explorerBlock(co.block_hash)} target="_blank" rel="noreferrer">block #{co.block_number?.toLocaleString("en")}</a></p>
          ) : (
            <>
              <Button size="sm" variant="outline" disabled={!sub || busy} onClick={cosign}>{busy ? <Loader2 className="animate-spin" /> : <PenLine />}{att ? "Co-sign with wallet" : "Record with wallet"}</Button>
              {!sub && <span className="text-xs text-muted-foreground">Connect a Polkadot wallet</span>}
            </>
          )}
          {err && <ErrorText>{err}</ErrorText>}
        </div>
      )}
    </Panel>
  );
}
