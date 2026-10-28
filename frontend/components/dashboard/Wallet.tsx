"use client";

import { useEffect, useState } from "react";
import { Wallet as WalletIcon, Copy, LogOut, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { WALLETS, balance, connect, installed, short, walletStore, type Connected, type WalletInfo } from "@/lib/wallet";

const KEY = "canary.wallet";

export function Wallet() {
  const [conn, setConn] = useState<Connected | null>(null);
  const [bal, setBal] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [found, setFound] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState(false);

  async function use(w: WalletInfo, quiet = false) {
    setBusy(w.id); setErr(null);
    try {
      const c = await connect(w);
      setConn(c); setBal(null); walletStore.set(c);
      try { localStorage.setItem(KEY, w.id); } catch {}
    } catch (e) { if (!quiet) setErr((e as Error).message); } finally { setBusy(null); }
  }
  useEffect(() => {
    let id: string | null = null;
    try { id = localStorage.getItem(KEY); } catch {}
    const w = WALLETS.find((x) => x.id === id);
    if (!w) return;
    const t = setTimeout(() => { if (installed(w)) use(w, true); }, 600);
    return () => clearTimeout(t);
  }, []);
  useEffect(() => {
    if (!conn) return;
    let live = true;
    const load = () => balance(conn).then((b) => live && setBal(b), () => live && setBal("unavailable"));
    load();
    const t = setInterval(load, 15000);
    return () => { live = false; clearInterval(t); };
  }, [conn]);

  const disconnect = () => { setConn(null); setBal(null); walletStore.set(null); try { localStorage.removeItem(KEY); } catch {} };

  return (
    <DropdownMenu onOpenChange={(o) => o && setFound(Object.fromEntries(WALLETS.map((w) => [w.id, installed(w)])))}>
      <DropdownMenuTrigger asChild>
        <Button size="sm" variant={conn ? "outline" : "default"}>
          <WalletIcon />{conn ? short(conn.address) : "Connect wallet"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        {conn ? (
          <>
            <DropdownMenuLabel className="space-y-0.5">
              <div className="text-xs font-normal text-muted-foreground">{conn.wallet.name} · V3 testnet</div>
              <div className="font-mono text-xs">{short(conn.address)}</div>
              <div className="text-sm">{bal ?? "…"}</div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={(e) => { e.preventDefault(); navigator.clipboard.writeText(conn.address).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1400); }); }}>
              {copied ? <Check /> : <Copy />}{copied ? "Copied" : "Copy address"}
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={disconnect}><LogOut />Disconnect</DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">Sign on the V3 testnet</DropdownMenuLabel>
            {WALLETS.map((w) => (
              found[w.id] ? (
                <DropdownMenuItem key={w.id} disabled={!!busy} onSelect={(e) => { e.preventDefault(); use(w); }}>
                  {w.name}<span className="ml-auto text-xs text-muted-foreground">{busy === w.id ? "connecting…" : w.kind}</span>
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem key={w.id} asChild><a href={w.install} target="_blank" rel="noreferrer">{w.name}<span className="ml-auto text-xs text-muted-foreground">install</span></a></DropdownMenuItem>
              )
            ))}
            {err && <p className="px-2 py-1.5 text-xs text-destructive">{err}</p>}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
