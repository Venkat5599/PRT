"use client";

import { useEffect, useRef, useState } from "react";
import { FAQ_COLUMNS, type FaqItem } from "./faqData";

// Two columns of questions sharing one open answer. The answer's height animates to its
// measured content height (kept current on resize); opening wobbles the card slightly.
function Question({ item, col, open, onToggle }: { item: FaqItem; col: number; open: boolean; onToggle: (card: HTMLDivElement) => void }) {
  const card = useRef<HTMLDivElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);
  useEffect(() => {
    const measure = () => { if (body.current) setHeight(body.current.clientHeight); };
    measure();
    addEventListener("resize", measure);
    return () => removeEventListener("resize", measure);
  }, []);
  return (
    <div
      ref={card}
      className={`overflow-hidden border-x border-t sm:border-b sm:rounded-14 border-body-stroke-lighter ${col !== 0 ? "last:border-b last:rounded-b-14" : "first:rounded-t-14"}`}
    >
      <button
        aria-label={item.label}
        className={`text-14/22 transition-all rounded-inherit font-500 pl-23 pt-23 pr-15 tracking-[-0.14px] text-start text-body-light-loud select-none cursor-pointer flex w-full justify-between ${open ? "pb-16" : "pb-23"}`}
        onClick={() => card.current && onToggle(card.current)}
      >
        <span className="flex-1 block">{item.label}</span>
        <img alt="chevron down" decoding="async" height="24" loading="lazy" src="/assets/images/questions/chevron-down.png" style={{}} width="24" className="lazy-image opacity-0 h-24" />
      </button>
      <div
        style={{ "--original-height": `${height + 23}px` } as React.CSSProperties}
        className={`transition-all overflow-hidden relative pr-16 pl-23 ${open ? "h-[var(--original-height)] pb-23" : "h-0"}`}
      >
        <div ref={body} className={`text-body-normal text-body-light-muted transition-all${open ? "" : " opacity-0 blur-[1px]"}`} dangerouslySetInnerHTML={{ __html: item.description }} />
      </div>
    </div>
  );
}

export default function FaqList() {
  const [open, setOpen] = useState("");
  const toggle = (label: string) => (card: HTMLDivElement) => {
    if (open === label) { setOpen(""); return; }
    setOpen(label);
    if (innerWidth >= 768) {
      const tilt = Math.random() > 0.5 ? -0.5 : 0.5;
      card.animate({ transform: ["scale(1) rotate(0deg)", `scale(0.99) rotate(${tilt}deg)`, "scale(1) rotate(0deg)"] }, { duration: 400, easing: "ease-in-out", fill: "forwards" });
    }
  };
  return (
    <div className="flex mx-auto max-w-952 flex-col p-14 sm:flex-row sm:gap-16">
      {FAQ_COLUMNS.map((items, col) => (
        <div key={col} className="flex-1 flex flex-col sm:gap-16">
          {items.map((it) => <Question key={it.label} item={it} col={col} open={open === it.label} onToggle={toggle(it.label)} />)}
        </div>
      ))}
    </div>
  );
}
