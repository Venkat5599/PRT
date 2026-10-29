// Generated from the landing markup by landing-port/gen.py. Do not edit by hand:
// change the source or the generator and regenerate.
import Wall from "@/components/landing/wall/Wall";

export default function GetStarted() {
  return (
    <section className={"py-56 md:py-120 px-8 isolate overflow-hidden"}>
      <div className={"cta rounded-32 max-w-936 mx-auto pt-56 md:pt-80 pb-72"}>
        <div className={"max-w-686 px-32 mx-auto mb-32 relative z-10"}>
          <div className={"rounded-full py-4 px-12 md-max:mx-auto cta-badge bg-white/8 w-max text-special-mono mb-12 shadow-badge-dark"}>
            <span>
              {"Get started"}
            </span>
          </div>
          <h2 className={"text-title-h3 mb-12 relative text-title-gradient md-max:text-center"}>
            {"Know what your "}
            <br />
            {" Portaldot"}
            <div aria-hidden={"true"} className={"w-40 md:w-52 items-center inline-flex h-40 md:h-52 align-end top-7 relative mx-6 select-none hero-title-logo rounded-14"}>
              <img alt={"Portal Canary logo"} decoding={"async"} height={"52"} loading={"lazy"} src={"/assets/images/cta/logo.png"} style={{} as React.CSSProperties} width={"52"} className={"lazy-image opacity-0 w-full h-full"} />
            </div>
            {"upgrade breaks"}
          </h2>
          <p className={"max-w-600 text-body-dark-loud text-body-large mb-32 md-max:text-center"}>
            {"Canary runs your workflows on a baseline and a candidate runtime, classifies every difference and gives you one command to reproduce it. You write the upgrade. Canary checks it."}
          </p>
          <div className={"flex gap-8 sm:gap-16 md-max:justify-center"}>
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
              <button aria-label={"Read docs"} className={"rounded-full relative button block transition-all duration-[200ms] active:duration-[50ms] button-dark px-16 py-12 sm-max:flex-1 sm:py-7 pl-14"}>
                <span className={"flex items-center gap-4 justify-center text-label-normal text-body-dark-label"}>
                  {"Read docs"}
                </span>
              </button>
            </a>
          </div>
        </div>
        <div className={"relative"}>
          <div className={"h-1 w-full top-28 absolute left-0 bg-white/10 md-max:hidden"}></div>
          <Wall noIndicators />
        </div>
        <div className={"w-716 center-x h-full cta-horizontal-border flex justify-between top-0 pointer-events-none md-max:hidden"}></div>
        <div className={"w-810 center-x top-460 md-max:hidden h-[calc(100%-453px)] gradient-mask-b-[#fff_50%] pointer-events-none"}>
          <svg fill={"none"} height={"100"} viewBox={"0 0 100 100"} width={"100"} className={"absolute -top-16 -left-16"} xmlns={"http://www.w3.org/2000/svg"}>
            <path d={"M85 16H48C30.3269 16 16 30.3269 16 48V85"} stroke={"#fff"} strokeOpacity={"0.1"}></path>
          </svg>
          <div className={"right-69 absolute top-[-0.5px] h-1 w-380 bg-white/10"}></div>
          <div className={"border-x top-69 w-[calc(100%+1px)] border-white/10 absolute left-[-0.5px] h-[calc(100%-69px)]"}></div>
          <svg fill={"none"} height={"100"} viewBox={"0 0 100 100"} width={"100"} className={"absolute -top-16 -right-16"} xmlns={"http://www.w3.org/2000/svg"}>
            <path d={"M15 16H52C69.6731 16 84 30.3269 84 48V85"} stroke={"#fff"} strokeOpacity={"0.1"}></path>
          </svg>
        </div>
      </div>
    </section>
  );
}
