import { NextResponse } from "next/server";
import { HttpError, MAX_ACTIVE, PRESETS, dispatch, hostUpload, listRuns } from "@/lib/runs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const fail = (e: unknown) => {
  const status = e instanceof HttpError ? e.status : 500;
  return NextResponse.json({ error: (e as Error).message }, { status });
};

/** Recent runs, newest first. */
export async function GET() {
  try {
    return NextResponse.json({ runs: await listRuns() });
  } catch (e) { return fail(e); }
}

// A compact runtime starts with Substrate's zstd magic; a raw one with the wasm magic.
const COMPACT = [0x52, 0xbc, 0x53, 0x76, 0x46, 0xdb, 0x8e, 0x05];
const RAW = [0x00, 0x61, 0x73, 0x6d];
const starts = (b: Uint8Array, m: number[]) => m.every((x, i) => b[i] === x);

/** Start a run: a built candidate by name, a runtime URL, or an uploaded runtime file. */
export async function POST(req: Request) {
  try {
    const active = (await listRuns(20)).filter((r) => r.status !== "completed").length;
    if (active >= MAX_ACTIVE) throw new HttpError(429, `${active} runs are in progress; start yours when one finishes`);
    const id = [...crypto.getRandomValues(new Uint8Array(6))].map((b) => b.toString(16).padStart(2, "0")).join("");
    let candidate = "", wasm_url = "", label = "";
    if ((req.headers.get("content-type") ?? "").startsWith("multipart/form-data")) {
      const form = await req.formData();
      const file = form.get("wasm");
      label = String(form.get("label") ?? "").slice(0, 200);
      if (!(file instanceof File)) throw new HttpError(400, "attach a runtime file");
      if (file.size > 4_000_000) throw new HttpError(413, "runtime files up to 4 MB: upload the .compact.wasm build");
      const bytes = new Uint8Array(await file.arrayBuffer());
      if (!starts(bytes, COMPACT) && !starts(bytes, RAW)) throw new HttpError(400, `${file.name} is not a WebAssembly runtime`);
      wasm_url = await hostUpload(id, bytes);
      candidate = "url";
      label ||= file.name;
    } else {
      const body = (await req.json()) as { candidate?: string; wasm_url?: string; label?: string };
      label = String(body.label ?? "").slice(0, 200);
      if (body.wasm_url) {
        if (!/^https:\/\/\S+$/.test(body.wasm_url)) throw new HttpError(400, "the runtime URL must be https");
        candidate = "url"; wasm_url = body.wasm_url;
      } else if (PRESETS.includes(body.candidate as (typeof PRESETS)[number])) {
        candidate = body.candidate!;
      } else throw new HttpError(400, `pick one of ${PRESETS.join(", ")}, a URL or a file`);
    }
    await dispatch({ run_id: id, candidate, wasm_url, label });
    return NextResponse.json({ id }, { status: 202 });
  } catch (e) { return fail(e); }
}
