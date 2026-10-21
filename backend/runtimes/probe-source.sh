#!/usr/bin/env bash
# Clone the public Portaldot source and report what runtime it builds.
set -euo pipefail
SRC="${PORTALDOT_SRC:-$HOME/Portaldot-src}"
[ -d "$SRC" ] || git clone -q --depth 1 https://github.com/portaldotVolunteer/Portaldot.git "$SRC"
cd "$SRC"
echo "commit: $(git log -1 --format='%H %cd')"
grep -nE 'spec_name|spec_version|impl_name|transaction_version' bin/node/runtime/src/lib.rs | head -8
grep -nE 'ExistentialDeposit|pub const (DOLLARS|CENTS|MILLICENTS)' bin/node/runtime/src/lib.rs bin/node/runtime/src/constants.rs | head -8
ls rust-toolchain* 2>/dev/null || echo "no rust-toolchain file"
grep -m3 -nE '^name = "(sp-io|frame-support)"' -A1 Cargo.lock || true
du -sh . | cut -f1
