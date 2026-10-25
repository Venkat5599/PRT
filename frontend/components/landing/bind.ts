import type { ReactNode } from "react";

// Generated views call b(key, index, baseClassName) on every bound element and spread the
// result over its static attributes, and k(key, index) for bound children (undefined keeps
// the original markup). Components supply both from their own state.
export type Bind = (key: string, index: number, base: string) => Record<string, unknown>;
export type Kids = (key: string, index: number) => ReactNode | undefined;

export const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(" ");

/**
 * className = base without `remove`, plus `add`. A class that is both in base and in `add`
 * keeps its original position, so an unchanged state renders the original markup exactly.
 */
export function swap(base: string, remove: string[], add: (string | false | null | undefined)[] = []) {
  const want = new Set(add.filter(Boolean).flatMap((a) => (a as string).split(" ")).filter(Boolean));
  const drop = new Set(remove.flatMap((r) => r.split(" ")));
  const kept = base.split(" ").filter((c) => c && (!drop.has(c) || want.has(c)));
  const have = new Set(kept);
  return [...kept, ...[...want].filter((c) => !have.has(c))].join(" ");
}
