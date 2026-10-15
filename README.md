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
- [ ] Workflow corpus (YAML) + side-by-side runner (two dev nodes)
- [ ] Real-upgrade mode (`system.setCode`) with injected candidate runtimes
- [ ] Verdict classifier (REGRESSION / DIFFERENCE / INCONCLUSIVE / PASS) + JSON/HTML report
- [ ] `reproduce`, on-chain attestation, GitHub Action

## Third-party code

Rust crates listed in `Cargo.toml` (tungstenite, ureq, native-tls, blake2, sha2, serde, clap, anyhow, hex, url). No code copied from other projects.

## License

Apache-2.0
