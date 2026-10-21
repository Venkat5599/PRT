# Architecture

```mermaid
flowchart LR
  subgraph CLI["canary (Rust)"]
    doctor[doctor] --- compare[compare] --- inv[invariants]
    test[test] --- repro[reproduce] --- att[attest / verify] --- up[upgrade]
  end

  subgraph core["canary-chain (Rust library)"]
    rpc["JSON-RPC over WS<br/>(ws:// and wss://)"]
    md["metadata V13 decoder<br/>+ structural diff"]
    st["storage keys<br/>twox128 · blake2_128_concat<br/>paged reads pinned to a block"]
    codec["curated SCALE codecs<br/>AccountInfo (3 layouts)"]
    invl["invariants<br/>supply conservation"]
  end

  subgraph run["differential runner"]
    wf["YAML corpus<br/>backend/tests/workflows"]
    side["run_side x2<br/>namespaced accounts<br/>pre/post state"]
    cls["classifier<br/>REGRESSION · DIFFERENCE<br/>INCONCLUSIVE · PASS"]
    rep["report.json + report.html<br/>manifest · finding hash"]
  end

  drv["driver (bun + @polkadot/api)<br/>sign · submit · decode events<br/>legacy DispatchError pinned"]

  B[("baseline runtime<br/>dev node / mainnet")]
  C[("candidate runtime<br/>dev node + setCode")]
  chain[("Portaldot chain<br/>system.remark attestation")]

  CLI --> core
  test --> run
  wf --> side --> cls --> rep
  side -- steps --> drv
  side -- state reads --> rpc
  drv --> B & C
  rpc --> B & C
  att -- remark --> drv --> chain
  up -- sudo setCode --> drv
```

## Boundaries

| Component | Responsibility | Why it is separate |
|---|---|---|
| `canary-chain` | Raw JSON-RPC, SCALE, metadata V13, storage, invariants | Portaldot runs metadata V13; modern `subxt` cannot decode it. No dependency on Substrate crates, so it builds anywhere |
| `canary-cli` | Commands, runner, classifier, reports, attestation | Usable in CI without any UI |
| `backend/driver/` | Signing, submission, event decoding | `@polkadot/api` already handles V13 extrinsic formats; Canary pins the one type it gets wrong |
| `backend/runtimes/` | Building candidate WASM from the public source with a pinned 2021 toolchain | Reproducible candidates with recorded patches and hashes |

## Trust model

- Candidate runtimes and workflows are untrusted. They run only on local `--dev --tmp` nodes; `upgrade` and `inject` refuse non-development chains.
- No secrets in args, logs or reports. Real-network signing uses `--signer env` with `CANARY_SIGNER_URI`.
- Every result is pinned to block hashes; every run records runtime ids (spec, metadata sha256, genesis) and corpus file hashes.
- Verdicts are conservative: an undecodable block or a baseline failure is **INCONCLUSIVE**, never PASS. Reports never call an upgrade "safe".
