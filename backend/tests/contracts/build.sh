#!/usr/bin/env bash
# Compile the corpus contracts (WAT -> WASM) with wabt's wat2wasm, via bunx.
# The .wasm output is committed so running the corpus needs no extra tooling.
set -euo pipefail
cd "$(dirname "$0")"
for wat in *.wat; do
  bun x --package wabt@1.0.36 wat2wasm "$wat" -o "${wat%.wat}.wasm"
  echo "built ${wat%.wat}.wasm ($(wc -c < "${wat%.wat}.wasm") bytes, sha256 $(sha256sum "${wat%.wat}.wasm" | cut -c1-16))"
done
