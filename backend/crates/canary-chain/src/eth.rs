//! Probe for an Ethereum JSON-RPC endpoint (V3's EVM side).

use std::sync::Arc;
use std::time::Duration;

use anyhow::{anyhow, Context};
use serde::Serialize;
use serde_json::{json, Value};

#[derive(Debug, Clone, Serialize)]
pub struct EthInfo {
    pub chain_id: Option<u64>,
    pub client_version: Option<String>,
    pub block_number: Option<u64>,
}

fn hex_u64(v: &Value) -> Option<u64> {
    u64::from_str_radix(v.as_str()?.trim_start_matches("0x"), 16).ok()
}

pub fn probe(url: &str, timeout: Duration) -> anyhow::Result<EthInfo> {
    let tls = native_tls::TlsConnector::new().context("initialising TLS")?;
    let agent = ureq::AgentBuilder::new()
        .timeout(timeout)
        .tls_connector(Arc::new(tls))
        .build();

    let call = |method: &str| -> anyhow::Result<Value> {
        let body = json!({ "jsonrpc": "2.0", "id": 1, "method": method, "params": [] });
        let resp: Value = agent
            .post(url)
            .send_json(body)
            .map_err(|e| match e {
                ureq::Error::Status(code, _) => anyhow!("{method}: HTTP {code}"),
                other => anyhow!("{method}: {other}"),
            })?
            .into_json()?;
        if let Some(err) = resp.get("error") {
            return Err(anyhow!("{method} returned error: {err}"));
        }
        Ok(resp.get("result").cloned().unwrap_or(Value::Null))
    };

    let chain_id = hex_u64(&call("eth_chainId")?);
    Ok(EthInfo {
        chain_id,
        client_version: call("web3_clientVersion").ok().and_then(|v| v.as_str().map(String::from)),
        block_number: call("eth_blockNumber").ok().as_ref().and_then(hex_u64),
    })
}
