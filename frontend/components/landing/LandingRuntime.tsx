"use client";

import { useEffect } from "react";

// Page-wide effects the landing's CSS depends on:
// - `.lazy-image` fades in (drops opacity-0) once its image has loaded;
// - `.lazy-background-image` loads the URL in its --background-image variable, then fades in;
// - every `section` and `.intersection-checker` carries `is-visible` while on screen,
//   which starts and pauses the CSS animations scoped to it.
export default function LandingRuntime() {
  useEffect(() => {
    const reveal = (img: HTMLImageElement, el: Element) => {
      if (img.getAttribute("src") && img.complete) { el.classList.remove("opacity-0"); return; }
      img.addEventListener("load", () => el.classList.remove("opacity-0"), { once: true });
    };
    const onScreen = (el: Element) => {
      const r = el.getBoundingClientRect();
      el.classList.toggle("is-visible", r.bottom > 0 && r.top < innerHeight);
    };
    const bg = new IntersectionObserver((entries, obs) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        const v = getComputedStyle(e.target).getPropertyValue("--background-image");
        const img = new Image();
        img.src = v.replace(/^url\(["']?/, "").replace(/["']?\)$/, "");
        reveal(img, e.target);
        obs.unobserve(e.target);
      }
    });
    const vis = new IntersectionObserver((entries) => {
      for (const e of entries) e.target.classList.toggle("is-visible", e.isIntersecting);
    });
    const seen = new WeakSet<Element>();
    const all = (root: ParentNode, sel: string) => {
      const list = Array.from(root.querySelectorAll(sel));
      if (root instanceof Element && root.matches(sel)) list.unshift(root);
      return list;
    };
    const scan = (root: ParentNode = document) => {
      for (const el of all(root, ".lazy-background-image")) if (!seen.has(el)) { seen.add(el); bg.observe(el); }
      for (const el of all(root, ".lazy-image")) {
        const img = el.tagName === "IMG" ? (el as HTMLImageElement) : el.querySelector("img");
        if (img) reveal(img, el);
      }
      for (const el of all(root, "section, .intersection-checker")) {
        onScreen(el);
        if (!seen.has(el)) { seen.add(el); vis.observe(el); }
      }
    };
    scan();
    // client components mount content later (wall views, feature cards): scan what they add
    const mo = new MutationObserver((muts) => {
      for (const m of muts) m.addedNodes.forEach((n) => { if (n instanceof Element) scan(n); });
    });
    mo.observe(document.body, { childList: true, subtree: true });
    return () => { mo.disconnect(); bg.disconnect(); vis.disconnect(); };
  }, []);
  return null;
}
