"use client";

import { useRef, useState } from "react";
import { animate } from "motion";
import type { Bind, Kids } from "@/components/landing/bind";
import { useVisibleOnce } from "../fx";
import { springKeyframes } from "../header/spring";
import AutoUpgradeView from "./AutoUpgradeView";

// "Upgrades with a liveness check": the app cycles through runtime versions 5 -> 6 -> 6.1.
// A "New runtime" badge pops in, the dock icon bounces, the badge flies off and the app
// shakes into the new version (6 adds the action buttons, 6.1 switches to the dark theme).
const VERSIONS = [5, 6, 6.1];
const EASE = "cubic-bezier(0.76, 0, 0.24, 1)";

/** A Motion One spring's settle time, used as the duration of a multi-keyframe wobble. */
const springMs = (stiffness: number, damping = 10) => springKeyframes(stiffness, damping, 0, 1).duration * 1000;

export default function AutoUpgrade() {
  const [version, setVersion] = useState(5);
  const app = useRef<HTMLDivElement | null>(null);
  const note = useRef<HTMLButtonElement | null>(null);
  const actions = useRef<HTMLDivElement | null>(null);
  const dock = useRef<HTMLDivElement | null>(null);

  useVisibleOnce(app, () => {
    let stopped = false;
    const timers: number[] = [];
    const later = (fn: () => void, ms: number) => timers.push(window.setTimeout(() => { if (!stopped) fn(); }, ms));
    let v = 5;
    const badgeIn = () => {
      const n = note.current!;
      return n.animate({ filter: ["blur(4px)", "blur(0px)"], opacity: [0, 1], transform: ["translateX(40px)", "translateX(0px)"] }, { easing: EASE, duration: 600, fill: "both" })
        .finished.then(() => n.animate({ transform: ["translateY(0px)", "translateY(-1px) rotate(1deg)", "translateY(1px) rotate(-3deg)", "translateY(0px) rotate(0deg)"] }, { easing: "ease-in-out", duration: 300, fill: "both" }).finished);
    };
    const bounceDock = () => {
      const d = dock.current;
      if (!d) return;
      const mid = d.children[Math.floor((d.children.length - 1) / 2)] as HTMLElement;
      animate(mid, { y: -10 }, { duration: 0.3, ease: [0.25, 0.1, 0.25, 1], repeat: 6, repeatType: "reverse" }).then(() =>
        animate(mid, { y: 0 }, { type: "spring", stiffness: 180 }),
      );
    };
    const revealActions = () => {
      const w = actions.current;
      if (!w) return;
      animate(w, { paddingLeft: ["20px", "28px"], paddingRight: ["20px", "28px"] }, { type: "spring", damping: 15 });
      w.querySelectorAll<HTMLElement>(".features-auto-app-action").forEach((el) => {
        animate(el, { opacity: [0, 1], width: ["0px", "48px"] }, { type: "spring", damping: 15 });
        el.animate({ filter: ["blur(2px)", "blur(0px)"] }, { duration: 400, easing: "ease-out", fill: "forwards" });
      });
    };
    const upgrade = async () => {
      bounceDock();
      note.current!.animate({ opacity: [1, 0], transform: ["translateY(0px)", "translateY(-12px) rotate(4deg)"], filter: ["blur(0px)", "blur(4px)"] }, { easing: EASE, duration: 400, fill: "both" });
      await new Promise((r) => later(() => r(null), 500));
      if (stopped) return;
      app.current?.animate(
        { transform: ["translateY(0px)", "rotate(1deg) translateY(-5px)", "translateY(0px)", "rotate(-2deg) translateY(4px)", "translateY(0px)"] },
        { duration: springMs(50), easing: "ease-out" },
      );
      v = VERSIONS[(VERSIONS.indexOf(v) + 1) % VERSIONS.length];
      if (v === 6) revealActions();
      setVersion(v);
    };
    const loop = () => {
      const wait = v === 5.1 ? 3000 : v === 6.1 ? 5000 : 1000;
      later(() => { badgeIn().then(() => { later(upgrade, 1400); later(loop, 3400); }).catch(() => {}); }, wait);
    };
    loop();
    return () => { stopped = true; timers.forEach(clearTimeout); };
  });

  const b: Bind = (key) => {
    switch (key) {
      case "app":
        return { ref: app, "data-version": String(version) };
      case "note":
        return { ref: note };
      case "actions":
        return { ref: actions };
      case "dock":
        return { ref: dock };
      case "logo":
        return { src: `/assets/images/features/auto/app-logo-${version === 6.1 ? "dark" : "light"}.png` };
    }
    return {};
  };
  const k: Kids = (key) => (key === "ver" ? String(version) : undefined);
  return <AutoUpgradeView b={b} k={k} />;
}
