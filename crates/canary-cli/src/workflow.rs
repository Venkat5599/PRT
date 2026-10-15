//! Workflow corpus: YAML files describing setup, steps and expectations.

use std::path::{Path, PathBuf};

use anyhow::Context;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use sha2::{Digest, Sha256};

#[derive(Debug, Clone, Copy, Deserialize, Serialize, PartialEq, Eq, Default)]
#[serde(rename_all = "snake_case")]
pub enum Importance {
    Core,
    #[default]
    Normal,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct Fund {
    pub account: String,
    pub amount: String,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct Step {
    pub call: String,
    pub signer: String,
    #[serde(default)]
    pub args: Value,
    #[serde(default)]
    pub sudo: bool,
}

#[derive(Debug, Clone, Copy, Deserialize, Serialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum Field {
    Free,
    Reserved,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
#[serde(rename_all = "snake_case")]
pub enum Expect {
    /// Outcome of step N: `success`, `failed` (dispatched, errored) or `rejected` (never included).
    Dispatch { step: usize, status: String, #[serde(default)] error: Option<String> },
    /// Change of an account balance field between pre- and post-state, as a signed integer.
    Delta {
        account: String,
        field: Field,
        #[serde(default)]
        eq: Option<String>,
        #[serde(default)]
        gt: Option<String>,
        #[serde(default)]
        lt: Option<String>,
    },
    /// Event emitted by step N (or required to be absent).
    Event { step: usize, name: String, #[serde(default)] absent: bool },
    /// Named state invariant evaluated on the post-state.
    Invariant(String),
}

impl Expect {
    pub fn describe(&self) -> String {
        match self {
            Expect::Dispatch { step, status, error } => match error {
                Some(e) => format!("step {step} dispatch {status} ({e})"),
                None => format!("step {step} dispatch {status}"),
            },
            Expect::Delta { account, field, eq, gt, lt } => {
                let field = match field { Field::Free => "free", Field::Reserved => "reserved" };
                let op = eq.as_ref().map(|v| format!("== {v}"))
                    .or(gt.as_ref().map(|v| format!("> {v}")))
                    .or(lt.as_ref().map(|v| format!("< {v}")))
                    .unwrap_or_else(|| "observed".into());
                format!("delta {account}.{field} {op}")
            }
            Expect::Event { step, name, absent } => {
                format!("step {step} event {name} {}", if *absent { "absent" } else { "present" })
            }
            Expect::Invariant(n) => format!("invariant {n}"),
        }
    }

    /// Ranking used for severity when this expectation regresses.
    pub fn kind(&self) -> &'static str {
        match self {
            Expect::Dispatch { .. } => "dispatch",
            Expect::Delta { .. } => "delta",
            Expect::Event { .. } => "event",
            Expect::Invariant(_) => "invariant",
        }
    }
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct Workflow {
    pub id: String,
    #[serde(default)]
    pub description: String,
    #[serde(default)]
    pub importance: Importance,
    #[serde(default)]
    pub accounts: Vec<String>,
    #[serde(default)]
    pub fund: Vec<Fund>,
    pub steps: Vec<Step>,
    pub expect: Vec<Expect>,
    /// Balance deltas that differ by at most this many parts per million are treated as
    /// equal. Absorbs per-block fee-multiplier drift; real fee changes are far larger.
    #[serde(default = "default_tolerance_ppm")]
    pub delta_tolerance_ppm: u64,
}

fn default_tolerance_ppm() -> u64 {
    1
}

/// YAML -> JSON value -> typed, so enums are written as `- dispatch: {...}`
/// maps (serde's externally tagged form) instead of YAML `!tags`.
pub fn parse(raw: &[u8]) -> anyhow::Result<Workflow> {
    let value: Value = serde_yaml::from_slice(raw)?;
    Ok(serde_json::from_value(value)?)
}

#[derive(Debug, Clone, Serialize)]
pub struct Loaded {
    pub path: PathBuf,
    pub sha256: String,
    pub workflow: Workflow,
}

pub fn load_file(path: &Path) -> anyhow::Result<Loaded> {
    let raw = std::fs::read(path).with_context(|| format!("reading {}", path.display()))?;
    let workflow = parse(&raw).with_context(|| format!("parsing {}", path.display()))?;
    Ok(Loaded { path: path.to_path_buf(), sha256: hex::encode(Sha256::digest(&raw)), workflow })
}

/// A single file, or every `*.yaml`/`*.yml` in a directory, sorted for a stable order.
pub fn load_suite(path: &Path) -> anyhow::Result<Vec<Loaded>> {
    if path.is_file() {
        return Ok(vec![load_file(path)?]);
    }
    let mut files: Vec<PathBuf> = std::fs::read_dir(path)
        .with_context(|| format!("reading suite {}", path.display()))?
        .filter_map(|e| e.ok().map(|e| e.path()))
        .filter(|p| matches!(p.extension().and_then(|e| e.to_str()), Some("yaml" | "yml")))
        .collect();
    files.sort();
    files.iter().map(|p| load_file(p)).collect()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parses_full_schema() {
        let y = r#"
id: t
importance: core
accounts: [a, b]
fund: [{ account: a, amount: "10" }]
steps:
  - call: Balances.transfer
    signer: a
    args: { dest: b, value: "1" }
expect:
  - dispatch: { step: 0, status: success }
  - delta: { account: b, field: free, eq: "1" }
  - event: { step: 0, name: balances.Transfer }
  - invariant: supply_conservation
"#;
        let w = parse(y.as_bytes()).unwrap();
        assert_eq!(w.importance, Importance::Core);
        assert_eq!(w.expect.len(), 4);
        assert_eq!(w.expect[1].describe(), "delta b.free == 1");
        assert_eq!(w.expect[3].kind(), "invariant");
    }
}
