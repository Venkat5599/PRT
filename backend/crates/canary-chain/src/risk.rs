//! Compatibility risks: what in a runtime diff breaks something, and for whom.
//!
//! The diff lists every difference; this module judges them. Each risk names the rule that fired,
//! a severity, why it matters, and the exact diff rows (before/after) it is based on. Risks are
//! grouped per pallet so a large upgrade reads as a short list.

use std::collections::BTreeMap;

use serde::Serialize;

use crate::compare::Side;
use crate::diff::{Change, ChangeKind, BRICKING};

#[derive(Debug, Clone, Copy, Serialize, PartialEq, Eq, PartialOrd, Ord)]
#[serde(rename_all = "snake_case")]
pub enum Severity {
    /// The upgrade cannot be applied, or the chain stops when it is.
    Critical,
    /// Applies, but something already signed or encoded stops working.
    Breaking,
    /// Existing on-chain data needs a migration to stay readable.
    Migration,
    /// The chain behaves differently (fees, deposits, limits).
    Behaviour,
    /// Apps, wallets or indexers that decode this runtime must update.
    Client,
}

#[derive(Debug, Clone, Serialize)]
pub struct Risk {
    pub rule: &'static str,
    pub severity: Severity,
    pub title: String,
    pub why: &'static str,
    pub evidence: Vec<Change>,
}

fn kind_of(path: &str) -> Option<&str> {
    path.split('.').nth(1)
}
fn pallet_of(path: &str) -> &str {
    path.split('.').next().unwrap_or(path)
}

struct Builder {
    risks: BTreeMap<(Severity, &'static str, String), (String, &'static str, Vec<Change>)>,
}
impl Builder {
    fn add(&mut self, sev: Severity, rule: &'static str, group: &str, title: impl FnOnce(usize) -> String, why: &'static str, c: &Change) {
        let e = self.risks.entry((sev, rule, group.to_string())).or_insert_with(|| (String::new(), why, Vec::new()));
        e.2.push(c.clone());
        e.0 = title(e.2.len());
    }
}

fn plural(n: usize, one: &str, many: &str) -> String {
    format!("{n} {}", if n == 1 { one } else { many })
}

pub fn assess(a: &Side, b: &Side, changes: &[Change]) -> Vec<Risk> {
    let mut out = Vec::new();
    let any_change = !changes.is_empty();

    // setCode itself refuses these (frame_system::can_set_code).
    if any_change && a.spec_name.is_some() && a.spec_name != b.spec_name {
        out.push(Risk {
            rule: "spec-name",
            severity: Severity::Critical,
            title: format!("Different runtime: {} → {}", a.spec_name.as_deref().unwrap_or("?"), b.spec_name.as_deref().unwrap_or("?")),
            why: "setCode rejects a runtime with a different spec_name (InvalidSpecName); this cannot be applied as an upgrade of the baseline chain",
            evidence: changes.iter().filter(|c| c.path == "runtime.spec_name").cloned().collect(),
        });
    } else if any_change && matches!((a.spec_version, b.spec_version), (Some(x), Some(y)) if y <= x) {
        let ev: Vec<Change> = changes.iter().filter(|c| c.path == "runtime.spec_version").cloned().collect();
        out.push(Risk {
            rule: "spec-version",
            severity: Severity::Critical,
            title: format!("spec_version does not increase ({} → {})", a.spec_version.unwrap_or(0), b.spec_version.unwrap_or(0)),
            why: "setCode rejects a runtime whose spec_version is not greater than the running one (SpecVersionNeedsToIncrease)",
            evidence: if ev.is_empty() { changes.iter().take(3).cloned().collect() } else { ev },
        });
    }

    let tx_bumped = a.transaction_version != b.transaction_version;
    let mut g = Builder { risks: BTreeMap::new() };
    for c in changes {
        let p = pallet_of(&c.path);
        if BRICKING.iter().any(|(path, _)| *path == c.path) && c.kind == ChangeKind::Modified {
            g.add(Severity::Critical, "consensus-constant", p, |_| format!("{p}: consensus timing changes"),
                "BABE slot and epoch timing cannot change on a running chain; block production stops", c);
            continue;
        }
        // Anything that changes how a signed extrinsic is encoded.
        let encoding = match (kind_of(&c.path), c.kind) {
            (Some("index"), _) => true,
            (None, ChangeKind::Removed) => c.path != "runtime" && !c.path.starts_with("runtime.") && !c.path.starts_with("extrinsic."),
            (Some("call"), ChangeKind::Removed) => true,
            (Some("call"), ChangeKind::Modified) => true,
            (Some("signed_extensions"), _) => c.path == "extrinsic.signed_extensions",
            _ => false,
        };
        if encoding {
            if tx_bumped {
                g.add(Severity::Client, "call-encoding", p, |n| format!("{p}: {} encode differently", plural(n, "call or index", "calls or indices")),
                    "transaction_version was bumped, so wallets know to re-read metadata; anything with hard-coded call indices must update", c);
            } else {
                g.add(Severity::Breaking, "call-encoding", p, |n| format!("{p}: {} change encoding without a transaction_version bump", plural(n, "call", "calls")),
                    "wallets and signers that cached the old metadata will build transactions the new runtime decodes as a different call or rejects", c);
            }
            continue;
        }
        match (kind_of(&c.path), c.kind) {
            (Some("storage"), ChangeKind::Modified) => g.add(Severity::Migration, "storage-type", p,
                |n| format!("{p}: {} change type", plural(n, "storage item", "storage items")),
                "values already in state were written with the old type; without a migration they fail to decode or decode wrongly", c),
            (Some("storage"), ChangeKind::Removed) => g.add(Severity::Migration, "storage-removed", p,
                |n| format!("{p}: {} removed", plural(n, "storage item", "storage items")),
                "the data stays in state unless a migration clears it; anything reading it gets nothing back", c),
            (Some("constant"), ChangeKind::Modified) => g.add(Severity::Behaviour, "constant", p,
                |n| format!("{p}: {} change value", plural(n, "constant", "constants")),
                "the chain behaves differently after the upgrade (fees, deposits, limits); accounts and apps tuned to the old value are affected", c),
            (Some("event"), ChangeKind::Removed | ChangeKind::Modified) => g.add(Severity::Client, "event", p,
                |n| format!("{p}: {} removed or changed", plural(n, "event", "events")),
                "indexers and apps that decode these events must update", c),
            (Some("error"), ChangeKind::Removed | ChangeKind::Modified) => g.add(Severity::Client, "error", p,
                |n| format!("{p}: {} removed or renumbered", plural(n, "error", "errors")),
                "clients map dispatch errors by index; a renumbered error is reported as a different one", c),
            (Some("api"), ChangeKind::Removed | ChangeKind::Modified) if c.path.starts_with("runtime.api.") => g.add(Severity::Client, "runtime-api", "runtime",
                |n| format!("{} removed or changed version", plural(n, "runtime API", "runtime APIs")),
                "nodes, wallets and tools that call these runtime APIs get an error or a different encoding", c),
            _ => {}
        }
    }
    for ((severity, rule, _), (title, why, evidence)) in g.risks {
        out.push(Risk { rule, severity, title, why, evidence });
    }
    out.sort_by(|x, y| x.severity.cmp(&y.severity).then(y.evidence.len().cmp(&x.evidence.len())));
    out
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::metadata::Fingerprint;

    fn side(name: &str, spec: u64, tx: u64) -> Side {
        Side {
            endpoint: "x".into(),
            spec_name: Some(name.into()),
            spec_version: Some(spec),
            transaction_version: Some(tx),
            genesis_hash: None,
            metadata: Fingerprint { version: 14, size_bytes: 0, sha256: String::new() },
            apis: vec![],
            pallets: 0,
        }
    }
    fn ch(kind: ChangeKind, path: &str, a: Option<&str>, b: Option<&str>) -> Change {
        Change { kind, path: path.into(), baseline: a.map(String::from), candidate: b.map(String::from) }
    }
    fn rules(r: &[Risk]) -> Vec<(&str, Severity)> {
        r.iter().map(|x| (x.rule, x.severity)).collect()
    }

    #[test]
    fn spec_version_must_increase() {
        let c = [ch(ChangeKind::Modified, "Balances.constant.ExistentialDeposit", Some("1"), Some("100"))];
        let r = assess(&side("portaldot", 1003, 2), &side("portaldot", 1003, 2), &c);
        assert_eq!(r[0].rule, "spec-version");
        assert_eq!(r[0].severity, Severity::Critical);
    }

    #[test]
    fn different_spec_name_cannot_be_applied() {
        let c = [ch(ChangeKind::Modified, "runtime.spec_name", Some("\"portaldot\""), Some("\"portaldot-v3\""))];
        let r = assess(&side("portaldot", 1, 1), &side("portaldot-v3", 2, 1), &c);
        assert_eq!(rules(&r), vec![("spec-name", Severity::Critical)]);
        assert_eq!(r[0].evidence.len(), 1);
    }

    #[test]
    fn identical_runtimes_have_no_risk() {
        assert!(assess(&side("portaldot", 1003, 2), &side("portaldot", 1003, 2), &[]).is_empty());
    }

    #[test]
    fn consensus_timing_is_critical() {
        let c = [ch(ChangeKind::Modified, "Babe.constant.ExpectedBlockTime", Some("6000"), Some("60000"))];
        let r = assess(&side("p", 1, 1), &side("p", 2, 1), &c);
        assert_eq!(rules(&r), vec![("consensus-constant", Severity::Critical)]);
    }

    #[test]
    fn moved_call_without_tx_bump_is_breaking() {
        let c = [ch(ChangeKind::Modified, "Balances.call.transfer", Some("#0(dest: X)"), Some("#3(dest: X)"))];
        let r = assess(&side("p", 1, 2), &side("p", 2, 2), &c);
        assert_eq!(rules(&r), vec![("call-encoding", Severity::Breaking)]);
        let r = assess(&side("p", 1, 2), &side("p", 2, 3), &c);
        assert_eq!(rules(&r), vec![("call-encoding", Severity::Client)]);
    }

    #[test]
    fn pallet_index_and_removed_pallet_are_encoding_changes() {
        let c = [
            ch(ChangeKind::Modified, "Assets.index", Some("12"), Some("13")),
            ch(ChangeKind::Removed, "Sudo", Some("pallet #9"), None),
        ];
        let r = assess(&side("p", 1, 2), &side("p", 2, 2), &c);
        assert_eq!(r.len(), 2);
        assert!(r.iter().all(|x| x.rule == "call-encoding" && x.severity == Severity::Breaking));
    }

    #[test]
    fn storage_type_change_needs_migration() {
        let c = [
            ch(ChangeKind::Modified, "Identity.storage.IdentityOf", Some("Map<A, B>"), Some("Map<A, C>")),
            ch(ChangeKind::Modified, "Identity.storage.SuperOf", Some("Map<A, B>"), Some("Map<A, D>")),
        ];
        let r = assess(&side("p", 1, 1), &side("p", 2, 1), &c);
        assert_eq!(rules(&r), vec![("storage-type", Severity::Migration)]);
        assert_eq!(r[0].title, "Identity: 2 storage items change type");
        assert_eq!(r[0].evidence.len(), 2);
    }

    #[test]
    fn constants_events_errors_apis() {
        let c = [
            ch(ChangeKind::Modified, "Balances.constant.ExistentialDeposit", Some("1"), Some("100")),
            ch(ChangeKind::Removed, "Balances.event.Dust", Some("#0"), None),
            ch(ChangeKind::Modified, "Balances.error.TooLow", Some("#1"), Some("#2")),
            ch(ChangeKind::Removed, "runtime.api.BabeApi", Some("2"), None),
        ];
        let r = assess(&side("p", 1, 1), &side("p", 2, 1), &c);
        let got = rules(&r);
        assert!(got.contains(&("constant", Severity::Behaviour)));
        assert!(got.contains(&("event", Severity::Client)));
        assert!(got.contains(&("error", Severity::Client)));
        assert!(got.contains(&("runtime-api", Severity::Client)));
        assert_eq!(r[0].severity, Severity::Behaviour);
    }

    #[test]
    fn additions_alone_carry_no_risk() {
        let c = [
            ch(ChangeKind::Added, "Balances.call.burn", None, Some("#9(value: u128)")),
            ch(ChangeKind::Added, "NewPallet", None, Some("pallet #40")),
            ch(ChangeKind::Added, "runtime.api.NewApi", None, Some("1")),
        ];
        assert!(assess(&side("p", 1, 1), &side("p", 2, 1), &c).is_empty());
    }
}
