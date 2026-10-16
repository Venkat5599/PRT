# V3 Readiness Log

Every check of Portaldot V3 infrastructure, with the date, the endpoint and the result. Produced with `canary doctor` unless noted otherwise.

| Date (UTC) | Endpoint | Result | Notes |
|---|---|---|---|
| 2026-10-05 | `https://testnetv3-eth-rpc.feso-apps.xyz/` | HTTP 524 (Cloudflare timeout) | Reported on Discord by another builder; wallet "Unable to connect to PortaldotV3 Testnet" |
| 2026-10-15 | `testnetv3-node.feso-apps.xyz`, `testnetv3-eth-rpc.feso-apps.xyz`, `node-console.feso-apps.xyz` | NXDOMAIN on Google DNS; parent `feso-apps.xyz` resolves | Manual check; reported on Discord |
| 2026-10-15 | `wss://testnetv3-node.feso-apps.xyz` | **FAIL dns: no record** | `canary doctor` |
| 2026-10-15 | `https://testnetv3-eth-rpc.feso-apps.xyz/` | **FAIL dns: no record** | `canary doctor` |
| 2026-10-15 | `wss://mainnet.portaldot.io` | **HEALTHY**: Portaldot Mainnet, node 2.0.0, spec `portaldot` v1002, tx_version 2, **metadata V13** (153,205 bytes, sha256 `b87080f9349f936e…`), WASM contracts API present, no EVM API, no TryRuntime API, best block #2,727,320 | Baseline reference for V3 comparison |
| 2026-10-16 | `testnetv3-node.feso-apps.xyz`, `testnetv3-eth-rpc.feso-apps.xyz` | NXDOMAIN on Google DNS | Still no records; on-chain attestation runs against the local dev chain until V3 is reachable |

Official status (2026-10-15, team on Discord): "proceed your coding first … we are upgrade our node now and will update the latest node(RPC) info in this channel and dev-announcement."

Mainnet genesis: `0x83b5212c69f85f3996f8696bb35bf913af51b176a5f53d0a74fd3a83dc0b8a54`

## Mainnet invariant baseline

| Date (UTC) | Check | Block | Result |
|---|---|---|---|
| 2026-10-15 | `canary invariants` supply_conservation | #2,727,345 `0x35781c79…0018c` | **PASS**: 4,719 accounts (all `AccountInfo` with sufficients), sum free+reserved = TotalIssuance = 1,016,781,509.44019349511407 POT, delta 0 planck |

## Runtime comparison: mainnet vs local dev node

| Date (UTC) | Baseline | Candidate | Result |
|---|---|---|---|
| 2026-10-15 | `wss://mainnet.portaldot.io` (spec 1002, metadata `b87080f9…`) | `portaldot_dev --dev` 2.0.0, binary dated 2025-12-29 (spec 1002, metadata `b7ad30de…`) | **12 constant changes with the same spec_version and transaction_version** (unversioned change). Examples: Babe.EpochDuration 120 → 1200, Babe.ExpectedBlockTime 60000 → 6000 ms, Timestamp.MinimumPeriod, election phases, Treasury.SpendPeriod, Contracts deposits and RentFraction. 31 pallets on both, no call/event/storage changes |

Implication: results from the local dev node do not automatically transfer to mainnet. Canary reports this instead of assuming equivalence.
