// Server markup of the original static landing for this component, captured before the React port.
// tests/landing.test.tsx asserts the React component still renders exactly this.
export default function SmokeChecks() {
  return (
    <div className={"p-2 absolute top-0 left-0 w-full"}>
      <div className={"overlay"}></div>
      <div className={"h-260 top-0 left-0 bg-body-light-bg-ghost rounded-16 w-full absolute"}>
        <div className={"flex gap-20 items-center bottom-0 left-0 p-24 absolute"}>
          <div style={{"boxShadow": "0px 12px 24px -3px rgba(0, 0, 0, 0.05), 0px 6px 6px -3px rgba(0, 0, 0, 0.03), 0px 3px 3px -1.5px rgba(0, 0, 0, 0.02), 0px 1px 1px -0.5px rgba(0, 0, 0, 0.03)"} as React.CSSProperties} className={"bg-white w-48 h-48 flex-center rounded-12"}>
            <div style={{"width": "24px", "height": "24px"} as React.CSSProperties} className={"relative transition-all rounded-full"}>
              <svg viewBox={"0 0 24 24"} height={"24"} width={"24"} className={"transition-all"}>
                <circle r={"10.5"} cx={"12"} cy={"12"} fill={"none"} strokeWidth={"3"} className={"stroke-body-stroke-lighter"}></circle>
              </svg>
              <svg viewBox={"0 0 24 24"} height={"24"} width={"24"} className={"features-smoke-checks-overall-progress overlay transition-all delay-[200ms]"}>
                <circle r={"10.5"} style={{"strokeDasharray": "65.97344572538566px", "strokeDashoffset": "65.97344572538566px"} as React.CSSProperties} cx={"12"} cy={"12"} fill={"transparent"} strokeLinecap={"round"} strokeLinejoin={"round"} strokeWidth={"3px"} transform={"rotate(-90 12 12)"} className={"stroke-body-light-loud transition-all"}></circle>
              </svg>
              <div className={"overlay transition-all delay-[200ms] easing-[cubic-bezier(0.87,-0.41,0.19,1.44)] scale-[0.5] opacity-0"}>
                <img alt={"Check"} decoding={"async"} height={"28"} loading={"lazy"} src={"/assets/images/features/smoke/overall-check.png"} style={{} as React.CSSProperties} width={"28"} className={"lazy-image opacity-0 center"} />
              </div>
            </div>
          </div>
          <div>
            <div className={"text-label-large md-max:text-[14px] text-body-light-loud relative h-20 md:h-26"}>
              <span className={"transition-all features-smoke-checks-checking absolute top-0 left-0"}>
                {"Checking"}
                {"..."}
              </span>
            </div>
            <div className={"text-body-normal md-max:text-[12px] text-body-light-muted"}>
              {"0 out of 3 checks have passed"}
            </div>
          </div>
        </div>
      </div>
      <div style={{"boxShadow": "0px 12px 24px -3px rgba(0, 0, 0, 0.08), 0px 6px 6px -3px rgba(0, 0, 0, 0.04), 0px 3px 3px -1.5px rgba(0, 0, 0, 0.04), 0px 1px 1px -0.5px rgba(0, 0, 0, 0.03)"} as React.CSSProperties} className={"p-24 rounded-14 bg-white/80 backdrop-blur-6 grid gap-24"}>
        <div className={"flex gap-16 items-center text-body-normal w-full"}>
          <div style={{"width": "18px", "height": "18px"} as React.CSSProperties} className={"relative transition-all rounded-full bg-body-light-bg-ghost"}>
            <svg viewBox={"0 0 18 18"} height={"18"} width={"18"} className={"transition-all opacity-0"}>
              <circle r={"8"} cx={"9"} cy={"9"} fill={"none"} strokeWidth={"2"} className={"stroke-body-stroke-lighter"}></circle>
            </svg>
            <svg viewBox={"0 0 18 18"} height={"18"} width={"18"} className={"features-smoke-check-pie-progress overlay transition-all delay-[200ms]"}>
              <circle r={"8"} style={{"strokeDasharray": "50.26548245743669px", "strokeDashoffset": "50.26548245743669px"} as React.CSSProperties} cx={"9"} cy={"9"} fill={"transparent"} strokeLinecap={"round"} strokeLinejoin={"round"} strokeWidth={"2px"} transform={"rotate(-90 9 9)"} className={"stroke-body-light-loud transition-all"}></circle>
            </svg>
            <div className={"overlay transition-all delay-[200ms] easing-[cubic-bezier(0.87,-0.41,0.19,1.44)] scale-[0.5] opacity-0"}>
              <img alt={"Check"} decoding={"async"} height={"1"} loading={"lazy"} src={"/assets/images/features/smoke/check.png"} style={{} as React.CSSProperties} width={"1"} className={"lazy-image opacity-0 w-full h-full"} />
            </div>
          </div>
          <div className={"relative h-22 flex-1"}>
            <span style={{} as React.CSSProperties} className={"text-body-normal md-max:text-[12px] text-body-light-ghost opacity-50 transition-all absolute top-0 left-0"}>
              {"Waiting to dispatch workflows..."}
            </span>
          </div>
        </div>
        <div className={"flex gap-16 items-center text-body-normal w-full"}>
          <div style={{"width": "18px", "height": "18px"} as React.CSSProperties} className={"relative transition-all rounded-full bg-body-light-bg-ghost"}>
            <svg viewBox={"0 0 18 18"} height={"18"} width={"18"} className={"transition-all opacity-0"}>
              <circle r={"8"} cx={"9"} cy={"9"} fill={"none"} strokeWidth={"2"} className={"stroke-body-stroke-lighter"}></circle>
            </svg>
            <svg viewBox={"0 0 18 18"} height={"18"} width={"18"} className={"features-smoke-check-pie-progress overlay transition-all delay-[200ms]"}>
              <circle r={"8"} style={{"strokeDasharray": "50.26548245743669px", "strokeDashoffset": "50.26548245743669px"} as React.CSSProperties} cx={"9"} cy={"9"} fill={"transparent"} strokeLinecap={"round"} strokeLinejoin={"round"} strokeWidth={"2px"} transform={"rotate(-90 9 9)"} className={"stroke-body-light-loud transition-all"}></circle>
            </svg>
            <div className={"overlay transition-all delay-[200ms] easing-[cubic-bezier(0.87,-0.41,0.19,1.44)] scale-[0.5] opacity-0"}>
              <img alt={"Check"} decoding={"async"} height={"1"} loading={"lazy"} src={"/assets/images/features/smoke/check.png"} style={{} as React.CSSProperties} width={"1"} className={"lazy-image opacity-0 w-full h-full"} />
            </div>
          </div>
          <div className={"relative h-22 flex-1"}>
            <span style={{} as React.CSSProperties} className={"text-body-normal md-max:text-[12px] text-body-light-ghost opacity-50 transition-all absolute top-0 left-0"}>
              {"Waiting for the setCode upgrade..."}
            </span>
          </div>
        </div>
        <div className={"flex gap-16 items-center text-body-normal w-full"}>
          <div style={{"width": "18px", "height": "18px"} as React.CSSProperties} className={"relative transition-all rounded-full bg-body-light-bg-ghost"}>
            <svg viewBox={"0 0 18 18"} height={"18"} width={"18"} className={"transition-all opacity-0"}>
              <circle r={"8"} cx={"9"} cy={"9"} fill={"none"} strokeWidth={"2"} className={"stroke-body-stroke-lighter"}></circle>
            </svg>
            <svg viewBox={"0 0 18 18"} height={"18"} width={"18"} className={"features-smoke-check-pie-progress overlay transition-all delay-[200ms]"}>
              <circle r={"8"} style={{"strokeDasharray": "50.26548245743669px", "strokeDashoffset": "50.26548245743669px"} as React.CSSProperties} cx={"9"} cy={"9"} fill={"transparent"} strokeLinecap={"round"} strokeLinejoin={"round"} strokeWidth={"2px"} transform={"rotate(-90 9 9)"} className={"stroke-body-light-loud transition-all"}></circle>
            </svg>
            <div className={"overlay transition-all delay-[200ms] easing-[cubic-bezier(0.87,-0.41,0.19,1.44)] scale-[0.5] opacity-0"}>
              <img alt={"Check"} decoding={"async"} height={"1"} loading={"lazy"} src={"/assets/images/features/smoke/check.png"} style={{} as React.CSSProperties} width={"1"} className={"lazy-image opacity-0 w-full h-full"} />
            </div>
          </div>
          <div className={"relative h-22 flex-1"}>
            <span style={{} as React.CSSProperties} className={"text-body-normal md-max:text-[12px] text-body-light-ghost opacity-50 transition-all absolute top-0 left-0"}>
              {"Waiting to read pinned state..."}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
