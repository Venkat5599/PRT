"use client";

import { useEffect, useState } from "react";
import { Node } from "@/lib/canary";

// Two live lanes in the hero: real heads from mainnet and the V3 testnet, streamed
// over WebSocket. Every cell is a real block number; new ones slide in from the right.
const CHAINS = [
  { key: "mainnet", label: "Mainnet", url: "wss://mainnet.portaldot.io" },
  { key: "v3", label: "V3 testnet", url: "wss://test-node-v3.portaldot.dev" },
] as const;
const CELLS = 8;

type Lane = { blocks: number[]; state: "connecting" | "live" | "down" };

function useHeads(url: string): Lane {
  const [lane, setLane] = useState<Lane>({ blocks: [], state: "connecting" });
  useEffect(() => {
    const node = new Node(url, { timeout: 15000 });
    let alive = true;
    const push = (n: number) => {
      if (!alive) return;
      setLane((l) => {
        if (l.blocks.at(-1) === n) return l;
        // Fill the chain behind the first head we see: block numbers are consecutive.
        const base = l.blocks.length ? l.blocks : Array.from({ length: CELLS - 1 }, (_, i) => n - CELLS + 1 + i).filter((b) => b >= 0);
        return { blocks: [...base, n].slice(-CELLS), state: "live" };
      });
    };
    node.onclose = () => alive && setLane((l) => ({ ...l, state: "down" }));
    node.heads((h) => push(parseInt(h.number, 16))).catch(() => alive && setLane((l) => ({ ...l, state: "down" })));
    return () => { alive = false; node.close(); };
  }, [url]);
  return lane;
}

function LaneRow({ label, url }: { label: string; url: string }) {
  const { blocks, state } = useHeads(url);
  const head = blocks.at(-1);
  const cells = blocks.length ? blocks : Array.from({ length: CELLS }, () => null);
  return (
    <div className={`rib-lane is-${state}`}>
      <span className="rib-name">{label}</span>
      <ol className="rib-cells" aria-hidden="true">
        {cells.map((b, i) => (
          <li key={b ?? `e${i}`} className={b != null && b === head ? "rib-head" : undefined}>{b != null ? `#${String(b).slice(-4)}` : ""}</li>
        ))}
      </ol>
      <span className="rib-num" aria-live="off">
        {state === "down" ? "unreachable" : head != null ? `#${head.toLocaleString("en")}` : "connecting"}
      </span>
    </div>
  );
}

export default function ChainRibbon() {
  return (
    <div className="ribbon" aria-label="Live block heads from Portaldot mainnet and the V3 testnet">
      {CHAINS.map((c) => <LaneRow key={c.key} label={c.label} url={c.url} />)}
    </div>
  );
}
