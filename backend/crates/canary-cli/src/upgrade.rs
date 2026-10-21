//! `canary upgrade`: apply a candidate runtime WASM to a dev node through
//! `sudo.sudoUncheckedWeight(system.setCode)`, then confirm the new runtime is live
//! and still producing blocks.
//!
//! A runtime can be accepted by `setCode` and still brick the chain on the next
//! block (for example a changed BABE slot duration). "spec_version bumped" is not
//! enough, so the upgrade only counts once `LIVENESS_BLOCKS` further blocks land.

use std::path::Path;
use std::process::ExitCode;
use std::time::{Duration, Instant};

use anyhow::{bail, Context};
use serde_json::json;
use sha2::{Digest, Sha256};

use crate::invariants::connect;
use crate::runner::Driver;

/// Blocks that must be produced under the new runtime before the upgrade counts.
const LIVENESS_BLOCKS: u64 = 3;

fn spec(ws: &str, timeout: Duration) -> anyhow::Result<(Option<u64>, String)> {
    let mut rpc = connect(ws, timeout)?;
    let rv = rpc.call("state_getRuntimeVersion", json!([]))?;
    let chain = rpc.call("system_chain", json!([]))?.as_str().unwrap_or_default().to_string();
    Ok((rv["specVersion"].as_u64(), chain))
}

fn best_number(ws: &str, timeout: Duration) -> anyhow::Result<u64> {
    let mut rpc = connect(ws, timeout)?;
    let header = rpc.call("chain_getHeader", json!([]))?;
    let raw = header["number"].as_str().context("header without number")?;
    Ok(u64::from_str_radix(raw.trim_start_matches("0x"), 16)?)
}

enum Outcome {
    Live,
    Halted(String),
}

fn inner(ws: &str, wasm: &Path, driver: &Driver, timeout: Duration) -> anyhow::Result<Outcome> {
    let code = std::fs::read(wasm).with_context(|| format!("reading {}", wasm.display()))?;
    if code.len() < 8 {
        bail!("{} is too small to be a runtime", wasm.display());
    }
    let (before, chain) = spec(ws, timeout)?;
    if chain != "Development" && chain != "Local Testnet" {
        bail!("refusing to set code on non-development chain {chain:?}");
    }
    println!("wasm       {} ({} bytes, sha256 {})", wasm.display(), code.len(), hex::encode(Sha256::digest(&code)));
    println!("before     spec_version {}", before.map(|v| v.to_string()).unwrap_or("-".into()));

    let step = json!([{ "call": "System.setCode", "signer": "alice", "sudo_unchecked": true,
                        "args": { "code": format!("0x{}", hex::encode(&code)) } }]);
    let out = driver.submit(ws, step)?;
    let r = out.first().context("driver returned no result")?;
    println!("tx         {} {} in {}", r.tx_hash.as_deref().unwrap_or("-"), r.status, r.block_hash.as_deref().unwrap_or("-"));
    let names: Vec<&str> = r.events.iter().map(|e| e.name.as_str()).collect();
    println!("events     {}", names.join(", "));
    if r.status != "success" {
        bail!("upgrade extrinsic {}: {}", r.status, r.dispatch_error.clone().unwrap_or_default());
    }
    // sudo reports the inner call's failure inside Sudid, so the outer extrinsic still succeeds.
    if !names.contains(&"system.CodeUpdated") {
        let sudid = r.events.iter().find(|e| e.name == "sudo.Sudid").map(|e| e.data.to_string()).unwrap_or_default();
        bail!("setCode was not applied (no system.CodeUpdated; sudo result {sudid}); a candidate must raise spec_version above the live runtime");
    }

    // The new code takes effect from the next block.
    let deadline = Instant::now() + timeout;
    loop {
        let (now, _) = spec(ws, timeout)?;
        if now != before {
            println!("after      spec_version {}", now.map(|v| v.to_string()).unwrap_or("-".into()));
            break;
        }
        if Instant::now() > deadline {
            bail!("spec_version still {before:?} after {timeout:?}; inner sudo call may have failed (events: {names:?})");
        }
        std::thread::sleep(Duration::from_secs(2));
    }

    // Liveness: the new runtime has to author blocks, not just be stored.
    let start = best_number(ws, timeout)?;
    let deadline = Instant::now() + timeout;
    loop {
        let now = best_number(ws, timeout)?;
        if now >= start + LIVENESS_BLOCKS {
            println!("liveness   ok (#{start} -> #{now} under the new runtime)");
            return Ok(Outcome::Live);
        }
        if Instant::now() > deadline {
            return Ok(Outcome::Halted(format!(
                "best block stuck at #{now} for {timeout:?} after the upgrade (needed #{}); check the node log for runtime panics",
                start + LIVENESS_BLOCKS
            )));
        }
        std::thread::sleep(Duration::from_secs(2));
    }
}

/// Exit codes: 0 upgraded and live, 1 upgraded but the chain halted, 2 upgrade not applied.
pub fn run(ws: &str, wasm: &Path, driver: &Driver, timeout: Duration) -> ExitCode {
    match inner(ws, wasm, driver, timeout) {
        Ok(Outcome::Live) => ExitCode::SUCCESS,
        Ok(Outcome::Halted(why)) => {
            println!("liveness   HALTED: {why}");
            println!("verdict    REGRESSION Critical: runtime accepted by setCode but block production stopped");
            ExitCode::from(1)
        }
        Err(e) => {
            eprintln!("error: {e:#}");
            ExitCode::from(2)
        }
    }
}
