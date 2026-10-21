// The live dashboard: read two runtimes straight from their nodes, diff them with
// the wasm build of `canary compare`, and keep both chains' heads ticking.
import { Node, readRuntime, compare, tally, loadEngine } from "./engine/canary.js";

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const fmt = (n) => (n == null ? "–" : Number(n).toLocaleString("en"));
const kb = (b) => `${Math.round(b / 1024).toLocaleString("en")} KB`;

const root = $("[data-live]");
const form = $("[data-live-form]", root);
const runBtn = $("[data-run-btn]", root);
const lanes = { baseline: $('[data-lane="baseline"]', root), candidate: $('[data-lane="candidate"]', root) };
const field = (side, k) => $(`[data-l="${k}"]`, lanes[side]);

let nodes = {};
let result = null;
let cat = "all";
let query = "";
let shown = 150;
let runId = 0;

/* ---------- lanes ---------- */
const BLOCKS = 8, BW = 60, GAP = 10;
function drawBlocks(side, list) {
  const svg = field(side, "blocks");
  // Draw in real pixels so the numbers stay legible on a phone; drop what does not fit.
  const W = Math.round(svg.getBoundingClientRect().width) || 560;
  svg.setAttribute("viewBox", `0 0 ${W} 40`);
  list = list.slice(-Math.max(1, Math.floor((W + GAP) / (BW + GAP))));
  const x0 = W - list.length * (BW + GAP) + GAP;
  svg.innerHTML = list.map((n, i) => {
    const x = x0 + i * (BW + GAP);
    const last = i === list.length - 1;
    const link = i ? `<line class="blk-link" x1="${x - GAP}" y1="20" x2="${x}" y2="20"/>` : "";
    return `${link}<g class="${last ? "blk-head" : "blk-past"}"><rect x="${x}" y="4" width="${BW}" height="32" rx="5"/><text x="${x + BW / 2}" y="20" text-anchor="middle" dominant-baseline="central">${String(n).slice(-4)}</text></g>`;
  }).join("");
}

function setLane(side, info) {
  const rv = info.runtime_version;
  field(side, "chain").textContent = info.chain ?? info.endpoint;
  field(side, "spec").textContent = `${rv.specName} ${rv.specVersion}`;
  field(side, "md").textContent = `V${parseInt(info.metadata.slice(10, 12), 16)} · ${kb(info.bytes)}`;
  field(side, "head").textContent = `#${fmt(info.head)}`;
}

function state(side, text, cls = "") {
  const el = field(side, "state");
  el.textContent = text;
  el.className = `lane-state ${cls}`;
}

async function follow(side, node, head) {
  // Blocks are numbered consecutively, so the strip starts with the real chain behind the head.
  const seen = head == null ? [] : Array.from({ length: BLOCKS }, (_, i) => head - BLOCKS + 1 + i).filter((n) => n >= 0);
  drawBlocks(side, seen);
  const push = (n) => {
    if (seen.at(-1) === n) return;
    seen.push(n);
    if (seen.length > BLOCKS) seen.shift();
    drawBlocks(side, seen);
    field(side, "head").textContent = `#${fmt(n)}`;
  };
  node.onclose = () => state(side, "Connection closed by the node. Compare again to reconnect.", "warn");
  try {
    await node.heads((h) => { push(parseInt(h.number, 16)); state(side, `Live on ${node.url}`, "ok"); });
  } catch {
    state(side, `Connected, but ${node.url} does not stream new heads.`, "warn");
  }
}

/* ---------- results ---------- */
const CATS = [
  ["all", "All", () => true],
  ["pallet", "Pallets", (p) => p.length === 1],
  ["index", "Indices", (p) => p[1] === "index"],
  ["call", "Calls", (p) => p[1] === "call"],
  ["event", "Events", (p) => p[1] === "event"],
  ["storage", "Storage", (p) => p[1] === "storage"],
  ["constant", "Constants", (p) => p[1] === "constant"],
  ["error", "Errors", (p) => p[1] === "error"],
  ["runtime", "Runtime", (p) => p[0] === "runtime" || p[0] === "extrinsic"],
];
const TAG = { added: "+", removed: "−", modified: "~" };

function visible() {
  const test = CATS.find((c) => c[0] === cat)[2];
  const q = query.toLowerCase();
  return result.changes.filter((c) => test(c.path.split(".")) && (!q || c.path.toLowerCase().includes(q)));
}

function renderList() {
  const hz = new Set(result.upgrade_hazards.map((h) => h.path));
  const list = visible();
  $("[data-changes]", root).innerHTML = list.slice(0, shown).map((c) => `
    <li class="ch k-${c.kind}${hz.has(c.path) ? " is-hz" : ""}">
      <span class="ch-tag" aria-label="${c.kind}">${TAG[c.kind]}</span>
      <span class="ch-path">${esc(c.path)}</span>
      ${c.baseline != null ? `<span class="ch-v"><i>A</i>${esc(c.baseline)}</span>` : ""}
      ${c.candidate != null ? `<span class="ch-v"><i>B</i>${esc(c.candidate)}</span>` : ""}
    </li>`).join("") || `<li class="ch-empty">Nothing matches.</li>`;
  $("[data-count]", root).textContent = `${fmt(Math.min(shown, list.length))} of ${fmt(list.length)}`;
  $("[data-more]", root).hidden = list.length <= shown;
}

function renderCats() {
  const counts = Object.fromEntries(CATS.map(([k, , t]) => [k, result.changes.filter((c) => t(c.path.split("."))).length]));
  $("[data-cats]", root).innerHTML = CATS.filter(([k]) => counts[k] || k === "all")
    .map(([k, label]) => `<button type="button" aria-pressed="${k === cat}" data-cat="${k}">${label}<span>${fmt(counts[k])}</span></button>`).join("");
}

function render(a, b) {
  const r = result;
  const t = tally(r.changes);
  const n = r.changes.length;
  const h = r.upgrade_hazards.length;
  const line = $('[data-k="verdict"]', root);
  line.className = `verdict-line ${h ? "reg" : n ? "diff" : "same"}`;
  line.textContent = !n ? "No structural changes." : h
    ? `${fmt(n)} ${n === 1 ? "change" : "changes"}. ${h} would halt the chain.`
    : `${fmt(n)} ${n === 1 ? "change" : "changes"}, none that halts a chain.`;
  const notes = [`${r.baseline.pallets} pallets against ${r.candidate.pallets}`];
  if (r.unversioned_change) notes.push("the runtime changed without a spec_version bump");
  if (!n && !r.metadata_identical) notes.push("metadata bytes differ only in docs or storage defaults");
  notes.push(h ? "exit 1" : "exit 0");
  $('[data-k="verdict-sub"]', root).textContent = notes.join(" · ");

  const set = (k, v) => { $(`[data-t="${k}"]`, root).textContent = v; };
  set("pallets", `+${t.pallets.added} / −${t.pallets.removed}`);
  set("indices", fmt(t.indices));
  set("calls", `+${t.calls.added} / −${t.calls.removed} / ~${t.calls.modified}`);
  set("hazards", fmt(h));
  set("events", fmt(t.events));
  set("storage", fmt(t.storage));
  set("constants", fmt(t.constants));
  set("errors", fmt(t.errors));
  $("[data-tally]", root).hidden = false;

  const hzList = $("[data-hazards]", root);
  hzList.innerHTML = r.upgrade_hazards.map((x) => {
    const c = r.changes.find((ch) => ch.path === x.path);
    const num = (s) => /= (\d+)/.exec(s ?? "")?.[1];
    return `<li><b>${esc(x.path)}</b><span class="hz-move">${fmt(num(c?.baseline))} → ${fmt(num(c?.candidate))}</span><p>${esc(x.reason)}</p></li>`;
  }).join("");
  hzList.hidden = !h;

  cat = "all"; query = ""; shown = 150;
  $("[data-search]", root).value = "";
  renderCats();
  renderList();
  const cli = `canary compare --baseline ${a.endpoint} --candidate ${b.endpoint} --json`;
  $('[data-k="cli"]', root).textContent = cli;
  $("[data-copy-cli]", root).dataset.copy = cli;
  const dl = $("[data-download]", root);
  if (dl.href.startsWith("blob:")) URL.revokeObjectURL(dl.href);
  dl.href = URL.createObjectURL(new Blob([JSON.stringify(r, null, 2)], { type: "application/json" }));
  $("[data-explorer]", root).hidden = false;
}

/* ---------- run ---------- */
async function run() {
  const id = ++runId;
  const urls = { baseline: form.baseline.value.trim(), candidate: form.candidate.value.trim() };
  for (const n of Object.values(nodes)) n.close();
  nodes = {};
  runBtn.disabled = true;
  runBtn.textContent = "Comparing…";
  root.classList.add("busy");
  $('[data-k="verdict"]', root).className = "verdict-line";
  $('[data-k="verdict"]', root).textContent = "Reading both runtimes…";
  $('[data-k="verdict-sub"]', root).textContent = "";
  for (const side of ["baseline", "candidate"]) {
    drawBlocks(side, []);
    for (const k of ["spec", "md", "pallets", "head"]) field(side, k).textContent = "–";
    field(side, "chain").textContent = urls[side];
  }
  const engine = loadEngine();
  try {
    const read = (side) => {
      const node = (nodes[side] = new Node(urls[side]));
      return readRuntime(node, (s) => state(side, `${s}…`)).then((info) => {
        setLane(side, info);
        state(side, `Read ${kb(info.bytes)} of metadata. Diffing…`);
        return info;
      }, (e) => { state(side, e.message, "bad"); throw e; });
    };
    const [a, b] = await Promise.all([read("baseline"), read("candidate")]);
    const heads = { baseline: a.head, candidate: b.head };
    await engine;
    if (id !== runId) return;
    result = await compare(a, b);
    field("baseline", "pallets").textContent = result.baseline.pallets;
    field("candidate", "pallets").textContent = result.candidate.pallets;
    render(a, b);
    for (const side of ["baseline", "candidate"]) {
      state(side, `Live on ${urls[side]}`, "ok");
      follow(side, nodes[side], heads[side]);
    }
  } catch (e) {
    if (id !== runId) return;
    const line = $('[data-k="verdict"]', root);
    line.className = "verdict-line base";
    line.textContent = "Could not compare these runtimes.";
    $('[data-k="verdict-sub"]', root).textContent = `${e.message}. Check the address; a local node also needs --rpc-cors all.`;
  } finally {
    if (id === runId) {
      runBtn.disabled = false;
      runBtn.textContent = "Compare";
      root.classList.remove("busy");
    }
  }
}

form.addEventListener("submit", (e) => { e.preventDefault(); run(); });
$("[data-swap]", root).addEventListener("click", () => {
  [form.baseline.value, form.candidate.value] = [form.candidate.value, form.baseline.value];
});
root.addEventListener("click", (e) => {
  const c = e.target.closest("[data-cat]");
  if (c) { cat = c.dataset.cat; shown = 150; renderCats(); renderList(); }
  if (e.target.closest("[data-more]")) { shown += 300; renderList(); }
});
let searchTimer;
$("[data-search]", root).addEventListener("input", (e) => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => { query = e.target.value.trim(); shown = 150; renderList(); }, 120);
});

// Start once the dashboard is near the screen, so the page itself loads light.
const io = new IntersectionObserver((entries) => {
  if (entries.some((x) => x.isIntersecting)) { io.disconnect(); run(); }
}, { rootMargin: "300px 0px" });
io.observe(root);
document.addEventListener("visibilitychange", () => {
  if (document.hidden) return;
  if (result && Object.values(nodes).some((n) => n.ws?.readyState > 1)) run();
});
