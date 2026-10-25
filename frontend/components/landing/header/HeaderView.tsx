// Generated from the landing markup by landing-port/gen.py (views.json). Do not edit by hand.
import type { Bind, Kids } from "@/components/landing/bind";
import HeaderPanel from "@/components/landing/header/HeaderPanel";

export default function HeaderView({ b, k }: { b: Bind; k: Kids }) {
  return (
    <div className={"header absolute left-0 w-full top-0 md:top-24 z-[3000]"} {...b("root", 0, "header absolute left-0 w-full top-0 md:top-24 z-[3000]")}>
      <header className={"header-inner w-full max-w-[1128px] mx-auto py-22 md:pt-34 md:pb-26 px-24 md:px-16 rounded-full"} {...b("inner", 0, "header-inner w-full max-w-[1128px] mx-auto py-22 md:pt-34 md:pb-26 px-24 md:px-16 rounded-full")}>
        <div className={"flex items-center justify-between"}>
          <div className={"w-128 header-logo overflow-hidden relative"}>
            <a href={"/"} className={"flex gap-14 items-center cursor-pointer relative z-10 w-max"}>
              <div className={"p-2"}>
                <img alt={"Portal Canary"} decoding={"async"} fetchPriority={"low"} height={"32"} src={"/assets/images/header/logo.png"} style={{"boxShadow": "0px 1.5px 2px -0.75px rgba(4, 8, 34, 0.06), 0px 1px 1.5px -0.5px rgba(3, 8, 35, 0.12), 0px 0.5px 0.75px -0.25px rgba(3, 8, 35, 0.12), 0px 0.25px 0.5px -0.125px rgba(3, 8, 35, 0.12), 0px 0.125px 0.25px -0.062px rgba(3, 8, 35, 0.12), 0px 0.062px 0.125px 0px rgba(0, 0, 0, 0.12)"} as React.CSSProperties} width={"32"} className={"rounded-6"} />
              </div>
              <span className={"text-[#fff]/70 text-14/15 font-500 -tracking-[0.14px]"}>
                {"Portal Canary"}
              </span>
            </a>
          </div>
          <nav className={"md-max:flex md:flex-1 md-max:transition-all md-max:flex-col header-nav md-max:px-24 md-max:pt-88 md-max:pb-32 relative md-max:w-screen md-max:absolute md-max:h-screen md-max:top-0 md-max:left-0 md-max:opacity-0 md-max:pointer-events-none md-max:!full-width"} {...b("nav", 0, "md-max:flex md:flex-1 md-max:transition-all md-max:flex-col header-nav md-max:px-24 md-max:pt-88 md-max:pb-32 relative md-max:w-screen md-max:absolute md-max:h-screen md-max:top-0 md-max:left-0 md-max:opacity-0 md-max:pointer-events-none md-max:!full-width")}>
            <div className={"header-nav-list md:w-max gap-8 mx-auto md-max:flex-1 md-max:w-full md-max:flex-col flex text-28/36 md:text-14/20"} {...b("list", 0, "header-nav-list md:w-max gap-8 mx-auto md-max:flex-1 md-max:w-full md-max:flex-col flex text-28/36 md:text-14/20")}>
              <div className={"h-36 header-nav-item-background opacity-0 pointer-events-none bg-white/6 absolute top-0 left-0 rounded-full"} {...b("pill", 0, "h-36 header-nav-item-background opacity-0 pointer-events-none bg-white/6 absolute top-0 left-0 rounded-full")}></div>
              <button aria-controls={"mobile-products-panel"} aria-expanded={"false"} type={"button"} className={"px-20 py-8 md:px-12 md:hidden delay-[var(--delay-on-mobile)] text-white/72 flex justify-between items-center md-max:font-500 md-max:font-title hover:text-white transition-all rounded-25 duration-200 header-nav-item md-max:-translate-x-32 md-max:blur-[2px] md-max:opacity-0 !delay-[0s]"} {...b("mTools", 0, "px-20 py-8 md:px-12 md:hidden delay-[var(--delay-on-mobile)] text-white/72 flex justify-between items-center md-max:font-500 md-max:font-title hover:text-white transition-all rounded-25 duration-200 header-nav-item md-max:-translate-x-32 md-max:blur-[2px] md-max:opacity-0 !delay-[0s]")}>
                {"Tools"}
                <svg fill={"none"} height={"24"} viewBox={"0 0 24 24"} width={"24"} className={"md:hidden transition-transform duration-6 rotate-0"} xmlns={"http://www.w3.org/2000/svg"} {...b("mToolsIcon", 0, "md:hidden transition-transform duration-6 rotate-0")}>
                  <path fill={"white"} style={{"fill": "white", "fillOpacity": "1"} as React.CSSProperties} clipRule={"evenodd"} d={"M9.29289 7.29289C9.68342 6.90237 10.3166 6.90237 10.7071 7.29289L13.6464 10.2322C14.6228 11.2085 14.6228 12.7915 13.6464 13.7678L10.7071 16.7071C10.3166 17.0976 9.68342 17.0976 9.29289 16.7071C8.90237 16.3166 8.90237 15.6834 9.29289 15.2929L12.2322 12.3536C12.4275 12.1583 12.4275 11.8417 12.2322 11.6464L9.29289 8.70711C8.90237 8.31658 8.90237 7.68342 9.29289 7.29289Z"} fillRule={"evenodd"}></path>
                </svg>
              </button>
              <div aria-hidden={"true"} id={"mobile-products-panel"} role={"menu"} className={"md:hidden overflow-hidden transition-all duration-6 hidden"} {...b("mPanel", 0, "md:hidden overflow-hidden transition-all duration-6 hidden")}>
                <div className={"flex flex-col"}>
                  <a href={"https://github.com/Venkat5599/PRT#readme"} className={"mt-6 flex justify-between gap-12 rounded-12 px-12 py-10 hover:bg-white/6 items-start"} target={"_blank"} rel={"noopener"}>
                    <img src={"/assets/images-original/nav/cli.png"} srcSet={"/assets/images-original/nav/cli.png 1x, /assets/images-original/nav/cli@2x.png 2x, /assets/images-original/nav/cli@3x.png 3x"} alt={""} aria-hidden={"true"} decoding={"async"} height={"36"} width={"36"} className={"h-36 w-36 flex-shrink-0"} />
                    <div className={"min-w-0 flex-1"}>
                      <div className={"text-14/20 font-600 text-white/90 truncate"}>
                        {"Canary CLI"}
                      </div>
                      <div className={"mt-4 text-12/18 text-white/60 truncate"}>
                        {"Doctor, compare, invariants, test and upgrade from one Rust binary. Exits non-zero when an upgrade would break something."}
                      </div>
                    </div>
                    <svg fill={"none"} height={"24"} viewBox={"0 0 24 24"} width={"24"} className={"opacity-50 shrink-0 mt-6"} xmlns={"http://www.w3.org/2000/svg"}>
                      <path fill={"white"} style={{"fill": "white", "fillOpacity": "1"} as React.CSSProperties} clipRule={"evenodd"} d={"M9.29289 7.29289C9.68342 6.90237 10.3166 6.90237 10.7071 7.29289L13.6464 10.2322C14.6228 11.2085 14.6228 12.7915 13.6464 13.7678L10.7071 16.7071C10.3166 17.0976 9.68342 17.0976 9.29289 16.7071C8.90237 16.3166 8.90237 15.6834 9.29289 15.2929L12.2322 12.3536C12.4275 12.1583 12.4275 11.8417 12.2322 11.6464L9.29289 8.70711C8.90237 8.31658 8.90237 7.68342 9.29289 7.29289Z"} fillRule={"evenodd"}></path>
                    </svg>
                  </a>
                  <a href={"/dashboard#compare"} className={"mt-6 flex justify-between gap-12 rounded-12 px-12 py-10 hover:bg-white/6 items-start"}>
                    <img src={"/assets/images-original/nav/dashboard.png"} srcSet={"/assets/images-original/nav/dashboard.png 1x, /assets/images-original/nav/dashboard@2x.png 2x, /assets/images-original/nav/dashboard@3x.png 3x"} alt={""} aria-hidden={"true"} decoding={"async"} height={"36"} width={"36"} className={"h-36 w-36 flex-shrink-0"} />
                    <div className={"min-w-0 flex-1"}>
                      <div className={"text-14/20 font-600 text-white/90 truncate"}>
                        {"Browser dashboard"}
                      </div>
                      <div className={"mt-4 text-12/18 text-white/60 truncate"}>
                        {"The same engine compiled to WebAssembly. Diff two live Portaldot runtimes with nothing to install."}
                      </div>
                    </div>
                    <svg fill={"none"} height={"24"} viewBox={"0 0 24 24"} width={"24"} className={"opacity-50 shrink-0 mt-6"} xmlns={"http://www.w3.org/2000/svg"}>
                      <path fill={"white"} style={{"fill": "white", "fillOpacity": "1"} as React.CSSProperties} clipRule={"evenodd"} d={"M9.29289 7.29289C9.68342 6.90237 10.3166 6.90237 10.7071 7.29289L13.6464 10.2322C14.6228 11.2085 14.6228 12.7915 13.6464 13.7678L10.7071 16.7071C10.3166 17.0976 9.68342 17.0976 9.29289 16.7071C8.90237 16.3166 8.90237 15.6834 9.29289 15.2929L12.2322 12.3536C12.4275 12.1583 12.4275 11.8417 12.2322 11.6464L9.29289 8.70711C8.90237 8.31658 8.90237 7.68342 9.29289 7.29289Z"} fillRule={"evenodd"}></path>
                    </svg>
                  </a>
                  <a href={"/dashboard#compare"} className={"mt-6 flex justify-between gap-12 rounded-12 px-12 py-10 hover:bg-white/6 items-center"}>
                    <img src={"/assets/images-original/nav/compare.png"} srcSet={"/assets/images-original/nav/compare.png 1x, /assets/images-original/nav/compare@2x.png 2x, /assets/images-original/nav/compare@3x.png 3x"} alt={""} aria-hidden={"true"} decoding={"async"} height={"36"} width={"36"} className={"h-36 w-36 flex-shrink-0"} />
                    <div className={"min-w-0 flex-1"}>
                      <div className={"text-14/20 font-600 text-white/90 truncate"}>
                        {"Live compare"}
                      </div>
                    </div>
                    <svg fill={"none"} height={"24"} viewBox={"0 0 24 24"} width={"24"} className={"opacity-50 shrink-0"} xmlns={"http://www.w3.org/2000/svg"}>
                      <path fill={"white"} style={{"fill": "white", "fillOpacity": "1"} as React.CSSProperties} clipRule={"evenodd"} d={"M9.29289 7.29289C9.68342 6.90237 10.3166 6.90237 10.7071 7.29289L13.6464 10.2322C14.6228 11.2085 14.6228 12.7915 13.6464 13.7678L10.7071 16.7071C10.3166 17.0976 9.68342 17.0976 9.29289 16.7071C8.90237 16.3166 8.90237 15.6834 9.29289 15.2929L12.2322 12.3536C12.4275 12.1583 12.4275 11.8417 12.2322 11.6464L9.29289 8.70711C8.90237 8.31658 8.90237 7.68342 9.29289 7.29289Z"} fillRule={"evenodd"}></path>
                    </svg>
                  </a>
                </div>
              </div>
              <div aria-expanded={"false"} aria-haspopup={"menu"} className={"relative md:block hidden flex items-center gap-6 md-max:font-500 md-max:font-title transition-all rounded-25 duration-200 header-nav-item group px-20 py-8 md:px-12 text-white/72 hover:text-white"} {...b("tools", 0, "relative md:block hidden flex items-center gap-6 md-max:font-500 md-max:font-title transition-all rounded-25 duration-200 header-nav-item group px-20 py-8 md:px-12 text-white/72 hover:text-white")}>
                <span className={"inline-flex items-center gap-6 whitespace-nowrap align-middle pl-5"}>
                  <span>
                    {"Tools"}
                  </span>
                  <svg fill={"none"} height={"24"} viewBox={"0 0 24 24"} width={"24"} color={"white"} className={"h-20 w-20 transition-transform duration-6 md:block hidden rotate-90 opacity-50 group-hover:opacity-100"} xmlns={"http://www.w3.org/2000/svg"} {...b("toolsIcon", 0, "h-20 w-20 transition-transform duration-6 md:block hidden rotate-90 opacity-50 group-hover:opacity-100")}>
                    <path fill={"white"} style={{"fill": "white", "fillOpacity": "1"} as React.CSSProperties} clipRule={"evenodd"} d={"M9.29289 7.29289C9.68342 6.90237 10.3166 6.90237 10.7071 7.29289L13.6464 10.2322C14.6228 11.2085 14.6228 12.7915 13.6464 13.7678L10.7071 16.7071C10.3166 17.0976 9.68342 17.0976 9.29289 16.7071C8.90237 16.3166 8.90237 15.6834 9.29289 15.2929L12.2322 12.3536C12.4275 12.1583 12.4275 11.8417 12.2322 11.6464L9.29289 8.70711C8.90237 8.31658 8.90237 7.68342 9.29289 7.29289Z"} fillRule={"evenodd"} {...b("toolsIconPath", 0, "")}></path>
                  </svg>
                </span>
                <HeaderPanel {...(b("panel", 0, "") as object)} />
              </div>
              <a href={"https://github.com/Venkat5599/PRT#readme"} style={{"--delay-on-mobile": "0ms"} as React.CSSProperties} className={"px-20 py-8 md:px-12 delay-[var(--delay-on-mobile)] text-white/72 flex justify-between items-center md-max:font-500 md-max:font-title hover:text-white transition-all rounded-25 duration-200 header-nav-item md-max:-translate-x-32 md-max:blur-[2px] md-max:opacity-0 !delay-[0s]"} target={"_blank"} rel={"noopener"} {...b("link", 0, "px-20 py-8 md:px-12 delay-[var(--delay-on-mobile)] text-white/72 flex justify-between items-center md-max:font-500 md-max:font-title hover:text-white transition-all rounded-25 duration-200 header-nav-item md-max:-translate-x-32 md-max:blur-[2px] md-max:opacity-0 !delay-[0s]")}>
                {"Docs"}
                <svg fill={"none"} height={"24"} viewBox={"0 0 24 24"} width={"24"} className={"md:hidden"} xmlns={"http://www.w3.org/2000/svg"}>
                  <path fill={"white"} style={{"fill": "white", "fillOpacity": "1"} as React.CSSProperties} clipRule={"evenodd"} d={"M9.29289 7.29289C9.68342 6.90237 10.3166 6.90237 10.7071 7.29289L13.6464 10.2322C14.6228 11.2085 14.6228 12.7915 13.6464 13.7678L10.7071 16.7071C10.3166 17.0976 9.68342 17.0976 9.29289 16.7071C8.90237 16.3166 8.90237 15.6834 9.29289 15.2929L12.2322 12.3536C12.4275 12.1583 12.4275 11.8417 12.2322 11.6464L9.29289 8.70711C8.90237 8.31658 8.90237 7.68342 9.29289 7.29289Z"} fillRule={"evenodd"}></path>
                </svg>
              </a>
              <a href={"/dashboard#runs"} style={{"--delay-on-mobile": "50ms"} as React.CSSProperties} className={"px-20 py-8 md:px-12 delay-[var(--delay-on-mobile)] text-white/72 flex justify-between items-center md-max:font-500 md-max:font-title hover:text-white transition-all rounded-25 duration-200 header-nav-item md-max:-translate-x-32 md-max:blur-[2px] md-max:opacity-0 !delay-[0s]"} {...b("link", 1, "px-20 py-8 md:px-12 delay-[var(--delay-on-mobile)] text-white/72 flex justify-between items-center md-max:font-500 md-max:font-title hover:text-white transition-all rounded-25 duration-200 header-nav-item md-max:-translate-x-32 md-max:blur-[2px] md-max:opacity-0 !delay-[0s]")}>
                {"Runs"}
                <svg fill={"none"} height={"24"} viewBox={"0 0 24 24"} width={"24"} className={"md:hidden"} xmlns={"http://www.w3.org/2000/svg"}>
                  <path fill={"white"} style={{"fill": "white", "fillOpacity": "1"} as React.CSSProperties} clipRule={"evenodd"} d={"M9.29289 7.29289C9.68342 6.90237 10.3166 6.90237 10.7071 7.29289L13.6464 10.2322C14.6228 11.2085 14.6228 12.7915 13.6464 13.7678L10.7071 16.7071C10.3166 17.0976 9.68342 17.0976 9.29289 16.7071C8.90237 16.3166 8.90237 15.6834 9.29289 15.2929L12.2322 12.3536C12.4275 12.1583 12.4275 11.8417 12.2322 11.6464L9.29289 8.70711C8.90237 8.31658 8.90237 7.68342 9.29289 7.29289Z"} fillRule={"evenodd"}></path>
                </svg>
              </a>
              <a href={"https://github.com/Venkat5599/PRT/blob/main/docs/PLAN.md"} style={{"--delay-on-mobile": "100ms"} as React.CSSProperties} className={"px-20 py-8 md:px-12 delay-[var(--delay-on-mobile)] text-white/72 flex justify-between items-center md-max:font-500 md-max:font-title hover:text-white transition-all rounded-25 duration-200 header-nav-item md-max:-translate-x-32 md-max:blur-[2px] md-max:opacity-0 !delay-[0s]"} target={"_blank"} rel={"noopener"} {...b("link", 2, "px-20 py-8 md:px-12 delay-[var(--delay-on-mobile)] text-white/72 flex justify-between items-center md-max:font-500 md-max:font-title hover:text-white transition-all rounded-25 duration-200 header-nav-item md-max:-translate-x-32 md-max:blur-[2px] md-max:opacity-0 !delay-[0s]")}>
                {"Plan"}
                <svg fill={"none"} height={"24"} viewBox={"0 0 24 24"} width={"24"} className={"md:hidden"} xmlns={"http://www.w3.org/2000/svg"}>
                  <path fill={"white"} style={{"fill": "white", "fillOpacity": "1"} as React.CSSProperties} clipRule={"evenodd"} d={"M9.29289 7.29289C9.68342 6.90237 10.3166 6.90237 10.7071 7.29289L13.6464 10.2322C14.6228 11.2085 14.6228 12.7915 13.6464 13.7678L10.7071 16.7071C10.3166 17.0976 9.68342 17.0976 9.29289 16.7071C8.90237 16.3166 8.90237 15.6834 9.29289 15.2929L12.2322 12.3536C12.4275 12.1583 12.4275 11.8417 12.2322 11.6464L9.29289 8.70711C8.90237 8.31658 8.90237 7.68342 9.29289 7.29289Z"} fillRule={"evenodd"}></path>
                </svg>
              </a>
            </div>
            <a href={"https://github.com/Venkat5599/PRT"} className={"block w-full md:hidden transition-all delay-[250ms] md-max:translate-y-full md-max:opacity-0"} target={"_blank"} rel={"noopener"} {...b("mGit", 0, "block w-full md:hidden transition-all delay-[250ms] md-max:translate-y-full md-max:opacity-0")}>
              <button aria-label={"GitHub"} className={"rounded-full relative button block transition-all duration-[200ms] active:duration-[50ms] button-dark p-12 whitespace-nowrap w-full"} {...b("variantBtn", 0, "rounded-full relative button block transition-all duration-[200ms] active:duration-[50ms] button-dark p-12 whitespace-nowrap w-full")}>
                <span className={"flex items-center gap-4 justify-center text-label-normal text-body-dark-label"}>
                  {"GitHub"}
                </span>
              </button>
            </a>
          </nav>
          <div className={"md:w-128 header-actions transition-all flex justify-end"}>
            <button aria-label={"Open menu"} className={"rounded-full relative button block transition-all duration-[200ms] active:duration-[50ms] button-dark p-7 md:hidden"} {...b("menuBtn", 0, "rounded-full relative button block transition-all duration-[200ms] active:duration-[50ms] button-dark p-7 md:hidden")}>
              <span className={"flex items-center gap-4 justify-center text-label-normal text-body-dark-label"}>
                {k("menuIcon", 0) ?? (<>
                <svg fill={"none"} height={"22"} viewBox={"0 0 22 22"} width={"22"} xmlns={"http://www.w3.org/2000/svg"}>
                  <path clipRule={"evenodd"} d={"M2.66663 5.99984C2.66663 5.5396 3.03972 5.1665 3.49996 5.1665H18.5C18.9602 5.1665 19.3333 5.5396 19.3333 5.99984C19.3333 6.46007 18.9602 6.83317 18.5 6.83317H3.49996C3.03972 6.83317 2.66663 6.46007 2.66663 5.99984ZM2.66663 10.9998C2.66663 10.5396 3.03972 10.1665 3.49996 10.1665H18.5C18.9602 10.1665 19.3333 10.5396 19.3333 10.9998C19.3333 11.4601 18.9602 11.8332 18.5 11.8332H3.49996C3.03972 11.8332 2.66663 11.4601 2.66663 10.9998ZM2.66663 15.9998C2.66663 15.5396 3.03972 15.1665 3.49996 15.1665H18.5C18.9602 15.1665 19.3333 15.5396 19.3333 15.9998C19.3333 16.4601 18.9602 16.8332 18.5 16.8332H3.49996C3.03972 16.8332 2.66663 16.4601 2.66663 15.9998Z"} fill={"url(#paint0_linear_1027_11768)"} fillRule={"evenodd"} style={{} as React.CSSProperties}></path>
                  <defs>
                    <linearGradient gradientUnits={"userSpaceOnUse"} id={"paint0_linear_1027_11768"} x1={"11"} x2={"11"} y1={"5.1665"} y2={"16.8332"}>
                      <stop stopColor={"white"} style={{"stopColor": "white", "stopOpacity": "1"} as React.CSSProperties}></stop>
                      <stop offset={"1"} stopColor={"white"} stopOpacity={"0.8"} style={{"stopColor": "white", "stopOpacity": "0.8"} as React.CSSProperties}></stop>
                    </linearGradient>
                  </defs>
                </svg>
                </>)}
              </span>
            </button>
            <a href={"https://github.com/Venkat5599/PRT"} className={"block md-max:hidden"} target={"_blank"} rel={"noopener"}>
              <button aria-label={"GitHub"} className={"rounded-full relative button block transition-all duration-[200ms] active:duration-[50ms] button-dark py-7 px-16 whitespace-nowrap"} {...b("variantBtn", 1, "rounded-full relative button block transition-all duration-[200ms] active:duration-[50ms] button-dark py-7 px-16 whitespace-nowrap")}>
                <span className={"flex items-center gap-4 justify-center text-label-normal text-body-dark-label"}>
                  {"GitHub"}
                </span>
              </button>
            </a>
            <div className={"w-0 overflow-hidden header-sign-up-wrapper md-max:hidden"}>
              <a href={"/dashboard#compare"} className={"block"}>
                <button aria-label={"Try it"} className={"rounded-full relative button block transition-all duration-[200ms] active:duration-[50ms] button-primary py-7 px-16 whitespace-nowrap"}>
                  <span className={"flex items-center gap-4 justify-center text-label-normal text-body-dark-label"}>
                    {"Try it"}
                  </span>
                </button>
              </a>
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}
