// Generated from the landing markup by landing-port/gen.py. Do not edit by hand:
// change the source or the generator and regenerate.

export default function Footer() {
  return (
    <footer style={{"--body-light-loud": "#141414", "--body-light-ghost": "#A4A4A4", "--body-light-muted": "#656565"} as React.CSSProperties} className={"footer"}>
      <div className={"footer-container px-24 sm:px-32 lg:px-24 xl:px-0"}>
        <div className={"footer-header"}>
          <a href={"/"} className={"footer-brand"}>
            <img alt={"Portal Canary logo"} decoding={"async"} fetchPriority={"low"} height={"44"} src={"/assets/images/cta/logo-mark.png"} width={"44"} className={"footer-logo footer-brand-logo"} />
            <span className={"footer-brand-name"}>
              {"Portal Canary"}
            </span>
          </a>
          <a aria-label={"System status: All systems are operational"} data-footer-status={""} href={"https://github.com/Venkat5599/PRT"} className={"footer-status-pill"} target={"_blank"} rel={"noopener"}>
            <span data-footer-status-indicator={""} style={{"--status-dot": "#14A362", "--status-ring": "rgba(18, 163, 98, 0.12)", "--status-glow": "rgba(20, 163, 98, 1)"} as React.CSSProperties} className={"footer-status-indicator"}>
              <span className={"footer-status-dot"}></span>
            </span>
            <span data-footer-status-text={""} className={"footer-status-text"}>
              {"Apache-2.0, open source"}
            </span>
          </a>
        </div>
        <div aria-hidden={"true"} className={"footer-divider footer-divider-top"}></div>
        <div className={"footer-links"}>
          <nav aria-label={"Tools"} className={"footer-section"}>
            <h2 className={"footer-section-title"}>
              {"Tools"}
            </h2>
            <ul className={"footer-section-links"}>
              <li>
                <a href={"https://github.com/Venkat5599/PRT#readme"} className={"footer-link"} target={"_blank"} rel={"noopener"}>
                  {"Canary CLI"}
                </a>
              </li>
              <li>
                <a href={"/dashboard#compare"} className={"footer-link"}>
                  {"Browser dashboard"}
                </a>
              </li>
              <li>
                <a href={"/dashboard#compare"} className={"footer-link"}>
                  {"Live compare"}
                </a>
              </li>
            </ul>
          </nav>
          <nav aria-label={"Docs & Runs"} className={"footer-section"}>
            <h2 className={"footer-section-title"}>
              {"Docs & Runs"}
            </h2>
            <ul className={"footer-section-links"}>
              <li>
                <a href={"https://github.com/Venkat5599/PRT#readme"} className={"footer-link"} target={"_blank"} rel={"noopener"}>
                  {"README"}
                </a>
              </li>
              <li>
                <a href={"https://github.com/Venkat5599/PRT/blob/main/docs/V3_READINESS.md"} className={"footer-link"} target={"_blank"} rel={"noopener"}>
                  {"V3 readiness"}
                </a>
              </li>
              <li>
                <a href={"/dashboard#runs"} className={"footer-link"}>
                  {"Runs"}
                </a>
              </li>
              <li>
                <a href={"https://github.com/Venkat5599/PRT/blob/main/docs/PLAN.md"} className={"footer-link"} target={"_blank"} rel={"noopener"}>
                  {"Plan"}
                </a>
              </li>
            </ul>
          </nav>
          <nav aria-label={"Recorded runs"} className={"footer-section"}>
            <h2 className={"footer-section-title"}>
              {"Recorded runs"}
            </h2>
            <ul className={"footer-section-links"}>
              <li>
                <a href={"/reports/self-compare/report.html"} className={"footer-link"}>
                  {"Control run"}
                </a>
              </li>
              <li>
                <a href={"/reports/upgrade-fee10x/report.html"} className={"footer-link"}>
                  {"Byte fee \u00d710"}
                </a>
              </li>
              <li>
                <a href={"/reports/upgrade-ed100x/report.html"} className={"footer-link"}>
                  {"Deposit \u00d7100"}
                </a>
              </li>
              <li>
                <a href={"https://github.com/Venkat5599/PRT/tree/main/examples/mainnet-vs-v3"} className={"footer-link"} target={"_blank"} rel={"noopener"}>
                  {"Mainnet vs V3"}
                </a>
              </li>
              <li>
                <a href={"https://github.com/Venkat5599/PRT/tree/main/backend/tests/workflows"} className={"footer-link"} target={"_blank"} rel={"noopener"}>
                  {"Workflow corpus"}
                </a>
              </li>
            </ul>
          </nav>
          <nav aria-label={"Project"} className={"footer-section"}>
            <h2 className={"footer-section-title"}>
              {"Project"}
            </h2>
            <ul className={"footer-section-links"}>
              <li>
                <a href={"https://github.com/Venkat5599/PRT/issues"} className={"footer-link"} target={"_blank"} rel={"noopener"}>
                  {"Open an issue"}
                </a>
              </li>
              <li>
                <a href={"https://github.com/Venkat5599/PRT#license"} className={"footer-link"} target={"_blank"} rel={"noopener"}>
                  {"License"}
                </a>
              </li>
              <li>
                <a href={"https://github.com/Venkat5599/PRT"} className={"footer-link"} target={"_blank"} rel={"noopener"}>
                  {"Repository"}
                </a>
              </li>
            </ul>
          </nav>
        </div>
        <div aria-hidden={"true"} className={"footer-divider footer-divider-bottom"}></div>
        <div className={"footer-meta"}>
          <p className={"footer-copyright"}>
            {"\u00a9 2026 Portal Canary"}
          </p>
          <p className={"footer-yc"}>
            <img alt={"Portal Canary mark"} decoding={"async"} fetchPriority={"low"} height={"20"} src={"/assets/images/footer/y.png"} width={"20"} className={"footer-yc-logo"} />
            <span>
              {"built for Portaldot"}
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}
