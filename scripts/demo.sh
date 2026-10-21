#!/usr/bin/env bash
# End-to-end Portal Canary demo on Linux/WSL. No manual steps.
#
#   1. start two local Portaldot dev nodes (baseline :9944, candidate :9945)
#   2. doctor + compare against live mainnet
#   3. determinism control: baseline vs itself  -> expect all PASS
#   4. INJECTED faulty migration on the candidate -> expect Critical REGRESSION
#   5. reproduce one finding, attest the run on-chain, verify the attestation
#
# Env: PORTALDOT_DEV (path to portaldot_dev; downloaded if unset), CANARY_BUN.
set -uo pipefail
ROOT="$(cd "$(dirname "$0")/../backend" && pwd)"
cd "$ROOT"
export PATH="$HOME/.cargo/bin:$HOME/.bun/bin:$PATH"
export CANARY_BUN="${CANARY_BUN:-$(command -v bun)}"
WORK="$(mktemp -d)"
trap 'kill $(jobs -p) 2>/dev/null; rm -rf "$WORK"' EXIT

say() { printf '\n\033[1m== %s\033[0m\n' "$*"; }

if [ -z "${PORTALDOT_DEV:-}" ]; then
  say "downloading portaldot_dev"
  curl -fsSL -o "$WORK/node.tgz" https://github.com/portaldotVolunteer/Portaldot-node/raw/main/portaldot-testnet-ubuntu.tar.gz
  tar -xzf "$WORK/node.tgz" -C "$WORK"
  PORTALDOT_DEV="$WORK/portaldot-testnet-ubuntu/portaldot_dev"
fi

say "building canary + driver"
cargo build --release -q
CANARY="${CARGO_TARGET_DIR:-$ROOT/target}/release/canary"
(cd driver && bun install --silent)

say "starting baseline (:9944) and candidate (:9945) dev nodes"
"$PORTALDOT_DEV" --dev --tmp --ws-port 9944 --rpc-port 9933 --port 30333 >"$WORK/base.log" 2>&1 &
"$PORTALDOT_DEV" --dev --tmp --ws-port 9945 --rpc-port 9934 --port 30334 >"$WORK/cand.log" 2>&1 &
for p in 9944 9945; do
  for _ in $(seq 60); do "$CANARY" doctor --ws "ws://127.0.0.1:$p" >/dev/null 2>&1 && break; sleep 1; done
done
sleep 8 # let a few blocks land

say "doctor"
"$CANARY" doctor --ws ws://127.0.0.1:9944 --ws wss://mainnet.portaldot.io

say "compare: live mainnet vs dev node"
"$CANARY" compare --baseline wss://mainnet.portaldot.io --candidate ws://127.0.0.1:9944 | tail -n 6

say "determinism control: baseline vs itself"
"$CANARY" test --baseline ws://127.0.0.1:9944 --candidate ws://127.0.0.1:9944 --out runs/demo-control
echo "exit $? (expect 0)"

say "INJECTED faulty migration on candidate"
(cd driver && bun src/inject.ts ws://127.0.0.1:9945)

say "baseline vs injected candidate"
"$CANARY" test --baseline ws://127.0.0.1:9944 --candidate ws://127.0.0.1:9945 --out runs/demo \
  --injected "faulty-migration: sudo setStorage credits 1000 POT without updating TotalIssuance"
echo "exit $? (expect 1)"
RUN="$(ls -d runs/demo/* | sort | tail -n 1)"

say "reproduce"
"$CANARY" reproduce balances.transfer.basic --run "$RUN"

say "attest on-chain + verify"
"$CANARY" attest --run "$RUN" --ws ws://127.0.0.1:9944
"$CANARY" verify --run "$RUN"

say "report: $RUN/report.html"
