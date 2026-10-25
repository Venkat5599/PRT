// Server markup of the original static landing for this component, captured before the React port.
// tests/landing.test.tsx asserts the React component still renders exactly this.
export default function Wall({ noIndicators }: { noIndicators?: boolean }) {
  if (noIndicators) return (
    <div className={"wall-testimonials relative"}>
      <div className={"relative"}>
        <div className={"w-full transition-all duration-[600ms]"}>
          <img alt={""} decoding={"async"} height={"556"} loading={"lazy"} src={"/assets/images/wall/compare/background.png"} style={{} as React.CSSProperties} width={"992"} className={"lazy-image opacity-0 relative left-1/2 -translate-x-1/2 !transition-all max-w-[calc(100%+80px)] wall-testimonials-view-image"} />
        </div>
      </div>
      <div className={"wall-testimonials-dock -mt-40 md:-mt-100 gap-2 md:gap-3 p-6 flex items-end max-w-[calc(100%-32px)] h-52 md:h-84 rounded-12 md:rounded-24 w-max mx-auto relative before:inside-border before:border-[#FFFFFF0F]"}>
        <div className={"relative group"}>
          <div className={"center-x -bottom-2 w-3 rounded-full h-3 bg-white/30 transition-all duration-[200ms]"}></div>
          <button aria-label={"dock logo"} className={"select-none relative block"}>
            <img alt={"Portal Canary surface"} decoding={"async"} height={"72"} loading={"lazy"} src={"/assets/images/wall/compare/logo.png"} style={{} as React.CSSProperties} width={"72"} className={"lazy-image opacity-0 select-none !transition-none md-max:w-40 md-max:h-40"} />
            <div className={"top-0 outline backdrop-blur-8 outline-[#192E4E] outline-1 duration-[200ms] blur-[4px] group-hover:blur-[0px] scale-90 group-hover:scale-100 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition group-hover:-translate-y-full px-14 py-4 center-x wall-testimonials-dock-item-tooltip before:inside-border before:border-white/6 rounded-6 text-body-normal text-white whitespace-nowrap"}>
              {"Live compare"}
            </div>
          </button>
        </div>
        <div className={"relative group"}>
          <button aria-label={"dock logo"} className={"select-none relative block"}>
            <img alt={"Portal Canary surface"} decoding={"async"} height={"72"} loading={"lazy"} src={"/assets/images/wall/doctor/logo.png"} style={{} as React.CSSProperties} width={"72"} className={"lazy-image opacity-0 select-none !transition-none md-max:w-40 md-max:h-40"} />
            <div className={"top-0 outline backdrop-blur-8 outline-[#192E4E] outline-1 duration-[200ms] blur-[4px] group-hover:blur-[0px] scale-90 group-hover:scale-100 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition group-hover:-translate-y-full px-14 py-4 center-x wall-testimonials-dock-item-tooltip before:inside-border before:border-white/6 rounded-6 text-body-normal text-white whitespace-nowrap"}>
              {"Doctor"}
            </div>
          </button>
        </div>
        <div className={"relative group"}>
          <button aria-label={"dock logo"} className={"select-none relative block"}>
            <img alt={"Portal Canary surface"} decoding={"async"} height={"72"} loading={"lazy"} src={"/assets/images/wall/runs/logo.png"} style={{} as React.CSSProperties} width={"72"} className={"lazy-image opacity-0 select-none !transition-none md-max:w-40 md-max:h-40"} />
            <div className={"top-0 outline backdrop-blur-8 outline-[#192E4E] outline-1 duration-[200ms] blur-[4px] group-hover:blur-[0px] scale-90 group-hover:scale-100 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition group-hover:-translate-y-full px-14 py-4 center-x wall-testimonials-dock-item-tooltip before:inside-border before:border-white/6 rounded-6 text-body-normal text-white whitespace-nowrap"}>
              {"Test runs"}
            </div>
          </button>
        </div>
        <div className={"relative group"}>
          <button aria-label={"dock logo"} className={"select-none relative block"}>
            <img alt={"Portal Canary surface"} decoding={"async"} height={"72"} loading={"lazy"} src={"/assets/images/wall/invariants/logo.png"} style={{} as React.CSSProperties} width={"72"} className={"lazy-image opacity-0 select-none !transition-none md-max:w-40 md-max:h-40"} />
            <div className={"top-0 outline backdrop-blur-8 outline-[#192E4E] outline-1 duration-[200ms] blur-[4px] group-hover:blur-[0px] scale-90 group-hover:scale-100 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition group-hover:-translate-y-full px-14 py-4 center-x wall-testimonials-dock-item-tooltip before:inside-border before:border-white/6 rounded-6 text-body-normal text-white whitespace-nowrap"}>
              {"Invariants"}
            </div>
          </button>
        </div>
        <div className={"relative group"}>
          <button aria-label={"dock logo"} className={"select-none relative block"}>
            <img alt={"Portal Canary surface"} decoding={"async"} height={"72"} loading={"lazy"} src={"/assets/images/wall/cli-ci/logo.png"} style={{} as React.CSSProperties} width={"72"} className={"lazy-image opacity-0 select-none !transition-none md-max:w-40 md-max:h-40"} />
            <div className={"top-0 outline backdrop-blur-8 outline-[#192E4E] outline-1 duration-[200ms] blur-[4px] group-hover:blur-[0px] scale-90 group-hover:scale-100 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition group-hover:-translate-y-full px-14 py-4 center-x wall-testimonials-dock-item-tooltip before:inside-border before:border-white/6 rounded-6 text-body-normal text-white whitespace-nowrap"}>
              {"CLI and CI"}
            </div>
          </button>
        </div>
        <div className={"relative group"}>
          <button aria-label={"dock logo"} className={"select-none relative block"}>
            <img alt={"Portal Canary surface"} decoding={"async"} height={"72"} loading={"lazy"} src={"/assets/images/wall/mainnet-v3/logo.png"} style={{} as React.CSSProperties} width={"72"} className={"lazy-image opacity-0 select-none !transition-none md-max:w-40 md-max:h-40"} />
            <div className={"top-0 outline backdrop-blur-8 outline-[#192E4E] outline-1 duration-[200ms] blur-[4px] group-hover:blur-[0px] scale-90 group-hover:scale-100 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition group-hover:-translate-y-full px-14 py-4 center-x wall-testimonials-dock-item-tooltip before:inside-border before:border-white/6 rounded-6 text-body-normal text-white whitespace-nowrap"}>
              {"Mainnet vs V3"}
            </div>
          </button>
        </div>
        <div className={"relative group"}>
          <button aria-label={"dock logo"} className={"select-none relative block"}>
            <img alt={"Portal Canary surface"} decoding={"async"} height={"72"} loading={"lazy"} src={"/assets/images/wall/ed100x/logo.png"} style={{} as React.CSSProperties} width={"72"} className={"lazy-image opacity-0 select-none !transition-none md-max:w-40 md-max:h-40"} />
            <div className={"top-0 outline backdrop-blur-8 outline-[#192E4E] outline-1 duration-[200ms] blur-[4px] group-hover:blur-[0px] scale-90 group-hover:scale-100 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition group-hover:-translate-y-full px-14 py-4 center-x wall-testimonials-dock-item-tooltip before:inside-border before:border-white/6 rounded-6 text-body-normal text-white whitespace-nowrap"}>
              {"Deposit \u00d7100"}
            </div>
          </button>
        </div>
        <div className={"relative group sm-max:hidden"}>
          <button aria-label={"dock logo"} className={"select-none relative block"}>
            <img alt={"Portal Canary surface"} decoding={"async"} height={"72"} loading={"lazy"} src={"/assets/images/wall/fee10x/logo.png"} style={{} as React.CSSProperties} width={"72"} className={"lazy-image opacity-0 select-none !transition-none md-max:w-40 md-max:h-40"} />
            <div className={"top-0 outline backdrop-blur-8 outline-[#192E4E] outline-1 duration-[200ms] blur-[4px] group-hover:blur-[0px] scale-90 group-hover:scale-100 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition group-hover:-translate-y-full px-14 py-4 center-x wall-testimonials-dock-item-tooltip before:inside-border before:border-white/6 rounded-6 text-body-normal text-white whitespace-nowrap"}>
              {"Byte fee \u00d710"}
            </div>
          </button>
        </div>
        <div className={"relative group sm-max:hidden"}>
          <button aria-label={"dock logo"} className={"select-none relative block"}>
            <img alt={"Portal Canary surface"} decoding={"async"} height={"72"} loading={"lazy"} src={"/assets/images/wall/control/logo.png"} style={{} as React.CSSProperties} width={"72"} className={"lazy-image opacity-0 select-none !transition-none md-max:w-40 md-max:h-40"} />
            <div className={"top-0 outline backdrop-blur-8 outline-[#192E4E] outline-1 duration-[200ms] blur-[4px] group-hover:blur-[0px] scale-90 group-hover:scale-100 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition group-hover:-translate-y-full px-14 py-4 center-x wall-testimonials-dock-item-tooltip before:inside-border before:border-white/6 rounded-6 text-body-normal text-white whitespace-nowrap"}>
              {"Control run"}
            </div>
          </button>
        </div>
      </div>
    </div>
  );
  return (
    <div className={"wall-testimonials relative"}>
      <div className={"relative"}>
        <div className={"w-full transition-all duration-[600ms]"}>
          <img alt={""} decoding={"async"} height={"556"} loading={"lazy"} src={"/assets/images/wall/compare/background.png"} style={{} as React.CSSProperties} width={"992"} className={"lazy-image opacity-0 relative left-1/2 -translate-x-1/2 !transition-all max-w-[calc(100%+80px)] wall-testimonials-view-image"} />
        </div>
      </div>
      <div className={"wall-testimonials-dock -mt-40 md:-mt-100 gap-2 md:gap-3 p-6 flex items-end max-w-[calc(100%-32px)] h-52 md:h-84 rounded-12 md:rounded-24 w-max mx-auto relative before:inside-border before:border-[#FFFFFF0F]"}>
        <div className={"relative group"}>
          <div className={"center-x -bottom-2 w-3 rounded-full h-3 bg-white/30 transition-all duration-[200ms]"}></div>
          <button aria-label={"dock logo"} className={"select-none relative block"}>
            <img alt={"Portal Canary surface"} decoding={"async"} height={"72"} loading={"lazy"} src={"/assets/images/wall/compare/logo.png"} style={{} as React.CSSProperties} width={"72"} className={"lazy-image opacity-0 select-none !transition-none md-max:w-40 md-max:h-40"} />
            <div className={"top-0 outline backdrop-blur-8 outline-[#192E4E] outline-1 duration-[200ms] blur-[4px] group-hover:blur-[0px] scale-90 group-hover:scale-100 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition group-hover:-translate-y-full px-14 py-4 center-x wall-testimonials-dock-item-tooltip before:inside-border before:border-white/6 rounded-6 text-body-normal text-white whitespace-nowrap"}>
              {"Live compare"}
            </div>
          </button>
        </div>
        <div className={"relative group"}>
          <button aria-label={"dock logo"} className={"select-none relative block"}>
            <img alt={"Portal Canary surface"} decoding={"async"} height={"72"} loading={"lazy"} src={"/assets/images/wall/doctor/logo.png"} style={{} as React.CSSProperties} width={"72"} className={"lazy-image opacity-0 select-none !transition-none md-max:w-40 md-max:h-40"} />
            <div className={"top-0 outline backdrop-blur-8 outline-[#192E4E] outline-1 duration-[200ms] blur-[4px] group-hover:blur-[0px] scale-90 group-hover:scale-100 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition group-hover:-translate-y-full px-14 py-4 center-x wall-testimonials-dock-item-tooltip before:inside-border before:border-white/6 rounded-6 text-body-normal text-white whitespace-nowrap"}>
              {"Doctor"}
            </div>
          </button>
        </div>
        <div className={"relative group"}>
          <button aria-label={"dock logo"} className={"select-none relative block"}>
            <img alt={"Portal Canary surface"} decoding={"async"} height={"72"} loading={"lazy"} src={"/assets/images/wall/runs/logo.png"} style={{} as React.CSSProperties} width={"72"} className={"lazy-image opacity-0 select-none !transition-none md-max:w-40 md-max:h-40"} />
            <div className={"top-0 outline backdrop-blur-8 outline-[#192E4E] outline-1 duration-[200ms] blur-[4px] group-hover:blur-[0px] scale-90 group-hover:scale-100 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition group-hover:-translate-y-full px-14 py-4 center-x wall-testimonials-dock-item-tooltip before:inside-border before:border-white/6 rounded-6 text-body-normal text-white whitespace-nowrap"}>
              {"Test runs"}
            </div>
          </button>
        </div>
        <div className={"relative group"}>
          <button aria-label={"dock logo"} className={"select-none relative block"}>
            <img alt={"Portal Canary surface"} decoding={"async"} height={"72"} loading={"lazy"} src={"/assets/images/wall/invariants/logo.png"} style={{} as React.CSSProperties} width={"72"} className={"lazy-image opacity-0 select-none !transition-none md-max:w-40 md-max:h-40"} />
            <div className={"top-0 outline backdrop-blur-8 outline-[#192E4E] outline-1 duration-[200ms] blur-[4px] group-hover:blur-[0px] scale-90 group-hover:scale-100 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition group-hover:-translate-y-full px-14 py-4 center-x wall-testimonials-dock-item-tooltip before:inside-border before:border-white/6 rounded-6 text-body-normal text-white whitespace-nowrap"}>
              {"Invariants"}
            </div>
          </button>
        </div>
        <div className={"relative group"}>
          <button aria-label={"dock logo"} className={"select-none relative block"}>
            <img alt={"Portal Canary surface"} decoding={"async"} height={"72"} loading={"lazy"} src={"/assets/images/wall/cli-ci/logo.png"} style={{} as React.CSSProperties} width={"72"} className={"lazy-image opacity-0 select-none !transition-none md-max:w-40 md-max:h-40"} />
            <div className={"top-0 outline backdrop-blur-8 outline-[#192E4E] outline-1 duration-[200ms] blur-[4px] group-hover:blur-[0px] scale-90 group-hover:scale-100 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition group-hover:-translate-y-full px-14 py-4 center-x wall-testimonials-dock-item-tooltip before:inside-border before:border-white/6 rounded-6 text-body-normal text-white whitespace-nowrap"}>
              {"CLI and CI"}
            </div>
          </button>
        </div>
        <div className={"relative group"}>
          <button aria-label={"dock logo"} className={"select-none relative block"}>
            <img alt={"Portal Canary surface"} decoding={"async"} height={"72"} loading={"lazy"} src={"/assets/images/wall/mainnet-v3/logo.png"} style={{} as React.CSSProperties} width={"72"} className={"lazy-image opacity-0 select-none !transition-none md-max:w-40 md-max:h-40"} />
            <div className={"top-0 outline backdrop-blur-8 outline-[#192E4E] outline-1 duration-[200ms] blur-[4px] group-hover:blur-[0px] scale-90 group-hover:scale-100 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition group-hover:-translate-y-full px-14 py-4 center-x wall-testimonials-dock-item-tooltip before:inside-border before:border-white/6 rounded-6 text-body-normal text-white whitespace-nowrap"}>
              {"Mainnet vs V3"}
            </div>
          </button>
        </div>
        <div className={"relative group"}>
          <button aria-label={"dock logo"} className={"select-none relative block"}>
            <img alt={"Portal Canary surface"} decoding={"async"} height={"72"} loading={"lazy"} src={"/assets/images/wall/ed100x/logo.png"} style={{} as React.CSSProperties} width={"72"} className={"lazy-image opacity-0 select-none !transition-none md-max:w-40 md-max:h-40"} />
            <div className={"top-0 outline backdrop-blur-8 outline-[#192E4E] outline-1 duration-[200ms] blur-[4px] group-hover:blur-[0px] scale-90 group-hover:scale-100 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition group-hover:-translate-y-full px-14 py-4 center-x wall-testimonials-dock-item-tooltip before:inside-border before:border-white/6 rounded-6 text-body-normal text-white whitespace-nowrap"}>
              {"Deposit \u00d7100"}
            </div>
          </button>
        </div>
        <div className={"relative group sm-max:hidden"}>
          <button aria-label={"dock logo"} className={"select-none relative block"}>
            <img alt={"Portal Canary surface"} decoding={"async"} height={"72"} loading={"lazy"} src={"/assets/images/wall/fee10x/logo.png"} style={{} as React.CSSProperties} width={"72"} className={"lazy-image opacity-0 select-none !transition-none md-max:w-40 md-max:h-40"} />
            <div className={"top-0 outline backdrop-blur-8 outline-[#192E4E] outline-1 duration-[200ms] blur-[4px] group-hover:blur-[0px] scale-90 group-hover:scale-100 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition group-hover:-translate-y-full px-14 py-4 center-x wall-testimonials-dock-item-tooltip before:inside-border before:border-white/6 rounded-6 text-body-normal text-white whitespace-nowrap"}>
              {"Byte fee \u00d710"}
            </div>
          </button>
        </div>
        <div className={"relative group sm-max:hidden"}>
          <button aria-label={"dock logo"} className={"select-none relative block"}>
            <img alt={"Portal Canary surface"} decoding={"async"} height={"72"} loading={"lazy"} src={"/assets/images/wall/control/logo.png"} style={{} as React.CSSProperties} width={"72"} className={"lazy-image opacity-0 select-none !transition-none md-max:w-40 md-max:h-40"} />
            <div className={"top-0 outline backdrop-blur-8 outline-[#192E4E] outline-1 duration-[200ms] blur-[4px] group-hover:blur-[0px] scale-90 group-hover:scale-100 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition group-hover:-translate-y-full px-14 py-4 center-x wall-testimonials-dock-item-tooltip before:inside-border before:border-white/6 rounded-6 text-body-normal text-white whitespace-nowrap"}>
              {"Control run"}
            </div>
          </button>
        </div>
        <img alt={"Live surfaces"} decoding={"async"} height={"116"} loading={"lazy"} src={"/assets/images/wall/our-customers.png"} style={{} as React.CSSProperties} width={"224"} className={"lazy-image opacity-0 absolute -top-48 -left-240 md-max:!hidden"} />
        <img alt={"Live surfaces"} decoding={"async"} height={"61"} loading={"lazy"} src={"/assets/images/wall/click-to-see.png"} style={{} as React.CSSProperties} width={"143"} className={"lazy-image opacity-0 absolute -top-8 -right-160 md-max:!hidden"} />
      </div>
      <div className={"w-996 center-x top-0 md-max:!hidden"}>
        <img alt={"Live surfaces"} decoding={"async"} height={"134"} loading={"lazy"} src={"/assets/images/wall/powered-by.png"} style={{} as React.CSSProperties} width={"151"} className={"lazy-image opacity-0 absolute -top-60 -right-48"} />
      </div>
    </div>
  );
}
