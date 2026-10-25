// Generated from the landing markup by landing-port/gen.py (views.json). Do not edit by hand.
import type { Bind, Kids } from "@/components/landing/bind";

export default function HeaderPanelView({ b, k }: { b: Bind; k: Kids }) {
  return (
    <div style={{"top": "-10000px", "left": "-10000px", "width": "472px", "display": "none"} as React.CSSProperties} className={"header-products-dropdown-portal md:block hidden fixed z-[9999] pointer-events-none"} {...b("panel", 0, "header-products-dropdown-portal md:block hidden fixed z-[9999] pointer-events-none")}>
      <div className={"relative"} {...b("variant", 0, "relative")}>
        <div className={"relative"}>
          <div aria-hidden={"true"} className={"absolute -top-2 left-0 h-16 w-full"}></div>
          <div className={"rounded-16 p-6 relative backdrop-blur-16 shadow-products-dropdown-dark"}>
            <div>
              <a href={"https://github.com/Venkat5599/PRT#readme"} className={"group/item flex items-start gap-12 rounded-12 px-12 py-10 hover:bg-white/5 hover:outline hover:outline-1 hover:outline-white/8"} target={"_blank"} rel={"noopener"}>
                <div className={"grid h-36 w-36 place-items-center flex-shrink-0"}>
                  <img src={"/assets/images-original/nav/cli.png"} srcSet={"/assets/images-original/nav/cli.png 1x, /assets/images-original/nav/cli@2x.png 2x, /assets/images-original/nav/cli@3x.png 3x"} alt={""} aria-hidden={"true"} decoding={"async"} height={"36"} width={"36"} className={"h-36 w-36"} />
                </div>
                <div className={"min-w-0 flex-1"}>
                  <div className={"flex items-start justify-between"}>
                    <p className={"truncate text-14/22 font-600 text-white"}>
                      {"Canary CLI"}
                    </p>
                  </div>
                  <p className={"text-14/22 text-white/64"}>
                    {"Doctor, compare, invariants, test and upgrade from one Rust binary. Exits non-zero when an upgrade would break something."}
                  </p>
                </div>
              </a>
              <a href={"/dashboard#compare"} className={"group/item flex items-start gap-12 rounded-12 px-12 py-10 hover:bg-white/5 hover:outline hover:outline-1 hover:outline-white/8"}>
                <div className={"grid h-36 w-36 place-items-center flex-shrink-0"}>
                  <img src={"/assets/images-original/nav/dashboard.png"} srcSet={"/assets/images-original/nav/dashboard.png 1x, /assets/images-original/nav/dashboard@2x.png 2x, /assets/images-original/nav/dashboard@3x.png 3x"} alt={""} aria-hidden={"true"} decoding={"async"} height={"36"} width={"36"} className={"h-36 w-36"} />
                </div>
                <div className={"min-w-0 flex-1"}>
                  <div className={"flex items-start justify-between"}>
                    <p className={"truncate text-14/22 font-600 text-white"}>
                      {"Browser dashboard"}
                    </p>
                  </div>
                  <p className={"text-14/22 text-white/64"}>
                    {"The same engine compiled to WebAssembly. Diff two live Portaldot runtimes with nothing to install."}
                  </p>
                </div>
              </a>
            </div>
            <div className={"mt-6 pt-6 border-t border-white/12 text-white"}>
              <a href={"/dashboard#compare"} className={"group/item flex items-center gap-12 rounded-12 px-12 py-10 hover:bg-white/5 hover:outline hover:outline-1 hover:outline-white/8"}>
                <div className={"grid h-36 w-36 place-items-center flex-shrink-0"}>
                  <img src={"/assets/images-original/nav/compare.png"} srcSet={"/assets/images-original/nav/compare.png 1x, /assets/images-original/nav/compare@2x.png 2x, /assets/images-original/nav/compare@3x.png 3x"} alt={""} aria-hidden={"true"} decoding={"async"} height={"36"} width={"36"} className={"h-36 w-36"} />
                </div>
                <div className={"min-w-0 flex-1"}>
                  <div className={"flex items-center"}>
                    <p className={"truncate text-14/22 font-600 text-white"}>
                      {"Live compare"}
                    </p>
                  </div>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
      <div className={"absolute inset-0 opacity-0 pointer-events-none"} {...b("variant", 1, "absolute inset-0 opacity-0 pointer-events-none")}>
        <div className={"relative"}>
          <div aria-hidden={"true"} className={"absolute -top-2 left-0 h-16 w-full"}></div>
          <div className={"rounded-16 p-6 relative border border-[var(--body-stroke-lighter)] bg-[#FFFFFFE0] backdrop-blur-12 shadow-[0px_1px_2px_0px_#00000014,_0px_4px_16px_0px_#00000014,_0px_16px_56px_0px_#00000014]"}>
            <div>
              <a href={"https://github.com/Venkat5599/PRT#readme"} className={"group/item flex items-start gap-12 rounded-12 px-12 py-10 hover:bg-[#00000005] hover:outline hover:outline-1 hover:outline-[#0000000A]"} target={"_blank"} rel={"noopener"}>
                <div className={"grid h-36 w-36 place-items-center flex-shrink-0"}>
                  <img src={"/assets/images-original/nav/cli-light.png"} srcSet={"/assets/images-original/nav/cli-light.png 1x, /assets/images-original/nav/cli-light@2x.png 2x, /assets/images-original/nav/cli-light@3x.png 3x"} alt={""} aria-hidden={"true"} decoding={"async"} height={"36"} width={"36"} className={"h-36 w-36"} />
                </div>
                <div className={"min-w-0 flex-1"}>
                  <div className={"flex items-start justify-between"}>
                    <p className={"truncate text-14/22 font-600 text-[var(--body-light-loud)]"}>
                      {"Canary CLI"}
                    </p>
                  </div>
                  <p className={"text-14/22 text-[var(--body-light-muted)]"}>
                    {"Doctor, compare, invariants, test and upgrade from one Rust binary. Exits non-zero when an upgrade would break something."}
                  </p>
                </div>
              </a>
              <a href={"/dashboard#compare"} className={"group/item flex items-start gap-12 rounded-12 px-12 py-10 hover:bg-[#00000005] hover:outline hover:outline-1 hover:outline-[#0000000A]"}>
                <div className={"grid h-36 w-36 place-items-center flex-shrink-0"}>
                  <img src={"/assets/images-original/nav/dashboard-light.png"} srcSet={"/assets/images-original/nav/dashboard-light.png 1x, /assets/images-original/nav/dashboard-light@2x.png 2x, /assets/images-original/nav/dashboard-light@3x.png 3x"} alt={""} aria-hidden={"true"} decoding={"async"} height={"36"} width={"36"} className={"h-36 w-36"} />
                </div>
                <div className={"min-w-0 flex-1"}>
                  <div className={"flex items-start justify-between"}>
                    <p className={"truncate text-14/22 font-600 text-[var(--body-light-loud)]"}>
                      {"Browser dashboard"}
                    </p>
                  </div>
                  <p className={"text-14/22 text-[var(--body-light-muted)]"}>
                    {"The same engine compiled to WebAssembly. Diff two live Portaldot runtimes with nothing to install."}
                  </p>
                </div>
              </a>
            </div>
            <div className={"mt-6 pt-6 border-t border-[var(--body-stroke-lighter)] text-[var(--body-light-muted)]"}>
              <a href={"/dashboard#compare"} className={"group/item flex items-center gap-12 rounded-12 px-12 py-10 hover:bg-[#00000005] hover:outline hover:outline-1 hover:outline-[#0000000A]"}>
                <div className={"grid h-36 w-36 place-items-center flex-shrink-0"}>
                  <img src={"/assets/images-original/nav/compare-light.png"} srcSet={"/assets/images-original/nav/compare-light.png 1x, /assets/images-original/nav/compare-light@2x.png 2x, /assets/images-original/nav/compare-light@3x.png 3x"} alt={""} aria-hidden={"true"} decoding={"async"} height={"36"} width={"36"} className={"h-36 w-36"} />
                </div>
                <div className={"min-w-0 flex-1"}>
                  <div className={"flex items-center"}>
                    <p className={"truncate text-14/22 font-600 text-[var(--body-light-loud)]"}>
                      {"Live compare"}
                    </p>
                  </div>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
