// Generated from the landing markup by landing-port/gen.py (views.json). Do not edit by hand.
import type { Bind, Kids } from "@/components/landing/bind";

export default function HeroStageView({ b, k }: { b: Bind; k: Kids }) {
  return (
    <div className={"hero-animation max-w-968 mx-auto"}>
      <div data-hero-tabs={""} className={"hero-tabs flex items-center px-4 sm-max:gap-6 sm-max:before:inside-border before:border-white/8 relative rounded-full sm-max:p-4 mb-24 sm:mb-20"}>
        <button aria-label={"Diagnose the endpoint"} className={"flex-1 sm:px-42 md:px-20 self-start sm:py-16 group text-center hero-tabs-item transition duration-[50ms] active:translate-y-1 hero-tabs-item-active"} {...b("tab", 0, "flex-1 sm:px-42 md:px-20 self-start sm:py-16 group text-center hero-tabs-item transition duration-[50ms] active:translate-y-1 hero-tabs-item-active")}>
          <div className={"hero-tabs-item-icon after:transition after:overlay sm:mb-16 w-full sm:w-max mx-auto py-10 sm:py-6 px-18 relative before:inside-border before:border-white/8 rounded-full"}>
            <svg fill={"none"} height={"24"} viewBox={"0 0 24 24"} width={"24"} className={"transition mx-auto"} xmlns={"http://www.w3.org/2000/svg"} {...b("tabIcon", 0, "transition mx-auto")}>
              <path d={"M19.5 4.5H4.5C3.39543 4.5 2.5 5.39543 2.5 6.5V18.5C2.5 19.6046 3.39543 20.5 4.5 20.5H11.5875C12.1753 20.5 12.7427 20.2843 13.182 19.8938L20.6945 13.216C21.2068 12.7606 21.5 12.1078 21.5 11.4222V6.5C21.5 5.39543 20.6046 4.5 19.5 4.5Z"} fill={"url(#paint0_linear_640_2086)"} fillOpacity={"0.24"} style={{} as React.CSSProperties}></path>
              <g filter={"url(#filter0_b_640_2086)"}>
                <path d={"M14 14L21.5 16.3077L18.0385 18.0385L16.3077 21.5L14 14Z"} fill={"white"} fillOpacity={"0.01"} style={{"fill": "white", "fillOpacity": "0.01"} as React.CSSProperties}></path>
                <path d={"M14 14L21.5 16.3077L18.0385 18.0385L16.3077 21.5L14 14Z"} fill={"url(#paint1_linear_640_2086)"} fillOpacity={"0.24"} style={{} as React.CSSProperties}></path>
              </g>
              <path d={"M21.501 12.5V6.5C21.501 5.39543 20.6055 4.5 19.501 4.5H4.50098C3.39641 4.5 2.50098 5.39543 2.50098 6.5V18.5C2.50098 19.6046 3.39641 20.5 4.50098 20.5H12.501M21.501 16.3077L14.001 14L16.3087 21.5L18.0394 18.0385L21.501 16.3077Z"} stroke={"white"} strokeLinecap={"round"} strokeLinejoin={"round"} style={{"stroke": "white", "strokeOpacity": "1"} as React.CSSProperties}></path>
              <path d={"M5.37598 8C5.37598 8.34518 5.6558 8.625 6.00098 8.625C6.34615 8.625 6.62598 8.34518 6.62598 8C6.62598 7.65482 6.34615 7.375 6.00098 7.375C5.6558 7.375 5.37598 7.65482 5.37598 8ZM8.87598 8C8.87598 8.34518 9.1558 8.625 9.50098 8.625C9.84615 8.625 10.126 8.34518 10.126 8C10.126 7.65482 9.84615 7.375 9.50098 7.375C9.1558 7.375 8.87598 7.65482 8.87598 8ZM12.376 8C12.376 8.34518 12.6558 8.625 13.001 8.625C13.3462 8.625 13.626 8.34518 13.626 8C13.626 7.65482 13.3462 7.375 13.001 7.375C12.6558 7.375 12.376 7.65482 12.376 8Z"} fill={"white"} stroke={"white"} strokeLinecap={"round"} strokeLinejoin={"round"} strokeWidth={"0.25"} style={{"fill": "white", "fillOpacity": "1", "stroke": "white", "strokeOpacity": "1"} as React.CSSProperties}></path>
              <defs>
                <filter filterUnits={"userSpaceOnUse"} height={"36.3"} id={"filter0_b_640_2086"} width={"36.3"} x={"-0.400001"} y={"-0.400001"}>
                  <feFlood floodOpacity={"0"} result={"BackgroundImageFix"}></feFlood>
                  <feGaussianBlur in={"BackgroundImageFix"} stdDeviation={"7.2"}></feGaussianBlur>
                  <feComposite in2={"SourceAlpha"} operator={"in"} result={"effect1_backgroundBlur_640_2086"}></feComposite>
                  <feBlend in={"SourceGraphic"} in2={"effect1_backgroundBlur_640_2086"} mode={"normal"} result={"shape"}></feBlend>
                </filter>
                <linearGradient gradientUnits={"userSpaceOnUse"} id={"paint0_linear_640_2086"} x1={"12"} x2={"12"} y1={"4.5"} y2={"20.5"}>
                  <stop stopColor={"#2B2258"} stopOpacity={"0"} style={{"stopColor": "none", "stopOpacity": "0"} as React.CSSProperties}></stop>
                  <stop offset={"1"} stopColor={"white"} style={{"stopColor": "white", "stopOpacity": "1"} as React.CSSProperties}></stop>
                </linearGradient>
                <linearGradient gradientUnits={"userSpaceOnUse"} id={"paint1_linear_640_2086"} x1={"17.75"} x2={"17.75"} y1={"14"} y2={"21.5"}>
                  <stop stopColor={"#2B2258"} stopOpacity={"0"} style={{"stopColor": "none", "stopOpacity": "0"} as React.CSSProperties}></stop>
                  <stop offset={"1"} stopColor={"white"} style={{"stopColor": "white", "stopOpacity": "1"} as React.CSSProperties}></stop>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className={"transition"} {...b("tabText", 0, "transition")}>
            <div className={"mb-4 text-label-normal text-body-dark-label sm-max:hidden"}>
              {"Diagnose the endpoint"}
            </div>
            <div className={"text-body-dark-muted text-14/22 md-max:hidden"}>
              {"DNS to runtime, layer by "}
              <br />
              {" layer, on mainnet and V3."}
            </div>
          </div>
        </button>
        <div className={"w-1 h-48 bg-white/8 rounded-full sm-max:hidden"}></div>
        <button aria-label={"Diff the runtimes"} className={"flex-1 sm:px-42 md:px-20 self-start sm:py-16 group text-center hero-tabs-item transition duration-[50ms] active:translate-y-1"} {...b("tab", 1, "flex-1 sm:px-42 md:px-20 self-start sm:py-16 group text-center hero-tabs-item transition duration-[50ms] active:translate-y-1")}>
          <div className={"hero-tabs-item-icon after:transition after:overlay sm:mb-16 w-full sm:w-max mx-auto py-10 sm:py-6 px-18 relative before:inside-border before:border-white/8 rounded-full after:opacity-0 sm-max:before:opacity-0"}>
            <svg fill={"none"} height={"24"} viewBox={"0 0 24 24"} width={"24"} className={"transition mx-auto opacity-64 group-hover:opacity-90"} xmlns={"http://www.w3.org/2000/svg"} {...b("tabIcon", 1, "transition mx-auto opacity-64 group-hover:opacity-90")}>
              <path d={"M20.5 5.97774C20.5 5.54405 20.2205 5.15979 19.8078 5.0263L12.3078 2.59982C12.1077 2.53508 11.8923 2.53508 11.6922 2.59983L4.19218 5.0263C3.77955 5.15979 3.5 5.54405 3.5 5.97774V11.9126C3.5 16.885 8 19.5002 12 21.6582C16 19.5002 20.5 16.885 20.5 11.9126V5.97774Z"} fill={"url(#paint0_linear_640_2189)"} fillOpacity={"0.24"} style={{} as React.CSSProperties}></path>
              <path d={"M9 11.2502L11 13.2502L15 9.25024M20.5 11.9126V5.97774C20.5 5.54405 20.2205 5.15979 19.8078 5.0263L12.3078 2.59982C12.1077 2.53508 11.8923 2.53508 11.6922 2.59983L4.19218 5.0263C3.77955 5.15979 3.5 5.54405 3.5 5.97774V11.9126C3.5 16.885 8 19.5002 12 21.6582C16 19.5002 20.5 16.885 20.5 11.9126Z"} stroke={"white"} strokeLinecap={"round"} strokeLinejoin={"round"} style={{"stroke": "white", "strokeOpacity": "1"} as React.CSSProperties}></path>
              <defs>
                <linearGradient gradientUnits={"userSpaceOnUse"} id={"paint0_linear_640_2189"} x1={"12"} x2={"12"} y1={"2.55127"} y2={"21.6582"}>
                  <stop stopColor={"#2B2258"} stopOpacity={"0"} style={{"stopColor": "none", "stopOpacity": "0"} as React.CSSProperties}></stop>
                  <stop offset={"1"} stopColor={"white"} style={{"stopColor": "white", "stopOpacity": "1"} as React.CSSProperties}></stop>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className={"transition opacity-60 group-hover:opacity-90"} {...b("tabText", 1, "transition opacity-60 group-hover:opacity-90")}>
            <div className={"mb-4 text-label-normal text-body-dark-label sm-max:hidden"}>
              {"Diff the runtimes"}
            </div>
            <div className={"text-body-dark-muted text-14/22 md-max:hidden"}>
              {"Every pallet compared, hazards "}
              <br />
              {" flagged before setCode."}
            </div>
          </div>
        </button>
        <div className={"w-1 h-48 bg-white/8 rounded-full sm-max:hidden"}></div>
        <button aria-label={"Gate the upgrade"} className={"flex-1 sm:px-42 md:px-20 self-start sm:py-16 group text-center hero-tabs-item transition duration-[50ms] active:translate-y-1"} {...b("tab", 2, "flex-1 sm:px-42 md:px-20 self-start sm:py-16 group text-center hero-tabs-item transition duration-[50ms] active:translate-y-1")}>
          <div className={"hero-tabs-item-icon after:transition after:overlay sm:mb-16 w-full sm:w-max mx-auto py-10 sm:py-6 px-18 relative before:inside-border before:border-white/8 rounded-full after:opacity-0 sm-max:before:opacity-0"}>
            <svg fill={"none"} height={"24"} viewBox={"0 0 25 24"} width={"25"} className={"transition mx-auto opacity-64 group-hover:opacity-90"} xmlns={"http://www.w3.org/2000/svg"} {...b("tabIcon", 2, "transition mx-auto opacity-64 group-hover:opacity-90")}>
              <path clipRule={"evenodd"} d={"M11.332 2.5V4.5V2.5Z"} fill={"url(#paint0_linear_640_2213)"} fillOpacity={"0.24"} fillRule={"evenodd"} style={{} as React.CSSProperties}></path>
              <path clipRule={"evenodd"} d={"M17.4889 4.84326L15.9282 6.40392L17.4889 4.84326Z"} fill={"url(#paint1_linear_640_2213)"} fillOpacity={"0.24"} fillRule={"evenodd"} style={{} as React.CSSProperties}></path>
              <path clipRule={"evenodd"} d={"M6.73584 15.5962L5.17518 17.1569L6.73584 15.5962Z"} fill={"url(#paint2_linear_640_2213)"} fillOpacity={"0.24"} fillRule={"evenodd"} style={{} as React.CSSProperties}></path>
              <path clipRule={"evenodd"} d={"M4.83203 11H2.83203H4.83203Z"} fill={"url(#paint3_linear_640_2213)"} fillOpacity={"0.24"} fillRule={"evenodd"} style={{} as React.CSSProperties}></path>
              <path clipRule={"evenodd"} d={"M6.73584 6.40381L5.17518 4.84315L6.73584 6.40381Z"} fill={"url(#paint4_linear_640_2213)"} fillOpacity={"0.24"} fillRule={"evenodd"} style={{} as React.CSSProperties}></path>
              <path d={"M10.2946 10.287L14.6318 21.2441C14.7104 21.4428 14.9859 21.4576 15.0855 21.2685L17.2959 17.0687C17.3194 17.0239 17.356 16.9874 17.4007 16.9639L21.6005 14.7534C21.7896 14.6539 21.7748 14.3784 21.5761 14.2997L10.6191 9.96258C10.4155 9.882 10.214 10.0835 10.2946 10.287Z"} fill={"url(#paint5_linear_640_2213)"} fillOpacity={"0.24"} style={{} as React.CSSProperties}></path>
              <path d={"M11.332 2.5V4.5M17.4889 4.84326L15.9282 6.40392M6.73584 15.5962L5.17518 17.1569M4.83203 11H2.83203M6.73584 6.40381L5.17518 4.84315M14.6318 21.2441L10.2946 10.287C10.214 10.0835 10.4155 9.882 10.6191 9.96258L21.5761 14.2997C21.7748 14.3784 21.7896 14.6539 21.6005 14.7534L17.4007 16.9639C17.356 16.9874 17.3194 17.0239 17.2959 17.0687L15.0855 21.2685C14.9859 21.4576 14.7104 21.4428 14.6318 21.2441Z"} stroke={"white"} strokeLinecap={"round"} strokeLinejoin={"round"} strokeWidth={"1.04545"} style={{"stroke": "white", "strokeOpacity": "1"} as React.CSSProperties}></path>
              <defs>
                <linearGradient gradientUnits={"userSpaceOnUse"} id={"paint0_linear_640_2213"} x1={"12.2831"} x2={"12.2831"} y1={"2.5"} y2={"21.4021"}>
                  <stop stopColor={"#2B2258"} stopOpacity={"0"} style={{"stopColor": "none", "stopOpacity": "0"} as React.CSSProperties}></stop>
                  <stop offset={"1"} stopColor={"white"} style={{"stopColor": "white", "stopOpacity": "1"} as React.CSSProperties}></stop>
                </linearGradient>
                <linearGradient gradientUnits={"userSpaceOnUse"} id={"paint1_linear_640_2213"} x1={"12.2831"} x2={"12.2831"} y1={"2.5"} y2={"21.4021"}>
                  <stop stopColor={"#2B2258"} stopOpacity={"0"} style={{"stopColor": "none", "stopOpacity": "0"} as React.CSSProperties}></stop>
                  <stop offset={"1"} stopColor={"white"} style={{"stopColor": "white", "stopOpacity": "1"} as React.CSSProperties}></stop>
                </linearGradient>
                <linearGradient gradientUnits={"userSpaceOnUse"} id={"paint2_linear_640_2213"} x1={"12.2831"} x2={"12.2831"} y1={"2.5"} y2={"21.4021"}>
                  <stop stopColor={"#2B2258"} stopOpacity={"0"} style={{"stopColor": "none", "stopOpacity": "0"} as React.CSSProperties}></stop>
                  <stop offset={"1"} stopColor={"white"} style={{"stopColor": "white", "stopOpacity": "1"} as React.CSSProperties}></stop>
                </linearGradient>
                <linearGradient gradientUnits={"userSpaceOnUse"} id={"paint3_linear_640_2213"} x1={"12.2831"} x2={"12.2831"} y1={"2.5"} y2={"21.4021"}>
                  <stop stopColor={"#2B2258"} stopOpacity={"0"} style={{"stopColor": "none", "stopOpacity": "0"} as React.CSSProperties}></stop>
                  <stop offset={"1"} stopColor={"white"} style={{"stopColor": "white", "stopOpacity": "1"} as React.CSSProperties}></stop>
                </linearGradient>
                <linearGradient gradientUnits={"userSpaceOnUse"} id={"paint4_linear_640_2213"} x1={"12.2831"} x2={"12.2831"} y1={"2.5"} y2={"21.4021"}>
                  <stop stopColor={"#2B2258"} stopOpacity={"0"} style={{"stopColor": "none", "stopOpacity": "0"} as React.CSSProperties}></stop>
                  <stop offset={"1"} stopColor={"white"} style={{"stopColor": "white", "stopOpacity": "1"} as React.CSSProperties}></stop>
                </linearGradient>
                <linearGradient gradientUnits={"userSpaceOnUse"} id={"paint5_linear_640_2213"} x1={"12.2831"} x2={"12.2831"} y1={"2.5"} y2={"21.4021"}>
                  <stop stopColor={"#2B2258"} stopOpacity={"0"} style={{"stopColor": "none", "stopOpacity": "0"} as React.CSSProperties}></stop>
                  <stop offset={"1"} stopColor={"white"} style={{"stopColor": "white", "stopOpacity": "1"} as React.CSSProperties}></stop>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className={"transition opacity-60 group-hover:opacity-90"} {...b("tabText", 2, "transition opacity-60 group-hover:opacity-90")}>
            <div className={"mb-4 text-label-normal text-body-dark-label sm-max:hidden"}>
              {"Gate the upgrade"}
            </div>
            <div className={"text-body-dark-muted text-14/22 md-max:hidden"}>
              {"Workflows run on both sides, "}
              <br />
              {" regressions fail the build."}
            </div>
          </div>
        </button>
      </div>
      <div className={"p-12 mb-24 sm:hidden text-center relative"}>
        <div className={"inset-y-23 inset-x-16 absolute border-x border-white/8 pointer-events-none"}></div>
        <div className={"mb-4 text-label-normal text-body-dark-label"}>
          {k("capTitle", 0) ?? (<>
          {"Diagnose the endpoint"}
          </>)}
        </div>
        <div className={"text-body-dark-muted text-14/22"}>
          {k("capText", 0) ?? (<>
          {"DNS to runtime, layer by "}
          <br />
          {" layer, on mainnet and V3."}
          </>)}
        </div>
      </div>
      <div className={"hero-tabs-progress w-full h-1 relative bg-white/10 mb-32 max-w-[calc(100%-64px)] mx-auto"}>
        <div className={"overlay bg-white/90 hero-tabs-progress-bar w-0"} {...b("bar", 0, "overlay bg-white/90 hero-tabs-progress-bar w-0")}></div>
      </div>
      <div className={"relative h-620"}>
        <div className={"overlay"}>
          <img alt={""} src={"/assets/images/hero/app-frame-2.png"} width={"228"} aria-hidden={"true"} className={"h-auto absolute -left-232 sm:-left-239 bottom-568"} />
          <img alt={""} src={"/assets/images/hero/app-frame-1.png"} width={"228"} aria-hidden={"true"} className={"h-auto absolute -right-[231.5px] sm:-right-[238.5px] bottom-568"} />
          <div className={"h-574 sm:h-580 -inset-x-5 sm:-inset-x-12 -bottom-6 sm:-bottom-12 absolute rounded-b-28 sm:rounded-b-32 border-b border-x border-white/10"}></div>
        </div>
        <div data-active-app={"0"} className={"hero-app h-620 md-max:rounded-b-24 relative rounded-20 overflow-hidden before:inside-border before:z-[11] before:border-white/8"}>
          <video className={"hero-video overlay w-full h-full object-cover"} autoPlay loop playsInline preload={"auto"} poster={"/assets/media/canary-hero-poster.jpg"} aria-label={"Portal Canary: doctor, compare and test against live Portaldot nodes"} {...b("video", 0, "hero-video overlay w-full h-full object-cover")}>
            <source src={"/assets/media/canary-hero.webm"} type={"video/webm"} />
            <source src={"/assets/media/canary-hero.mp4"} type={"video/mp4"} />
          </video>
        </div>
      </div>
    </div>
  );
}
