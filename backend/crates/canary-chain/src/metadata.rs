//! Metadata fingerprinting without decoding the full type registry.
//!
//! `state_getMetadata` returns `RuntimeMetadataPrefixed`: the 4-byte magic
//! `b"meta"` followed by the enum variant index, which is the metadata version.

use anyhow::{bail, Context};
use serde::Serialize;
use sha2::{Digest, Sha256};

pub const MAGIC: [u8; 4] = *b"meta";

#[derive(Debug, Clone, Serialize, PartialEq, Eq)]
pub struct Fingerprint {
    pub version: u8,
    pub size_bytes: usize,
    pub sha256: String,
}

impl Fingerprint {
    /// True when modern scale-info tooling (subxt, polkadot-sdk >= 2021-09) can decode it.
    pub fn has_type_registry(&self) -> bool {
        self.version >= 14
    }
}

pub fn decode_hex(s: &str) -> anyhow::Result<Vec<u8>> {
    hex::decode(s.trim_start_matches("0x")).context("metadata is not valid hex")
}

pub fn fingerprint(bytes: &[u8]) -> anyhow::Result<Fingerprint> {
    if bytes.len() < 5 {
        bail!("metadata too short ({} bytes)", bytes.len());
    }
    if bytes[..4] != MAGIC {
        bail!("metadata magic mismatch: got 0x{}", hex::encode(&bytes[..4]));
    }
    Ok(Fingerprint {
        version: bytes[4],
        size_bytes: bytes.len(),
        sha256: hex::encode(Sha256::digest(bytes)),
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn reads_version_byte_after_magic() {
        let fp = fingerprint(b"meta\x0dpayload").unwrap();
        assert_eq!(fp.version, 13);
        assert!(!fp.has_type_registry());
        assert_eq!(fp.size_bytes, 12);
    }

    #[test]
    fn v14_has_type_registry() {
        assert!(fingerprint(b"meta\x0e").unwrap().has_type_registry());
    }

    #[test]
    fn rejects_bad_magic() {
        assert!(fingerprint(b"nope\x0e").is_err());
    }

    #[test]
    fn rejects_truncated() {
        assert!(fingerprint(b"meta").is_err());
    }

    #[test]
    fn decodes_prefixed_hex() {
        assert_eq!(decode_hex("0x6d657461").unwrap(), b"meta");
    }
}
