// Generated from the original static markup; class names and whitespace match it exactly.
// `morph` (landing only): the full bar folds into a floating icon pill once the page scrolls.
import WalletButton from "./WalletButton";

// One drawn set: 20px grid, 1.6 stroke, round caps, matching the canary mark.
const ICONS: Record<string, React.ReactNode> = {
  live: <><circle cx="10" cy="10" r="2.2" /><path d="M5.8 5.8a6 6 0 0 0 0 8.4M14.2 5.8a6 6 0 0 1 0 8.4" /></>,
  dash: <><rect x="3" y="3" width="6" height="8" rx="1.5" /><rect x="11" y="3" width="6" height="4.5" rx="1.5" /><rect x="11" y="10.5" width="6" height="6.5" rx="1.5" /><rect x="3" y="14" width="6" height="3" rx="1.5" /></>,
  flow: <><path d="M4.5 16.5V10a4 4 0 0 1 4-4h8" /><path d="M13.5 3l3 3-3 3" /></>,
  runs: <><path d="M4 5.5h12M4 10h12M4 14.5h7" /><circle cx="15" cy="14.5" r="1.4" /></>,
  v3: <><path d="M10 2.8l6.2 3.6v7.2L10 17.2l-6.2-3.6V6.4z" /><path d="M10 10V17M10 10l6-3.5M10 10L4 6.5" /></>,
};

function Item({ href, label, icon, current }: { href: string; label: string; icon: string; current?: boolean }) {
  return (
    <a href={href} title={label} aria-current={current ? "page" : undefined}>
      <svg className="ni" viewBox="0 0 20 20" aria-hidden="true">{ICONS[icon]}</svg>
      <span className="lb">{label}</span>
    </a>
  );
}

export default function Nav({ base = "", solid = false, morph = false }: { base?: string; solid?: boolean; morph?: boolean }) {
  return (
    <nav className={`nav${solid ? " scrolled" : ""}${morph ? " morph" : ""}`} aria-label="Main" data-nav="">
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
          <Item href={`${base}#live`} label="Live" icon="live" />
          {" "}
          <Item href="/dashboard" label="Dashboard" icon="dash" current={solid} />
          {" "}
          <Item href={`${base}#flow`} label="Upgrade flow" icon="flow" />
          {" "}
          <Item href="/dashboard#runs" label="Runs" icon="runs" />
          {" "}
          <Item href={`${base}#v3`} label="V3 testnet" icon="v3" />
          {" "}
        </div>
        {" "}
        <div className="nav-actions">
        <a className="nav-gh" href="https://github.com/Venkat5599/PRT">
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
