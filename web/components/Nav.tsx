// Generated from the original static markup; class names and whitespace match it exactly.
export default function Nav() {
  return (
    <nav className="nav" aria-label="Main" data-nav="">
      {" "}
      <div className="nav-in">
        {" "}
        <a className="brand" href="#top" aria-label="Portal Canary, top">
          {" "}
          <svg className="mark" viewBox="0 0 24 24" aria-hidden="true">
            <path className="m-a" d="M3 8.5h5.5l1.8-4.5 3 9 1.7-4.5H21"></path>
            <path className="m-b" d="M3 16h5.5l1.8-2.5 1.8 2.5H21"></path>
          </svg>
          {" "}
          <span>{"PORTAL CANARY"}</span>
          {" "}
        </a>
        {" "}
        <div className="links">
          {" "}
          <a href="#live">{"Live"}</a>
          {" "}
          <a href="#harness">{"Platform"}</a>
          {" "}
          <a href="#flow">{"Upgrade flow"}</a>
          {" "}
          <a href="#runs">{"Runs"}</a>
          {" "}
          <a href="#v3">{"V3 testnet"}</a>
          {" "}
        </div>
        {" "}
        <a className="btn btn-blue nav-cta" href="https://github.com/Venkat5599/PRT">
          {"GitHub "}
          <svg className="arr" viewBox="0 0 12 12" aria-hidden="true">
            <path d="M3.5 8.5l5-5M4.5 3.5h4v4"></path>
          </svg>
        </a>
        {" "}
      </div>
      {" "}
    </nav>
  );
}
