#!/usr/bin/env bash
# The knockout case: a runtime upgrade whose migration silently destroys funds.
#
#   1. start two Portaldot dev nodes (:9950 control, :9951 candidate)
#   2. write legacy state on both: on-chain identities, which reserve a deposit
#      (canary test --only identity.deposit, run against the node itself)
#   3. :9950 <- clean.compact.wasm           (spec 1003, no behaviour change)  expect PASS
#   4. :9951 <- halve-reserved.compact.wasm  (spec 1006, INJECTED migration)   expect REGRESSION Critical
#
# The injected migration halves every reserved balance and leaves TotalIssuance
# alone (source diff: backend/runtimes/out/halve-reserved.patch). The chain keeps
# producing blocks, no event or error is emitted, spec_version goes up: every
# usual "did the upgrade work" signal says yes. `canary upgrade` diffs every
# account and the supply invariant across the upgrade and names the accounts.
#
# Env: PORTALDOT_DEV (path to portaldot_dev; downloaded if unset), CANARY_BUN, OUT
# (directory for upgrade.json results, default runs/migration).
set -uo pipefail
ROOT="$(cd "$(dirname "$0")/../backend" && pwd)"
cd "$ROOT"
export PATH="$HOME/.cargo/bin:$HOME/.bun/bin:$PATH"
export CANARY_BUN="${CANARY_BUN:-$(command -v bun)}"
OUT="${OUT:-runs/migration}"
WORK="$(mktemp -d)"
trap 'kill $(jobs -p) 2>/dev/null; rm -rf "$WORK"' EXIT

say() { printf '\n\033[1m== %s\033[0m\n' "$*"; }

(cd runtimes/out && sha256sum -c --quiet SHA256SUMS) || { echo "runtime WASM hashes do not match SHA256SUMS"; exit 2; }

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

say "starting dev nodes (:9950 control, :9951 candidate)"
"$PORTALDOT_DEV" --dev --tmp --ws-port 9950 --rpc-port 9952 --port 30350 >"$WORK/control.log" 2>&1 &
"$PORTALDOT_DEV" --dev --tmp --ws-port 9951 --rpc-port 9953 --port 30351 >"$WORK/cand.log" 2>&1 &
for p in 9950 9951; do
  for _ in $(seq 60); do "$CANARY" doctor --ws "ws://127.0.0.1:$p" >/dev/null 2>&1 && break; sleep 1; done
done
sleep 8

say "legacy state: identities with reserved deposits on both chains"
for p in 9950 9951; do
  "$CANARY" test --baseline "ws://127.0.0.1:$p" --candidate "ws://127.0.0.1:$p" \
    --only identity.deposit --out "$WORK/legacy-$p" >/dev/null || { echo "setup failed on :$p"; exit 2; }
done
echo "ok: deposits reserved on both chains"

say "control: :9950 <- clean (spec 1003)"
"$CANARY" upgrade --ws ws://127.0.0.1:9950 --wasm runtimes/out/clean.compact.wasm --out "$OUT/control/upgrade.json"
echo "exit $? (expect 0)"

say "candidate: :9951 <- halve-reserved (spec 1006, INJECTED migration)"
"$CANARY" upgrade --ws ws://127.0.0.1:9951 --wasm runtimes/out/halve-reserved.compact.wasm --out "$OUT/halve-reserved/upgrade.json"
echo "exit $? (expect 1: REGRESSION Critical)"

say "independent check: canary invariants on the upgraded candidate, same block"
# Pin to the post-upgrade block recorded by `canary upgrade` (the second block_hash:
# state.before, then state.after), not the lagging finalized head.
AFTER="$(grep -o '"block_hash": "0x[0-9a-f]*"' "$OUT/halve-reserved/upgrade.json" | sed -n 2p | grep -o '0x[0-9a-f]*')"
"$CANARY" invariants --ws ws://127.0.0.1:9951 --at "$AFTER" 2>/dev/null
echo "exit $? (expect 1: FAIL)"
