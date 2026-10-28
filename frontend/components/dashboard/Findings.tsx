"use client";

import { useMemo, useState } from "react";
import { ChevronRight } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Change, Risk, Severity } from "@/lib/canary";
import { Status, Empty, type Tone } from "./kit";
import { cn } from "@/lib/utils";

// Risks first (what breaks, for whom, and the rows that prove it), then every change.
export const SEVERITY: Record<Severity, { label: string; tone: Tone }> = {
  critical: { label: "Critical", tone: "bad" },
  breaking: { label: "Breaking", tone: "bad" },
  migration: { label: "Needs migration", tone: "warn" },
  behaviour: { label: "Behaviour change", tone: "warn" },
  client: { label: "Client update", tone: "info" },
};

/** "T::Balance = 100000000000000 (0x00407a…)" -> "T::Balance = 100000000000000" */
export const plain = (v: string | null) => (v ?? "").replace(/\s*\(0x[0-9a-f]+\)$/i, "");
const Val = ({ v }: { v: string | null }) =>
  v == null ? <span className="text-muted-foreground italic">absent</span> : <span className="font-mono text-xs break-all" title={v}>{plain(v)}</span>;

function Evidence({ rows }: { rows: Change[] }) {
  return (
    <Table>
      <TableHeader><TableRow><TableHead className="pl-5">Item</TableHead><TableHead>Before</TableHead><TableHead>After</TableHead></TableRow></TableHeader>
      <TableBody>{rows.map((c) => (
        <TableRow key={c.path}>
          <TableCell className="pl-5 align-top font-mono text-xs">{c.path}</TableCell>
          <TableCell className="max-w-72 align-top whitespace-normal"><Val v={c.baseline} /></TableCell>
          <TableCell className="max-w-72 align-top whitespace-normal"><Val v={c.candidate} /></TableCell>
        </TableRow>
      ))}</TableBody>
    </Table>
  );
}

export function RiskList({ risks }: { risks: Risk[] }) {
  const [open, setOpen] = useState<string | null>(risks[0] ? `${risks[0].rule}${risks[0].title}` : null);
  if (!risks.length) return <Empty>No compatibility risks.</Empty>;
  return (
    <div className="divide-y">
      {risks.map((r) => {
        const k = `${r.rule}${r.title}`;
        return (
          <Collapsible key={k} open={open === k} onOpenChange={(o) => setOpen(o ? k : null)}>
            <CollapsibleTrigger className="flex w-full items-center gap-3 px-5 py-3.5 text-left text-sm hover:bg-muted/50">
              <ChevronRight className={cn("size-4 shrink-0 text-muted-foreground transition-transform", open === k && "rotate-90")} />
              <Status tone={SEVERITY[r.severity].tone} className="shrink-0 justify-center sm:w-32">{SEVERITY[r.severity].label}</Status>
              <span className="min-w-0 flex-1 font-medium [overflow-wrap:anywhere]">{r.title}</span>
              <span className="text-xs text-muted-foreground">{r.evidence.length}</span>
            </CollapsibleTrigger>
            <CollapsibleContent className="border-t bg-muted/30">
              <p className="px-5 py-3 text-sm text-muted-foreground">{r.why}</p>
              {r.evidence.length > 0 && <div className="border-t bg-background"><Evidence rows={r.evidence} /></div>}
            </CollapsibleContent>
          </Collapsible>
        );
      })}
    </div>
  );
}

export function riskCounts(risks: Risk[]) {
  return (Object.keys(SEVERITY) as Severity[]).map((s) => ({ s, n: risks.filter((r) => r.severity === s).length })).filter((x) => x.n);
}

const CATS: [string, string, (p: string[]) => boolean][] = [
  ["all", "All", () => true],
  ["call", "Calls", (p) => p[1] === "call"],
  ["event", "Events", (p) => p[1] === "event"],
  ["error", "Errors", (p) => p[1] === "error"],
  ["storage", "Storage", (p) => p[1] === "storage"],
  ["constant", "Constants", (p) => p[1] === "constant"],
  ["pallet", "Pallets", (p) => p.length === 1 || p[1] === "index"],
  ["runtime", "Runtime & APIs", (p) => p[0] === "runtime" || p[0] === "extrinsic"],
];
const SIGN = { added: ["+", "text-success"], removed: ["−", "text-destructive"], modified: ["~", "text-warning"] } as const;

export function ChangeTable({ changes }: { changes: Change[] }) {
  const [cat, setCat] = useState("all");
  const [q, setQ] = useState("");
  const [shown, setShown] = useState(50);
  const counts = useMemo(() => Object.fromEntries(CATS.map(([id, , f]) => [id, changes.filter((c) => f(c.path.split("."))).length])), [changes]);
  const rows = useMemo(() => {
    const f = CATS.find((c) => c[0] === cat)![2];
    const s = q.trim().toLowerCase();
    return changes.filter((c) => f(c.path.split(".")) && (!s || c.path.toLowerCase().includes(s)));
  }, [changes, cat, q]);
  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 border-b px-5 py-3">
        <Tabs value={cat} onValueChange={(x) => { setCat(x); setShown(50); }} className="w-full min-w-0 overflow-x-auto sm:w-auto">
          <TabsList>
            {CATS.filter(([id]) => id === "all" || counts[id]).map(([id, label]) => (
              <TabsTrigger key={id} value={id} className="gap-1.5">{label}<span className="text-xs text-muted-foreground tabular-nums">{counts[id]}</span></TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <Input type="search" placeholder="Filter by name" value={q} onChange={(e) => { setQ(e.target.value); setShown(50); }} className="h-9 w-full sm:ml-auto sm:w-56" aria-label="Filter changes" />
      </div>
      {rows.length ? (
        <Table>
          <TableHeader><TableRow><TableHead className="w-8 pl-5" /><TableHead>Item</TableHead><TableHead>Before</TableHead><TableHead>After</TableHead></TableRow></TableHeader>
          <TableBody>{rows.slice(0, shown).map((c) => (
            <TableRow key={c.path}>
              <TableCell className={cn("pl-5 font-mono font-semibold", SIGN[c.kind][1])}>{SIGN[c.kind][0]}</TableCell>
              <TableCell className="align-top font-mono text-xs">{c.path}</TableCell>
              <TableCell className="max-w-72 align-top whitespace-normal">{c.baseline != null && <Val v={c.baseline} />}</TableCell>
              <TableCell className="max-w-72 align-top whitespace-normal">{c.candidate != null && <Val v={c.candidate} />}</TableCell>
            </TableRow>
          ))}</TableBody>
        </Table>
      ) : <Empty>Nothing matches.</Empty>}
      {rows.length > shown && (
        <div className="border-t px-5 py-3"><Button variant="ghost" size="sm" onClick={() => setShown((n) => n + 200)}>Show more · {rows.length - shown} left</Button></div>
      )}
    </div>
  );
}
