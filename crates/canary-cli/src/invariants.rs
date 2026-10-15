//! `canary invariants`: read-only checks on live chain state, pinned to one block.
//!
//! Supply conservation: the sum of `free + reserved` across every
//! `System.Account` entry must equal `Balances.TotalIssuance`.

use std::collections::BTreeMap;
use std::process::ExitCode;
use std::time::Duration;

use anyhow::{anyhow, Context};
use canary_chain::codec::{self, AccountInfoLayout};
use canary_chain::{endpoint, rpc::WsRpc, storage};
use serde::Serialize;
use serde_json::json;
use url::Url;

const POT_DECIMALS: u32 = 14;

#[derive(Serialize)]
struct SupplyReport {
    endpoint: String,
    block_hash: String,
    block_number: u64,
    accounts: usize,
    layouts: BTreeMap<String, usize>,
    decode_errors: usize,
    sum_free: String,
    sum_reserved: String,
    sum_total: String,
    total_issuance: String,
    delta: String,
    verdict: &'static str,
}

pub fn connect(raw: &str, timeout: Duration) -> anyhow::Result<WsRpc> {
    let url = Url::parse(raw)?;
    let target = endpoint::Target::from_url(&url)?;
    match endpoint::probe(&target, timeout) {
        (_, Some(stream)) => WsRpc::handshake(&url, stream, timeout),
        (reach, None) => Err(anyhow!("{raw} unreachable: {}", serde_json::to_string(&reach)?)),
    }
}

fn signed_delta(a: u128, b: u128) -> String {
    if a >= b { format!("+{}", a - b) } else { format!("-{}", b - a) }
}

fn supply(ws: &str, at: Option<String>, timeout: Duration) -> anyhow::Result<SupplyReport> {
    let mut rpc = connect(ws, timeout)?;
    let at = match at {
        Some(h) => h,
        None => {
            let finalized = storage::finalized_head(&mut rpc)?;
            if storage::block_number(&mut rpc, &finalized)? == 0 {
                // Single-node dev chains may never finalize; genesis would hide all activity.
                eprintln!("note: finalized head is genesis; using best block instead");
                rpc.call("chain_getBlockHash", json!([]))?
                    .as_str()
                    .map(String::from)
                    .ok_or_else(|| anyhow!("no best block hash"))?
            } else {
                finalized
            }
        }
    };
    let block_number = storage::block_number(&mut rpc, &at)?;

    let ti_bytes = storage::get(&mut rpc, &storage::prefix("Balances", "TotalIssuance"), &at)?
        .context("Balances.TotalIssuance is empty")?;
    let total_issuance = codec::decode_u128(&ti_bytes)?;

    eprintln!("reading System.Account at #{block_number} ({at})");
    let entries = storage::iter_prefix(&mut rpc, &storage::prefix("System", "Account"), &at, 1000, |n| {
        eprint!("\r  {n} accounts");
    })?;
    eprintln!();

    let (mut free, mut reserved, mut errors) = (0u128, 0u128, 0usize);
    let mut layouts: BTreeMap<String, usize> = BTreeMap::new();
    for (_key, value) in &entries {
        match codec::decode_account_info(value) {
            Ok(info) => {
                free += info.free;
                reserved += info.reserved;
                let name = match info.layout {
                    AccountInfoLayout::RefCount => "ref_count",
                    AccountInfoLayout::ConsumersProviders => "consumers_providers",
                    AccountInfoLayout::WithSufficients => "with_sufficients",
                };
                *layouts.entry(name.into()).or_default() += 1;
            }
            Err(_) => errors += 1,
        }
    }
    let total = free + reserved;
    let verdict = if errors > 0 {
        "INCONCLUSIVE"
    } else if total == total_issuance {
        "PASS"
    } else {
        "FAIL"
    };

    Ok(SupplyReport {
        endpoint: ws.into(),
        block_hash: at,
        block_number,
        accounts: entries.len(),
        layouts,
        decode_errors: errors,
        sum_free: free.to_string(),
        sum_reserved: reserved.to_string(),
        sum_total: total.to_string(),
        total_issuance: total_issuance.to_string(),
        delta: signed_delta(total, total_issuance),
        verdict,
    })
}

fn pot(raw: &str) -> String {
    raw.parse::<u128>().map(|v| codec::format_units(v, POT_DECIMALS)).unwrap_or_else(|_| raw.into())
}

pub fn run(ws: &str, at: Option<String>, timeout: Duration, as_json: bool) -> ExitCode {
    let report = match supply(ws, at, timeout) {
        Ok(r) => r,
        Err(e) => {
            eprintln!("error: {e:#}");
            return ExitCode::from(2);
        }
    };
    if as_json {
        println!("{}", serde_json::to_string_pretty(&json!({ "supply_conservation": report })).expect("serialises"));
    } else {
        println!("invariant  supply_conservation  ({})", report.endpoint);
        println!("  block           #{} {}", report.block_number, report.block_hash);
        println!("  accounts        {} (layouts: {:?}, decode errors: {})", report.accounts, report.layouts, report.decode_errors);
        println!("  sum free        {} POT", pot(&report.sum_free));
        println!("  sum reserved    {} POT", pot(&report.sum_reserved));
        println!("  sum total       {} POT", pot(&report.sum_total));
        println!("  total issuance  {} POT", pot(&report.total_issuance));
        println!("  delta           {} planck", report.delta);
        println!("  verdict         {}", report.verdict);
    }
    match report.verdict {
        "PASS" => ExitCode::SUCCESS,
        "FAIL" => ExitCode::from(1),
        _ => ExitCode::from(2),
    }
}
