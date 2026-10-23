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

/// SS58 address for a 32-byte account id with a one-byte network prefix (42 = generic
/// Substrate, which Portaldot uses): base58(prefix ++ id ++ blake2b_512("SS58PRE" ++ prefix ++ id)[..2]).
pub fn ss58(account_id: &[u8; 32], prefix: u8) -> String {
    use blake2::digest::{Update, VariableOutput};
    let mut body = vec![prefix];
    body.extend_from_slice(account_id);
    let mut h = blake2::Blake2bVar::new(64).expect("64 is a valid blake2b output size");
    h.update(b"SS58PRE");
    h.update(&body);
    let mut sum = [0u8; 64];
    h.finalize_variable(&mut sum).expect("buffer matches output size");
    body.extend_from_slice(&sum[..2]);
    base58(&body)
}

fn base58(bytes: &[u8]) -> String {
    const ALPHABET: &[u8; 58] = b"123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
    let mut digits: Vec<u8> = Vec::new(); // base-58 digits, least significant first
    for &b in bytes {
        let mut carry = b as u32;
        for d in digits.iter_mut() {
            carry += (*d as u32) << 8;
            *d = (carry % 58) as u8;
            carry /= 58;
        }
        while carry > 0 {
            digits.push((carry % 58) as u8);
            carry /= 58;
        }
    }
    let zeros = bytes.iter().take_while(|&&b| b == 0).count();
    std::iter::repeat('1')
        .take(zeros)
        .chain(digits.iter().rev().map(|&d| ALPHABET[d as usize] as char))
        .collect()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn ss58_matches_known_dev_address() {
        let alice: [u8; 32] = hex::decode("d43593c715fdd31c61141abd04a99fd6822c8558854ccde39a5684e7a56da27d")
            .unwrap()
            .try_into()
            .unwrap();
        assert_eq!(ss58(&alice, 42), "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY");
    }

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
