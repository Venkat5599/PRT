//! Storage key construction and paged reads, computed directly so they work
//! regardless of metadata version.

use std::hash::Hasher;

use anyhow::Context;
#[cfg(feature = "net")]
use anyhow::anyhow;
use blake2::digest::{Update, VariableOutput};
use blake2::Blake2bVar;
#[cfg(feature = "net")]
use serde_json::{json, Value};
use twox_hash::XxHash64;

#[cfg(feature = "net")]
use crate::rpc::WsRpc;

pub fn twox_128(data: &[u8]) -> [u8; 16] {
    let mut out = [0u8; 16];
    for (seed, chunk) in out.chunks_mut(8).enumerate() {
        let mut h = XxHash64::with_seed(seed as u64);
        h.write(data);
        chunk.copy_from_slice(&h.finish().to_le_bytes());
    }
    out
}

pub fn blake2_128(data: &[u8]) -> [u8; 16] {
    let mut h = Blake2bVar::new(16).expect("16 is a valid blake2b output size");
    h.update(data);
    let mut out = [0u8; 16];
    h.finalize_variable(&mut out).expect("buffer matches output size");
    out
}

pub fn blake2_128_concat(data: &[u8]) -> Vec<u8> {
    let mut v = blake2_128(data).to_vec();
    v.extend_from_slice(data);
    v
}

/// `twox128(pallet) ++ twox128(item)`: the key of a plain value, or the prefix of a map.
pub fn prefix(pallet: &str, item: &str) -> Vec<u8> {
    let mut k = twox_128(pallet.as_bytes()).to_vec();
    k.extend_from_slice(&twox_128(item.as_bytes()));
    k
}

pub fn to_hex(bytes: &[u8]) -> String {
    format!("0x{}", hex::encode(bytes))
}

pub fn from_hex(s: &str) -> anyhow::Result<Vec<u8>> {
    hex::decode(s.trim_start_matches("0x")).with_context(|| format!("invalid hex: {s}"))
}

#[cfg(feature = "net")]
pub fn finalized_head(rpc: &mut WsRpc) -> anyhow::Result<String> {
    rpc.call("chain_getFinalizedHead", json!([]))?
        .as_str()
        .map(String::from)
        .ok_or_else(|| anyhow!("chain_getFinalizedHead returned non-string"))
}

#[cfg(feature = "net")]
pub fn block_number(rpc: &mut WsRpc, at: &str) -> anyhow::Result<u64> {
    let header = rpc.call("chain_getHeader", json!([at]))?;
    let n = header["number"].as_str().ok_or_else(|| anyhow!("header has no number"))?;
    Ok(u64::from_str_radix(n.trim_start_matches("0x"), 16)?)
}

#[cfg(feature = "net")]
pub fn get(rpc: &mut WsRpc, key: &[u8], at: &str) -> anyhow::Result<Option<Vec<u8>>> {
    match rpc.call("state_getStorage", json!([to_hex(key), at]))? {
        Value::Null => Ok(None),
        Value::String(s) => Ok(Some(from_hex(&s)?)),
        other => Err(anyhow!("unexpected state_getStorage result: {other}")),
    }
}

#[cfg(feature = "net")]
/// Every `(key, value)` under `prefix` at block `at`, fetched in pages.
pub fn iter_prefix(
    rpc: &mut WsRpc,
    prefix: &[u8],
    at: &str,
    page: u32,
    mut on_page: impl FnMut(usize),
) -> anyhow::Result<Vec<(Vec<u8>, Vec<u8>)>> {
    let prefix_hex = to_hex(prefix);
    let mut out = Vec::new();
    let mut start: Option<String> = None;
    loop {
        let keys: Vec<String> = serde_json::from_value(
            rpc.call("state_getKeysPaged", json!([prefix_hex, page, start, at]))?,
        )?;
        if keys.is_empty() {
            break;
        }
        let result = rpc.call("state_queryStorageAt", json!([keys, at]))?;
        let changes = result
            .get(0)
            .and_then(|set| set.get("changes"))
            .and_then(Value::as_array)
            .ok_or_else(|| anyhow!("state_queryStorageAt: missing changes"))?;
        for change in changes {
            let (Some(k), Some(v)) = (change.get(0).and_then(Value::as_str), change.get(1).and_then(Value::as_str))
            else {
                continue; // key deleted between listing and read: impossible when pinned, skip defensively
            };
            out.push((from_hex(k)?, from_hex(v)?));
        }
        on_page(out.len());
        let fetched = keys.len();
        start = keys.into_iter().last();
        if fetched < page as usize {
            break;
        }
    }
    Ok(out)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn well_known_prefixes() {
        assert_eq!(
            to_hex(&prefix("System", "Account")),
            "0x26aa394eea5630e07c48ae0c9558cef7b99d880ec681799c0cf30e8886371da9"
        );
        assert_eq!(
            to_hex(&prefix("Balances", "TotalIssuance")),
            "0xc2261276cc9d1f8598ea4b6a74b15c2f57c875e4cff74148e4628f264b974c80"
        );
    }

    #[test]
    fn blake2_128_concat_appends_key() {
        let k = blake2_128_concat(&[7u8; 32]);
        assert_eq!(k.len(), 48);
        assert_eq!(&k[16..], &[7u8; 32]);
    }
}
