"use client";

import { useEffect, useRef, useState } from "react";

// Effect helpers shared by the landing's animated feature cards. They reproduce the
// original runtime's semantics: a frame loop that only runs while its target is on screen,
// a presence state for enter/leave transitions, and "run once when first visible".

export const isMobile = () => typeof window !== "undefined" && innerWidth < 768;

/**
 * rAF loop that ticks only while `target` is in view and the tab is visible. With `frames`,
 * `animate` runs every Nth frame (the original's `ms` option counts frames, not milliseconds).
 */
export function frameLoop(o: {
  target: Element;
  animate: () => void;
  frames?: number;
  onInView?: () => void;
  onOutOfView?: () => void;
}) {
  let inView = false;
  let stopped = false;
  let n = 0;
  let pending: number | undefined;
  const tick = () => {
    if (!inView || stopped) return;
    if (!o.frames || n % o.frames === 0) o.animate();
    n += 1;
    requestAnimationFrame(tick);
  };
  const set = (v: boolean) => {
    clearTimeout(pending);
    pending = window.setTimeout(() => {
      if (inView === v || stopped) return;
      inView = v;
      if (v) { o.onInView?.(); tick(); } else o.onOutOfView?.();
    }, 100);
  };
  const io = new IntersectionObserver(([e]) => set(e.isIntersecting));
  io.observe(o.target);
  const vis = () => set(document.visibilityState === "visible");
  document.addEventListener("visibilitychange", vis);
  return () => { stopped = true; clearTimeout(pending); io.disconnect(); document.removeEventListener("visibilitychange", vis); };
}

/** Calls `fn` once, the first time `ref` scrolls into view; `fn` may return a cleanup. */
export function useVisibleOnce(ref: React.RefObject<Element | null>, fn: () => void | (() => void)) {
  const fnRef = useRef(fn);
  fnRef.current = fn;
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let cleanup: void | (() => void);
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      cleanup = fnRef.current();
    });
    io.observe(el);
    return () => { io.disconnect(); if (typeof cleanup === "function") cleanup(); };
  }, [ref]);
}

export type Presence = { key: number; enterFrom: boolean; leaveTo: boolean };

/**
 * Enter/leave state for a conditionally shown element. A newly shown element starts with
 * `enterFrom` for 100ms; a hidden one keeps rendering with `leaveTo` for `leaveMs`. An element
 * that is shown on first render starts settled (matches the server-rendered markup).
 */
export function usePresence(show: boolean, leaveMs: number): Presence[] {
  const [items, setItems] = useState<Presence[]>(show ? [{ key: 0, enterFrom: false, leaveTo: false }] : []);
  const seq = useRef(0);
  const prev = useRef(show);
  useEffect(() => {
    if (prev.current === show) return;
    prev.current = show;
    if (show) {
      const key = ++seq.current;
      setItems((l) => [...l, { key, enterFrom: true, leaveTo: false }]);
      const t = setTimeout(() => setItems((l) => l.map((x) => (x.key === key ? { ...x, enterFrom: false } : x))), 100);
      return () => clearTimeout(t);
    }
    setItems((l) => l.map((x) => ({ ...x, leaveTo: true })));
    const t = setTimeout(() => setItems((l) => l.filter((x) => !x.leaveTo)), leaveMs);
    return () => clearTimeout(t);
  }, [show, leaveMs]);
  return items;
}

/** Size a canvas to its CSS box at device pixel ratio; returns its 2D context. */
export function setupCanvas(c: HTMLCanvasElement) {
  const { width, height } = c.getBoundingClientRect();
  const ctx = c.getContext("2d")!;
  c.style.width = `${width}px`;
  c.style.height = `${height}px`;
  const size = () => {
    const r = (window.devicePixelRatio || 1) * (window.visualViewport?.scale || 1);
    c.width = width * r;
    c.height = height * r;
    ctx.scale(r, r);
  };
  size();
  let t: number | undefined;
  const onResize = () => { clearTimeout(t); t = window.setTimeout(size, 500); };
  addEventListener("resize", onResize);
  window.visualViewport?.addEventListener("resize", onResize);
  return { ctx, dispose: () => { clearTimeout(t); removeEventListener("resize", onResize); window.visualViewport?.removeEventListener("resize", onResize); } };
}

export const cls = (...p: (string | false | null | undefined)[]) => p.filter(Boolean).join(" ");
