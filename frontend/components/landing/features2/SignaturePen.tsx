"use client";

import { useRef } from "react";
import type { Bind, Kids } from "@/components/landing/bind";
import { useVisibleOnce } from "../fx";
import SignaturePenView from "./SignaturePenView";

// "Attestation made easy": a pen (and its shadow) flies in, then signs the line: the path is
// drawn with an ease-out while the pen rides the stroke, tilting with its direction.
export default function SignaturePen() {
  const svg = useRef<SVGSVGElement | null>(null);
  const pen = useRef<HTMLDivElement | null>(null);
  const shadow = useRef<HTMLDivElement | null>(null);

  useVisibleOnce(svg, () => {
    const path = svg.current?.querySelector("path");
    const a = pen.current, s = shadow.current;
    if (!path || !a || !s) return;
    let stopped = false;
    let raf = 0;
    const timers: number[] = [];
    const len = Math.floor(path.getTotalLength()) + 1;
    const ease = (x: number) => 1 - Math.pow(1 - x, 4);
    let t = 0;
    let last = { x: 0, y: 0 };
    let tilt = 0;
    const step = () => {
      const d = ease(t) * len;
      const p = path.getPointAtLength(d);
      path.setAttribute("stroke-dashoffset", `${len - d}`);
      const angle = Math.atan2(p.y - last.y, p.x - last.x) * (180 / Math.PI);
      tilt += (Math.max(-3, Math.min(10, angle)) - tilt) * 0.025;
      a.style.transform = `translate(${p.x}px, ${p.y}px) rotate(${60 + tilt}deg)`;
      s.style.transform = `translate(${p.x}px, ${p.y}px) rotate(${120 - tilt}deg)`;
      last = { x: p.x, y: p.y };
      t += 0.004;
    };
    const draw = () => { if (stopped) return; step(); if (t < 1) raf = requestAnimationFrame(draw); };
    step();
    timers.push(window.setTimeout(() => {
      const o = path.getPointAtLength(0);
      const easing = "cubic-bezier(0.76, 0, 0.24, 1)";
      Promise.all([
        a.animate({ opacity: [0, 1], transform: [`translate(${o.x + 110}px, ${o.y - 60}px) rotate(60deg)`, `translate(${o.x}px, ${o.y}px) rotate(60deg)`] }, { duration: 600, easing }).finished,
        s.animate({ opacity: [0, 1], transform: [`translate(${o.x + 110}px, ${o.y + 60}px) rotate(120deg)`, `translate(${o.x}px, ${o.y}px) rotate(120deg)`] }, { duration: 600, easing }).finished,
      ]).then(() => {
        if (stopped) return;
        a.style.opacity = "1";
        s.style.opacity = "1";
        a.style.transform = `translate(${o.x}px, ${o.y}px) rotate(60deg)`;
        s.style.transform = `translate(${o.x}px, ${o.y}px) rotate(120deg)`;
        timers.push(window.setTimeout(draw, 1000));
      }).catch(() => {});
    }, 1000));
    return () => { stopped = true; cancelAnimationFrame(raf); timers.forEach(clearTimeout); };
  });

  const b: Bind = (key) => (key === "svg" ? { ref: svg } : key === "pen" ? { ref: pen } : key === "shadow" ? { ref: shadow } : {});
  const k: Kids = () => undefined;
  return <SignaturePenView b={b} k={k} />;
}
