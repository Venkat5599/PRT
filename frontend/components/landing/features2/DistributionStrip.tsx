"use client";

import { useEffect, useRef } from "react";

// "No install. Sorted!" background strip. When it first comes on screen the card is marked
// visible (its CSS animations start); the strip itself is marked once fully in view.
export default function DistributionStrip() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const card = el.closest(".features-distribution");
    const start = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      start.disconnect();
      card?.classList.add("is-visible");
    });
    const full = new IntersectionObserver(([e]) => {
      el.classList.toggle("is-visible", e.isIntersecting);
      if (e.isIntersecting) full.disconnect();
    }, { threshold: 1 });
    start.observe(el);
    full.observe(el);
    return () => { start.disconnect(); full.disconnect(); };
  }, []);
  return (
    <div ref={ref} className="absolute top-0 left-0 flex w-full">
      <div className="features-distribution-background-wall w-30 h-154"></div>
      <div className="features-distribution-background-ground flex-1 h-140"></div>
      <div className="features-distribution-background-wall w-30 h-154"></div>
    </div>
  );
}
