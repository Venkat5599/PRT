#!/usr/bin/env bash
# Snapshot the live PortaldotV3 testnet against Portaldot mainnet.
# Writes examples/ (from backend/): mainnet-vs-v3/{doctor,compare}.{txt,json}.
set -u
cd "$(dirname "$0")/../backend"
CANARY="${CANARY:-${CARGO_TARGET_DIR:-target}/release/canary}"
MAINNET="wss://mainnet.portaldot.io"
V3="wss://test-node-v3.portaldot.dev"
V3_EVM="https://test-evm-rpc-v3.portaldot.dev"
OUT=../examples/mainnet-vs-v3
mkdir -p "$OUT"

"$CANARY" doctor --ws "$MAINNET" --ws "$V3" --eth "$V3_EVM" > "$OUT/doctor.txt"
"$CANARY" doctor --ws "$MAINNET" --ws "$V3" --eth "$V3_EVM" --json > "$OUT/doctor.json"

# Control: the same V3 runtime fetched twice must show no structural change.
echo "== control: V3 vs V3"
"$CANARY" compare --baseline "$V3" --candidate "$V3" | tail -n 3

"$CANARY" compare --baseline "$MAINNET" --candidate "$V3" > "$OUT/compare.txt"
echo "mainnet vs V3 exit: $? (1 = upgrade hazards found)"
"$CANARY" compare --baseline "$MAINNET" --candidate "$V3" --json > "$OUT/compare.json"
tail -n 7 "$OUT/compare.txt"
