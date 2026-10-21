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

export function initMotion() {
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
