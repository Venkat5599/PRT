// Page behaviour: renders recorded runs (/reports/<id>/report.json) into the
// hero console, the recorder tape and the ledger; draws the dithered scenes;
// drives the harness tabs and the upgrade-flow steps. Runs once, on the client.
/* eslint-disable @typescript-eslint/no-explicit-any */
export function initSite() {
  const RUNS = [
    { id: "self-compare", name: "Control", hint: "Same node twice. Nothing should differ." },
    { id: "upgrade-fee10x", name: "Byte fee ×10", hint: "Injected via setCode. Fees move." },
    { id: "upgrade-ed100x", name: "Deposit ×100", hint: "Injected via setCode. A transfer breaks." },
    { id: "injected-faulty-migration", name: "Faulty migration", hint: "Injected setStorage. Supply stops adding up." },
  ];
  const PLANCK = 10n ** 14n;
  const $ = (s: string, el: ParentNode = document): any => el.querySelector(s);
  const $$ = (s: string, el: ParentNode = document): any[] => [...el.querySelectorAll(s)];
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => (({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }) as Record<string, string>)[c]);
  const LABEL: Record<string, string> = { REGRESSION: "regression", DIFFERENCE: "difference", PASS: "pass", INCONCLUSIVE: "inconclusive" };
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let still = reduced;
  const cache = new Map();
  let current: any = null;
  let currentId: string | null = null;
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
    // Each run swaps in with a short settle; skipped when motion is off.
    if (!still) big.parentElement?.animate([{ transform: "translateY(8px)" }, { transform: "none" }], { duration: 480, easing: "cubic-bezier(.22,.7,.2,1)" });
    big.textContent = h.text;
    $('[data-k="small"]').textContent = `across ${plural(s.workflows, "workflow", "workflows")}${worst ? ` · worst ${worst}` : ""} · exit ${exitCode(s)}`;
    $('[data-k="cmd"]').textContent = `canary test --baseline ${m.baseline.endpoint} --candidate ${m.candidate.endpoint}`;
    $('[data-k="runname"]').textContent = RUNS.find((x) => x.id === currentId)!.name;
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

    const counts: Record<string, number> = { all: r.results.length };
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
      const res = await fetch(`/reports/${id}/report.json`);
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
    } catch (e: any) {
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
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); (document.activeElement as HTMLElement).click(); }
    if (e.key === "Escape") { setMenu(false); pickerBtn.focus(); }
  });
  document.addEventListener("click", (e) => { if (!(e.target as HTMLElement).closest<HTMLElement>("[data-picker]")) setMenu(false); });

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
  const PANES: Record<string, { file: string; copy: string; foot: string; code: string }> = {
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
      file: `/reports/${currentId}/report.json`,
      copy: `canary test --baseline ${m.baseline.endpoint} --candidate ${m.candidate.endpoint}`,
      foot: `Recorded run · ${RUNS.find((x) => x.id === currentId)!.name} · spec ${m.baseline.spec_version} → ${m.candidate.spec_version}`,
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
    const gh = "https://github.com/Venkat5599/PRT/blob/main/examples/mainnet-vs-v3/";
    $('[data-k="json"]').href = name === "test" ? `/reports/${currentId}/report.json` : `${gh}${name}.json`;
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

  /* ---------- dithered photographs ---------- */
  // Each photo is drawn at 1/3 resolution, quantised per channel with a 4x4 Bayer
  // matrix, then upscaled with pixelated rendering: the printed-screen look.
  const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16);
  const PHOTOS: Record<string, { src: string; levels: number; focus: number; tone: number }> = {
    valley: { src: "/images/valley.jpg", levels: 7, focus: 0.55, tone: 1 },
    hero: { src: "/images/valley.jpg", levels: 7, focus: 0.6, tone: 0.82 },
    stairs: { src: "/images/stairs.jpg", levels: 6, focus: 0.35, tone: 1.35 },
    summit: { src: "/images/summit.jpg", levels: 6, focus: 0.5, tone: 0.85 },
  };
  const images = new Map();
  function photo(src) {
    if (!images.has(src)) {
      images.set(src, new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; }));
    }
    return images.get(src);
  }
  async function dither(canvas) {
    const cfg = PHOTOS[canvas.dataset.dither];
    const img = await photo(cfg.src);
    const r = canvas.getBoundingClientRect();
    if (!r.width || !r.height) return;
    const w = Math.round(r.width / 3), h = Math.round(r.height / 3);
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    // object-fit: cover, anchored on the photo's focus row.
    const s = Math.max(w / img.width, h / img.height);
    const dw = img.width * s, dh = img.height * s;
    ctx.drawImage(img, (w - dw) / 2, (h - dh) * cfg.focus, dw, dh);
    const data = ctx.getImageData(0, 0, w, h);
    const d = data.data, L = cfg.levels - 1;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = (y * w + x) * 4, th = BAYER[(y & 3) * 4 + (x & 3)];
        for (let k = 0; k < 3; k++) {
          const v = (d[i + k] / 255) * cfg.tone * L;
          const f = Math.floor(v);
          d[i + k] = ((v - f > th ? f + 1 : f) / L) * 255;
        }
      }
    }
    ctx.putImageData(data, 0, 0);
  }
  const dithered = $$("[data-dither]");
  dithered.forEach((c) => dither(c).catch(() => {}));
  let resizeTimer;
  addEventListener("resize", () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(() => dithered.forEach((c) => dither(c).catch(() => {})), 150); });

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
    const run = (e.target as HTMLElement).closest<HTMLElement>("[data-run]");
    if (run) { setMenu(false); return load(run.dataset.run); }
    const rl = (e.target as HTMLElement).closest<HTMLElement>("[data-run-link]");
    if (rl) load(rl.dataset.runLink);
    const tl = (e.target as HTMLElement).closest<HTMLElement>("[data-tab-link]");
    if (tl) showPane(tl.dataset.tabLink);
    const f = (e.target as HTMLElement).closest<HTMLElement>("[data-f]");
    if (f) { filter = f.dataset.f!; return render(); }
    const c = (e.target as HTMLElement).closest<HTMLElement>("[data-copy]");
    if (c) {
      const label = c.querySelector(":scope > span");
      try {
        await navigator.clipboard.writeText(c.dataset.copy!);
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
  ["live", "harness", "flow", "runs", "v3"].forEach((id) => spy.observe(document.getElementById(id)!));

  const start = RUNS.find((r) => `#${r.id}` === location.hash)?.id ?? "upgrade-ed100x";
  load(start);
}
