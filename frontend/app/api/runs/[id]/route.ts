import { NextResponse } from "next/server";
import { HttpError, findRun, results, steps } from "@/lib/runs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** One run: its live steps while it runs, and every result file once it has finished. */
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    if (!/^[0-9a-f]{12}$/.test(id)) throw new HttpError(400, "not a run id");
    const run = await findRun(id);
    // Dispatch to listing takes a few seconds: an unknown id is "queued" until it appears.
    if (!run) return NextResponse.json({ id, status: "pending", steps: [], files: null });
    const [s, files] = await Promise.all([steps(run.gh_id), run.status === "completed" ? results(run.gh_id, id) : Promise.resolve(null)]);
    const done = run.status === "completed";
    return NextResponse.json({ ...run, steps: s, files }, {
      headers: { "cache-control": done && files ? "public, s-maxage=86400, stale-while-revalidate=604800" : "no-store" },
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: e instanceof HttpError ? e.status : 500 });
  }
}
