"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Bind, Kids } from "@/components/landing/bind";
import { swap } from "@/components/landing/bind";
import HeaderView from "./HeaderView";
import type { PanelProps } from "./HeaderPanel";
import { springKeyframes } from "./spring";

// Site header. On desktop it morphs into a floating pill once the page scrolls past 400px,
// a highlight follows the hovered nav item, and Tools opens a dropdown. On mobile the
// menu button opens a full-screen nav.
const MOBILE = 768;
const THRESHOLD = 400;
const PANEL_W = 472;
const CLOSED_ITEM = ["md-max:-translate-x-32", "md-max:blur-[2px]", "md-max:opacity-0", "!delay-[0s]"];
const DARK = ["button-dark"];
const OUTLINE = ["button-outline", "hover:bg-body-stroke-lighter", "before:inside-border", "hover:before:opacity-0", "before:border-body-stroke-lighter", "active:bg-black/10"];
const TOOLS_BASE = "relative md:block hidden flex items-center gap-6 md-max:font-500 md-max:font-title transition-all rounded-25 duration-200 header-nav-item group";
const isMobile = () => innerWidth < MOBILE;

type Dropdown = "closed" | "over-trigger" | "over-menu";
type Init = "not-initialized" | "initializing" | "initialized";

/** The original's entrance: a spring (stiffness 190, damping 20) sampled into WAAPI keyframes. */
function springIn(el: HTMLElement) {
  const { keyframes, duration } = springKeyframes(190, 20, 0, 1);
  const frames = keyframes.map((p) => ({
    opacity: String(Math.min(1, Math.max(0, p))),
    transform: `translateY(${-84 * (1 - p)}px) scale(${0.9 + 0.1 * p})`,
    filter: `blur(${Math.max(0, 4 * (1 - p))}px)`,
  }));
  return el.animate(frames, { duration: duration * 1000, fill: "forwards" });
}

const CloseIcon = () => (
  <svg fill="none" height="22" viewBox="0 0 22 22" width="22" xmlns="http://www.w3.org/2000/svg">
    <path d="M7.33337 7.3335L14.6667 14.6668M14.6667 7.3335L7.33337 14.6668" stroke="url(#paint0_linear_1882_10665)" strokeLinecap="round" strokeWidth="1.83333" />
    <defs>
      <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_1882_10665" x1="11" x2="11" y1="7.3335" y2="14.6668">
        <stop stopColor="white" style={{ stopColor: "white", stopOpacity: 1 }} />
        <stop offset="1" stopColor="white" stopOpacity="0.8" style={{ stopColor: "white", stopOpacity: 0.8 }} />
      </linearGradient>
    </defs>
  </svg>
);

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);
  const [mTools, setMTools] = useState(false);
  const [init, setInit] = useState<Init>("not-initialized");
  const [centering, setCentering] = useState<number | null>(null);
  const [drop, setDrop] = useState<Dropdown>("closed");
  const [pos, setPos] = useState({ top: -10000, left: -10000 });

  const root = useRef<HTMLDivElement | null>(null);
  const inner = useRef<HTMLElement | null>(null);
  const list = useRef<HTMLDivElement | null>(null);
  const pill = useRef<HTMLDivElement | null>(null);
  const trigger = useRef<HTMLDivElement | null>(null);
  const panel = useRef<HTMLDivElement | null>(null);
  const closeTimer = useRef<number | undefined>(undefined);
  const scrolledRef = useRef(false);
  const initRef = useRef<Init>("not-initialized");
  const busy = useRef(false);
  const open = drop !== "closed";

  // --- nav highlight pill ---
  const hoverIn = useCallback((target: Element) => {
    const item = target.closest(".header-nav-item") as HTMLElement | null;
    const bg = pill.current;
    if (!item || !bg) return;
    const x = item.offsetLeft;
    Object.assign(bg.style, { top: `${item.offsetTop}px`, height: `${item.clientHeight}px`, opacity: "1", transform: `translate(${x}px, 0px)`, width: `${item.clientWidth}px` });
    const o = Number(getComputedStyle(bg).opacity);
    const fresh = !o || o < 0.8;
    bg.dataset.x = String(x);
    bg.animate(
      { transform: fresh ? [`translate(${x}px, 20px)`, `translate(${x}px, 0px)`] : `translate(${x}px, 0px)`, width: fresh ? [`${item.clientWidth}px`, `${item.clientWidth}px`] : `${item.clientWidth}px`, opacity: 1 },
      { duration: 200, easing: "ease-in-out", fill: "both" },
    );
  }, []);
  const hoverOut = useCallback(() => {
    const bg = pill.current;
    const x = Number(bg?.dataset.x);
    if (!bg || bg.dataset.x === undefined || bg.dataset.x === "" || Number.isNaN(x)) return;
    bg.animate({ opacity: 0, transform: `translate(${x}px, 20px)` }, { duration: 200, easing: "cubic-bezier(0.76, 0, 0.24, 1)", fill: "both", delay: 100 });
  }, []);

  // --- nav centering + scroll morph (desktop) ---
  const initNav = useCallback(() => {
    if (!list.current || initRef.current !== "not-initialized") return;
    initRef.current = "initializing";
    setInit("initializing");
    setCentering(list.current.offsetLeft);
    setTimeout(() => { initRef.current = "initialized"; setInit("initialized"); }, 100);
  }, []);
  const reset = useCallback(() => {
    scrolledRef.current = false;
    initRef.current = "not-initialized";
    setScrolled(false);
    setInit("not-initialized");
    setCentering(null);
  }, []);

  useEffect(() => {
    const onScroll = async () => {
      if (isMobile()) { reset(); return; }
      if (!root.current || !inner.current) return;
      initNav();
      if (initRef.current !== "initialized" || busy.current) return;
      const want = scrollY > THRESHOLD;
      if (want === scrolledRef.current) return;
      scrolledRef.current = want;
      const el = inner.current;
      if (!want) {
        busy.current = true;
        await el.animate({ opacity: 0, transform: "translate(0, -84px) scale(0.9)", filter: "blur(4px)" }, { duration: 300, easing: "ease", fill: "forwards" }).finished.catch(() => {});
        el.getAnimations().forEach((a) => a.cancel());
        Object.assign(el.style, { opacity: "1", transform: "translate(0, 0) scale(1)", filter: "blur(0px)" });
        busy.current = false;
        setScrolled(false);
        if (scrollY > THRESHOLD) onScroll();
        return;
      }
      setScrolled(true);
      el.getAnimations().forEach((a) => a.cancel());
      springIn(el);
    };
    const onResize = () => {
      if (!root.current || !list.current) return;
      if (isMobile()) { reset(); return; }
      initNav();
      const want = scrollY > THRESHOLD;
      if (want !== scrolledRef.current) { scrolledRef.current = want; setScrolled(want); }
    };
    document.addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onResize);
    return () => { document.removeEventListener("scroll", onScroll); removeEventListener("resize", onResize); };
  }, [initNav, reset]);

  // --- Tools dropdown ---
  const place = useCallback(() => {
    const t = trigger.current;
    if (!t) return;
    const r = t.getBoundingClientRect();
    setPos({ top: r.bottom + 8 + (scrolledRef.current ? 14 : 0), left: Math.max((innerWidth - PANEL_W) / 2, 0) });
  }, []);
  const cancelClose = () => { if (closeTimer.current !== undefined) { clearTimeout(closeTimer.current); closeTimer.current = undefined; } };
  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = window.setTimeout(() => {
      setDrop("closed");
      closeTimer.current = undefined;
      if (trigger.current && !document.querySelector(".header-nav-list .header-nav-item:hover")) hoverOut();
    }, 200);
  };
  useEffect(() => {
    if (!open) return;
    place();
    let raf = 0;
    const again = () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; place(); }); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setDrop("closed"); };
    const onClick = (e: MouseEvent) => {
      const t = e.target as Node;
      if (trigger.current && !trigger.current.contains(t) && panel.current && !panel.current.contains(t)) setDrop("closed");
    };
    addEventListener("scroll", again, true);
    addEventListener("resize", again);
    document.addEventListener("keydown", onKey);
    document.addEventListener("click", onClick);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("scroll", again, true);
      removeEventListener("resize", again);
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("click", onClick);
    };
  }, [open, scrolled, place]);
  useEffect(() => () => cancelClose(), []);

  const panelProps: PanelProps = {
    open,
    scrolled,
    top: pos.top,
    left: pos.left,
    panelRef: (el) => { panel.current = el; },
    onEnter: () => { cancelClose(); setDrop("over-menu"); if (trigger.current) hoverIn(trigger.current); },
    onLeave: (e) => {
      const to = e.relatedTarget as Node | null;
      if (to instanceof Node && trigger.current?.contains(to)) { setDrop("over-trigger"); return; }
      scheduleClose();
    },
  };

  const toggleMenu = () => {
    const next = !menu;
    setMenu(next);
    if (!next) setMTools(false);
    scrollTo(0, 0);
    document.body.classList.toggle("overflow-hidden", next);
  };
  useEffect(() => () => document.body.classList.remove("overflow-hidden"), []);

  const closedItem = (base: string) => swap(base, CLOSED_ITEM, [!menu && CLOSED_ITEM.join(" ")]);
  const b: Bind = (key, i, base) => {
    switch (key) {
      case "root":
        return { ref: root, className: swap(base, ["header-scrolled"], [scrolled && "header-scrolled"]) };
      case "inner":
        return { ref: inner };
      case "nav":
        return { className: swap(base, ["md-max:opacity-0", "md-max:pointer-events-none", "md-max:!full-width"], [!menu && "md-max:opacity-0 md-max:pointer-events-none md-max:!full-width"]) };
      case "list":
        return {
          ref: list,
          className: swap(base, ["mx-auto"], [init === "not-initialized" && "mx-auto"]),
          style: centering !== null ? ({ "--centering-x": `${centering}px` } as React.CSSProperties) : undefined,
        };
      case "pill":
        return { ref: pill };
      case "mTools":
        return { className: closedItem(base), "aria-expanded": mTools ? "true" : "false", onClick: () => setMTools((v) => !v) };
      case "mToolsIcon":
        return { className: swap(base, ["rotate-0", "rotate-90"], [mTools ? "rotate-90" : "rotate-0"]) };
      case "mPanel":
        return {
          "aria-hidden": mTools ? "false" : "true",
          className: swap(base, ["hidden", "opacity-100", "translate-y-0", "max-h-[360px]", "mt-4"], [mTools ? "opacity-100 translate-y-0 max-h-[360px] mt-4" : "hidden"]),
        };
      case "tools":
        return {
          ref: trigger,
          "aria-expanded": open ? "true" : "false",
          className: `${TOOLS_BASE} ${scrolled ? "px-12 py-6 text-[var(--body-light-loud)]" : open ? "px-20 py-8 md:px-12 text-white" : "px-20 py-8 md:px-12 text-white/72 hover:text-white"}`,
          onMouseEnter: (e: React.MouseEvent) => { cancelClose(); place(); setDrop("over-trigger"); hoverIn(e.currentTarget); },
          onMouseLeave: (e: React.MouseEvent) => {
            const to = e.relatedTarget as Node | null;
            if (to instanceof Node && panel.current?.contains(to)) { setDrop("over-menu"); return; }
            scheduleClose();
          },
        };
      case "toolsIcon":
        return { color: scrolled ? "black" : "white", className: swap(base, ["opacity-50", "group-hover:opacity-100", "opacity-100"], [open ? "opacity-100" : "opacity-50 group-hover:opacity-100"]) };
      case "toolsIconPath": {
        const c = scrolled ? "black" : "white";
        return { fill: c, style: { fill: c, fillOpacity: 1 } };
      }
      case "link":
        return { className: closedItem(base), onMouseEnter: (e: React.MouseEvent) => hoverIn(e.currentTarget), onMouseLeave: hoverOut };
      case "mGit":
        return { className: swap(base, ["md-max:translate-y-full", "md-max:opacity-0"], [!menu && "md-max:translate-y-full md-max:opacity-0"]) };
      case "variantBtn":
        return { className: scrolled ? swap(base, DARK, OUTLINE) : base };
      case "menuBtn":
        return { onClick: toggleMenu };
      case "panel":
        return panelProps;
    }
    return {};
  };
  const k: Kids = (key) => (key === "menuIcon" && menu ? <CloseIcon /> : undefined);
  return <HeaderView b={b} k={k} />;
}
