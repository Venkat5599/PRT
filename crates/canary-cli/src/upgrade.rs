//! `canary upgrade`: apply a candidate runtime WASM to a dev node through
//! `sudo.sudoUncheckedWeight(system.setCode)`, then confirm the new runtime is live.

use std::path::Path;
use std::process::ExitCode;
use std::time::{Duration, Instant};

use anyhow::{bail, Context};
use serde_json::json;
use sha2::{Digest, Sha256};

use crate::invariants::connect;
use crate::runner::Driver;

fn spec(ws: &str, timeout: Duration) -> anyhow::Result<(Option<u64>, String)> {
    let mut rpc = connect(ws, timeout)?;
    let rv = rpc.call("state_getRuntimeVersion", json!([]))?;
    let chain = rpc.call("system_chain", json!([]))?.as_str().unwrap_or_default().to_string();
    Ok((rv["specVersion"].as_u64(), chain))
}

fn inner(ws: &str, wasm: &Path, driver: &Driver, timeout: Duration) -> anyhow::Result<()> {
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

    // The new code takes effect from the next block.
    let deadline = Instant::now() + timeout;
    loop {
        let (now, _) = spec(ws, timeout)?;
        if now != before {
            println!("after      spec_version {}", now.map(|v| v.to_string()).unwrap_or("-".into()));
            return Ok(());
        }
        if Instant::now() > deadline {
            bail!("spec_version still {before:?} after {timeout:?}; inner sudo call may have failed (events: {names:?})");
        }
        std::thread::sleep(Duration::from_secs(2));
    }
}

pub fn run(ws: &str, wasm: &Path, driver: &Driver, timeout: Duration) -> ExitCode {
    match inner(ws, wasm, driver, timeout) {
        Ok(()) => ExitCode::SUCCESS,
        Err(e) => {
            eprintln!("error: {e:#}");
            ExitCode::from(2)
        }
    }
}
