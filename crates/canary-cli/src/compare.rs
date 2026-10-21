//! `canary compare`: structural diff of two live runtimes (version, APIs, metadata).

use std::process::ExitCode;
use std::time::Duration;

use canary_chain::compare::{self, Runtime};
use canary_chain::diff::ChangeKind;
use canary_chain::storage;
use serde_json::json;

use crate::invariants::connect;

fn load(ws: &str, timeout: Duration) -> anyhow::Result<Runtime> {
    let mut rpc = connect(ws, timeout)?;
    let rv = rpc.call("state_getRuntimeVersion", json!([]))?;
    let raw = rpc.call("state_getMetadata", json!([]))?;
    let bytes = storage::from_hex(raw.as_str().unwrap_or_default())?;
    let genesis = rpc.call("chain_getBlockHash", json!([0])).ok().and_then(|v| v.as_str().map(String::from));
    Runtime::new(ws, &rv, &bytes, genesis)
}

pub fn run(baseline: &str, candidate: &str, timeout: Duration, as_json: bool) -> ExitCode {
    let (a, b) = match (load(baseline, timeout), load(candidate, timeout)) {
        (Ok(a), Ok(b)) => (a, b),
        (Err(e), _) | (_, Err(e)) => {
            eprintln!("error: {e:#}");
            return ExitCode::from(2);
        }
    };
    let c = compare::compare(&a, &b);

    if as_json {
        println!("{}", serde_json::to_string_pretty(&c).expect("serialises"));
    } else {
        println!("baseline   {}  spec {}#{}  metadata {}…", c.baseline.endpoint, c.baseline.spec_name.as_deref().unwrap_or("-"),
            c.baseline.spec_version.unwrap_or_default(), &c.baseline.metadata.sha256[..16]);
        println!("candidate  {}  spec {}#{}  metadata {}…", c.candidate.endpoint, c.candidate.spec_name.as_deref().unwrap_or("-"),
            c.candidate.spec_version.unwrap_or_default(), &c.candidate.metadata.sha256[..16]);
        println!("pallets    {} vs {}", c.baseline.pallets, c.candidate.pallets);
        println!();
        if c.changes.is_empty() {
            println!("no structural changes{}", if c.metadata_identical { "" } else { " (metadata bytes differ only in docs/defaults)" });
        }
        for ch in &c.changes {
            let tag = match ch.kind { ChangeKind::Added => "+", ChangeKind::Removed => "-", ChangeKind::Modified => "~" };
            println!("{tag} {}", ch.path);
            if let Some(x) = &ch.baseline { println!("    baseline:  {x}"); }
            if let Some(y) = &ch.candidate { println!("    candidate: {y}"); }
        }
        if c.unversioned_change {
            println!();
            println!("WARNING  runtime changed without a spec_version/transaction_version bump");
        }
        if !c.upgrade_hazards.is_empty() {
            println!();
            for h in &c.upgrade_hazards {
                println!("HAZARD   {}: {}", h.path, h.reason);
            }
            println!("         applying this candidate with setCode would halt the chain");
        }
        println!();
        println!("{} change(s)", c.changes.len());
    }
    if c.upgrade_hazards.is_empty() { ExitCode::SUCCESS } else { ExitCode::from(1) }
}
