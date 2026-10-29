"use client";

import { useEffect, useState, type ComponentType } from "react";
import { Plus, ListChecks, Server, GitCompare, Stethoscope, Scale, BookCheck, ExternalLink } from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader,
  SidebarInset, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger, useSidebar,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Node } from "@/lib/canary";
import { Wallet } from "./Wallet";
import { DoctorPanel, InvariantsPanel, RegistryPanel } from "./Panels";
import { TestPanel } from "./TestPanel";
import { NewRun } from "./NewRun";
import { RunView } from "./RunView";
import { RunsList } from "./RunsList";
import { ComparePanel } from "./ComparePanel";

// Hash routes (#new, #run/<id>, #runs, #compare …) so every view can be linked.
type Route = { view: string; arg?: string };
const NAV: { group: string; items: { id: string; label: string; icon: ComponentType }[] }[] = [
  { group: "Test", items: [
    { id: "new", label: "New run", icon: Plus },
    { id: "runs", label: "Runs", icon: ListChecks },
    { id: "node", label: "On your node", icon: Server },
  ] },
  { group: "Inspect", items: [
    { id: "compare", label: "Compare", icon: GitCompare },
    { id: "doctor", label: "Doctor", icon: Stethoscope },
    { id: "invariants", label: "Supply", icon: Scale },
    { id: "registry", label: "Registry", icon: BookCheck },
  ] },
];
const TITLES: Record<string, string> = { new: "New run", run: "Run", runs: "Runs", node: "On your node", compare: "Compare", doctor: "Doctor", invariants: "Supply", registry: "Registry" };

function read(): Route {
  const [view, arg] = location.hash.replace(/^#\/?/, "").split("/");
  return TITLES[view] ? { view, arg } : { view: "new" };
}

function ChainStatus() {
  const [heads, setHeads] = useState<Record<string, number | "down" | undefined>>({});
  useEffect(() => {
    const chains = [["Mainnet", "wss://mainnet.portaldot.io"], ["V3 testnet", "wss://test-node-v3.portaldot.dev"]];
    let live = true;
    const poll = () => chains.forEach(async ([name, url]) => {
      const n = new Node(url, { timeout: 10000 });
      try {
        const h = await n.call<{ number: string }>("chain_getHeader");
        if (live) setHeads((x) => ({ ...x, [name]: parseInt(h.number, 16) }));
      } catch { if (live) setHeads((x) => ({ ...x, [name]: "down" })); } finally { n.close(); }
    });
    poll();
    const t = setInterval(poll, 12000);
    return () => { live = false; clearInterval(t); };
  }, []);
  return (
    <div className="space-y-1.5 px-2 pb-1 text-xs group-data-[collapsible=icon]:hidden">
      {["Mainnet", "V3 testnet"].map((c) => {
        const v = heads[c];
        return (
          <div key={c} className="flex justify-between gap-2 text-muted-foreground">
            <span>{c}</span>
            <span className={v === "down" ? "text-destructive" : "font-mono text-foreground"}>{v === "down" ? "unreachable" : v ? `#${v.toLocaleString("en")}` : "…"}</span>
          </div>
        );
      })}
    </div>
  );
}

function Nav({ view }: { view: string }) {
  const { setOpenMobile } = useSidebar();
  return (
    <>
      {NAV.map((g) => (
        <SidebarGroup key={g.group}>
          <SidebarGroupLabel>{g.group}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {g.items.map((i) => (
                <SidebarMenuItem key={i.id}>
                  <SidebarMenuButton asChild isActive={view === i.id || (i.id === "runs" && view === "run")} tooltip={i.label}>
                    <a href={`#${i.id}`} onClick={() => setOpenMobile(false)}><i.icon />{i.label}</a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
    </>
  );
}

export default function Shell() {
  const [route, setRoute] = useState<Route>({ view: "new" });
  const [seen, setSeen] = useState<Set<string>>(new Set());

  useEffect(() => {
    const go = () => { const r = read(); setRoute(r); setSeen((s) => new Set(s).add(r.view)); window.scrollTo(0, 0); };
    go();
    addEventListener("hashchange", go);
    return () => removeEventListener("hashchange", go);
  }, []);

  const v = route.view;
  // Tool views mount the first time they are opened and then stay mounted, so their reads survive.
  const keep = (id: string, el: React.ReactNode) => (seen.has(id) || v === id ? <div hidden={v !== id}>{el}</div> : null);
  return (
    <TooltipProvider delayDuration={300}>
      <SidebarProvider>
        <Sidebar collapsible="icon">
          <SidebarHeader>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton size="lg" asChild>
                  <a href="/">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/assets/images/header/logo.png" width={28} height={28} alt="" className="size-7 rounded-md" />
                    <span className="font-heading text-[15px] font-medium">Portal Canary</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarHeader>
          <SidebarContent><Nav view={v} /></SidebarContent>
          <SidebarFooter><ChainStatus /></SidebarFooter>
        </Sidebar>
        <SidebarInset>
          <header className="sticky top-0 z-10 flex h-14 items-center gap-2 border-b bg-background/90 px-4 backdrop-blur">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-1 data-[orientation=vertical]:h-4" />
            <h1 className="flex min-w-0 items-center gap-1.5 text-sm font-medium">
              {v === "run" && route.arg ? <><a href="#runs" className="text-muted-foreground hover:text-foreground">Runs</a><span className="text-muted-foreground">/</span><code className="truncate font-mono">{route.arg}</code></> : TITLES[v]}
            </h1>
            <div className="ml-auto flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex"><a href="https://github.com/Venkat5599/portalcanary" target="_blank" rel="noreferrer"><ExternalLink />GitHub</a></Button>
              <Wallet />
            </div>
          </header>
          <div className="mx-auto w-full max-w-6xl flex-1 p-4 md:p-8">
            {v === "new" && <NewRun />}
            {v === "run" && route.arg && <RunView key={route.arg} id={route.arg} />}
            {keep("runs", <RunsList />)}
            {keep("node", <TestPanel />)}
            {keep("compare", <ComparePanel />)}
            {keep("doctor", <DoctorPanel />)}
            {keep("invariants", <InvariantsPanel />)}
            {keep("registry", <RegistryPanel />)}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
