// Package the workflow suite for the dashboard's Test panel: backend/tests/workflows/*.yaml
// become public/engine/workflows.json (each workflow with its file's sha256, exactly as
// `canary test` records it in a report manifest), and the contract the suite deploys is
// copied beside it. `bun scripts/build-suite.ts --check` fails if the packaged copy is stale.
import { readFileSync, readdirSync, mkdirSync, writeFileSync, existsSync } from "node:fs";
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
  return { json: JSON.stringify(suite, null, 1) + "\n", wasm: readFileSync(join(BACKEND, "contracts", "counter.wasm")) };
}

if (import.meta.main) {
  const { json, wasm } = packSuite();
  const files: [string, string | Buffer][] = [[join(OUT, "workflows.json"), json], [join(OUT, "contracts", "counter.wasm"), wasm]];
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
