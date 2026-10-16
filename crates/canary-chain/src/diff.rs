//! Structural diff between two V13 runtimes.

use std::collections::BTreeMap;

use serde::Serialize;

use crate::metadata_v13::{MetadataV13, Module};

#[derive(Debug, Clone, Copy, Serialize, PartialEq, Eq, PartialOrd, Ord)]
#[serde(rename_all = "snake_case")]
pub enum ChangeKind {
    Added,
    Removed,
    Modified,
}

#[derive(Debug, Clone, Serialize)]
pub struct Change {
    pub kind: ChangeKind,
    /// e.g. `Balances.constant.ExistentialDeposit`
    pub path: String,
    pub baseline: Option<String>,
    pub candidate: Option<String>,
}

fn diff_maps(prefix: &str, a: BTreeMap<String, String>, b: BTreeMap<String, String>, out: &mut Vec<Change>) {
    for (k, va) in &a {
        match b.get(k) {
            None => out.push(Change {
                kind: ChangeKind::Removed,
                path: format!("{prefix}.{k}"),
                baseline: Some(va.clone()),
                candidate: None,
            }),
            Some(vb) if vb != va => out.push(Change {
                kind: ChangeKind::Modified,
                path: format!("{prefix}.{k}"),
                baseline: Some(va.clone()),
                candidate: Some(vb.clone()),
            }),
            _ => {}
        }
    }
    for (k, vb) in b {
        if !a.contains_key(&k) {
            out.push(Change { kind: ChangeKind::Added, path: format!("{prefix}.{k}"), baseline: None, candidate: Some(vb) });
        }
    }
}

/// `ty = 0x..` plus the little-endian integer when the value is a plain 1/2/4/8/16-byte number.
pub fn render_constant(ty: &str, value_hex: &str) -> String {
    let bytes = hex::decode(value_hex.trim_start_matches("0x")).unwrap_or_default();
    let int = match bytes.len() {
        1 | 2 | 4 | 8 | 16 => {
            let mut buf = [0u8; 16];
            buf[..bytes.len()].copy_from_slice(&bytes);
            Some(u128::from_le_bytes(buf))
        }
        _ => None,
    };
    match int {
        Some(n) => format!("{ty} = {n} ({value_hex})"),
        None => format!("{ty} = {value_hex}"),
    }
}

fn calls(m: &Module) -> BTreeMap<String, String> {
    m.calls
        .iter()
        .flatten()
        .enumerate()
        .map(|(i, c)| {
            let args: Vec<String> = c.args.iter().map(|(n, t)| format!("{n}: {t}")).collect();
            (c.name.clone(), format!("#{i}({})", args.join(", ")))
        })
        .collect()
}

fn events(m: &Module) -> BTreeMap<String, String> {
    m.events
        .iter()
        .flatten()
        .enumerate()
        .map(|(i, e)| (e.name.clone(), format!("#{i}({})", e.args.join(", "))))
        .collect()
}

fn diff_module(a: &Module, b: &Module, out: &mut Vec<Change>) {
    let p = &a.name;
    if a.index != b.index {
        out.push(Change {
            kind: ChangeKind::Modified,
            path: format!("{p}.index"),
            baseline: Some(a.index.to_string()),
            candidate: Some(b.index.to_string()),
        });
    }
    diff_maps(&format!("{p}.call"), calls(a), calls(b), out);
    diff_maps(&format!("{p}.event"), events(a), events(b), out);
    diff_maps(
        &format!("{p}.storage"),
        a.storage.iter().map(|s| (s.name.clone(), s.shape.clone())).collect(),
        b.storage.iter().map(|s| (s.name.clone(), s.shape.clone())).collect(),
        out,
    );
    diff_maps(
        &format!("{p}.constant"),
        a.constants.iter().map(|c| (c.name.clone(), render_constant(&c.ty, &c.value))).collect(),
        b.constants.iter().map(|c| (c.name.clone(), render_constant(&c.ty, &c.value))).collect(),
        out,
    );
    let errs = |m: &Module| -> BTreeMap<String, String> {
        m.errors.iter().enumerate().map(|(i, e)| (e.clone(), format!("#{i}"))).collect()
    };
    diff_maps(&format!("{p}.error"), errs(a), errs(b), out);
}

pub fn diff(a: &MetadataV13, b: &MetadataV13) -> Vec<Change> {
    let mut out = Vec::new();
    for ma in &a.modules {
        match b.module(&ma.name) {
            Some(mb) => diff_module(ma, mb, &mut out),
            None => out.push(Change {
                kind: ChangeKind::Removed,
                path: ma.name.clone(),
                baseline: Some(format!("pallet #{}", ma.index)),
                candidate: None,
            }),
        }
    }
    for mb in &b.modules {
        if a.module(&mb.name).is_none() {
            out.push(Change {
                kind: ChangeKind::Added,
                path: mb.name.clone(),
                baseline: None,
                candidate: Some(format!("pallet #{}", mb.index)),
            });
        }
    }
    if a.signed_extensions != b.signed_extensions {
        out.push(Change {
            kind: ChangeKind::Modified,
            path: "extrinsic.signed_extensions".into(),
            baseline: Some(a.signed_extensions.join(", ")),
            candidate: Some(b.signed_extensions.join(", ")),
        });
    }
    out
}

/// A change that is known to break a running chain when applied with `setCode`,
/// regardless of what the workflows observe.
#[derive(Debug, Clone, Serialize)]
pub struct Hazard {
    pub path: String,
    pub reason: &'static str,
}

/// Constants that cannot change on a live BABE chain. The Substrate source itself warns
/// that changing slot or epoch duration "will brick block production".
const BRICKING: &[(&str, &str)] = &[
    ("Babe.constant.EpochDuration", "BABE epoch duration cannot change on a running chain; block production halts"),
    ("Babe.constant.ExpectedBlockTime", "BABE slot duration cannot change on a running chain; block production halts"),
    ("Timestamp.constant.MinimumPeriod", "timestamp period is tied to the BABE slot; a change breaks slot/timestamp checks"),
];

pub fn hazards(changes: &[Change]) -> Vec<Hazard> {
    changes
        .iter()
        .filter(|c| c.kind == ChangeKind::Modified)
        .filter_map(|c| BRICKING.iter().find(|(p, _)| *p == c.path).map(|(p, r)| Hazard { path: (*p).into(), reason: r }))
        .collect()
}

#[cfg(test)]
mod hazard_tests {
    use super::*;

    fn modified(path: &str) -> Change {
        Change { kind: ChangeKind::Modified, path: path.into(), baseline: Some("a".into()), candidate: Some("b".into()) }
    }

    #[test]
    fn slot_duration_change_is_a_hazard() {
        let h = hazards(&[modified("Babe.constant.ExpectedBlockTime"), modified("Balances.constant.ExistentialDeposit")]);
        assert_eq!(h.len(), 1);
        assert_eq!(h[0].path, "Babe.constant.ExpectedBlockTime");
    }

    #[test]
    fn ordinary_constant_change_is_not_a_hazard() {
        assert!(hazards(&[modified("Balances.constant.ExistentialDeposit")]).is_empty());
    }
}
