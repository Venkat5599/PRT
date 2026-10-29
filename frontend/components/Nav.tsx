// Generated from the original static markup; class names and whitespace match it exactly.
import WalletButton from "./WalletButton";
export default function Nav({ base = "", solid = false }: { base?: string; solid?: boolean }) {
  return (
    <nav className={solid ? "nav scrolled" : "nav"} aria-label="Main" data-nav="">
      {" "}
      <div className="nav-in">
        {" "}
        <a className="brand" href={`${base}#top`} aria-label="Portal Canary, top">
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
          <a href={`${base}#live`}>{"Live"}</a>
          {" "}
          <a href="/dashboard" aria-current={solid ? "page" : undefined}>{"Dashboard"}</a>
          {" "}
          <a href={`${base}#flow`}>{"Upgrade flow"}</a>
          {" "}
          <a href="/dashboard#runs">{"Runs"}</a>
          {" "}
          <a href={`${base}#v3`}>{"V3 testnet"}</a>
          {" "}
        </div>
        {" "}
        <div className="nav-actions">
        <a className="nav-gh" href="https://github.com/Venkat5599/portalcanary">
          {"GitHub "}
          <svg className="arr" viewBox="0 0 12 12" aria-hidden="true">
            <path d="M3.5 8.5l5-5M4.5 3.5h4v4"></path>
          </svg>
        </a>
        <WalletButton />
        </div>
        {" "}
      </div>
      {" "}
    </nav>
  );
}
