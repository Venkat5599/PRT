"use client";

import { useEffect, useRef, useState } from "react";
import { animate } from "motion";

// The screenshot wall: a view of the active surface above a dock of nine surfaces.
// Clicking a dock item crossfades the view; the dock magnifies under the cursor.
const ITEMS = [
  { key: "compare", label: "Live compare" },
  { key: "doctor", label: "Doctor" },
  { key: "runs", label: "Test runs" },
  { key: "invariants", label: "Invariants" },
  { key: "cli-ci", label: "CLI and CI" },
  { key: "mainnet-v3", label: "Mainnet vs V3" },
  { key: "ed100x", label: "Deposit \u00d7100" },
  { key: "fee10x", label: "Byte fee \u00d710" },
  { key: "control", label: "Control run" },
];
const MIN = 72;
const MAX = 100;
const REACH = 200;
const VIEW_MS = 1000; // view enter/leave
const DOT_MS = 500; // active dot enter/leave
const TOOLTIP =
  "top-0 outline backdrop-blur-8 outline-[#192E4E] outline-1 duration-[200ms] blur-[4px] group-hover:blur-[0px] scale-90 group-hover:scale-100 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition group-hover:-translate-y-full px-14 py-4 center-x wall-testimonials-dock-item-tooltip before:inside-border before:border-white/6 rounded-6 text-body-normal text-white whitespace-nowrap";
const DOCK =
  "wall-testimonials-dock -mt-40 md:-mt-100 gap-2 md:gap-3 p-6 flex items-end max-w-[calc(100%-32px)] h-52 md:h-84 rounded-12 md:rounded-24 w-max mx-auto relative before:inside-border before:border-[#FFFFFF0F]";

type Phase = "enter" | "shown" | "leave";
type Layer = { id: number; index: number; phase: Phase };
const cls = (...p: (string | false | null | undefined)[]) => p.filter(Boolean).join(" ");

/** Mount/unmount with an enter frame and a delayed removal, like the original presence helper. */
function usePresence(index: number, leaveMs: number) {
  const [layers, setLayers] = useState<Layer[]>([{ id: 0, index, phase: "shown" }]);
  const seq = useRef(0);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    const id = ++seq.current;
    setLayers((ls) => [...ls.map((l) => (l.phase === "leave" ? l : { ...l, phase: "leave" as Phase })), { id, index, phase: "enter" }]);
    const settle = setTimeout(() => setLayers((ls) => ls.map((l) => (l.id === id ? { ...l, phase: "shown" } : l))), 100);
    const drop = setTimeout(() => setLayers((ls) => ls.filter((l) => l.phase !== "leave" || l.id > id)), leaveMs);
    return () => { clearTimeout(settle); clearTimeout(drop); };
  }, [index, leaveMs]);
  return layers;
}

function ViewImage({ layer }: { layer: Layer }) {
  const [loaded, setLoaded] = useState(false);
  const enter = layer.phase === "enter";
  const leave = layer.phase === "leave";
  const k = ITEMS[layer.index].key;
  return (
    <div className={cls("w-full transition-all duration-[600ms]", (enter || leave) && "opacity-0", leave && "absolute top-0 left-0")}>
      <img
        alt=""
        decoding="async"
        height="556"
        loading="lazy"
        src={`/assets/images/wall/${k}/background.png`}
        style={{}}
        width="992"
        ref={(el) => { if (el?.complete && el.naturalWidth) setLoaded(true); }}
        onLoad={() => setLoaded(true)}
        className={cls(
          "lazy-image", !loaded && "opacity-0",
          "relative left-1/2 -translate-x-1/2 !transition-all max-w-[calc(100%+80px)] wall-testimonials-view-image",
          leave && "-translate-y-32 blur-[20px] grayscale opacity-0",
          enter && "translate-y-32 opacity-0",
        )}
      />
    </div>
  );
}

function DockItem({ index, active, onPick }: { index: number; active: number; onPick: (i: number, el: HTMLButtonElement) => void }) {
  const isActive = active === index;
  const [dot, setDot] = useState<Phase | null>(isActive ? "shown" : null);
  const mounted = useRef(false);
  useEffect(() => {
    if (!mounted.current) { mounted.current = true; return; }
    if (isActive) {
      setDot("enter");
      const t = setTimeout(() => setDot("shown"), 100);
      return () => clearTimeout(t);
    }
    setDot((d) => (d ? "leave" : null));
    const t = setTimeout(() => setDot(null), DOT_MS);
    return () => clearTimeout(t);
  }, [isActive]);
  const it = ITEMS[index];
  return (
    <div className={index > 6 ? "relative group sm-max:hidden" : "relative group"}>
      {dot && <div className={cls("center-x -bottom-2 w-3 rounded-full h-3 bg-white/30 transition-all duration-[200ms]", dot !== "shown" && "opacity-0")}></div>}
      <button aria-label="dock logo" className="select-none relative block" onClick={(e) => onPick(index, e.currentTarget)}>
        <img alt="Portal Canary surface" decoding="async" height="72" loading="lazy" src={`/assets/images/wall/${it.key}/logo.png`} style={{}} width="72" className="lazy-image opacity-0 select-none !transition-none md-max:w-40 md-max:h-40" />
        <div className={TOOLTIP}>{it.label}</div>
      </button>
    </div>
  );
}

export default function Wall({ noIndicators }: { noIndicators?: boolean }) {
  const [active, setActive] = useState(0);
  const layers = usePresence(active, VIEW_MS);
  const dock = useRef<HTMLDivElement>(null);

  // Magnify the dock icons by distance from the cursor (desktop only).
  useEffect(() => {
    const el = dock.current;
    if (!el || innerWidth < 768) return;
    const buttons = Array.from(el.querySelectorAll<HTMLButtonElement>(":scope > div > button"));
    const move = (e: MouseEvent) => {
      const box = el.getBoundingClientRect();
      const x = e.clientX - box.left;
      for (const b of buttons) {
        const left = b.getBoundingClientRect().x - box.x;
        const size = Math.max(MIN, MAX - (MAX - MIN) * (Math.abs(x - (left + 36)) / REACH));
        b.querySelector("img")?.animate({ height: `${size}px`, width: `${size}px` }, { duration: 150, fill: "forwards" });
      }
    };
    const leave = () => {
      for (const b of buttons) {
        b.querySelector("img")?.animate({ height: `${MIN}px`, width: `${MIN}px` }, { duration: 400, easing: "cubic-bezier(0.87, -0.41, 0.19, 1.44)", fill: "forwards" });
      }
    };
    el.addEventListener("mousemove", move);
    el.addEventListener("mouseleave", leave);
    return () => { el.removeEventListener("mousemove", move); el.removeEventListener("mouseleave", leave); };
  }, []);

  const pick = (i: number, button: HTMLButtonElement) => {
    if (i === active) return;
    setActive(i);
    // hop twice, then settle back on a spring
    animate(button, { y: -15 }, { duration: 0.3, ease: [0.25, 0.1, 0.25, 1], repeat: 2, repeatType: "reverse" }).then(() =>
      animate(button, { y: 0 }, { type: "spring", stiffness: 130, damping: 13 }),
    );
  };

  return (
    <div className="wall-testimonials relative">
      <div className="relative">
        {layers.map((l) => <ViewImage key={l.id} layer={l} />)}
      </div>
      <div ref={dock} className={DOCK}>
        {ITEMS.map((_, i) => <DockItem key={i} index={i} active={active} onPick={pick} />)}
        {!noIndicators && (
          <>
            <img alt="Live surfaces" decoding="async" height="116" loading="lazy" src="/assets/images/wall/our-customers.png" style={{}} width="224" className="lazy-image opacity-0 absolute -top-48 -left-240 md-max:!hidden" />
            <img alt="Live surfaces" decoding="async" height="61" loading="lazy" src="/assets/images/wall/click-to-see.png" style={{}} width="143" className="lazy-image opacity-0 absolute -top-8 -right-160 md-max:!hidden" />
          </>
        )}
      </div>
      {!noIndicators && (
        <div className="w-996 center-x top-0 md-max:!hidden">
          <img alt="Live surfaces" decoding="async" height="134" loading="lazy" src="/assets/images/wall/powered-by.png" style={{}} width="151" className="lazy-image opacity-0 absolute -top-60 -right-48" />
        </div>
      )}
    </div>
  );
}
