"use client";

import { useEffect, useRef, useState } from "react";
import { cls, usePresence, useVisibleOnce } from "../fx";

// "Speaks the chain you actually run": one card per target (V3, mainnet, dev node) is decoded
// in turn. Each card's bar fills, "Decoding..." gives way to a letter-by-letter success line,
// the next card stacks on top; after the third the stack drops away and the loop restarts.
const TARGETS = ["v3", "mainnet", "dev"] as const;
type Target = (typeof TARGETS)[number];
const SUCCESS = "Build v1.0 successful";

const ICONS: Record<Target, React.ReactNode> = {
  v3: (
    <svg fill={"none"} height={"24"} viewBox={"0 0 24 24"} width={"24"} xmlns={"http://www.w3.org/2000/svg"}>
      <path d={"M11.643 4.979 17.122 8.06 v6.163 L11.643 17.305 6.165 14.223 v-6.163 L11.643 4.979Zm0 1.575 L7.535 8.882 v4.52 l4.109 2.328 4.109 -2.328 V8.882 l-4.109 -2.328ZM9.315 9.019 h4.656 v1.096 H9.315 V9.019Zm0 1.986 h4.656 v1.096 H9.315 V11.005Zm0 1.986 h4.656 v1.096 H9.315 v-1.096Z"} fill={"black"} style={{"fill": "black", "fillOpacity": "1"} as React.CSSProperties}></path>
    </svg>
  ),
  mainnet: (
    <svg fill={"none"} height={"24"} viewBox={"0 0 24 24"} width={"24"} xmlns={"http://www.w3.org/2000/svg"}>
      <path d={"M6.626 6.24 h10.752 a0.768 0.768 0 0 1 0.768 0.768 v2.688 a0.768 0.768 0 0 1 -0.768 0.768 H6.626 a0.768 0.768 0 0 1 -0.768 -0.768 V7.008 a0.768 0.768 0 0 1 0.768 -0.768Zm0 5.376 h10.752 a0.768 0.768 0 0 1 0.768 0.768 V15.072 a0.768 0.768 0 0 1 -0.768 0.768 H6.626 a0.768 0.768 0 0 1 -0.768 -0.768 v-2.688 a0.768 0.768 0 0 1 0.768 -0.768ZM8.162 7.7 a0.691 0.691 0 1 0 0 1.382 0.691 0.691 0 0 0 0 -1.382Zm0 5.376 a0.691 0.691 0 1 0 0 1.382 0.691 0.691 0 0 0 0 -1.382ZM5.858 16.992 h12.288 V18.144 H5.858 v-1.152Z"} fill={"white"} style={{"fill": "white", "fillOpacity": "1"} as React.CSSProperties}></path>
    </svg>
  ),
  dev: (
    <svg fill={"none"} height={"24"} viewBox={"0 0 24 24"} width={"24"} xmlns={"http://www.w3.org/2000/svg"}>
      <path d={"M6.451 7.179 a0.693 0.693 0 0 1 0.693 -0.693 h9.695 a0.693 0.693 0 0 1 0.693 0.693 v6.925 a0.693 0.693 0 0 1 -0.693 0.693 h-3.636 v1.385 H14.761 a0.519 0.519 0 0 1 0 1.039 H9.221 A0.519 0.519 0 0 1 9.221 16.182 h1.558 v-1.385 H7.143 a0.693 0.693 0 0 1 -0.693 -0.693 V7.179Zm1.108 0.416 v6.094 h8.864 V7.595 H7.559Zm1.593 1.524 1.801 1.524 -1.801 1.524 -0.623 -0.762 0.9 -0.762 -0.9 -0.762 0.623 -0.762Zm2.493 2.424 h2.909 v0.97 H11.644 V11.542Z"} fill={"white"} style={{"fill": "white", "fillOpacity": "1"} as React.CSSProperties}></path>
    </svg>
  ),
};
const Connector = () => (
  <svg fill={"none"} height={"32"} viewBox={"0 0 14 32"} width={"14"} xmlns={"http://www.w3.org/2000/svg"}>
    <path d={"M10 13L7 16M7 16L4 19M7 16L4 13M7 16L10 19"} stroke={"#161616"} strokeLinecap={"round"} strokeOpacity={"0.12"} style={{"stroke": "color(display-p3 0.0863 0.0863 0.0863)", "strokeOpacity": "0.12"} as React.CSSProperties}></path>
  </svg>
);
const Tick = () => (
  <svg fill={"none"} height={"16"} viewBox={"0 0 16 16"} width={"16"} xmlns={"http://www.w3.org/2000/svg"}>
    <path clipRule={"evenodd"} d={"M8.00016 1.33325C4.31826 1.33325 1.3335 4.31802 1.3335 7.99992C1.3335 11.6818 4.31826 14.6666 8.00016 14.6666C11.6821 14.6666 14.6668 11.6818 14.6668 7.99992C14.6668 4.31802 11.6821 1.33325 8.00016 1.33325ZM10.5161 6.75543C10.7493 6.47047 10.7073 6.05045 10.4223 5.8173C10.1374 5.58415 9.71734 5.62615 9.48419 5.91111L6.95067 9.00764L6.13823 8.1952C5.87788 7.93485 5.45577 7.93485 5.19543 8.1952C4.93508 8.45555 4.93508 8.87766 5.19543 9.13801L6.52876 10.4713C6.66194 10.6045 6.84525 10.6752 7.03337 10.6658C7.22149 10.6564 7.39686 10.5679 7.51613 10.4221L10.5161 6.75543Z"} fill={"#3ED18A"} fillRule={"evenodd"} style={{"fill": "color(display-p3 0.2428 0.8177 0.5417)", "fillOpacity": "1"} as React.CSSProperties}></path>
  </svg>
);

function Decoding({ leaveTo }: { leaveTo: boolean }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setN((v) => (v + 1) % 4), 500);
    return () => clearInterval(t);
  }, []);
  return (
    <span className={cls("text-body-light-ghost w-50 absolute top-0 center-x text-center transition-all", leaveTo && "opacity-0 -translate-y-10 blur-[8px]")}>
      {"Decoding"}{".".repeat(n)}
    </span>
  );
}

function Success({ onFinish }: { onFinish: () => void }) {
  const box = useRef<HTMLSpanElement>(null);
  const word = useRef<HTMLSpanElement>(null);
  const [gap, setGap] = useState(false);
  const done = useRef(onFinish);
  done.current = onFinish;
  useEffect(() => {
    const b = box.current, w = word.current;
    if (!b || !w) return;
    const width = w.clientWidth;
    w.style.width = "0px";
    b.animate({ translate: ["0 12px", "0 0px"], filter: ["blur(8px)", "blur(0px)"], opacity: ["0", "1"] }, { duration: 500, easing: "cubic-bezier(0.76, 0, 0.24, 1)", fill: "forwards" });
    setGap(true);
    w.style.width = `${width}px`;
    let timer: number | undefined;
    const letters = [...w.children];
    const anims = letters.map((s, i) =>
      s.animate(
        { opacity: ["0", "1"], filter: ["blur(3px) grayscale(1)", "blur(0px) grayscale(0)"], translate: ["0 8px", "0 0px"] },
        { duration: 300, easing: "cubic-bezier(0.76, 0, 0.24, 1)", delay: 100 + i * 30, fill: "forwards" },
      ),
    );
    anims[anims.length - 1]?.finished.then(() => { timer = window.setTimeout(() => done.current(), 1000); }).catch(() => {});
    return () => { clearTimeout(timer); anims.forEach((a) => a.cancel()); };
  }, []);
  return (
    <span ref={box} className={cls("absolute w-full text-[#00B36C] top-0 left-0 text-center transition-all opacity-0 flex justify-center features-build-card-completed", gap && "gap-6")}>
      <Tick />
      <span ref={word} className="transition-all whitespace-nowrap flex">
        {SUCCESS.split("").map((ch, i) => <span key={i} className="block min-w-4" style={{ opacity: 0 }}>{ch}</span>)}
      </span>
    </span>
  );
}

function Card({ index, active, leaveTo, onFinish }: { index: number; active: number; leaveTo: boolean; onFinish: () => void }) {
  const os = TARGETS[index];
  const [complete, setComplete] = useState(false);
  const decoding = usePresence(!complete, 600);
  const success = usePresence(complete, 600);
  const s = active - index;
  const style: React.CSSProperties = active !== -1
    ? { transform: `translate(0, ${s * -6}px) scale(${1 - s * 0.1})`, opacity: `${1 - s * 0.3}` }
    : { transform: leaveTo ? "translateY(250px) scale(0.6)" : "translateY(0px)", filter: leaveTo ? "blur(4px) grayscale(1)" : "blur(0px)", transitionDelay: leaveTo ? `${(TARGETS.length - index) * 100}ms` : "" };
  return (
    <div className="w-full -top-40 pt-40 h-267 overflow-hidden absolute left-0">
      <div style={style} className="py-18 px-20 bg-white rounded-20 features-build-card w-340 mx-auto text-special-mono transition-all origin-top">
        <div className="transition-all" style={{ opacity: s > 0 ? "0" : "1", transitionDelay: leaveTo ? "0ms" : "" }}>
          <div className="flex justify-between mb-20">
            <span className="text-body-light-loud">portaldot 1004</span>
            <span className="text-body-light-ghost">{os}</span>
          </div>
          <div className="flex gap-8 items-center">
            <div className={cls("w-52 h-32 rounded-full flex-center", `features-build-card-os-${os}`, os === "v3" && "border border-body-stroke-lighter")}>{ICONS[os]}</div>
            <Connector />
            <div className="rounded-full bg-[#37373714] flex-1 p-2">
              <div className="h-28 bg-white rounded-full features-build-card-progress w-28" onAnimationEnd={() => setComplete(true)}></div>
            </div>
            <Connector />
            <div className={cls(
              "features-build-card-logo w-32 h-32 overflow-hidden relative transition before:transition before:mix-blend-color before:overlay before:bg-[#999999]",
              complete ? "before:opacity-0 features-build-card-logo-completed" : "features-build-card-logo-disabled opacity-50",
              os === "v3" ? "rounded-[7.25px]" : os === "mainnet" ? "rounded-2" : "rounded-full",
            )}>
              <img alt="check" decoding="async" height="32" loading="lazy" src="/assets/images/features/build/mark.png" width="32" className="lazy-image opacity-0 !transition-none" style={{}} />
            </div>
          </div>
          <div className="mt-20 flex justify-center items-center relative h-16">
            {decoding.map((p) => <Decoding key={`d${p.key}`} leaveTo={p.leaveTo} />)}
            {success.map((p) => <Success key={`s${p.key}`} onFinish={onFinish} />)}
          </div>
        </div>
      </div>
    </div>
  );
}

function Slot({ index, active, onFinish }: { index: number; active: number; onFinish: () => void }) {
  const items = usePresence(active >= index, 1000);
  return <>{items.map((p) => <Card key={p.key} index={index} active={active} leaveTo={p.leaveTo} onFinish={onFinish} />)}</>;
}

export default function BuildCards() {
  const root = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(-1);
  const timers = useRef<number[]>([]);
  const later = (fn: () => void, ms: number) => { timers.current.push(window.setTimeout(fn, ms)); };
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  useVisibleOnce(root, () => later(() => setActive(0), 500));
  const finish = (i: number) => () => {
    const next = i + 1;
    if (next === TARGETS.length) { setActive(-1); later(() => setActive(0), 1500); } else setActive(next);
  };
  return (
    <div ref={root}>
      {TARGETS.map((_, i) => <Slot key={i} index={i} active={active} onFinish={finish(i)} />)}
    </div>
  );
}
