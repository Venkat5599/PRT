"use client";

import { useEffect, useRef, useState } from "react";
import { cls, frameLoop, setupCanvas, usePresence, useVisibleOnce } from "../fx";

// "Catch regressions before users do": three checks run one after another once the card is
// on screen. Each check's ring fills, turns into a tick, and the next one starts; the overall
// ring fills a third per check. Smoke puffs drift behind the panel.
const CHECKS = [
  { queue: "Waiting to dispatch workflows...", loading: "Dispatching workflows..", success: "Workflows dispatched on both sides" },
  { queue: "Waiting for the setCode upgrade...", loading: "Applying setCode..", success: "Upgrade applied, liveness ok" },
  { queue: "Waiting to read pinned state...", loading: "Reading pinned state...", success: "State read at pinned block hashes" },
];
const OVERALL_LEN = 10.5 * Math.PI * 2;
const PIE_LEN = 8 * Math.PI * 2;
const CLOUD_FRAMES = 7;

function Pie({ active, onFinish }: { active: boolean; onFinish: () => void }) {
  const [done, setDone] = useState(false);
  return (
    <div style={{ width: "18px", height: "18px" }} className={cls("relative transition-all rounded-full", !active && "bg-body-light-bg-ghost", active && "features-smoke-check-pie-active", done && "features-smoke-check-pie-completed")}>
      <svg viewBox="0 0 18 18" height="18" width="18" className={cls("transition-all", (!active || done) && "opacity-0")}>
        <circle r="8" cx="9" cy="9" fill="none" strokeWidth="2" className="stroke-body-stroke-lighter"></circle>
      </svg>
      <svg viewBox="0 0 18 18" height="18" width="18" className={cls("features-smoke-check-pie-progress overlay transition-all delay-[200ms]", done && "opacity-0 blur-[4px] scale-[1.1]")}>
        <circle
          r="8"
          style={{ strokeDasharray: `${PIE_LEN}px`, strokeDashoffset: `${PIE_LEN}px` }}
          cx="9" cy="9" fill="transparent" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2px" transform="rotate(-90 9 9)"
          className="stroke-body-light-loud transition-all"
          onAnimationEnd={() => { setDone(true); onFinish(); }}
        ></circle>
      </svg>
      <div className={cls("overlay transition-all delay-[200ms] easing-[cubic-bezier(0.87,-0.41,0.19,1.44)]", !done && "scale-[0.5] opacity-0")}>
        <img alt="Check" decoding="async" height="1" loading="lazy" src="/assets/images/features/smoke/check.png" style={{}} width="1" className="lazy-image opacity-0 w-full h-full" />
      </div>
    </div>
  );
}

function Check({ i, active, onFinish }: { i: number; active: boolean; onFinish: () => void }) {
  const [done, setDone] = useState(false);
  const c = CHECKS[i];
  const queue = usePresence(!done && !active, 600);
  const loading = usePresence(!done && active, 600);
  const success = usePresence(done, 600);
  const moving = (p: { enterFrom: boolean; leaveTo: boolean }) => cls((p.leaveTo || p.enterFrom) && "opacity-0 blur-[2px]", p.leaveTo && "translate-x-40", p.enterFrom && "-translate-x-10");
  return (
    <div className="flex gap-16 items-center text-body-normal w-full">
      <Pie active={active} onFinish={() => { setDone(true); onFinish(); }} />
      <div className="relative h-22 flex-1">
        {queue.map((p) => (
          <span key={`q${p.key}`} style={p.leaveTo ? { opacity: 0, transform: "translateX(40px)", filter: "blur(2px)" } : {}} className="text-body-normal md-max:text-[12px] text-body-light-ghost opacity-50 transition-all absolute top-0 left-0">{c.queue}</span>
        ))}
        {loading.map((p) => (
          <span key={`l${p.key}`} className={cls("text-body-normal md-max:text-[12px] transition-all features-smoke-check-loading absolute top-0 left-0", moving(p))}>{c.loading}</span>
        ))}
        {success.map((p) => (
          <span key={`s${p.key}`} className={cls("text-body-normal md-max:text-[12px] transition-all features-smoke-check-success absolute top-0 left-0", moving(p))}>{c.success}</span>
        ))}
      </div>
    </div>
  );
}

function Overall({ progress }: { progress: number }) {
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (progress < 0.9) return;
    const t = setTimeout(() => setDone(true), 560);
    return () => clearTimeout(t);
  }, [progress]);
  return (
    <div style={{ width: "24px", height: "24px" }} className={cls("relative transition-all rounded-full", done && "features-smoke-checks-overall-completed")}>
      <svg viewBox="0 0 24 24" height="24" width="24" className={cls("transition-all", done && "opacity-0")}>
        <circle r="10.5" cx="12" cy="12" fill="none" strokeWidth="3" className="stroke-body-stroke-lighter"></circle>
      </svg>
      <svg viewBox="0 0 24 24" height="24" width="24" className={cls("features-smoke-checks-overall-progress overlay transition-all delay-[200ms]", done && "opacity-0 blur-[4px] scale-[1.1]")}>
        <circle
          r="10.5"
          style={{ strokeDasharray: `${OVERALL_LEN}px`, strokeDashoffset: `${OVERALL_LEN * (1 - progress)}px` }}
          cx="12" cy="12" fill="transparent" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3px" transform="rotate(-90 12 12)"
          className="stroke-body-light-loud transition-all"
        ></circle>
      </svg>
      <div className={cls("overlay transition-all delay-[200ms] easing-[cubic-bezier(0.87,-0.41,0.19,1.44)]", !done && "scale-[0.5] opacity-0")}>
        <img alt="Check" decoding="async" height="28" loading="lazy" src="/assets/images/features/smoke/overall-check.png" style={{}} width="28" className="lazy-image opacity-0 center" />
      </div>
    </div>
  );
}

/** Animated "Checking" dots: cycles "", ".", "..", "..." every 500ms. */
function useDots(running: boolean) {
  const [dots, setDots] = useState("...");
  useEffect(() => {
    if (!running) return;
    let n = 0;
    const t = setInterval(() => { setDots(".".repeat(n)); n = (n + 1) % 4; }, 500);
    return () => clearInterval(t);
  }, [running]);
  return dots;
}

/** Smoke puffs: 180px sprite canvases playing a 7-frame cloud, each replay at a new spot. */
function useClouds(wrapper: React.RefObject<HTMLDivElement | null>, start: boolean) {
  useEffect(() => {
    const host = wrapper.current;
    if (!start || !host) return;
    let disposed = false;
    const stops: (() => void)[] = [];
    const frames = Array.from({ length: CLOUD_FRAMES }, (_, i) => {
      const img = new Image(180, 180);
      img.src = `/assets/images/features/smoke/cloud/${i + 1}.png`;
      return img;
    });
    const puff = () => {
      if (disposed) return;
      const canvas = document.createElement("canvas");
      canvas.width = 180;
      canvas.height = 180;
      canvas.classList.add("absolute");
      host.appendChild(canvas);
      const { ctx, dispose } = setupCanvas(canvas);
      let i = 0;
      const place = () => { Object.assign(canvas.style, { left: `${-50 + 325 * Math.random()}px`, top: `${-100 + 200 * Math.random()}px` }); i = 0; };
      place();
      const stop = frameLoop({
        target: canvas,
        frames: 20,
        animate: () => {
          if (i > frames.length) { place(); return; }
          ctx.clearRect(0, 0, 180, 180);
          const f = frames[i];
          if (f?.complete) ctx.drawImage(f, 0, 0, 180, 180);
          i += 1;
        },
      });
      stops.push(() => { stop(); dispose(); canvas.remove(); });
    };
    puff();
    const second = setTimeout(puff, 1200);
    return () => { disposed = true; clearTimeout(second); stops.forEach((s) => s()); };
  }, [wrapper, start]);
}

export default function SmokeChecks() {
  const root = useRef<HTMLDivElement>(null);
  const clouds = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(-1); // -1 idle, 0..2 running check, 3 all passed
  const [visible, setVisible] = useState(false);
  useVisibleOnce(root, () => { setVisible(true); setStep(0); });
  const dots = useDots(visible);
  useClouds(clouds, visible);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const next = () => { timer.current = window.setTimeout(() => setStep((s) => s + 1), 500); };
  const checking = usePresence(step !== 3, 500);
  const passed = usePresence(step === 3, 500);
  const passedCount = Math.max(step, 0);
  return (
    <div ref={root} className="p-2 absolute top-0 left-0 w-full">
      <div ref={clouds} className="overlay"></div>
      <div className="h-260 top-0 left-0 bg-body-light-bg-ghost rounded-16 w-full absolute">
        <div className="flex gap-20 items-center bottom-0 left-0 p-24 absolute">
          <div style={{ boxShadow: "0px 12px 24px -3px rgba(0, 0, 0, 0.05), 0px 6px 6px -3px rgba(0, 0, 0, 0.03), 0px 3px 3px -1.5px rgba(0, 0, 0, 0.02), 0px 1px 1px -0.5px rgba(0, 0, 0, 0.03)" }} className="bg-white w-48 h-48 flex-center rounded-12">
            <Overall progress={passedCount * 0.33} />
          </div>
          <div>
            <div className="text-label-large md-max:text-[14px] text-body-light-loud relative h-20 md:h-26">
              {checking.map((p) => (
                <span key={`c${p.key}`} className={cls("transition-all features-smoke-checks-checking absolute top-0 left-0", p.leaveTo && "opacity-0 blur-[2px] translate-x-40")}>{"Checking"}{dots}</span>
              ))}
              {passed.map((p) => (
                <span key={`p${p.key}`} className={cls("transition-all features-smoke-checks-passed absolute top-0 left-0", p.enterFrom && "opacity-0 blur-[2px] -translate-x-10")}>All checks passed!</span>
              ))}
            </div>
            <div className="text-body-normal md-max:text-[12px] text-body-light-muted">{passedCount}{" out of 3 checks have passed"}</div>
          </div>
        </div>
      </div>
      <div style={{ boxShadow: "0px 12px 24px -3px rgba(0, 0, 0, 0.08), 0px 6px 6px -3px rgba(0, 0, 0, 0.04), 0px 3px 3px -1.5px rgba(0, 0, 0, 0.04), 0px 1px 1px -0.5px rgba(0, 0, 0, 0.03)" }} className="p-24 rounded-14 bg-white/80 backdrop-blur-6 grid gap-24">
        {CHECKS.map((_, i) => <Check key={i} i={i} active={step === i} onFinish={next} />)}
      </div>
    </div>
  );
}
