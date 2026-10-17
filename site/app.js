// Portal Canary site. Renders recorded runs (reports/<id>/report.json) into the
// hero console, the recorder tape and the ledger; draws the dithered scenes;
// drives the harness tabs and the upgrade-flow steps.
const RUNS = [
  { id: "self-compare", name: "Control", hint: "Same node twice. Nothing should differ." },
  { id: "upgrade-fee10x", name: "Byte fee ×10", hint: "Injected via setCode. Fees move." },
  { id: "upgrade-ed100x", name: "Deposit ×100", hint: "Injected via setCode. A transfer breaks." },
  { id: "injected-faulty-migration", name: "Faulty migration", hint: "Injected setStorage. Supply stops adding up." },
];
const PLANCK = 10n ** 14n;
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const LABEL = { REGRESSION: "regression", DIFFERENCE: "difference", PASS: "pass", INCONCLUSIVE: "inconclusive" };
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
let still = reduced;
const cache = new Map();
let current = null;
let currentId = null;
let filter = "all";

/* ---------- run data ---------- */
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
  // Only Canary's verdict engine decides what changed.
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

const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
function headline(s) {
  if (s.regression) return { text: plural(s.regression, "regression", "regressions"), cls: "reg" };
  if (s.difference) return { text: plural(s.difference, "difference", "differences"), cls: "diff" };
  if (s.inconclusive) return { text: `${s.inconclusive} inconclusive`, cls: "base" };
  return { text: "All pass", cls: "same" };
}
const exitCode = (s) => (s.regression ? 1 : s.inconclusive ? 2 : 0);

/* ---------- the tape ---------- */
const H = 208, YA = 74, YB = 140, CELL = 70, WIDE = 190, GAP = 70;
const LEAD = matchMedia("(max-width: 720px)").matches ? 140 : 210;
const beat = (x, y, w) => { const m = x + w / 2; return `M${x} ${y}H${m - 9}L${m - 5} ${y + 5}L${m} ${y - 24}L${m + 5} ${y + 8}L${m + 9} ${y}H${x + w}`; };
const jog = (x, y, w) => { const m = x + w / 2; return `M${x} ${y}H${m - 16}C${m - 10} ${y} ${m - 8} ${y - 30} ${m} ${y - 30}S${m + 10} ${y} ${m + 16} ${y}H${x + w}`; };
const drop = (x, y, w) => `M${x} ${y}H${x + 22}L${x + 30} ${y + 30}H${x + w}`;
const short = (s, n) => { s = String(s ?? ""); return s.length > n ? `${s.slice(0, n - 1)}…` : s; };

function strip(r) {
  let x = LEAD;
  let svg = "";
  for (const w of r.results) {
    const v = LABEL[w.finding.verdict] ?? "pass";
    svg += `<line class="perf" x1="${x - GAP / 2}" y1="20" x2="${x - GAP / 2}" y2="${H - 20}"/>`;
    svg += `<text class="lbl-wf" x="${x}" y="32">${esc(w.finding.workflow)}</text>`;
    svg += `<text class="lbl-v v-${v}" x="${x}" y="${H - 22}">${v}</text>`;
    for (const row of rows(w)) {
      const cw = row.state === "reg" || row.state === "diff" ? WIDE : CELL;
      if (row.state === "base") {
        svg += `<path class="trace t-a k-base" d="M${x} ${YA}H${x + cw}"/><path class="trace t-b k-base" d="M${x} ${YB}H${x + cw}"/>`;
      } else {
        svg += `<path class="trace t-a" d="${beat(x, YA, cw)}"/>`;
        if (row.state === "same") svg += `<path class="trace t-b" d="${beat(x, YB, cw)}"/>`;
        if (row.state === "diff") {
          svg += `<path class="trace t-b k-diff" d="${jog(x, YB, cw)}"/>`;
          svg += `<text class="lbl-note k-diff" x="${x + 8}" y="${YB + 24}">${esc(short(row.label, 26))}</text>`;
        }
        if (row.state === "reg") {
          svg += `<path class="trace t-b k-reg" d="${drop(x, YB, cw)}"/>`;
          svg += `<path class="x" d="M${x + 18} ${YB - 6}l8 8m0 -8l-8 8"/>`;
          svg += `<text class="lbl-note" x="${x + 36}" y="${YB + 22}">${esc(short(row.label, 24))}</text>`;
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
  const copies = Math.max(1, Math.ceil(2200 / width));
  const total = width * copies;
  const one = `<svg viewBox="0 0 ${total} ${H}" width="${total}" height="${H}" aria-hidden="true">${Array.from({ length: copies }, (_, i) => `<g transform="translate(${i * width} 0)">${svg}</g>`).join("")}</svg>`;
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
    .map((r) => `<li class="row r-${r.state}"><span class="check">${esc(r.label)}</span><span class="val vb">${pretty(r.b)}</span>${seam(r.state)}<span class="val vc">${pretty(r.c)}</span></li>`)
    .join("");
  const blocks = (s) => `${(s.pre_block ?? "–").slice(0, 10)} → ${(s.post_block ?? "–").slice(0, 10)}`;
  return `<details class="wf v-${v}" ${open ? "open" : ""}>
    <summary><span class="verdict">${v}</span><span class="name">${esc(f.workflow)}</span><span class="sev">${f.severity === "info" ? "" : esc(f.severity)}</span><svg class="chev" viewBox="0 0 14 14" aria-hidden="true"><path d="M3 5.5l4 4 4-4"/></svg></summary>
    <p class="why">${esc(f.rationale)}</p>
    <div class="cols" aria-hidden="true"><span></span><span>baseline</span><span>candidate</span></div>
    <ul class="rows">${body}</ul>
    <div class="repro"><span>A ${blocks(w.baseline)}</span><span>B ${blocks(w.candidate)}</span>
      <button type="button" class="copy" data-copy="${esc(w.reproduce)}"><code>${esc(w.reproduce)}</code><span>copy</span></button>
      <span>finding ${esc(f.finding_hash.slice(0, 16))}</span></div>
  </details>`;
}

function render() {
  const r = current;
  const s = r.summary;
  const m = r.manifest;
  const h = headline(s);
  const worst = r.results.find((w) => w.finding.verdict === "REGRESSION")?.finding.severity;

  const big = $('[data-k="big"]');
  big.className = h.cls;
  big.textContent = h.text;
  $('[data-k="small"]').textContent = `across ${plural(s.workflows, "workflow", "workflows")}${worst ? ` · worst ${worst}` : ""} · exit ${exitCode(s)}`;
  $('[data-k="cmd"]').textContent = `canary test --baseline ${m.baseline.endpoint} --candidate ${m.candidate.endpoint}`;
  $('[data-k="runname"]').textContent = RUNS.find((x) => x.id === currentId).name;
  $('[data-k="pa"]').textContent = `spec ${m.baseline.spec_version}`;
  $('[data-k="pb"]').textContent = `spec ${m.candidate.spec_version}`;

  const regs = r.results.filter((w) => w.finding.verdict === "REGRESSION").map((w) => w.finding.workflow);
  $('[data-k="statement"]').textContent = regs.length === 1 ? `${regs[0]} breaks on the candidate.`
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
  if (tab === "test") showPane("test");
}

async function fetchRun(id) {
  if (!cache.has(id)) {
    const res = await fetch(`reports/${id}/report.json`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    cache.set(id, await res.json());
  }
  return cache.get(id);
}

async function load(id) {
  currentId = id;
  $$("[data-run]").forEach((b) => b.setAttribute("aria-selected", String(b.dataset.run === id)));
  try {
    current = await fetchRun(id);
    drawTape(current);
    render();
  } catch (e) {
    $('[data-k="statement"]').textContent = `Could not load this run (${e.message}).`;
    $('[data-k="big"]').textContent = "Run unavailable";
  }
}

/* ---------- run pickers ---------- */
const menu = $("[data-runs]");
const pickerBtn = $("[data-picker-btn]");
menu.innerHTML = RUNS.map((r, i) => `<li role="option" tabindex="-1" data-run="${r.id}" aria-selected="false"><i>0${i + 1}</i><span>${r.name}</span><small>${r.hint}</small></li>`).join("");
const setMenu = (open) => {
  menu.hidden = !open;
  pickerBtn.setAttribute("aria-expanded", String(open));
  if (open) (menu.querySelector('[aria-selected="true"]') ?? menu.firstElementChild).focus();
};
pickerBtn.addEventListener("click", () => setMenu(menu.hidden));
menu.addEventListener("keydown", (e) => {
  const items = $$("li", menu);
  const i = items.indexOf(document.activeElement);
  if (e.key === "ArrowDown") { e.preventDefault(); items[(i + 1) % items.length].focus(); }
  if (e.key === "ArrowUp") { e.preventDefault(); items[(i - 1 + items.length) % items.length].focus(); }
  if (e.key === "Enter" || e.key === " ") { e.preventDefault(); document.activeElement.click(); }
  if (e.key === "Escape") { setMenu(false); pickerBtn.focus(); }
});
document.addEventListener("click", (e) => { if (!e.target.closest("[data-picker]")) setMenu(false); });

$("[data-runtabs]").innerHTML = RUNS.map((r, i) => `<button type="button" role="tab" aria-selected="false" data-run="${r.id}"><i>0${i + 1}</i><b>${r.name}</b><small>${r.hint}</small><span class="verd" data-verd="${r.id}"></span></button>`).join("");
// Prefetch every run so each tab can show its verdict before it is opened.
for (const r of RUNS) {
  fetchRun(r.id).then((d) => {
    const h = headline(d.summary);
    const el = $(`[data-verd="${r.id}"]`);
    el.textContent = `${h.text} · exit ${exitCode(d.summary)}`;
    el.style.color = `var(--${h.cls === "reg" ? "reg" : h.cls === "diff" ? "diff" : h.cls === "same" ? "pass" : "dim"})`;
  }).catch(() => {});
}

/* ---------- harness panes ---------- */
const PANES = {
  doctor: {
    file: "doctor.txt",
    copy: "canary doctor --ws wss://test-node-v3.portaldot.dev",
    foot: "Live output · PortaldotV3 testnet · 17 Oct 2026",
    code: `<span class="c-dim">$</span> canary doctor --ws wss://test-node-v3.portaldot.dev
<span class="c-k">substrate</span>  wss://test-node-v3.portaldot.dev
  network     <span class="c-ok">ok</span> (Cloudflare, 4 addresses)
  chain       PortaldotV3 Test  (node 3.0.0-dev-fddd43141f2)
  runtime     portaldot-v3 spec_version=3002 tx_version=2
  best block  #75075
  metadata    V14 (561916 bytes, sha256 5f33dd90fab35fa3…)
  apis        26 total; consensus, core, evm, fees,
              finality, signing, wasm-contracts
    wasm-contracts   <span class="c-ok">present</span>
    evm              <span class="c-ok">present</span>  (ReviveApi)
    upgrade-testing  <span class="c-dim">absent</span>
  verdict     <span class="c-ok">HEALTHY</span>`,
  },
  compare: {
    file: "compare.txt",
    copy: "canary compare --baseline wss://mainnet.portaldot.io --candidate wss://test-node-v3.portaldot.dev",
    foot: "Live output · mainnet vs PortaldotV3 · excerpt of 948 changes",
    code: `<span class="c-dim">$</span> canary compare --baseline wss://mainnet.portaldot.io \\
                 --candidate wss://test-node-v3.portaldot.dev
baseline   mainnet          spec portaldot#1002     V13
candidate  test-node-v3     spec portaldot-v3#3002  V14
pallets    31 vs 69

<span class="c-warn">~</span> Balances.constant.ExistentialDeposit
    baseline:  T::Balance = 100000000000000
    candidate: u128 = 10000000000000
<span class="c-ok">+</span> Revive
    candidate: pallet #80
<span class="c-bad">-</span> TransactionPayment.constant.TransactionByteFee
<span class="c-warn">~</span> Babe.constant.ExpectedBlockTime
    baseline:  T::Moment = 60000
    candidate: u64 = 6000

<span class="c-bad">HAZARD</span>   Babe.constant.ExpectedBlockTime: BABE slot duration
         cannot change on a running chain; block production halts

948 change(s)  ·  exit 1`,
  },
};

function testPane() {
  const r = current;
  if (!r) return { file: "report.json", copy: "", foot: "Loading run…", code: "" };
  const m = r.manifest;
  const tag = { REGRESSION: "c-bad", DIFFERENCE: "c-warn", PASS: "c-ok", INCONCLUSIVE: "c-dim" };
  const lines = r.results.map((w) => `<span class="${tag[w.finding.verdict] ?? ""}">${w.finding.verdict.padEnd(12)}</span>${(w.finding.severity ?? "").padEnd(8)}${esc(w.finding.workflow)}`);
  return {
    file: `reports/${currentId}/report.json`,
    copy: `canary test --baseline ${m.baseline.endpoint} --candidate ${m.candidate.endpoint}`,
    foot: `Recorded run · ${RUNS.find((x) => x.id === currentId).name} · spec ${m.baseline.spec_version} → ${m.candidate.spec_version}`,
    code: `<span class="c-dim">$</span> canary test --baseline ${esc(m.baseline.endpoint)} \\
              --candidate ${esc(m.candidate.endpoint)}
${m.injected ? `<span class="c-dim">injected: ${esc(short(m.injected, 58))}</span>\n` : ""}
${lines.join("\n")}

${esc(r.summary.statement)}
exit ${exitCode(r.summary)}`,
  };
}

let tab = "doctor";
function showPane(name) {
  tab = name;
  const p = name === "test" ? testPane() : PANES[name];
  $$("[data-tab]").forEach((b) => b.setAttribute("aria-selected", String(b.dataset.tab === name)));
  $("[data-pane]").setAttribute("aria-labelledby", `tab-${name}`);
  $('[data-k="file"]').textContent = p.file;
  $('[data-k="code"]').innerHTML = p.code;
  $('[data-k="foot"]').textContent = p.foot;
  $("[data-copy-pane]").dataset.copy = p.copy;
}
const tabBtns = $$("[data-tab]");
tabBtns.forEach((b, i) => {
  b.addEventListener("click", () => showPane(b.dataset.tab));
  b.addEventListener("keydown", (e) => {
    const d = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : e.key === "ArrowUp" || e.key === "ArrowLeft" ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    const n = tabBtns[(i + d + tabBtns.length) % tabBtns.length];
    n.focus();
    showPane(n.dataset.tab);
  });
});
showPane("doctor");

/* ---------- upgrade flow steps ---------- */
const STEPS = [
  ["Run every workflow against the live baseline and record balances, fees, events and storage, block by block.", "INPUT / baseline runtime"],
  ["Push the candidate with system.setCode, then wait for three more blocks. A spec bump alone is not proof the upgrade took.", "EXECUTION / setCode + 3 blocks"],
  ["Replay the same workflows on the candidate. Anything that held before and fails now is a regression, shown with the state that diverged and one command to reproduce it.", "OUTPUT / report.html"],
];
const stepBtns = $$("[data-step]");
const diagram = $("[data-diagram]");
let step = 0;
function setStep(i) {
  step = i;
  diagram.dataset.step = i;
  stepBtns.forEach((b, j) => {
    b.setAttribute("aria-selected", String(j === i));
    const bar = b.querySelector(".bar span");
    bar.style.animation = "none";
    void bar.offsetWidth;
    bar.style.animation = "";
  });
  $('[data-k="steptext"]').textContent = STEPS[i][0];
  $('[data-k="stepio"]').textContent = STEPS[i][1];
}
stepBtns.forEach((b, i) => {
  b.addEventListener("click", () => setStep(i));
  b.querySelector(".bar span").addEventListener("animationend", () => { if (!still && step === i) setStep((i + 1) % STEPS.length); });
});
setStep(0);

// Wires are drawn from the measured card positions, so they always meet the cards.
function drawWires() {
  const svg = $("[data-wires]");
  if (!svg || getComputedStyle(svg).display === "none") return;
  const box = diagram.getBoundingClientRect();
  const r = (el) => { const b = el.getBoundingClientRect(); return { l: b.left - box.left, r: b.right - box.left, y: b.top - box.top + b.height / 2 }; };
  const a = r($(".card-node.in", diagram)), c = r($(".core", diagram)), o = r($(".card-node.out", diagram));
  const elbow = (x1, y1, x2, y2) => {
    const mx = (x1 + x2) / 2;
    return Math.abs(y2 - y1) < 1 ? `M${x1} ${y1}H${x2}` : `M${x1} ${y1}H${mx - 12}L${mx + 12} ${y2}H${x2}`;
  };
  const p1 = elbow(a.r, a.y, c.l, c.y);
  const p2 = elbow(c.r, c.y, o.l, o.y);
  svg.setAttribute("width", box.width);
  svg.setAttribute("height", box.height);
  svg.setAttribute("viewBox", `0 0 ${box.width} ${box.height}`);
  svg.innerHTML = `<path class="wire" d="${p1}"/><path class="wire" d="${p2}"/>
    <circle class="pulse" r="3"><animateMotion dur="2.6s" repeatCount="indefinite" path="${p1}"/></circle>
    <circle class="pulse" r="3"><animateMotion dur="2.6s" begin="-1.3s" repeatCount="indefinite" path="${p2}"/></circle>`;
  if (still && svg.pauseAnimations) svg.pauseAnimations();
}
drawWires();
addEventListener("resize", drawWires);
document.fonts?.ready.then(drawWires);

/* ---------- dithered scenes ---------- */
// Value noise + fbm. Scenes are computed at low resolution and quantised with
// a 4x4 Bayer matrix, then upscaled with pixelated rendering.
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16);
function hash(x, y) {
  let h = (x * 374761393 + y * 668265263) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}
function noise(x, y) {
  const xi = Math.floor(x), yi = Math.floor(y);
  const xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
function fbm(x, y, o = 4) {
  let s = 0, amp = 0.5, f = 1, n = 0;
  for (let i = 0; i < o; i++) { s += amp * noise(x * f, y * f); n += amp; amp *= 0.5; f *= 2.03; }
  return s / n;
}
const mix = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const clamp = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const smooth = (e0, e1, x) => { const t = clamp((x - e0) / (e1 - e0)); return t * t * (3 - 2 * t); };

const SCENES = {
  // A green valley under drifting cloud, two ridges closing in from the sides.
  valley: {
    levels: 7,
    animated: true,
    base(x, y, asp) {
      const dx = Math.abs(x - 0.5) * 2;
      const far = 0.5 - 0.42 * Math.pow(dx, 1.25) + 0.07 * (fbm(x * 5 * asp, 1.7) - 0.5);
      const near = 0.78 - 0.66 * Math.pow(dx, 1.05) + 0.1 * (fbm(x * 8 * asp + 9, 3.1) - 0.5);
      if (y > near) {
        const t = fbm(x * 14 * asp, y * 13, 4);
        let c = mix([0.1, 0.22, 0.15], [0.22, 0.4, 0.23], smooth(0.35, 0.75, t));
        c = mix(c, [0.4, 0.56, 0.3], smooth(0.66, 0.84, t) * smooth(0.5, 1, dx) * 0.8);
        if (y > 0.9 && dx < 0.5) c = mix(c, [0.56, 0.68, 0.38], smooth(0.9, 1, y) * (1 - dx * 2));
        return { c, sky: false, mist: smooth(0.12, 0, y - near) * 0.5 };
      }
      if (y > far) {
        const t = fbm(x * 9 * asp, y * 8, 4);
        const c = mix([0.3, 0.42, 0.4], [0.46, 0.57, 0.55], t);
        return { c, sky: false, mist: 0.55 * smooth(0.18, 0, y - far) };
      }
      return { c: mix([0.84, 0.87, 0.87], [0.62, 0.73, 0.8], y * 1.6), sky: true, mist: 0.2 };
    },
    live(x, y, asp, t, p) {
      let c = p.c;
      if (p.sky) {
        const n = fbm(x * 2.6 * asp + t * 0.018, y * 4.5 - t * 0.004, 5);
        c = mix(c, [0.4, 0.58, 0.74], smooth(0.42, 0.28, n) * 0.85);
        c = mix(c, [0.96, 0.96, 0.95], smooth(0.5, 0.72, n));
      }
      if (p.mist > 0.01) {
        const m = fbm(x * 3 * asp - t * 0.03, y * 9 + 4, 3);
        c = mix(c, [0.88, 0.9, 0.9], p.mist * smooth(0.38, 0.75, m));
      }
      return c;
    },
  },
  // Weathered concrete steps behind the harness window.
  stone: {
    levels: 5,
    animated: false,
    base(x, y, asp) {
      const band = (y * 9 + x * 1.4) % 1;
      const lit = smooth(0.15, 0.05, band) * 0.12;
      const g = 0.13 + 0.12 * fbm(x * 10 * asp, y * 14, 4) + lit - 0.07 * smooth(0.4, 1, x);
      return { c: [g, g * 1.02, g * 0.98], sky: false, mist: 0 };
    },
    live: (x, y, a, t, p) => p.c,
  },
  // Dusk over a ridge line, for the closing section.
  dusk: {
    levels: 6,
    animated: true,
    base(x, y, asp) {
      const r1 = 0.62 + 0.1 * (fbm(x * 4 * asp, 2.2) - 0.5) - 0.06 * Math.sin(x * 3.1);
      const r2 = 0.76 + 0.12 * (fbm(x * 6 * asp + 4, 5.3) - 0.5);
      if (y > r2) return { c: mix([0.07, 0.07, 0.09], [0.05, 0.05, 0.06], (y - r2) * 3), sky: false, mist: 0 };
      if (y > r1) return { c: mix([0.17, 0.16, 0.22], [0.12, 0.11, 0.15], fbm(x * 20, y * 20, 2)), sky: false, mist: 0.35 * smooth(0.08, 0, y - r1) };
      const hor = smooth(0.15, r1, y);
      return { c: mix(mix([0.09, 0.11, 0.2], [0.27, 0.29, 0.46], smooth(0, 0.45, y)), [0.86, 0.56, 0.36], hor * hor), sky: true, mist: 0 };
    },
    live(x, y, asp, t, p) {
      let c = p.c;
      if (p.sky) {
        const n = fbm(x * 2.2 * asp + t * 0.012, y * 6, 4);
        c = mix(c, mix([0.36, 0.33, 0.5], [0.95, 0.7, 0.5], smooth(0.2, 0.6, y)), smooth(0.55, 0.78, n) * 0.75);
      }
      if (p.mist > 0.01) c = mix(c, [0.5, 0.42, 0.48], p.mist * fbm(x * 4 - t * 0.02, y * 10, 2));
      return c;
    },
  },
};

const scenes = [];
function setupScene(canvas) {
  const scene = SCENES[canvas.dataset.dither];
  const ctx = canvas.getContext("2d");
  const s = { canvas, scene, ctx, w: 0, h: 0, base: [], img: null, visible: false, t: Math.random() * 100 };
  s.resize = () => {
    const r = canvas.getBoundingClientRect();
    const px = 3;
    s.w = Math.max(40, Math.round(r.width / px));
    s.h = Math.max(30, Math.round(r.height / px));
    canvas.width = s.w;
    canvas.height = s.h;
    s.img = ctx.createImageData(s.w, s.h);
    const asp = s.w / s.h;
    s.base = new Array(s.w * s.h);
    for (let y = 0; y < s.h; y++) for (let x = 0; x < s.w; x++) s.base[y * s.w + x] = scene.base(x / s.w, y / s.h, asp);
    s.draw();
  };
  s.draw = () => {
    const { w, h, img } = s;
    const asp = w / h, L = scene.levels - 1, d = img.data;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = y * w + x;
        const c = scene.live(x / w, y / h, asp, s.t, s.base[i]);
        const th = BAYER[(y & 3) * 4 + (x & 3)];
        for (let k = 0; k < 3; k++) {
          const v = clamp(c[k]) * L;
          const f = Math.floor(v);
          d[i * 4 + k] = (((v - f) > th ? f + 1 : f) / L) * 255;
        }
        d[i * 4 + 3] = 255;
      }
    }
    s.ctx.putImageData(img, 0, 0);
  };
  scenes.push(s);
  new IntersectionObserver(([e]) => { s.visible = e.isIntersecting; }).observe(canvas);
  s.resize();
}
$$("[data-dither]").forEach(setupScene);
let lastFrame = 0;
function loop(now) {
  if (!still && now - lastFrame > 90) {
    lastFrame = now;
    for (const s of scenes) if (s.visible && s.scene.animated) { s.t += 0.9; s.draw(); }
  }
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
let resizeTimer;
addEventListener("resize", () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(() => scenes.forEach((s) => s.resize()), 150); });

/* ---------- setCode block strips ---------- */
function blocks(el) {
  const halt = el.dataset.blocks === "halt";
  const n = 6, w = 48, gap = 18, y = 11, h = 32;
  let s = "";
  for (let i = 0; i < n; i++) {
    const x = 4 + i * (w + gap);
    if (i > 0) s += `<line class="blk-link" x1="${x - gap}" y1="${y + h / 2}" x2="${x}" y2="${y + h / 2}"/>`;
    if (halt && i >= 3) { s += `<rect class="blk-dead" x="${x}" y="${y}" width="${w}" height="${h}" rx="5"/>`; continue; }
    s += `<rect class="${i >= 3 ? "blk-new" : "blk-cell"}${!halt && i === n - 1 ? " live-tick" : ""}" x="${x}" y="${y}" width="${w}" height="${h}" rx="5"/>`;
    s += `<text class="blk-text" x="${x + w / 2}" y="${y + h / 2}" text-anchor="middle" dominant-baseline="central">${i < 2 ? "" : i === 2 ? "set" : `+${i - 2}`}</text>`;
  }
  el.innerHTML = s;
}
$$("[data-blocks]").forEach(blocks);

/* ---------- global wiring ---------- */
document.addEventListener("click", async (e) => {
  const run = e.target.closest("[data-run]");
  if (run) { setMenu(false); return load(run.dataset.run); }
  const rl = e.target.closest("[data-run-link]");
  if (rl) load(rl.dataset.runLink);
  const tl = e.target.closest("[data-tab-link]");
  if (tl) showPane(tl.dataset.tabLink);
  const f = e.target.closest("[data-f]");
  if (f) { filter = f.dataset.f; return render(); }
  const c = e.target.closest("[data-copy]");
  if (c) {
    const label = c.querySelector(":scope > span");
    try {
      await navigator.clipboard.writeText(c.dataset.copy);
      if (label) label.textContent = "copied"; else c.classList.add("done");
    } catch {
      if (label) label.textContent = "select + copy";
    }
    setTimeout(() => { if (label) label.textContent = "copy"; c.classList.remove("done"); }, 1600);
  }
});

const motionBtn = $("[data-motion]");
function setStill(v) {
  still = v;
  document.documentElement.classList.toggle("still", v);
  $("[data-steps]").classList.toggle("paused", v);
  motionBtn.setAttribute("aria-pressed", String(v));
  motionBtn.setAttribute("aria-label", v ? "Resume motion" : "Pause motion");
  const svg = $(".wires");
  if (svg?.pauseAnimations) v ? svg.pauseAnimations() : svg.unpauseAnimations();
}
motionBtn.addEventListener("click", () => setStill(!still));
setStill(still);

const nav = $("[data-nav]");
const onScroll = () => nav.classList.toggle("scrolled", scrollY > 30);
addEventListener("scroll", onScroll, { passive: true });
onScroll();
const navLinks = $$(".links a");
const spy = new IntersectionObserver((entries) => {
  for (const e of entries) if (e.isIntersecting) navLinks.forEach((a) => a.setAttribute("aria-current", String(a.getAttribute("href") === `#${e.target.id}`)));
}, { rootMargin: "-45% 0px -50% 0px" });
["harness", "flow", "runs", "v3"].forEach((id) => spy.observe(document.getElementById(id)));

const start = RUNS.find((r) => `#${r.id}` === location.hash)?.id ?? "upgrade-ed100x";
load(start);
