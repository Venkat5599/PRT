"use client";

import type { ReactNode } from "react";
import { Check, X, Loader2, Minus } from "lucide-react";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// Small pieces every dashboard view shares, built on shadcn/ui.

export type Tone = "good" | "warn" | "bad" | "info" | "muted";
export const toneText: Record<Tone, string> = {
  good: "text-success", warn: "text-warning", bad: "text-destructive", info: "text-primary", muted: "text-muted-foreground",
};
const toneDot: Record<Tone, string> = {
  good: "bg-success/10 text-success", warn: "bg-warning/10 text-warning", bad: "bg-destructive/10 text-destructive", info: "bg-primary/10 text-primary", muted: "bg-muted text-muted-foreground",
};

/** A result as a word in a soft tint: Pass, Regression, Critical… */
export function Status({ tone, children, className }: { tone: Tone; children: ReactNode; className?: string }) {
  return <span className={cn("inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium whitespace-nowrap", toneDot[tone], className)}>{children}</span>;
}

export function Mark({ state }: { state: "ok" | "bad" | "wait" | "skip" | "run" }) {
  const c = "size-4 shrink-0";
  if (state === "ok") return <Check className={cn(c, "text-success")} aria-label="ok" />;
  if (state === "bad") return <X className={cn(c, "text-destructive")} aria-label="failed" />;
  if (state === "run") return <Loader2 className={cn(c, "animate-spin text-primary")} aria-label="running" />;
  if (state === "skip") return <Minus className={cn(c, "text-muted-foreground")} aria-label="skipped" />;
  return <span className={cn(c, "inline-block rounded-full border border-dashed border-muted-foreground/40")} aria-label="waiting" />;
}

export function Panel({ title, description, action, children, className, flush }: {
  title?: ReactNode; description?: ReactNode; action?: ReactNode; children: ReactNode; className?: string; flush?: boolean;
}) {
  return (
    <Card className={cn("min-w-0 gap-0 overflow-hidden py-0 shadow-none", className)}>
      {(title || action) && (
        <CardHeader className="border-b px-5 py-4 [.border-b]:pb-4">
          {title && <CardTitle className="text-sm font-medium">{title}</CardTitle>}
          {description && <CardDescription className="text-xs">{description}</CardDescription>}
          {action && <CardAction>{action}</CardAction>}
        </CardHeader>
      )}
      <CardContent className={cn(flush ? "p-0" : "px-5 py-4")}>{children}</CardContent>
    </Card>
  );
}

/** Label/value rows. */
export function KV({ rows, className }: { rows: [ReactNode, ReactNode][]; className?: string }) {
  return (
    <dl className={cn("divide-y text-sm", className)}>
      {rows.map(([k, v], i) => (
        <div key={i} className="grid grid-cols-[minmax(96px,140px)_1fr] gap-4 px-5 py-3">
          <dt className="text-muted-foreground">{k}</dt>
          <dd className="min-w-0 break-words">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

/** A row of headline numbers. */
export function Stats({ items }: { items: { label: string; value: ReactNode; tone?: Tone }[] }) {
  return (
    <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border bg-border sm:grid-cols-4">
      {items.map((s) => (
        <div key={s.label} data-stat={s.label} className="bg-card px-5 py-4">
          <div className="text-xs text-muted-foreground">{s.label}</div>
          <div className={cn("mt-1 font-heading text-2xl font-medium tracking-tight", s.tone && toneText[s.tone])}>{s.value}</div>
        </div>
      ))}
    </div>
  );
}

export const Mono = ({ children, className }: { children: ReactNode; className?: string }) => <code className={cn("font-mono text-[12.5px]", className)}>{children}</code>;
export const Empty = ({ children }: { children: ReactNode }) => <p className="px-5 py-8 text-center text-sm text-muted-foreground">{children}</p>;
export const ErrorText = ({ children }: { children: ReactNode }) => <p className="text-sm text-destructive">{children}</p>;
export const fmt = (n: number | null | undefined) => (n == null ? "–" : n.toLocaleString("en"));
export function download(name: string, data: unknown) {
  const text = typeof data === "string" ? data : JSON.stringify(data, (_k, v) => (typeof v === "bigint" ? v.toString() : v), 2);
  const url = URL.createObjectURL(new Blob([text], { type: "application/json" }));
  Object.assign(document.createElement("a"), { href: url, download: name }).click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
