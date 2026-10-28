//! `canary attest` / `canary verify`: anchor a run's verdict on-chain with
//! `system.remark`, and check an anchor against the chain and the report file.
//!
//! Payload (UTF-8, one line), for a `canary test` run directory:
//! `canary/1 <report sha256> b=<spec>:<metadata sha256[..16]> c=<spec>:<metadata sha256[..16]> R<n> D<n> I<n> P<n>`
//!
//! For a full canary run (upgrade + compare + test, written by `.github/workflows/canary-run.yml`)
//! the directory holds `result.json`, which lists the sha256 of every other file; the payload is
//! `canary-run/1 <result.json sha256> <run id> u=<exit> c=<exit> t=<exit> h=<0|1>`.

use std::path::Path;
use std::process::ExitCode;
use std::time::Duration;

use anyhow::{anyhow, bail, Context};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use sha2::{Digest, Sha256};

use crate::invariants::connect;
use crate::runner::Driver;

#[derive(Debug, Serialize, Deserialize)]
pub struct Attestation {
    pub network: String,
    pub chain: Option<String>,
    pub genesis_hash: Option<String>,
    pub payload: String,
    pub payload_hex: String,
    pub report_sha256: String,
    pub signer: String,
    pub tx_hash: String,
    pub block_hash: String,
    pub block_number: Option<u64>,
}

fn side(m: &Value) -> String {
    let spec = m["spec_version"].as_u64().map(|v| v.to_string()).unwrap_or_else(|| "-".into());
    let meta = m["metadata_sha256"].as_str().map(|s| &s[..16.min(s.len())]).unwrap_or("-");
    format!("{spec}:{meta}")
}

fn build_payload(run_dir: &Path) -> anyhow::Result<(String, String)> {
    let result = run_dir.join("result.json");
    if result.exists() {
        let raw = std::fs::read(&result).with_context(|| format!("reading {}", result.display()))?;
        let sha = hex::encode(Sha256::digest(&raw));
        let r: Value = serde_json::from_slice(&raw)?;
        let code = |k: &str| r["exit"][k].as_i64().map(|v| v.to_string()).unwrap_or_else(|| "-".into());
        let id = r["run_id"].as_str().unwrap_or("-");
        let halted = if r["halted"].as_bool().unwrap_or(false) { 1 } else { 0 };
        let payload = format!("canary-run/1 {sha} {id} u={} c={} t={} h={halted}", code("upgrade"), code("compare"), code("test"));
        return Ok((payload, sha));
    }
    let raw = std::fs::read(run_dir.join("report.json")).with_context(|| format!("reading {}/report.json", run_dir.display()))?;
    let report_sha = hex::encode(Sha256::digest(&raw));
    let r: Value = serde_json::from_slice(&raw)?;
    let s = &r["summary"];
    let n = |k: &str| s[k].as_u64().unwrap_or(0);
    let payload = format!(
        "canary/1 {report_sha} b={} c={} R{} D{} I{} P{}",
        side(&r["manifest"]["baseline"]),
        side(&r["manifest"]["candidate"]),
        n("regression"),
        n("difference"),
        n("inconclusive"),
        n("pass")
    );
    Ok((payload, report_sha))
}

fn attest_inner(run_dir: &Path, ws: &str, signer: &str, driver: &Driver, timeout: Duration) -> anyhow::Result<Attestation> {
    let (payload, report_sha) = build_payload(run_dir)?;
    let payload_hex = format!("0x{}", hex::encode(payload.as_bytes()));
    let out = driver.submit(ws, json!([{ "call": "System.remark", "signer": signer, "args": { "remark": payload_hex } }]))?;
    let step = out.into_iter().next().ok_or_else(|| anyhow!("driver returned no result"))?;
    if step.status != "success" {
        bail!("remark not included: {} {}", step.status, step.dispatch_error.unwrap_or_default());
    }
    let block_hash = step.block_hash.ok_or_else(|| anyhow!("no block hash"))?;
    let mut rpc = connect(ws, timeout)?;
    let chain = rpc.call("system_chain", json!([])).ok().and_then(|v| v.as_str().map(String::from));
    let genesis_hash = rpc.call("chain_getBlockHash", json!([0])).ok().and_then(|v| v.as_str().map(String::from));
    let block_number = canary_chain::storage::block_number(&mut rpc, &block_hash).ok();
    Ok(Attestation {
        network: ws.into(),
        chain,
        genesis_hash,
        payload,
        payload_hex,
        report_sha256: report_sha,
        // Never record a secret: "env" stays "env".
        signer: signer.into(),
        tx_hash: step.tx_hash.unwrap_or_default(),
        block_hash,
        block_number,
    })
}

pub fn attest(run_dir: &Path, ws: &str, signer: &str, driver: &Driver, timeout: Duration) -> ExitCode {
    match attest_inner(run_dir, ws, signer, driver, timeout) {
        Ok(a) => {
            let path = run_dir.join("attestation.json");
            if let Err(e) = std::fs::write(&path, serde_json::to_string_pretty(&a).expect("serialises")) {
                eprintln!("error writing {}: {e}", path.display());
                return ExitCode::from(2);
            }
            println!("attested   {}", a.payload);
            println!("chain      {} ({})", a.chain.as_deref().unwrap_or("-"), a.network);
            println!("tx         {}", a.tx_hash);
            println!("block      #{} {}", a.block_number.map(|n| n.to_string()).unwrap_or("-".into()), a.block_hash);
            println!("saved      {}", path.display());
            ExitCode::SUCCESS
        }
        Err(e) => {
            eprintln!("error: {e:#}");
            ExitCode::from(2)
        }
    }
}

fn verify_inner(run_dir: &Path, ws: Option<&str>, timeout: Duration) -> anyhow::Result<Vec<(String, bool, String)>> {
    let a: Attestation = serde_json::from_str(&std::fs::read_to_string(run_dir.join("attestation.json"))?)?;
    let (payload_now, sha_now) = build_payload(run_dir)?;
    let mut checks = vec![
        ("run file matches attested hash".to_string(), sha_now == a.report_sha256, sha_now.clone()),
        ("payload rebuilt from report matches".to_string(), payload_now == a.payload, payload_now),
    ];
    let mut rpc = connect(ws.unwrap_or(&a.network), timeout)?;
    let genesis = rpc.call("chain_getBlockHash", json!([0]))?.as_str().map(String::from);
    checks.push(("same chain (genesis hash)".into(), genesis == a.genesis_hash, genesis.unwrap_or_default()));
    let block = rpc.call("chain_getBlock", json!([a.block_hash]))?;
    let needle = a.payload_hex.trim_start_matches("0x").to_lowercase();
    let found = block["block"]["extrinsics"]
        .as_array()
        .map(|xs| xs.iter().any(|x| x.as_str().unwrap_or("").to_lowercase().contains(&needle)))
        .unwrap_or(false);
    checks.push(("remark present in attested block".into(), found, a.block_hash.clone()));
    Ok(checks)
}

pub fn verify(run_dir: &Path, ws: Option<&str>, timeout: Duration) -> ExitCode {
    match verify_inner(run_dir, ws, timeout) {
        Ok(checks) => {
            let ok = checks.iter().all(|(_, pass, _)| *pass);
            for (what, pass, detail) in &checks {
                println!("{} {what}  ({detail})", if *pass { "ok  " } else { "FAIL" });
            }
            println!("{}", if ok { "VERIFIED" } else { "NOT VERIFIED" });
            if ok { ExitCode::SUCCESS } else { ExitCode::from(1) }
        }
        Err(e) => {
            eprintln!("error: {e:#}");
            ExitCode::from(2)
        }
    }
}

#[cfg(test)]
mod tests {
    use super::build_payload;
    use std::path::Path;

    // A real canary run's result.json (run 959e58764a17). frontend/tests/reports.test.ts asserts the
    // dashboard rebuilds this exact remark, so the page and the CLI anchor the same bytes.
    #[test]
    fn run_payload_from_result_json() {
        let dir = Path::new(env!("CARGO_MANIFEST_DIR")).join("../../tests/fixtures/run");
        let (payload, sha) = build_payload(&dir).unwrap();
        assert_eq!(sha, "d06ca94c27db9c831dbb13b51b990962511834c89482cf510007cefd5544f36f");
        assert_eq!(payload, "canary-run/1 d06ca94c27db9c831dbb13b51b990962511834c89482cf510007cefd5544f36f 959e58764a17 u=1 c=0 t=1 h=0");
    }
}
