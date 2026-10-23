#!/usr/bin/env bash
# Build Portaldot candidate runtimes (WASM) from the public source.
#
#   clean      public source at dev-chain timing, spec_version 1003 (no behaviour change)
#   ed100x     INJECTED: ExistentialDeposit 1 -> 100 DOLLARS, spec_version 1004
#   fee10x     INJECTED: TransactionByteFee 10 -> 100 MILLICENTS, spec_version 1005
#   halve-reserved  INJECTED migration: halves every reserved balance on upgrade and
#              leaves TotalIssuance unchanged (funds destroyed), spec_version 1006
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
# Skip the network when the pinned toolchain is already installed.
rustup toolchain list | grep -q "^$TOOLCHAIN" || rustup toolchain install "$TOOLCHAIN" --profile minimal
rustup target list --toolchain "$TOOLCHAIN" --installed | grep -q wasm32-unknown-unknown \
  || rustup target add wasm32-unknown-unknown --toolchain "$TOOLCHAIN"
mkdir -p "$OUT"

# INJECTED migration bug: on upgrade, every account holding a deposit has its
# reserved balance halved, and Balances.TotalIssuance is left as it was. The
# funds simply vanish: no event, no error, the chain keeps producing blocks.
# This is the class of bug a botched reserve migration causes; `canary upgrade`
# must catch it from state alone (supply invariant + per-account diff).
inject_halve_reserved() {
  local f="$SRC/bin/node/runtime/src/lib.rs"
  perl -0pi -e 's/\tAllPallets,\n\t\(\),\n>;/\tAllPallets,\n\tHalveReserved,\n>;\n\n\/\/\/ INJECTED (Portal Canary demo): halves every reserved balance on upgrade\n\/\/\/ without touching TotalIssuance, so supply is silently destroyed.\npub struct HalveReserved;\nimpl frame_support::traits::OnRuntimeUpgrade for HalveReserved {\n\tfn on_runtime_upgrade() -> Weight {\n\t\tlet held: Vec<AccountId> = frame_system::Account::<Runtime>::iter()\n\t\t\t.filter(|(_, a)| a.data.reserved > 0)\n\t\t\t.map(|(who, _)| who)\n\t\t\t.collect();\n\t\tfor who in held.iter() {\n\t\t\tframe_system::Account::<Runtime>::mutate(who, |a| a.data.reserved \/= 2);\n\t\t}\n\t\tRuntimeBlockWeights::get().max_block\n\t}\n}/' "$f"
  grep -q "impl frame_support::traits::OnRuntimeUpgrade for HalveReserved" "$f"
}

build_variant() {
  local name="$1" spec="$2" ed="$3" bytefee="${4:-10}"
  echo "== $name (spec $spec, ED $ed DOLLARS, byte fee $bytefee MILLICENTS)"
  git -C "$SRC" checkout -q -- bin/node/runtime/src/lib.rs bin/node/runtime/src/constants.rs
  # The public source targets 60 s blocks; the prebuilt portaldot_dev chain runs 6 s.
  # BABE slot duration cannot change on a live chain (setCode would halt it), so the
  # candidates match the dev chain's timing. `canary compare` flags this class of change.
  sed -i "s/pub const MILLISECS_PER_BLOCK: Moment = 60_000;/pub const MILLISECS_PER_BLOCK: Moment = 6_000;/" "$SRC/bin/node/runtime/src/constants.rs"
  grep -q "MILLISECS_PER_BLOCK: Moment = 6_000;" "$SRC/bin/node/runtime/src/constants.rs"
  sed -i "s/spec_version: 1001,/spec_version: $spec,/" "$SRC/bin/node/runtime/src/lib.rs"
  sed -i "s/pub const ExistentialDeposit: Balance = 1 \* DOLLARS;/pub const ExistentialDeposit: Balance = $ed * DOLLARS;/" "$SRC/bin/node/runtime/src/lib.rs"
  grep -q "spec_version: $spec," "$SRC/bin/node/runtime/src/lib.rs"
  grep -q "ExistentialDeposit: Balance = $ed \* DOLLARS" "$SRC/bin/node/runtime/src/lib.rs"
  sed -i "s/pub const TransactionByteFee: Balance = 10 \* MILLICENTS;/pub const TransactionByteFee: Balance = $bytefee * MILLICENTS;/" "$SRC/bin/node/runtime/src/lib.rs"
  grep -q "TransactionByteFee: Balance = $bytefee \* MILLICENTS" "$SRC/bin/node/runtime/src/lib.rs"
  [ "${5:-}" = "halve-reserved" ] && inject_halve_reserved
  (cd "$SRC" && WASM_BUILD_TOOLCHAIN="$TOOLCHAIN" cargo "+$TOOLCHAIN" build --release -p node-runtime)
  cp "$CARGO_TARGET_DIR/release/wbuild/node-runtime/node_runtime.compact.wasm" "$OUT/$name.compact.wasm"
  git -C "$SRC" diff --stat
  git -C "$SRC" diff > "$OUT/$name.patch"
}

# VARIANTS limits the build, e.g. VARIANTS=fee10x; existing WASMs are kept.
want() { [ -z "${VARIANTS:-}" ] || [[ " $VARIANTS " == *" $1 "* ]]; }
want clean  && build_variant clean  1003 1
want ed100x && build_variant ed100x 1004 100
want fee10x && build_variant fee10x 1005 1 100
want halve-reserved && build_variant halve-reserved 1006 1 10 halve-reserved
git -C "$SRC" checkout -q -- bin/node/runtime/src/lib.rs bin/node/runtime/src/constants.rs
(cd "$OUT" && sha256sum *.wasm > SHA256SUMS && cat SHA256SUMS)
echo "done"
