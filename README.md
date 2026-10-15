# Portal Canary

**Differential runtime-upgrade testing for Portaldot.**

`try-runtime` tells you the migration ran. Portal Canary tells you whether your app still works, shows the exact state that diverged, and gives you one command to reproduce it.

> Status: early development for the Portaldot Hacker House 2026 (Node Operations & Tooling track). See [`docs/PLAN.md`](docs/PLAN.md) for the full design and [`docs/V3_READINESS.md`](docs/V3_READINESS.md) for live V3 endpoint checks.

## Why it exists

Portaldot mainnet runs a 2021-era Substrate runtime with **metadata V13**. Modern tooling such as `subxt` requires V14+ and cannot decode it. Canary speaks raw JSON-RPC and SCALE, so it works on Portaldot today and on V3 when it ships.

## Available now: `canary doctor`

Diagnose any Portaldot endpoint layer by layer (DNS → TCP → WebSocket → RPC → runtime) and fingerprint the runtime behind it.

```
$ canary doctor --ws wss://mainnet.portaldot.io --ws wss://testnetv3-node.feso-apps.xyz
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

substrate  wss://testnetv3-node.feso-apps.xyz
  network     FAIL dns: no record (failed to lookup address information: Name or service not known)
  verdict     UNHEALTHY
```

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

## Available now: `canary test` and `canary reproduce`

Run a YAML workflow corpus ([`tests/workflows`](tests/workflows)) against a baseline and a candidate runtime. Each workflow runs on both sides with freshly funded, per-run namespaced accounts; state is read before and after, pinned to block hashes; every expectation is evaluated on both sides and classified:

| Verdict | Meaning |
|---|---|
| **REGRESSION** | an expectation holds on the baseline and fails on the candidate |
| **DIFFERENCE** | observable behaviour differs, every expectation still holds |
| **INCONCLUSIVE** | not comparable (setup failed, or the baseline itself fails) |
| **PASS** | all expectations hold on both; nothing observable differs |

Severity is rule-based (invariant → Critical; core dispatch/delta → High; …) and every finding carries its rationale. Fee-multiplier drift is normalised within 1 ppm and still shown in the report. Exit codes: `1` on any regression, `2` if anything is inconclusive.

**Determinism control** (same dev node as baseline and candidate): 4/4 PASS. [`examples/self-compare`](examples/self-compare)

**Injected regression** (clearly labelled; a deliberately tampered dev node, not a Portaldot finding): a sudo `system.setStorage` credits 1,000 POT without updating TotalIssuance, the effect of a faulty balance migration ([`driver/src/inject.ts`](driver/src/inject.ts)):

```
$ canary test --baseline ws://127.0.0.1:9944 --candidate ws://127.0.0.1:9945 --injected "faulty-migration: …"
REGRESSION    Critical  balances.transfer.basic
    ✗ invariant supply_conservation  baseline: … sum 35000100000000000000 vs issuance 35000100000000000000
                                     candidate: … sum 35100100000000000000 vs issuance 35000100000000000000
…
4 regression(s) detected across 4 workflow(s).

$ canary reproduce balances.transfer.basic --run runs/1792086881
recorded   REGRESSION  5f12966df3963538
reproduced Regression  5f12966df3963538
REPRODUCED: identical finding hash
```

Full report: [`examples/injected-faulty-migration/report.html`](examples/injected-faulty-migration/report.html).

### Compatibility note found along the way

Current `@polkadot/api` decodes `DispatchError::Module` as `{ index: u8, error: [u8; 4] }`; Portaldot's 2021 runtime emits `{ index: u8, error: u8 }`, so `System.Events` fails to decode for any failed extrinsic. Canary's driver pins the legacy type and treats an undecodable block as **INCONCLUSIVE**, never as success.

## Build

Linux or WSL2 (recommended on Windows):

```bash
sudo apt install -y build-essential pkg-config libssl-dev
cargo build --release
./target/release/canary doctor --ws wss://mainnet.portaldot.io
```

Run a local Portaldot dev node to test against:

```bash
curl -LO https://github.com/portaldotVolunteer/Portaldot-node/raw/main/portaldot-testnet-ubuntu.tar.gz
tar -xzf portaldot-testnet-ubuntu.tar.gz && cd portaldot-testnet-ubuntu
chmod 755 portaldot_dev && ./portaldot_dev --dev --tmp
```

## Roadmap

- [x] `doctor`: layered endpoint diagnosis, metadata version, runtime API capabilities
- [x] Storage reads with curated V13 codecs (`System.Account`, `Balances.TotalIssuance`)
- [x] Mainnet supply invariant (read-only): `canary invariants`
- [x] `compare`: V13 metadata decoder + structural runtime diff
- [x] Workflow corpus (YAML) + side-by-side runner (two dev nodes)
- [x] Verdict classifier (REGRESSION / DIFFERENCE / INCONCLUSIVE / PASS) + JSON/HTML report
- [x] `reproduce` with stable finding hash
- [x] Injected regression: simulated faulty migration (storage injection)
- [ ] Candidate runtimes built from source + real-upgrade mode (`system.setCode`)
- [ ] On-chain attestation, GitHub Action, contract workflows

## Third-party code

Rust crates listed in `Cargo.toml` (tungstenite, ureq, native-tls, blake2, sha2, twox-hash, serde, serde_json, serde_yaml, clap, anyhow, hex, url). The driver uses `@polkadot/api`, `@polkadot/keyring` and `@polkadot/util-crypto` (Apache-2.0). No code copied from other projects.

## License

Apache-2.0
