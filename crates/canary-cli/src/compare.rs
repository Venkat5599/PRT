//! `canary compare`: structural diff of two live runtimes (version, APIs, metadata).

use std::process::ExitCode;
use std::time::Duration;

use canary_chain::diff::{self, Change, ChangeKind};
use canary_chain::{apis, metadata, metadata_v13, metadata_v14, storage};
use serde::Serialize;
use serde_json::{json, Value};

use crate::invariants::connect;

#[derive(Serialize)]
struct Side {
    endpoint: String,
    spec_name: Option<String>,
    spec_version: Option<u64>,
    transaction_version: Option<u64>,
    genesis_hash: Option<String>,
    metadata: metadata::Fingerprint,
    apis: Vec<String>,
}

struct Loaded {
    side: Side,
    md: metadata_v13::MetadataV13,
}

fn load(ws: &str, timeout: Duration) -> anyhow::Result<Loaded> {
    let mut rpc = connect(ws, timeout)?;
    let rv = rpc.call("state_getRuntimeVersion", json!([]))?;
    let raw = rpc.call("state_getMetadata", json!([]))?;
    let bytes = storage::from_hex(raw.as_str().unwrap_or_default())?;
    let fp = metadata::fingerprint(&bytes)?;
    let md = metadata_v14::decode_any(&bytes)?;
    let api_list = apis::detect(&rv["apis"])
        .into_iter()
        .map(|a| format!("{}@{}", a.name.unwrap_or(a.id), a.version))
        .collect();
    Ok(Loaded {
        side: Side {
            endpoint: ws.into(),
            spec_name: rv["specName"].as_str().map(String::from),
            spec_version: rv["specVersion"].as_u64(),
            transaction_version: rv["transactionVersion"].as_u64(),
            genesis_hash: rpc.call("chain_getBlockHash", json!([0])).ok().and_then(|v| v.as_str().map(String::from)),
            metadata: fp,
            apis: api_list,
        },
        md,
    })
}

fn version_changes(a: &Side, b: &Side) -> Vec<Change> {
    let mut out = Vec::new();
    let mut push = |path: &str, x: Value, y: Value| {
        if x != y {
            out.push(Change {
                kind: ChangeKind::Modified,
                path: path.into(),
                baseline: Some(x.to_string()),
                candidate: Some(y.to_string()),
            });
        }
    };
    push("runtime.spec_name", json!(a.spec_name), json!(b.spec_name));
    push("runtime.spec_version", json!(a.spec_version), json!(b.spec_version));
    push("runtime.transaction_version", json!(a.transaction_version), json!(b.transaction_version));
    push("runtime.apis", json!(a.apis), json!(b.apis));
    out
}

pub fn run(baseline: &str, candidate: &str, timeout: Duration, as_json: bool) -> ExitCode {
    let (a, b) = match (load(baseline, timeout), load(candidate, timeout)) {
        (Ok(a), Ok(b)) => (a, b),
        (Err(e), _) | (_, Err(e)) => {
            eprintln!("error: {e:#}");
            return ExitCode::from(2);
        }
    };
    let structural = diff::diff(&a.md, &b.md);
    // Judge "unversioned change" on structure, not raw bytes: PortaldotV3 metadata
    // embeds a storage default (Revive.EthBlockBuilderIR) that drifts with chain
    // state, so the sha256 changes between fetches of the same runtime.
    let silent = (!structural.is_empty() || a.side.apis != b.side.apis)
        && a.side.spec_version == b.side.spec_version
        && a.side.transaction_version == b.side.transaction_version;
    let mut changes = version_changes(&a.side, &b.side);
    changes.extend(structural);
    let hazards = diff::hazards(&changes);
    let identical = a.side.metadata.sha256 == b.side.metadata.sha256;

    if as_json {
        let out = json!({ "baseline": a.side, "candidate": b.side, "changes": changes,
                          "metadata_identical": identical, "unversioned_change": silent,
                          "upgrade_hazards": hazards });
        println!("{}", serde_json::to_string_pretty(&out).expect("serialises"));
    } else {
        println!("baseline   {}  spec {}#{}  metadata {}…", a.side.endpoint, a.side.spec_name.as_deref().unwrap_or("-"),
            a.side.spec_version.unwrap_or_default(), &a.side.metadata.sha256[..16]);
        println!("candidate  {}  spec {}#{}  metadata {}…", b.side.endpoint, b.side.spec_name.as_deref().unwrap_or("-"),
            b.side.spec_version.unwrap_or_default(), &b.side.metadata.sha256[..16]);
        println!("pallets    {} vs {}", a.md.modules.len(), b.md.modules.len());
        println!();
        if changes.is_empty() {
            println!("no structural changes{}", if identical { "" } else { " (metadata bytes differ only in docs/defaults)" });
        }
        for c in &changes {
            let tag = match c.kind { ChangeKind::Added => "+", ChangeKind::Removed => "-", ChangeKind::Modified => "~" };
            println!("{tag} {}", c.path);
            if let Some(x) = &c.baseline { println!("    baseline:  {x}"); }
            if let Some(y) = &c.candidate { println!("    candidate: {y}"); }
        }
        if silent {
            println!();
            println!("WARNING  runtime changed without a spec_version/transaction_version bump");
        }
        if !hazards.is_empty() {
            println!();
            for h in &hazards {
                println!("HAZARD   {}: {}", h.path, h.reason);
            }
            println!("         applying this candidate with setCode would halt the chain");
        }
        println!();
        println!("{} change(s)", changes.len());
    }
    if hazards.is_empty() { ExitCode::SUCCESS } else { ExitCode::from(1) }
}
