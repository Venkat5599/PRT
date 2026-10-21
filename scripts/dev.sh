#!/usr/bin/env bash
# Developer helper (Linux / WSL). Usage: scripts/dev.sh test|build|canary <args...>
set -euo pipefail
cd "$(dirname "$0")/../backend"
export CARGO_TARGET_DIR="${CARGO_TARGET_DIR:-$HOME/canary-target}"
export PATH="$HOME/.cargo/bin:$HOME/.bun/bin:$PATH"
# Files edited from Windows under /mnt/c can carry mtimes cargo mistrusts;
# rebuilding our two small crates every time is cheap and always correct.
cargo clean -q -p canary-cli -p canary-chain 2>/dev/null || true

case "${1:-}" in
  test)   cargo test -q 2>&1 | grep -E "test result|^error|^warning|-->|panicked" ;;
  build)  cargo build 2>&1 | grep -E "^(error|warning)|-->|Finished" ;;
  canary) shift; cargo build -q && "$CARGO_TARGET_DIR/debug/canary" "$@" ;;
  *)      echo "usage: scripts/dev.sh test|build|canary <args>"; exit 64 ;;
esac
