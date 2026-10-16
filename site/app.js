// Two chains side by side. Block numbers, specs and outcomes come from the
// recorded runs in /reports; the animation is faster than the real 6 s blocks.
(() => {
  const SCENARIOS = {
    control: {
      base: "clean · spec 1003",
      cand: "clean · spec 1003",
      upgrade: 4,
      transfer: { every: 5, base: ["ok", "sent ✓"], cand: ["ok", "sent ✓"] },
      verdict: '<span class="v v-pass">PASS</span> 4 of 4 workflows, 16 expectations, nothing observable differs',
      log: "canary test --baseline ws://127.0.0.1:9944 --candidate ws://127.0.0.1:9944\nPASS  balances.keep_alive · balances.transfer.basic · balances.transfer.insufficient · identity.deposit\nexit 0",
    },
    fee: {
      base: "clean · spec 1003",
      cand: "fee10x · spec 1005 · injected",
      upgrade: 9,
      transfer: { every: 5, base: ["ok", "fee .015"], cand: ["diff", "fee .147"] },
      verdict: '<span class="v v-diff">DIFFERENCE Low</span> 4 of 4 workflows, every expectation still holds',
      log: "~ delta sender.free  baseline: -1.0147 POT  candidate: -1.1470 POT\nfees x10, transfers still land, invariants hold\nexit 0",
    },
    ed: {
      base: "clean · spec 1003",
      cand: "ed100x · spec 1004 · injected",
      upgrade: 9,
      transfer: { every: 5, base: ["ok", "sent ✓"], cand: ["bad", "ED ✗"] },
      verdict: '<span class="v v-high">REGRESSION High</span> balances.transfer.basic, 1 of 4 workflows',
      log: "✗ step 0 dispatch success  baseline: success  candidate: failed (balances.ExistentialDeposit)\n✗ delta receiver.free == 100000000000000  baseline: +100000000000000  candidate: +0\nreproduced  4f3a42a3745cb696  identical finding hash",
    },
    halt: {
      base: "clean · spec 1003",
      cand: "public source, 60 s slots · spec 1003",
      upgrade: 82, haltAt: 85,
      transfer: null,
      verdict: '<span class="v v-crit">REGRESSION Critical</span> runtime accepted by setCode, block production stopped',
      log: "after      spec_version 1003\nliveness   HALTED: best block stuck at #85 for 40s (needed #88)\nnode log   panicked at 'Timestamp slot must match `CurrentSlot`'",
    },
  };

  const stage = document.querySelector(".stage");
  if (!stage) return;
  const tracks = { base: stage.querySelector('[data-track="base"]'), cand: stage.querySelector('[data-track="cand"]') };
  const tabs = [...stage.querySelectorAll('[role="tab"]')];
  const ink = stage.querySelector(".tab-ink");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");
  const STEP_MS = 1100;

  let sc, next, offset, last, raf, halted;

  function block(side, n) {
    const el = document.createElement("div");
    el.className = "blk";
    let x = "";
    if (n === sc.upgrade) { el.classList.add("code"); x = "setCode"; }
    else if (sc.transfer && n > sc.upgrade && (n - sc.upgrade) % sc.transfer.every === 2) {
      const [cls, label] = sc.transfer[side];
      el.classList.add(cls); x = label;
    }
    el.innerHTML = `<span class="n">#${n}</span><span class="x">${x}</span>`;
    return el;
  }

  function voidBlock() {
    const el = document.createElement("div");
    el.className = "blk void";
    el.textContent = `no block since #${sc.haltAt} · Timestamp slot must match CurrentSlot`;
    return el;
  }

  function fill(side, from, count) {
    const t = tracks[side];
    t.textContent = "";
    for (let i = 0; i < count; i++) {
      const n = from + i;
      if (side === "cand" && sc.haltAt && n > sc.haltAt) { t.appendChild(voidBlock()); break; }
      t.appendChild(block(side, n));
    }
  }

  function width() { return (tracks.base.firstElementChild?.getBoundingClientRect().width || 72) + 8; }
  function visibleCount() { return Math.ceil(stage.clientWidth / 64) + 3; }

  function set(name) {
    sc = SCENARIOS[name];
    stage.dataset.scenario = name;
    stage.querySelector('[data-k="base-spec"]').textContent = sc.base;
    stage.querySelector('[data-k="cand-spec"]').textContent = sc.cand;
    stage.querySelector('[data-k="verdict"]').innerHTML = sc.verdict;
    stage.querySelector('[data-k="log"]').textContent = sc.log;
    tabs.forEach((b) => b.setAttribute("aria-selected", String(b.dataset.s === name)));
    moveInk();

    const n = visibleCount();
    // Centre the moment that matters (setCode, or the stall); with reduced motion this frame is final.
    const anchor = sc.haltAt ?? sc.upgrade;
    const from = Math.max(1, anchor - Math.floor(n / 2) + 1);
    fill("base", from, n);
    fill("cand", from, n);
    next = from + n;
    offset = 0;
    halted = false;
    tracks.base.style.transform = tracks.cand.style.transform = "";
    last = performance.now();
    cancelAnimationFrame(raf);
    if (!reduce.matches) raf = requestAnimationFrame(tick);
  }

  function tick(now) {
    const dt = Math.min(now - last, 100);
    last = now;
    const w = width();
    offset += (dt / STEP_MS) * w;
    if (offset >= w) {
      offset -= w;
      tracks.base.firstElementChild.remove();
      tracks.base.appendChild(block("base", next));
      if (!halted) {
        const n = next;
        if (sc.haltAt && n > sc.haltAt) {
          // the candidate stops for good; its lane freezes where it stalled
          halted = true;
          tracks.cand.style.transform = `translateX(${-offset}px)`;
        } else {
          tracks.cand.firstElementChild.remove();
          tracks.cand.appendChild(block("cand", n));
        }
      }
      next++;
    }
    tracks.base.style.transform = `translateX(${-offset}px)`;
    if (!halted) tracks.cand.style.transform = `translateX(${-offset}px)`;
    raf = requestAnimationFrame(tick);
  }

  function moveInk() {
    const on = tabs.find((b) => b.getAttribute("aria-selected") === "true");
    if (!on || !ink) return;
    ink.style.width = `${on.offsetWidth}px`;
    ink.style.height = `${on.offsetHeight}px`;
    ink.style.transform = `translate(${on.offsetLeft}px, ${on.offsetTop}px)`;
  }

  tabs.forEach((b, i) => {
    b.addEventListener("click", () => set(b.dataset.s));
    b.addEventListener("keydown", (e) => {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      const j = (i + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length;
      tabs[j].focus();
      set(tabs[j].dataset.s);
    });
  });

  let resizeTimer;
  addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => set(stage.dataset.scenario), 150);
  });
  reduce.addEventListener?.("change", () => set(stage.dataset.scenario));
  document.fonts?.ready.then(moveInk);

  set(stage.dataset.scenario || "halt");
})();
