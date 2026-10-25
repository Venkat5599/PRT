"use client";

import { useEffect, useRef, useState } from "react";
import type { Bind, Kids } from "@/components/landing/bind";
import { swap } from "@/components/landing/bind";
import HeroStageView from "./HeroStageView";

// The hero tabs follow the hero video: each tab is one act of the recording. The
// progress bar tracks playback; clicking a tab seeks the video to that act.
const ACTS = [0, 12, 26, 40];
const CAPTIONS: [string, React.ReactNode][] = [
  ["Diagnose the endpoint", <>DNS to runtime, layer by <br /> layer, on mainnet and V3.</>],
  ["Diff the runtimes", <>Every pallet compared, hazards <br /> flagged before setCode.</>],
  ["Gate the upgrade", <>Workflows run on both sides, <br /> regressions fail the build.</>],
];
const actAt = (t: number) => (t < ACTS[1] ? 0 : t < ACTS[2] ? 1 : 2);

export default function HeroStage() {
  const [act, setAct] = useState(0);
  const video = useRef<HTMLVideoElement | null>(null);
  const bar = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const v = video.current;
    if (!v) return;
    v.muted = true; // React does not render `muted`; autoplay requires it
    v.play().catch(() => {});
    let raf = 0;
    const tick = () => {
      const t = v.currentTime || 0;
      const a = actAt(t);
      setAct(a);
      if (bar.current) {
        const f = (t - ACTS[a]) / (ACTS[a + 1] - ACTS[a]);
        bar.current.style.width = `${((a + Math.max(0, Math.min(1, f))) / 3) * 100}%`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    const onTime = () => setAct(actAt(v.currentTime));
    v.addEventListener("timeupdate", onTime);
    return () => { cancelAnimationFrame(raf); v.removeEventListener("timeupdate", onTime); };
  }, []);

  const b: Bind = (key, i, base) => {
    const on = i === act;
    switch (key) {
      case "tab":
        return {
          className: swap(base, ["hero-tabs-item-active"], [on && "hero-tabs-item-active"]),
          onClick: () => { const v = video.current; if (!v) return; v.currentTime = ACTS[i] + 0.05; v.play().catch(() => {}); },
        };
      case "tabIcon":
        return { className: swap(base, ["opacity-64", "group-hover:opacity-90"], [!on && "opacity-64 group-hover:opacity-90"]) };
      case "tabText":
        return { className: swap(base, ["opacity-60", "group-hover:opacity-90"], [!on && "opacity-60 group-hover:opacity-90"]) };
      case "bar":
        return { ref: bar };
      case "video":
        return { ref: video };
    }
    return {};
  };
  const k: Kids = (key) => {
    if (key === "capTitle") return CAPTIONS[act][0];
    if (key === "capText") return CAPTIONS[act][1];
    return undefined;
  };
  return <HeroStageView b={b} k={k} />;
}
