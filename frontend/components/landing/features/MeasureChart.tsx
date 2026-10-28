"use client";

import { useRef, useState } from "react";
import type { Bind, Kids } from "@/components/landing/bind";
import { swap } from "@/components/landing/bind";
import { useVisibleOnce } from "../fx";
import MeasureChartView from "./MeasureChartView";
import { liveCompare, byCategory, CATEGORIES } from "../data";

// "Measure the blast radius": mainnet vs the V3 testnet, read from both nodes and diffed in the page.
// Each group is one item category (calls, events, storage, constants); its three bars are the items
// added, removed and changed, scaled on a log axis. Once the numbers land the highlight walks the groups.
const GROUPS = 4;
const KINDS = ["added", "removed", "modified"] as const;
const NAMES = { call: "Calls", event: "Events", storage: "Storage items", constant: "Constants" };

export default function MeasureChart() {
  const root = useRef<HTMLDivElement | null>(null);
  const hover = useRef<HTMLDivElement | null>(null);
  const chart = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState(-1);

  useVisibleOnce(root, () => {
    const timers: number[] = [];
    let interval: number | undefined;
    let n = -1, live = true;
    const pick = () => {
      const i = (n = (n + 1) % GROUPS);
      setActive(i);
      const item = chart.current?.children[i] as HTMLElement | undefined;
      const h = hover.current;
      if (!item || !h) return;
      h.style.opacity = "1";
      h.style.transform = `translateX(${item.offsetLeft}px)`;
      h.style.height = `${item.offsetHeight + 16}px`;
    };
    liveCompare().then((c) => {
      const items = [...(chart.current?.children ?? [])] as HTMLElement[];
      if (!live || items.length < GROUPS) return;
      const cat = byCategory(c);
      const max = Math.max(1, ...CATEGORIES.flatMap((k) => KINDS.map((x) => cat[k][x])));
      CATEGORIES.forEach((k, g) => {
        const bars = [...items[g].children].filter((el) => (el as HTMLElement).style.getPropertyValue("--bar-index") !== "") as HTMLElement[];
        bars.forEach((bar, j) => { const v = cat[k][KINDS[j]]; bar.style.height = `${v ? 4 + Math.round(63 * Math.log1p(v) / Math.log1p(max)) : 2}px`; });
        items[g].title = `${NAMES[k]}: +${cat[k].added} added, −${cat[k].removed} removed, ~${cat[k].modified} changed (mainnet → V3)`;
        items[g].setAttribute("aria-label", items[g].title);
      });
      const h = hover.current;
      if (!h) return;
      h.classList.add("transition-opacity");
      pick();
      timers.push(window.setTimeout(() => {
        h.classList.remove("transition-opacity");
        h.classList.add("transition-all");
        interval = window.setInterval(pick, 1500);
      }, 100));
    }).catch(() => { /* nodes unreachable: the chart stays empty rather than inventing bars */ });
    return () => { live = false; timers.forEach(clearTimeout); clearInterval(interval); };
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
