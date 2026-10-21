#!/usr/bin/env bash
# Local convenience: stop stray dev nodes, then run the demo with a Linux-side target dir.
pkill -f 'portaldot_dev --dev' 2>/dev/null; sleep 2
export CARGO_TARGET_DIR="$HOME/canary-target"
export PORTALDOT_DEV="${PORTALDOT_DEV:-$HOME/portaldot/portaldot-testnet-ubuntu/portaldot_dev}"
cd "$(dirname "$0")/.." && (cd backend && cargo clean -q --release -p canary-cli -p canary-chain 2>/dev/null)
exec bash scripts/demo.sh
