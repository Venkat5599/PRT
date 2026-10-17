// Renders a recorded Canary run (reports/<id>/report.json) twice:
//  - the recorder tape: pen A (baseline) and pen B (candidate) ink one beat per
//    expectation; agreement beats together, a difference jogs, a regression drops;
//  - the ledger: every expectation, baseline value | seam | candidate value.
const RUNS = [
  { id: "self-compare", name: "Control", hint: "same node twice" },
  { id: "upgrade-fee10x", name: "Byte fee ×10", hint: "injected via setCode" },
  { id: "upgrade-ed100x", name: "Deposit ×100", hint: "injected via setCode" },
  { id: "injected-faulty-migration", name: "Faulty migration", hint: "injected setStorage" },
];
const PLANCK = 10n ** 14n;
const $ = (s, el = document) => el.querySelector(s);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const LABEL = { REGRESSION: "regression", DIFFERENCE: "difference", PASS: "pass", INCONCLUSIVE: "inconclusive" };
const cache = new Map();
let current = null;
let filter = "all";

// Large planck integers read better as POT; the raw value stays in the title.
function pretty(v) {
  const m = /^([+-]?)(\d{12,})$/.exec(v ?? "");
  if (!m) return esc(v ?? "–");
  const n = BigInt(m[2]);
  const frac = ((n % PLANCK) * 10000n) / PLANCK;
  return `<span title="${esc(v)} planck">${m[1]}${(n / PLANCK).toLocaleString("en")}.${String(frac).padStart(4, "0")} POT</span>`;
}

function rows(w) {
  const b = w.baseline.expectations ?? [];
  const c = w.candidate.expectations ?? [];
  // Only Canary's verdict engine decides what changed; raw strings such as account
  // counts legitimately differ between two nodes.
  const changed = new Set((w.finding.differences ?? []).map((d) => d.what));
  const out = b.map((eb, i) => {
    const ec = c[i] ?? {};
    const state = !eb.pass ? "base" : !ec.pass ? "reg" : changed.has(eb.description) ? "diff" : "same";
    return { label: eb.description, b: eb.observed, c: ec.observed, state };
  });
  for (const d of w.finding.verdict === "REGRESSION" ? [] : w.finding.differences ?? []) {
    if (!out.some((r) => r.label === d.what)) out.push({ label: d.what, b: d.baseline, c: d.candidate, state: "diff" });
  }
  if (w.baseline.setup_error || w.candidate.setup_error) {
    out.push({ label: "setup", b: w.baseline.setup_error ?? "ok", c: w.candidate.setup_error ?? "ok", state: "base" });
  }
  return out;
}

/* ---------- the tape ---------- */
const H = 252, YA = 90, YB = 170, CELL = 70, WIDE = 190, GAP = 70;
const LEAD = matchMedia("(max-width: 720px)").matches ? 126 : 220;

function beat(x, y, w) {
  const m = x + w / 2;
  return `M${x} ${y}H${m - 9}L${m - 5} ${y + 5}L${m} ${y - 26}L${m + 5} ${y + 9}L${m + 9} ${y}H${x + w}`;
}
function jog(x, y, w) {
  const m = x + w / 2;
  return `M${x} ${y}H${m - 16}C${m - 10} ${y} ${m - 8} ${y - 34} ${m} ${y - 34}S${m + 10} ${y} ${m + 16} ${y}H${x + w}`;
}
function drop(x, y, w) {
  return `M${x} ${y}H${x + 22}L${x + 30} ${y + 34}H${x + w}`;
}
function short(s, n) {
  s = String(s ?? "");
  return s.length > n ? `${s.slice(0, n - 1)}…` : s;
}

function strip(r) {
  let x = LEAD;
  let svg = "";
  for (const w of r.results) {
    const v = LABEL[w.finding.verdict] ?? "pass";
    svg += `<line class="perf" x1="${x - GAP / 2}" y1="26" x2="${x - GAP / 2}" y2="${H - 26}"/>`;
    svg += `<text class="lbl-wf" x="${x}" y="40">${esc(w.finding.workflow)}</text>`;
    svg += `<text class="lbl-v v-${v}" x="${x}" y="${H - 34}">${v}</text>`;
    for (const row of rows(w)) {
      const wide = row.state === "reg" || row.state === "diff";
      const cw = wide ? WIDE : CELL;
      if (row.state === "base") {
        svg += `<path class="trace t-a k-base" d="M${x} ${YA}H${x + cw}"/><path class="trace t-b k-base" d="M${x} ${YB}H${x + cw}"/>`;
      } else {
        svg += `<path class="trace t-a" d="${beat(x, YA, cw)}"/>`;
        if (row.state === "same") svg += `<path class="trace t-b" d="${beat(x, YB, cw)}"/>`;
        if (row.state === "diff") {
          svg += `<path class="trace t-b k-diff" d="${jog(x, YB, cw)}"/>`;
          svg += `<text class="lbl-note k-diff" x="${x + 8}" y="${YB + 26}">${esc(short(row.label, 26))}</text>`;
        }
        if (row.state === "reg") {
          svg += `<path class="trace t-b k-reg" d="${drop(x, YB, cw)}"/>`;
          svg += `<path class="x" d="M${x + 18} ${YB - 6}l8 8m0 -8l-8 8"/>`;
          svg += `<text class="lbl-note" x="${x + 36}" y="${YB + 24}">${esc(short(row.label, 24))}</text>`;
        }
      }
      x += cw;
    }
    svg += `<path class="trace t-a" d="M${x} ${YA}H${x + GAP}"/><path class="trace t-b" d="M${x} ${YB}H${x + GAP}"/>`;
    x += GAP;
  }
  return { svg, width: x };
}

function drawTape(r) {
  const { svg, width } = strip(r);
  // Repeat the run until one copy covers a wide screen, then double it so the
  // feed loops seamlessly at -50%.
  const copies = Math.max(1, Math.ceil(2200 / width));
  const total = width * copies;
  const one = `<svg viewBox="0 0 ${total} ${H}" width="${total}" height="${H}" aria-hidden="true">
    <rect width="${total}" height="${H}" fill="url(#grid)"/>
    ${Array.from({ length: copies }, (_, i) => `<g transform="translate(${i * width} 0)">${svg}</g>`).join("")}
  </svg>`;
  const roll = $("[data-roll]");
  roll.innerHTML = one + one;
  roll.style.animation = `feed ${Math.round(total / 46)}s linear infinite`;
}

/* ---------- the ledger ---------- */
function seam(state) {
  const paths = {
    same: '<path d="M11 0V100"/>',
    diff: '<path d="M11 0V34L17 50L11 66V100"/>',
    reg: '<path d="M11 0V32"/><path d="M11 68V100"/><path d="M7 45l8 10M15 45l-8 10"/>',
    base: '<path d="M11 0V38"/><path d="M11 62V100"/>',
  };
  return `<span class="seam s-${state}" aria-hidden="true"><svg viewBox="0 0 22 100" preserveAspectRatio="none">${paths[state]}</svg></span>`;
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
  return `<details class="wf v-${v}" ${open ? "open" : ""}>
    <summary>
      <span class="verdict">${v}</span>
      <span class="name">${esc(f.workflow)}</span>
      <span class="sev">${f.severity === "info" ? "" : esc(f.severity)}</span>
      <svg class="chev" viewBox="0 0 14 14" aria-hidden="true"><path d="M3 5.5l4 4 4-4"/></svg>
    </summary>
    <p class="why">${esc(f.rationale)}</p>
    <div class="cols" aria-hidden="true"><span></span><span>baseline</span><span>candidate</span></div>
    <ul class="rows">${body}</ul>
    <div class="repro">
      <span class="blk">A ${blocks(w.baseline)}</span>
      <span class="blk">B ${blocks(w.candidate)}</span>
      <button type="button" class="copy" data-copy="${esc(w.reproduce)}"><code>${esc(w.reproduce)}</code><span>copy</span></button>
      <span class="hash">finding ${esc(f.finding_hash.slice(0, 16))}</span>
    </div>
  </details>`;
}

function render() {
  const r = current;
  const s = r.summary;
  const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
  const state = s.regression ? "reg" : s.difference ? "diff" : s.inconclusive ? "base" : "same";

  const big = $('[data-k="big"]');
  big.className = state;
  big.textContent = s.regression ? plural(s.regression, "regression", "regressions")
    : s.difference ? plural(s.difference, "difference", "differences")
    : s.inconclusive ? `${s.inconclusive} inconclusive` : "All pass";
  const worst = r.results.find((w) => w.finding.verdict === "REGRESSION")?.finding.severity;
  $('[data-k="small"]').textContent = `across ${plural(s.workflows, "workflow", "workflows")}${worst ? ` · worst ${worst}` : ""} · exit ${s.regression ? 1 : s.inconclusive ? 2 : 0}`;

  const m = r.manifest;
  $('[data-k="pa"]').textContent = `${m.baseline.endpoint.replace("ws://127.0.0.1", "")} spec ${m.baseline.spec_version}`;
  $('[data-k="pb"]').textContent = `${m.candidate.endpoint.replace("ws://127.0.0.1", "")} spec ${m.candidate.spec_version}`;

  const regs = r.results.filter((w) => w.finding.verdict === "REGRESSION").map((w) => w.finding.workflow);
  $('[data-k="statement"]').textContent = regs.length === 1
    ? `${regs[0]} breaks on the candidate.`
    : regs.length === s.workflows ? "Every workflow breaks on the candidate."
    : regs.length ? `${regs.length} of ${s.workflows} workflows break on the candidate.`
    : s.difference ? "Nothing breaks. Some behaviour moves." : "Nothing breaks, nothing moves.";
  $('[data-k="note"]').textContent = m.injected
    ? `Injected candidate: ${m.injected}. A deliberately modified test runtime, not a Portaldot finding.`
    : "No injection: the candidate is the baseline node itself, so nothing should differ.";

  const counts = { all: r.results.length };
  for (const w of r.results) counts[LABEL[w.finding.verdict]] = (counts[LABEL[w.finding.verdict]] ?? 0) + 1;
  if (!counts[filter]) filter = "all";
  $("[data-filters]").innerHTML = ["all", "regression", "difference", "pass", "inconclusive"]
    .filter((k) => counts[k])
    .map((k) => `<button type="button" aria-pressed="${k === filter}" data-f="${k}">${k}<span>${counts[k]}</span></button>`)
    .join("");
  const list = r.results.filter((w) => filter === "all" || LABEL[w.finding.verdict] === filter);
  const quiet = s.regression + s.difference === 0;
  $("[data-workflows]").innerHTML = list.map((w) => workflow(w, w.finding.verdict !== "PASS" || list.length === 1 || quiet)).join("");
}

async function load(id) {
  document.querySelectorAll("[data-run]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.run === id)));
  try {
    if (!cache.has(id)) {
      const res = await fetch(`reports/${id}/report.json`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      cache.set(id, await res.json());
    }
    current = cache.get(id);
    drawTape(current);
    render();
    history.replaceState(null, "", `#${id}`);
  } catch (e) {
    $('[data-k="statement"]').textContent = `Could not load this run (${e.message}).`;
  }
}

/* ---------- upgrade strips ---------- */
function blocks(el) {
  const halt = el.dataset.blocks === "halt";
  const n = 6, w = 48, gap = 18, y = 11, h = 32;
  let s = "";
  for (let i = 0; i < n; i++) {
    const x = 4 + i * (w + gap);
    if (i > 0) s += `<line class="blk-link" x1="${x - gap}" y1="${y + h / 2}" x2="${x}" y2="${y + h / 2}"/>`;
    if (halt && i >= 3) {
      s += `<rect class="blk-dead" x="${x}" y="${y}" width="${w}" height="${h}" rx="5"/>`;
      continue;
    }
    const fresh = i >= 3;
    s += `<rect class="${fresh ? "blk-new" : "blk-cell"}${!halt && i === n - 1 ? " live-tick" : ""}" x="${x}" y="${y}" width="${w}" height="${h}" rx="5"/>`;
    s += `<text class="blk-text" x="${x + w / 2}" y="${y + h / 2}" text-anchor="middle" dominant-baseline="central">${i < 2 ? "" : i === 2 ? "set" : `+${i - 2}`}</text>`;
  }
  el.innerHTML = s;
}
document.querySelectorAll("[data-blocks]").forEach(blocks);

/* ---------- wiring ---------- */
$("[data-runs]").innerHTML = RUNS.map(
  (r, i) => `<button type="button" data-run="${r.id}" aria-pressed="false"><i>0${i + 1}</i><b>${r.name}</b><small>${r.hint}</small></button>`,
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

const nav = $("[data-nav]");
const onScroll = () => nav.classList.toggle("scrolled", scrollY > 40);
addEventListener("scroll", onScroll, { passive: true });
onScroll();

const start = RUNS.find((r) => `#${r.id}` === location.hash)?.id ?? "upgrade-ed100x";
load(start);
