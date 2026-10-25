// Generated from the landing markup by landing-port/gen.py (views.json). Do not edit by hand.
import type { Bind, Kids } from "@/components/landing/bind";

export default function SupplyGaugeView({ b, k }: { b: Bind; k: Kids }) {
  return (
    <div className={"overlay transition-all"} {...b("root", 0, "overlay transition-all")}>
      <div className={"h-240 absolute top-0 w-full left-0"}>
        <div className={"features-performance-mask overlay w-full h-full text-special-mono features-performance-texts-wrapper"} {...b("texts", 0, "features-performance-mask overlay w-full h-full text-special-mono features-performance-texts-wrapper")}></div>
        <div className={"top-116 absolute inset-x-51 rounded-14 h-156 backdrop-blur-4"}></div>
        <div className={"overlay features-performance-mask"}>
          <div className={"top-115 absolute inset-x-51 bg-white/88 z-[100] rounded-14 h-156 features-performance-app"}>
            <div className={"p-10 w-full border-b border-black/4 gap-8 flex"}>
              <div className={"w-8 h-8 rounded-full bg-black/12"}></div>
              <div className={"w-8 h-8 rounded-full bg-black/12"}></div>
              <div className={"w-8 h-8 rounded-full bg-black/12"}></div>
            </div>
          </div>
        </div>
      </div>
      <div style={{"--background-image-desktop": "url('/assets/images/features/performance/outer-circle.png')", "--background-image-mobile": "url('/assets/images/features/performance/outer-circle.png')"} as React.CSSProperties} className={"lazy-background-image lazy-background-image-backgroundImage opacity-0 top-44 left-[calc(50%-78px)] absolute w-156 h-156 features-performance-meter rounded-full"} {...b("meter", 0, "lazy-background-image lazy-background-image-backgroundImage opacity-0 top-44 left-[calc(50%-78px)] absolute w-156 h-156 features-performance-meter rounded-full")}>
        <img alt={""} decoding={"async"} height={"128"} loading={"lazy"} src={"/assets/images/features/performance/inner-circle.png"} style={{} as React.CSSProperties} width={"128"} className={"lazy-image opacity-0 absolute z-10 top-14 left-14 features-performance-meter-inner rounded-full"} />
        <div className={"w-128 absolute z-10 top-14 left-14 features-performance-meter-shade"}>
          <img alt={""} decoding={"async"} height={"128"} loading={"lazy"} src={"/assets/images/features/performance/shade.png"} style={{} as React.CSSProperties} width={"128"} className={"lazy-image opacity-0 !transition-all !duration-[400ms]"} {...b("shade", 0, "lazy-image opacity-0 !transition-all !duration-[400ms]")} />
        </div>
        <div style={{"rotate": "-113deg"} as React.CSSProperties} className={"w-26 h-26 top-65 left-65 absolute z-10 transition-all duration-[400ms]"} {...b("tick", 0, "w-26 h-26 top-65 left-65 absolute z-10 transition-all duration-[400ms]")}>
          <img alt={""} decoding={"async"} height={"70"} loading={"lazy"} src={"/assets/images/features/performance/tick.png"} style={{} as React.CSSProperties} width={"26"} className={"lazy-image opacity-0 absolute z-10 bottom-0 left-0 max-w-unset features-performance-meter-tick"} />
        </div>
      </div>
    </div>
  );
}
