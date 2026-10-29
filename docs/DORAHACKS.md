# Portal Canary

**Test a Portaldot runtime upgrade on a fork of live mainnet before it ships.**

Portal Canary takes a candidate runtime, forks Portaldot mainnet at its latest finalized block, applies the upgrade with `system.setCode`, and checks what happened to every real account. It also checks that blocks kept coming, what changed in the runtime's interface, and whether the workflows people rely on still work. Every result is hashed and recorded on the Portaldot V3 testnet, so anyone can verify it without trusting us.

```text
setCode accepted  ≠  blocks kept coming  ≠  every balance survived
```

An upgrade can pass the first two and still destroy money. Portal Canary checks all three.

**Live app:** https://portal-canary-app.vercel.app/dashboard
**Code:** https://github.com/Venkat5599/portalcanary
**Pitch deck:** https://portal-canary-app.vercel.app/deck
**Testnet details:** https://github.com/Venkat5599/portalcanary/blob/main/docs/TESTNET.md

---

## Demo video

[![Watch the Portal Canary demo](https://img.youtube.com/vi/dV6r8IFqzck/maxresdefault.jpg)](https://youtu.be/dV6r8IFqzck)

https://youtu.be/dV6r8IFqzck

---

## Results so far

| What | Result |
|---|---|
| Bug caught on real mainnet state | `halve-reserved` destroyed **286.305 POT** across 9 real accounts at mainnet block #2,747,424 (4,716 accounts forked) |
| On-chain records | **6 runs recorded on V3, 6 verified**, latest in V3 block #238,224 |
| Mainnet vs V3 comparison | **969 changes, 111 risks** (3 critical); mainnet vs itself: 0 and 0 |
| Smart contract | `CanaryRegistry` deployed on the V3 EVM at `0x62Eacc58CE0FA37F06F24074AFb7B3F22Df708FF` |
| Daily check | runs every day at 08:00 IST; its first run found a real bug, opened an issue, and closed it after the fix |
| Tests | **115 passing**: 41 Rust, 32 unit, 38 browser, 4 contract; CI green |

---

## The problem

A runtime upgrade on Portaldot is one `setCode` call. The chain accepts it, `spec_version` goes up, blocks keep coming, and nothing flags a migration that quietly rewrote balances. A migration that halves every reserved balance and leaves `TotalIssuance` alone produces none of the usual warning signs. The supply just stops adding up.

Portaldot makes this harder. Mainnet runs a 2021 runtime with **metadata V13**, and current Substrate tooling only decodes V14 and up. The usual tools can't read mainnet at all.

## The solution

Portal Canary has its own V13 and V14 decoder, so it can read mainnet. For each candidate runtime it:

1. **Forks mainnet's real state** at the latest finalized block into a local chain in 4 to 15 seconds: all 4,716 accounts, balances, staking, vesting and identities.
2. **Applies the upgrade** with `setCode` on the fork, never on a live network.
3. **Diffs every account and the total supply** before and after.
4. **Checks liveness**: are blocks still produced under the new runtime?
5. **Compares the two runtimes** and rates every difference by severity.
6. **Runs five end-to-end workflows** as signed transactions on both the old and new runtime.
7. **Hashes every result file** into `result.json` and records that hash on the V3 testnet.

```text
candidate .wasm ──► fork mainnet @ finalized block ──► setCode on the fork
                                                           │
       ┌───────────────────────────────────────────────────┤
       ▼                     ▼                     ▼                   ▼
 every account +      blocks still        runtime diff +        5 workflows on
 supply, before       produced under      compatibility         baseline and
 vs after             the new runtime     risks                 candidate
       └───────────────────────────────────────────────────┬───────────────┘
                                                           ▼
                 result.json (sha256 of every file) ──► system.remark on V3
                                                           ▼
                        run page re-verifies it · scripts/verify-runs.sh re-verifies all
```

---

## Screenshots

### New run
Pick one of five runtimes built from the public source, each with its exact source change, or upload your own `.wasm`. Mainnet state is the default.

![New run](https://raw.githubusercontent.com/Venkat5599/portalcanary/main/docs/screenshots/new-run.png)

### A run on mainnet state
Run `971a7223bf7b`: Critical at mainnet block #2,747,398 (4,716 accounts), 286.305 POT destroyed.

![Run on mainnet state](https://raw.githubusercontent.com/Venkat5599/portalcanary/main/docs/screenshots/run-mainnet.png)

### On-chain record, checked in the browser
V3 block #237,962. The page checks that `result.json` matches the remark, that 8 of 8 files match `result.json`, and that the remark is in the block. The table lists each real account's reserved balance before and after.

![On-chain record](https://raw.githubusercontent.com/Venkat5599/portalcanary/main/docs/screenshots/run-proof.png)

### Compare any two nodes
Mainnet → V3: 969 changes and 111 risks (3 critical, 31 breaking, 35 needs migration, 12 behaviour change, 30 client update), each with its before and after rows.

![Compare](https://raw.githubusercontent.com/Venkat5599/portalcanary/main/docs/screenshots/compare.png)

---

## A real run, start to finish

Start a run of the injected migration bug against today's mainnet state:

```bash
curl -X POST https://portal-canary-app.vercel.app/api/runs \
  -H 'content-type: application/json' \
  -d '{"candidate":"halve-reserved","state":"mainnet"}'
```

About five minutes later the verdict is at [`/dashboard#run/bbbf22879a6a`](https://portal-canary-app.vercel.app/dashboard#run/bbbf22879a6a). This is the run's own output, from its [kept files](https://github.com/Venkat5599/portalcanary/releases/download/runs/bbbf22879a6a.zip):

```text
before     spec_version 1002
events     system.CodeUpdated, sudo.Sudid, system.ExtrinsicSuccess
after      spec_version 1006
liveness   ok (#7 -> #10 under the new runtime)
state      before #6 supply_conservation PASS  (4723 accounts, issuance 1017293206.60188295853852 POT, held 1017293206.60188295853852 POT)
state      after  #10 supply_conservation FAIL  (4723 accounts, issuance 1017293206.60188295853852 POT, held 1017292920.29688295853852 POT)
changed    9 accounts (9 with reserved moved)
verdict    REGRESSION Critical: supply invariant broken by the upgrade; accounts now hold 286.305 POT less than TotalIssuance: funds destroyed

attested   canary-run/1 94b4a227c16085410e0404e30b8fee3dab76c1a7e0c5a8e5ac1c609da4fb6d66 bbbf22879a6a u=1 c=0 t=1 h=0
chain      PortaldotV3 Test (wss://test-node-v3.portaldot.dev)
tx         0xefc2025a569a45ce453d2f2c1446fc1094d40a01610759f7fca0214a2fad79c3
block      #238224
VERIFIED
```

The upgrade succeeded, the version went up, and blocks kept coming. The only signal was the money, and Portal Canary caught it. The same run with the `clean` runtime passes with 0 accounts changed.

---

## Testnet deployment (Portaldot V3)

| | |
|---|---|
| Network | PortaldotV3 Testnet |
| Substrate WS | `wss://test-node-v3.portaldot.dev` |
| EVM RPC | `https://test-evm-rpc-v3.portaldot.dev` |
| EVM chain id | `420420777` |
| Explorer | https://node-console.portaldot.dev |
| Genesis hash | `0xd4f9acbcf7f52388d8b095abe3c198d19fc510e0343e643e87cfbccb155283bd` |

### 1. Run records (`system.remark`)
Every run's `result.json` hash is written to V3, about 0.022 tPOT per record.

| Run | Verdict | V3 block |
|---|---|---|
| `bbbf22879a6a` | halve-reserved on mainnet: caught | #238,224 |
| `971a7223bf7b` | halve-reserved on mainnet: caught | #237,962 |
| `a98bc8ba5969` | clean on mainnet: pass | #237,959 |
| `4be59393add6` | clean on mainnet: pass | #237,902 |
| `ee094cd30f34` | ed100x: workflow caught | #234,821 |
| `d4d8b7934db1` | halve-reserved: caught | #234,189 |

Latest record tx: `0xefc2025a569a45ce453d2f2c1446fc1094d40a01610759f7fca0214a2fad79c3`

### 2. `CanaryRegistry` contract (V3 EVM)

| | |
|---|---|
| Address | `0x62Eacc58CE0FA37F06F24074AFb7B3F22Df708FF` |
| Deploy tx | `0xadb58c0b7ff356a1304e8422b7f606782c91e39460bca2ab9ace133cc8656ed2` |
| Source | [`contracts/src/CanaryRegistry.sol`](https://github.com/Venkat5599/portalcanary/blob/main/contracts/src/CanaryRegistry.sol) (Solidity 0.8.28, Foundry) |
| Entries | 4 attestations, blocks #175,877 to #175,893 |

The contract shows V3's EVM support (pallet-revive) running plain solc bytecode, and the dashboard's Registry view reads it live.

### Verify it yourself (no key, no account)

```bash
scripts/verify-runs.sh                                   # re-checks every run ever made
canary verify --run examples/upgrade-halve-reserved      # one run
cast call --rpc-url https://test-evm-rpc-v3.portaldot.dev \
  0x62Eacc58CE0FA37F06F24074AFb7B3F22Df708FF "count()(uint256)"
```

Output of `scripts/verify-runs.sh`: `runs 17 · recorded on V3 6 · verified 6 · failed 0`.

---

## How it uses Portaldot V3

- **Substrate side:** run records are `system.remark` extrinsics on V3, checked against V3's genesis hash and block contents.
- **EVM side:** `CanaryRegistry` is a Solidity contract on V3's EVM (pallet-revive), with chain id 420420777.
- **Wallets:** the dashboard's "On your node" view connects Substrate wallets (Talisman, SubWallet, Polkadot.js) and EVM wallets (MetaMask) to V3 and runs the workflow suite as real signed transactions.
- **Mainnet vs V3:** the Compare view reads mainnet (V13) and V3 (V14) side by side. Result: V3 is a new chain, not an upgrade of mainnet. 21 pallet indices moved and the block time changed from 60 s to 6 s, so applying the V3 runtime to mainnet would halt block production.
- **Found on V3:** the V3 metadata hash changes every few minutes with no runtime change. We traced it to one byte inside `Revive.EthBlockBuilderIR`. This matters for any tool that caches metadata by hash.

---

## Features

- **New run:** five built runtimes or your own `.wasm`, on mainnet state or a fresh chain.
- **Run page:** live steps, verdict, the per-account table, risks, workflow results and the on-chain record, checked in your browser.
- **Compare:** any two nodes. The decoder and risk engine run in the browser as WebAssembly (about 330 KB).
- **Doctor:** checks an endpoint layer by layer (DNS, TCP, WebSocket, RPC, runtime APIs).
- **Supply:** the mainnet supply invariant, read live.
- **Registry:** the `CanaryRegistry` contract on V3, read live.
- **On your node:** the workflow suite against your own node, signed with your wallet.
- **CLI:** `canary doctor | invariants | compare | test | reproduce | upgrade | attest | verify`.
- **Daily check:** every day `clean` must pass and `halve-reserved` must be caught. A failure opens a GitHub issue automatically.

### Risk engine

| Severity | Fires when |
|---|---|
| Critical | `setCode` would refuse the runtime, or consensus timing changes (chain halt risk) |
| Breaking | a pallet or call index or signature changes without a `transaction_version` bump |
| Needs migration | a storage item changes type or disappears |
| Behaviour change | a constant changes value |
| Client update | events, errors or runtime APIs are removed or renumbered |

---

## Architecture

```text
 browser (Next.js + shadcn/ui)                      GitHub
 ─────────────────────────────                      ──────
 New run ──POST /api/runs──► Vercel function ──dispatch──► canary-run.yml (ubuntu runner)
 Run page ◄─GET /api/runs/:id── reads steps, then          ├─ fork.ts: mainnet state → fork.json
                                 runs/<id>.zip             ├─ 2 × portaldot_dev (baseline, candidate)
                                                           ├─ canary upgrade / compare / test
 Compare ── canary.wasm ──WebSocket──► any two nodes       ├─ result.json (sha256 of every file)
 Proof card ──WebSocket──► V3 block (re-checks remark)     ├─ canary attest + verify ──► V3 testnet
                                                           └─ runs/<id>.zip on the `runs` release
 daily-check.yml (cron) ──dispatch──► canary-run.yml ×2 ──► judge ──► open / close an issue
```

| Component | What it does |
|---|---|
| `canary-chain` (Rust) | V13 and V14 metadata decoder, SCALE codecs, structural diff, risk engine, JSON-RPC |
| `canary` CLI (Rust) | doctor, invariants, compare, test, reproduce, upgrade, attest, verify |
| `canary-wasm` | the decoder and risk engine compiled to WebAssembly for the browser |
| driver (TypeScript) | builds the mainnet fork and signs workflow transactions |
| GitHub Actions | runs each test, records it on V3, keeps the files, runs the daily check |
| dashboard (Next.js, shadcn/ui) | every view above; re-checks on-chain records in the browser |
| `CanaryRegistry` (Solidity) | verdict registry on the V3 EVM |

**Stack:** Rust · WebAssembly · TypeScript · Next.js · shadcn/ui · Solidity · Foundry · GitHub Actions · Vercel

---

## Safety and honesty

- `setCode` is **refused on any live chain**. Upgrades only ever run on local forks.
- The `ed100x`, `fee10x` and `halve-reserved` runtimes are **test runtimes with labelled, committed patches**, not Portaldot bugs.
- The fork uses mainnet's storage on the dev node's runtime and consensus, not mainnet's exact runtime.
- Not every run is recorded: 11 of 17 kept runs are not. 8 predate on-chain records, 2 ran while the key had no tPOT, and 1 hit a nonce clash before the retry existed. They stay in the list on purpose.
- Secrets stay server-side. The record key only holds what it spends (10 tPOT, about 450 records).

---

## Who it's for

- **Portaldot core developers:** test every runtime upgrade against real mainnet state before governance or sudo applies it.
- **Validators and node operators:** see what an upgrade changes before it lands.
- **Wallet, exchange and dApp teams:** get a list of breaking encoding and API changes before clients fail.
- **The community:** every verdict is public and verifiable on-chain.

## What's next

- Run as a required check on every runtime pull request (the GitHub Action is in [`action.yml`](https://github.com/Venkat5599/portalcanary/blob/main/action.yml)).
- Fork the V3 testnet's own state once V3 runtime upgrades begin.
- More workflows: staking, governance, contracts and EVM calls.
- Move run records to the production V3 network once it is live.

---

## Links

- Live app: https://portal-canary-app.vercel.app
- Dashboard: https://portal-canary-app.vercel.app/dashboard
- Demo video: https://youtu.be/dV6r8IFqzck
- Pitch deck: https://portal-canary-app.vercel.app/deck
- GitHub: https://github.com/Venkat5599/portalcanary
- Testnet details: https://github.com/Venkat5599/portalcanary/blob/main/docs/TESTNET.md
- Run files: https://github.com/Venkat5599/portalcanary/releases/tag/runs
- License: Apache-2.0
