"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { Bind, Kids } from "@/components/landing/bind";
import { swap } from "@/components/landing/bind";
import HeaderPanelView from "./HeaderPanelView";

// The desktop Tools dropdown. It is fixed-positioned under the header, so after mount it
// renders into document.body: the scrolled header is transformed and blurred, which would
// otherwise turn it into the panel's containing block.
export type PanelProps = {
  open: boolean;
  scrolled: boolean;
  top: number;
  left: number;
  panelRef: (el: HTMLDivElement | null) => void;
  onEnter: () => void;
  onLeave: (e: React.MouseEvent) => void;
};

export default function HeaderPanel(p: Partial<PanelProps>) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const b: Bind = (key, i, base) => {
    if (key === "panel") {
      return {
        ref: p.panelRef,
        className: swap(base, ["pointer-events-none", "pointer-events-auto"], [p.open ? "pointer-events-auto" : "pointer-events-none"]),
        style: { top: `${p.top ?? -10000}px`, left: `${p.left ?? -10000}px`, width: "472px", display: p.open ? "block" : "none" },
        onMouseEnter: p.onEnter,
        onMouseLeave: p.onLeave,
      };
    }
    if (key === "variant") {
      // 0 = the panel shown over the dark hero, 1 = the light one under the scrolled header
      const visible = i === 0 ? !p.scrolled : !!p.scrolled;
      return { className: visible ? "relative" : "absolute inset-0 opacity-0 pointer-events-none" };
    }
    return {};
  };
  const k: Kids = () => undefined;
  const view = <HeaderPanelView b={b} k={k} />;
  return mounted ? createPortal(view, document.body) : view;
}
