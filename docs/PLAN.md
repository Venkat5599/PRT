# PORTAL CANARY: Battle Plan

> Differential upgrade testing for Portaldot. Run the same application workflows against the current runtime and the candidate runtime, prove what changed, and anchor the verdict on-chain.

Track: **Node Operations & Tooling** · Stack: **Rust** core, small ink!/Solidity contract · Final deadline **2026-11-06 04:00 UTC** · Check-in **2026-10-24 12:00 UTC**

---

## 0. Reality check (verified 2026-10-15)

Facts found today. These change the original design.

| Fact | Source | Consequence |
|---|---|---|
| Public `portaldotVolunteer/Portaldot` is a **2021-era Substrate fork** (workspace still has `frame/metadata`, `max-encoded-len`, `client/light`, `finality-grandpa-warp-sync`) | repo `Cargo.toml` | Metadata is probably **V13, not V14**. Modern `subxt` needs V14+, so **do not build on subxt**. Building also needs a 2021 nightly toolchain |
| It ships `pallet-contracts`, `frame/try-runtime` and `utils/frame/try-runtime/cli` | repo `Cargo.toml` | ink! contracts and try-runtime exist in the public code. Old versions, so pin them |
| **No Frontier/EVM crates** in the public repo | repo `Cargo.toml` | V3.0 EVM source is not public, or lives somewhere else. **Ask on Discord on day 1** |
| Prebuilt binaries: `portaldot_dev` (local dev, Ubuntu/macOS) and mainnet node, in `portaldotVolunteer/Portaldot-node` | docs Chain Info | Use **WSL2** on Windows. You can test with the prebuilt binary before building from source |
| Mainnet RPC `wss://mainnet.portaldot.io`, SS58 `42`, token POT with **14 decimals** | docs Chain Info | Read-only mainnet state is available for real-data invariant checks |
| No public testnet RPC, explorer or faucet found | docs and web search | Testnet details must come from organisers. This is a blocker for the check-in tx hash |

Day-1 Discord questions (post these in the first hour):
1. Where are the V3.0 node and runtime source code, and which `spec_version` is it?
2. Testnet WS/EVM RPC endpoints, chain id, explorer and faucet?
3. Metadata version of the V3.0 runtime (V14+ or older)?
4. Is there an earlier V2.x runtime WASM we can use as the "baseline" for a real-version comparison?

---

## 1. Positioning (one sentence for every surface)

**"try-runtime tells you the migration ran. Portal Canary tells you whether your app still works, shows the exact state that diverged, and gives you one command to reproduce it."**

What exists vs what Canary adds (this goes in the README and the pitch deck):

| Capability | try-runtime | Chopsticks | **Portal Canary** |
|---|---|---|---|
| Run migration on real state | yes | yes | yes (reuses the same approach) |
| Same workflow on **both** runtimes, then diff | no | manual | **yes, automatic** |
| Application invariants (supply, ownership, contract state) | pallet-level only | no | **yes, declarative YAML** |
| Regression vs difference vs inconclusive verdicts | no | no | **yes** |
| One-command reproduction package | no | no | **yes** |
| On-chain attestation of the verdict | no | no | **yes** |
| Works on 2021-era Substrate (pre-V14 metadata) | partially | no | **yes, by design** |

The last row matters: on an old chain like Portaldot, the newer ecosystem tools will not run. Canary does, because it talks raw JSON-RPC plus SCALE.

---

## 2. How each judging criterion gets full marks

| Criterion | Weight | What earns full marks | Evidence judges see |
|---|---|---|---|
| Technical feasibility | 30% | Working diff engine, deterministic reruns, real Portaldot runtimes, attestation tx on testnet | CI badge, `canary test` live in demo, explorer link, tx hash |
| Innovation | 30% | App-level differential testing + evidence chain + on-chain attestation + mainnet-state invariants. Covers contracts (ink! and EVM if V3 is available) | Demo moment: candidate breaks a token contract; report pinpoints the storage key |
| Ecosystem contribution | 20% | Open-source corpus of Portaldot compatibility tests, GitHub Action, docs, runs on Portaldot's old Substrate | `tests/workflows/*.yaml`, `action.yml`, CONTRIBUTING |
| Business potential | 20% | Clear users (Foundation release team, node operators, dApp teams), adoption path and revenue model | Pitch deck slide plus one maintainer quote if possible |

---

## 3. Product core

### The loop
```
inputs:  baseline runtime + candidate runtime + workflow corpus
  1. inspect   -> hashes, spec_version, metadata diff (pallets, calls, storage, events, constants)
  2. provision -> two isolated nodes with identical genesis (Mode A) or one forked/upgraded node (Mode B)
  3. execute   -> same setup + steps on both, fixed accounts, fixed order
  4. observe   -> dispatch outcome, events, selected storage, invariants
  5. normalise -> strip block hash, timestamps, block numbers and fee jitter where declared
  6. classify  -> REGRESSION | DIFFERENCE | INCONCLUSIVE | PASS
  7. report    -> report.json + report.html + repro bundle + attestation tx
exit code: non-zero on any REGRESSION (CI gate)
```

### Verdicts (strict definitions)
- **REGRESSION**: a declared expectation holds on the baseline and fails on the candidate, and the environment manifests match.
- **DIFFERENCE**: observable output differs, but no declared expectation fails. Example: a fee changed.
- **INCONCLUSIVE**: the environments diverged (genesis hash, account setup or ordering), so the comparison is not trustworthy. Never silently promoted to PASS.
- **PASS**: all declared checks hold on both.

### Severity (rule-based, each finding carries its rationale)
- **Critical**: safety invariant broken (supply changes, funds lost or created, ownership changed).
- **High**: core workflow or required migration fails.
- **Medium**: declared compatibility expectation broken (call removed, event shape changed).
- **Low**: non-breaking metadata or behaviour change.
- **Info**: change detected, no failure.

Report wording rule: *"No regression detected in the configured corpus (N workflows, M invariants)."* Never "safe".

---

## 4. Architecture

```
                 canary-cli  (doctor | inspect | compare | test | reproduce | attest | report)
                      |
                 canary-core (orchestrator, run manifest, determinism guard)
        ______________|________________________________________________
       |              |                |               |               |
  inspector       provisioner       driver          observer        analyzer
  wasm hash,      spawn nodes,      build+sign      storage reads,  diff, invariants,
  version,        genesis, ports,   extrinsics,     events,         classify, severity
  metadata        Mode A / B        submit, wait    normalise
  (V13/V14        (WSL2 procs or    (native Rust;   (curated
  adapters)       Docker)           polkadot.js     codecs + raw
                                    via bun as      bytes kept)
                                    fallback)
                      |
                 reporter (JSON, static HTML, repro bundle) --> attestor (testnet contract / remark)
```

### Key decisions
1. **Own thin chain layer instead of subxt.** Use `jsonrpsee` (WebSocket), `parity-scale-codec`, `sp-core` hashing (or `twox-hash` + `blake2`), and `sr25519` signing via `schnorrkel`. Storage keys are computed directly (`twox128(pallet) ++ twox128(item) ++ hasher(key)`). This is version-agnostic and works on 2021 chains.
2. **Metadata adapter trait.** `MetadataV13Adapter` (names and strings, curated codecs for the storage we read) and `MetadataV14Adapter` (`scale-info`, dynamic decode). `canary doctor` detects the version from the `meta` magic and the version byte.
3. **Curated codecs for observed storage**, starting with `System.Account` (AccountInfo), `Balances.TotalIssuance`, `Assets.Asset`/`Assets.Account` and contract storage. Raw bytes are always stored next to the decoded value for forensics.
4. **Driver fallback.** If native signing of old-format extrinsics costs more than one day, switch the step driver to a 60-line bun + `@polkadot/api` script, which handles old metadata and signed extensions automatically. The Rust core still owns orchestration, diffing and reports. Decide this at the end of day 3, not later.
5. **Isolation.** Each node runs as a child process with its own `--base-path` temp dir, random ports and a wall-clock timeout. Candidate artifacts are untrusted: no public server ever executes them.
6. **Storage is files, not a DB.** `runs/<run-id>/{manifest.json, results.json, report.html, logs/}`. SQLite and Axum only if time remains (post-check-in).

### Two execution modes
| Mode | Mechanism | Proves | Priority |
|---|---|---|---|
| **A: Side by side** | Two `--dev` nodes (baseline binary, candidate binary), identical dev genesis, identical steps | Behaviour diff engine | P0, by day 5 |
| **B: Real upgrade** | One dev node with baseline: run setup, write legacy state, `sudo.sudoUncheckedWeight(system.setCode(candidate.wasm))`, then run assertions before and after | Migrations on legacy state | P0, by day 9 |
| **C: Mainnet-state invariants** | Read-only snapshot of `wss://mainnet.portaldot.io` (System.Account, TotalIssuance, and others) to check real invariants. Stretch goal: replay the candidate migration over the snapshot with try-runtime | Real network context, no sandbox abuse | P1 |

Mode C is the "real Portaldot data" moment: *"Sum of all 14-decimal POT balances on mainnet equals TotalIssuance at block #N. Here is the check, rerunnable by anyone."*

### On-chain attestation (testnet deliverable)
`CanaryRegistry` contract with one write function:
```
attest(baseline_hash: [u8;32], candidate_hash: [u8;32], corpus_hash: [u8;32],
       report_hash: [u8;32], verdict: u8, findings: u16)
query(candidate_hash) -> Vec<Attestation>
```
- Choose **Solidity** if the V3.0 EVM testnet is reachable (Foundry deploy, simple ABI, judges know it). Otherwise **ink!**, pinned to the version that matches the chain's `pallet-contracts`.
- Fallback, if neither is available by day 4: `system.remark` with the same payload. You still get a tx hash. Never zero on-chain evidence.
- `canary attest --run <id>` signs with a **dedicated test key** loaded from an env file. Seeds never go in the repo, logs or reports.

---

## 5. Test corpus (YAML, version-controlled)

```yaml
id: balances.transfer.basic
tags: [native, core]
importance: core            # feeds severity
setup:
  - fund: { account: alice, amount: "100000000000000" }   # 1 POT = 10^14
steps:
  - call: Balances.transfer
    signer: alice
    args: { dest: bob, value: "10000000000000" }
observe:
  storage: [System.Account(alice), System.Account(bob), Balances.TotalIssuance]
  events:  [Balances.Transfer]
expect:
  - dispatch: success
  - delta: { key: System.Account(bob).data.free, eq: "+10000000000000" }
  - invariant: total_issuance_preserved_minus_fees
  - event: { name: Balances.Transfer, fields: [from, to, amount] }
normalise: [block_hash, block_number, fee_amount]
```

Initial corpus (only cases that run on the chosen environment):
1. `balances.transfer.basic`
2. `balances.transfer.insufficient` (must fail on both; a candidate success is a REGRESSION)
3. `balances.existential_deposit.reap` (account reaping below ED)
4. `assets.create_mint_transfer` (`pallet-assets` is in the repo)
5. `fees.payment_info` (fee drift becomes a DIFFERENCE, not a regression)
6. `contracts.token.deploy_transfer` (ink! ERC-20-style, plus Solidity ERC-20 if EVM exists)
7. `migration.legacy_state.survives` (Mode B: state written before `setCode`, checked after)
8. `invariant.supply_conservation` (sum of accounts equals TotalIssuance)

### Injected regressions (the candidate runtimes)
Build one candidate per scenario from the same source, each with `spec_version + 1`. Every one is labelled **INJECTED** in the UI, the report and the video.

| Candidate | Code change (1–10 lines in runtime) | Expected Canary verdict | Teaches |
|---|---|---|---|
| `cand-fee` | Raise `TransactionByteFee` | **DIFFERENCE / Low** | Canary doesn't cry wolf |
| `cand-ed` | Raise `ExistentialDeposit` 100× | **REGRESSION / High** on reap workflow + app-level impact on small holders | Constant change breaks user flows |
| `cand-migration` | `on_runtime_upgrade` halves `reserved` for accounts with legacy flag | **REGRESSION / Critical**, supply invariant broken, exact keys listed | Hero demo moment |
| `cand-event` | Rename or remove a field in the `Transfer` event | **REGRESSION / Medium**, event shape breaks indexers | Breakage for app developers |

Real comparison (if the organisers share a previous runtime): run baseline V2.x against V3.0 and publish the honest result, whatever it is. That is stronger than any injected case.

---

## 6. Report & reproduction

- `report.json` (stable schema, documented), `report.html` (single static file, no framework, opens offline).
- Each finding contains the evidence chain: **runtime change -> affected workflow -> failed expectation -> storage key (raw + decoded, baseline vs candidate) -> repro command**.
- The evidence chain is displayed as a linked path in the HTML. Edges are labelled `observed` (correlation) or `direct` (the workflow touched that key/call). No invented causality.
- `canary reproduce <test-id> --run <id>` reruns from the saved manifest and must produce the identical finding hash. This determinism check is itself shown in the demo.
- Run manifest pins: both WASM sha256 hashes, `spec_version`, genesis hash, node binary hash, corpus git sha, canary version, account set, step order.

---

## 7. Schedule (one developer, gates are hard)

| Dates | Goal | Exit gate (binary) |
|---|---|---|
| **Oct 15 (today)** | Discord questions posted. WSL2 + prebuilt `portaldot_dev --dev` running. `state_getMetadata` version byte read. Repo created, first commit | Dev node produces blocks. Metadata version known |
| Oct 16–17 | Build runtime from source in pinned Docker (2021 nightly). Produce `baseline.wasm` + `cand-migration.wasm`. `system.setCode` succeeds on dev node | Two hashes, upgrade applied, `spec_version` bumped on chain |
| Oct 18–19 | Rust chain layer: RPC, storage key hashing, `System.Account` decode, extrinsic signing (or bun driver fallback, **decide end of Oct 18**) | `canary transfer` works end to end on dev node |
| Oct 20–21 | Corpus parser, Mode A runner, observer, normaliser, classifier, `report.json` | Same YAML produces PASS on baseline vs baseline |
| Oct 22 | Mode B + `cand-migration` regression + static HTML report | Critical REGRESSION shown with exact keys |
| Oct 23 | Attestation contract/remark on testnet, `canary attest`, README, architecture diagram, CI | Explorer link and tx hash in README |
| **Oct 24 (check-in by 12:00 UTC)** | 2–3 min video + DoraHacks check-in form | Submitted |
| Oct 25–28 | Remaining candidates, contracts workflow, Mode C mainnet invariants, `reproduce` determinism | 4 candidates produce 4 distinct correct verdicts |
| Oct 27 | Office-hour application: ask for a maintainer review of corpus + real V2 runtime | Applied |
| Oct 28–29 | Office hours: get feedback and, ideally, a quote | Notes in `docs/FEEDBACK.md` |
| Oct 30–Nov 1 | GitHub Action (`uses: portal-canary/action@v1`), evidence-chain view, docs, threat model | Action runs green in its own repo CI |
| Nov 2–3 | Clean-clone test on fresh WSL, fix verified defects only | `scripts/demo.sh` runs with zero manual steps |
| Nov 4 | Final video, pitch deck PDF | Files uploaded |
| **Nov 5** | Submit (one day early). Code freeze | DoraHacks submission confirmed |

Commit rule: small daily commits with meaningful messages. Never land core modules in one dump in the last 24 h (explicit rule: disqualification risk).

---

## 8. Fallback decision tree

```
V3.0 source available?
 ├─ yes -> build baseline + candidates from V3.0 (EVM workflows included)
 └─ no  -> use public repo runtime as baseline; say so plainly in README
Builds from source in Docker by Oct 17?
 ├─ yes -> injected candidates as planned
 └─ no  -> Mode A with two different prebuilt binaries (dev vs mainnet node runtime)
           + Mode B using a pre-built wasm if obtainable; narrow claims accordingly
Native signing works by Oct 18?
 ├─ yes -> pure Rust driver
 └─ no  -> bun + @polkadot/api step driver; Rust keeps everything else
Testnet reachable by Oct 23?
 ├─ yes -> CanaryRegistry contract (Solidity if EVM, else ink!)
 └─ no  -> ask organisers; meanwhile system.remark attestations on whatever public net exists
```

---

## 9. Demo video (≤3:00, storyboard)

| Time | Shot |
|---|---|
| 0:00–0:15 | Problem: "Runtime upgrades ship with 'node starts' as the test. Apps break after." |
| 0:15–0:35 | `canary doctor`: detects Portaldot dev node, metadata version, both WASM hashes |
| 0:35–1:05 | `canary test --baseline v1 --candidate cand-fee`: 8 PASS, 1 DIFFERENCE (Low). "It doesn't cry wolf." |
| 1:05–1:50 | `--candidate cand-migration`: **CRITICAL REGRESSION**, supply invariant broken; HTML evidence chain down to the storage key, baseline vs candidate bytes. Labelled INJECTED |
| 1:50–2:10 | `canary reproduce migration.legacy_state.survives`: identical finding hash |
| 2:10–2:35 | `canary attest`: tx on Portaldot testnet, explorer page, `query(candidate_hash)` |
| 2:35–2:50 | GitHub Action blocking a PR with the same finding |
| 2:50–3:00 | Mainnet-state invariant check + "open source corpus, built for Portaldot" |

Live Demo Day: the same flow from `scripts/demo.sh`, with a pre-recorded fallback ready.

---

## 10. Business model (pitch slide)

- **Users:** the Foundation release team (gate every runtime upgrade), validators and node operators (check attestations before upgrading), dApp teams (contribute their own workflows to the corpus).
- **Adoption path:** Foundation adopts the Action in the runtime repo → upgrade proposals cite a Canary attestation → operators query the registry → dApp teams add workflows so their app is covered.
- **Revenue:** open-source core (grant-funded ecosystem infrastructure). Paid hosted runner for teams with private corpora and scheduled checks against published candidates. Later, other legacy Substrate chains, where modern tooling breaks in the same way.
- **Ask:** Builder support programme for hosted runners plus a maintained Portaldot corpus.

---

## 11. Repository layout

```
portal-canary/
├── crates/
│   ├── canary-cli/        # clap commands
│   ├── canary-core/       # orchestrator, manifest, determinism guard
│   ├── chain/             # jsonrpsee client, storage keys, codecs, signer, metadata adapters
│   ├── provisioner/       # node spawn, base-path, ports, setCode upgrade
│   ├── analyzer/          # diff, invariants, classify, severity
│   └── reporter/          # json, static html, repro bundle, attest
├── contracts/registry/    # CanaryRegistry (solidity/ or ink/)
├── runtimes/              # Dockerfile (pinned nightly), patches/cand-*.patch, build.sh
├── tests/workflows/       # YAML corpus
├── action/                # GitHub Action
├── examples/sample-report/{report.json,report.html}
├── docs/ ARCHITECTURE.md THREAT_MODEL.md DEMO.md COMPARISON.md FEEDBACK.md
├── scripts/demo.sh
└── README.md              # quickstart, comparison table, testnet evidence, video link
```

---

## 12. Done criteria (checked before submission)

- [ ] `canary doctor` reports node, metadata version and both artifact hashes
- [ ] Baseline vs baseline returns PASS on all workflows (determinism control)
- [ ] `cand-fee` returns DIFFERENCE, not REGRESSION
- [ ] `cand-ed` returns REGRESSION/High on the reap workflow
- [ ] `cand-migration` returns REGRESSION/Critical with the exact storage keys listed
- [ ] `cand-event` returns REGRESSION/Medium on the event-shape check
- [ ] A forced genesis mismatch returns INCONCLUSIVE
- [ ] `canary reproduce` produces the identical finding hash twice
- [ ] Exit code non-zero on REGRESSION, zero on PASS/DIFFERENCE
- [ ] `report.html` opens offline and shows the full evidence chain
- [ ] At least one contract workflow (ink! or EVM) runs on both runtimes
- [ ] Attestation tx on Portaldot testnet, linked in README with explorer URL
- [ ] Mainnet-state supply invariant check runs read-only against `wss://mainnet.portaldot.io`
- [ ] GitHub Action fails a PR on REGRESSION
- [ ] Fresh WSL clone: `scripts/demo.sh` runs with no manual steps
- [ ] Anti: no report or README claims a real Portaldot vulnerability or that an upgrade is "safe"
- [ ] Anti: no seed phrase or private key in repo, logs or reports (`gitleaks` clean)
- [ ] Anti: no candidate WASM executed on any public server
- [ ] At least 15 meaningful commits spread over Oct 15–Nov 5; none of the core modules first committed after Nov 4
- [ ] Video ≤3:00, deck PDF, README with deployment instructions, all public

---

## 13. Cut list (do not build unless every box above is ticked)

Next.js dashboard, Axum API, SQLite, auth, multi-user, AI explanations, live monitoring, interactive graph libraries, multi-chain support.
