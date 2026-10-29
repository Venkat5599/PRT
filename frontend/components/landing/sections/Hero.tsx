// Generated from the landing markup by landing-port/gen.py. Do not edit by hand:
// change the source or the generator and regenerate.
import HeroStage from "@/components/landing/hero/HeroStage";

export default function Hero() {
  return (
    <section className={"pt-14 pb-284 relative px-16 isolate overflow-hidden"}>
      <div className={"hero-orbit w-64 h-64 relative mx-auto mb-18"}>
        <div className={"overlay blur-[3px]"}>
          <div style={{"animationDelay": "0s", "--start-angle": "225deg", "--background-image-desktop": "url('/assets/images/hero/orbit/circle.png')", "--background-image-mobile": "url('/assets/images/hero/orbit/circle.png')"} as React.CSSProperties} className={"lazy-background-image lazy-background-image-maskImage opacity-0 center hero-orbit-item w-[37.5px] h-[17.5px]"}></div>
          <div style={{"animationDelay": "-0.4s", "--start-angle": "225deg", "--background-image-desktop": "url('/assets/images/hero/orbit/circle.png')", "--background-image-mobile": "url('/assets/images/hero/orbit/circle.png')"} as React.CSSProperties} className={"lazy-background-image lazy-background-image-maskImage opacity-0 center hero-orbit-item w-[37.5px] h-[17.5px] -rotate-[60deg]"}></div>
          <div style={{"animationDelay": "-0.8s", "--start-angle": "225deg", "--background-image-desktop": "url('/assets/images/hero/orbit/circle.png')", "--background-image-mobile": "url('/assets/images/hero/orbit/circle.png')"} as React.CSSProperties} className={"lazy-background-image lazy-background-image-maskImage opacity-0 center hero-orbit-item w-[37.5px] h-[17.5px] -rotate-[120deg]"}></div>
          <div className={"center w-2 h-2 bg-white rounded-full hero-background-dot"}></div>
        </div>
        <div className={"overlay"}>
          <div style={{"animationDelay": "0s", "--start-angle": "225deg", "--background-image-desktop": "url('/assets/images/hero/orbit/circle.png')", "--background-image-mobile": "url('/assets/images/hero/orbit/circle.png')"} as React.CSSProperties} className={"lazy-background-image lazy-background-image-maskImage opacity-0 center hero-orbit-item w-[37.5px] h-[17.5px]"}></div>
          <div style={{"animationDelay": "-0.4s", "--start-angle": "225deg", "--background-image-desktop": "url('/assets/images/hero/orbit/circle.png')", "--background-image-mobile": "url('/assets/images/hero/orbit/circle.png')"} as React.CSSProperties} className={"lazy-background-image lazy-background-image-maskImage opacity-0 center hero-orbit-item w-[37.5px] h-[17.5px] -rotate-[60deg]"}></div>
          <div style={{"animationDelay": "-0.8s", "--start-angle": "225deg", "--background-image-desktop": "url('/assets/images/hero/orbit/circle.png')", "--background-image-mobile": "url('/assets/images/hero/orbit/circle.png')"} as React.CSSProperties} className={"lazy-background-image lazy-background-image-maskImage opacity-0 center hero-orbit-item w-[37.5px] h-[17.5px] -rotate-[120deg]"}></div>
          <div className={"center w-2 h-2 bg-white rounded-full hero-background-dot"}></div>
        </div>
      </div>
      <div className={"flex gap-2 items-center rounded-full py-4 px-8 bg-white/8 w-max mx-auto text-special-mono mb-12 shadow-badge-dark"}>
        <svg fill={"none"} height={"14"} viewBox={"0 0 14 14"} width={"14"} xmlns={"http://www.w3.org/2000/svg"}>
          <path d={"M8.16791 1.40103C8.16791 0.535288 7.04509 0.195336 6.56487 0.915664L1.85985 7.97319C1.4722 8.55467 1.88904 9.33355 2.5879 9.33355H5.83458V12.5994C5.83458 13.4651 6.9574 13.8051 7.43762 13.0848L12.1426 6.02725C12.5303 5.44576 12.1135 4.66688 11.4146 4.66688H8.16791V1.40103Z"} fill={"url(#paint0_linear_191_185)"} style={{} as React.CSSProperties}></path>
          <defs>
            <linearGradient gradientUnits={"userSpaceOnUse"} id={"paint0_linear_191_185"} x1={"7.00125"} x2={"7.00125"} y1={"0.524414"} y2={"13.476"}>
              <stop stopColor={"white"} style={{"stopColor": "white", "stopOpacity": "1"} as React.CSSProperties}></stop>
              <stop offset={"1"} stopColor={"white"} stopOpacity={"0.8"} style={{"stopColor": "white", "stopOpacity": "0.8"} as React.CSSProperties}></stop>
            </linearGradient>
          </defs>
        </svg>
        <div className={"px-4 text-body-dark-label"}>
          {"Runtime upgrade testing"}
        </div>
      </div>
      <h1 className={"text-title-h1 text-center mb-12 relative lg-max:hidden"}>
        <span className={"w-max mx-auto text-title-gradient relative"}>
          {"Test, Diff and"}
          <img alt={"Title frame decoration"} decoding={"async"} fetchPriority={"low"} src={"/assets/images/hero/title-frame-1.png"} width={"348"} aria-hidden={"true"} className={"absolute -left-410 -top-77 object-cover select-none pointer-events-none"} />
          <img alt={"Title frame decoration"} decoding={"async"} fetchPriority={"low"} src={"/assets/images/hero/title-frame-2.png"} width={"348"} aria-hidden={"true"} className={"absolute -right-410 -top-77 object-cover select-none pointer-events-none"} />
        </span>
        <div className={"flex gap-8 items-center justify-center relative w-max mx-auto"}>
          <img alt={"Description frame decoration"} decoding={"async"} fetchPriority={"low"} src={"/assets/images/hero/description-frame-1.png"} width={"252"} aria-hidden={"true"} className={"absolute -left-314 top-40 object-cover select-none pointer-events-none"} />
          <img alt={"Description frame decoration"} decoding={"async"} fetchPriority={"low"} src={"/assets/images/hero/description-frame-2.png"} width={"252"} aria-hidden={"true"} className={"absolute -right-314 top-40 object-cover select-none pointer-events-none"} />
          <span className={"text-title-gradient"}>
            {"Ship your Portaldot"}
          </span>
          <div aria-hidden={"true"} className={"h-48 mx-8 lg:mx-8 w-48 lg:w-64 lg:h-64 flex-center select-none"}>
            <img alt={"Portal Canary surface"} decoding={"async"} fetchPriority={"low"} height={"64"} src={"/assets/images/hero/logo.png"} width={"64"} aria-hidden={"true"} className={"hero-title-logo w-full h-full"} />
          </div>
          <span className={"text-title-gradient"}>
            {"Runtime"}
          </span>
        </div>
      </h1>
      <h1 className={"text-title-h1 text-center mb-12 relative lg:hidden text-title-gradient"}>
        {"Test, Diff and Ship your Portaldot"}
        <div aria-hidden={"true"} className={"h-48 mx-10 w-48 flex-center !inline-flex select-none relative top-8"}>
          <img alt={"Portal Canary surface"} decoding={"async"} fetchPriority={"low"} height={"64"} src={"/assets/images/hero/logo.png"} width={"64"} aria-hidden={"true"} className={"hero-title-logo w-full h-full"} />
        </div>
        {"Runtime"}
      </h1>
      <p className={"max-w-600 mx-auto text-body-dark-loud text-center text-body-large mb-32"}>
        {"Same workflows before and after an upgrade, every difference classified, one command to reproduce."}
      </p>
      <div className={"flex flex-col items-center mb-66 sm:mb-38 relative"}>
        <div className={"flex gap-8 sm:gap-16 sm:w-max"}>
          <a href={"/dashboard#compare"} className={"sm-max:flex-1"}>
            <button aria-label={"Compare live"} className={"rounded-full relative button block transition-all duration-[200ms] active:duration-[50ms] button-primary px-10 py-12 sm-max:flex-1 sm:py-7 pl-14"}>
              <span className={"flex items-center gap-4 justify-center text-label-normal text-body-dark-label"}>
                {"Compare live"}
                <svg fill={"none"} height={"20"} viewBox={"0 0 21 20"} width={"21"} xmlns={"http://www.w3.org/2000/svg"}>
                  <path d={"M8.8335 13.3332L11.5776 10.5891C11.903 10.2637 11.903 9.73602 11.5776 9.41058L8.8335 6.6665"} stroke={"white"} strokeLinecap={"round"} strokeLinejoin={"round"} strokeWidth={"1.5"} style={{"stroke": "white", "strokeOpacity": "1"} as React.CSSProperties}></path>
                </svg>
              </span>
            </button>
          </a>
          <a href={"https://github.com/Venkat5599/portalcanary#readme"} target={"_blank"} rel={"noopener"}>
            <button aria-label={"Read docs"} className={"rounded-full relative button block transition-all duration-[200ms] active:duration-[50ms] button-dark px-16 py-12 flex-1 sm:py-7 pl-14"}>
              <span className={"flex items-center gap-4 justify-center text-label-normal text-body-dark-label"}>
                {"Read docs"}
              </span>
            </button>
          </a>
        </div>
        <img alt={"hero btn frame"} src={"/assets/images/hero/button-frame-1.png"} width={"316"} aria-hidden={"true"} className={"absolute -left-340 top-17"} />
        <img alt={""} src={"/assets/images/hero/button-frame-2.png"} width={"316"} aria-hidden={"true"} className={"absolute -right-340 top-17"} />
      </div>
      <HeroStage />
    </section>
  );
}
