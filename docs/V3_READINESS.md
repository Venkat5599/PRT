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
| 2026-10-17 | `testnetv3-node.feso-apps.xyz` | No DNS record (Windows resolver) | Unchanged |
| 2026-10-17 | `wss://test-node-v3.portaldot.dev` | **HEALTHY**: PortaldotV3 Test, node `PortaldotV3 Node 3.0.0-dev-fddd43141f2`, spec `portaldot-v3` v3002, tx_version 2, **metadata V14** (561,916 bytes, sha256 `ba1613ee42e06ac1…`), 26 runtime APIs, WASM contracts present, EVM present (via `ReviveApi`, pallet-revive), no TryRuntime API, best block #74,863 | New official endpoint (dev-announcement, 2026-10-17). Genesis `0xd4f9acbcf7f52388d8b095abe3c198d19fc510e0343e643e87cfbccb155283bd` |
| 2026-10-17 | `https://test-evm-rpc-v3.portaldot.dev` | **HEALTHY**: chain id 420420777, client `eth-rpc/main-fddd431`, block #74,863 | Same head as the Substrate node |

Official status (2026-10-15, team on Discord): "proceed your coding first … we are upgrade our node now and will update the latest node(RPC) info in this channel and dev-announcement."

Update (2026-10-17, dev-announcement): the `feso-apps.xyz` endpoints are retired. V3 lives at `wss://test-node-v3.portaldot.dev` (Substrate), `https://test-evm-rpc-v3.portaldot.dev` (EVM, chain id 420420777) and `https://node-console.portaldot.dev` (explorer).

## Runtime comparison: mainnet vs V3 testnet

`canary compare` decodes both V13 and V14 (`backend/crates/canary-chain/src/metadata_v14.rs` resolves the V14 type registry onto the same structural model). Reproduce with `scripts/v3-snapshot.sh`; output is in [`examples/mainnet-vs-v3`](../examples/mainnet-vs-v3).

| Date (UTC) | Baseline | Candidate | Result |
|---|---|---|---|
| 2026-10-17 | `wss://mainnet.portaldot.io` (spec `portaldot` 1002, V13, 31 pallets) | `wss://test-node-v3.portaldot.dev` (spec `portaldot-v3` 3002, V14, 69 pallets) | **948 structural changes**: 40 pallets added (Revive, Nfts, Uniques, NominationPools, AssetConversion, Beefy, …), 2 removed (RandomnessCollectiveFlip, Gilt), 21 pallet indices moved, 14 calls removed / 75 added / 109 changed, signed extensions changed (adds `CheckMetadataHash`, `EthSetOrigin`, `ChargeAssetTxPayment`). **3 upgrade hazards**: Babe.EpochDuration 120 → 600, Babe.ExpectedBlockTime 60 000 → 6 000 ms, Timestamp.MinimumPeriod 30 000 → 3 000. Exit code 1 |
| 2026-10-17 | V3 | V3 (control) | 0 changes |

Implication: V3 is a new chain, not an in-place upgrade of mainnet. Applying the V3 runtime to mainnet with `setCode` would halt block production (slot duration change), and 21 moved pallet indices would break every client that encodes calls by index.

## Finding: V3 metadata hash is not stable

The V3 node returns metadata of the same size (561,916 bytes) and spec version, but its sha256 changes every few minutes (`ba1613ee…`, `9b7f8825…`, `b0cc081e…`, `5f33dd90…` within one hour). Polling `state_getMetadata` every 10 s isolated it to **one byte** (offset 549,822) inside the default value of the storage item `Revive.EthBlockBuilderIR`, which is computed from live chain state.

Consequence: tools that pin or cache metadata by hash (including the `CheckMetadataHash` signed extension's off-chain flow) will see a "new" metadata on V3 with no runtime change. Canary now judges an unversioned change on structural differences, not raw bytes, so the V3-vs-V3 control reports 0 changes.

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

## V3 testnet attestations

2026-10-24: each example run's report hash and verdict counts anchored on the public V3 testnet with `canary attest --signer env` (dedicated testnet key, `system.remark`), then checked with `canary verify` (report hash, rebuilt payload, genesis `0xd4f9acbc…283bd`, remark present in block). All four **VERIFIED**.

| Run | Verdict | Block | Tx hash |
|---|---|---|---|
| [`upgrade-halve-reserved`](../examples/upgrade-halve-reserved) | R1 (INJECTED, spec 1002 → 1006) | #175,811 | `0x805186766b1b988287476ec30c8d81ae79e5d9afb5d5c6d1e800f6d3f4ea0928` |
| [`upgrade-ed100x`](../examples/upgrade-ed100x) | R1 P3 (spec 1003 → 1004) | #175,818 | `0x3c1f703a5a948b523fe54ef889169abbe7307021b72e8c06c2e0605732907e87` |
| [`upgrade-fee10x`](../examples/upgrade-fee10x) | D4 (spec 1003 → 1005) | #175,820 | `0x33546334281586ca6a07bfc74b0868512e348def8f686867d07f60f18193bbbd` |
| [`self-compare`](../examples/self-compare) | P4 (control) | #175,823 | `0x360f8ea2122559b7873cbcb6758fbd614d593b3d5cc5c992b70af596be4491ac` |

Reproduce: `canary verify --run examples/<run>` (reads `attestation.json`, needs no key).

## CanaryRegistry contract (V3 EVM)

2026-10-24: [`contracts/src/CanaryRegistry.sol`](../contracts/src/CanaryRegistry.sol) deployed to the PortaldotV3 EVM (pallet-revive accepts plain solc 0.8.28 EVM bytecode; no resolc needed).

- Address: `0x62Eacc58CE0FA37F06F24074AFb7B3F22Df708FF` (chain id 420420777, `https://test-evm-rpc-v3.portaldot.dev`)
- Deploy tx: `0xadb58c0b7ff356a1304e8422b7f606782c91e39460bca2ab9ace133cc8656ed2`
- Cost: about 217 tPOT to deploy and about 27 tPOT per `attest`, mostly the storage deposit. Budget for this before attesting many runs.

| Id | Run | Tx hash | Block |
|---|---|---|---|
| 0 | `upgrade-halve-reserved` | `0x1d15ca01d3bdf11f2062b182dfca7b378c8a05278beb7e6b2f8e49a5a2ab7a30` | #175,877 |
| 1 | `upgrade-ed100x` | `0x0017a02af40acdc883ad8807a1fd6f054b80b4275c8d2e87d33db662a61360eb` | #175,886 |
| 2 | `upgrade-fee10x` | `0xb14a42825cc241b933f92a87cffd5897fd8b13cdc4e49c649e388639d9175248` | #175,891 |
| 3 | `self-compare` | `0x4b4d542edd6275e6f023082fed68ab4e2ea392caea4145ed66b468468cf1bc95` | #175,893 |

Check: `cast call --rpc-url https://test-evm-rpc-v3.portaldot.dev 0x62Eacc58CE0FA37F06F24074AFb7B3F22Df708FF "count()(uint256)"` returns 4. Record a new run with `bun scripts/registry-attest.ts <run dir>`. The dashboard's Registry panel reads the contract live and checks each published report's sha256 against it.
