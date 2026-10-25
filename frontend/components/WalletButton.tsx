"use client";

import { useEffect, useRef, useState } from "react";
import { WALLETS, V3, balance, connect, installed, short, walletStore, type Connected, type WalletInfo } from "@/lib/wallet";

const KEY = "canary.wallet";

export default function WalletButton() {
  const [open, setOpen] = useState(false);
  const [conn, setConn] = useState<Connected | null>(null);
  const [bal, setBal] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [found, setFound] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  // Extensions inject after load; look again whenever the menu opens.
  useEffect(() => { if (open) setFound(Object.fromEntries(WALLETS.map((w) => [w.id, installed(w)]))); }, [open]);

  useEffect(() => {
    // pointerdown, not click: by click time a re-render may have detached the target.
    const close = (e: PointerEvent) => { if (!box.current?.contains(e.target as Node)) setOpen(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("pointerdown", close); document.removeEventListener("keydown", esc); };
  }, []);

  // Reconnect the wallet used last time, silently; if that fails, stay disconnected.
  useEffect(() => {
    let id: string | null = null;
    try { id = localStorage.getItem(KEY); } catch {}
    const w = WALLETS.find((x) => x.id === id);
    if (!w) return;
    const t = setTimeout(() => { if (installed(w)) use(w, true); }, 600);
    return () => clearTimeout(t);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!conn) return;
    let live = true;
    const load = () => balance(conn).then((b) => live && setBal(b), () => live && setBal("unavailable"));
    load();
    const t = setInterval(load, 15000);
    return () => { live = false; clearInterval(t); };
  }, [conn]);

  async function use(w: WalletInfo, quiet = false) {
    setBusy(w.id); setErr(null);
    try {
      const c = await connect(w);
      setConn(c); setBal(null); walletStore.set(c);
      try { localStorage.setItem(KEY, w.id); } catch {}
    } catch (e) {
      if (!quiet) setErr((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  function disconnect() {
    setConn(null); setBal(null); setOpen(false); walletStore.set(null);
    try { localStorage.removeItem(KEY); } catch {}
  }

  return (
    <div className="wallet" ref={box}>
      <button type="button" className={`btn btn-blue wallet-btn${conn ? " is-on" : ""}`} aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        {conn ? <><i className="wallet-dot" aria-hidden="true" />{short(conn.address)}</> : "Connect wallet"}
      </button>
      {open && (
        <div className="wallet-menu" role="dialog" aria-label={conn ? "Wallet" : "Connect a wallet"}>
          {conn ? (
            <>
              <p className="wm-net">{V3.name}</p>
              <p className="wm-who">{conn.name ?? conn.wallet.name}</p>
              <button type="button" className="wm-addr" onClick={async () => {
                try { await navigator.clipboard.writeText(conn.address); setCopied(true); setTimeout(() => setCopied(false), 1400); } catch {}
              }}>
                <code>{conn.address}</code><span>{copied ? "copied" : "copy"}</span>
              </button>
              <div className="wm-bal"><span>Balance</span><b>{bal ?? "reading…"}</b></div>
              <p className="wm-note">Need tPOT? Ask in the Portaldot Discord faucet channel with this address.</p>
              <div className="wm-actions">
                <a href={V3.explorer} target="_blank" rel="noreferrer">Explorer</a>
                <button type="button" onClick={disconnect}>Disconnect</button>
              </div>
            </>
          ) : (
            <>
              <p className="wm-net">Connect to {V3.name}</p>
              <ul className="wm-list">
                {WALLETS.map((w) => (
                  <li key={w.id}>
                    {found[w.id] ? (
                      <button type="button" disabled={!!busy} onClick={() => use(w)}>
                        <b>{w.name}</b><small>{busy === w.id ? "approve in the extension…" : w.kind === "evm" ? "EVM · chain 420420777" : "Substrate"}</small>
                      </button>
                    ) : (
                      <a href={w.install} target="_blank" rel="noreferrer">
                        <b>{w.name}</b><small>not installed · get it</small>
                      </a>
                    )}
                  </li>
                ))}
              </ul>
              {err && <p className="wm-err">{err}</p>}
              <p className="wm-note">Optional. Everything on this site works without a wallet.</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
