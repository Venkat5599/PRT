# Portaldot Context (knowledge base for future sessions)

> Everything gathered for the Portaldot Hacker House 2026 build. Read this first in any new session.
> Last updated: 2026-10-15. Labels: **[verified]** = checked by me against source/network · **[official]** = organiser/rules text · **[mod]** = Discord moderator reply (status, not a ruling) · **[inferred]** = my reasoning, unconfirmed.

---

## 1. The hackathon

- **Event:** Portaldot Hacker House 2026 on DoraHacks, virtual. Run by the Portaldot Network Ecosystem Foundation. 115 hackers registered at time of reading. [official]
- **Prize pool:** 5,200 USDT (2,600 in USDT, 2,600 equivalent in POT). [official]
  - Grand Prize 1,000 · each track 1st 800 · Ecosystem DApps 2nd 500 / 3rd 300 · Community Choice 200 (Discord vote, stackable).
  - Grand Prize + track 1st for the same project: keeps the Grand Prize, track award passes to the next project.
  - Track awards can stay vacant if no project meets the minimum threshold.
- **Tracks:** Modular Cloud & Middleware · Multi-Chain & Cross-Chain Infra · **Node Operations & Tooling** (our track: "node monitoring, automated staking, node data visualization, network security analysis tools") · Ecosystem DApps.

### Key dates (UTC)
| Date | Event |
|---|---|
| Oct 14 12:00–14:00 | Kick-off + workshop (Discord) |
| **Oct 24 12:00** | **Check-in deadline** |
| Oct 26 16:00 | Feedback results |
| Oct 27 12:00 | Office-hour application deadline |
| Oct 28–29 | Office hours |
| **Nov 6 04:00** | **Final submission / code freeze** (DoraHacks page shows 09:30 local) |
| Nov 8–9 | Live Demo Day (Discord) |
| Nov 9 16:00 – Nov 10 16:00 | Community Choice voting |
| Nov 11 | Winners · Nov 14 reward distribution |

### Rules that matter [official]
- Must "effectively leverage Portaldot Network V3.0 core features and complete deployment on the Portaldot testnet".
- Code must be **primarily produced Oct 14 – Nov 6**. Submitting an existing complete project is not allowed.
- Repo public throughout; **≥3 valid commits** in the window; **core module final versions must not be committed all at once in the last 24 h**. Keep commit/PR history as evidence.
- After code freeze: no substantial changes. A serious bug fix must be reported to the organisers, with a modification record.
- Third-party code/SDKs allowed; sources must be disclosed.
- IP stays with the team; the Foundation gets a non-exclusive licence to promote it.

### Check-in deliverables
Progress, outstanding items, public GitHub (README, ongoing dev records), architecture diagram, testnet deployment info (contract address, tx hash, explorer link *if available*), plus a demo (live link or video ≤3 min showing at least one core function). Simulated data is allowed; real testnet interactions are encouraged. [official]
[mod]: a contract address + tx hash **alone** is not enough. A demonstrable prototype is required.

### Final submission
Project name, members, one-line overview, public repo, README, deployment instructions, docs, runnable code, testnet info, runnable demo (link or local instructions), **demo video ≤3 min** (real product, core functions, Portaldot integration), **pitch deck** (problem, why Portaldot, proof it works, why to keep supporting it), contract address/tx hash if applicable.

### Judging
Technical Feasibility **30%** (architecture, completeness, sustained GitHub activity, testnet deployment with verifiable on-chain interactions) · Innovation **30%** (use of V3.0 features: WASM/EVM, modular architecture, multi-chain; value beyond existing solutions) · Ecosystem Contribution **20%** (infra, dev tools, node ecosystem, open source, sustained building) · Business Potential **20%** (real need, clear users, feasible model, team capability). Evidence-based: repos, commit timelines, tx records, contract addresses, live demo.

### Post-hackathon
Builder support programme: mainnet launch help, building subsidies (servers, DBs, infra), technical/architecture review, debugging support, exposure, community growth, joint campaigns, liquidity and gas incentives, ecosystem listing. Non-winners with strong execution can also apply.

---

## 2. The chain

### What V3.0 claims [official]
"Portaldot Network V3.0 is now fully compatible with the EVM contract ecosystem, supporting both WASM and EVM contract execution, as well as ERC-20 / ERC-721 token standards." Modular architecture, multi-chain capabilities. Stack: Rust / ink!, Solidity.

### Public source code [verified 2026-10-15]
- Repo: `github.com/portaldotVolunteer/Portaldot`. README: "a Substrate based blockchain", described as Layer0. 12 commits.
- It is a **2021-era Substrate monorepo fork** (CONFIRMED live 2026-10-15: mainnet metadata is **V13**, spec `portaldot` v1002, node 2.0.0, tx_version 2, genesis `0x83b5…8a54`, ContractsApi present, no EVM, no TryRuntime API). Evidence: the workspace still contains `frame/metadata`, `max-encoded-len`, `client/light`, `client/finality-grandpa-warp-sync`, `test-utils/test-runner`. Era is around polkadot-v0.9.x, mid-2021.
- Runtime crates: `bin/node/runtime` (full node runtime), `bin/node-template/runtime`.
- Present pallets include: assets, balances, contracts (+rpc, runtime-api), **try-runtime** (+ `utils/frame/try-runtime/cli`), babe, grandpa, staking, session, im-online, democracy, collective, treasury, bounties, tips, identity, proxy, multisig, scheduler, sudo, utility, vesting, uniques, gilt, lottery, society, recovery, transaction-storage, MMR, election-provider-multi-phase, `utils/frame/remote-externalities`.
- **No Frontier / pallet-evm crates.** The V3.0 EVM source is not in the public repo. [verified]
- Includes `pot_mainnet_spec_raw.json`, `ss58-registry.json`, `shell.nix`.

### Network facts [official docs: portaldot-dev.readthedocs.io]
- Mainnet WS: `wss://mainnet.portaldot.io`
- SS58 prefix **42** · Token **POT** · **14 decimals** (1 POT = 10^14 planck)
- Binaries in `github.com/portaldotVolunteer/Portaldot-node` (2 commits, no README, no releases):
  - `portaldot-mainnet-ubuntu.tar.gz`, `portaldot-mainnet-macos.tar.gz`
  - `portaldot-testnet-ubuntu.tar.gz` (29.6 MB, download verified HTTP 200), `portaldot-testnet-macos.tar.gz`. Despite the name, this is the **local dev node**.
  - Direct link: `https://github.com/portaldotVolunteer/Portaldot-node/raw/main/portaldot-testnet-ubuntu.tar.gz`
  - Windows: no build; use WSL.
- Local dev: `tar -xzvf portaldot-testnet-ubuntu.tar.gz && cd portaldot-testnet-ubuntu && chmod 755 portaldot_dev && ./portaldot_dev --dev --alice` (or `--dev --tmp`). Connect at `ws://127.0.0.1:9944`. The Portaldot explorer has a "Local Node" option.
- Docs sections: Getting Started, Local Development Network, Chain Info, **Python SDK** (substrate-interface style: batch call, fee info, multisig, ink! contract create/call, subscriptions), SDK Extension, Module Interface (constants, errors, events, extrinsics, JSON-RPC, storage per pallet). JSON-RPC namespaces: author, babe, chain, childstate, contracts, grandpa, mmr, offchain, payment, rpc, state, syncstate, system.

### V3 testnet status (as of 2026-10-15) [mod + user reports]
- Official guide endpoints: `testnetv3-node.feso-apps.xyz` (Substrate WS), `testnetv3-eth-rpc.feso-apps.xyz` (EVM RPC), `node-console.feso-apps.xyz`. A user's Google DNS check: all three NXDOMAIN, while the parent `feso-apps.xyz` resolves. Confirmed by `canary doctor` from WSL on 2026-10-15: "dns: no record".
- 2026-10-05: the EVM RPC returned **HTTP 524** (Cloudflare timeout). So the V3 testnet existed before and went down.
- **Official team reply:** "proceed your coding first … we are upgrade our node now and will update the latest node(RPC) info in this channel and dev-announcement."
- Not yet published: V3 WS endpoint, EVM RPC, **chain ID**, explorer, V3 node binary, chain spec, runtime pallet list, contracts pallet version, which EVM implementation (Frontier vs Revive vs other), Solidity↔ink! cross-calls, dry-run API, storage model (rent vs deposit).
- **tPOT V3 faucet:** requests through Discord, distributed every 24 h, but distribution has not started. Channel and address format unconfirmed. The old dev environment had a DRIP faucet.
- Expected tooling: Foundry, Hardhat, MetaMask "expected to work" once the EVM RPC is final. [mod]

### Precedents and warnings [mod]
- In the **previous hackathon, local `portaldot_dev --dev` (ws://127.0.0.1:9944) was accepted** for proof of concept. Not yet confirmed for V3; a ruling has been requested (local V3 OK? temporary local deploy OK? waiting OK at check-in?).
- "Don't assume an older devnet configuration is compatible with V3."
- The previous dev environment ran an **older Contracts API that broke newer ink! contracts**. Pin ink! to the chain's pallet-contracts version.
- For infrastructure projects (no contract), whether RPC interactions + on-chain txs suffice is still being asked.
- Moderator replies (LevelMax and others) are templated and defer to the core team ("Titus"). Treat them as status, not rulings.

---

## 3. Competitive landscape (seen in Discord)
- **Node Ops track:** a node-failure simulation / diagnosis / auto-recovery tool (reuses a pre-existing engine and CLI; eligibility under review) · a validator-monitoring tool (imOnline heartbeats, era points) · "Atlas" (node-ops project; whether it is ours or another team's is unclear, so confirm with the user).
- **Seam:** execution-layer SDK with contract dry-run cost preview, pointed to Modular Cloud & Middleware.
- Monitoring is the crowded idea. Nobody else has been seen doing **runtime-upgrade testing**.

---

## 4. Our project: Portal Canary
- Pitch: *"try-runtime tells you the migration ran. Portal Canary tells you whether your app still works, shows the exact state that diverged, and gives you one command to reproduce it."*
- Full plan: `docs/PLAN.md`. Key design choices:
  - **No subxt.** Own thin client (raw JSON-RPC over WS + SCALE), because the chain may be pre-V14.
  - Modes: A = two dev nodes side by side · B = one node + `sudo(system.setCode)` upgrade · C = read-only mainnet invariants.
  - Verdicts: REGRESSION / DIFFERENCE / INCONCLUSIVE / PASS. Severity Critical→Info with rationale. Never say "safe".
  - Injected candidates: `cand-fee` (DIFFERENCE), `cand-ed` (High), `cand-migration` (Critical, hero demo), `cand-event` (Medium). Always labelled INJECTED.
  - On-chain evidence: `system.remark` attestation as the primary (cheap, works anywhere); a `CanaryRegistry` contract (Solidity if the V3 EVM is live, else ink!) as a stretch goal.
  - `canary doctor`: layered endpoint diagnosis (DNS → TCP → WS → RPC → runtime/metadata/API capabilities). Turns the V3 outage into evidence; keep a `docs/V3_READINESS.md` log.
- Strategic framing: the team upgrading their node mid-hackathon is a live example of the problem Canary solves.

## 5. Environment notes (this machine)
- Windows 11, Rust 1.96. The **GNU toolchain fails to link proc-macro DLLs** (ld exit 116), so the project dir uses `rustup override set stable-x86_64-pc-windows-msvc`.
- WSL2 Ubuntu and docker-desktop are installed (stopped by default). bun 1.3.8. The git identity is configured.
- Building the 2021 runtime needs a pinned 2021 nightly in Docker. A modern rustc will not build it.

## 6. Open questions to keep chasing
1. V3 WS/EVM endpoints, chain ID, explorer, faucet channel and address format.
2. V3 source or runtime `.wasm`, plus the previous version's `.wasm`, for a real comparison.
3. V3 metadata version; pallet list; EVM implementation; pallet-contracts version.
4. Ruling: is local V3 / local dev deployment accepted at check-in and in the final?
5. Ruling: is a contract mandatory for infrastructure projects?
