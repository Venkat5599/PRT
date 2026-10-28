// Generated from the landing markup by landing-port/gen.py (views.json). Do not edit by hand.
import type { Bind, Kids } from "@/components/landing/bind";

export default function FeatureDashboardView({ b, k }: { b: Bind; k: Kids }) {
  return (
    <div className={"features-dashboard bg-body-light-bg-ghost p-12 rounded-32 mx-auto max-w-[1152px] md:aspect-[1152/824] h-auto"}>
      <div className={"h-full w-full overflow-hidden flex flex-col bg-white rounded-20 features-dashboard-inner relative"}>
        <div className={"flex items-center gap-64 md:gap-0 rounded-t-20 border-b border-black/5 px-15 py-10 absolute top-0 left-0 w-full h-48 bg-white/80 backdrop-blur-4 z-10"}>
          <div className={"flex gap-10 mr-16"}>
            <div className={"w-10 h-10 rounded-full bg-black/12"}></div>
            <div className={"w-10 h-10 rounded-full bg-black/12"}></div>
            <div className={"w-10 h-10 rounded-full bg-black/12"}></div>
          </div>
          <div className={"md:hidden flex-center gap-8 text-12/20 tracking-[-0.06] text-black/72"}>
            <img alt={""} decoding={"async"} height={"24"} loading={"lazy"} src={"/assets/images/features/dashboard/sidebar/logo.png"} style={{} as React.CSSProperties} width={"24"} className={"lazy-image opacity-0"} />
            {"Portal Canary"}
          </div>
          <div className={"center-x px-8 hidden py-4 bg-black/4 rounded-6 w-max md:flex gap-8 items-center"}>
            <svg fill={"none"} height={"16"} viewBox={"0 0 16 16"} width={"16"} xmlns={"http://www.w3.org/2000/svg"}>
              <path d={"M10.8332 6.5V4.83333C10.8332 3.26853 9.56464 2 7.99984 2C6.43503 2 5.1665 3.26853 5.1665 4.83333V6.5M7.99984 9.33333V11.3333M3.83317 14.1667H12.1665C12.5347 14.1667 12.8332 13.8682 12.8332 13.5V7.16667C12.8332 6.79848 12.5347 6.5 12.1665 6.5H3.83317C3.46498 6.5 3.1665 6.79848 3.1665 7.16667V13.5C3.1665 13.8682 3.46498 14.1667 3.83317 14.1667Z"} stroke={"#A4A4A4"} strokeLinecap={"round"} strokeLinejoin={"round"} strokeWidth={"1.5"} style={{"stroke": "color(display-p3 0.6444 0.6444 0.6444)", "strokeOpacity": "1"} as React.CSSProperties}></path>
            </svg>
            <span className={"text-12/20 font-500 md:flex hidden text-black/72 truncate max-w-250"}>
              {"/reports/upgrade-ed100x/report.html"}
            </span>
          </div>
        </div>
        <div className={"md:flex flex-1 min-h-0 relative"}>
          <div className={"flex flex-col pt-64 p-16 md:w-240 w-full gap-12"}>
            <div className={"md:flex gap-4 items-center hidden"}>
              <svg fill={"none"} height={"20"} viewBox={"0 0 20 20"} width={"20"} xmlns={"http://www.w3.org/2000/svg"}>
                <path d={"M11.6666 6.66675L8.62792 9.70545C8.4652 9.86817 8.4652 10.132 8.62792 10.2947L11.6666 13.3334"} stroke={"#A4A4A4"} strokeLinecap={"round"} strokeLinejoin={"round"} strokeWidth={"1.5"} style={{"stroke": "color(display-p3 0.6444 0.6444 0.6444)", "strokeOpacity": "1"} as React.CSSProperties}></path>
              </svg>
              <div className={"text-body-light-loud text-12/18"}>
                {"Back"}
              </div>
            </div>
            <div className={"flex flex-col gap-12 p-9 pt-11 border border-black/6 rounded-14"}>
              <div className={"text-body-light-loud text-12/18 text-center"}>
                {"Review a candidate runtime against its baseline."}
              </div>
              <div className={"flex gap-6 p-5 justify-between border border-black/6 rounded-6"}>
                <div className={"flex items-center gap-6"}>
                  <img alt={""} decoding={"async"} height={"18"} loading={"lazy"} src={"/assets/images/features/dashboard/sidebar/logo.png"} style={{} as React.CSSProperties} width={"18"} className={"lazy-image opacity-0"} />
                  <div className={"text-body-light-loud text-12/18"}>
                    {"Compare spec 1003"}
                  </div>
                </div>
                <svg fill={"none"} height={"20"} viewBox={"0 0 20 20"} width={"20"} xmlns={"http://www.w3.org/2000/svg"}>
                  <path d={"M6.66663 8.33337L9.70533 11.3721C9.86805 11.5348 10.1319 11.5348 10.2946 11.3721L13.3333 8.33337"} stroke={"#A4A4A4"} strokeLinecap={"round"} strokeLinejoin={"round"} strokeWidth={"1.5"} style={{"stroke": "color(display-p3 0.6444 0.6444 0.6444)", "strokeOpacity": "1"} as React.CSSProperties}></path>
                </svg>
              </div>
            </div>
            <div className={"w-184 h-1 bg-black/6 mx-auto hidden"}></div>
            <div className={"relative"}>
              <div className={"h-full pointer-events-none bg-white w-50 gradient-mask-r-0 absolute top-0 left-0 opacity-0 features-dashboard-sidebar-items-fade md:hidden"} {...b("fade", 0, "h-full pointer-events-none bg-white w-50 gradient-mask-r-0 absolute top-0 left-0 opacity-0 features-dashboard-sidebar-items-fade md:hidden")}></div>
              <div className={"h-full pointer-events-none bg-white w-50 gradient-mask-l-0 absolute top-0 right-0 features-dashboard-sidebar-items-fade md:hidden"} {...b("fade", 1, "h-full pointer-events-none bg-white w-50 gradient-mask-l-0 absolute top-0 right-0 features-dashboard-sidebar-items-fade md:hidden")}></div>
              <div className={"flex md:flex-col flex-row gap-6 md:gap-2 whitespace-nowrap overflow-auto"} {...b("side", 0, "flex md:flex-col flex-row gap-6 md:gap-2 whitespace-nowrap overflow-auto")}>
                <button aria-label={"Endpoint doctor"} className={"flex items-center justify-between py-7 pl-10 pr-8 gap-6 rounded-6 text-body-small transition-all hover:bg-[#F7F7F7] hover:border-transparent md:border-none border-black/6 border"} {...b("navBtn", 0, "flex items-center justify-between py-7 pl-10 pr-8 gap-6 rounded-6 text-body-small transition-all hover:bg-[#F7F7F7] hover:border-transparent md:border-none border-black/6 border")}>
                  <div className={"text-body-light-loud"}>
                    {"Endpoint doctor"}
                  </div>
                  <svg fill={"none"} height={"16"} viewBox={"0 0 16 16"} width={"16"} xmlns={"http://www.w3.org/2000/svg"}>
                    <path clipRule={"evenodd"} d={"M8.00004 1.33337C4.31814 1.33337 1.33337 4.31814 1.33337 8.00004C1.33337 11.6819 4.31814 14.6667 8.00004 14.6667C11.6819 14.6667 14.6667 11.6819 14.6667 8.00004C14.6667 4.31814 11.6819 1.33337 8.00004 1.33337ZM10.516 6.75555C10.7492 6.47059 10.7072 6.05057 10.4222 5.81742C10.1372 5.58427 9.71722 5.62627 9.48407 5.91124L6.95055 9.00776L6.13811 8.19532C5.87776 7.93497 5.45565 7.93497 5.1953 8.19532C4.93495 8.45567 4.93495 8.87778 5.1953 9.13813L6.52864 10.4715C6.66182 10.6047 6.84513 10.6753 7.03325 10.6659C7.22137 10.6565 7.39674 10.568 7.51601 10.4222L10.516 6.75555Z"} fill={"#2DBA7F"} fillRule={"evenodd"} style={{"fill": "color(display-p3 0.1781 0.7305 0.4985)", "fillOpacity": "1"} as React.CSSProperties}></path>
                  </svg>
                </button>
                <button aria-label={"Workflow tests"} className={"flex items-center justify-between py-7 pl-10 pr-8 gap-6 rounded-6 text-body-small transition-all hover:bg-[#F7F7F7] hover:border-transparent md:border-none border-black/6 border"} {...b("navBtn", 1, "flex items-center justify-between py-7 pl-10 pr-8 gap-6 rounded-6 text-body-small transition-all hover:bg-[#F7F7F7] hover:border-transparent md:border-none border-black/6 border")}>
                  <div className={"text-body-light-loud"}>
                    {"Workflow tests"}
                  </div>
                  <svg fill={"none"} height={"16"} viewBox={"0 0 16 16"} width={"16"} xmlns={"http://www.w3.org/2000/svg"}>
                    <path clipRule={"evenodd"} d={"M8.00004 1.33337C4.31814 1.33337 1.33337 4.31814 1.33337 8.00004C1.33337 11.6819 4.31814 14.6667 8.00004 14.6667C11.6819 14.6667 14.6667 11.6819 14.6667 8.00004C14.6667 4.31814 11.6819 1.33337 8.00004 1.33337ZM10.516 6.75555C10.7492 6.47059 10.7072 6.05057 10.4222 5.81742C10.1372 5.58427 9.71722 5.62627 9.48407 5.91124L6.95055 9.00776L6.13811 8.19532C5.87776 7.93497 5.45565 7.93497 5.1953 8.19532C4.93495 8.45567 4.93495 8.87778 5.1953 9.13813L6.52864 10.4715C6.66182 10.6047 6.84513 10.6753 7.03325 10.6659C7.22137 10.6565 7.39674 10.568 7.51601 10.4222L10.516 6.75555Z"} fill={"#2DBA7F"} fillRule={"evenodd"} style={{"fill": "color(display-p3 0.1781 0.7305 0.4985)", "fillOpacity": "1"} as React.CSSProperties}></path>
                  </svg>
                </button>
                <button aria-label={"Runtime WASM"} className={"flex items-center justify-between py-7 pl-10 pr-8 gap-6 rounded-6 text-body-small transition-all hover:bg-[#F7F7F7] hover:border-transparent md:border-none border-black/6 border"} {...b("navBtn", 2, "flex items-center justify-between py-7 pl-10 pr-8 gap-6 rounded-6 text-body-small transition-all hover:bg-[#F7F7F7] hover:border-transparent md:border-none border-black/6 border")}>
                  <div className={"text-body-light-loud"}>
                    {"Runtime WASM"}
                  </div>
                  <svg fill={"none"} height={"16"} viewBox={"0 0 16 16"} width={"16"} xmlns={"http://www.w3.org/2000/svg"}>
                    <path clipRule={"evenodd"} d={"M8.00004 1.33337C4.31814 1.33337 1.33337 4.31814 1.33337 8.00004C1.33337 11.6819 4.31814 14.6667 8.00004 14.6667C11.6819 14.6667 14.6667 11.6819 14.6667 8.00004C14.6667 4.31814 11.6819 1.33337 8.00004 1.33337ZM10.516 6.75555C10.7492 6.47059 10.7072 6.05057 10.4222 5.81742C10.1372 5.58427 9.71722 5.62627 9.48407 5.91124L6.95055 9.00776L6.13811 8.19532C5.87776 7.93497 5.45565 7.93497 5.1953 8.19532C4.93495 8.45567 4.93495 8.87778 5.1953 9.13813L6.52864 10.4715C6.66182 10.6047 6.84513 10.6753 7.03325 10.6659C7.22137 10.6565 7.39674 10.568 7.51601 10.4222L10.516 6.75555Z"} fill={"#2DBA7F"} fillRule={"evenodd"} style={{"fill": "color(display-p3 0.1781 0.7305 0.4985)", "fillOpacity": "1"} as React.CSSProperties}></path>
                  </svg>
                </button>
                <button aria-label={"Metadata diff"} className={"flex items-center justify-between py-7 pl-10 pr-8 gap-6 rounded-6 text-body-small transition-all hover:bg-[#F7F7F7] hover:border-transparent md:border-none border-black/6 border"} {...b("navBtn", 3, "flex items-center justify-between py-7 pl-10 pr-8 gap-6 rounded-6 text-body-small transition-all hover:bg-[#F7F7F7] hover:border-transparent md:border-none border-black/6 border")}>
                  <div className={"text-body-light-loud"}>
                    {"Metadata diff"}
                  </div>
                  <svg fill={"none"} height={"16"} viewBox={"0 0 16 16"} width={"16"} xmlns={"http://www.w3.org/2000/svg"}>
                    <path clipRule={"evenodd"} d={"M8.00004 1.33337C4.31814 1.33337 1.33337 4.31814 1.33337 8.00004C1.33337 11.6819 4.31814 14.6667 8.00004 14.6667C11.6819 14.6667 14.6667 11.6819 14.6667 8.00004C14.6667 4.31814 11.6819 1.33337 8.00004 1.33337ZM10.516 6.75555C10.7492 6.47059 10.7072 6.05057 10.4222 5.81742C10.1372 5.58427 9.71722 5.62627 9.48407 5.91124L6.95055 9.00776L6.13811 8.19532C5.87776 7.93497 5.45565 7.93497 5.1953 8.19532C4.93495 8.45567 4.93495 8.87778 5.1953 9.13813L6.52864 10.4715C6.66182 10.6047 6.84513 10.6753 7.03325 10.6659C7.22137 10.6565 7.39674 10.568 7.51601 10.4222L10.516 6.75555Z"} fill={"#2DBA7F"} fillRule={"evenodd"} style={{"fill": "color(display-p3 0.1781 0.7305 0.4985)", "fillOpacity": "1"} as React.CSSProperties}></path>
                  </svg>
                </button>
                <button aria-label={"Upgrade log"} className={"flex items-center justify-between py-7 pl-10 pr-8 gap-6 rounded-6 text-body-small transition-all hover:bg-[#F7F7F7] hover:border-transparent md:border-none border-black/6 border"} {...b("navBtn", 4, "flex items-center justify-between py-7 pl-10 pr-8 gap-6 rounded-6 text-body-small transition-all hover:bg-[#F7F7F7] hover:border-transparent md:border-none border-black/6 border")}>
                  <div className={"text-body-light-loud"}>
                    {"Upgrade log"}
                  </div>
                  <svg fill={"none"} height={"16"} viewBox={"0 0 16 16"} width={"16"} xmlns={"http://www.w3.org/2000/svg"}>
                    <path clipRule={"evenodd"} d={"M8.00004 1.33337C4.31814 1.33337 1.33337 4.31814 1.33337 8.00004C1.33337 11.6819 4.31814 14.6667 8.00004 14.6667C11.6819 14.6667 14.6667 11.6819 14.6667 8.00004C14.6667 4.31814 11.6819 1.33337 8.00004 1.33337ZM10.516 6.75555C10.7492 6.47059 10.7072 6.05057 10.4222 5.81742C10.1372 5.58427 9.71722 5.62627 9.48407 5.91124L6.95055 9.00776L6.13811 8.19532C5.87776 7.93497 5.45565 7.93497 5.1953 8.19532C4.93495 8.45567 4.93495 8.87778 5.1953 9.13813L6.52864 10.4715C6.66182 10.6047 6.84513 10.6753 7.03325 10.6659C7.22137 10.6565 7.39674 10.568 7.51601 10.4222L10.516 6.75555Z"} fill={"#2DBA7F"} fillRule={"evenodd"} style={{"fill": "color(display-p3 0.1781 0.7305 0.4985)", "fillOpacity": "1"} as React.CSSProperties}></path>
                  </svg>
                </button>
              </div>
            </div>
            <div className={"py-7 px-10 rounded-6 flex-center features-dashboard-sidebar-box"}>
              <div className={"text-12/18 font-500 tracking-[-0.12px] features-dashboard-sidebar-box-text"}>
                {"Apply upgrade"}
              </div>
            </div>
            <div className={"w-302 bg-black/6 h-1 mx-auto md:hidden"}></div>
          </div>
          <div className={"flex-1 relative min-w-0"}>
            <div className={"h-full overflow-y-auto relative px-18 md:pt-67 pb-24 md:border-l border-black/5"} {...b("scroller", 0, "h-full overflow-y-auto relative px-18 md:pt-67 pb-24 md:border-l border-black/5")}>
              <div className={"features-dashboard-content"}>
                <div id={"basic-validation"} className={"features-dashboard-content-validation"}>
                  <div className={"flex justify-between"}>
                    <div className={"flex items-center gap-6 text-14/22 font-500 tracking-[-0.14px] text-body-light-loud"}>
                      <img alt={""} decoding={"async"} height={"20"} loading={"lazy"} src={"/assets/images/features/dashboard/validation/check.png"} style={{} as React.CSSProperties} width={"20"} className={"lazy-image opacity-0"} />
                      {"Endpoint doctor"}
                      <svg fill={"none"} height={"16"} viewBox={"0 0 16 16"} width={"16"} xmlns={"http://www.w3.org/2000/svg"}>
                        <path clipRule={"evenodd"} d={"M8.00004 1.33325C4.31814 1.33325 1.33337 4.31802 1.33337 7.99992C1.33337 11.6818 4.31814 14.6666 8.00004 14.6666C11.6819 14.6666 14.6667 11.6818 14.6667 7.99992C14.6667 4.31802 11.6819 1.33325 8.00004 1.33325ZM8.00005 5.99992C7.7485 5.99992 7.52846 6.13898 7.41436 6.3476C7.23768 6.67062 6.83258 6.78926 6.50956 6.61258C6.18653 6.43589 6.06789 6.0308 6.24457 5.70777C6.58313 5.08879 7.2418 4.66659 8.00005 4.66659C9.00988 4.66659 9.7113 5.33754 9.91101 6.12592C10.1118 6.91849 9.80676 7.84192 8.89447 8.29806C8.75489 8.36785 8.66671 8.51052 8.66671 8.66659C8.66671 9.03477 8.36824 9.33325 8.00005 9.33325C7.63186 9.33325 7.33338 9.03477 7.33338 8.66659C7.33338 8.00549 7.70689 7.40114 8.29819 7.10549C8.60135 6.95391 8.67922 6.69308 8.61849 6.45332C8.5567 6.20937 8.35226 5.99992 8.00005 5.99992ZM8.00004 11.3333C8.36823 11.3333 8.66671 11.0348 8.66671 10.6666C8.66671 10.2984 8.36823 9.99992 8.00004 9.99992C7.63185 9.99992 7.33337 10.2984 7.33337 10.6666C7.33337 11.0348 7.63185 11.3333 8.00004 11.3333Z"} fill={"#B8B8B8"} fillRule={"evenodd"} style={{"fill": "color(display-p3 0.7200 0.7200 0.7200)", "fillOpacity": "1"} as React.CSSProperties}></path>
                      </svg>
                    </div>
                    <svg fill={"none"} height={"20"} viewBox={"0 0 20 20"} width={"20"} xmlns={"http://www.w3.org/2000/svg"}>
                      <path d={"M13.3333 11.6667L10.2945 8.62804C10.1318 8.46532 9.86801 8.46532 9.70529 8.62804L6.66659 11.6667"} stroke={"#A4A4A4"} strokeLinecap={"round"} strokeLinejoin={"round"} strokeWidth={"1.5"} style={{"stroke": "color(display-p3 0.6444 0.6444 0.6444)", "strokeOpacity": "1"} as React.CSSProperties}></path>
                    </svg>
                  </div>
                  <div className={"mt-24 flex border-1 border-black/5 items-center gap-16 rounded-14 py-20 px-24"}>
                    <img alt={""} decoding={"async"} height={"28"} loading={"lazy"} src={"/assets/images/features/dashboard/validation/logo.png"} style={{} as React.CSSProperties} width={"28"} className={"lazy-image opacity-0 features-dashboard-content-validation-logo rounded-8"} />
                    <div className={"text-14/22 font-500 tracking-[-0.14px]"}>
                      {"Portaldot"}
                    </div>
                  </div>
                  <div className={"gap-y-26 gap-x-24 md:gap-80 py-20 px-24 flex flex-wrap border-1 border-black/5 rounded-14 my-8"}>
                    <div>
                      <div className={"text-14 text-body-light-ghost mb-4"}>
                        {"Spec version"}
                      </div>
                      <div className={"text-body-light-loud text-16/24 font-500 features-dashbord-content-validation-label"}>
                        {"1004"}
                      </div>
                    </div>
                    <div>
                      <div className={"mb-4 text-14 text-body-light-ghost"}>
                        {"Metadata"}
                      </div>
                      <div className={"text-body-light-loud text-16/24 font-500 features-dashbord-content-validation-label"}>
                        {"V13"}
                      </div>
                    </div>
                    <div>
                      <div className={"mb-4 text-14 text-body-light-ghost"}>
                        {"WASM sha256 "}
                      </div>
                      <div className={"flex items-center gap-6"}>
                        <div className={"text-16/24 font-500 features-dashbord-content-validation-label-active"}>
                          {"b34a069"}
                        </div>
                        <svg fill={"none"} height={"16"} viewBox={"0 0 16 16"} width={"16"} xmlns={"http://www.w3.org/2000/svg"}>
                          <path d={"M6.66671 3.33337C6.66671 2.96518 6.96518 2.66671 7.33337 2.66671C7.70156 2.66671 8.00004 2.36823 8.00004 2.00004C8.00004 1.63185 7.70156 1.33337 7.33337 1.33337C6.2288 1.33337 5.33337 2.2288 5.33337 3.33337C5.33337 3.70156 5.63185 4.00004 6.00004 4.00004C6.36823 4.00004 6.66671 3.70156 6.66671 3.33337Z"} fill={"#B8B8B8"} style={{"fill": "color(display-p3 0.7200 0.7200 0.7200)", "fillOpacity": "1"} as React.CSSProperties}></path>
                          <path d={"M9.33337 1.33337C8.96518 1.33337 8.66671 1.63185 8.66671 2.00004C8.66671 2.36823 8.96518 2.66671 9.33337 2.66671H10.6667C11.0349 2.66671 11.3334 2.36823 11.3334 2.00004C11.3334 1.63185 11.0349 1.33337 10.6667 1.33337H9.33337Z"} fill={"#B8B8B8"} style={{"fill": "color(display-p3 0.7200 0.7200 0.7200)", "fillOpacity": "1"} as React.CSSProperties}></path>
                          <path d={"M12.6667 1.33337C12.2985 1.33337 12 1.63185 12 2.00004C12 2.36823 12.2985 2.66671 12.6667 2.66671C13.0349 2.66671 13.3334 2.96518 13.3334 3.33337C13.3334 3.70156 13.6319 4.00004 14 4.00004C14.3682 4.00004 14.6667 3.70156 14.6667 3.33337C14.6667 2.2288 13.7713 1.33337 12.6667 1.33337Z"} fill={"#B8B8B8"} style={{"fill": "color(display-p3 0.7200 0.7200 0.7200)", "fillOpacity": "1"} as React.CSSProperties}></path>
                          <path d={"M6.66671 5.33337C6.66671 4.96518 6.36823 4.66671 6.00004 4.66671C5.63185 4.66671 5.33337 4.96518 5.33337 5.33337H2.83337C2.00495 5.33337 1.33337 6.00495 1.33337 6.83337V13.1667C1.33337 13.9951 2.00495 14.6667 2.83337 14.6667H9.16671C9.99514 14.6667 10.6667 13.9951 10.6667 13.1667V10.6667C11.0349 10.6667 11.3334 10.3682 11.3334 10C11.3334 9.63185 11.0349 9.33337 10.6667 9.33337V6.83337C10.6667 6.00495 9.99513 5.33337 9.16671 5.33337H6.66671Z"} fill={"#B8B8B8"} style={{"fill": "color(display-p3 0.7200 0.7200 0.7200)", "fillOpacity": "1"} as React.CSSProperties}></path>
                          <path d={"M14.6667 5.33337C14.6667 4.96518 14.3682 4.66671 14 4.66671C13.6319 4.66671 13.3334 4.96518 13.3334 5.33337V6.66671C13.3334 7.0349 13.6319 7.33337 14 7.33337C14.3682 7.33337 14.6667 7.0349 14.6667 6.66671V5.33337Z"} fill={"#B8B8B8"} style={{"fill": "color(display-p3 0.7200 0.7200 0.7200)", "fillOpacity": "1"} as React.CSSProperties}></path>
                          <path d={"M14.6667 8.66671C14.6667 8.29852 14.3682 8.00004 14 8.00004C13.6319 8.00004 13.3334 8.29852 13.3334 8.66671C13.3334 9.0349 13.0349 9.33337 12.6667 9.33337C12.2985 9.33337 12 9.63185 12 10C12 10.3682 12.2985 10.6667 12.6667 10.6667C13.7713 10.6667 14.6667 9.77128 14.6667 8.66671Z"} fill={"#B8B8B8"} style={{"fill": "color(display-p3 0.7200 0.7200 0.7200)", "fillOpacity": "1"} as React.CSSProperties}></path>
                        </svg>
                      </div>
                    </div>
                    <div>
                      <div className={"mb-4 text-14 text-body-light-ghost"}>
                        {"Run date"}
                      </div>
                      <div className={"flex gap-4"}>
                        <div className={"text-body-light-loud text-16/24 font-500 features-dashbord-content-validation-label"}>
                          {"16.10.2026"}
                        </div>
                        <div className={"text-body-light-ghost"}>
                          {"\u00b7"}
                        </div>
                        <div className={"text-body-light-ghost"}>
                          {"07:43:35"}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className={"p-20 flex flex-col gap-16 border-1 border-black/5 rounded-14"}>
                    <div className={"flex items-center gap-12"}>
                      <img alt={""} decoding={"async"} height={"22"} loading={"lazy"} src={"/assets/images-original/features/dashboard/validation/check-2.png"} style={{} as React.CSSProperties} width={"22"} className={"lazy-image opacity-0"} />
                      <div className={"text-14/22 font-400 text-body-light-loud"}>
                        {"Runtime 1004 applied by setCode"}
                      </div>
                    </div>
                    <div className={"flex items-center gap-12"}>
                      <img alt={""} decoding={"async"} height={"22"} loading={"lazy"} src={"/assets/images-original/features/dashboard/validation/check-2.png"} style={{} as React.CSSProperties} width={"22"} className={"lazy-image opacity-0"} />
                      <div className={"text-14/22 font-400 text-body-light-loud"}>
                        {"Blocks kept coming under the new runtime"}
                      </div>
                    </div>
                    <div className={"flex items-center gap-12"}>
                      <img alt={""} decoding={"async"} height={"22"} loading={"lazy"} src={"/assets/images-original/features/dashboard/validation/check-2.png"} style={{} as React.CSSProperties} width={"22"} className={"lazy-image opacity-0"} />
                      <div className={"text-14/22 font-400 text-body-light-loud"}>
                        {"spec_version is greater than the baseline (1003)"}
                      </div>
                    </div>
                  </div>
                </div>
                <div className={"flex items-center py-64 px-40 gap-40 justify-center"}>
                  <div className={"h-1 bg-[#F1F1F1] flex-1 max-w-325"}></div>
                  <svg fill={"none"} height={"15"} viewBox={"0 0 14 15"} width={"14"} xmlns={"http://www.w3.org/2000/svg"}>
                    <path clipRule={"evenodd"} d={"M0.14 5.26 L5.81 5.26 L5.81 4.14 L0.14 4.14ZM5.495 5.456 L7.616 1.305 L6.615 0.794 L4.494 4.945ZM6.139 1.221 L8.911 8.571 L9.961 8.179 L7.189 0.829ZM9.527 8.592 L11.382 4.413 L10.353 3.958 L8.498 8.137ZM10.08 5.26 L13.86 5.26 L13.86 4.14 L10.08 4.14ZM0.14 11.56 L5.81 11.56 L5.81 10.44 L0.14 10.44ZM5.327 11.791 L7.651 8.963 L6.783 8.249 L4.459 11.077ZM6.076 8.949 L8.309 11.784 L9.184 11.091 L6.951 8.256ZM7.84 11.56 L13.86 11.56 L13.86 10.44 L7.84 10.44Z"} fill={"#EBEBEB"} fillRule={"evenodd"} style={{"fill": "color(display-p3 0.9200 0.9200 0.9200)", "fillOpacity": "1"} as React.CSSProperties}></path>
                  </svg>
                  <div className={"h-1 bg-[#F1F1F1] flex-1 max-w-325"}></div>
                </div>
                <div className={"hidden md:contents"}>
                  <div id={"smoke-testing"}>
                    <div className={"flex justify-between"}>
                      <div className={"flex items-center gap-6 text-14/22 font-500 tracking-[-0.14px] text-body-light-loud"}>
                        <img alt={""} decoding={"async"} height={"20"} loading={"lazy"} src={"/assets/images/features/dashboard/smoke/check.png"} style={{} as React.CSSProperties} width={"20"} className={"lazy-image opacity-0"} />
                        {"Workflow tests"}
                        <svg fill={"none"} height={"16"} viewBox={"0 0 16 16"} width={"16"} xmlns={"http://www.w3.org/2000/svg"}>
                          <path clipRule={"evenodd"} d={"M8.00004 1.33325C4.31814 1.33325 1.33337 4.31802 1.33337 7.99992C1.33337 11.6818 4.31814 14.6666 8.00004 14.6666C11.6819 14.6666 14.6667 11.6818 14.6667 7.99992C14.6667 4.31802 11.6819 1.33325 8.00004 1.33325ZM8.00005 5.99992C7.7485 5.99992 7.52846 6.13898 7.41436 6.3476C7.23768 6.67062 6.83258 6.78926 6.50956 6.61258C6.18653 6.43589 6.06789 6.0308 6.24457 5.70777C6.58313 5.08879 7.2418 4.66659 8.00005 4.66659C9.00988 4.66659 9.7113 5.33754 9.91101 6.12592C10.1118 6.91849 9.80676 7.84192 8.89447 8.29806C8.75489 8.36785 8.66671 8.51052 8.66671 8.66659C8.66671 9.03477 8.36824 9.33325 8.00005 9.33325C7.63186 9.33325 7.33338 9.03477 7.33338 8.66659C7.33338 8.00549 7.70689 7.40114 8.29819 7.10549C8.60135 6.95391 8.67922 6.69308 8.61849 6.45332C8.5567 6.20937 8.35226 5.99992 8.00005 5.99992ZM8.00004 11.3333C8.36823 11.3333 8.66671 11.0348 8.66671 10.6666C8.66671 10.2984 8.36823 9.99992 8.00004 9.99992C7.63185 9.99992 7.33337 10.2984 7.33337 10.6666C7.33337 11.0348 7.63185 11.3333 8.00004 11.3333Z"} fill={"#B8B8B8"} fillRule={"evenodd"} style={{"fill": "color(display-p3 0.7200 0.7200 0.7200)", "fillOpacity": "1"} as React.CSSProperties}></path>
                        </svg>
                      </div>
                      <svg fill={"none"} height={"20"} viewBox={"0 0 20 20"} width={"20"} xmlns={"http://www.w3.org/2000/svg"}>
                        <path d={"M13.3333 11.6667L10.2945 8.62804C10.1318 8.46532 9.86801 8.46532 9.70529 8.62804L6.66659 11.6667"} stroke={"#A4A4A4"} strokeLinecap={"round"} strokeLinejoin={"round"} strokeWidth={"1.5"} style={{"stroke": "color(display-p3 0.6444 0.6444 0.6444)", "strokeOpacity": "1"} as React.CSSProperties}></path>
                      </svg>
                    </div>
                    <div className={"flex justify-between mt-24"}>
                      <div className={"flex p-2 rounded-10 bg-black/4"}>
                        <div className={"flex py-4 px-12 items-center justify-center gap-4 w-180 rounded-8 features-dashbord-content-smoke-tab-active"}>
                          <svg fill={"none"} height={"20"} viewBox={"0 0 20 20"} width={"20"} xmlns={"http://www.w3.org/2000/svg"}>
                            <path d={"M9.703 4.149 14.268 6.716 v5.136 L9.703 14.42 5.137 11.852 v-5.136 L9.703 4.149Zm0 1.312 L6.279 7.401 v3.766 l3.424 1.94 3.424 -1.94 V7.401 l-3.424 -1.94ZM7.762 7.515 h3.88 v0.913 H7.762 V7.515Zm0 1.655 h3.88 v0.913 H7.762 V9.17Zm0 1.655 h3.88 v0.913 H7.762 v-0.913Z"} fill={"black"} style={{"fill": "black", "fillOpacity": "1"} as React.CSSProperties}></path>
                          </svg>
                          <div className={"text-14/22 font-500 tracking-[-0.14px] text-body-light-loud"}>
                            {"V3"}
                          </div>
                          <img alt={""} decoding={"async"} height={"20"} loading={"lazy"} src={"/assets/images-original/features/dashboard/smoke/check-2.png"} style={{} as React.CSSProperties} width={"20"} className={"lazy-image opacity-0"} />
                        </div>
                        <div className={"flex py-4 px-12 items-center justify-center gap-4 w-180 rounded-8"}>
                          <svg fill={"none"} height={"20"} viewBox={"0 0 21 20"} width={"21"} xmlns={"http://www.w3.org/2000/svg"}>
                            <path d={"M6.023 5.201 h8.96 a0.64 0.64 0 0 1 0.64 0.64 v2.24 a0.64 0.64 0 0 1 -0.64 0.64 H6.023 a0.64 0.64 0 0 1 -0.64 -0.64 V5.841 a0.64 0.64 0 0 1 0.64 -0.64Zm0 4.48 h8.96 a0.64 0.64 0 0 1 0.64 0.64 V12.561 a0.64 0.64 0 0 1 -0.64 0.64 H6.023 a0.64 0.64 0 0 1 -0.64 -0.64 v-2.24 a0.64 0.64 0 0 1 0.64 -0.64ZM7.303 6.417 a0.576 0.576 0 1 0 0 1.152 0.576 0.576 0 0 0 0 -1.152Zm0 4.48 a0.576 0.576 0 1 0 0 1.152 0.576 0.576 0 0 0 0 -1.152ZM5.383 14.161 h10.24 V15.121 H5.383 v-0.96Z"} fill={"#656565"} style={{"fill": "color(display-p3 0.3961 0.3961 0.3961)", "fillOpacity": "1"} as React.CSSProperties}></path>
                          </svg>
                          <div className={"text-14/22 font-500 text-body-light-muted"}>
                            {"Mainnet"}
                          </div>
                          <img alt={""} decoding={"async"} height={"20"} loading={"lazy"} src={"/assets/images-original/features/dashboard/smoke/check-2.png"} style={{} as React.CSSProperties} width={"20"} className={"lazy-image opacity-0"} />
                        </div>
                        <div className={"flex py-4 px-12 items-center justify-center gap-4 w-180 rounded-8"}>
                          <svg fill={"none"} height={"20"} viewBox={"0 0 20 20"} width={"20"} xmlns={"http://www.w3.org/2000/svg"}>
                            <path d={"M5.376 5.983 a0.577 0.577 0 0 1 0.577 -0.577 h8.079 a0.577 0.577 0 0 1 0.577 0.577 v5.771 a0.577 0.577 0 0 1 -0.577 0.577 h-3.03 v1.154 H12.301 a0.433 0.433 0 0 1 0 0.866 H7.684 A0.433 0.433 0 0 1 7.684 13.485 h1.298 v-1.154 H5.953 a0.577 0.577 0 0 1 -0.577 -0.577 V5.983Zm0.923 0.346 v5.078 h7.387 V6.329 H6.299Zm1.327 1.27 1.5 1.27 -1.5 1.27 -0.519 -0.635 0.75 -0.635 -0.75 -0.635 0.519 -0.635Zm2.078 2.02 h2.424 v0.808 H9.704 V9.618Z"} fill={"#656565"} style={{"fill": "color(display-p3 0.3961 0.3961 0.3961)", "fillOpacity": "1"} as React.CSSProperties}></path>
                          </svg>
                          <div className={"text-14/22 font-500 text-body-light-muted"}>
                            {"Dev node"}
                          </div>
                          <img alt={""} decoding={"async"} height={"20"} loading={"lazy"} src={"/assets/images-original/features/dashboard/smoke/check-2.png"} style={{} as React.CSSProperties} width={"20"} className={"lazy-image opacity-0"} />
                        </div>
                      </div>
                      <div className={"flex py-7 px-32 items-center justify-center rounded-6 features-dashbord-content-smoke-box-active text-12/18 font-500 tracking-[-0.12px] features-dashbord-content-smoke-box-text"}>
                        {"Run workflows"}
                      </div>
                    </div>
                    <div className={"flex justify-between p-8 gap-2 rounded-14 my-16 border border-black/5"}>
                      <div className={"flex flex-col items-center justify-center pl-80 gap-8"}>
                        <div className={"flex items-center justify-center h-48 w-48"}>
                          <img alt={""} decoding={"async"} height={"44"} loading={"lazy"} src={"/assets/images/features/dashboard/smoke/logo-old.png"} style={{} as React.CSSProperties} width={"44"} className={"lazy-image opacity-0 rounded-10 features-dashboard-content-smoke-logo"} />
                        </div>
                        <div className={"text-14/22 font-400 text-body-light-muted"}>
                          {"1003"}
                        </div>
                      </div>
                      <div className={"flex flex-col items-center justify-center py-22 gap-6"}>
                        <div className={"flex flex-col items-center gap-12 pt-6 px-6"}>
                          <img alt={""} decoding={"async"} height={"22"} loading={"lazy"} src={"/assets/images-original/features/dashboard/smoke/check-2.png"} style={{} as React.CSSProperties} width={"22"} className={"lazy-image opacity-0"} />
                          <svg fill={"none"} height={"10"} viewBox={"0 0 38 10"} width={"38"} xmlns={"http://www.w3.org/2000/svg"}>
                            <path d={"M1 5H37M37 5L33 9M37 5L33 1"} stroke={"#A4A4A4"} strokeLinecap={"round"} strokeLinejoin={"round"} strokeOpacity={"0.32"} strokeWidth={"1.5"} style={{"stroke": "color(display-p3 0.6444 0.6444 0.6444)", "strokeOpacity": "0.32"} as React.CSSProperties}></path>
                          </svg>
                        </div>
                        <a href={"https://github.com/Venkat5599/PRT"} className={"text-12/18 font-400 features-dashbord-content-smoke-content-active"} target={"_blank"} rel={"noopener"}>
                          {"setCode upgrade"}
                        </a>
                      </div>
                      <div className={"flex flex-col p-22 items-center gap-8"}>
                        <div className={"flex items-center justify-center w-48 h-48"}>
                          <img alt={""} decoding={"async"} height={"44"} loading={"lazy"} src={"/assets/images/features/dashboard/smoke/logo.png"} style={{} as React.CSSProperties} width={"44"} className={"lazy-image opacity-0 rounded-10 features-dashboard-content-smoke-logo"} />
                        </div>
                        <div className={"text-14/22 font-400 text-body-light-muted"}>
                          {"1004"}
                        </div>
                      </div>
                      <div className={"flex flex-col items-center justify-center py-22 gap-6"}>
                        <div className={"flex flex-col items-center gap-12 pt-6 px-6"}>
                          <img alt={""} decoding={"async"} height={"22"} loading={"lazy"} src={"/assets/images-original/features/dashboard/smoke/check-2.png"} style={{} as React.CSSProperties} width={"22"} className={"lazy-image opacity-0"} />
                          <svg fill={"none"} height={"10"} viewBox={"0 0 38 10"} width={"38"} xmlns={"http://www.w3.org/2000/svg"}>
                            <path d={"M1 5H37M37 5L33 9M37 5L33 1"} stroke={"#A4A4A4"} strokeLinecap={"round"} strokeLinejoin={"round"} strokeOpacity={"0.32"} strokeWidth={"1.5"} style={{"stroke": "color(display-p3 0.6444 0.6444 0.6444)", "strokeOpacity": "0.32"} as React.CSSProperties}></path>
                          </svg>
                        </div>
                        <a href={"https://github.com/Venkat5599/PRT"} className={"text-12/18 font-400 features-dashbord-content-smoke-content-active"} target={"_blank"} rel={"noopener"}>
                          {"setCode upgrade"}
                        </a>
                      </div>
                      <div className={"flex flex-col pr-80 justify-center items-center gap-8"}>
                        <div className={"flex items-center justify-center w-48 h-48"}>
                          <img alt={""} decoding={"async"} height={"44"} loading={"lazy"} src={"/assets/images/features/dashboard/smoke/logo.png"} style={{} as React.CSSProperties} width={"44"} className={"lazy-image opacity-0 rounded-10 features-dashboard-content-smoke-logo"} />
                        </div>
                        <div className={"text-14/22 font-400 text-body-light-muted"}>
                          {">1004"}
                        </div>
                      </div>
                    </div>
                    <div className={"flex flex-col p-24 gap-24 border-black/5 rounded-14 border"}>
                      <div className={"flex items-center gap-16"}>
                        <img alt={""} decoding={"async"} height={"22"} loading={"lazy"} src={"/assets/images-original/features/dashboard/smoke/check-2.png"} style={{} as React.CSSProperties} width={"22"} className={"lazy-image opacity-0"} />
                        <div className={"text-14/22 font-400 text-body-light-loud"}>
                          {"Workflows dispatched on both sides"}
                        </div>
                      </div>
                      <div className={"flex items-center gap-16"}>
                        <img alt={""} decoding={"async"} height={"22"} loading={"lazy"} src={"/assets/images-original/features/dashboard/smoke/check-2.png"} style={{} as React.CSSProperties} width={"22"} className={"lazy-image opacity-0"} />
                        <div className={"text-14/22 font-400 text-body-light-loud"}>
                          {"Workflows dispatched without errors"}
                        </div>
                      </div>
                      <div className={"flex items-center gap-16"}>
                        <img alt={""} decoding={"async"} height={"22"} loading={"lazy"} src={"/assets/images-original/features/dashboard/smoke/check-2.png"} style={{} as React.CSSProperties} width={"22"} className={"lazy-image opacity-0"} />
                        <div className={"text-14/22 font-400 text-body-light-loud"}>
                          {"State read at pinned block hashes"}
                        </div>
                      </div>
                    </div>
                    <div className={"flex p-22 gap-20"}>
                      <div className={"flex justify-center items-center p-10 border rounded-12 border-black/5"}>
                        <img alt={""} decoding={"async"} height={"28"} loading={"lazy"} src={"/assets/images/features/dashboard/smoke/check.png"} style={{} as React.CSSProperties} width={"28"} className={"lazy-image opacity-0"} />
                      </div>
                      <div className={"flex flex-col"}>
                        <div className={"text-16/26 font-500 tracking-[-0.16px] text-body-light-loud"}>
                          {"1 workflow regression"}
                        </div>
                        <div className={"text-14/22 font-400 text-body-light-muted"}>
                          {"3 out of 4 workflows have passed"}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className={"p-56 border-1 border-black/5 border-solid rounded-12"}>
                    <img alt={""} decoding={"async"} height={"535"} loading={"lazy"} src={"/assets/images/features/dashboard/welcome.png"} style={{} as React.CSSProperties} width={"712"} className={"lazy-image opacity-0 welcome-img aspect-[712/535] w-full h-auto"} />
                  </div>
                  <div className={"flex items-center py-64 px-40 gap-40 justify-center"}>
                    <div className={"h-1 bg-[#F1F1F1] flex-1 max-w-325"}></div>
                    <svg fill={"none"} height={"15"} viewBox={"0 0 14 15"} width={"14"} xmlns={"http://www.w3.org/2000/svg"}>
                      <path clipRule={"evenodd"} d={"M0.14 5.26 L5.81 5.26 L5.81 4.14 L0.14 4.14ZM5.495 5.456 L7.616 1.305 L6.615 0.794 L4.494 4.945ZM6.139 1.221 L8.911 8.571 L9.961 8.179 L7.189 0.829ZM9.527 8.592 L11.382 4.413 L10.353 3.958 L8.498 8.137ZM10.08 5.26 L13.86 5.26 L13.86 4.14 L10.08 4.14ZM0.14 11.56 L5.81 11.56 L5.81 10.44 L0.14 10.44ZM5.327 11.791 L7.651 8.963 L6.783 8.249 L4.459 11.077ZM6.076 8.949 L8.309 11.784 L9.184 11.091 L6.951 8.256ZM7.84 11.56 L13.86 11.56 L13.86 10.44 L7.84 10.44Z"} fill={"#EBEBEB"} fillRule={"evenodd"} style={{"fill": "color(display-p3 0.9200 0.9200 0.9200)", "fillOpacity": "1"} as React.CSSProperties}></path>
                    </svg>
                    <div className={"h-1 bg-[#F1F1F1] flex-1 max-w-325"}></div>
                  </div>
                  <div id={"build-artifacts"}>
                    <div className={"flex justify-between"}>
                      <div className={"flex items-center gap-6 text-14/22 font-500 tracking-[-0.14px] text-body-light-loud"}>
                        <img alt={""} decoding={"async"} height={"20"} loading={"lazy"} src={"/assets/images/features/dashboard/artifacts/check.png"} style={{} as React.CSSProperties} width={"20"} className={"lazy-image opacity-0"} />
                        {"Runtime WASM"}
                        <svg fill={"none"} height={"16"} viewBox={"0 0 16 16"} width={"16"} xmlns={"http://www.w3.org/2000/svg"}>
                          <path clipRule={"evenodd"} d={"M8.00004 1.33325C4.31814 1.33325 1.33337 4.31802 1.33337 7.99992C1.33337 11.6818 4.31814 14.6666 8.00004 14.6666C11.6819 14.6666 14.6667 11.6818 14.6667 7.99992C14.6667 4.31802 11.6819 1.33325 8.00004 1.33325ZM8.00005 5.99992C7.7485 5.99992 7.52846 6.13898 7.41436 6.3476C7.23768 6.67062 6.83258 6.78926 6.50956 6.61258C6.18653 6.43589 6.06789 6.0308 6.24457 5.70777C6.58313 5.08879 7.2418 4.66659 8.00005 4.66659C9.00988 4.66659 9.7113 5.33754 9.91101 6.12592C10.1118 6.91849 9.80676 7.84192 8.89447 8.29806C8.75489 8.36785 8.66671 8.51052 8.66671 8.66659C8.66671 9.03477 8.36824 9.33325 8.00005 9.33325C7.63186 9.33325 7.33338 9.03477 7.33338 8.66659C7.33338 8.00549 7.70689 7.40114 8.29819 7.10549C8.60135 6.95391 8.67922 6.69308 8.61849 6.45332C8.5567 6.20937 8.35226 5.99992 8.00005 5.99992ZM8.00004 11.3333C8.36823 11.3333 8.66671 11.0348 8.66671 10.6666C8.66671 10.2984 8.36823 9.99992 8.00004 9.99992C7.63185 9.99992 7.33337 10.2984 7.33337 10.6666C7.33337 11.0348 7.63185 11.3333 8.00004 11.3333Z"} fill={"#B8B8B8"} fillRule={"evenodd"} style={{"fill": "color(display-p3 0.7200 0.7200 0.7200)", "fillOpacity": "1"} as React.CSSProperties}></path>
                        </svg>
                      </div>
                      <svg fill={"none"} height={"20"} viewBox={"0 0 20 20"} width={"20"} xmlns={"http://www.w3.org/2000/svg"}>
                        <path d={"M13.3333 11.6667L10.2945 8.62804C10.1318 8.46532 9.86801 8.46532 9.70529 8.62804L6.66659 11.6667"} stroke={"#A4A4A4"} strokeLinecap={"round"} strokeLinejoin={"round"} strokeWidth={"1.5"} style={{"stroke": "color(display-p3 0.6444 0.6444 0.6444)", "strokeOpacity": "1"} as React.CSSProperties}></path>
                      </svg>
                    </div>
                    <table className={"mt-24 w-full"}>
                      <thead>
                        <tr className={"bg-black/4"}>
                          <td style={{"width": "120px", "borderTopLeftRadius": "8px", "borderBottomLeftRadius": "8px"} as React.CSSProperties} className={"py-8 pl-16 gap-4 h-16"}>
                            <div style={{"borderRightWidth": "1px", "borderColor": "black/8"} as React.CSSProperties} className={"text-12/18 font-500 tracking-[-0.12px] text-body-light-muted"}>
                              {"Node"}
                            </div>
                          </td>
                          <td style={{"width": "180px"} as React.CSSProperties} className={"py-8 pl-16 gap-4 h-16"}>
                            <div style={{"borderRightWidth": "1px", "borderColor": "black/8"} as React.CSSProperties} className={"text-12/18 font-500 tracking-[-0.12px] text-body-light-muted"}>
                              {"Runtime"}
                            </div>
                          </td>
                          <td style={{"width": "200px"} as React.CSSProperties} className={"py-8 pl-16 gap-4 h-16"}>
                            <div style={{"borderRightWidth": "1px", "borderColor": "black/8"} as React.CSSProperties} className={"text-12/18 font-500 tracking-[-0.12px] text-body-light-muted"}>
                              {"spec"}
                            </div>
                          </td>
                          <td style={{"width": "188px"} as React.CSSProperties} className={"py-8 pl-16 gap-4 h-16"}>
                            <div style={{"borderRightWidth": "1px", "borderColor": "black/8"} as React.CSSProperties} className={"text-12/18 font-500 tracking-[-0.12px] text-body-light-muted"}>
                              {"Size"}
                            </div>
                          </td>
                          <td style={{"borderTopRightRadius": "8px", "borderBottomRightRadius": "8px"} as React.CSSProperties} className={"py-8 pl-16 gap-4 h-16"}>
                            <div style={{} as React.CSSProperties} className={"text-12/18 font-500 tracking-[-0.12px] text-body-light-muted"}>
                              {"Actions"}
                            </div>
                          </td>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className={"border-b border-black/6"}>
                          <td className={"pl-16 py-8"}>
                            <svg fill={"none"} height={"20"} viewBox={"0 0 20 20"} width={"20"} xmlns={"http://www.w3.org/2000/svg"}>
                              <path d={"M9.703 4.149 14.268 6.716 v5.136 L9.703 14.42 5.137 11.852 v-5.136 L9.703 4.149Zm0 1.312 L6.279 7.401 v3.766 l3.424 1.94 3.424 -1.94 V7.401 l-3.424 -1.94ZM7.762 7.515 h3.88 v0.913 H7.762 V7.515Zm0 1.655 h3.88 v0.913 H7.762 V9.17Zm0 1.655 h3.88 v0.913 H7.762 v-0.913Z"} fill={"black"} style={{"fill": "black", "fillOpacity": "1"} as React.CSSProperties}></path>
                            </svg>
                          </td>
                          <td className={"pl-16 py-8 text-12/18 font-400 text-body-light-loud"}>
                            {"clean.wasm"}
                          </td>
                          <td className={"pl-16 py-8"}>
                            <div className={"flex px-9 py-3 gap-6 items-center w-max justify-center border-black/8 border rounded-full"}>
                              <div className={"h-6 w-6 bg-[#C2C2C2] rounded-full"}></div>
                              <div className={"text-12/18 text-body-light-loud"}>
                                {"1003"}
                              </div>
                            </div>
                          </td>
                          <td className={"pl-16 py-8"}>
                            <div className={"flex gap-8 text-12/18 font-400 text-body-light-loud"}>
                              {"2.45 MB"}
                            </div>
                          </td>
                          <td className={"pl-16 py-8"}>
                            <div className={"flex items-center gap-10"}>
                              <div className={"p-6 rounded-6 features-dashboard-content-artifacts-box-square-arrow"}>
                                <svg fill={"none"} height={"16"} viewBox={"0 0 16 16"} width={"16"} xmlns={"http://www.w3.org/2000/svg"}>
                                  <path d={"M6.66659 3.33333C6.66659 2.96514 6.96506 2.66666 7.33325 2.66666C7.70144 2.66666 7.99992 2.36818 7.99992 1.99999C7.99992 1.63181 7.70144 1.33333 7.33325 1.33333C6.22868 1.33333 5.33325 2.22876 5.33325 3.33333C5.33325 3.70152 5.63173 3.99999 5.99992 3.99999C6.36811 3.99999 6.66659 3.70152 6.66659 3.33333Z"} fill={"#656565"} style={{"fill": "color(display-p3 0.3961 0.3961 0.3961)", "fillOpacity": "1"} as React.CSSProperties}></path>
                                  <path d={"M9.33325 1.33333C8.96506 1.33333 8.66659 1.63181 8.66659 1.99999C8.66659 2.36818 8.96506 2.66666 9.33325 2.66666H10.6666C11.0348 2.66666 11.3333 2.36818 11.3333 1.99999C11.3333 1.63181 11.0348 1.33333 10.6666 1.33333H9.33325Z"} fill={"#656565"} style={{"fill": "color(display-p3 0.3961 0.3961 0.3961)", "fillOpacity": "1"} as React.CSSProperties}></path>
                                  <path d={"M12.6666 1.33333C12.2984 1.33333 11.9999 1.63181 11.9999 1.99999C11.9999 2.36818 12.2984 2.66666 12.6666 2.66666C13.0348 2.66666 13.3333 2.96514 13.3333 3.33333C13.3333 3.70152 13.6317 3.99999 13.9999 3.99999C14.3681 3.99999 14.6666 3.70152 14.6666 3.33333C14.6666 2.22876 13.7712 1.33333 12.6666 1.33333Z"} fill={"#656565"} style={{"fill": "color(display-p3 0.3961 0.3961 0.3961)", "fillOpacity": "1"} as React.CSSProperties}></path>
                                  <path d={"M6.66659 5.33333C6.66659 4.96514 6.36811 4.66666 5.99992 4.66666C5.63173 4.66666 5.33325 4.96514 5.33325 5.33333H2.83325C2.00483 5.33333 1.33325 6.0049 1.33325 6.83333V13.1667C1.33325 13.9951 2.00482 14.6667 2.83325 14.6667H9.16659C9.99501 14.6667 10.6666 13.9951 10.6666 13.1667V10.6667C11.0348 10.6667 11.3333 10.3682 11.3333 10C11.3333 9.63181 11.0348 9.33333 10.6666 9.33333V6.83333C10.6666 6.0049 9.99501 5.33333 9.16659 5.33333H6.66659Z"} fill={"#656565"} style={{"fill": "color(display-p3 0.3961 0.3961 0.3961)", "fillOpacity": "1"} as React.CSSProperties}></path>
                                  <path d={"M14.6666 5.33333C14.6666 4.96514 14.3681 4.66666 13.9999 4.66666C13.6317 4.66666 13.3333 4.96514 13.3333 5.33333V6.66666C13.3333 7.03485 13.6317 7.33333 13.9999 7.33333C14.3681 7.33333 14.6666 7.03485 14.6666 6.66666V5.33333Z"} fill={"#656565"} style={{"fill": "color(display-p3 0.3961 0.3961 0.3961)", "fillOpacity": "1"} as React.CSSProperties}></path>
                                  <path d={"M14.6666 8.66666C14.6666 8.29847 14.3681 8 13.9999 8C13.6317 8 13.3333 8.29847 13.3333 8.66666C13.3333 9.03485 13.0348 9.33333 12.6666 9.33333C12.2984 9.33333 11.9999 9.63181 11.9999 10C11.9999 10.3682 12.2984 10.6667 12.6666 10.6667C13.7712 10.6667 14.6666 9.77123 14.6666 8.66666Z"} fill={"#656565"} style={{"fill": "color(display-p3 0.3961 0.3961 0.3961)", "fillOpacity": "1"} as React.CSSProperties}></path>
                                </svg>
                              </div>
                              <div className={"p-6 rounded-6 features-dashboard-content-artifacts-box-square-arrow"}>
                                <svg fill={"none"} height={"16"} viewBox={"0 0 16 16"} width={"16"} xmlns={"http://www.w3.org/2000/svg"}>
                                  <path clipRule={"evenodd"} d={"M2.66667 9.33333C3.03486 9.33333 3.33333 9.63181 3.33333 10V12C3.33333 12.3682 3.63181 12.6667 4 12.6667H12C12.3682 12.6667 12.6667 12.3682 12.6667 12V10C12.6667 9.63181 12.9651 9.33333 13.3333 9.33333C13.7015 9.33333 14 9.63181 14 10V12C14 13.1046 13.1046 14 12 14H4C2.89543 14 2 13.1046 2 12V10C2 9.63181 2.29848 9.33333 2.66667 9.33333Z"} fill={"#656565"} fillRule={"evenodd"} style={{"fill": "color(display-p3 0.3961 0.3961 0.3961)", "fillOpacity": "1"} as React.CSSProperties}></path>
                                  <path clipRule={"evenodd"} d={"M7.99999 10.3333C8.1768 10.3333 8.34637 10.2631 8.4714 10.1381L10.8047 7.80474C11.0651 7.54439 11.0651 7.12228 10.8047 6.86193C10.5444 6.60158 10.1223 6.60158 9.86193 6.86193L8.66666 8.05719V2.66667C8.66666 2.29848 8.36818 2 7.99999 2C7.6318 2 7.33333 2.29848 7.33333 2.66667V8.05719L6.13807 6.86193C5.87772 6.60158 5.45561 6.60158 5.19526 6.86193C4.93491 7.12228 4.93491 7.54439 5.19526 7.80474L7.52859 10.1381C7.65361 10.2631 7.82318 10.3333 7.99999 10.3333Z"} fill={"#656565"} fillRule={"evenodd"} style={{"fill": "color(display-p3 0.3961 0.3961 0.3961)", "fillOpacity": "1"} as React.CSSProperties}></path>
                                </svg>
                              </div>
                            </div>
                          </td>
                        </tr>
                        <tr className={"border-b border-black/6"}>
                          <td className={"pl-16 py-8"}>
                            <svg fill={"none"} height={"20"} viewBox={"0 0 20 20"} width={"20"} xmlns={"http://www.w3.org/2000/svg"}>
                              <path d={"M9.703 4.149 14.268 6.716 v5.136 L9.703 14.42 5.137 11.852 v-5.136 L9.703 4.149Zm0 1.312 L6.279 7.401 v3.766 l3.424 1.94 3.424 -1.94 V7.401 l-3.424 -1.94ZM7.762 7.515 h3.88 v0.913 H7.762 V7.515Zm0 1.655 h3.88 v0.913 H7.762 V9.17Zm0 1.655 h3.88 v0.913 H7.762 v-0.913Z"} fill={"black"} style={{"fill": "black", "fillOpacity": "1"} as React.CSSProperties}></path>
                            </svg>
                          </td>
                          <td className={"pl-16 py-8 text-12/18 font-400 text-body-light-loud"}>
                            {"ed100x.wasm"}
                          </td>
                          <td className={"pl-16 py-8"}>
                            <div className={"flex px-9 py-3 gap-6 items-center w-max justify-center border-black/8 border rounded-full"}>
                              <div className={"h-6 w-6 bg-[#C2C2C2] rounded-full"}></div>
                              <div className={"text-12/18 text-body-light-loud"}>
                                {"1004"}
                              </div>
                            </div>
                          </td>
                          <td className={"pl-16 py-8"}>
                            <div className={"flex gap-8 text-12/18 font-400 text-body-light-loud"}>
                              {"2.45 MB"}
                              <div className={"flex items-center justify-center py-1 px-6 gap-6 features-dashboard-content-artifacts-box-active text-12/18 font-500 tracking-[-0.12px] features-dashboard-content-artifacts-box-active-text"}>
                                {"+91 B"}
                              </div>
                            </div>
                          </td>
                          <td className={"pl-16 py-8"}>
                            <div className={"flex items-center gap-10"}>
                              <div className={"p-6 rounded-6 features-dashboard-content-artifacts-box-square-arrow"}>
                                <svg fill={"none"} height={"16"} viewBox={"0 0 16 16"} width={"16"} xmlns={"http://www.w3.org/2000/svg"}>
                                  <path d={"M6.66659 3.33333C6.66659 2.96514 6.96506 2.66666 7.33325 2.66666C7.70144 2.66666 7.99992 2.36818 7.99992 1.99999C7.99992 1.63181 7.70144 1.33333 7.33325 1.33333C6.22868 1.33333 5.33325 2.22876 5.33325 3.33333C5.33325 3.70152 5.63173 3.99999 5.99992 3.99999C6.36811 3.99999 6.66659 3.70152 6.66659 3.33333Z"} fill={"#656565"} style={{"fill": "color(display-p3 0.3961 0.3961 0.3961)", "fillOpacity": "1"} as React.CSSProperties}></path>
                                  <path d={"M9.33325 1.33333C8.96506 1.33333 8.66659 1.63181 8.66659 1.99999C8.66659 2.36818 8.96506 2.66666 9.33325 2.66666H10.6666C11.0348 2.66666 11.3333 2.36818 11.3333 1.99999C11.3333 1.63181 11.0348 1.33333 10.6666 1.33333H9.33325Z"} fill={"#656565"} style={{"fill": "color(display-p3 0.3961 0.3961 0.3961)", "fillOpacity": "1"} as React.CSSProperties}></path>
                                  <path d={"M12.6666 1.33333C12.2984 1.33333 11.9999 1.63181 11.9999 1.99999C11.9999 2.36818 12.2984 2.66666 12.6666 2.66666C13.0348 2.66666 13.3333 2.96514 13.3333 3.33333C13.3333 3.70152 13.6317 3.99999 13.9999 3.99999C14.3681 3.99999 14.6666 3.70152 14.6666 3.33333C14.6666 2.22876 13.7712 1.33333 12.6666 1.33333Z"} fill={"#656565"} style={{"fill": "color(display-p3 0.3961 0.3961 0.3961)", "fillOpacity": "1"} as React.CSSProperties}></path>
                                  <path d={"M6.66659 5.33333C6.66659 4.96514 6.36811 4.66666 5.99992 4.66666C5.63173 4.66666 5.33325 4.96514 5.33325 5.33333H2.83325C2.00483 5.33333 1.33325 6.0049 1.33325 6.83333V13.1667C1.33325 13.9951 2.00482 14.6667 2.83325 14.6667H9.16659C9.99501 14.6667 10.6666 13.9951 10.6666 13.1667V10.6667C11.0348 10.6667 11.3333 10.3682 11.3333 10C11.3333 9.63181 11.0348 9.33333 10.6666 9.33333V6.83333C10.6666 6.0049 9.99501 5.33333 9.16659 5.33333H6.66659Z"} fill={"#656565"} style={{"fill": "color(display-p3 0.3961 0.3961 0.3961)", "fillOpacity": "1"} as React.CSSProperties}></path>
                                  <path d={"M14.6666 5.33333C14.6666 4.96514 14.3681 4.66666 13.9999 4.66666C13.6317 4.66666 13.3333 4.96514 13.3333 5.33333V6.66666C13.3333 7.03485 13.6317 7.33333 13.9999 7.33333C14.3681 7.33333 14.6666 7.03485 14.6666 6.66666V5.33333Z"} fill={"#656565"} style={{"fill": "color(display-p3 0.3961 0.3961 0.3961)", "fillOpacity": "1"} as React.CSSProperties}></path>
                                  <path d={"M14.6666 8.66666C14.6666 8.29847 14.3681 8 13.9999 8C13.6317 8 13.3333 8.29847 13.3333 8.66666C13.3333 9.03485 13.0348 9.33333 12.6666 9.33333C12.2984 9.33333 11.9999 9.63181 11.9999 10C11.9999 10.3682 12.2984 10.6667 12.6666 10.6667C13.7712 10.6667 14.6666 9.77123 14.6666 8.66666Z"} fill={"#656565"} style={{"fill": "color(display-p3 0.3961 0.3961 0.3961)", "fillOpacity": "1"} as React.CSSProperties}></path>
                                </svg>
                              </div>
                              <div className={"p-6 rounded-6 features-dashboard-content-artifacts-box-square-arrow"}>
                                <svg fill={"none"} height={"16"} viewBox={"0 0 16 16"} width={"16"} xmlns={"http://www.w3.org/2000/svg"}>
                                  <path clipRule={"evenodd"} d={"M2.66667 9.33333C3.03486 9.33333 3.33333 9.63181 3.33333 10V12C3.33333 12.3682 3.63181 12.6667 4 12.6667H12C12.3682 12.6667 12.6667 12.3682 12.6667 12V10C12.6667 9.63181 12.9651 9.33333 13.3333 9.33333C13.7015 9.33333 14 9.63181 14 10V12C14 13.1046 13.1046 14 12 14H4C2.89543 14 2 13.1046 2 12V10C2 9.63181 2.29848 9.33333 2.66667 9.33333Z"} fill={"#656565"} fillRule={"evenodd"} style={{"fill": "color(display-p3 0.3961 0.3961 0.3961)", "fillOpacity": "1"} as React.CSSProperties}></path>
                                  <path clipRule={"evenodd"} d={"M7.99999 10.3333C8.1768 10.3333 8.34637 10.2631 8.4714 10.1381L10.8047 7.80474C11.0651 7.54439 11.0651 7.12228 10.8047 6.86193C10.5444 6.60158 10.1223 6.60158 9.86193 6.86193L8.66666 8.05719V2.66667C8.66666 2.29848 8.36818 2 7.99999 2C7.6318 2 7.33333 2.29848 7.33333 2.66667V8.05719L6.13807 6.86193C5.87772 6.60158 5.45561 6.60158 5.19526 6.86193C4.93491 7.12228 4.93491 7.54439 5.19526 7.80474L7.52859 10.1381C7.65361 10.2631 7.82318 10.3333 7.99999 10.3333Z"} fill={"#656565"} fillRule={"evenodd"} style={{"fill": "color(display-p3 0.3961 0.3961 0.3961)", "fillOpacity": "1"} as React.CSSProperties}></path>
                                </svg>
                              </div>
                            </div>
                          </td>
                        </tr>
                        <tr className={"border-b border-black/6"}>
                          <td className={"pl-16 py-8"}>
                            <svg fill={"none"} height={"20"} viewBox={"0 0 20 20"} width={"20"} xmlns={"http://www.w3.org/2000/svg"}>
                              <path d={"M9.703 4.149 14.268 6.716 v5.136 L9.703 14.42 5.137 11.852 v-5.136 L9.703 4.149Zm0 1.312 L6.279 7.401 v3.766 l3.424 1.94 3.424 -1.94 V7.401 l-3.424 -1.94ZM7.762 7.515 h3.88 v0.913 H7.762 V7.515Zm0 1.655 h3.88 v0.913 H7.762 V9.17Zm0 1.655 h3.88 v0.913 H7.762 v-0.913Z"} fill={"black"} style={{"fill": "black", "fillOpacity": "1"} as React.CSSProperties}></path>
                            </svg>
                          </td>
                          <td className={"pl-16 py-8 text-12/18 font-400 text-body-light-loud"}>
                            {"fee10x.wasm"}
                          </td>
                          <td className={"pl-16 py-8"}>
                            <div className={"flex px-9 py-3 gap-6 items-center w-max justify-center border-black/8 border rounded-full"}>
                              <div className={"h-6 w-6 bg-[#C2C2C2] rounded-full"}></div>
                              <div className={"text-12/18 text-body-light-loud"}>
                                {"1005"}
                              </div>
                            </div>
                          </td>
                          <td className={"pl-16 py-8"}>
                            <div className={"flex gap-8 text-12/18 font-400 text-body-light-loud"}>
                              {"2.45 MB"}
                              <div className={"flex items-center justify-center py-1 px-6 gap-6 features-dashboard-content-artifacts-box-active text-12/18 font-500 tracking-[-0.12px] features-dashboard-content-artifacts-box-active-text"}>
                                {"+2 B"}
                              </div>
                            </div>
                          </td>
                          <td className={"pl-16 py-8"}>
                            <div className={"flex items-center gap-10"}>
                              <div className={"p-6 rounded-6 features-dashboard-content-artifacts-box-square-arrow"}>
                                <svg fill={"none"} height={"16"} viewBox={"0 0 16 16"} width={"16"} xmlns={"http://www.w3.org/2000/svg"}>
                                  <path d={"M6.66659 3.33333C6.66659 2.96514 6.96506 2.66666 7.33325 2.66666C7.70144 2.66666 7.99992 2.36818 7.99992 1.99999C7.99992 1.63181 7.70144 1.33333 7.33325 1.33333C6.22868 1.33333 5.33325 2.22876 5.33325 3.33333C5.33325 3.70152 5.63173 3.99999 5.99992 3.99999C6.36811 3.99999 6.66659 3.70152 6.66659 3.33333Z"} fill={"#656565"} style={{"fill": "color(display-p3 0.3961 0.3961 0.3961)", "fillOpacity": "1"} as React.CSSProperties}></path>
                                  <path d={"M9.33325 1.33333C8.96506 1.33333 8.66659 1.63181 8.66659 1.99999C8.66659 2.36818 8.96506 2.66666 9.33325 2.66666H10.6666C11.0348 2.66666 11.3333 2.36818 11.3333 1.99999C11.3333 1.63181 11.0348 1.33333 10.6666 1.33333H9.33325Z"} fill={"#656565"} style={{"fill": "color(display-p3 0.3961 0.3961 0.3961)", "fillOpacity": "1"} as React.CSSProperties}></path>
                                  <path d={"M12.6666 1.33333C12.2984 1.33333 11.9999 1.63181 11.9999 1.99999C11.9999 2.36818 12.2984 2.66666 12.6666 2.66666C13.0348 2.66666 13.3333 2.96514 13.3333 3.33333C13.3333 3.70152 13.6317 3.99999 13.9999 3.99999C14.3681 3.99999 14.6666 3.70152 14.6666 3.33333C14.6666 2.22876 13.7712 1.33333 12.6666 1.33333Z"} fill={"#656565"} style={{"fill": "color(display-p3 0.3961 0.3961 0.3961)", "fillOpacity": "1"} as React.CSSProperties}></path>
                                  <path d={"M6.66659 5.33333C6.66659 4.96514 6.36811 4.66666 5.99992 4.66666C5.63173 4.66666 5.33325 4.96514 5.33325 5.33333H2.83325C2.00483 5.33333 1.33325 6.0049 1.33325 6.83333V13.1667C1.33325 13.9951 2.00482 14.6667 2.83325 14.6667H9.16659C9.99501 14.6667 10.6666 13.9951 10.6666 13.1667V10.6667C11.0348 10.6667 11.3333 10.3682 11.3333 10C11.3333 9.63181 11.0348 9.33333 10.6666 9.33333V6.83333C10.6666 6.0049 9.99501 5.33333 9.16659 5.33333H6.66659Z"} fill={"#656565"} style={{"fill": "color(display-p3 0.3961 0.3961 0.3961)", "fillOpacity": "1"} as React.CSSProperties}></path>
                                  <path d={"M14.6666 5.33333C14.6666 4.96514 14.3681 4.66666 13.9999 4.66666C13.6317 4.66666 13.3333 4.96514 13.3333 5.33333V6.66666C13.3333 7.03485 13.6317 7.33333 13.9999 7.33333C14.3681 7.33333 14.6666 7.03485 14.6666 6.66666V5.33333Z"} fill={"#656565"} style={{"fill": "color(display-p3 0.3961 0.3961 0.3961)", "fillOpacity": "1"} as React.CSSProperties}></path>
                                  <path d={"M14.6666 8.66666C14.6666 8.29847 14.3681 8 13.9999 8C13.6317 8 13.3333 8.29847 13.3333 8.66666C13.3333 9.03485 13.0348 9.33333 12.6666 9.33333C12.2984 9.33333 11.9999 9.63181 11.9999 10C11.9999 10.3682 12.2984 10.6667 12.6666 10.6667C13.7712 10.6667 14.6666 9.77123 14.6666 8.66666Z"} fill={"#656565"} style={{"fill": "color(display-p3 0.3961 0.3961 0.3961)", "fillOpacity": "1"} as React.CSSProperties}></path>
                                </svg>
                              </div>
                              <div className={"p-6 rounded-6 features-dashboard-content-artifacts-box-square-arrow"}>
                                <svg fill={"none"} height={"16"} viewBox={"0 0 16 16"} width={"16"} xmlns={"http://www.w3.org/2000/svg"}>
                                  <path clipRule={"evenodd"} d={"M2.66667 9.33333C3.03486 9.33333 3.33333 9.63181 3.33333 10V12C3.33333 12.3682 3.63181 12.6667 4 12.6667H12C12.3682 12.6667 12.6667 12.3682 12.6667 12V10C12.6667 9.63181 12.9651 9.33333 13.3333 9.33333C13.7015 9.33333 14 9.63181 14 10V12C14 13.1046 13.1046 14 12 14H4C2.89543 14 2 13.1046 2 12V10C2 9.63181 2.29848 9.33333 2.66667 9.33333Z"} fill={"#656565"} fillRule={"evenodd"} style={{"fill": "color(display-p3 0.3961 0.3961 0.3961)", "fillOpacity": "1"} as React.CSSProperties}></path>
                                  <path clipRule={"evenodd"} d={"M7.99999 10.3333C8.1768 10.3333 8.34637 10.2631 8.4714 10.1381L10.8047 7.80474C11.0651 7.54439 11.0651 7.12228 10.8047 6.86193C10.5444 6.60158 10.1223 6.60158 9.86193 6.86193L8.66666 8.05719V2.66667C8.66666 2.29848 8.36818 2 7.99999 2C7.6318 2 7.33333 2.29848 7.33333 2.66667V8.05719L6.13807 6.86193C5.87772 6.60158 5.45561 6.60158 5.19526 6.86193C4.93491 7.12228 4.93491 7.54439 5.19526 7.80474L7.52859 10.1381C7.65361 10.2631 7.82318 10.3333 7.99999 10.3333Z"} fill={"#656565"} fillRule={"evenodd"} style={{"fill": "color(display-p3 0.3961 0.3961 0.3961)", "fillOpacity": "1"} as React.CSSProperties}></path>
                                </svg>
                              </div>
                            </div>
                          </td>
                        </tr>
                        <tr className={"border-b border-black/6"}>
                          <td className={"pl-16 py-8"}>
                            <svg fill={"none"} height={"16"} viewBox={"0 0 16 16"} width={"16"} xmlns={"http://www.w3.org/2000/svg"}>
                              <path d={"M3.632 3.32 h8.736 a0.624 0.624 0 0 1 0.624 0.624 v2.184 a0.624 0.624 0 0 1 -0.624 0.624 H3.632 a0.624 0.624 0 0 1 -0.624 -0.624 V3.944 a0.624 0.624 0 0 1 0.624 -0.624Zm0 4.368 h8.736 a0.624 0.624 0 0 1 0.624 0.624 V10.496 a0.624 0.624 0 0 1 -0.624 0.624 H3.632 a0.624 0.624 0 0 1 -0.624 -0.624 v-2.184 a0.624 0.624 0 0 1 0.624 -0.624ZM4.88 4.506 a0.562 0.562 0 1 0 0 1.123 0.562 0.562 0 0 0 0 -1.123Zm0 4.368 a0.562 0.562 0 1 0 0 1.123 0.562 0.562 0 0 0 0 -1.123ZM3.008 12.056 h9.984 V12.992 H3.008 v-0.936Z"} fill={"#141414"} style={{"fill": "color(display-p3 0.0800 0.0800 0.0800)", "fillOpacity": "1"} as React.CSSProperties}></path>
                            </svg>
                          </td>
                          <td className={"pl-16 py-8 text-12/18 font-400 text-body-light-loud"}>
                            {"source-60s.wasm"}
                          </td>
                          <td className={"pl-16 py-8"}>
                            <div className={"flex px-9 py-3 gap-6 items-center w-max justify-center border-black/8 border rounded-full"}>
                              <div className={"h-6 w-6 bg-[#C2C2C2] rounded-full"}></div>
                              <div className={"text-12/18 text-body-light-loud"}>
                                {"1003"}
                              </div>
                            </div>
                          </td>
                          <td className={"pl-16 py-8"}>
                            <div className={"flex gap-8 text-12/18 font-400 text-body-light-loud"}>
                              {"2.45 MB"}
                              <div className={"flex items-center justify-center py-1 px-6 gap-6 features-dashboard-content-artifacts-box-active text-12/18 font-500 tracking-[-0.12px] features-dashboard-content-artifacts-box-active-text"}>
                                {"+234 B"}
                              </div>
                            </div>
                          </td>
                          <td className={"pl-16 py-8"}>
                            <div className={"flex items-center gap-10"}>
                              <div className={"p-6 rounded-6 features-dashboard-content-artifacts-box-square-arrow"}>
                                <svg fill={"none"} height={"16"} viewBox={"0 0 16 16"} width={"16"} xmlns={"http://www.w3.org/2000/svg"}>
                                  <path d={"M6.66659 3.33333C6.66659 2.96514 6.96506 2.66666 7.33325 2.66666C7.70144 2.66666 7.99992 2.36818 7.99992 1.99999C7.99992 1.63181 7.70144 1.33333 7.33325 1.33333C6.22868 1.33333 5.33325 2.22876 5.33325 3.33333C5.33325 3.70152 5.63173 3.99999 5.99992 3.99999C6.36811 3.99999 6.66659 3.70152 6.66659 3.33333Z"} fill={"#656565"} style={{"fill": "color(display-p3 0.3961 0.3961 0.3961)", "fillOpacity": "1"} as React.CSSProperties}></path>
                                  <path d={"M9.33325 1.33333C8.96506 1.33333 8.66659 1.63181 8.66659 1.99999C8.66659 2.36818 8.96506 2.66666 9.33325 2.66666H10.6666C11.0348 2.66666 11.3333 2.36818 11.3333 1.99999C11.3333 1.63181 11.0348 1.33333 10.6666 1.33333H9.33325Z"} fill={"#656565"} style={{"fill": "color(display-p3 0.3961 0.3961 0.3961)", "fillOpacity": "1"} as React.CSSProperties}></path>
                                  <path d={"M12.6666 1.33333C12.2984 1.33333 11.9999 1.63181 11.9999 1.99999C11.9999 2.36818 12.2984 2.66666 12.6666 2.66666C13.0348 2.66666 13.3333 2.96514 13.3333 3.33333C13.3333 3.70152 13.6317 3.99999 13.9999 3.99999C14.3681 3.99999 14.6666 3.70152 14.6666 3.33333C14.6666 2.22876 13.7712 1.33333 12.6666 1.33333Z"} fill={"#656565"} style={{"fill": "color(display-p3 0.3961 0.3961 0.3961)", "fillOpacity": "1"} as React.CSSProperties}></path>
                                  <path d={"M6.66659 5.33333C6.66659 4.96514 6.36811 4.66666 5.99992 4.66666C5.63173 4.66666 5.33325 4.96514 5.33325 5.33333H2.83325C2.00483 5.33333 1.33325 6.0049 1.33325 6.83333V13.1667C1.33325 13.9951 2.00482 14.6667 2.83325 14.6667H9.16659C9.99501 14.6667 10.6666 13.9951 10.6666 13.1667V10.6667C11.0348 10.6667 11.3333 10.3682 11.3333 10C11.3333 9.63181 11.0348 9.33333 10.6666 9.33333V6.83333C10.6666 6.0049 9.99501 5.33333 9.16659 5.33333H6.66659Z"} fill={"#656565"} style={{"fill": "color(display-p3 0.3961 0.3961 0.3961)", "fillOpacity": "1"} as React.CSSProperties}></path>
                                  <path d={"M14.6666 5.33333C14.6666 4.96514 14.3681 4.66666 13.9999 4.66666C13.6317 4.66666 13.3333 4.96514 13.3333 5.33333V6.66666C13.3333 7.03485 13.6317 7.33333 13.9999 7.33333C14.3681 7.33333 14.6666 7.03485 14.6666 6.66666V5.33333Z"} fill={"#656565"} style={{"fill": "color(display-p3 0.3961 0.3961 0.3961)", "fillOpacity": "1"} as React.CSSProperties}></path>
                                  <path d={"M14.6666 8.66666C14.6666 8.29847 14.3681 8 13.9999 8C13.6317 8 13.3333 8.29847 13.3333 8.66666C13.3333 9.03485 13.0348 9.33333 12.6666 9.33333C12.2984 9.33333 11.9999 9.63181 11.9999 10C11.9999 10.3682 12.2984 10.6667 12.6666 10.6667C13.7712 10.6667 14.6666 9.77123 14.6666 8.66666Z"} fill={"#656565"} style={{"fill": "color(display-p3 0.3961 0.3961 0.3961)", "fillOpacity": "1"} as React.CSSProperties}></path>
                                </svg>
                              </div>
                              <div className={"p-6 rounded-6 features-dashboard-content-artifacts-box-square-arrow"}>
                                <svg fill={"none"} height={"16"} viewBox={"0 0 16 16"} width={"16"} xmlns={"http://www.w3.org/2000/svg"}>
                                  <path clipRule={"evenodd"} d={"M2.66667 9.33333C3.03486 9.33333 3.33333 9.63181 3.33333 10V12C3.33333 12.3682 3.63181 12.6667 4 12.6667H12C12.3682 12.6667 12.6667 12.3682 12.6667 12V10C12.6667 9.63181 12.9651 9.33333 13.3333 9.33333C13.7015 9.33333 14 9.63181 14 10V12C14 13.1046 13.1046 14 12 14H4C2.89543 14 2 13.1046 2 12V10C2 9.63181 2.29848 9.33333 2.66667 9.33333Z"} fill={"#656565"} fillRule={"evenodd"} style={{"fill": "color(display-p3 0.3961 0.3961 0.3961)", "fillOpacity": "1"} as React.CSSProperties}></path>
                                  <path clipRule={"evenodd"} d={"M7.99999 10.3333C8.1768 10.3333 8.34637 10.2631 8.4714 10.1381L10.8047 7.80474C11.0651 7.54439 11.0651 7.12228 10.8047 6.86193C10.5444 6.60158 10.1223 6.60158 9.86193 6.86193L8.66666 8.05719V2.66667C8.66666 2.29848 8.36818 2 7.99999 2C7.6318 2 7.33333 2.29848 7.33333 2.66667V8.05719L6.13807 6.86193C5.87772 6.60158 5.45561 6.60158 5.19526 6.86193C4.93491 7.12228 4.93491 7.54439 5.19526 7.80474L7.52859 10.1381C7.65361 10.2631 7.82318 10.3333 7.99999 10.3333Z"} fill={"#656565"} fillRule={"evenodd"} style={{"fill": "color(display-p3 0.3961 0.3961 0.3961)", "fillOpacity": "1"} as React.CSSProperties}></path>
                                </svg>
                              </div>
                            </div>
                          </td>
                        </tr>
                        <tr className={"border-b border-black/6"}>
                          <td className={"pl-16 py-8"}>
                            <svg fill={"none"} height={"16"} viewBox={"0 0 16 16"} width={"16"} xmlns={"http://www.w3.org/2000/svg"}>
                              <path d={"M3.376 3.983 a0.577 0.577 0 0 1 0.577 -0.577 h8.079 a0.577 0.577 0 0 1 0.577 0.577 v5.771 a0.577 0.577 0 0 1 -0.577 0.577 h-3.03 v1.154 H10.301 a0.433 0.433 0 0 1 0 0.866 H5.684 A0.433 0.433 0 0 1 5.684 11.485 h1.298 v-1.154 H3.953 a0.577 0.577 0 0 1 -0.577 -0.577 V3.983Zm0.923 0.346 v5.078 h7.387 V4.329 H4.299Zm1.327 1.27 1.5 1.27 -1.5 1.27 -0.519 -0.635 0.75 -0.635 -0.75 -0.635 0.519 -0.635Zm2.078 2.02 h2.424 v0.808 H7.704 V7.618Z"} fill={"#141414"} style={{"fill": "color(display-p3 0.0800 0.0800 0.0800)", "fillOpacity": "1"} as React.CSSProperties}></path>
                            </svg>
                          </td>
                          <td className={"pl-16 py-8 text-12/18 font-400 text-body-light-loud"}>
                            {"clean.wasm"}
                          </td>
                          <td className={"pl-16 py-8"}>
                            <div className={"flex px-9 py-3 gap-6 items-center w-max justify-center border-black/8 border rounded-full"}>
                              <div className={"h-6 w-6 bg-[#C2C2C2] rounded-full"}></div>
                              <div className={"text-12/18 text-body-light-loud"}>
                                {"1003"}
                              </div>
                            </div>
                          </td>
                          <td className={"pl-16 py-8"}>
                            <div className={"flex gap-8 text-12/18 font-400 text-body-light-loud"}>
                              {"2.45 MB"}
                              <div className={"flex items-center justify-center py-1 px-6 gap-6 features-dashboard-content-artifacts-box-active text-12/18 font-500 tracking-[-0.12px] features-dashboard-content-artifacts-box-active-text"}>
                                {"+234 B"}
                              </div>
                            </div>
                          </td>
                          <td className={"pl-16 py-8"}>
                            <div className={"flex items-center gap-10"}>
                              <div className={"p-6 rounded-6 features-dashboard-content-artifacts-box-square-arrow"}>
                                <svg fill={"none"} height={"16"} viewBox={"0 0 16 16"} width={"16"} xmlns={"http://www.w3.org/2000/svg"}>
                                  <path d={"M6.66659 3.33333C6.66659 2.96514 6.96506 2.66666 7.33325 2.66666C7.70144 2.66666 7.99992 2.36818 7.99992 1.99999C7.99992 1.63181 7.70144 1.33333 7.33325 1.33333C6.22868 1.33333 5.33325 2.22876 5.33325 3.33333C5.33325 3.70152 5.63173 3.99999 5.99992 3.99999C6.36811 3.99999 6.66659 3.70152 6.66659 3.33333Z"} fill={"#656565"} style={{"fill": "color(display-p3 0.3961 0.3961 0.3961)", "fillOpacity": "1"} as React.CSSProperties}></path>
                                  <path d={"M9.33325 1.33333C8.96506 1.33333 8.66659 1.63181 8.66659 1.99999C8.66659 2.36818 8.96506 2.66666 9.33325 2.66666H10.6666C11.0348 2.66666 11.3333 2.36818 11.3333 1.99999C11.3333 1.63181 11.0348 1.33333 10.6666 1.33333H9.33325Z"} fill={"#656565"} style={{"fill": "color(display-p3 0.3961 0.3961 0.3961)", "fillOpacity": "1"} as React.CSSProperties}></path>
                                  <path d={"M12.6666 1.33333C12.2984 1.33333 11.9999 1.63181 11.9999 1.99999C11.9999 2.36818 12.2984 2.66666 12.6666 2.66666C13.0348 2.66666 13.3333 2.96514 13.3333 3.33333C13.3333 3.70152 13.6317 3.99999 13.9999 3.99999C14.3681 3.99999 14.6666 3.70152 14.6666 3.33333C14.6666 2.22876 13.7712 1.33333 12.6666 1.33333Z"} fill={"#656565"} style={{"fill": "color(display-p3 0.3961 0.3961 0.3961)", "fillOpacity": "1"} as React.CSSProperties}></path>
                                  <path d={"M6.66659 5.33333C6.66659 4.96514 6.36811 4.66666 5.99992 4.66666C5.63173 4.66666 5.33325 4.96514 5.33325 5.33333H2.83325C2.00483 5.33333 1.33325 6.0049 1.33325 6.83333V13.1667C1.33325 13.9951 2.00482 14.6667 2.83325 14.6667H9.16659C9.99501 14.6667 10.6666 13.9951 10.6666 13.1667V10.6667C11.0348 10.6667 11.3333 10.3682 11.3333 10C11.3333 9.63181 11.0348 9.33333 10.6666 9.33333V6.83333C10.6666 6.0049 9.99501 5.33333 9.16659 5.33333H6.66659Z"} fill={"#656565"} style={{"fill": "color(display-p3 0.3961 0.3961 0.3961)", "fillOpacity": "1"} as React.CSSProperties}></path>
                                  <path d={"M14.6666 5.33333C14.6666 4.96514 14.3681 4.66666 13.9999 4.66666C13.6317 4.66666 13.3333 4.96514 13.3333 5.33333V6.66666C13.3333 7.03485 13.6317 7.33333 13.9999 7.33333C14.3681 7.33333 14.6666 7.03485 14.6666 6.66666V5.33333Z"} fill={"#656565"} style={{"fill": "color(display-p3 0.3961 0.3961 0.3961)", "fillOpacity": "1"} as React.CSSProperties}></path>
                                  <path d={"M14.6666 8.66666C14.6666 8.29847 14.3681 8 13.9999 8C13.6317 8 13.3333 8.29847 13.3333 8.66666C13.3333 9.03485 13.0348 9.33333 12.6666 9.33333C12.2984 9.33333 11.9999 9.63181 11.9999 10C11.9999 10.3682 12.2984 10.6667 12.6666 10.6667C13.7712 10.6667 14.6666 9.77123 14.6666 8.66666Z"} fill={"#656565"} style={{"fill": "color(display-p3 0.3961 0.3961 0.3961)", "fillOpacity": "1"} as React.CSSProperties}></path>
                                </svg>
                              </div>
                              <div className={"p-6 rounded-6 features-dashboard-content-artifacts-box-square-arrow"}>
                                <svg fill={"none"} height={"16"} viewBox={"0 0 16 16"} width={"16"} xmlns={"http://www.w3.org/2000/svg"}>
                                  <path clipRule={"evenodd"} d={"M2.66667 9.33333C3.03486 9.33333 3.33333 9.63181 3.33333 10V12C3.33333 12.3682 3.63181 12.6667 4 12.6667H12C12.3682 12.6667 12.6667 12.3682 12.6667 12V10C12.6667 9.63181 12.9651 9.33333 13.3333 9.33333C13.7015 9.33333 14 9.63181 14 10V12C14 13.1046 13.1046 14 12 14H4C2.89543 14 2 13.1046 2 12V10C2 9.63181 2.29848 9.33333 2.66667 9.33333Z"} fill={"#656565"} fillRule={"evenodd"} style={{"fill": "color(display-p3 0.3961 0.3961 0.3961)", "fillOpacity": "1"} as React.CSSProperties}></path>
                                  <path clipRule={"evenodd"} d={"M7.99999 10.3333C8.1768 10.3333 8.34637 10.2631 8.4714 10.1381L10.8047 7.80474C11.0651 7.54439 11.0651 7.12228 10.8047 6.86193C10.5444 6.60158 10.1223 6.60158 9.86193 6.86193L8.66666 8.05719V2.66667C8.66666 2.29848 8.36818 2 7.99999 2C7.6318 2 7.33333 2.29848 7.33333 2.66667V8.05719L6.13807 6.86193C5.87772 6.60158 5.45561 6.60158 5.19526 6.86193C4.93491 7.12228 4.93491 7.54439 5.19526 7.80474L7.52859 10.1381C7.65361 10.2631 7.82318 10.3333 7.99999 10.3333Z"} fill={"#656565"} fillRule={"evenodd"} style={{"fill": "color(display-p3 0.3961 0.3961 0.3961)", "fillOpacity": "1"} as React.CSSProperties}></path>
                                </svg>
                              </div>
                            </div>
                          </td>
                        </tr>
                        <tr className={"border-b border-black/6"}>
                          <td className={"pl-16 py-8"}>
                            <svg fill={"none"} height={"16"} viewBox={"0 0 16 16"} width={"16"} xmlns={"http://www.w3.org/2000/svg"}>
                              <path d={"M3.376 3.983 a0.577 0.577 0 0 1 0.577 -0.577 h8.079 a0.577 0.577 0 0 1 0.577 0.577 v5.771 a0.577 0.577 0 0 1 -0.577 0.577 h-3.03 v1.154 H10.301 a0.433 0.433 0 0 1 0 0.866 H5.684 A0.433 0.433 0 0 1 5.684 11.485 h1.298 v-1.154 H3.953 a0.577 0.577 0 0 1 -0.577 -0.577 V3.983Zm0.923 0.346 v5.078 h7.387 V4.329 H4.299Zm1.327 1.27 1.5 1.27 -1.5 1.27 -0.519 -0.635 0.75 -0.635 -0.75 -0.635 0.519 -0.635Zm2.078 2.02 h2.424 v0.808 H7.704 V7.618Z"} fill={"#141414"} style={{"fill": "color(display-p3 0.0800 0.0800 0.0800)", "fillOpacity": "1"} as React.CSSProperties}></path>
                            </svg>
                          </td>
                          <td className={"pl-16 py-8 text-12/18 font-400 text-body-light-loud"}>
                            {"clean.wasm"}
                          </td>
                          <td className={"pl-16 py-8"}>
                            <div className={"flex px-9 py-3 gap-6 items-center w-max justify-center border-black/8 border rounded-full"}>
                              <div className={"h-6 w-6 bg-[#C2C2C2] rounded-full"}></div>
                              <div className={"text-12/18 text-body-light-loud"}>
                                {"1005"}
                              </div>
                            </div>
                          </td>
                          <td className={"pl-16 py-8"}></td>
                          <td className={"pl-16 py-8"}>
                            <div className={"flex items-center gap-10"}>
                              <div className={"p-6 rounded-6 features-dashboard-content-artifacts-box-square-arrow"}>
                                <svg fill={"none"} height={"16"} viewBox={"0 0 16 16"} width={"16"} xmlns={"http://www.w3.org/2000/svg"}>
                                  <path d={"M6.66659 3.33333C6.66659 2.96514 6.96506 2.66666 7.33325 2.66666C7.70144 2.66666 7.99992 2.36818 7.99992 1.99999C7.99992 1.63181 7.70144 1.33333 7.33325 1.33333C6.22868 1.33333 5.33325 2.22876 5.33325 3.33333C5.33325 3.70152 5.63173 3.99999 5.99992 3.99999C6.36811 3.99999 6.66659 3.70152 6.66659 3.33333Z"} fill={"#656565"} style={{"fill": "color(display-p3 0.3961 0.3961 0.3961)", "fillOpacity": "1"} as React.CSSProperties}></path>
                                  <path d={"M9.33325 1.33333C8.96506 1.33333 8.66659 1.63181 8.66659 1.99999C8.66659 2.36818 8.96506 2.66666 9.33325 2.66666H10.6666C11.0348 2.66666 11.3333 2.36818 11.3333 1.99999C11.3333 1.63181 11.0348 1.33333 10.6666 1.33333H9.33325Z"} fill={"#656565"} style={{"fill": "color(display-p3 0.3961 0.3961 0.3961)", "fillOpacity": "1"} as React.CSSProperties}></path>
                                  <path d={"M12.6666 1.33333C12.2984 1.33333 11.9999 1.63181 11.9999 1.99999C11.9999 2.36818 12.2984 2.66666 12.6666 2.66666C13.0348 2.66666 13.3333 2.96514 13.3333 3.33333C13.3333 3.70152 13.6317 3.99999 13.9999 3.99999C14.3681 3.99999 14.6666 3.70152 14.6666 3.33333C14.6666 2.22876 13.7712 1.33333 12.6666 1.33333Z"} fill={"#656565"} style={{"fill": "color(display-p3 0.3961 0.3961 0.3961)", "fillOpacity": "1"} as React.CSSProperties}></path>
                                  <path d={"M6.66659 5.33333C6.66659 4.96514 6.36811 4.66666 5.99992 4.66666C5.63173 4.66666 5.33325 4.96514 5.33325 5.33333H2.83325C2.00483 5.33333 1.33325 6.0049 1.33325 6.83333V13.1667C1.33325 13.9951 2.00482 14.6667 2.83325 14.6667H9.16659C9.99501 14.6667 10.6666 13.9951 10.6666 13.1667V10.6667C11.0348 10.6667 11.3333 10.3682 11.3333 10C11.3333 9.63181 11.0348 9.33333 10.6666 9.33333V6.83333C10.6666 6.0049 9.99501 5.33333 9.16659 5.33333H6.66659Z"} fill={"#656565"} style={{"fill": "color(display-p3 0.3961 0.3961 0.3961)", "fillOpacity": "1"} as React.CSSProperties}></path>
                                  <path d={"M14.6666 5.33333C14.6666 4.96514 14.3681 4.66666 13.9999 4.66666C13.6317 4.66666 13.3333 4.96514 13.3333 5.33333V6.66666C13.3333 7.03485 13.6317 7.33333 13.9999 7.33333C14.3681 7.33333 14.6666 7.03485 14.6666 6.66666V5.33333Z"} fill={"#656565"} style={{"fill": "color(display-p3 0.3961 0.3961 0.3961)", "fillOpacity": "1"} as React.CSSProperties}></path>
                                  <path d={"M14.6666 8.66666C14.6666 8.29847 14.3681 8 13.9999 8C13.6317 8 13.3333 8.29847 13.3333 8.66666C13.3333 9.03485 13.0348 9.33333 12.6666 9.33333C12.2984 9.33333 11.9999 9.63181 11.9999 10C11.9999 10.3682 12.2984 10.6667 12.6666 10.6667C13.7712 10.6667 14.6666 9.77123 14.6666 8.66666Z"} fill={"#656565"} style={{"fill": "color(display-p3 0.3961 0.3961 0.3961)", "fillOpacity": "1"} as React.CSSProperties}></path>
                                </svg>
                              </div>
                              <div className={"p-6 rounded-6 features-dashboard-content-artifacts-box-square-arrow"}>
                                <svg fill={"none"} height={"16"} viewBox={"0 0 16 16"} width={"16"} xmlns={"http://www.w3.org/2000/svg"}>
                                  <path clipRule={"evenodd"} d={"M2.66667 9.33333C3.03486 9.33333 3.33333 9.63181 3.33333 10V12C3.33333 12.3682 3.63181 12.6667 4 12.6667H12C12.3682 12.6667 12.6667 12.3682 12.6667 12V10C12.6667 9.63181 12.9651 9.33333 13.3333 9.33333C13.7015 9.33333 14 9.63181 14 10V12C14 13.1046 13.1046 14 12 14H4C2.89543 14 2 13.1046 2 12V10C2 9.63181 2.29848 9.33333 2.66667 9.33333Z"} fill={"#656565"} fillRule={"evenodd"} style={{"fill": "color(display-p3 0.3961 0.3961 0.3961)", "fillOpacity": "1"} as React.CSSProperties}></path>
                                  <path clipRule={"evenodd"} d={"M7.99999 10.3333C8.1768 10.3333 8.34637 10.2631 8.4714 10.1381L10.8047 7.80474C11.0651 7.54439 11.0651 7.12228 10.8047 6.86193C10.5444 6.60158 10.1223 6.60158 9.86193 6.86193L8.66666 8.05719V2.66667C8.66666 2.29848 8.36818 2 7.99999 2C7.6318 2 7.33333 2.29848 7.33333 2.66667V8.05719L6.13807 6.86193C5.87772 6.60158 5.45561 6.60158 5.19526 6.86193C4.93491 7.12228 4.93491 7.54439 5.19526 7.80474L7.52859 10.1381C7.65361 10.2631 7.82318 10.3333 7.99999 10.3333Z"} fill={"#656565"} fillRule={"evenodd"} style={{"fill": "color(display-p3 0.3961 0.3961 0.3961)", "fillOpacity": "1"} as React.CSSProperties}></path>
                                </svg>
                              </div>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    <table className={"my-56 rounded-8 w-full"}>
                      <thead className={"bg-black/4"}>
                        <tr>
                          <td className={"w-1/4 rounded-l-8"}>
                            <div className={"flex items-center justify-between py-8 pl-16 gap-4 text-12/18 font-500 tracking-[-0.12px] text-body-light-muted"}>
                              {"Constants"}
                              <div className={"flex gap-8"}>
                                <svg fill={"none"} height={"14"} viewBox={"0 0 14 14"} width={"14"} xmlns={"http://www.w3.org/2000/svg"}>
                                  <path d={"M2.91667 1.75C2.27233 1.75 1.75 2.27233 1.75 2.91667V4.42504C1.75 4.73446 1.87292 5.03121 2.09171 5.25L5.25 8.40829V11.6999C5.25 12.5145 6.0636 13.0783 6.82631 12.7923L7.99298 12.3548C8.44833 12.184 8.75 11.7487 8.75 11.2624V8.40829L11.9083 5.25C12.1271 5.03121 12.25 4.73446 12.25 4.42504V2.91667C12.25 2.27233 11.7277 1.75 11.0833 1.75H2.91667Z"} fill={"#A4A4A4"} style={{"fill": "color(display-p3 0.6444 0.6444 0.6444)", "fillOpacity": "1"} as React.CSSProperties}></path>
                                </svg>
                                <div className={"w-1 h-16 bg-black/8"}></div>
                              </div>
                            </div>
                          </td>
                          <td className={"w-1/4"}>
                            <div className={"flex items-center justify-between py-8 pl-16 gap-4 text-12/18 font-500 tracking-[-0.12px] text-body-light-muted"}>
                              {"Status"}
                              <div className={"flex gap-16"}>
                                <svg fill={"none"} height={"14"} viewBox={"0 0 14 14"} width={"14"} xmlns={"http://www.w3.org/2000/svg"}>
                                  <path d={"M2.91667 1.75C2.27233 1.75 1.75 2.27233 1.75 2.91667V4.42504C1.75 4.73446 1.87292 5.03121 2.09171 5.25L5.25 8.40829V11.6999C5.25 12.5145 6.0636 13.0783 6.82631 12.7923L7.99298 12.3548C8.44833 12.184 8.75 11.7487 8.75 11.2624V8.40829L11.9083 5.25C12.1271 5.03121 12.25 4.73446 12.25 4.42504V2.91667C12.25 2.27233 11.7277 1.75 11.0833 1.75H2.91667Z"} fill={"#428DF7"} style={{"fill": "color(display-p3 0.2588 0.5529 0.9686)", "fillOpacity": "1"} as React.CSSProperties}></path>
                                </svg>
                                <div className={"w-1 h-16 bg-black/8"}></div>
                              </div>
                            </div>
                          </td>
                          <td className={"w-1/4"}>
                            <div className={"flex justify-between items-center py-8 pl-16 gap-4 text-12/18 font-500 tracking-[-0.12px] text-body-light-muted"}>
                              {"Values"}
                              <div className={"w-1 h-16 bg-black/8"}></div>
                            </div>
                          </td>
                          <td className={"w-1/4 rounded-r-8"}>
                            <div className={"flex justify-between items-center py-8 pl-16 gap-4 text-12/18 font-500 tracking-[-0.12px] text-body-light-muted"}>
                              {"impact"}
                            </div>
                          </td>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>
                            <div className={"flex items-center justify-center w-max py-4 px-8 my-11 ml-16 features-dashboard-content-artifacts-dependencies-box text-12/18 font-500 tracking-[-0.12px] features-dashboard-content-artifacts-dependencies-box-text"}>
                              {"ExistentialDeposit"}
                            </div>
                          </td>
                          <td>
                            <div className={"text-12/18 flex w-max ml-16 py-3 px-9 gap-6 items-center justify-center border border-black/8 rounded-full"}>
                              <div className={"h-6 w-6 rounded-full bg-[#428DF7]"}></div>
                              {"Changed"}
                            </div>
                          </td>
                          <td>
                            <div className={"flex items-center pl-16 text-12/18 font-400 text-body-light-loud"}>
                              {"1 POT \u2192 1"}
                              <div className={"text-12/18 font-500 tracking-[-0.12px] features-dashboard-content-artifacts-version-text"}>
                                {"00 POT"}
                              </div>
                            </div>
                          </td>
                          <td className={"pl-16 text-12/18 font-400 text-body-light-loud"}>
                            {"High"}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    <div className={"bg-black/4 rounded-8 p-8 pl-16 text-12/18 font-500 tracking-[-0.12px] text-body-light-muted"}>
                      {"runtimes/out/*.patch"}
                    </div>
                    <div className={"py-8 px-24 gap-4 mt-8 overflow-hidden features-dashboard-content-artifacts-json rounded-t-8"}>
                      <pre className={"text-12/32 font-500 tracking-[-0.12px] features-dashboard-content-artifacts-json-text"}>
                        {"  impl_version: 0,"}
                      </pre>
                    </div>
                    <div className={"py-8 px-24 gap-4 overflow-hidden features-dashboard-content-artifacts-json-added"}>
                      <pre className={"text-12/32 font-500 tracking-[-0.12px] features-dashboard-content-artifacts-json-added-text"}>
                        {"+ MILLISECS_PER_BLOCK: Moment = 6_000;"}
                        <br />
                        {"+ ExistentialDeposit: Balance ="}
                        <br />
                        {"+     100 * DOLLARS;"}
                        <br />
                        {"+ TransactionByteFee: Balance ="}
                        <br />
                        {"+     100 * MILLICENTS;"}
                        <br />
                        {"+ spec_version: 1005,"}
                      </pre>
                    </div>
                    <div className={"py-8 px-24 gap-4 overflow-hidden features-dashboard-content-artifacts-json-removed"}>
                      <pre className={"text-12/32 font-500 tracking-[-0.12px] features-dashboard-content-artifacts-json-removed-text"}>
                        {"- MILLISECS_PER_BLOCK: Moment = 60_000;"}
                        <br />
                        {"- ExistentialDeposit: Balance ="}
                        <br />
                        {"-     1 * DOLLARS;"}
                        <br />
                        {"- TransactionByteFee: Balance ="}
                        <br />
                        {"-     10 * MILLICENTS;"}
                        <br />
                        {"- spec_version: 1001,"}
                      </pre>
                    </div>
                    <div className={"py-8 px-24 gap-4 overflow-hidden features-dashboard-content-artifacts-json-added"}>
                      <pre className={"text-12/32 font-500 tracking-[-0.12px] features-dashboard-content-artifacts-json-added-text"}>
                        {"+ spec_version: "}
                        <span className={"bg-red-500 text-white p-6 rounded-4 line-through"}>
                          {"1001"}
                        </span>
                        <span className={"bg-green-500 text-white p-6 rounded-4"}>
                          {"1004"}
                        </span>
                        {","}
                      </pre>
                    </div>
                    <div className={"py-8 px-24 gap-4 overflow-hidden features-dashboard-content-artifacts-json rounded-b-8 mb-8"}>
                      <pre className={"text-12/32 font-500 tracking-[-0.12px] features-dashboard-content-artifacts-json-text"}>
                        {"  transaction_version: 2,"}
                      </pre>
                    </div>
                  </div>
                  <div className={"flex items-center py-64 px-40 gap-40 justify-center"}>
                    <div className={"h-1 bg-[#F1F1F1] flex-1 max-w-325"}></div>
                    <svg fill={"none"} height={"15"} viewBox={"0 0 14 15"} width={"14"} xmlns={"http://www.w3.org/2000/svg"}>
                      <path clipRule={"evenodd"} d={"M0.14 5.26 L5.81 5.26 L5.81 4.14 L0.14 4.14ZM5.495 5.456 L7.616 1.305 L6.615 0.794 L4.494 4.945ZM6.139 1.221 L8.911 8.571 L9.961 8.179 L7.189 0.829ZM9.527 8.592 L11.382 4.413 L10.353 3.958 L8.498 8.137ZM10.08 5.26 L13.86 5.26 L13.86 4.14 L10.08 4.14ZM0.14 11.56 L5.81 11.56 L5.81 10.44 L0.14 10.44ZM5.327 11.791 L7.651 8.963 L6.783 8.249 L4.459 11.077ZM6.076 8.949 L8.309 11.784 L9.184 11.091 L6.951 8.256ZM7.84 11.56 L13.86 11.56 L13.86 10.44 L7.84 10.44Z"} fill={"#EBEBEB"} fillRule={"evenodd"} style={{"fill": "color(display-p3 0.9200 0.9200 0.9200)", "fillOpacity": "1"} as React.CSSProperties}></path>
                    </svg>
                    <div className={"h-1 bg-[#F1F1F1] flex-1 max-w-325"}></div>
                  </div>
                  <div id={"static-analytics"}>
                    <div className={"flex justify-between"}>
                      <div className={"flex items-center gap-6 mb-32 text-14/22 font-500 tracking-[-0.14px] text-body-light-loud"}>
                        <img alt={""} decoding={"async"} height={"20"} loading={"lazy"} src={"/assets/images/features/dashboard/analysis/check.png"} style={{} as React.CSSProperties} width={"20"} className={"lazy-image opacity-0"} />
                        {"Upgrade hazards"}
                        <svg fill={"none"} height={"16"} viewBox={"0 0 16 16"} width={"16"} xmlns={"http://www.w3.org/2000/svg"}>
                          <path clipRule={"evenodd"} d={"M8.00004 1.33325C4.31814 1.33325 1.33337 4.31802 1.33337 7.99992C1.33337 11.6818 4.31814 14.6666 8.00004 14.6666C11.6819 14.6666 14.6667 11.6818 14.6667 7.99992C14.6667 4.31802 11.6819 1.33325 8.00004 1.33325ZM8.00005 5.99992C7.7485 5.99992 7.52846 6.13898 7.41436 6.3476C7.23768 6.67062 6.83258 6.78926 6.50956 6.61258C6.18653 6.43589 6.06789 6.0308 6.24457 5.70777C6.58313 5.08879 7.2418 4.66659 8.00005 4.66659C9.00988 4.66659 9.7113 5.33754 9.91101 6.12592C10.1118 6.91849 9.80676 7.84192 8.89447 8.29806C8.75489 8.36785 8.66671 8.51052 8.66671 8.66659C8.66671 9.03477 8.36824 9.33325 8.00005 9.33325C7.63186 9.33325 7.33338 9.03477 7.33338 8.66659C7.33338 8.00549 7.70689 7.40114 8.29819 7.10549C8.60135 6.95391 8.67922 6.69308 8.61849 6.45332C8.5567 6.20937 8.35226 5.99992 8.00005 5.99992ZM8.00004 11.3333C8.36823 11.3333 8.66671 11.0348 8.66671 10.6666C8.66671 10.2984 8.36823 9.99992 8.00004 9.99992C7.63185 9.99992 7.33337 10.2984 7.33337 10.6666C7.33337 11.0348 7.63185 11.3333 8.00004 11.3333Z"} fill={"#B8B8B8"} fillRule={"evenodd"} style={{"fill": "color(display-p3 0.7200 0.7200 0.7200)", "fillOpacity": "1"} as React.CSSProperties}></path>
                        </svg>
                      </div>
                      <svg fill={"none"} height={"20"} viewBox={"0 0 20 20"} width={"20"} xmlns={"http://www.w3.org/2000/svg"}>
                        <path d={"M13.3333 11.6667L10.2945 8.62804C10.1318 8.46532 9.86801 8.46532 9.70529 8.62804L6.66659 11.6667"} stroke={"#A4A4A4"} strokeLinecap={"round"} strokeLinejoin={"round"} strokeWidth={"1.5"} style={{"stroke": "color(display-p3 0.6444 0.6444 0.6444)", "strokeOpacity": "1"} as React.CSSProperties}></path>
                      </svg>
                    </div>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                    <table>
                      <thead>
                        <tr className={"items-center bg-black/4 h-36 mb-4"}>
                          <td className={"w-140 rounded-l-8"}>
                            <div className={"flex items-center justify-between pl-16 pr-8 text-12/18 font-500 tracking-[-0.12px] text-body-light-muted h-16 border-r border-black/8"}>
                              {"Rule"}
                              <svg fill={"none"} height={"14"} viewBox={"0 0 14 14"} width={"14"} xmlns={"http://www.w3.org/2000/svg"}>
                                <path d={"M2.91667 1.75C2.27233 1.75 1.75 2.27233 1.75 2.91667V4.42504C1.75 4.73446 1.87292 5.03121 2.09171 5.25L5.25 8.40829V11.6999C5.25 12.5145 6.0636 13.0783 6.82631 12.7923L7.99298 12.3548C8.44833 12.184 8.75 11.7487 8.75 11.2624V8.40829L11.9083 5.25C12.1271 5.03121 12.25 4.73446 12.25 4.42504V2.91667C12.25 2.27233 11.7277 1.75 11.0833 1.75H2.91667Z"} fill={"#A4A4A4"} style={{"fill": "color(display-p3 0.6444 0.6444 0.6444)", "fillOpacity": "1"} as React.CSSProperties}></path>
                              </svg>
                            </div>
                          </td>
                          <td className={"w-148"}>
                            <div className={"flex items-center justify-between pl-16 pr-16 text-12/18 font-500 tracking-[-0.12px] text-body-light-muted border-r h-16 border-black/8"}>
                              {"Severity"}
                              <svg fill={"none"} height={"14"} viewBox={"0 0 14 14"} width={"14"} xmlns={"http://www.w3.org/2000/svg"}>
                                <path d={"M2.91667 1.75C2.27233 1.75 1.75 2.27233 1.75 2.91667V4.42504C1.75 4.73446 1.87292 5.03121 2.09171 5.25L5.25 8.40829V11.6999C5.25 12.5145 6.0636 13.0783 6.82631 12.7923L7.99298 12.3548C8.44833 12.184 8.75 11.7487 8.75 11.2624V8.40829L11.9083 5.25C12.1271 5.03121 12.25 4.73446 12.25 4.42504V2.91667C12.25 2.27233 11.7277 1.75 11.0833 1.75H2.91667Z"} fill={"#A4A4A4"} style={{"fill": "color(display-p3 0.6444 0.6444 0.6444)", "fillOpacity": "1"} as React.CSSProperties}></path>
                              </svg>
                            </div>
                          </td>
                          <td className={"w-248"}>
                            <div className={"flex justify-between items-center py-8 pl-16 text-12/18 font-500 tracking-[-0.12px] text-body-light-muted border-r h-16 border-black/8"}>
                              {"Finding"}
                            </div>
                          </td>
                          <td className={"w-288 rounded-r-8 gap-4 px-8 pl-16 text-12/18 font-500 tracking-[-0.12px] text-body-light-muted"}>
                            {"Constant"}
                          </td>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className={"border-b border-black/6"}>
                          <td>
                            <div className={"flex items-center gap-12 my-15 pl-16 text-12/18 font-400 text-body-light-loud"}>
                              <div className={"flex gap-2 items-end justify-center h-16 w-16"}>
                                <div style={{"height": "8px"} as React.CSSProperties} className={"w-3 bg-[#656565]"}></div>
                                <div style={{"height": "12px"} as React.CSSProperties} className={"w-3 bg-[#656565]"}></div>
                                <div style={{"height": "16px"} as React.CSSProperties} className={"w-3 bg-[#161616]/12"}></div>
                              </div>
                              {"Fixed"}
                            </div>
                          </td>
                          <td className={"pl-16 py-12"}>
                            <div className={"flex items-center justify-center w-max gap-6 py-3 px-9 border border-black/8 rounded-full text-12/18 font-400 text-body-light-loud"}>
                              <div className={"w-6 h-6 rounded-full bg-[#F79942]"}></div>
                              {"Critical"}
                            </div>
                          </td>
                          <td className={"text-12/18 font-400 text-body-light-loud pl-16"}>
                            {"BABE epoch duration cannot change on a running chain"}
                          </td>
                          <td>
                            <div className={"pl-16 flex items-center gap-10"}>
                              <svg fill={"none"} height={"20"} viewBox={"0 0 20 20"} width={"20"} xmlns={"http://www.w3.org/2000/svg"}>
                                <path clipRule={"evenodd"} d={"M18.3333 3.33329C18.3333 2.41282 17.5871 1.66663 16.6666 1.66663H8.33329C7.41282 1.66663 6.66663 2.41282 6.66663 3.33329V6.66663H3.33329C2.41282 6.66663 1.66663 7.41282 1.66663 8.33329V16.6666C1.66663 17.5871 2.41282 18.3333 3.33329 18.3333H11.6666C12.5871 18.3333 13.3333 17.5871 13.3333 16.6666V13.3333H16.6666C17.5871 13.3333 18.3333 12.5871 18.3333 11.6666V3.33329ZM13.3333 12.0833H16.6666C16.8967 12.0833 17.0833 11.8967 17.0833 11.6666V3.33329C17.0833 3.10317 16.8967 2.91663 16.6666 2.91663H8.33329C8.10317 2.91663 7.91663 3.10317 7.91663 3.33329V6.66663H11.6666C12.5871 6.66663 13.3333 7.41282 13.3333 8.33329V12.0833Z"} fill={"#A4A4A4"} fillRule={"evenodd"} style={{"fill": "color(display-p3 0.6444 0.6444 0.6444)", "fillOpacity": "1"} as React.CSSProperties}></path>
                              </svg>
                              <div className={"flex py-3 px-8 items-center justify-center border rounded-6 border-body-stroke-lighter bg-body-light-bg-ghost text-12/18 font-400 text-body-light-loud [&_b]:font-500 [&_b]:tracking-[-0.12px]"}>
                                {"Babe.constant."}
                                <b>
                                  {"EpochDuration"}
                                  <b></b>
                                </b>
                              </div>
                            </div>
                          </td>
                        </tr>
                        <tr className={"border-b border-black/6"}>
                          <td>
                            <div className={"flex items-center gap-12 my-15 pl-16 text-12/18 font-400 text-body-light-loud"}>
                              <div className={"flex gap-2 items-end justify-center h-16 w-16"}>
                                <div style={{"height": "8px"} as React.CSSProperties} className={"w-3 bg-[#656565]"}></div>
                                <div style={{"height": "12px"} as React.CSSProperties} className={"w-3 bg-[#656565]"}></div>
                                <div style={{"height": "16px"} as React.CSSProperties} className={"w-3 bg-[#161616]/12"}></div>
                              </div>
                              {"Fixed"}
                            </div>
                          </td>
                          <td className={"pl-16 py-12"}>
                            <div className={"flex items-center justify-center w-max gap-6 py-3 px-9 border border-black/8 rounded-full text-12/18 font-400 text-body-light-loud"}>
                              <div className={"w-6 h-6 rounded-full bg-[#F79942]"}></div>
                              {"Critical"}
                            </div>
                          </td>
                          <td className={"text-12/18 font-400 text-body-light-loud pl-16"}>
                            {"BABE slot duration cannot change on a running chain"}
                          </td>
                          <td>
                            <div className={"pl-16 flex items-center gap-10"}>
                              <svg fill={"none"} height={"20"} viewBox={"0 0 20 20"} width={"20"} xmlns={"http://www.w3.org/2000/svg"}>
                                <path clipRule={"evenodd"} d={"M18.3333 3.33329C18.3333 2.41282 17.5871 1.66663 16.6666 1.66663H8.33329C7.41282 1.66663 6.66663 2.41282 6.66663 3.33329V6.66663H3.33329C2.41282 6.66663 1.66663 7.41282 1.66663 8.33329V16.6666C1.66663 17.5871 2.41282 18.3333 3.33329 18.3333H11.6666C12.5871 18.3333 13.3333 17.5871 13.3333 16.6666V13.3333H16.6666C17.5871 13.3333 18.3333 12.5871 18.3333 11.6666V3.33329ZM13.3333 12.0833H16.6666C16.8967 12.0833 17.0833 11.8967 17.0833 11.6666V3.33329C17.0833 3.10317 16.8967 2.91663 16.6666 2.91663H8.33329C8.10317 2.91663 7.91663 3.10317 7.91663 3.33329V6.66663H11.6666C12.5871 6.66663 13.3333 7.41282 13.3333 8.33329V12.0833Z"} fill={"#A4A4A4"} fillRule={"evenodd"} style={{"fill": "color(display-p3 0.6444 0.6444 0.6444)", "fillOpacity": "1"} as React.CSSProperties}></path>
                              </svg>
                              <div className={"flex py-3 px-8 items-center justify-center border rounded-6 border-body-stroke-lighter bg-body-light-bg-ghost text-12/18 font-400 text-body-light-loud [&_b]:font-500 [&_b]:tracking-[-0.12px]"}>
                                {"Babe.constant."}
                                <b>
                                  {"EpochDuration"}
                                  <b></b>
                                </b>
                              </div>
                            </div>
                          </td>
                        </tr>
                        <tr className={"border-b border-black/6"}>
                          <td>
                            <div className={"flex items-center gap-12 my-15 pl-16 text-12/18 font-400 text-body-light-loud"}>
                              <div className={"flex gap-2 items-end justify-center h-16 w-16"}>
                                <div style={{"height": "8px"} as React.CSSProperties} className={"w-3 bg-[#656565]"}></div>
                                <div style={{"height": "12px"} as React.CSSProperties} className={"w-3 bg-[#656565]"}></div>
                                <div style={{"height": "16px"} as React.CSSProperties} className={"w-3 bg-[#161616]/12"}></div>
                              </div>
                              {"Fixed"}
                            </div>
                          </td>
                          <td className={"pl-16 py-12"}>
                            <div className={"flex items-center justify-center w-max gap-6 py-3 px-9 border border-black/8 rounded-full text-12/18 font-400 text-body-light-loud"}>
                              <div className={"w-6 h-6 rounded-full bg-[#F79942]"}></div>
                              {"Critical"}
                            </div>
                          </td>
                          <td className={"text-12/18 font-400 text-body-light-loud pl-16"}>
                            {"BABE epoch duration cannot change on a running chain"}
                          </td>
                          <td>
                            <div className={"pl-16 flex items-center gap-10"}>
                              <svg fill={"none"} height={"20"} viewBox={"0 0 20 20"} width={"20"} xmlns={"http://www.w3.org/2000/svg"}>
                                <path clipRule={"evenodd"} d={"M18.3333 3.33329C18.3333 2.41282 17.5871 1.66663 16.6666 1.66663H8.33329C7.41282 1.66663 6.66663 2.41282 6.66663 3.33329V6.66663H3.33329C2.41282 6.66663 1.66663 7.41282 1.66663 8.33329V16.6666C1.66663 17.5871 2.41282 18.3333 3.33329 18.3333H11.6666C12.5871 18.3333 13.3333 17.5871 13.3333 16.6666V13.3333H16.6666C17.5871 13.3333 18.3333 12.5871 18.3333 11.6666V3.33329ZM13.3333 12.0833H16.6666C16.8967 12.0833 17.0833 11.8967 17.0833 11.6666V3.33329C17.0833 3.10317 16.8967 2.91663 16.6666 2.91663H8.33329C8.10317 2.91663 7.91663 3.10317 7.91663 3.33329V6.66663H11.6666C12.5871 6.66663 13.3333 7.41282 13.3333 8.33329V12.0833Z"} fill={"#A4A4A4"} fillRule={"evenodd"} style={{"fill": "color(display-p3 0.6444 0.6444 0.6444)", "fillOpacity": "1"} as React.CSSProperties}></path>
                              </svg>
                              <div className={"flex py-3 px-8 items-center justify-center border rounded-6 border-body-stroke-lighter bg-body-light-bg-ghost text-12/18 font-400 text-body-light-loud [&_b]:font-500 [&_b]:tracking-[-0.12px]"}>
                                {"Babe.constant."}
                                <b>
                                  {"ExpectedBlockTime"}
                                  <b></b>
                                </b>
                              </div>
                            </div>
                          </td>
                        </tr>
                        <tr className={"border-b border-black/6"}>
                          <td>
                            <div className={"flex items-center gap-12 my-15 pl-16 text-12/18 font-400 text-body-light-loud"}>
                              <div className={"flex gap-2 items-end justify-center h-16 w-16"}>
                                <div style={{"height": "8px"} as React.CSSProperties} className={"w-3 bg-[#656565]"}></div>
                                <div style={{"height": "12px"} as React.CSSProperties} className={"w-3 bg-[#656565]"}></div>
                                <div style={{"height": "16px"} as React.CSSProperties} className={"w-3 bg-[#161616]/12"}></div>
                              </div>
                              {"Fixed"}
                            </div>
                          </td>
                          <td className={"pl-16 py-12"}>
                            <div className={"flex items-center justify-center w-max gap-6 py-3 px-9 border border-black/8 rounded-full text-12/18 font-400 text-body-light-loud"}>
                              <div className={"w-6 h-6 rounded-full bg-[#F79942]"}></div>
                              {"Critical"}
                            </div>
                          </td>
                          <td className={"text-12/18 font-400 text-body-light-loud pl-16"}>
                            {"BABE slot duration cannot change on a running chain"}
                          </td>
                          <td>
                            <div className={"pl-16 flex items-center gap-10"}>
                              <svg fill={"none"} height={"20"} viewBox={"0 0 20 20"} width={"20"} xmlns={"http://www.w3.org/2000/svg"}>
                                <path clipRule={"evenodd"} d={"M18.3333 3.33329C18.3333 2.41282 17.5871 1.66663 16.6666 1.66663H8.33329C7.41282 1.66663 6.66663 2.41282 6.66663 3.33329V6.66663H3.33329C2.41282 6.66663 1.66663 7.41282 1.66663 8.33329V16.6666C1.66663 17.5871 2.41282 18.3333 3.33329 18.3333H11.6666C12.5871 18.3333 13.3333 17.5871 13.3333 16.6666V13.3333H16.6666C17.5871 13.3333 18.3333 12.5871 18.3333 11.6666V3.33329ZM13.3333 12.0833H16.6666C16.8967 12.0833 17.0833 11.8967 17.0833 11.6666V3.33329C17.0833 3.10317 16.8967 2.91663 16.6666 2.91663H8.33329C8.10317 2.91663 7.91663 3.10317 7.91663 3.33329V6.66663H11.6666C12.5871 6.66663 13.3333 7.41282 13.3333 8.33329V12.0833Z"} fill={"#A4A4A4"} fillRule={"evenodd"} style={{"fill": "color(display-p3 0.6444 0.6444 0.6444)", "fillOpacity": "1"} as React.CSSProperties}></path>
                              </svg>
                              <div className={"flex py-3 px-8 items-center justify-center border rounded-6 border-body-stroke-lighter bg-body-light-bg-ghost text-12/18 font-400 text-body-light-loud [&_b]:font-500 [&_b]:tracking-[-0.12px]"}>
                                {"Babe.constant."}
                                <b>
                                  {"EpochDuration"}
                                  <b></b>
                                </b>
                              </div>
                            </div>
                          </td>
                        </tr>
                        <tr className={"border-b border-black/6"}>
                          <td>
                            <div className={"flex items-center gap-12 my-15 pl-16 text-12/18 font-400 text-body-light-loud"}>
                              <div className={"flex gap-2 items-end justify-center h-16 w-16"}>
                                <div style={{"height": "8px"} as React.CSSProperties} className={"w-3 bg-[#656565]"}></div>
                                <div style={{"height": "12px"} as React.CSSProperties} className={"w-3 bg-[#161616]/12"}></div>
                                <div style={{"height": "16px"} as React.CSSProperties} className={"w-3 bg-[#161616]/12"}></div>
                              </div>
                              {"Linked"}
                            </div>
                          </td>
                          <td className={"pl-16 py-12"}>
                            <div className={"flex items-center justify-center w-max gap-6 py-3 px-9 border border-black/8 rounded-full text-12/18 font-400 text-body-light-loud"}>
                              <div className={"w-6 h-6 rounded-full bg-[#F79942]"}></div>
                              {"Critical"}
                            </div>
                          </td>
                          <td className={"text-12/18 font-400 text-body-light-loud pl-16"}>
                            {"The timestamp period is tied to the BABE slot"}
                          </td>
                          <td>
                            <div className={"pl-16 flex items-center gap-10"}>
                              <svg fill={"none"} height={"20"} viewBox={"0 0 20 20"} width={"20"} xmlns={"http://www.w3.org/2000/svg"}>
                                <path clipRule={"evenodd"} d={"M18.3333 3.33329C18.3333 2.41282 17.5871 1.66663 16.6666 1.66663H8.33329C7.41282 1.66663 6.66663 2.41282 6.66663 3.33329V6.66663H3.33329C2.41282 6.66663 1.66663 7.41282 1.66663 8.33329V16.6666C1.66663 17.5871 2.41282 18.3333 3.33329 18.3333H11.6666C12.5871 18.3333 13.3333 17.5871 13.3333 16.6666V13.3333H16.6666C17.5871 13.3333 18.3333 12.5871 18.3333 11.6666V3.33329ZM13.3333 12.0833H16.6666C16.8967 12.0833 17.0833 11.8967 17.0833 11.6666V3.33329C17.0833 3.10317 16.8967 2.91663 16.6666 2.91663H8.33329C8.10317 2.91663 7.91663 3.10317 7.91663 3.33329V6.66663H11.6666C12.5871 6.66663 13.3333 7.41282 13.3333 8.33329V12.0833Z"} fill={"#A4A4A4"} fillRule={"evenodd"} style={{"fill": "color(display-p3 0.6444 0.6444 0.6444)", "fillOpacity": "1"} as React.CSSProperties}></path>
                              </svg>
                              <div className={"flex py-3 px-8 items-center justify-center border rounded-6 border-body-stroke-lighter bg-body-light-bg-ghost text-12/18 font-400 text-body-light-loud [&_b]:font-500 [&_b]:tracking-[-0.12px]"}>
                                {"Timestamp.constant."}
                                <b>
                                  {"MinimumPeriod"}
                                  <b></b>
                                </b>
                              </div>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div className={"flex items-center py-64 px-40 gap-40 justify-center"}>
                    <div className={"h-1 bg-[#F1F1F1] flex-1 max-w-325"}></div>
                    <svg fill={"none"} height={"15"} viewBox={"0 0 14 15"} width={"14"} xmlns={"http://www.w3.org/2000/svg"}>
                      <path clipRule={"evenodd"} d={"M0.14 5.26 L5.81 5.26 L5.81 4.14 L0.14 4.14ZM5.495 5.456 L7.616 1.305 L6.615 0.794 L4.494 4.945ZM6.139 1.221 L8.911 8.571 L9.961 8.179 L7.189 0.829ZM9.527 8.592 L11.382 4.413 L10.353 3.958 L8.498 8.137ZM10.08 5.26 L13.86 5.26 L13.86 4.14 L10.08 4.14ZM0.14 11.56 L5.81 11.56 L5.81 10.44 L0.14 10.44ZM5.327 11.791 L7.651 8.963 L6.783 8.249 L4.459 11.077ZM6.076 8.949 L8.309 11.784 L9.184 11.091 L6.951 8.256ZM7.84 11.56 L13.86 11.56 L13.86 10.44 L7.84 10.44Z"} fill={"#EBEBEB"} fillRule={"evenodd"} style={{"fill": "color(display-p3 0.9200 0.9200 0.9200)", "fillOpacity": "1"} as React.CSSProperties}></path>
                    </svg>
                    <div className={"h-1 bg-[#F1F1F1] flex-1 max-w-325"}></div>
                  </div>
                  <div id={"build-logging"}>
                    <div className={"flex justify-between"}>
                      <div className={"flex items-center gap-6 mb-32 text-14/22 font-500 tracking-[-0.14px] text-body-light-loud"}>
                        <img alt={""} decoding={"async"} height={"20"} loading={"lazy"} src={"/assets/images/features/dashboard/logging/check.png"} style={{} as React.CSSProperties} width={"20"} className={"lazy-image opacity-0"} />
                        {"Upgrade log"}
                        <svg fill={"none"} height={"16"} viewBox={"0 0 16 16"} width={"16"} xmlns={"http://www.w3.org/2000/svg"}>
                          <path clipRule={"evenodd"} d={"M8.00004 1.33325C4.31814 1.33325 1.33337 4.31802 1.33337 7.99992C1.33337 11.6818 4.31814 14.6666 8.00004 14.6666C11.6819 14.6666 14.6667 11.6818 14.6667 7.99992C14.6667 4.31802 11.6819 1.33325 8.00004 1.33325ZM8.00005 5.99992C7.7485 5.99992 7.52846 6.13898 7.41436 6.3476C7.23768 6.67062 6.83258 6.78926 6.50956 6.61258C6.18653 6.43589 6.06789 6.0308 6.24457 5.70777C6.58313 5.08879 7.2418 4.66659 8.00005 4.66659C9.00988 4.66659 9.7113 5.33754 9.91101 6.12592C10.1118 6.91849 9.80676 7.84192 8.89447 8.29806C8.75489 8.36785 8.66671 8.51052 8.66671 8.66659C8.66671 9.03477 8.36824 9.33325 8.00005 9.33325C7.63186 9.33325 7.33338 9.03477 7.33338 8.66659C7.33338 8.00549 7.70689 7.40114 8.29819 7.10549C8.60135 6.95391 8.67922 6.69308 8.61849 6.45332C8.5567 6.20937 8.35226 5.99992 8.00005 5.99992ZM8.00004 11.3333C8.36823 11.3333 8.66671 11.0348 8.66671 10.6666C8.66671 10.2984 8.36823 9.99992 8.00004 9.99992C7.63185 9.99992 7.33337 10.2984 7.33337 10.6666C7.33337 11.0348 7.63185 11.3333 8.00004 11.3333Z"} fill={"#B8B8B8"} fillRule={"evenodd"} style={{"fill": "color(display-p3 0.7200 0.7200 0.7200)", "fillOpacity": "1"} as React.CSSProperties}></path>
                        </svg>
                      </div>
                      <svg fill={"none"} height={"20"} viewBox={"0 0 20 20"} width={"20"} xmlns={"http://www.w3.org/2000/svg"}>
                        <path d={"M13.3333 11.6667L10.2945 8.62804C10.1318 8.46532 9.86801 8.46532 9.70529 8.62804L6.66659 11.6667"} stroke={"#A4A4A4"} strokeLinecap={"round"} strokeLinejoin={"round"} strokeWidth={"1.5"} style={{"stroke": "color(display-p3 0.6444 0.6444 0.6444)", "strokeOpacity": "1"} as React.CSSProperties}></path>
                      </svg>
                    </div>
                    <div className={"border border-black/4 rounded-8"}>
                      <div className={"flex justify-between items-center gap-6 py-8 px-10 bg-black/4 rounded-t-8"}>
                        <div className={"flex items-center gap-6 text-12/18 font-500 tracking-[-0.12px] text-body-light-loud"}>
                          <svg fill={"none"} height={"20"} viewBox={"0 0 20 20"} width={"20"} xmlns={"http://www.w3.org/2000/svg"}>
                            <path d={"M13.3334 8.33325L10.2947 11.372C10.1319 11.5347 9.86813 11.5347 9.70541 11.372L6.66671 8.33325"} stroke={"#A4A4A4"} strokeLinecap={"round"} strokeLinejoin={"round"} strokeWidth={"1.5"} style={{"stroke": "color(display-p3 0.6444 0.6444 0.6444)", "strokeOpacity": "1"} as React.CSSProperties}></path>
                          </svg>
                          <svg fill={"none"} height={"20"} viewBox={"0 0 20 20"} width={"20"} xmlns={"http://www.w3.org/2000/svg"}>
                            <path d={"M9.703 4.149 14.268 6.716 v5.136 L9.703 14.42 5.137 11.852 v-5.136 L9.703 4.149Zm0 1.312 L6.279 7.401 v3.766 l3.424 1.94 3.424 -1.94 V7.401 l-3.424 -1.94ZM7.762 7.515 h3.88 v0.913 H7.762 V7.515Zm0 1.655 h3.88 v0.913 H7.762 V9.17Zm0 1.655 h3.88 v0.913 H7.762 v-0.913Z"} fill={"#141414"} style={{"fill": "color(display-p3 0.0800 0.0800 0.0800)", "fillOpacity": "1"} as React.CSSProperties}></path>
                          </svg>
                          {"V3"}
                        </div>
                        <svg fill={"none"} height={"10"} viewBox={"0 0 10 10"} width={"10"} xmlns={"http://www.w3.org/2000/svg"}>
                          <g clipPath={"url(#clip0_44_642)"}>
                            <path d={"M1.14575 6.28906L3.74992 8.4375L8.85409 1.5625"} stroke={"#2DBA7F"} strokeLinecap={"round"} strokeLinejoin={"round"} strokeWidth={"1.5"} style={{"stroke": "color(display-p3 0.1781 0.7305 0.4985)", "strokeOpacity": "1"} as React.CSSProperties}></path>
                          </g>
                          <defs>
                            <clipPath id={"clip0_44_642"}>
                              <rect fill={"white"} height={"10"} style={{"fill": "white", "fillOpacity": "1"} as React.CSSProperties} width={"10"}></rect>
                            </clipPath>
                          </defs>
                        </svg>
                      </div>
                      <div className={"flex py-20 px-24 items-center gap-6 text-10/24 font-500 tracking-[-0.1px] text-body-light-loud"}>
                        <pre>
                          {"$ canary upgrade --ws ws://127.0.0.1:9945 --wasm runtimes/out/ed100x.compact.wasm\nbefore     spec_version 1002\nevents     system.CodeUpdated, sudo.Sudid, system.ExtrinsicSuccess\nafter      spec_version 1004\nliveness   ok (#9 -> #12 under the new runtime)\n\n$ canary compare --baseline ws://127.0.0.1:9944 --candidate ws://127.0.0.1:9945\n~ Balances.constant.ExistentialDeposit\n    baseline:  T::Balance = 100000000000000\n    candidate: T::Balance = 10000000000000000\n\n$ canary test --baseline ws://127.0.0.1:9944 --candidate ws://127.0.0.1:9945 --injected \"ed100x\"\nPASS          Info      balances.keep_alive\nREGRESSION    High      balances.transfer.basic\n    step 0 dispatch success  baseline: success  candidate: failed (balances.ExistentialDeposit)\n    delta receiver.free      baseline: +100000000000000  candidate: +0\nPASS          Info      balances.transfer.insufficient\nPASS          Info      identity.deposit\n\n$ canary upgrade --ws ws://127.0.0.1:9946 --wasm runtimes/out/source-60s.compact.wasm --timeout 40\nafter      spec_version 1003\nliveness   HALTED: best block stuck at #85 for 40s after the upgrade (needed #88)\nverdict    REGRESSION Critical: runtime accepted by setCode but block production stopped\nnode log:  panicked at 'Timestamp slot must match `CurrentSlot`'"}
                        </pre>
                      </div>
                      <div className={"flex py-8 px-10 justify-between items-center bg-black/4"}>
                        <div className={"flex items-center gap-6 text-12/18 font-500 tracking-[-0.12px] text-body-light-loud"}>
                          <svg fill={"none"} height={"20"} viewBox={"0 0 20 20"} width={"20"} xmlns={"http://www.w3.org/2000/svg"}>
                            <path d={"M8.33337 6.66675L11.3721 9.70545C11.5348 9.86817 11.5348 10.132 11.3721 10.2947L8.33337 13.3334"} stroke={"#A4A4A4"} strokeLinecap={"round"} strokeLinejoin={"round"} strokeWidth={"1.5"} style={{"stroke": "color(display-p3 0.6444 0.6444 0.6444)", "strokeOpacity": "1"} as React.CSSProperties}></path>
                          </svg>
                          <svg fill={"none"} height={"20"} viewBox={"0 0 20 20"} width={"20"} xmlns={"http://www.w3.org/2000/svg"}>
                            <path d={"M5.523 5.201 h8.96 a0.64 0.64 0 0 1 0.64 0.64 v2.24 a0.64 0.64 0 0 1 -0.64 0.64 H5.523 a0.64 0.64 0 0 1 -0.64 -0.64 V5.841 a0.64 0.64 0 0 1 0.64 -0.64Zm0 4.48 h8.96 a0.64 0.64 0 0 1 0.64 0.64 V12.561 a0.64 0.64 0 0 1 -0.64 0.64 H5.523 a0.64 0.64 0 0 1 -0.64 -0.64 v-2.24 a0.64 0.64 0 0 1 0.64 -0.64ZM6.803 6.417 a0.576 0.576 0 1 0 0 1.152 0.576 0.576 0 0 0 0 -1.152Zm0 4.48 a0.576 0.576 0 1 0 0 1.152 0.576 0.576 0 0 0 0 -1.152ZM4.883 14.161 h10.24 V15.121 H4.883 v-0.96Z"} fill={"#656565"} style={{"fill": "color(display-p3 0.3961 0.3961 0.3961)", "fillOpacity": "1"} as React.CSSProperties}></path>
                          </svg>
                          {"Mainnet"}
                        </div>
                        <svg fill={"none"} height={"10"} viewBox={"0 0 10 10"} width={"10"} xmlns={"http://www.w3.org/2000/svg"}>
                          <g clipPath={"url(#clip0_44_642)"}>
                            <path d={"M1.14575 6.28906L3.74992 8.4375L8.85409 1.5625"} stroke={"#2DBA7F"} strokeLinecap={"round"} strokeLinejoin={"round"} strokeWidth={"1.5"} style={{"stroke": "color(display-p3 0.1781 0.7305 0.4985)", "strokeOpacity": "1"} as React.CSSProperties}></path>
                          </g>
                          <defs>
                            <clipPath id={"clip0_44_642"}>
                              <rect fill={"white"} height={"10"} style={{"fill": "white", "fillOpacity": "1"} as React.CSSProperties} width={"10"}></rect>
                            </clipPath>
                          </defs>
                        </svg>
                      </div>
                      <div className={"flex py-8 px-10 justify-between items-center bg-black/4 rounded-b-8"}>
                        <div className={"flex items-center gap-6 text-12/18 font-500 tracking-[-0.12px] text-body-light-loud"}>
                          <svg fill={"none"} height={"20"} viewBox={"0 0 20 20"} width={"20"} xmlns={"http://www.w3.org/2000/svg"}>
                            <path d={"M8.33337 6.66675L11.3721 9.70545C11.5348 9.86817 11.5348 10.132 11.3721 10.2947L8.33337 13.3334"} stroke={"#A4A4A4"} strokeLinecap={"round"} strokeLinejoin={"round"} strokeWidth={"1.5"} style={{"stroke": "color(display-p3 0.6444 0.6444 0.6444)", "strokeOpacity": "1"} as React.CSSProperties}></path>
                          </svg>
                          <svg fill={"none"} height={"20"} viewBox={"0 0 20 20"} width={"20"} xmlns={"http://www.w3.org/2000/svg"}>
                            <path d={"M5.376 5.983 a0.577 0.577 0 0 1 0.577 -0.577 h8.079 a0.577 0.577 0 0 1 0.577 0.577 v5.771 a0.577 0.577 0 0 1 -0.577 0.577 h-3.03 v1.154 H12.301 a0.433 0.433 0 0 1 0 0.866 H7.684 A0.433 0.433 0 0 1 7.684 13.485 h1.298 v-1.154 H5.953 a0.577 0.577 0 0 1 -0.577 -0.577 V5.983Zm0.923 0.346 v5.078 h7.387 V6.329 H6.299Zm1.327 1.27 1.5 1.27 -1.5 1.27 -0.519 -0.635 0.75 -0.635 -0.75 -0.635 0.519 -0.635Zm2.078 2.02 h2.424 v0.808 H9.704 V9.618Z"} fill={"#656565"} style={{"fill": "color(display-p3 0.3961 0.3961 0.3961)", "fillOpacity": "1"} as React.CSSProperties}></path>
                          </svg>
                          {"Dev node"}
                        </div>
                        <svg fill={"none"} height={"10"} viewBox={"0 0 10 10"} width={"10"} xmlns={"http://www.w3.org/2000/svg"}>
                          <g clipPath={"url(#clip0_44_642)"}>
                            <path d={"M1.14575 6.28906L3.74992 8.4375L8.85409 1.5625"} stroke={"#2DBA7F"} strokeLinecap={"round"} strokeLinejoin={"round"} strokeWidth={"1.5"} style={{"stroke": "color(display-p3 0.1781 0.7305 0.4985)", "strokeOpacity": "1"} as React.CSSProperties}></path>
                          </g>
                          <defs>
                            <clipPath id={"clip0_44_642"}>
                              <rect fill={"white"} height={"10"} style={{"fill": "white", "fillOpacity": "1"} as React.CSSProperties} width={"10"}></rect>
                            </clipPath>
                          </defs>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className={"full-width absolute bottom-0 md-max:hidden left-0 pb-32 pt-186 features-dashboard-mouse transition-all"} {...b("hint", 0, "full-width absolute bottom-0 md-max:hidden left-0 pb-32 pt-186 features-dashboard-mouse transition-all")}>
              <div className={"absolute inset-0 bg-white features-dashboard-mouse-mask"}></div>
              <div className={"py-6 w-max pr-14 pl-10 relative rounded-full mx-auto bg-body-light-bg-ghost flex gap-6 items-center"}>
                <svg fill={"none"} height={"16"} viewBox={"0 0 16 16"} width={"16"} xmlns={"http://www.w3.org/2000/svg"}>
                  <path clipRule={"evenodd"} d={"M4 4C4 1.79086 5.79086 0 8 0C10.2091 0 12 1.79086 12 4V7.33333C12 9.54247 10.2091 11.3333 8 11.3333C5.79086 11.3333 4 9.54247 4 7.33333V4ZM8.66667 3.33333C8.66667 2.96514 8.36819 2.66667 8 2.66667C7.63181 2.66667 7.33333 2.96514 7.33333 3.33333V4.66667C7.33333 5.03486 7.63181 5.33333 8 5.33333C8.36819 5.33333 8.66667 5.03486 8.66667 4.66667V3.33333Z"} fill={"#656565"} fillRule={"evenodd"} style={{"fill": "color(display-p3 0.3961 0.3961 0.3961)", "fillOpacity": "1"} as React.CSSProperties}></path>
                  <path clipRule={"evenodd"} d={"M5.44505 13.2969C5.64928 12.9906 6.06319 12.9078 6.36955 13.112L7.62995 13.9523C7.85388 14.1016 8.14561 14.1016 8.36955 13.9523L9.62994 13.112C9.9363 12.9078 10.3502 12.9906 10.5544 13.2969C10.7587 13.6033 10.6759 14.0172 10.3695 14.2214L9.10915 15.0617C8.43735 15.5096 7.56214 15.5096 6.89034 15.0617L5.62995 14.2214C5.32359 14.0172 5.24081 13.6033 5.44505 13.2969Z"} fill={"#656565"} fillRule={"evenodd"} style={{"fill": "color(display-p3 0.3961 0.3961 0.3961)", "fillOpacity": "1"} as React.CSSProperties}></path>
                </svg>
                <span className={"text-label-small text-body-light-loud"}>
                  {"Scroll to explore a recorded run"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
