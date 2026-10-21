#!/usr/bin/env bash
# Build Canary's compare engine for the browser and copy it into the site.
# Same decoder, diff and hazard rules as `canary compare`.
set -euo pipefail
cd "$(dirname "$0")/.."
target="${CARGO_TARGET_DIR:-target}"
CARGO_PROFILE_RELEASE_OPT_LEVEL=z \
CARGO_PROFILE_RELEASE_LTO=true \
CARGO_PROFILE_RELEASE_CODEGEN_UNITS=1 \
CARGO_PROFILE_RELEASE_STRIP=true \
CARGO_PROFILE_RELEASE_PANIC=abort \
  cargo build -p canary-wasm --release --target wasm32-unknown-unknown
mkdir -p web/public/engine
cp "$target/wasm32-unknown-unknown/release/canary_wasm.wasm" web/public/engine/canary.wasm
ls -l web/public/engine/canary.wasm
