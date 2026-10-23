//! Reusable state invariants evaluated at a pinned block.

use anyhow::Context;
use serde::Serialize;

use crate::codec;
use crate::rpc::WsRpc;
use crate::storage;

#[derive(Debug, Clone, Serialize)]
pub struct Supply {
    pub accounts: usize,
    pub decode_errors: usize,
    pub sum_free: u128,
    pub sum_reserved: u128,
    pub total_issuance: u128,
}

impl Supply {
    pub fn holds(&self) -> bool {
        self.decode_errors == 0 && self.sum_free + self.sum_reserved == self.total_issuance
    }
}

pub fn total_issuance(rpc: &mut WsRpc, at: &str) -> anyhow::Result<u128> {
    let bytes = storage::get(rpc, &storage::prefix("Balances", "TotalIssuance"), at)?
        .context("Balances.TotalIssuance is empty")?;
    codec::decode_u128(&bytes)
}

/// Sum of `free + reserved` over all accounts must equal `Balances.TotalIssuance`.
pub fn supply_at(rpc: &mut WsRpc, at: &str) -> anyhow::Result<Supply> {
    Ok(snapshot(rpc, at)?.0)
}

/// One account's balances at a pinned block.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct Balances {
    pub free: u128,
    pub reserved: u128,
}

/// Every `System.Account` entry at `at`, keyed by 32-byte account id, plus the supply
/// totals. Keys are `prefix(32) ++ blake2_128(16) ++ account_id(32)`.
pub fn snapshot(rpc: &mut WsRpc, at: &str) -> anyhow::Result<(Supply, std::collections::BTreeMap<[u8; 32], Balances>)> {
    let total_issuance = total_issuance(rpc, at)?;
    let entries = storage::iter_prefix(rpc, &storage::prefix("System", "Account"), at, 1000, |_| {})?;
    let mut s = Supply { accounts: entries.len(), decode_errors: 0, sum_free: 0, sum_reserved: 0, total_issuance };
    let mut accounts = std::collections::BTreeMap::new();
    for (k, v) in &entries {
        let (Some(id), Ok(i)) = (k.get(48..80).and_then(|b| <[u8; 32]>::try_from(b).ok()), codec::decode_account_info(v)) else {
            s.decode_errors += 1;
            continue;
        };
        s.sum_free += i.free;
        s.sum_reserved += i.reserved;
        accounts.insert(id, Balances { free: i.free, reserved: i.reserved });
    }
    Ok((s, accounts))
}

/// `System.Account` for one 32-byte account id; `None` if the account does not exist.
pub fn account(rpc: &mut WsRpc, account_id: &[u8], at: &str) -> anyhow::Result<Option<codec::AccountInfo>> {
    let mut key = storage::prefix("System", "Account");
    key.extend(storage::blake2_128_concat(account_id));
    storage::get(rpc, &key, at)?.map(|b| codec::decode_account_info(&b)).transpose()
}
