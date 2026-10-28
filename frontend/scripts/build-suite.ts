// Package the workflow suite for the dashboard's Test panel: backend/tests/workflows/*.yaml
// become public/engine/workflows.json (each workflow with its file's sha256, exactly as
// `canary test` records it in a report manifest), and the contract the suite deploys is
// copied beside it. `bun scripts/build-suite.ts --check` fails if the packaged copy is stale.
import { readFileSync, readdirSync, mkdirSync, writeFileSync, existsSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
import { join } from "node:path";

const BACKEND = join(import.meta.dir, "..", "..", "backend", "tests");
const OUT = join(import.meta.dir, "..", "public", "engine");

export function packSuite() {
  const dir = join(BACKEND, "workflows");
  const suite = readdirSync(dir).filter((f) => f.endsWith(".yaml")).sort().map((f) => {
    const raw = readFileSync(join(dir, f));
    return { path: `tests/workflows/${f}`, sha256: createHash("sha256").update(raw).digest("hex"), workflow: Bun.YAML.parse(raw.toString()) };
  });
  return { json: JSON.stringify(suite, null, 1) + "\n", wasm: readFileSync(join(BACKEND, "contracts", "counter.wasm")), runtimes: packRuntimes() };
}

/**
 * The prebuilt candidate runtimes (backend/runtimes/out): each one's sha256 and size, its
 * spec_version, and how its source differs from the clean build, read from its .patch file.
 */
export function packRuntimes() {
  const dir = join(import.meta.dir, "..", "..", "backend", "runtimes", "out");
  const sums = new Map(readFileSync(join(dir, "SHA256SUMS"), "utf8").trim().split("\n").map((l) => { const [h, f] = l.split(/\s+/); return [f, h] as const; }));
  const edits = (name: string) => readFileSync(join(dir, `${name}.patch`), "utf8").split("\n")
    .filter((l) => /^[-+][^-+]/.test(l)).map((l) => l[0] + l.slice(1).trim());
  const pair = (lines: string[]) => {
    const out: { before: string | null; after: string | null }[] = [];
    for (let i = 0; i < lines.length; i++) {
      if (lines[i][0] === "-" && lines[i + 1]?.[0] === "+") { out.push({ before: lines[i].slice(1), after: lines[i + 1].slice(1) }); i++; }
      else out.push(lines[i][0] === "-" ? { before: lines[i].slice(1), after: null } : { before: null, after: lines[i].slice(1) });
    }
    return out;
  };
  const clean = edits("clean");
  const names = [...sums.keys()].map((f) => f.replace(".compact.wasm", ""));
  return JSON.stringify(names.map((name) => {
    const mine = edits(name);
    const spec = Number(/spec_version: (\d+)/.exec(mine.find((l) => l.startsWith("+") && l.includes("spec_version")) ?? "")?.[1] ?? 0) || null;
    const isSpec = (l: string) => l.includes("spec_version");
    // Relative to the clean build: what this runtime adds, and what clean changes that it does not.
    const added = mine.filter((l) => !clean.includes(l) && !isSpec(l));
    const missing = clean.filter((l) => !mine.includes(l) && !isSpec(l)).map((l) => (l[0] === "+" ? "-" : "+") + l.slice(1));
    return {
      name, spec, sha256: sums.get(`${name}.compact.wasm`), bytes: statSync(join(dir, `${name}.compact.wasm`)).size,
      changes: pair(name === "clean" ? clean.filter((l) => !isSpec(l)) : [...missing.filter((l) => l[0] === "-"), ...missing.filter((l) => l[0] === "+"), ...added]),
    };
  }), null, 1) + "\n";
}

if (import.meta.main) {
  const { json, wasm, runtimes } = packSuite();
  const files: [string, string | Buffer][] = [[join(OUT, "workflows.json"), json], [join(OUT, "contracts", "counter.wasm"), wasm], [join(OUT, "runtimes.json"), runtimes]];
  if (process.argv.includes("--check")) {
    const stale = files.filter(([p, v]) => !existsSync(p) || !readFileSync(p).equals(Buffer.from(v)));
    if (stale.length) { console.error(`stale: ${stale.map(([p]) => p).join(", ")}; run bun scripts/build-suite.ts`); process.exit(1); }
    console.log("suite up to date");
  } else {
    mkdirSync(join(OUT, "contracts"), { recursive: true });
    for (const [p, v] of files) writeFileSync(p, v);
    console.log(`packed ${JSON.parse(json).length} workflows`);
  }
}
