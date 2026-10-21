// Generated from the original static markup; class names and whitespace match it exactly.
export default function Footer() {
  return (
    <footer className="foot">
      {" "}
      <div className="foot-in">
        {" "}
        <div className="foot-brand">
          {" "}
          <a className="brand" href="#top">
            <svg className="mark" viewBox="0 0 24 24" aria-hidden="true">
              <path className="m-a" d="M3 8.5h5.5l1.8-4.5 3 9 1.7-4.5H21"></path>
              <path className="m-b" d="M3 16h5.5l1.8-2.5 1.8 2.5H21"></path>
            </svg>
            <span>{"PORTAL CANARY"}</span>
          </a>
          {" "}
          <p>{"Differential runtime-upgrade testing for Portaldot. Portaldot Hacker House 2026, Node Operations & Tooling."}</p>
          {" "}
        </div>
        {" "}
        <nav className="foot-cols" aria-label="Footer">
          {" "}
          <div>
            <p>{"Product"}</p>
            <a href="/dashboard#cli">{"Commands"}</a>
            <a href="#flow">{"Upgrade flow"}</a>
            <a href="/dashboard#runs">{"Recorded runs"}</a>
          </div>
          {" "}
          <div>
            <p>{"Network"}</p>
            <a href="#v3">{"V3 testnet"}</a>
            <a href="https://node-console.portaldot.dev">{"Node explorer"}</a>
            <a href="https://github.com/Venkat5599/PRT/blob/main/docs/V3_READINESS.md">{"Readiness log"}</a>
          </div>
          {" "}
          <div>
            <p>{"Source"}</p>
            <a href="https://github.com/Venkat5599/PRT">{"GitHub"}</a>
            <a href="https://github.com/Venkat5599/PRT/blob/main/README.md">{"README"}</a>
            <a href="https://github.com/Venkat5599/PRT/blob/main/docs/ARCHITECTURE.md">{"Architecture"}</a>
          </div>
          {" "}
        </nav>
        {" "}
      </div>
      {" "}
      <p className="legal">{"Apache-2.0 · Injected candidates are labelled; nothing here says an upgrade is safe."}</p>
      {" "}
      <div className="word" aria-hidden="true">{"CANARY"}</div>
      {" "}
    </footer>
  );
}
