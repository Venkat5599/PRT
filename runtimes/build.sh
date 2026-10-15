#!/usr/bin/env bash
# Build Portaldot candidate runtimes (WASM) from the public source.
#
#   clean      public source, spec_version bumped to 1003 (no behaviour change)
#   ed100x     INJECTED: ExistentialDeposit 1 -> 100 DOLLARS, spec_version 1004
#
# Output: runtimes/out/<variant>.compact.wasm plus SHA256SUMS.
# The public source is spec 1001 while the live chain runs 1002; both
# candidates come from the same source so their only difference is the injection.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="${PORTALDOT_SRC:-$HOME/Portaldot-src}"
TOOLCHAIN="${RUST_TOOLCHAIN:-nightly-2021-06-01}"
OUT="$ROOT/runtimes/out"
export PATH="$HOME/.cargo/bin:$PATH"
export CARGO_TARGET_DIR="${RUNTIME_TARGET_DIR:-$HOME/portaldot-runtime-target}"

[ -d "$SRC" ] || git clone -q --depth 1 https://github.com/portaldotVolunteer/Portaldot.git "$SRC"
rustup toolchain install "$TOOLCHAIN" --profile minimal
rustup target add wasm32-unknown-unknown --toolchain "$TOOLCHAIN"
mkdir -p "$OUT"

build_variant() {
  local name="$1" spec="$2" ed="$3"
  echo "== $name (spec $spec, ED $ed DOLLARS)"
  git -C "$SRC" checkout -q -- bin/node/runtime/src/lib.rs
  sed -i "s/spec_version: 1001,/spec_version: $spec,/" "$SRC/bin/node/runtime/src/lib.rs"
  sed -i "s/pub const ExistentialDeposit: Balance = 1 \* DOLLARS;/pub const ExistentialDeposit: Balance = $ed * DOLLARS;/" "$SRC/bin/node/runtime/src/lib.rs"
  grep -q "spec_version: $spec," "$SRC/bin/node/runtime/src/lib.rs"
  grep -q "ExistentialDeposit: Balance = $ed \* DOLLARS" "$SRC/bin/node/runtime/src/lib.rs"
  (cd "$SRC" && WASM_BUILD_TOOLCHAIN="$TOOLCHAIN" cargo "+$TOOLCHAIN" build --release -p node-runtime)
  cp "$CARGO_TARGET_DIR/release/wbuild/node-runtime/node_runtime.compact.wasm" "$OUT/$name.compact.wasm"
  git -C "$SRC" diff --stat
  git -C "$SRC" diff > "$OUT/$name.patch"
}

build_variant clean 1003 1
build_variant ed100x 1004 100
git -C "$SRC" checkout -q -- bin/node/runtime/src/lib.rs
(cd "$OUT" && sha256sum *.wasm > SHA256SUMS && cat SHA256SUMS)
echo "done"
