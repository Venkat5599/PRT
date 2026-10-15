//! Curated SCALE codecs for the storage Canary observes.
//!
//! Metadata V13 carries type *names* only, so layouts are decoded explicitly.
//! `AccountInfo` changed shape across 2021 Substrate releases; the encoded
//! length identifies which shape a runtime uses, and anything else is rejected
//! rather than guessed.

use anyhow::bail;
use serde::Serialize;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize)]
#[serde(rename_all = "snake_case")]
pub enum AccountInfoLayout {
    /// nonce, refcount, data
    RefCount,
    /// nonce, consumers, providers, data
    ConsumersProviders,
    /// nonce, consumers, providers, sufficients, data
    WithSufficients,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
pub struct AccountInfo {
    pub layout: AccountInfoLayout,
    pub nonce: u32,
    pub free: u128,
    pub reserved: u128,
    pub misc_frozen: u128,
    pub fee_frozen: u128,
}

const ACCOUNT_DATA_LEN: usize = 16 * 4;

fn u32_at(b: &[u8], off: usize) -> u32 {
    u32::from_le_bytes(b[off..off + 4].try_into().expect("4-byte slice"))
}

fn u128_at(b: &[u8], off: usize) -> u128 {
    u128::from_le_bytes(b[off..off + 16].try_into().expect("16-byte slice"))
}

pub fn decode_u128(b: &[u8]) -> anyhow::Result<u128> {
    if b.len() != 16 {
        bail!("expected 16-byte u128, got {} bytes", b.len());
    }
    Ok(u128_at(b, 0))
}

pub fn decode_account_info(b: &[u8]) -> anyhow::Result<AccountInfo> {
    let (layout, header) = match b.len() {
        n if n == 8 + ACCOUNT_DATA_LEN => (AccountInfoLayout::RefCount, 8),
        n if n == 12 + ACCOUNT_DATA_LEN => (AccountInfoLayout::ConsumersProviders, 12),
        n if n == 16 + ACCOUNT_DATA_LEN => (AccountInfoLayout::WithSufficients, 16),
        n => bail!("unrecognised AccountInfo length {n} bytes"),
    };
    Ok(AccountInfo {
        layout,
        nonce: u32_at(b, 0),
        free: u128_at(b, header),
        reserved: u128_at(b, header + 16),
        misc_frozen: u128_at(b, header + 32),
        fee_frozen: u128_at(b, header + 48),
    })
}

/// Render a planck amount with the chain's decimals, e.g. 14 for POT.
pub fn format_units(amount: u128, decimals: u32) -> String {
    let base = 10u128.pow(decimals);
    let frac = format!("{:0width$}", amount % base, width = decimals as usize);
    let frac = frac.trim_end_matches('0');
    if frac.is_empty() {
        format!("{}", amount / base)
    } else {
        format!("{}.{}", amount / base, frac)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn encode(header: &[u32], data: [u128; 4]) -> Vec<u8> {
        let mut v: Vec<u8> = header.iter().flat_map(|x| x.to_le_bytes()).collect();
        for d in data {
            v.extend_from_slice(&d.to_le_bytes());
        }
        v
    }

    #[test]
    fn decodes_each_layout() {
        for (header, layout) in [
            (vec![5, 1], AccountInfoLayout::RefCount),
            (vec![5, 0, 1], AccountInfoLayout::ConsumersProviders),
            (vec![5, 0, 1, 0], AccountInfoLayout::WithSufficients),
        ] {
            let info = decode_account_info(&encode(&header, [100, 20, 3, 4])).unwrap();
            assert_eq!(info.layout, layout);
            assert_eq!((info.nonce, info.free, info.reserved), (5, 100, 20));
            assert_eq!((info.misc_frozen, info.fee_frozen), (3, 4));
        }
    }

    #[test]
    fn rejects_unknown_length() {
        assert!(decode_account_info(&[0u8; 50]).is_err());
    }

    #[test]
    fn formats_pot_units() {
        assert_eq!(format_units(150_000_000_000_000, 14), "1.5");
        assert_eq!(format_units(100_000_000_000_000, 14), "1");
        assert_eq!(format_units(1, 14), "0.00000000000001");
    }
}
