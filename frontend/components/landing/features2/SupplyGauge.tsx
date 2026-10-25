"use client";

import { useRef } from "react";
import type { Bind, Kids } from "@/components/landing/bind";
import { frameLoop, useVisibleOnce } from "../fx";
import SupplyGaugeView from "./SupplyGaugeView";

// "Supply. Conserved!": a load meter whose needle wanders, "+0 PLANCK" readings float up
// behind the window, and the meter shakes harder (and shifts hue) as the needle climbs.
export default function SupplyGauge() {
  const root = useRef<HTMLDivElement | null>(null);
  const texts = useRef<HTMLDivElement | null>(null);
  const meter = useRef<HTMLDivElement | null>(null);
  const shade = useRef<HTMLImageElement | null>(null);
  const tick = useRef<HTMLDivElement | null>(null);

  useVisibleOnce(root, () => {
    // the meter disc takes the hue shift; the whole gauge (root overlay) shakes
    const host = texts.current, shake = root.current, hue = meter.current, sh = shade.current, needle = tick.current;
    if (!host || !shake || !hue || !sh || !needle) return;
    const floats: Animation[] = [];
    const box = host.getBoundingClientRect();
    const timers: number[] = [];
    const reading = (from?: number) => {
      const x = -32 + Math.random() * (box.width + 64);
      const y = from || box.height;
      const span = document.createElement("span");
      span.style.color = `rgba(164, 164, 164, ${0.2 + Math.random() * 0.2})`;
      span.innerText = "+0 PLANCK";
      host.appendChild(span);
      const a = span.animate(
        { transform: [`translate(${x}px, ${y}px)`, `translate(${x}px, -100%)`], filter: ["blur(0px)", "blur(0px)", "blur(0px)", "blur(0px)", "blur(5px)"] },
        { duration: (y / box.height) * 3000 + Math.random() * 1000, fill: "forwards" },
      );
      a.onfinish = () => { span.remove(); floats.splice(floats.indexOf(a), 1); };
      floats.push(a);
    };
    for (let i = 0; i < 10; i++) reading(Math.random() * box.height);
    let load = 60 + Math.random() * 50;
    const move = () => {
      if (load > 100) load -= Math.random() * 20;
      else if (load < 20 || Math.random() > 0.5) load += Math.random() * 20;
      else load -= Math.random() * 20;
      const t = load / 120;
      const deg = -113 + t * 225;
      needle.style.rotate = `${deg}deg`;
      sh.style.rotate = `${deg + 117.5}deg`;
      hue.style.filter = `hue-rotate(${t > 0.8 ? 127 : 0}deg)`;
      const e = Math.max(t - 0.3, 0) * 1.5;
      shake.animate(
        { transform: [`translate(-${e}px, ${e}px)`, `translate(${e}px, -${e}px)`, `translate(-${e}px, -${e}px)`, `translate(${e}px, ${e}px)`] },
        { duration: t * 150, fill: "forwards", iterations: 6, easing: "ease-in-out" },
      );
      // readings emitted while the needle moves always start from the bottom edge
      reading();
      timers.push(window.setTimeout(() => reading(), 50));
      timers.push(window.setTimeout(() => reading(), 100));
    };
    move();
    let frame = 0;
    const stop = frameLoop({
      target: host,
      animate: () => { if (frame % 20 === 0) move(); frame += 1; },
      onOutOfView: () => floats.forEach((a) => a.pause()),
      onInView: () => floats.forEach((a) => a.play()),
    });
    return () => { stop(); timers.forEach(clearTimeout); floats.forEach((a) => a.cancel()); host.replaceChildren(); };
  });

  const refs: Record<string, unknown> = { root, texts, meter, shade, tick };
  const b: Bind = (key) => (refs[key] ? { ref: refs[key] } : {});
  const k: Kids = () => undefined;
  return <SupplyGaugeView b={b} k={k} />;
}
