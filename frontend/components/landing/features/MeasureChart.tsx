"use client";

import { useRef, useState } from "react";
import type { Bind, Kids } from "@/components/landing/bind";
import { swap } from "@/components/landing/bind";
import { useVisibleOnce } from "../fx";
import MeasureChartView from "./MeasureChartView";

// "Measure the blast radius": 2.5s after the chart comes into view, a highlight starts hopping
// between the four bar groups every 1.5s; the legend slides in and the picked group bounces.
const GROUPS = 4;

export default function MeasureChart() {
  const root = useRef<HTMLDivElement | null>(null);
  const hover = useRef<HTMLDivElement | null>(null);
  const chart = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState(-1);

  useVisibleOnce(root, () => {
    const timers: number[] = [];
    let interval: number | undefined;
    const pick = () => {
      const i = Math.floor(Math.random() * GROUPS);
      setActive(i);
      const item = chart.current?.children[i] as HTMLElement | undefined;
      const h = hover.current;
      if (!item || !h) return;
      h.style.opacity = "1";
      h.style.transform = `translateX(${item.offsetLeft}px)`;
      h.style.height = `${item.offsetHeight + 16}px`;
    };
    timers.push(window.setTimeout(() => {
      const h = hover.current;
      if (!h) return;
      h.classList.add("transition-opacity");
      pick();
      timers.push(window.setTimeout(() => {
        h.classList.remove("transition-opacity");
        h.classList.add("transition-all");
        interval = window.setInterval(pick, 1500);
      }, 100));
    }, 2500));
    return () => { timers.forEach(clearTimeout); clearInterval(interval); };
  });

  const b: Bind = (key, i, base) => {
    switch (key) {
      case "root":
        return { ref: root };
      case "labels":
        return { className: swap(base, ["translate-y-32", "opacity-0", "grayscale"], [active === -1 && "translate-y-32 opacity-0 grayscale"]) };
      case "hover":
        return { ref: hover };
      case "chart":
        return { ref: chart, className: swap(base, ["features-measure-chart-initial"], [active === -1 && "features-measure-chart-initial"]) };
      case "item":
        return { className: swap(base, ["features-measure-chart-item-active"], [i === active && "features-measure-chart-item-active"]) };
    }
    return {};
  };
  const k: Kids = () => undefined;
  return <MeasureChartView b={b} k={k} />;
}
