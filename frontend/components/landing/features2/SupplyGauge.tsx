"use client";

import { useRef } from "react";
import type { Bind, Kids } from "@/components/landing/bind";
import { frameLoop, useVisibleOnce } from "../fx";
import SupplyGaugeView from "./SupplyGaugeView";
import { watchIssuance } from "../data";

// "Supply. Conserved!": live from mainnet. Each block's TotalIssuance change floats up behind the
// window; the needle is the time since the last block (full scale: two 60 s block times).
export default function SupplyGauge() {
  const root = useRef<HTMLDivElement | null>(null);
  const texts = useRef<HTMLDivElement | null>(null);
  const meter = useRef<HTMLDivElement | null>(null);
  const shade = useRef<HTMLImageElement | null>(null);
  const tick = useRef<HTMLDivElement | null>(null);

  useVisibleOnce(root, () => {
    // Real mainnet reads: every new block floats up its TotalIssuance change ("+0 PLANCK #n"), and the
    // needle shows the seconds since the last block (a late block turns the meter red and shakes it).
    const host = texts.current, shake = root.current, hue = meter.current, sh = shade.current, needle = tick.current;
    if (!host || !shake || !hue || !sh || !needle) return;
    const floats: Animation[] = [];
    const box = host.getBoundingClientRect();
    const reading = (text: string, seed: number) => {
      const x = -32 + ((seed * 97) % 1000) / 1000 * (box.width + 64);
      const span = document.createElement("span");
      span.style.color = "rgba(164, 164, 164, 0.35)";
      span.innerText = text;
      host.appendChild(span);
      const a = span.animate(
        { transform: [`translate(${x}px, ${box.height}px)`, `translate(${x}px, -100%)`], filter: ["blur(0px)", "blur(0px)", "blur(0px)", "blur(0px)", "blur(5px)"] },
        { duration: 6000, fill: "forwards" },
      );
      a.onfinish = () => { span.remove(); floats.splice(floats.indexOf(a), 1); };
      floats.push(a);
    };
    let prev: bigint | null = null, lastAt = 0;
    const unwatch = watchIssuance(({ block, issuance, at }) => {
      if (prev !== null) {
        const d = issuance - prev;
        reading(`${d >= 0n ? "+" : "−"}${(d < 0n ? -d : d).toLocaleString("en")} PLANCK · #${block.toLocaleString("en")}`, block);
      }
      prev = issuance; lastAt = at;
    });
    // Mainnet's runtime sets MILLISECS_PER_BLOCK = 60_000: full scale is two block times.
    const FULL_S = 120;
    const move = () => {
      if (!lastAt) return;
      const t = Math.min((Date.now() - lastAt) / 1000 / FULL_S, 1);
      const deg = -113 + t * 225;
      needle.style.rotate = `${deg}deg`;
      sh.style.rotate = `${deg + 117.5}deg`;
      hue.style.filter = `hue-rotate(${t > 0.8 ? 127 : 0}deg)`;
      const e = Math.max(t - 0.6, 0) * 3;
      if (e) shake.animate(
        { transform: [`translate(-${e}px, ${e}px)`, `translate(${e}px, -${e}px)`, `translate(-${e}px, -${e}px)`, `translate(${e}px, ${e}px)`] },
        { duration: 120, iterations: 3, easing: "ease-in-out" },
      );
    };
    const timer = window.setInterval(move, 500);
    const stop = frameLoop({
      target: host,
      animate: () => {},
      onOutOfView: () => floats.forEach((a) => a.pause()),
      onInView: () => floats.forEach((a) => a.play()),
    });
    return () => { stop(); clearInterval(timer); unwatch(); floats.forEach((a) => a.cancel()); host.replaceChildren(); };
  });

  const refs: Record<string, unknown> = { root, texts, meter, shade, tick };
  const b: Bind = (key) => (refs[key] ? { ref: refs[key] } : {});
  const k: Kids = () => undefined;
  return <SupplyGaugeView b={b} k={k} />;
}
