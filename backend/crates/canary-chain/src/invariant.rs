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
    let total_issuance = total_issuance(rpc, at)?;
    let entries = storage::iter_prefix(rpc, &storage::prefix("System", "Account"), at, 1000, |_| {})?;
    let mut s = Supply { accounts: entries.len(), decode_errors: 0, sum_free: 0, sum_reserved: 0, total_issuance };
    for (_, v) in &entries {
        match codec::decode_account_info(v) {
            Ok(i) => {
                s.sum_free += i.free;
                s.sum_reserved += i.reserved;
            }
            Err(_) => s.decode_errors += 1,
        }
    }
    Ok(s)
}

/// `System.Account` for one 32-byte account id; `None` if the account does not exist.
pub fn account(rpc: &mut WsRpc, account_id: &[u8], at: &str) -> anyhow::Result<Option<codec::AccountInfo>> {
    let mut key = storage::prefix("System", "Account");
    key.extend(storage::blake2_128_concat(account_id));
    storage::get(rpc, &key, at)?.map(|b| codec::decode_account_info(&b)).transpose()
}
