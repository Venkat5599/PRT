// Renders a recorded Canary run (reports/<id>/report.json) as one split board:
// baseline on the left, candidate on the right, one seam between them.
const RUNS = [
  { id: "self-compare", name: "Control", hint: "same node on both sides" },
  { id: "upgrade-fee10x", name: "Byte fee ×10", hint: "injected, via setCode" },
  { id: "upgrade-ed100x", name: "ED ×100", hint: "injected, via setCode" },
  { id: "injected-faulty-migration", name: "Faulty migration", hint: "injected, sudo setStorage" },
];
const PLANCK = 10n ** 14n;
const $ = (s, el = document) => el.querySelector(s);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const cache = new Map();
let current = null;
let filter = "all";

// Large planck integers read better as POT; the raw value stays in the title.
function pretty(v) {
  const m = /^([+-]?)(\d{12,})$/.exec(v ?? "");
  if (!m) return esc(v ?? "–");
  const n = BigInt(m[2]);
  const whole = n / PLANCK;
  const frac = ((n % PLANCK) * 10000n) / PLANCK;
  return `<span title="${esc(v)} planck">${m[1]}${whole.toLocaleString("en")}.${String(frac).padStart(4, "0")} POT</span>`;
}

// One seam segment per row. Same: straight. Changed: a jog. Regressed: broken.
function seam(state) {
  const paths = {
    same: '<path d="M12 0V100"/>',
    diff: '<path d="M12 0V34L18 50L12 66V100"/>',
    reg: '<path d="M12 0V30"/><path d="M12 70V100"/>',
    base: '<path d="M12 0V40"/><path class="dash" d="M12 46V54"/><path d="M12 60V100"/>',
  };
  const cut = state === "reg" ? '<svg class="cut" viewBox="0 0 12 12"><path d="M2 2L10 10M10 2L2 10"/></svg>' : "";
  return `<span class="seam s-${state}" aria-hidden="true"><svg viewBox="0 0 24 100" preserveAspectRatio="none">${paths[state]}</svg>${cut}</span>`;
}

const LABEL = { REGRESSION: "regression", DIFFERENCE: "difference", PASS: "pass", INCONCLUSIVE: "inconclusive" };

function rows(w) {
  const b = w.baseline.expectations ?? [];
  const c = w.candidate.expectations ?? [];
  // A row only counts as changed when Canary's verdict engine says so; raw strings
  // such as account counts legitimately differ between two nodes.
  const changed = new Set((w.finding.differences ?? []).map((d) => d.what));
  const out = b.map((eb, i) => {
    const ec = c[i] ?? {};
    const state = !eb.pass ? "base" : !ec.pass ? "reg" : changed.has(eb.description) ? "diff" : "same";
    return { label: eb.description, b: eb.observed, c: ec.observed, state };
  });
  // Observable differences that no expectation covers (fees, deltas) are rows too,
  // unless the workflow already regressed and the failed checks tell the story.
  for (const d of w.finding.verdict === "REGRESSION" ? [] : w.finding.differences ?? []) {
    if (!out.some((r) => r.label === d.what)) out.push({ label: d.what, b: d.baseline, c: d.candidate, state: "diff" });
  }
  if (w.baseline.setup_error || w.candidate.setup_error) {
    out.push({ label: "setup", b: w.baseline.setup_error ?? "ok", c: w.candidate.setup_error ?? "ok", state: "base" });
  }
  return out;
}

function workflow(w, open) {
  const f = w.finding;
  const v = LABEL[f.verdict] ?? f.verdict.toLowerCase();
  const body = rows(w)
    .map((r) => `<li class="row r-${r.state}">
        <span class="check">${esc(r.label)}</span>
        <span class="val vb">${pretty(r.b)}</span>${seam(r.state)}<span class="val vc">${pretty(r.c)}</span>
      </li>`)
    .join("");
  const blocks = (s) => `${(s.pre_block ?? "–").slice(0, 10)} → ${(s.post_block ?? "–").slice(0, 10)}`;
  return `<details class="wf v-${v}" ${open ? "open" : ""} data-verdict="${v}">
    <summary>
      <span class="verdict">${v}</span>
      <span class="name">${esc(f.workflow)}</span>
      <span class="sev">${f.severity === "info" ? "" : esc(f.severity)}</span>
    </summary>
    <p class="why">${esc(f.rationale)}</p>
    <ul class="rows">${body}</ul>
    <div class="repro">
      <span class="blk">blocks ${blocks(w.baseline)}</span>
      <span class="blk">blocks ${blocks(w.candidate)}</span>
      <button type="button" class="copy" data-copy="${esc(w.reproduce)}"><code>${esc(w.reproduce)}</code><span>copy</span></button>
      <span class="hash">finding ${esc(f.finding_hash.slice(0, 16))}</span>
    </div>
  </details>`;
}

function side(m) {
  return `${esc(m.endpoint)} · spec ${m.spec_version} · metadata V${m.metadata_version} ${esc(m.metadata_sha256.slice(0, 12))}`;
}

function render() {
  const r = current;
  const board = $("[data-board]");
  const s = r.summary;
  const n = (k, one, many) => `${s[k]} ${s[k] === 1 ? one : many}`;
  $('[data-k="statement"]').textContent = s.regression
    ? `${n("regression", "regression", "regressions")} across ${s.workflows} workflows.`
    : s.difference
      ? `No regression. ${n("difference", "workflow behaves", "workflows behave")} differently.`
      : s.inconclusive
        ? `No regression, ${n("inconclusive", "workflow", "workflows")} inconclusive.`
        : `No regression. All ${s.workflows} workflows behave the same.`;
  $('[data-k="note"]').textContent = r.manifest.injected
    ? `Injected candidate: ${r.manifest.injected}. A deliberately modified test runtime, not a Portaldot finding.`
    : "No injection: the candidate is the baseline node itself, so nothing should differ.";
  $('[data-k="base"]').textContent = side(r.manifest.baseline);
  $('[data-k="cand"]').textContent = side(r.manifest.candidate);

  const counts = { all: r.results.length };
  for (const w of r.results) {
    const v = LABEL[w.finding.verdict];
    counts[v] = (counts[v] ?? 0) + 1;
  }
  if (!counts[filter]) filter = "all";
  $("[data-filters]").innerHTML = ["all", "regression", "difference", "pass", "inconclusive"]
    .filter((k) => counts[k])
    .map((k) => `<button type="button" aria-pressed="${k === filter}" data-f="${k}">${k} <span>${counts[k]}</span></button>`)
    .join("");

  const list = r.results.filter((w) => filter === "all" || LABEL[w.finding.verdict] === filter);
  $("[data-workflows]").innerHTML = list.map((w) => workflow(w, w.finding.verdict !== "PASS" || list.length === 1 || r.summary.regression + r.summary.difference === 0)).join("");
  board.dataset.state = r.summary.regression ? "reg" : r.summary.difference ? "diff" : "same";
}

async function load(id) {
  document.querySelectorAll("[data-run]").forEach((b) => b.setAttribute("aria-current", String(b.dataset.run === id)));
  try {
    if (!cache.has(id)) {
      const res = await fetch(`reports/${id}/report.json`);
      if (!res.ok) throw new Error(`${res.status}`);
      cache.set(id, await res.json());
    }
    current = cache.get(id);
    render();
    history.replaceState(null, "", `#${id}`);
  } catch (e) {
    $('[data-k="statement"]').textContent = `Could not load this run (${e.message}).`;
  }
}

$("[data-runs]").innerHTML = RUNS.map(
  (r) => `<button type="button" data-run="${r.id}" aria-current="false"><b>${r.name}</b><small>${r.hint}</small></button>`,
).join("");

document.addEventListener("click", async (e) => {
  const run = e.target.closest("[data-run]");
  if (run) return load(run.dataset.run);
  const f = e.target.closest("[data-f]");
  if (f) { filter = f.dataset.f; return render(); }
  const c = e.target.closest("[data-copy]");
  if (c) {
    try {
      await navigator.clipboard.writeText(c.dataset.copy);
      c.lastElementChild.textContent = "copied";
    } catch {
      c.lastElementChild.textContent = "select + copy";
    }
    setTimeout(() => (c.lastElementChild.textContent = "copy"), 1600);
  }
});

const start = RUNS.find((r) => `#${r.id}` === location.hash)?.id ?? "upgrade-ed100x";
load(start);
