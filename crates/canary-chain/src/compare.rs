//! Compare two runtimes from what their nodes return over RPC.
//!
//! Pure: callers fetch `state_getRuntimeVersion`, `state_getMetadata` and the
//! genesis hash themselves. The CLI does that over a native WebSocket, the
//! website does it from the browser and runs this through the wasm build.

use serde::Serialize;
use serde_json::{json, Value};

use crate::diff::{self, Change, ChangeKind, Hazard};
use crate::{apis, metadata, metadata_v13::MetadataV13, metadata_v14};

#[derive(Debug, Clone, Serialize)]
pub struct Side {
    pub endpoint: String,
    pub spec_name: Option<String>,
    pub spec_version: Option<u64>,
    pub transaction_version: Option<u64>,
    pub genesis_hash: Option<String>,
    pub metadata: metadata::Fingerprint,
    pub apis: Vec<String>,
    pub pallets: usize,
}

pub struct Runtime {
    pub side: Side,
    pub md: MetadataV13,
}

impl Runtime {
    /// `runtime_version` is the raw `state_getRuntimeVersion` result.
    pub fn new(endpoint: &str, runtime_version: &Value, metadata_bytes: &[u8], genesis_hash: Option<String>) -> anyhow::Result<Self> {
        let fp = metadata::fingerprint(metadata_bytes)?;
        let md = metadata_v14::decode_any(metadata_bytes)?;
        let api_list = apis::detect(&runtime_version["apis"])
            .into_iter()
            .map(|a| format!("{}@{}", a.name.unwrap_or(a.id), a.version))
            .collect();
        Ok(Runtime {
            side: Side {
                endpoint: endpoint.into(),
                spec_name: runtime_version["specName"].as_str().map(String::from),
                spec_version: runtime_version["specVersion"].as_u64(),
                transaction_version: runtime_version["transactionVersion"].as_u64(),
                genesis_hash,
                metadata: fp,
                apis: api_list,
                pallets: md.modules.len(),
            },
            md,
        })
    }
}

#[derive(Debug, Clone, Serialize)]
pub struct Comparison {
    pub baseline: Side,
    pub candidate: Side,
    pub changes: Vec<Change>,
    pub metadata_identical: bool,
    pub unversioned_change: bool,
    pub upgrade_hazards: Vec<Hazard>,
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

pub fn compare(a: &Runtime, b: &Runtime) -> Comparison {
    let structural = diff::diff(&a.md, &b.md);
    // Judge "unversioned change" on structure, not raw bytes: PortaldotV3 metadata
    // embeds a storage default (Revive.EthBlockBuilderIR) that drifts with chain
    // state, so the sha256 changes between fetches of the same runtime.
    let unversioned_change = (!structural.is_empty() || a.side.apis != b.side.apis)
        && a.side.spec_version == b.side.spec_version
        && a.side.transaction_version == b.side.transaction_version;
    let mut changes = version_changes(&a.side, &b.side);
    changes.extend(structural);
    let upgrade_hazards = diff::hazards(&changes);
    Comparison {
        metadata_identical: a.side.metadata.sha256 == b.side.metadata.sha256,
        baseline: a.side.clone(),
        candidate: b.side.clone(),
        changes,
        unversioned_change,
        upgrade_hazards,
    }
}
