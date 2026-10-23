// Count-ups: numbers run up to their real value when they come into view.
// The real value is already in the markup, so without JS (or with reduced
// motion) nothing changes; the animation only replays what is there.

const NUM = /^([^\d-]*)(-?[\d,]*\.?\d+)(.*)$/s;
const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.classList.contains("still");

export function countUp(el: HTMLElement, ms = 1100) {
  const text = el.dataset.final ?? el.textContent ?? "";
  const m = NUM.exec(text.trim());
  // Only plain figures: "V13 + V14" is a label, not a number to run up.
  if (!m || /[A-Za-z]/.test(m[1]) || reduced()) return;
  el.dataset.final = text;
  const [, pre, raw, post] = m;
  const target = parseFloat(raw.replace(/,/g, ""));
  const decimals = raw.includes(".") ? raw.split(".")[1].length : 0;
  const grouped = raw.includes(",");
  const fmt = (v: number) => {
    const s = v.toFixed(decimals);
    return grouped ? Number(s).toLocaleString("en", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) : s;
  };
  // Hold the box at its final width so the layout never jumps while digits change.
  el.style.minWidth = `${el.getBoundingClientRect().width}px`;
  el.style.display ||= "inline-block";
  const t0 = performance.now();
  const step = (t: number) => {
    const p = Math.min(1, (t - t0) / ms);
    const eased = 1 - Math.pow(1 - p, 4);
    el.textContent = p < 1 ? `${pre}${fmt(target * eased)}${post}` : text;
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

// Scroll reveal: blocks rise into place as they enter the viewport.
// Content is never hidden: the "before" state is only offset and dimmed (see
// motion.css), the class that applies it is added here by JS, and anything
// already on screen or above it is revealed at once. No JS, reduced motion or
// the pause button: everything simply sits in place.
const REVEAL = [
  ".live-head", ".live-form", ".lanes > .lane", ".live-verdict",
  ".split-head", ".diagram",
  ".sec-head", ".v3-grid > div", ".frame-link",
  ".use",
  ".invariant .equation", ".invariant .note",
  ".start-in > *",
  ".foot-brand", ".foot-cols", ".legal",
].join(", ");

function initReveal() {
  if (reduced() || !("IntersectionObserver" in window)) return;
  const els = [...document.querySelectorAll<HTMLElement>(REVEAL)].filter((el) => !el.closest(".dash-page"));
  // Once settled, drop the reveal classes so the element's own transitions (hover etc.) apply again.
  const settle = (e: Event) => {
    if ((e as TransitionEvent).propertyName !== "transform") return;
    const el = e.currentTarget as HTMLElement;
    el.classList.remove("rv", "rv-in");
    el.removeEventListener("transitionend", settle);
  };
  const show = (el: Element) => {
    el.addEventListener("transitionend", settle);
    el.classList.add("rv-in");
  };
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      io.unobserve(e.target);
      show(e.target);
    }
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
  const fold = innerHeight;
  for (const el of els) {
    // Siblings stagger: index among revealed siblings in the same parent.
    const sibs = el.parentElement ? [...el.parentElement.children].filter((c) => c.matches(REVEAL)) : [];
    el.style.setProperty("--rv-i", String(Math.max(0, sibs.indexOf(el))));
    // Already on screen or scrolled past (e.g. a #hash load): never start offset.
    if (el.getBoundingClientRect().top < fold) continue;
    el.classList.add("rv");
    io.observe(el);
  }
  addEventListener("beforeprint", () => els.forEach(show));
}

export function initMotion() {
  initReveal();
  const targets = document.querySelectorAll<HTMLElement>(".stats b, .v3-grid b, .eq-num");
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      io.unobserve(e.target);
      countUp(e.target as HTMLElement);
    }
  }, { threshold: 0.6 });
  targets.forEach((t) => io.observe(t));
}
