#!/usr/bin/env bash
# Mode B: real runtime upgrades on local Portaldot dev nodes. No manual steps.
#
#   1. start four dev nodes (:9944 to :9947) from the prebuilt portaldot_dev
#   2. sudo system.setCode on each with a runtime built from the public source:
#        :9944  clean.compact.wasm   spec 1003, no behaviour change   (baseline)
#        :9945  ed100x.compact.wasm  spec 1004, INJECTED ExistentialDeposit 1 -> 100 POT
#   3. compare the two upgraded runtimes structurally
#   4. control: upgraded baseline vs itself -> expect all PASS
#   5. upgraded baseline vs INJECTED candidate -> expect REGRESSION
#   6. :9946 gets the unmodified public source (60 s slots) -> expect HALTED, exit 1
#   7. :9947 gets INJECTED fee10x (byte fee x10) -> expect DIFFERENCE, exit 0
#
# Both WASMs come from the same source tree (runtimes/build.sh); their only
# difference is the injected constant, recorded in runtimes/out/*.patch.
# Env: PORTALDOT_DEV (path to portaldot_dev; downloaded if unset), CANARY_BUN.
set -uo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
export PATH="$HOME/.cargo/bin:$HOME/.bun/bin:$PATH"
export CANARY_BUN="${CANARY_BUN:-$(command -v bun)}"
WORK="$(mktemp -d)"
trap 'kill $(jobs -p) 2>/dev/null; rm -rf "$WORK"' EXIT

say() { printf '\n\033[1m== %s\033[0m\n' "$*"; }

(cd runtimes/out && sha256sum -c SHA256SUMS) || { echo "runtime WASM hashes do not match SHA256SUMS"; exit 2; }

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

say "starting dev nodes (:9944 to :9947)"
"$PORTALDOT_DEV" --dev --tmp --ws-port 9944 --rpc-port 9933 --port 30333 >"$WORK/base.log" 2>&1 &
"$PORTALDOT_DEV" --dev --tmp --ws-port 9945 --rpc-port 9934 --port 30334 >"$WORK/cand.log" 2>&1 &
"$PORTALDOT_DEV" --dev --tmp --ws-port 9946 --rpc-port 9935 --port 30335 >"$WORK/brick.log" 2>&1 &
"$PORTALDOT_DEV" --dev --tmp --ws-port 9947 --rpc-port 9936 --port 30336 >"$WORK/fee.log" 2>&1 &
for p in 9944 9945 9946 9947; do
  for _ in $(seq 60); do "$CANARY" doctor --ws "ws://127.0.0.1:$p" >/dev/null 2>&1 && break; sleep 1; done
done
sleep 8

say "upgrade :9944 -> clean (spec 1003)"
"$CANARY" upgrade --ws ws://127.0.0.1:9944 --wasm runtimes/out/clean.compact.wasm || exit 2
say "upgrade :9945 -> ed100x (spec 1004, INJECTED)"
"$CANARY" upgrade --ws ws://127.0.0.1:9945 --wasm runtimes/out/ed100x.compact.wasm || exit 2
sleep 8 # let the new runtimes produce a few blocks

say "compare upgraded runtimes"
"$CANARY" compare --baseline ws://127.0.0.1:9944 --candidate ws://127.0.0.1:9945

say "control: upgraded baseline vs itself"
"$CANARY" test --baseline ws://127.0.0.1:9944 --candidate ws://127.0.0.1:9944 --out runs/upgrade-control
echo "exit $? (expect 0)"

say "upgraded baseline vs INJECTED candidate"
"$CANARY" test --baseline ws://127.0.0.1:9944 --candidate ws://127.0.0.1:9945 --out runs/upgrade \
  --injected "ed100x: ExistentialDeposit 1 -> 100 POT, applied by system.setCode (runtimes/out/ed100x.patch)"
echo "exit $? (expect 1)"
RUN="$(ls -d runs/upgrade/* | sort | tail -n 1)"

say "upgrade :9947 -> fee10x (spec 1005, INJECTED byte fee x10)"
"$CANARY" upgrade --ws ws://127.0.0.1:9947 --wasm runtimes/out/fee10x.compact.wasm || exit 2
sleep 8
say "upgraded baseline vs INJECTED fee candidate"
"$CANARY" test --baseline ws://127.0.0.1:9944 --candidate ws://127.0.0.1:9947 --out runs/upgrade-fee \
  --injected "fee10x: TransactionByteFee 10 -> 100 MILLICENTS (runtimes/out/fee10x.patch)"
echo "exit $? (expect 0: DIFFERENCE, not REGRESSION)"

say "reproduce"
"$CANARY" reproduce balances.transfer.basic --run "$RUN"

say "liveness: the unmodified public source (60 s slots) on the 6 s dev chain"
"$CANARY" upgrade --ws ws://127.0.0.1:9946 --wasm runtimes/out/source-60s.compact.wasm --timeout 40
echo "exit $? (expect 1: chain halted)"
grep -m1 -o "panicked at [^,]*" "$WORK/brick.log"

say "report: $RUN/report.html"
