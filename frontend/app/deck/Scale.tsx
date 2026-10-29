"use client";

import { useEffect } from "react";

// Scales each 1280×720 slide to fit its frame; arrow keys and PageUp/Down move a slide at a time.
export default function Scale() {
  useEffect(() => {
    const fit = () => document.querySelectorAll<HTMLElement>(".deck .frame").forEach((f) => {
      const s = f.querySelector<HTMLElement>(".slide");
      if (s) s.style.transform = `scale(${Math.min(f.clientWidth / 1280, f.clientHeight / 720)})`;
    });
    const key = (e: KeyboardEvent) => {
      const wrap = document.querySelector<HTMLElement>(".deck .wrap");
      if (!wrap) return;
      const dir = ["ArrowDown", "ArrowRight", "PageDown", " "].includes(e.key) ? 1 : ["ArrowUp", "ArrowLeft", "PageUp"].includes(e.key) ? -1 : 0;
      if (!dir) return;
      e.preventDefault();
      const h = (wrap.firstElementChild as HTMLElement | null)?.offsetHeight ?? wrap.clientHeight;
      wrap.scrollBy({ top: dir * h, behavior: "smooth" });
    };
    fit();
    addEventListener("resize", fit);
    addEventListener("keydown", key);
    return () => { removeEventListener("resize", fit); removeEventListener("keydown", key); };
  }, []);
  return null;
}
