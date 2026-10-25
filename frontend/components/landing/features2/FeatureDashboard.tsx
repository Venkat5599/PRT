"use client";

import { useRef, useState } from "react";
import type { Bind, Kids } from "@/components/landing/bind";
import { swap } from "@/components/landing/bind";
import { isMobile } from "../fx";
import FeatureDashboardView from "./FeatureDashboardView";

// The recorded-run report in a browser frame. The sidebar jumps the report to a section, the
// "scroll to explore" hint hides once the report is scrolled, and on narrow screens the
// horizontally scrolling sidebar fades at whichever edge has more items.
const TARGETS = ["#basic-validation", "#smoke-testing", "#build-artifacts", "#static-analytics", "#build-logging"];

export default function FeatureDashboard() {
  const scroller = useRef<HTMLDivElement | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [edges, setEdges] = useState({ start: true, end: false });

  const b: Bind = (key, i, base) => {
    switch (key) {
      case "scroller":
        return {
          ref: scroller,
          onScroll: (e: React.UIEvent<HTMLDivElement>) => { if (!isMobile()) setScrolled(e.currentTarget.scrollTop > 0); },
        };
      case "hint":
        return { className: swap(base, ["opacity-0", "translate-y-full"], [scrolled && "opacity-0 translate-y-full"]) };
      case "side":
        return {
          onScroll: (e: React.UIEvent<HTMLDivElement>) => {
            const t = e.currentTarget;
            setEdges({ start: t.scrollLeft === 0, end: t.scrollLeft + t.clientWidth >= t.scrollWidth });
          },
        };
      case "fade": {
        const hidden = i === 0 ? edges.start : edges.end;
        return { className: swap(base, ["opacity-0"], [hidden && "opacity-0"]) };
      }
      case "navBtn":
        return {
          onClick: () => {
            const box = scroller.current;
            const target = box?.querySelector<HTMLElement>(TARGETS[i]);
            if (!box || !target) return;
            const pad = parseInt(getComputedStyle(box).paddingTop, 10);
            box.scrollTo({ top: target.offsetTop - pad, behavior: "smooth" });
          },
        };
    }
    return {};
  };
  const k: Kids = () => undefined;
  return <FeatureDashboardView b={b} k={k} />;
}
