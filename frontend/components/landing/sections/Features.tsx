// Generated from the landing markup by landing-port/gen.py. Do not edit by hand:
// change the source or the generator and regenerate.
import AutoUpgrade from "@/components/landing/features2/AutoUpgrade";
import BuildCards from "@/components/landing/features/BuildCards";
import DistributionStrip from "@/components/landing/features2/DistributionStrip";
import FeatureDashboard from "@/components/landing/features2/FeatureDashboard";
import MeasureChart from "@/components/landing/features/MeasureChart";
import SignatureGrid from "@/components/landing/features2/SignatureGrid";
import SignaturePen from "@/components/landing/features2/SignaturePen";
import SmokeChecks from "@/components/landing/features/SmokeChecks";
import SupplyGauge from "@/components/landing/features2/SupplyGauge";

export default function Features() {
  return (
    <section className={"features py-56 md:py-120"}>
      <div className={"px-14 py-4 rounded-full text-body-light-muted bg-body-light-bg-ghost text-special-mono mb-12 w-max mx-auto"}>
        {"Features"}
      </div>
      <h2 className={"text-body-light-loud text-title-h2 text-center mb-8"}>
        {"The runtime upgrade stack"}
      </h2>
      <p className={"text-body-large text-body-light-muted max-w-628 px-14 mb-36 md:mb-72 mx-auto text-center"}>
        {"Portal Canary checks a Portaldot runtime upgrade end to end, before it ever reaches the chain."}
      </p>
      <div className={"md:max-w-960 max-w-480 px-12 grid md:grid-cols-2 mx-auto gap-24 mb-96"}>
        <div className={"bg-body-light-bg-ghost rounded-24 relative overflow-hidden"}>
          <div className={"w-full left-0 absolute select-none top-0 h-full"}>
            <div className={"left-0 w-full h-280 md-max:scale-75 !top-40 md-max:!top-20 absolute"}>
              <img alt={"box"} decoding={"async"} height={"254"} loading={"lazy"} src={"/assets/images/features/build/box.png"} style={{} as React.CSSProperties} width={"456"} className={"lazy-image opacity-0 top-165 absolute center-x"} />
              <BuildCards />
            </div>
          </div>
          <div className={"pb-48 text-center relative px-40 mt-431 md-max:!mt-340"}>
            <div className={"text-label-large text-body-light-loud"}>
              {"Speaks the chain you actually run"}
            </div>
            <div className={"max-w-272 mx-auto h-1 my-20 bg-body-stroke-lighter"}></div>
            <p className={"text-body-normal text-body-light-muted md-max:[&_br]:hidden"}>
              {"Mainnet serves metadata V13, which modern subxt cannot decode. Canary speaks raw JSON-RPC "}
              <br />
              {" and SCALE, and decodes V13 and V14 alike."}
            </p>
            <div></div>
          </div>
        </div>
        <div className={"bg-body-light-bg-ghost rounded-24 relative overflow-hidden features-code"}>
          <div className={"w-full left-0 absolute select-none top-0 h-full"}>
            <div className={"overlay md-max:scale-75 h-280 !top-30 md-max:!-top-20"}>
              <div className={"w-392 h-280 top-32 center-x features-code-app rounded-20 backdrop-blur-8 bg-white/1 overflow-hidden"}>
                <img alt={"Code analysis"} decoding={"async"} height={"280"} loading={"lazy"} src={"/assets/images/features/code/app.png"} style={{} as React.CSSProperties} width={"392"} className={"lazy-image opacity-0"} />
              </div>
              <div className={"w-456 h-344 left-[calc(50%-228px)] top-0 features-code-animation"}>
                <img alt={"App magnified"} decoding={"async"} height={"344"} loading={"lazy"} src={"/assets/images/features/code/app-magnified.png"} style={{} as React.CSSProperties} width={"456"} className={"lazy-image opacity-0 absolute features-code-animation-magnified"} />
                <div className={"w-92 h-92 absolute top-1 left-152 features-code-animation-magnifier"}>
                  <img alt={""} decoding={"async"} height={"64"} loading={"lazy"} src={"/assets/images/features/code/stick.png"} style={{} as React.CSSProperties} width={"64"} className={"lazy-image opacity-0 top-71 left-71 absolute features-code-animation-magnifier-stick"} />
                  <img alt={""} decoding={"async"} height={"104"} loading={"lazy"} src={"/assets/images/features/code/magnify.png"} style={{} as React.CSSProperties} width={"104"} className={"lazy-image opacity-0 -top-6 -left-6 absolute features-code-animation-magnifier-glass rounded-full"} />
                </div>
              </div>
            </div>
          </div>
          <div className={"pb-48 text-center relative px-40 mt-431 md-max:!mt-280"}>
            <div className={"text-label-large text-body-light-loud"}>
              {"Catch hazards before setCode"}
            </div>
            <div className={"max-w-272 mx-auto h-1 my-20 bg-body-stroke-lighter"}></div>
            <p className={"text-body-normal text-body-light-muted md-max:[&_br]:hidden"}>
              {"Canary diffs every pallet's calls, events, storage, "}
              <br />
              {" constants and errors, then flags the changes that "}
              <br />
              {" would halt block production on a running chain."}
            </p>
            <div></div>
          </div>
        </div>
        <div className={"bg-body-light-bg-ghost rounded-24 relative overflow-hidden"}>
          <div className={"w-full left-0 absolute select-none top-0 h-full"}>
            <div className={"max-w-400 px-12 mx-auto top-16 md:top-40 center-x left-0 w-full"}>
              <div className={"flex w-full rounded-10 bg-black/4 p-2 relative mb-16 md:mb-28"}>
                <div style={{"boxShadow": ""} as React.CSSProperties} className={"flex items-center justify-center flex-1 gap-4 py-8 md-max:text-[12px] relative transition-all text-body-light-muted text-body-normal"}>
                  <svg fill={"none"} height={"20"} viewBox={"0 0 21 20"} width={"21"} xmlns={"http://www.w3.org/2000/svg"}>
                    <path d={"M6.023 5.201 h8.96 a0.64 0.64 0 0 1 0.64 0.64 v2.24 a0.64 0.64 0 0 1 -0.64 0.64 H6.023 a0.64 0.64 0 0 1 -0.64 -0.64 V5.841 a0.64 0.64 0 0 1 0.64 -0.64Zm0 4.48 h8.96 a0.64 0.64 0 0 1 0.64 0.64 V12.561 a0.64 0.64 0 0 1 -0.64 0.64 H6.023 a0.64 0.64 0 0 1 -0.64 -0.64 v-2.24 a0.64 0.64 0 0 1 0.64 -0.64ZM7.303 6.417 a0.576 0.576 0 1 0 0 1.152 0.576 0.576 0 0 0 0 -1.152Zm0 4.48 a0.576 0.576 0 1 0 0 1.152 0.576 0.576 0 0 0 0 -1.152ZM5.383 14.161 h10.24 V15.121 H5.383 v-0.96Z"} fill={"currentColor"}></path>
                  </svg>
                  <span>
                    {"Mainnet"}
                  </span>
                  <svg fill={"none"} height={"18"} viewBox={"0 0 18 18"} width={"18"} className={"features-smoke-tabs-check rounded-full sm-max:hidden"} xmlns={"http://www.w3.org/2000/svg"}>
                    <circle cx={"9"} cy={"9"} fill={"url(#paint0_linear_1996_8373)"} r={"9"} style={{} as React.CSSProperties}></circle>
                    <path clipRule={"evenodd"} d={"M12.4595 7.28916C12.78 6.89733 12.7223 6.31981 12.3305 5.99923C11.9386 5.67864 11.3611 5.73639 11.0405 6.12822L7.55695 10.3859L6.43985 9.26884C6.08187 8.91086 5.50147 8.91086 5.14349 9.26884C4.7855 9.62682 4.7855 10.2072 5.14349 10.5652L6.97682 12.3985C7.15995 12.5817 7.412 12.6788 7.67066 12.6659C7.92933 12.653 8.17046 12.5313 8.33446 12.3308L12.4595 7.28916Z"} fill={"#656565"} fillRule={"evenodd"} style={{"fill": "color(display-p3 0.3961 0.3961 0.3961)", "fillOpacity": "1"} as React.CSSProperties}></path>
                    <defs>
                      <linearGradient gradientUnits={"userSpaceOnUse"} id={"paint0_linear_1996_8373"} x1={"9"} x2={"9"} y1={"0"} y2={"18"}>
                        <stop stopColor={"white"} style={{"stopColor": "white", "stopOpacity": "1"} as React.CSSProperties}></stop>
                        <stop offset={"1"} stopColor={"white"} stopOpacity={"0.8"} style={{"stopColor": "white", "stopOpacity": "0.8"} as React.CSSProperties}></stop>
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
                <div style={{"boxShadow": ""} as React.CSSProperties} className={"flex items-center justify-center flex-1 gap-4 py-8 md-max:text-[12px] relative transition-all text-body-light-muted text-body-normal"}>
                  <svg fill={"none"} height={"20"} viewBox={"0 0 20 20"} width={"20"} xmlns={"http://www.w3.org/2000/svg"}>
                    <path d={"M5.376 5.983 a0.577 0.577 0 0 1 0.577 -0.577 h8.079 a0.577 0.577 0 0 1 0.577 0.577 v5.771 a0.577 0.577 0 0 1 -0.577 0.577 h-3.03 v1.154 H12.301 a0.433 0.433 0 0 1 0 0.866 H7.684 A0.433 0.433 0 0 1 7.684 13.485 h1.298 v-1.154 H5.953 a0.577 0.577 0 0 1 -0.577 -0.577 V5.983Zm0.923 0.346 v5.078 h7.387 V6.329 H6.299Zm1.327 1.27 1.5 1.27 -1.5 1.27 -0.519 -0.635 0.75 -0.635 -0.75 -0.635 0.519 -0.635Zm2.078 2.02 h2.424 v0.808 H9.704 V9.618Z"} fill={"currentColor"}></path>
                  </svg>
                  <span>
                    {"Dev node"}
                  </span>
                  <svg fill={"none"} height={"18"} viewBox={"0 0 18 18"} width={"18"} className={"features-smoke-tabs-check rounded-full sm-max:hidden"} xmlns={"http://www.w3.org/2000/svg"}>
                    <circle cx={"9"} cy={"9"} fill={"url(#paint0_linear_1996_8373)"} r={"9"} style={{} as React.CSSProperties}></circle>
                    <path clipRule={"evenodd"} d={"M12.4595 7.28916C12.78 6.89733 12.7223 6.31981 12.3305 5.99923C11.9386 5.67864 11.3611 5.73639 11.0405 6.12822L7.55695 10.3859L6.43985 9.26884C6.08187 8.91086 5.50147 8.91086 5.14349 9.26884C4.7855 9.62682 4.7855 10.2072 5.14349 10.5652L6.97682 12.3985C7.15995 12.5817 7.412 12.6788 7.67066 12.6659C7.92933 12.653 8.17046 12.5313 8.33446 12.3308L12.4595 7.28916Z"} fill={"#656565"} fillRule={"evenodd"} style={{"fill": "color(display-p3 0.3961 0.3961 0.3961)", "fillOpacity": "1"} as React.CSSProperties}></path>
                    <defs>
                      <linearGradient gradientUnits={"userSpaceOnUse"} id={"paint0_linear_1996_8373"} x1={"9"} x2={"9"} y1={"0"} y2={"18"}>
                        <stop stopColor={"white"} style={{"stopColor": "white", "stopOpacity": "1"} as React.CSSProperties}></stop>
                        <stop offset={"1"} stopColor={"white"} stopOpacity={"0.8"} style={{"stopColor": "white", "stopOpacity": "0.8"} as React.CSSProperties}></stop>
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
                <div style={{"boxShadow": "0px 12px 12px -3px rgba(0, 0, 0, 0.06), 0px 6px 6px -3px rgba(0, 0, 0, 0.04), 0px 3px 3px -1.5px rgba(0, 0, 0, 0.02), 0px 1px 1px -0.5px rgba(0, 0, 0, 0.03)"} as React.CSSProperties} className={"flex items-center justify-center flex-1 gap-4 py-8 md-max:text-[12px] relative transition-all text-body-light-loud text-label-normal bg-white rounded-8"}>
                  <svg fill={"none"} height={"20"} viewBox={"0 0 20 20"} width={"20"} xmlns={"http://www.w3.org/2000/svg"}>
                    <path d={"M9.703 4.149 14.268 6.716 v5.136 L9.703 14.42 5.137 11.852 v-5.136 L9.703 4.149Zm0 1.312 L6.279 7.401 v3.766 l3.424 1.94 3.424 -1.94 V7.401 l-3.424 -1.94ZM7.762 7.515 h3.88 v0.913 H7.762 V7.515Zm0 1.655 h3.88 v0.913 H7.762 V9.17Zm0 1.655 h3.88 v0.913 H7.762 v-0.913Z"} fill={"currentColor"}></path>
                  </svg>
                  <span>
                    {"V3"}
                  </span>
                </div>
              </div>
              <div className={"relative"}>
                <SmokeChecks />
              </div>
            </div>
          </div>
          <div className={"pb-48 text-center relative px-40 mt-431 md-max:!mt-380"}>
            <div className={"text-label-large text-body-light-loud"}>
              {"Catch regressions before users do"}
            </div>
            <div className={"max-w-272 mx-auto h-1 my-20 bg-body-stroke-lighter"}></div>
            <p className={"text-body-normal text-body-light-muted md-max:[&_br]:hidden"}>
              {"Run the same workflows before and after an upgrade. "}
              <br />
              {" Freshly funded accounts, state read at pinned blocks, "}
              <br />
              {" every expectation evaluated on both sides."}
            </p>
            <div></div>
          </div>
        </div>
        <div className={"bg-body-light-bg-ghost rounded-24 relative overflow-hidden features-auto"}>
          <AutoUpgrade />
          <div className={"pb-48 text-center relative px-40 mt-431 md-max:!mt-380"}>
            <div className={"text-label-large text-body-light-loud"}>
              {"Upgrades with a liveness check"}
            </div>
            <div className={"max-w-272 mx-auto h-1 my-20 bg-body-stroke-lighter"}></div>
            <p className={"text-body-normal text-body-light-muted md-max:[&_br]:hidden"}>
              {"An upgrade only counts once the new runtime "}
              <br />
              {" has produced three more blocks. A spec bump "}
              <br />
              {" alone is not proof that an upgrade worked."}
            </p>
            <div></div>
          </div>
        </div>
      </div>
      <FeatureDashboard />
      <div className={"md:max-w-960 max-w-480 grid md:grid-cols-2 px-12 mx-auto gap-24 md-max:mb-40 my-96"}>
        <div className={"bg-body-light-bg-ghost rounded-24 relative overflow-hidden"}>
          <div className={"w-full left-0 absolute select-none top-0 h-full"}>
            <SignatureGrid />
            <SignaturePen />
          </div>
          <div className={"pb-48 text-center relative px-40 mt-240"}>
            <div className={"text-label-large text-body-light-loud"}>
              {"Attestation made easy"}
            </div>
            <div className={"max-w-272 mx-auto h-1 my-20 bg-body-stroke-lighter"}></div>
            <p className={"text-body-normal text-body-light-muted md-max:[&_br]:hidden"}>
              {"canary attest writes a finding hash to the dev chain with system.remark, and canary verify checks it later, so a result can be confirmed without trusting whoever reported it."}
            </p>
            <div></div>
          </div>
        </div>
        <div className={"bg-body-light-bg-ghost rounded-24 relative overflow-hidden"}>
          <div className={"w-full left-0 absolute select-none top-0 h-full"}>
            <div style={{"--background-image-desktop": "url('/assets/images/features/measure/bg-grid.png')", "--background-image-mobile": "url('/assets/images/features/measure/bg-grid.png')"} as React.CSSProperties} className={"lazy-background-image lazy-background-image-backgroundImage opacity-0 h-240 w-full absolute top-0 left-0"}>
              <MeasureChart />
            </div>
          </div>
          <div className={"pb-48 text-center relative px-40 mt-240"}>
            <div className={"text-label-large text-body-light-loud"}>
              {"Measure the blast radius"}
            </div>
            <div className={"max-w-272 mx-auto h-1 my-20 bg-body-stroke-lighter"}></div>
            <p className={"text-body-normal text-body-light-muted md-max:[&_br]:hidden"}>
              {"See how many calls, events, storage items, constants and errors moved between two runtimes, pallet by pallet."}
            </p>
            <div></div>
          </div>
        </div>
        <div className={"bg-body-light-bg-ghost rounded-24 relative overflow-hidden features-distribution"}>
          <div className={"w-full left-0 absolute select-none top-0 h-full"}>
            <DistributionStrip />
            <div className={"features-distribution-badge center-x top-32 bg-white rounded-full py-4 pr-12 pl-10 flex gap-6 items-center text-label-small"}>
              <svg fill={"none"} height={"16"} viewBox={"0 0 16 16"} width={"16"} xmlns={"http://www.w3.org/2000/svg"}>
                <path clipRule={"evenodd"} d={"M2.66667 9.33333C3.03486 9.33333 3.33333 9.63181 3.33333 10V12C3.33333 12.3682 3.63181 12.6667 4 12.6667H12C12.3682 12.6667 12.6667 12.3682 12.6667 12V10C12.6667 9.63181 12.9651 9.33333 13.3333 9.33333C13.7015 9.33333 14 9.63181 14 10V12C14 13.1046 13.1046 14 12 14H4C2.89543 14 2 13.1046 2 12V10C2 9.63181 2.29848 9.33333 2.66667 9.33333Z"} fill={"#1890FF"} fillRule={"evenodd"} style={{"fill": "color(display-p3 0.0941 0.5647 1.0000)", "fillOpacity": "1"} as React.CSSProperties}></path>
                <path clipRule={"evenodd"} d={"M7.99999 10.3333C8.1768 10.3333 8.34637 10.2631 8.4714 10.1381L10.8047 7.80474C11.0651 7.54439 11.0651 7.12228 10.8047 6.86193C10.5444 6.60158 10.1223 6.60158 9.86193 6.86193L8.66666 8.05719V2.66667C8.66666 2.29848 8.36818 2 7.99999 2C7.6318 2 7.33333 2.29848 7.33333 2.66667V8.05719L6.13807 6.86193C5.87772 6.60158 5.45561 6.60158 5.19526 6.86193C4.93491 7.12228 4.93491 7.54439 5.19526 7.80474L7.52859 10.1381C7.65361 10.2631 7.82318 10.3333 7.99999 10.3333Z"} fill={"#1890FF"} fillRule={"evenodd"} style={{"fill": "color(display-p3 0.0941 0.5647 1.0000)", "fillOpacity": "1"} as React.CSSProperties}></path>
              </svg>
              <span>
                {"localhost/dashboard"}
              </span>
            </div>
            <div className={"features-distribution-animation"}>
              <div className={"top-88 center-x w-200 z-10"}>
                <div className={"macbook"}>
                  <div className={"macbook-lid"}>
                    <div className={"features-distribution-mac-lid-base absolute bottom-0 w-full"}>
                      <div></div>
                      <div></div>
                    </div>
                    <div className={"macbook-screen h-100"}>
                      <img alt={""} decoding={"async"} height={"1"} loading={"lazy"} src={"/assets/images/features/distribution/screen.png"} style={{} as React.CSSProperties} width={"1"} className={"lazy-image opacity-0 top-3 left-3 absolute w-[calc(100%-6px)] rounded-t-2 rounded-b-1 h-[calc(100%-6px)] object-cover"} />
                    </div>
                  </div>
                  <div className={"features-distribution-mac-keyboard absolute bottom-1 w-full rounded-b-16"}>
                    <div></div>
                    <div></div>
                    <div></div>
                  </div>
                </div>
              </div>
              <div className={"absolute top-106 w-full left-0 flex justify-center gap-28 features-distribution-apps z-10"}>
                <div className={"w-72 h-72 features-distribution-apps-item"}>
                  <div className={"overlay features-distribution-apps-item-inner !rounded-14 flex-center"}>
                    <svg fill={"none"} height={"40"} viewBox={"0 0 40 40"} width={"40"} xmlns={"http://www.w3.org/2000/svg"}>
                      <path d={"M19.5 8.15 28.7 13.325 v10.35 L19.5 28.85 10.3 23.675 v-10.35 L19.5 8.15Zm0 2.645 L12.6 14.705 v7.59 l6.9 3.91 6.9 -3.91 V14.705 l-6.9 -3.91ZM15.59 14.935 h7.82 v1.84 H15.59 V14.935Zm0 3.335 h7.82 v1.84 H15.59 V18.27Zm0 3.335 h7.82 v1.84 H15.59 v-1.84Z"} fill={"black"} style={{"fill": "black", "fillOpacity": "1"} as React.CSSProperties}></path>
                    </svg>
                  </div>
                </div>
                <div className={"w-72 h-72 features-distribution-apps-item"}>
                  <div className={"overlay features-distribution-apps-item-inner !rounded-14 flex-center"}>
                    <svg fill={"none"} height={"40"} viewBox={"0 0 40 40"} width={"40"} xmlns={"http://www.w3.org/2000/svg"}>
                      <path d={"M11.264 10.64 h17.472 a1.248 1.248 0 0 1 1.248 1.248 v4.368 a1.248 1.248 0 0 1 -1.248 1.248 H11.264 a1.248 1.248 0 0 1 -1.248 -1.248 V11.888 a1.248 1.248 0 0 1 1.248 -1.248Zm0 8.736 h17.472 a1.248 1.248 0 0 1 1.248 1.248 V24.992 a1.248 1.248 0 0 1 -1.248 1.248 H11.264 a1.248 1.248 0 0 1 -1.248 -1.248 v-4.368 a1.248 1.248 0 0 1 1.248 -1.248ZM13.76 13.011 a1.123 1.123 0 1 0 0 2.246 1.123 1.123 0 0 0 0 -2.246Zm0 8.736 a1.123 1.123 0 1 0 0 2.246 1.123 1.123 0 0 0 0 -2.246ZM10.016 28.112 h19.968 V29.984 H10.016 v-1.872Z"} fill={"#141414"} style={{"fill": "color(display-p3 0.0800 0.0800 0.0800)", "fillOpacity": "1"} as React.CSSProperties}></path>
                    </svg>
                  </div>
                </div>
                <div className={"w-72 h-72 features-distribution-apps-item"}>
                  <div className={"overlay features-distribution-apps-item-inner !rounded-14 flex-center"}>
                    <svg fill={"none"} height={"40"} viewBox={"0 0 40 40"} width={"40"} xmlns={"http://www.w3.org/2000/svg"}>
                      <path d={"M9.641 11.001 a1.293 1.293 0 0 1 1.293 -1.293 h18.097 a1.293 1.293 0 0 1 1.293 1.293 v12.927 a1.293 1.293 0 0 1 -1.293 1.293 h-6.787 v2.585 H25.153 a0.97 0.97 0 0 1 0 1.939 H14.812 A0.97 0.97 0 0 1 14.812 27.806 h2.909 v-2.585 H10.934 a1.293 1.293 0 0 1 -1.293 -1.293 V11.001Zm2.068 0.776 v11.376 h16.546 V11.777 H11.709Zm2.973 2.844 3.361 2.844 -3.361 2.844 -1.163 -1.422 1.68 -1.422 -1.68 -1.422 1.163 -1.422Zm4.654 4.524 h5.429 v1.81 H19.336 V19.145Z"} fill={"#141414"} style={{"fill": "color(display-p3 0.0800 0.0800 0.0800)", "fillOpacity": "1"} as React.CSSProperties}></path>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className={"pb-48 text-center relative px-40 mt-240"}>
            <div className={"text-label-large text-body-light-loud"}>
              {"No install. Sorted!"}
            </div>
            <div className={"max-w-272 mx-auto h-1 my-20 bg-body-stroke-lighter"}></div>
            <p className={"text-body-normal text-body-light-muted md-max:[&_br]:hidden"}>
              {"The compare engine is compiled to WebAssembly, about 300 KB. Your browser opens a WebSocket to each node and diffs them locally, with no server involved."}
            </p>
            <div></div>
          </div>
        </div>
        <div className={"bg-body-light-bg-ghost rounded-24 relative overflow-hidden"}>
          <div className={"w-full left-0 absolute select-none top-0 h-full"}>
            <SupplyGauge />
          </div>
          <div className={"pb-48 text-center relative px-40 mt-240"}>
            <div className={"text-label-large text-body-light-loud"}>
              {"Supply. Conserved!"}
            </div>
            <div className={"max-w-272 mx-auto h-1 my-20 bg-body-stroke-lighter"}></div>
            <p className={"text-body-normal text-body-light-muted md-max:[&_br]:hidden"}>
              {"Sum every account's free and reserved balance at one finalized block and compare it with total issuance. Mainnet: delta +0 planck."}
            </p>
            <div></div>
          </div>
        </div>
      </div>
      <div className={"md:max-w-960 max-w-480 grid md:grid-cols-2 lg:grid-cols-3 px-12 mx-auto features-info relative"}>
        <div className={"p-32 pr-18 flex gap-12 md-max:border-t md-max:first:border-t-0 border-body-stroke-lighter"}>
          <svg fill={"none"} height={"22"} viewBox={"0 0 22 22"} width={"22"} xmlns={"http://www.w3.org/2000/svg"}>
            <path clipRule={"evenodd"} d={"M4.83317 4.5C5.30531 3.87049 6.04628 3.5 6.83317 3.5H15.1665C15.9534 3.5 16.6944 3.87049 17.1665 4.5L19.1665 7.16667C19.2747 7.31091 19.3332 7.48636 19.3332 7.66667V8.5C19.3332 9.34532 19.0177 10.1178 18.4998 10.7048V16C18.4998 17.3807 17.3806 18.5 15.9998 18.5H5.99984C4.61913 18.5 3.49984 17.3807 3.49984 16V10.7048C2.98193 10.1178 2.6665 9.34532 2.6665 8.5V7.66667C2.6665 7.48636 2.72499 7.31091 2.83317 7.16667L4.83317 4.5ZM5.1665 11.7281V16C5.1665 16.4602 5.5396 16.8333 5.99984 16.8333H8.49984L8.49984 15.1667C8.49985 13.7859 9.61913 12.6667 10.9998 12.6667C12.3806 12.6667 13.4998 13.786 13.4998 15.1667L13.4998 16.8333H15.9998C16.4601 16.8333 16.8332 16.4602 16.8332 16V11.7281C16.5667 11.7968 16.2874 11.8333 15.9998 11.8333C15.0043 11.8333 14.1106 11.3969 13.4998 10.7049C12.8891 11.3969 11.9954 11.8333 10.9998 11.8333C10.0043 11.8333 9.11063 11.3969 8.49984 10.7049C7.88905 11.3969 6.99542 11.8333 5.99984 11.8333C5.71225 11.8333 5.43297 11.7968 5.1665 11.7281Z"} fill={"#656565"} fillRule={"evenodd"} style={{"fill": "color(display-p3 0.3961 0.3961 0.3961)", "fillOpacity": "1"} as React.CSSProperties}></path>
          </svg>
          <div className={"flex-1 -mt-1"}>
            <span className={"text-label-normal text-body-light-loud mr-4 inline-block"}>
              {"GitHub Action."}
            </span>
            <span className={"text-body-normal text-body-light-muted [&_b]:text-label-normal md-max:[&_br]:hidden"}>
              {"Run Canary as a gate on every runtime PR"}
            </span>
          </div>
        </div>
        <div className={"p-32 pr-18 flex gap-12 md-max:border-t md-max:first:border-t-0 border-body-stroke-lighter"}>
          <svg fill={"none"} height={"22"} viewBox={"0 0 22 22"} width={"22"} xmlns={"http://www.w3.org/2000/svg"}>
            <path clipRule={"evenodd"} d={"M3.5 6C3.5 4.61929 4.61929 3.5 6 3.5H16C17.3807 3.5 18.5 4.61929 18.5 6V16C18.5 17.3807 17.3807 18.5 16 18.5H6C4.61929 18.5 3.5 17.3807 3.5 16V6ZM8.5 15.1667C8.03976 15.1667 7.66667 14.7936 7.66667 14.3333C7.66667 13.8731 8.03976 13.5 8.5 13.5H13.5C13.9602 13.5 14.3333 13.8731 14.3333 14.3333C14.3333 14.7936 13.9602 15.1667 13.5 15.1667H8.5ZM13.2559 10.7559L11.5893 12.4226C11.2638 12.748 10.7362 12.748 10.4107 12.4226L8.74408 10.7559C8.41864 10.4305 8.41864 9.90285 8.74408 9.57741C9.06951 9.25197 9.59715 9.25197 9.92259 9.57741L10.1667 9.82149V7.66667C10.1667 7.20643 10.5398 6.83333 11 6.83333C11.4602 6.83333 11.8333 7.20643 11.8333 7.66667V9.82149L12.0774 9.57741C12.4028 9.25197 12.9305 9.25197 13.2559 9.57741C13.5814 9.90285 13.5814 10.4305 13.2559 10.7559Z"} fill={"#656565"} fillRule={"evenodd"} style={{"fill": "color(display-p3 0.3961 0.3961 0.3961)", "fillOpacity": "1"} as React.CSSProperties}></path>
          </svg>
          <div className={"flex-1 -mt-1"}>
            <span className={"text-label-normal text-body-light-loud mr-4 inline-block"}>
              {"Exit codes."}
            </span>
            <span className={"text-body-normal text-body-light-muted [&_b]:text-label-normal md-max:[&_br]:hidden"}>
              {"Maps "}
              <br />
              {" "}
              <b>
                {"\u201cREGRESSION "}
                <svg width={"12"} height={"12"} viewBox={"0 0 12 12"} fill={"none"} className={"inline-block"} xmlns={"http://www.w3.org/2000/svg"}>
                  {" \n"}
                  <path d={"M7.16609 2.91602L9.93754 5.68745C10.1328 5.88272 10.1328 6.1993 9.93754 6.39456L7.16609 9.16602M9.66609 6.04101H1.91609"} stroke={"#A4A4A4"} style={{"stroke": "color(display-p3 0.6444 0.6444 0.6444)", "strokeOpacity": "1"} as React.CSSProperties} strokeWidth={"1.5"} strokeLinecap={"round"} strokeLinejoin={"round"}></path>
                  {"\n"}
                </svg>
                {"\n exit 1\u201d"}
              </b>
              {" so CI fails loudly."}
            </span>
          </div>
        </div>
        <div className={"p-32 pr-18 flex gap-12 md-max:border-t md-max:first:border-t-0 border-body-stroke-lighter"}>
          <svg fill={"none"} height={"22"} viewBox={"0 0 22 22"} width={"22"} xmlns={"http://www.w3.org/2000/svg"}>
            <path d={"M5.99984 6.83301C5.5396 6.83301 5.1665 7.2061 5.1665 7.66634C5.1665 8.12658 5.5396 8.49967 5.99984 8.49967C6.46007 8.49967 6.83317 8.12658 6.83317 7.66634C6.83317 7.2061 6.46007 6.83301 5.99984 6.83301Z"} fill={"#656565"} style={{"fill": "color(display-p3 0.3961 0.3961 0.3961)", "fillOpacity": "1"} as React.CSSProperties}></path>
            <path d={"M7.6665 7.66634C7.6665 7.2061 8.0396 6.83301 8.49984 6.83301C8.96007 6.83301 9.33317 7.2061 9.33317 7.66634C9.33317 8.12658 8.96007 8.49967 8.49984 8.49967C8.0396 8.49967 7.6665 8.12658 7.6665 7.66634Z"} fill={"#656565"} style={{"fill": "color(display-p3 0.3961 0.3961 0.3961)", "fillOpacity": "1"} as React.CSSProperties}></path>
            <path d={"M10.9998 6.83301C10.5396 6.83301 10.1665 7.2061 10.1665 7.66634C10.1665 8.12658 10.5396 8.49967 10.9998 8.49967C11.4601 8.49967 11.8332 8.12658 11.8332 7.66634C11.8332 7.2061 11.4601 6.83301 10.9998 6.83301Z"} fill={"#656565"} style={{"fill": "color(display-p3 0.3961 0.3961 0.3961)", "fillOpacity": "1"} as React.CSSProperties}></path>
            <path clipRule={"evenodd"} d={"M2.6665 6.83301C2.6665 5.4523 3.78579 4.33301 5.1665 4.33301H16.8332C18.2139 4.33301 19.3332 5.4523 19.3332 6.83301V15.1663C19.3332 16.5471 18.2139 17.6663 16.8332 17.6663H5.1665C3.78579 17.6663 2.6665 16.5471 2.6665 15.1663V6.83301ZM17.6665 6.83301V9.33301H4.33317V6.83301C4.33317 6.37277 4.70627 5.99967 5.1665 5.99967H16.8332C17.2934 5.99967 17.6665 6.37277 17.6665 6.83301Z"} fill={"#656565"} fillRule={"evenodd"} style={{"fill": "color(display-p3 0.3961 0.3961 0.3961)", "fillOpacity": "1"} as React.CSSProperties}></path>
          </svg>
          <div className={"flex-1 -mt-1"}>
            <span className={"text-label-normal text-body-light-loud mr-4 inline-block"}>
              {"Contract workflows."}
            </span>
            <span className={"text-body-normal text-body-light-muted [&_b]:text-label-normal md-max:[&_br]:hidden"}>
              {"Deploys WASM contracts "}
              <br />
              {" against pallet-contracts v3."}
            </span>
          </div>
        </div>
        <div className={"p-32 pr-18 flex gap-12 md-max:border-t md-max:first:border-t-0 border-body-stroke-lighter"}>
          <svg fill={"none"} height={"22"} viewBox={"0 0 22 22"} width={"22"} xmlns={"http://www.w3.org/2000/svg"}>
            <g clipPath={"url(#clip0_910_2678)"}>
              <path clipRule={"evenodd"} d={"M2.35986 7.75576C4.16724 5.97073 7.09334 5.97074 8.90072 7.75576L11 9.82908L13.0993 7.75576C14.9067 5.97074 17.8328 5.97074 19.6401 7.75576C21.4533 9.54649 21.4533 12.4542 19.6401 14.2449C17.8328 16.0299 14.9067 16.0299 13.0993 14.2449L11 12.1716L8.90072 14.2449C7.09334 16.0299 4.16724 16.0299 2.35986 14.2449C0.546714 12.4542 0.546714 9.54649 2.35986 7.75576ZM9.81409 11.0003L7.72957 8.94159C6.57134 7.79768 4.68924 7.79768 3.53101 8.94159C2.37855 10.0798 2.37855 11.9209 3.53101 13.0591C4.68924 14.203 6.57134 14.203 7.72957 13.0591L9.81409 11.0003ZM12.1859 11.0003L14.2704 13.0591C15.4287 14.203 17.3108 14.203 18.469 13.0591C19.6215 11.9209 19.6215 10.0798 18.469 8.94159C17.3108 7.79768 15.4287 7.79768 14.2704 8.94159L12.1859 11.0003Z"} fill={"#656565"} fillRule={"evenodd"} style={{"fill": "color(display-p3 0.3961 0.3961 0.3961)", "fillOpacity": "1"} as React.CSSProperties}></path>
            </g>
            <defs>
              <clipPath id={"clip0_910_2678"}>
                <rect fill={"white"} height={"20"} style={{"fill": "white", "fillOpacity": "1"} as React.CSSProperties} transform={"translate(1 1)"} width={"20"}></rect>
              </clipPath>
            </defs>
          </svg>
          <div className={"flex-1 -mt-1"}>
            <span className={"text-label-normal text-body-light-loud mr-4 inline-block"}>
              {"Reproducible."}
            </span>
            <span className={"text-body-normal text-body-light-muted [&_b]:text-label-normal md-max:[&_br]:hidden"}>
              {"canary reproduce returns the identical finding hash"}
            </span>
          </div>
        </div>
        <div className={"p-32 pr-18 flex gap-12 md-max:border-t md-max:first:border-t-0 border-body-stroke-lighter"}>
          <svg fill={"none"} height={"22"} viewBox={"0 0 22 22"} width={"22"} xmlns={"http://www.w3.org/2000/svg"}>
            <path d={"M3.9165 6.83333C3.9165 4.99238 5.40889 3.5 7.24984 3.5C9.09079 3.5 10.5832 4.99238 10.5832 6.83333C10.5832 8.67428 9.09079 10.1667 7.24984 10.1667C5.40889 10.1667 3.9165 8.67428 3.9165 6.83333Z"} fill={"#656565"} style={{"fill": "color(display-p3 0.3961 0.3961 0.3961)", "fillOpacity": "1"} as React.CSSProperties}></path>
            <path d={"M11.4165 6.83333C11.4165 4.99238 12.9089 3.5 14.7498 3.5C16.5908 3.5 18.0832 4.99238 18.0832 6.83333C18.0832 8.67428 16.5908 10.1667 14.7498 10.1667C12.9089 10.1667 11.4165 8.67428 11.4165 6.83333Z"} fill={"#656565"} style={{"fill": "color(display-p3 0.3961 0.3961 0.3961)", "fillOpacity": "1"} as React.CSSProperties}></path>
            <path d={"M7.24962 11C9.64194 11 11.9112 12.6505 12.7558 15.6779C13.1974 17.2609 11.8473 18.5 10.4613 18.5H4.03791C2.65194 18.5 1.30185 17.2609 1.74346 15.6779C2.58805 12.6505 4.8573 11 7.24962 11Z"} fill={"#656565"} style={{"fill": "color(display-p3 0.3961 0.3961 0.3961)", "fillOpacity": "1"} as React.CSSProperties}></path>
            <path d={"M14.3618 15.2301C13.9553 13.773 13.2564 12.5405 12.3581 11.5851C13.1043 11.1988 13.9199 11 14.7502 11C17.1425 11 19.4118 12.6505 20.2564 15.6779C20.698 17.2609 19.3479 18.5 17.9619 18.5H13.7754C14.4155 17.6291 14.7077 16.4701 14.3618 15.2301Z"} fill={"#656565"} style={{"fill": "color(display-p3 0.3961 0.3961 0.3961)", "fillOpacity": "1"} as React.CSSProperties}></path>
          </svg>
          <div className={"flex-1 -mt-1"}>
            <span className={"text-label-normal text-body-light-loud mr-4 inline-block"}>
              {"Reports."}
            </span>
            <span className={"text-body-normal text-body-light-muted [&_b]:text-label-normal md-max:[&_br]:hidden"}>
              {"JSON and HTML reports "}
              <br />
              {" for every recorded run."}
            </span>
          </div>
        </div>
        <div className={"p-32 pr-18 flex gap-12 md-max:border-t md-max:first:border-t-0 border-body-stroke-lighter"}>
          <svg fill={"none"} height={"22"} viewBox={"0 0 22 22"} width={"22"} xmlns={"http://www.w3.org/2000/svg"}>
            <path clipRule={"evenodd"} d={"M11 19.3332C15.1421 19.3332 18.5 15.9753 18.5 11.8332V7.08984C18.5 6.0966 17.912 5.19756 17.002 4.79945L12.002 2.61195C11.3632 2.33248 10.6368 2.33247 9.99795 2.61195L4.99795 4.79945C4.08798 5.19756 3.5 6.0966 3.5 7.08984V11.8332C3.5 15.9753 6.85786 19.3332 11 19.3332ZM14.0893 9.9224C14.4147 9.59696 14.4147 9.06932 14.0893 8.74388C13.7638 8.41845 13.2362 8.41845 12.9107 8.74388L10.1667 11.488L9.08926 10.4106C8.76382 10.0851 8.23618 10.0851 7.91074 10.4106C7.58531 10.736 7.58531 11.2636 7.91074 11.5891L9.57741 13.2557C9.90285 13.5812 10.4305 13.5812 10.7559 13.2557L14.0893 9.9224Z"} fill={"#656565"} fillRule={"evenodd"} style={{"fill": "color(display-p3 0.3961 0.3961 0.3961)", "fillOpacity": "1"} as React.CSSProperties}></path>
          </svg>
          <div className={"flex-1 -mt-1"}>
            <span className={"text-label-normal text-body-light-loud mr-4 inline-block"}>
              {"Never cries wolf."}
            </span>
            <span className={"text-body-normal text-body-light-muted [&_b]:text-label-normal md-max:[&_br]:hidden"}>
              {"Fee drift is normalised within 1 ppm and still reported."}
            </span>
          </div>
        </div>
        <div className={"h-198 left-1/3 center-y bg-body-stroke-lighter w-1 lg-max:hidden"}></div>
        <div className={"h-198 left-1/2 lg:left-2/3 center-y bg-body-stroke-lighter w-1 md-max:hidden"}></div>
      </div>
    </section>
  );
}
