//! `canary upgrade`: apply a candidate runtime WASM to a dev node through
//! `sudo.sudoUncheckedWeight(system.setCode)`, then confirm the new runtime is live,
//! still producing blocks, and did not corrupt existing state.
//!
//! A runtime can be accepted by `setCode` and still brick the chain on the next
//! block (for example a changed BABE slot duration). "spec_version bumped" is not
//! enough, so the upgrade only counts once `LIVENESS_BLOCKS` further blocks land.
//!
//! A runtime can also keep producing blocks while its migration silently rewrites
//! balances. So every account and the supply invariant are snapshotted at a pinned
//! block before `setCode` and again after liveness, and the two are diffed.

use std::collections::{BTreeMap, BTreeSet};
use std::path::Path;
use std::process::ExitCode;
use std::time::{Duration, Instant};

use anyhow::{bail, Context};
use canary_chain::codec::{format_units, ss58};
use canary_chain::invariant::{self, Balances, Supply};
use canary_chain::rpc::WsRpc;
use serde::Serialize;
use serde_json::json;
use sha2::{Digest, Sha256};

use crate::invariants::connect;
use crate::runner::Driver;

/// Blocks that must be produced under the new runtime before the upgrade counts.
const LIVENESS_BLOCKS: u64 = 3;
const POT_DECIMALS: u32 = 14;
/// Generic Substrate SS58 prefix, used by Portaldot.
const SS58_PREFIX: u8 = 42;

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

#[derive(Serialize)]
struct Pinned {
    block_number: u64,
    block_hash: String,
    accounts: usize,
    decode_errors: usize,
    sum_free: String,
    sum_reserved: String,
    total_issuance: String,
    /// `sum(free + reserved) - TotalIssuance`, in planck.
    delta: String,
    supply_conservation: &'static str,
}

#[derive(Serialize)]
struct AccountChange {
    address: String,
    account_id: String,
    free_before: String,
    free_after: String,
    reserved_before: String,
    reserved_after: String,
    /// Change in `free + reserved`, in planck.
    total_delta: String,
}

#[derive(Serialize)]
struct StateCheck {
    before: Pinned,
    after: Pinned,
    changed_accounts: usize,
    reserved_changed: usize,
    /// Accounts whose balance moved across the upgrade, largest change first.
    changes: Vec<AccountChange>,
    verdict: &'static str,
    severity: Option<&'static str>,
    rationale: String,
}

#[derive(Serialize)]
struct Report {
    endpoint: String,
    wasm: String,
    wasm_sha256: String,
    spec_before: Option<u64>,
    spec_after: Option<u64>,
    tx_hash: Option<String>,
    liveness: String,
    state: Option<StateCheck>,
    verdict: &'static str,
}

fn signed(a: u128, b: u128) -> String {
    if a >= b { format!("+{}", a - b) } else { format!("-{}", b - a) }
}

fn pot(v: u128) -> String {
    format_units(v, POT_DECIMALS)
}

fn signed_pot(after: u128, before: u128) -> String {
    if after >= before { format!("+{}", pot(after - before)) } else { format!("-{}", pot(before - after)) }
}

type Accounts = BTreeMap<[u8; 32], Balances>;

fn pin(rpc: &mut WsRpc) -> anyhow::Result<(Pinned, Supply, Accounts)> {
    let hash = rpc
        .call("chain_getBlockHash", json!([]))?
        .as_str()
        .map(String::from)
        .context("no best block hash")?;
    let block_number = canary_chain::storage::block_number(rpc, &hash)?;
    let (s, accounts) = invariant::snapshot(rpc, &hash)?;
    let total = s.sum_free + s.sum_reserved;
    let p = Pinned {
        block_number,
        block_hash: hash,
        accounts: s.accounts,
        decode_errors: s.decode_errors,
        sum_free: s.sum_free.to_string(),
        sum_reserved: s.sum_reserved.to_string(),
        total_issuance: s.total_issuance.to_string(),
        delta: signed(total, s.total_issuance),
        supply_conservation: if s.decode_errors > 0 { "INCONCLUSIVE" } else if s.holds() { "PASS" } else { "FAIL" },
    };
    Ok((p, s, accounts))
}

fn diff(before: &Accounts, after: &Accounts) -> Vec<AccountChange> {
    let zero = Balances { free: 0, reserved: 0 };
    let ids: BTreeSet<&[u8; 32]> = before.keys().chain(after.keys()).collect();
    let mut out: Vec<(u128, AccountChange)> = ids
        .into_iter()
        .filter_map(|id| {
            let b = before.get(id).copied().unwrap_or(zero);
            let a = after.get(id).copied().unwrap_or(zero);
            if a == b {
                return None;
            }
            let (tb, ta) = (b.free + b.reserved, a.free + a.reserved);
            Some((
                tb.abs_diff(ta),
                AccountChange {
                    address: ss58(id, SS58_PREFIX),
                    account_id: format!("0x{}", hex::encode(id)),
                    free_before: b.free.to_string(),
                    free_after: a.free.to_string(),
                    reserved_before: b.reserved.to_string(),
                    reserved_after: a.reserved.to_string(),
                    total_delta: signed(ta, tb),
                },
            ))
        })
        .collect();
    out.sort_by(|x, y| y.0.cmp(&x.0));
    out.into_iter().map(|(_, c)| c).collect()
}

fn classify(before: &Supply, after: &Supply, changes: &[AccountChange]) -> (&'static str, Option<&'static str>, String) {
    let held = |s: &Supply| s.sum_free + s.sum_reserved;
    if before.decode_errors > 0 || after.decode_errors > 0 {
        return ("INCONCLUSIVE", None, "some System.Account entries did not decode".into());
    }
    if !before.holds() {
        return ("INCONCLUSIVE", None, "supply was already not conserved before the upgrade".into());
    }
    if after.holds() {
        return ("PASS", None, format!("supply conserved across the upgrade ({} accounts changed, all accounted for)", changes.len()));
    }
    let (h, ti) = (held(after), after.total_issuance);
    let what = if h < ti {
        format!("accounts now hold {} POT less than TotalIssuance: funds destroyed", pot(ti - h))
    } else {
        format!("accounts now hold {} POT more than TotalIssuance: funds created", pot(h - ti))
    };
    ("REGRESSION", Some("Critical"), format!("supply invariant broken by the upgrade; {what}"))
}

fn print_pinned(label: &str, p: &Pinned, s: &Supply) {
    println!(
        "{label} #{} supply_conservation {}  ({} accounts, issuance {} POT, held {} POT)",
        p.block_number,
        p.supply_conservation,
        p.accounts,
        pot(s.total_issuance),
        pot(s.sum_free + s.sum_reserved)
    );
}

fn print_state(st: &StateCheck, before: &Supply, after: &Supply) {
    print_pinned("state      before", &st.before, before);
    print_pinned("state      after ", &st.after, after);
    if st.changes.is_empty() {
        return;
    }
    println!("changed    {} accounts ({} with reserved moved):", st.changed_accounts, st.reserved_changed);
    let n = |s: &str| s.parse::<u128>().unwrap_or(0);
    for c in st.changes.iter().take(10) {
        let (fb, fa, rb, ra) = (n(&c.free_before), n(&c.free_after), n(&c.reserved_before), n(&c.reserved_after));
        let mut parts = Vec::new();
        if rb != ra {
            parts.push(format!("reserved {} -> {} ({})", pot(rb), pot(ra), signed_pot(ra, rb)));
        }
        if fb != fa {
            parts.push(format!("free {}", signed_pot(fa, fb)));
        }
        println!("  {}  {}", c.address, parts.join(", "));
    }
    if st.changes.len() > 10 {
        println!("  … {} more in the JSON report", st.changes.len() - 10);
    }
}

fn inner(ws: &str, wasm: &Path, driver: &Driver, timeout: Duration) -> anyhow::Result<Report> {
    let code = std::fs::read(wasm).with_context(|| format!("reading {}", wasm.display()))?;
    if code.len() < 8 {
        bail!("{} is too small to be a runtime", wasm.display());
    }
    let (before, chain) = spec(ws, timeout)?;
    if chain != "Development" && chain != "Local Testnet" {
        bail!("refusing to set code on non-development chain {chain:?}");
    }
    let wasm_sha256 = hex::encode(Sha256::digest(&code));
    println!("wasm       {} ({} bytes, sha256 {})", wasm.display(), code.len(), wasm_sha256);
    println!("before     spec_version {}", before.map(|v| v.to_string()).unwrap_or("-".into()));

    // State before the upgrade, pinned to one block.
    let mut rpc = connect(ws, timeout)?;
    let (pre, pre_supply, pre_accounts) = pin(&mut rpc).context("snapshotting state before the upgrade")?;
    drop(rpc);

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

    let mut report = Report {
        endpoint: ws.into(),
        wasm: wasm.display().to_string(),
        wasm_sha256,
        spec_before: before,
        spec_after: None,
        tx_hash: r.tx_hash.clone(),
        liveness: String::new(),
        state: None,
        verdict: "PASS",
    };

    // The new code takes effect from the next block.
    let deadline = Instant::now() + timeout;
    loop {
        let (now, _) = spec(ws, timeout)?;
        if now != before {
            println!("after      spec_version {}", now.map(|v| v.to_string()).unwrap_or("-".into()));
            report.spec_after = now;
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
            report.liveness = format!("ok (#{start} -> #{now} under the new runtime)");
            println!("liveness   {}", report.liveness);
            break;
        }
        if Instant::now() > deadline {
            report.liveness = format!(
                "HALTED: best block stuck at #{now} for {timeout:?} after the upgrade (needed #{}); check the node log for runtime panics",
                start + LIVENESS_BLOCKS
            );
            println!("liveness   {}", report.liveness);
            println!("verdict    REGRESSION Critical: runtime accepted by setCode but block production stopped");
            report.verdict = "REGRESSION";
            return Ok(report);
        }
        std::thread::sleep(Duration::from_secs(2));
    }

    // State after the upgrade: the migration has run by now.
    let mut rpc = connect(ws, timeout)?;
    let (post, post_supply, post_accounts) = pin(&mut rpc).context("snapshotting state after the upgrade")?;
    let changes = diff(&pre_accounts, &post_accounts);
    let reserved_changed = changes.iter().filter(|c| c.reserved_before != c.reserved_after).count();
    let (verdict, severity, rationale) = classify(&pre_supply, &post_supply, &changes);
    let st = StateCheck {
        before: pre,
        after: post,
        changed_accounts: changes.len(),
        reserved_changed,
        changes,
        verdict,
        severity,
        rationale,
    };
    print_state(&st, &pre_supply, &post_supply);
    match verdict {
        "REGRESSION" => println!("verdict    REGRESSION {}: {}", severity.unwrap_or("-"), st.rationale),
        "PASS" => println!("verdict    PASS: {}", st.rationale),
        v => println!("verdict    {v}: {}", st.rationale),
    }
    report.verdict = verdict;
    report.state = Some(st);
    Ok(report)
}

/// Exit codes: 0 upgraded, live, state conserved; 1 the chain halted or the migration
/// broke the supply invariant; 2 upgrade not applied or state not comparable.
pub fn run(ws: &str, wasm: &Path, driver: &Driver, timeout: Duration, out: Option<&Path>) -> ExitCode {
    match inner(ws, wasm, driver, timeout) {
        Ok(report) => {
            if let Some(path) = out {
                if let Some(dir) = path.parent().filter(|d| !d.as_os_str().is_empty()) {
                    let _ = std::fs::create_dir_all(dir);
                }
                match std::fs::write(path, serde_json::to_string_pretty(&report).expect("serialises")) {
                    Ok(()) => println!("saved      {}", path.display()),
                    Err(e) => eprintln!("error writing {}: {e}", path.display()),
                }
            }
            match report.verdict {
                "PASS" => ExitCode::SUCCESS,
                "REGRESSION" => ExitCode::from(1),
                _ => ExitCode::from(2),
            }
        }
        Err(e) => {
            eprintln!("error: {e:#}");
            ExitCode::from(2)
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn supply(free: u128, reserved: u128, ti: u128) -> Supply {
        Supply { accounts: 1, decode_errors: 0, sum_free: free, sum_reserved: reserved, total_issuance: ti }
    }

    #[test]
    fn halved_reserve_is_a_critical_regression() {
        let id = [1u8; 32];
        let before: Accounts = [(id, Balances { free: 100, reserved: 50 })].into();
        let after: Accounts = [(id, Balances { free: 100, reserved: 25 })].into();
        let changes = diff(&before, &after);
        assert_eq!(changes.len(), 1);
        assert_eq!(changes[0].total_delta, "-25");
        let (v, sev, why) = classify(&supply(100, 50, 150), &supply(100, 25, 150), &changes);
        assert_eq!((v, sev), ("REGRESSION", Some("Critical")));
        assert!(why.contains("destroyed"), "{why}");
    }

    #[test]
    fn fees_moving_between_accounts_conserve_supply() {
        let (a, b) = ([1u8; 32], [2u8; 32]);
        let before: Accounts = [(a, Balances { free: 100, reserved: 0 }), (b, Balances { free: 0, reserved: 0 })].into();
        let after: Accounts = [(a, Balances { free: 90, reserved: 0 }), (b, Balances { free: 10, reserved: 0 })].into();
        let changes = diff(&before, &after);
        assert_eq!(changes.len(), 2);
        assert_eq!(classify(&supply(100, 0, 100), &supply(100, 0, 100), &changes).0, "PASS");
    }

    #[test]
    fn pre_existing_imbalance_is_inconclusive() {
        assert_eq!(classify(&supply(90, 0, 100), &supply(90, 0, 100), &[]).0, "INCONCLUSIVE");
    }
}
