//! Runtime API detection.
//!
//! `state_getRuntimeVersion` lists APIs as `[blake2_64(name), version]`. We hash
//! the names we care about and match, which reveals contracts / EVM /
//! try-runtime support without decoding metadata.

use blake2::digest::{Update, VariableOutput};
use blake2::Blake2bVar;
use serde::Serialize;
use serde_json::Value;

/// APIs that change what Canary can test on a node.
pub const KNOWN: &[(&str, &str)] = &[
    ("Core", "core"),
    ("Metadata", "core"),
    ("BlockBuilder", "core"),
    ("TaggedTransactionQueue", "core"),
    ("AccountNonceApi", "signing"),
    ("TransactionPaymentApi", "fees"),
    ("ContractsApi", "wasm-contracts"),
    ("EthereumRuntimeRPCApi", "evm"),
    ("ConvertTransactionRuntimeApi", "evm"),
    ("TryRuntime", "upgrade-testing"),
    ("BabeApi", "consensus"),
    ("AuraApi", "consensus"),
    ("GrandpaApi", "finality"),
    ("SessionKeys", "consensus"),
];

pub fn api_id(name: &str) -> String {
    let mut hasher = Blake2bVar::new(8).expect("8 is a valid blake2b output size");
    hasher.update(name.as_bytes());
    let mut out = [0u8; 8];
    hasher.finalize_variable(&mut out).expect("buffer matches output size");
    format!("0x{}", hex::encode(out))
}

#[derive(Debug, Clone, Serialize)]
pub struct DetectedApi {
    pub id: String,
    pub name: Option<String>,
    pub capability: Option<String>,
    pub version: u64,
}

/// Map the `apis` array from `state_getRuntimeVersion` to known names.
pub fn detect(apis: &Value) -> Vec<DetectedApi> {
    let known: Vec<(String, &str, &str)> =
        KNOWN.iter().map(|(n, c)| (api_id(n), *n, *c)).collect();
    apis.as_array()
        .into_iter()
        .flatten()
        .filter_map(|entry| {
            let id = entry.get(0)?.as_str()?.to_lowercase();
            let version = entry.get(1)?.as_u64()?;
            let hit = known.iter().find(|(kid, _, _)| *kid == id);
            Some(DetectedApi {
                name: hit.map(|(_, n, _)| n.to_string()),
                capability: hit.map(|(_, _, c)| c.to_string()),
                id,
                version,
            })
        })
        .collect()
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    #[test]
    fn known_substrate_ids() {
        // Well-known ids from Substrate's runtime version output.
        assert_eq!(api_id("Core"), "0xdf6acb689907609b");
        assert_eq!(api_id("Metadata"), "0x37e397fc7c91f5e4");
    }

    #[test]
    fn detect_marks_unknown_apis() {
        let apis = json!([["0xdf6acb689907609b", 3], ["0x0000000000000000", 1]]);
        let found = detect(&apis);
        assert_eq!(found[0].name.as_deref(), Some("Core"));
        assert_eq!(found[0].version, 3);
        assert!(found[1].name.is_none());
    }
}
