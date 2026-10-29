# Portal Canary

**Differential runtime-upgrade testing for Portaldot.**

`try-runtime` tells you the migration ran. Portal Canary tells you whether your app still works, shows the exact state that diverged, and gives you one command to reproduce it.

**Live:** https://portal-canary-app.vercel.app. Start a real upgrade run from the [dashboard](https://portal-canary-app.vercel.app/dashboard), compare any two nodes, and check each run's on-chain record from the page.

> Status: early development for the Portaldot Hacker House 2026 (Node Operations & Tooling track). See [`docs/PLAN.md`](docs/PLAN.md) for the full design and [`docs/V3_READINESS.md`](docs/V3_READINESS.md) for live V3 endpoint checks.

## The case Canary exists for: an upgrade that silently destroys funds

A runtime upgrade can do everything right on the surface: `setCode` succeeds, `spec_version` goes up, blocks keep coming, no error is emitted. Its migration can still rewrite balances. `halve-reserved.compact.wasm` is built from the public Portaldot source with one **INJECTED** migration ([`backend/runtimes/out/halve-reserved.patch`](backend/runtimes/out/halve-reserved.patch)): it halves every reserved balance and leaves `TotalIssuance` alone. `canary upgrade` snapshots every account and the supply invariant at a pinned block before `setCode` and again after, and diffs them. Real output from two dev nodes ([`scripts/migration-demo.sh`](scripts/migration-demo.sh)):

```
$ canary upgrade --ws ws://127.0.0.1:9950 --wasm runtimes/out/clean.compact.wasm
after      spec_version 1003
liveness   ok (#19 -> #22 under the new runtime)
state      before #17 supply_conservation PASS  (10 accounts, issuance 350001 POT, held 350001 POT)
state      after  #22 supply_conservation PASS  (10 accounts, issuance 350001 POT, held 350001 POT)
verdict    PASS: supply conserved across the upgrade (0 accounts changed, all accounted for)

$ canary upgrade --ws ws://127.0.0.1:9951 --wasm runtimes/out/halve-reserved.compact.wasm
events     system.CodeUpdated, sudo.Sudid, system.ExtrinsicSuccess
after      spec_version 1006
liveness   ok (#24 -> #27 under the new runtime)
state      before #22 supply_conservation PASS  (10 accounts, issuance 350001 POT, held 350001 POT)
state      after  #27 supply_conservation FAIL  (10 accounts, issuance 350001 POT, held 349991 POT)
changed    2 accounts (2 with reserved moved):
  5Ejp33yciyo8HUo5QyQMk2t6UcQAGsBRo9YHGURsueEZXscJ  reserved 10 -> 5 (-5)
  5HgvZvxhB9quVpMigzS3pTmKuYXeqF451LyJykbSF8HZ9ScM  reserved 10 -> 5 (-5)
verdict    REGRESSION Critical: supply invariant broken by the upgrade; accounts now hold 10 POT less than TotalIssuance: funds destroyed
```

Exit code 1, so it blocks CI. `canary invariants --at <post-upgrade block>` confirms it independently (delta −10 POT). Full JSON: [`examples/upgrade-halve-reserved`](examples/upgrade-halve-reserved). The injected bug is a test runtime, not a Portaldot finding.

## Repository layout

```
frontend/   Next.js site: landing page and /dashboard (compare, test + attest, doctor, runs, registry, invariants)
backend/    Rust workspace: the canary CLI and engine
  crates/canary-chain   metadata decoder (V13 + V14), structural diff, hazards, RPC
  crates/canary-cli     canary doctor / compare / invariants / test / upgrade / reproduce
  crates/canary-wasm    the compare engine compiled to WebAssembly for the frontend
  driver/               bun + @polkadot/api: signs and submits workflow steps
  tests/workflows/      YAML workflow corpus
  runtimes/             candidate runtimes built from the public Portaldot source
scripts/    demos, wasm build, V3 snapshot
examples/   recorded outputs (mainnet vs V3, upgrade runs)
docs/       plan, architecture, V3 readiness log
action.yml  GitHub Action
```

## Why it exists

Portaldot mainnet runs a 2021-era Substrate runtime with **metadata V13**. Modern tooling such as `subxt` requires V14+ and cannot decode it. Canary speaks raw JSON-RPC and SCALE, so it works on Portaldot mainnet today. It decodes both V13 (mainnet) and V14 (the live V3 testnet), so it can diff mainnet against V3 directly: see [`examples/mainnet-vs-v3`](examples/mainnet-vs-v3) and [`docs/V3_READINESS.md`](docs/V3_READINESS.md).

## Available now: `canary doctor`

Diagnose any Portaldot endpoint layer by layer (DNS → TCP → WebSocket → RPC → runtime) and fingerprint the runtime behind it.

```
$ canary doctor --ws wss://mainnet.portaldot.io --ws wss://test-node-v3.portaldot.dev --eth https://test-evm-rpc-v3.portaldot.dev
substrate  wss://mainnet.portaldot.io
  network     ok (47.242.204.5:443)
  chain       Portaldot Mainnet  (node Portaldot Node 2.0.0-unknown-x86_64-linux-gnu)
  runtime     portaldot spec_version=1002 impl=0 tx_version=2
  metadata    V13 (153205 bytes, sha256 b87080f9349f936e…)  pre-V14: modern subxt cannot decode this
  apis        13 total, 3 unrecognised; capabilities: consensus, core, fees, finality, signing, wasm-contracts
    wasm-contracts   present
    evm              absent
    upgrade-testing  absent
  verdict     HEALTHY

substrate  wss://test-node-v3.portaldot.dev
  chain       PortaldotV3 Test  (node PortaldotV3 Node 3.0.0-dev-fddd43141f2)
  runtime     portaldot-v3 spec_version=3002 impl=0 tx_version=2
  metadata    V14 (561916 bytes, sha256 ba1613ee42e06ac1…)
  apis        26 total, 11 unrecognised; capabilities: consensus, core, evm, fees, finality, signing, wasm-contracts
    wasm-contracts   present
    evm              present
    upgrade-testing  absent
  verdict     HEALTHY

evm        https://test-evm-rpc-v3.portaldot.dev
  chain id    420420777
  client      eth-rpc/main-fddd431/x86_64-unknown-linux-gnu/rustc1.98.0
  verdict     HEALTHY
```

(Output trimmed: network and genesis lines omitted.)

Flags: `--ws <url>` (repeatable, default `ws://127.0.0.1:9944`), `--eth <url>` (EVM JSON-RPC, repeatable), `--timeout <secs>`, `--json`. Exits `2` if any endpoint is unhealthy, so it works as a CI gate.

## Available now: `canary invariants`

Read-only state invariants on a live chain, pinned to one finalized block. Real result on Portaldot mainnet:

```
$ canary invariants --ws wss://mainnet.portaldot.io
invariant  supply_conservation  (wss://mainnet.portaldot.io)
  block           #2727345 0x35781c79603a33982006bb86bea0a9ffff13d979e8f993bc91fe3a4cf700018c
  accounts        4719 (layouts: {"with_sufficients": 4719}, decode errors: 0)
  sum free        1016780936.83019349511407 POT
  sum reserved    572.61 POT
  sum total       1016781509.44019349511407 POT
  total issuance  1016781509.44019349511407 POT
  delta           +0 planck
  verdict         PASS
```

Exit codes: `0` PASS, `1` FAIL (invariant broken), `2` INCONCLUSIVE (undecodable state or unreachable node). The same check runs before and after a runtime upgrade to catch migrations that create or destroy funds.

## Available now: `canary compare`

Structural diff of two live runtimes (spec/tx version, runtime APIs, and every pallet's calls, events, storage, constants, errors) from a built-in V13 metadata decoder. Real finding:

```
$ canary compare --baseline wss://mainnet.portaldot.io --candidate ws://127.0.0.1:9944
baseline   wss://mainnet.portaldot.io  spec portaldot#1002  metadata b87080f9349f936e…
candidate  ws://127.0.0.1:9944  spec portaldot#1002  metadata b7ad30ded773cf04…
~ Babe.constant.EpochDuration
    baseline:  u64 = 120 (0x7800000000000000)
    candidate: u64 = 1200 (0xb004000000000000)
~ Babe.constant.ExpectedBlockTime
    baseline:  T::Moment = 60000 (0x60ea000000000000)
    candidate: T::Moment = 6000 (0x7017000000000000)
… 10 more (election phases, treasury, contracts deposits and rent)
WARNING  runtime changed without a spec_version/transaction_version bump
```

The public dev node and mainnet report the same `spec_version` 1002 but are different runtimes, so dev-node results do not automatically carry over to mainnet.

### In the browser

The dashboard's **Compare** view ([portal-canary-app.vercel.app/dashboard#compare](https://portal-canary-app.vercel.app/dashboard#compare)) runs the same comparison live, between any two nodes, with the risks judged as in [Compatibility risks](#compatibility-risks). The page opens a WebSocket to each node and calls `canary-chain`'s decoder and diff, compiled to WebAssembly (`backend/crates/canary-wasm`, about 300 KB). No server is involved and nothing needs installing. The landing page reads its numbers the same way.

The dashboard's **On your node** view is `canary test` and `canary attest` in the browser (`frontend/lib/tx`). It runs the workflow suite as real signed extrinsics on both endpoints, classifies each finding like `verdict.rs`, anchors the report with `system.remark` and verifies the anchor from the chain. On a local dev chain (`ws://127.0.0.1:9944`) the public dev accounts sign, so nothing is needed; the hosted page reaches a local node once the browser's local-network permission prompt is accepted. On any other chain, including the V3 testnet, a connected Substrate wallet (Portaldot, Talisman, SubWallet, Polkadot.js) signs and pays. The panel reads the wallet's balance first and refuses to start a run the wallet cannot fund. Per-run accounts are swept back after each workflow, so a run costs only fees and deposits. On a live chain each test account is funded with at most 5 tokens, so V3 → V3 needs at most 10 tPOT; the two workflows that move more than that themselves (`balances.keep_alive`, `contracts.counter`) run on dev chains only. `canary verify --run <dir>` accepts the `report.json` and `attestation.json` the page downloads.

The site is a Next.js app in `frontend/` (`bun run dev` / `bun run build`). `bun run test` checks five things, and CI runs the same tests:

- every landing component still server-renders the markup of the original static page;
- every served report's finding hashes, verdicts and attestation payloads rebuild exactly;
- the browser's runtime-API table matches `apis.rs`;
- the packaged workflow suite matches `backend/tests` (`bun run suite` repackages it);
- the run record the page rebuilds is byte-for-byte the one `canary attest` writes.

`npx playwright test` drives the production build in Chromium, on desktop and phone sizes. It covers every dashboard view, Compare against the real mainnet and V3 nodes (the control returns 0 changes; mainnet → V3 is judged with evidence), refused input, the supply invariant, the doctor, the runs list and a run's on-chain record re-verified in the browser. CI runs it as `dashboard-e2e`.

Rebuild the engine with `scripts/build-wasm.sh`. `bun scripts/engine-live.test.ts` runs the browser module against mainnet and V3 and checks it against the CLI result (same changes and hazards, and 0 for the control).

## Available now: `canary test` and `canary reproduce`

Run a YAML workflow corpus ([`backend/tests/workflows`](backend/tests/workflows)) against a baseline and a candidate runtime. Each workflow runs on both sides with freshly funded, per-run namespaced accounts; state is read before and after, pinned to block hashes; every expectation is evaluated on both sides and classified:

| Verdict | Meaning |
|---|---|
| **REGRESSION** | an expectation holds on the baseline and fails on the candidate |
| **DIFFERENCE** | observable behaviour differs, every expectation still holds |
| **INCONCLUSIVE** | not comparable (setup failed, or the baseline itself fails) |
| **PASS** | all expectations hold on both; nothing observable differs |

Severity is rule-based (invariant → Critical; core dispatch/delta → High; …) and every finding carries its rationale. Fee-multiplier drift is normalised within 1 ppm and still shown in the report. Exit codes: `1` on any regression, `2` if anything is inconclusive.

**Determinism control** (same dev node as baseline and candidate): all PASS. [`examples/self-compare`](examples/self-compare)

## Available now: real runtime upgrades (`canary upgrade`)

Mode B applies a runtime built from the public Portaldot source to a running dev chain with `sudo.sudoUncheckedWeight(system.setCode)`, then runs the corpus against the upgraded chain. An upgrade only counts once the new runtime has produced three more blocks.

Candidates are built by [`backend/runtimes/build.sh`](backend/runtimes/build.sh) from [portaldotVolunteer/Portaldot](https://github.com/portaldotVolunteer/Portaldot) with a pinned 2021 nightly toolchain. Each WASM is committed with its exact source diff and hash ([`backend/runtimes/out`](backend/runtimes/out)):

| WASM | Source change | spec |
|---|---|---|
| `clean.compact.wasm` | none besides dev-chain block time (6 s) | 1003 |
| `ed100x.compact.wasm` | **INJECTED**: `ExistentialDeposit` 1 → 100 POT | 1004 |
| `fee10x.compact.wasm` | **INJECTED**: `TransactionByteFee` 10 → 100 MILLICENTS | 1005 |
| `halve-reserved.compact.wasm` | **INJECTED** migration: halves every reserved balance, `TotalIssuance` unchanged | 1006 |
| `source-60s.compact.wasm` | unmodified public source (60 s blocks) | 1003 |

`scripts/upgrade-demo.sh` runs the whole thing with no manual steps. Real output:

```
$ canary upgrade --ws ws://127.0.0.1:9945 --wasm runtimes/out/ed100x.compact.wasm
before     spec_version 1002
events     system.CodeUpdated, sudo.Sudid, system.ExtrinsicSuccess
after      spec_version 1004
liveness   ok (#9 -> #12 under the new runtime)

$ canary compare --baseline ws://127.0.0.1:9944 --candidate ws://127.0.0.1:9945
~ Balances.constant.ExistentialDeposit
    baseline:  T::Balance = 100000000000000
    candidate: T::Balance = 10000000000000000

$ canary test --baseline ws://127.0.0.1:9944 --candidate ws://127.0.0.1:9945 --injected "ed100x: …"
PASS          Info      balances.keep_alive
REGRESSION    High      balances.transfer.basic
    ✗ step 0 dispatch success  baseline: success  candidate: failed (balances.ExistentialDeposit)
    ✗ delta receiver.free == 100000000000000  baseline: +100000000000000  candidate: +0
PASS          Info      balances.transfer.insufficient
PASS          Info      identity.deposit
```

The fee candidate shows Canary does not cry wolf: fees per transfer rise from 0.0147 to 0.147 POT, every expectation still holds, so all four workflows come back **DIFFERENCE / Low** and the run exits 0 ([`examples/upgrade-fee10x`](examples/upgrade-fee10x/report.html)).

Control (clean upgrade vs itself): all PASS. `canary reproduce` returns the identical finding hash. Full report: [`examples/upgrade-ed100x/report.html`](examples/upgrade-ed100x/report.html).

### Contract workflow

`contracts.counter` deploys a WASM contract with `Contracts.instantiateWithCode`, calls it twice and checks the value it emits each time (`ContractEmitted` with `0x01…`, then `0x02…`). The contract is 264 bytes of hand-written WAT against the `seal0` API ([`backend/tests/contracts/counter.wat`](backend/tests/contracts/counter.wat)), so the corpus needs no ink!/cargo-contract toolchain matching Portaldot's 2021 pallet-contracts. Workflow args can reference files (`file:tests/contracts/counter.wasm`) and earlier events (`step:0:contracts.Instantiated:1`, the new contract's address).

| Run | `contracts.counter` |
|---|---|
| control (clean upgrade vs itself) | PASS |
| INJECTED ed100x (ExistentialDeposit 100 POT) | **REGRESSION High**: the 50 POT endowment no longer funds a new contract |
| INJECTED fee10x | DIFFERENCE Low: higher fees, contract still works |

`contracts.CodeStored` only fires the first time a code blob reaches a chain, so the workflow lists it under `history_events`: a difference in it alone is shown in the report but not counted.

### Finding: the public source halts the dev chain

Applying the **unmodified** public source to the 6 s dev chain is accepted by `setCode` and bumps `spec_version`, then block production stops for good:

```
$ canary upgrade --ws ws://127.0.0.1:9946 --wasm runtimes/out/source-60s.compact.wasm --timeout 40
after      spec_version 1003
liveness   HALTED: best block stuck at #85 for 40s after the upgrade (needed #88)
verdict    REGRESSION Critical: runtime accepted by setCode but block production stopped
node log:  panicked at 'Timestamp slot must match `CurrentSlot`'
```

The source targets 60 s blocks, the dev chain runs 6 s, and BABE slot duration cannot change on a live chain. `canary compare` now reports this class of change before anyone applies it:

```
HAZARD   Babe.constant.EpochDuration: BABE epoch duration cannot change on a running chain; block production halts
HAZARD   Babe.constant.ExpectedBlockTime: BABE slot duration cannot change on a running chain; block production halts
HAZARD   Timestamp.constant.MinimumPeriod: timestamp period is tied to the BABE slot; a change breaks slot/timestamp checks
```

This is about the local dev chain, not mainnet: mainnet runs 60 s blocks like the source. "Spec version went up" is not proof an upgrade worked.

### Compatibility risks

`canary compare` (and the dashboard's Compare and run pages, through the same wasm build) judges every diff with the rules in `backend/crates/canary-chain/src/risk.rs`. Each risk carries a severity, the reason, and the before/after rows it rests on, grouped per pallet:

| Severity | Rule | Fires when |
|---|---|---|
| Critical | `spec-name`, `spec-version` | setCode would refuse the runtime (different `spec_name`, `spec_version` not increased) |
| Critical | `consensus-constant` | BABE epoch/slot or the timestamp period changes |
| Breaking | `call-encoding` | a pallet index, call index or call signature changes, a call or pallet is removed, or signed extensions change, without a `transaction_version` bump |
| Needs migration | `storage-type`, `storage-removed` | a storage item changes type or disappears |
| Behaviour change | `constant` | a constant changes value |
| Client update | `event`, `error`, `runtime-api`, `call-encoding` | events or errors are removed or renumbered, a runtime API is removed or re-versioned, or call encoding changes with a `transaction_version` bump |

Additions alone carry no risk. Mainnet → V3 gives 969 changes and 111 risks (3 critical); Mainnet → Mainnet gives 0 and 0.

### Compatibility note found along the way

Current `@polkadot/api` decodes `DispatchError::Module` as `{ index: u8, error: [u8; 4] }`; Portaldot's 2021 runtime emits `{ index: u8, error: u8 }`, so `System.Events` fails to decode for any failed extrinsic. Canary's driver pins the legacy type and treats an undecodable block as **INCONCLUSIVE**, never as success.

## Runs from the dashboard

**New run** takes a candidate runtime: one of the runtimes built in this repo, an uploaded `.wasm`, or a URL. **Start run** dispatches [`.github/workflows/canary-run.yml`](.github/workflows/canary-run.yml), which:

1. starts two Portaldot dev chains from one of two starting states:
   - **Mainnet state** (the default): a fork of mainnet at its latest finalized block, built by [`backend/driver/src/fork.ts`](backend/driver/src/fork.ts). Every pallet's storage is copied (all 4,716 accounts, deposits, locks, stakes, vesting, identities) except consensus and block history, which stay the dev spec's so one local authority produces blocks. The dev signers are added to the accounts and to `TotalIssuance`, staking eras are frozen (`ForceNone`), and the two chains are kept from peering. Taking the state takes about 15 seconds, so every run forks current mainnet;
   - **Fresh chain**: a new dev chain, with accounts holding reserved deposits written into it, so a migration has something to break;
2. upgrades it to the candidate with `system.setCode` (`canary upgrade`): balances and the supply invariant before vs after, and whether blocks keep coming;
3. compares the two runtimes (`canary compare`) and runs the workflow suite (`canary test`);
4. writes `result.json` (exit codes plus the sha256 of every other file), then records it on the V3 testnet with `canary attest` and checks the record with `canary verify`;
5. keeps the files as `<run id>.zip` on the repository's [`runs` release](https://github.com/Venkat5599/PRT/releases/tag/runs) (and as a 30-day artifact).

The run page follows the steps live, then shows the verdict, the compatibility risks and the evidence. Its **On-chain record** card re-checks in the browser that every file matches `result.json`, that `result.json` matches the recorded remark, and that the remark is in the block; it links the block in an explorer.

On mainnet state, `halve-reserved` halves the deposits of all 9 real accounts that hold one (286.305 POT destroyed, each account listed), while `clean` passes with no account changed.

### Daily check

[`.github/workflows/daily-check.yml`](.github/workflows/daily-check.yml) runs every day at 08:00 IST: `clean` on mainnet state must pass, and `halve-reserved` must be caught. The second run shows the canary still catches what it exists for. Both runs appear on the dashboard and are recorded on V3. If either expectation fails, or a run could not be recorded, the check opens an issue (or comments on the open one), and closes it when a later check passes.

Two secrets are involved:

| Secret | Where | Used for |
|---|---|---|
| `CANARY_GH_TOKEN` | Vercel (server only) | starting `canary-run.yml` and reading its results. A fine-grained token on this repository with Actions read/write and Contents read is enough. |
| `CANARY_ATTEST_SEED` | GitHub Actions | the key that signs each run's record on V3. It needs a little tPOT: one record costs about 0.022 tPOT. If it runs out, the run page says why the run was not recorded. |

## Build

Linux or WSL2 (recommended on Windows):

```bash
sudo apt install -y build-essential pkg-config libssl-dev
cd backend && cargo build --release
./target/release/canary doctor --ws wss://mainnet.portaldot.io
```

Run a local Portaldot dev node to test against:

```bash
curl -LO https://github.com/portaldotVolunteer/Portaldot-node/raw/main/portaldot-testnet-ubuntu.tar.gz
tar -xzf portaldot-testnet-ubuntu.tar.gz && cd portaldot-testnet-ubuntu
chmod 755 portaldot_dev && ./portaldot_dev --dev --tmp
```

End-to-end demos (need [bun](https://bun.sh); download the dev node if `PORTALDOT_DEV` is unset):

```bash
bash scripts/demo.sh          # doctor, compare, control, injected migration, reproduce, attest, verify
bash scripts/upgrade-demo.sh  # real setCode upgrades: clean vs INJECTED ed100x, plus the halting source runtime
bash scripts/migration-demo.sh  # an upgrade whose migration destroys funds, caught by canary upgrade
```

## Roadmap

- [x] `doctor`: layered endpoint diagnosis, metadata version, runtime API capabilities
- [x] Storage reads with curated V13 codecs (`System.Account`, `Balances.TotalIssuance`)
- [x] Mainnet supply invariant (read-only): `canary invariants`
- [x] `compare`: V13 metadata decoder + structural runtime diff
- [x] Workflow corpus (YAML) + side-by-side runner (two dev nodes)
- [x] Verdict classifier (REGRESSION / DIFFERENCE / INCONCLUSIVE / PASS) + JSON/HTML report
- [x] `reproduce` with stable finding hash
- [x] Candidate runtimes built from source + real-upgrade mode (`system.setCode`) with liveness check
- [x] Upgrade hazards in `compare` (BABE slot/epoch changes)
- [x] Compatibility risks in `compare`: severity, reason and before/after evidence per finding
- [x] State diff across `setCode`: per-account balances and the supply invariant, before vs after (`canary upgrade`)
- [x] Upgrades tested on a fork of mainnet's current state (`fork.ts`), checked in CI
- [x] Daily check on mainnet state with issue alerts
- [x] On-chain attestation via `system.remark` (`canary attest` / `canary verify`) on the dev chain
- [x] GitHub Action ([`action.yml`](action.yml)) and CI against a real Portaldot dev node
- [x] Attestation on the public V3 testnet: 4 example runs anchored and verified on `wss://test-node-v3.portaldot.dev` (tx hashes in [`docs/V3_READINESS.md`](docs/V3_READINESS.md#v3-testnet-attestations))
- [x] `CanaryRegistry` contract live on the V3 EVM at `0x62Eacc58CE0FA37F06F24074AFb7B3F22Df708FF`, holding all four verdicts, read live by the dashboard's Registry panel ([`contracts/`](contracts), `forge test`)
- [x] WASM contract workflow (`contracts.counter`, hand-written against pallet-contracts v3)
- [ ] EVM contract workflows (no EVM API on Portaldot today; revisit on V3)

## Third-party code

Rust crates listed in `Cargo.toml` (tungstenite, ureq, native-tls, blake2, sha2, twox-hash, serde, serde_json, serde_yaml, clap, anyhow, hex, url). The driver uses `@polkadot/api`, `@polkadot/keyring` and `@polkadot/util-crypto` (Apache-2.0). No code copied from other projects.

## License

Apache-2.0
