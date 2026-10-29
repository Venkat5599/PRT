"use client";

import { useEffect, useState } from "react";
import { liveCompare, mainnetRuntime, v3Runtime } from "./data";

// A number on the landing page read live: the mainnet → V3 change count from the in-browser diff,
// or how many runtime APIs each chain exposes. Shows "…" until the nodes answer, never a guess.
export default function LiveStat({ kind }: { kind: "changes" | "apis" }) {
  const [v, setV] = useState<string>("…");
  useEffect(() => {
    let live = true;
    const job = kind === "changes"
      ? liveCompare().then((c) => c.changes.length.toLocaleString("en"))
      : Promise.all([mainnetRuntime(), v3Runtime()]).then(([a, b]) => `${a.runtime_version.apis.length} vs ${b.runtime_version.apis.length}`);
    job.then((x) => live && setV(x)).catch(() => live && setV("–"));
    return () => { live = false; };
  }, [kind]);
  return <>{v}</>;
}
