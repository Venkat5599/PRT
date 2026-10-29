// Server side of a Portal Canary run. A run is one execution of .github/workflows/canary-run.yml
// on GitHub's runners: the dashboard asks for it here, follows its steps live, and reads its
// result files when it finishes. Each run's files are kept as <id>.zip on the repo's `runs`
// release (permanent) and as the artifact canary-run-<id> (30 days). The GitHub token lives only
// in the server environment (CANARY_GH_TOKEN); the browser never sees it.
import { unzipSync, strFromU8 } from "fflate";

export const REPO = process.env.CANARY_REPO ?? "Venkat5599/PRT";
const WORKFLOW = "canary-run.yml";
const API = "https://api.github.com";
export const PRESETS = ["clean", "ed100x", "fee10x", "halve-reserved", "source-60s"] as const;
export const MAX_ACTIVE = 3;

export class HttpError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

function token() {
  const t = process.env.CANARY_GH_TOKEN;
  if (!t) throw new HttpError(503, "runs are not enabled on this deployment: CANARY_GH_TOKEN is not set");
  return t;
}

async function gh(path: string, init: RequestInit = {}): Promise<Response> {
  const res = await fetch(path.startsWith("http") ? path : `${API}${path}`, {
    ...init,
    headers: { authorization: `Bearer ${token()}`, accept: "application/vnd.github+json", "x-github-api-version": "2022-11-28", ...(init.headers ?? {}) },
    cache: "no-store",
  });
  if (!res.ok && res.status !== 404) throw new HttpError(502, `GitHub ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return res;
}

export type RunRow = {
  id: string; candidate: string; status: string; conclusion: string | null;
  created_at: string; updated_at: string; html_url: string; gh_id: number;
};
type GhRun = { id: number; name?: string; display_title: string; status: string; conclusion: string | null; created_at: string; updated_at: string; html_url: string };
const NAME = /^canary run ([0-9a-f]{12}) · (.+)$/;
const row = (r: GhRun): RunRow | null => {
  const m = NAME.exec(r.display_title ?? r.name ?? "");
  return m ? { id: m[1], candidate: m[2], status: r.status, conclusion: r.conclusion, created_at: r.created_at, updated_at: r.updated_at, html_url: r.html_url, gh_id: r.id } : null;
};

type Asset = { name: string; label: string | null; created_at: string; updated_at: string; browser_download_url: string };
const KEPT = /^([0-9a-f]{12})\.zip$/;
/** Runs whose files were kept on the `runs` release. */
async function kept(): Promise<Asset[]> {
  const res = await gh(`/repos/${REPO}/releases/tags/runs`);
  if (res.status === 404) return [];
  return ((await res.json()) as { assets: Asset[] }).assets.filter((a) => KEPT.test(a.name));
}

/** Recent runs from Actions, plus older ones that only the `runs` release still has. Newest first. */
export async function listRuns(limit = 30): Promise<RunRow[]> {
  const [res, assets] = await Promise.all([gh(`/repos/${REPO}/actions/workflows/${WORKFLOW}/runs?per_page=${limit}&event=workflow_dispatch`), kept().catch(() => [])]);
  const live = res.status === 404 ? [] : ((await res.json()) as { workflow_runs: GhRun[] }).workflow_runs.map(row).filter((x): x is RunRow => !!x);
  const seen = new Set(live.map((r) => r.id));
  const old: RunRow[] = assets.filter((a) => !seen.has(KEPT.exec(a.name)![1])).map((a) => ({
    id: KEPT.exec(a.name)![1], candidate: a.label || "run", status: "completed", conclusion: "success",
    created_at: a.created_at, updated_at: a.updated_at, html_url: `https://github.com/${REPO}/releases/tag/runs`, gh_id: 0,
  }));
  return [...live, ...old].sort((x, y) => Date.parse(y.created_at) - Date.parse(x.created_at));
}

export async function findRun(id: string): Promise<RunRow | null> {
  return (await listRuns(100)).find((r) => r.id === id) ?? null;
}

/** Hosts a visitor's runtime file as an asset of the repo's `uploads` pre-release; returns its URL. */
export async function hostUpload(id: string, bytes: Uint8Array): Promise<string> {
  const tag = "uploads";
  let rel = await gh(`/repos/${REPO}/releases/tags/${tag}`);
  if (rel.status === 404) {
    rel = await gh(`/repos/${REPO}/releases`, {
      method: "POST",
      body: JSON.stringify({ tag_name: tag, name: "Runtimes uploaded for dashboard runs", prerelease: true, body: "Candidate runtimes submitted through the dashboard. Each file is named after the run that tested it." }),
    });
  }
  const { upload_url } = (await rel.json()) as { upload_url: string };
  const url = upload_url.replace(/\{.*$/, "") + `?name=${id}.compact.wasm`;
  const up = await gh(url, { method: "POST", headers: { "content-type": "application/octet-stream" }, body: bytes as unknown as BodyInit });
  const asset = (await up.json()) as { browser_download_url: string };
  return asset.browser_download_url;
}

export async function dispatch(inputs: { run_id: string; candidate: string; wasm_url?: string; label?: string }) {
  const res = await gh(`/repos/${REPO}/actions/workflows/${WORKFLOW}/dispatches`, {
    method: "POST",
    body: JSON.stringify({ ref: "main", inputs: { wasm_url: "", label: "", ...inputs } }),
  });
  if (res.status === 404) throw new HttpError(503, `the ${WORKFLOW} workflow is not on ${REPO}@main`);
}

export type Step = { name: string; status: string; conclusion: string | null; started_at: string | null; completed_at: string | null };
export async function steps(ghId: number): Promise<Step[]> {
  if (!ghId) return [];
  const res = await gh(`/repos/${REPO}/actions/runs/${ghId}/jobs`);
  const { jobs } = (await res.json()) as { jobs: { steps?: Step[] }[] };
  return (jobs[0]?.steps ?? []).map(({ name, status, conclusion, started_at, completed_at }) => ({ name, status, conclusion, started_at, completed_at }));
}

/** Every result file of a finished run: the kept copy on the `runs` release, else the artifact. */
export async function results(ghId: number, id: string): Promise<Record<string, unknown> | null> {
  const keptZip = await fetch(`https://github.com/${REPO}/releases/download/runs/${id}.zip`, { cache: "no-store" }).catch(() => null);
  if (keptZip?.ok) return parseZip(new Uint8Array(await keptZip.arrayBuffer()));
  if (!ghId) return null;
  const res = await gh(`/repos/${REPO}/actions/runs/${ghId}/artifacts`);
  const { artifacts } = (await res.json()) as { artifacts: { name: string; archive_download_url: string; expired: boolean }[] };
  const a = artifacts.find((x) => x.name === `canary-run-${id}`);
  if (!a || a.expired) return null;
  const zip = await gh(a.archive_download_url);
  return parseZip(new Uint8Array(await zip.arrayBuffer()));
}

/** Text files only; logs are capped at their last 200 kB. */
export function parseZip(bytes: Uint8Array): Record<string, unknown> {
  const files = unzipSync(bytes);
  const out: Record<string, unknown> = {};
  for (const [name, bytes] of Object.entries(files)) {
    const text = strFromU8(bytes);
    if (name.endsWith(".json")) { try { out[name] = { text, json: JSON.parse(text) }; } catch { out[name] = { text }; } }
    else if (name.endsWith(".txt") || name.endsWith(".log")) out[name] = { text: text.length > 200_000 ? text.slice(-200_000) : text };
  }
  return out;
}
