//! `canary doctor`: tell an operator exactly which layer of an endpoint is broken,
//! and what the runtime behind a working endpoint actually is.

use std::process::ExitCode;
use std::time::Duration;

use canary_chain::{apis, endpoint, eth, metadata, rpc::WsRpc};
use serde::Serialize;
use serde_json::{json, Value};
use url::Url;

#[derive(Serialize)]
struct RuntimeInfo {
    chain: Option<String>,
    node_name: Option<String>,
    node_version: Option<String>,
    spec_name: Option<String>,
    spec_version: Option<u64>,
    impl_version: Option<u64>,
    transaction_version: Option<u64>,
    genesis_hash: Option<String>,
    best_block: Option<u64>,
    metadata: Option<metadata::Fingerprint>,
    apis: Vec<apis::DetectedApi>,
    capabilities: Vec<String>,
}

#[derive(Serialize)]
struct WsReport {
    url: String,
    reach: Option<endpoint::Reach>,
    handshake_error: Option<String>,
    runtime: Option<RuntimeInfo>,
    healthy: bool,
}

#[derive(Serialize)]
struct EthReport {
    url: String,
    reach: Option<endpoint::Reach>,
    error: Option<String>,
    info: Option<eth::EthInfo>,
    healthy: bool,
}

fn str_of(v: &Value) -> Option<String> {
    v.as_str().map(String::from)
}

fn query_runtime(rpc: &mut WsRpc) -> anyhow::Result<RuntimeInfo> {
    let rv = rpc.call("state_getRuntimeVersion", json!([]))?;
    let detected = apis::detect(&rv["apis"]);
    let mut capabilities: Vec<String> =
        detected.iter().filter_map(|a| a.capability.clone()).collect();
    capabilities.sort();
    capabilities.dedup();

    let metadata = rpc
        .call("state_getMetadata", json!([]))
        .ok()
        .and_then(|v| v.as_str().map(String::from))
        .and_then(|h| metadata::decode_hex(&h).ok())
        .and_then(|b| metadata::fingerprint(&b).ok());

    let best_block = rpc
        .call("chain_getHeader", json!([]))
        .ok()
        .and_then(|h| h["number"].as_str().map(String::from))
        .and_then(|n| u64::from_str_radix(n.trim_start_matches("0x"), 16).ok());

    Ok(RuntimeInfo {
        chain: rpc.call("system_chain", json!([])).ok().as_ref().and_then(str_of),
        node_name: rpc.call("system_name", json!([])).ok().as_ref().and_then(str_of),
        node_version: rpc.call("system_version", json!([])).ok().as_ref().and_then(str_of),
        spec_name: str_of(&rv["specName"]),
        spec_version: rv["specVersion"].as_u64(),
        impl_version: rv["implVersion"].as_u64(),
        transaction_version: rv["transactionVersion"].as_u64(),
        genesis_hash: rpc.call("chain_getBlockHash", json!([0])).ok().as_ref().and_then(str_of),
        best_block,
        metadata,
        apis: detected,
        capabilities,
    })
}

fn check_ws(raw: &str, timeout: Duration) -> WsReport {
    let mut report =
        WsReport { url: raw.into(), reach: None, handshake_error: None, runtime: None, healthy: false };
    let target = match Url::parse(raw).map_err(anyhow::Error::from).and_then(|u| {
        endpoint::Target::from_url(&u).map(|t| (u, t))
    }) {
        Ok(v) => v,
        Err(e) => {
            report.handshake_error = Some(format!("invalid url: {e}"));
            return report;
        }
    };
    let (url, target) = target;
    let (reach, stream) = endpoint::probe(&target, timeout);
    report.reach = Some(reach);
    let Some(stream) = stream else { return report };

    match WsRpc::handshake(&url, stream, timeout) {
        Err(e) => report.handshake_error = Some(e.to_string()),
        Ok(mut rpc) => match query_runtime(&mut rpc) {
            Ok(rt) => {
                report.healthy = rt.spec_version.is_some();
                report.runtime = Some(rt);
            }
            Err(e) => report.handshake_error = Some(format!("rpc failed: {e}")),
        },
    }
    report
}

fn check_eth(raw: &str, timeout: Duration) -> EthReport {
    let mut report = EthReport { url: raw.into(), reach: None, error: None, info: None, healthy: false };
    let parsed = Url::parse(raw).map_err(anyhow::Error::from).and_then(|u| endpoint::Target::from_url(&u));
    let target = match parsed {
        Ok(t) => t,
        Err(e) => {
            report.error = Some(format!("invalid url: {e}"));
            return report;
        }
    };
    let (reach, stream) = endpoint::probe(&target, timeout);
    let reachable = stream.is_some();
    report.reach = Some(reach);
    if !reachable {
        return report;
    }
    match eth::probe(raw, timeout) {
        Ok(info) => {
            report.healthy = info.chain_id.is_some();
            report.info = Some(info);
        }
        Err(e) => report.error = Some(e.to_string()),
    }
    report
}

fn reach_line(reach: &Option<endpoint::Reach>) -> String {
    match reach {
        None => "not attempted".into(),
        Some(endpoint::Reach::Ok { addrs }) => format!("ok ({})", addrs.join(", ")),
        Some(endpoint::Reach::DnsNoRecord { error }) => format!("FAIL dns: no record ({error})"),
        Some(endpoint::Reach::TcpUnreachable { error, .. }) => format!("FAIL tcp: {error}"),
    }
}

fn opt<T: std::fmt::Display>(v: &Option<T>) -> String {
    v.as_ref().map(|x| x.to_string()).unwrap_or_else(|| "-".into())
}

fn print_ws(r: &WsReport) {
    println!("substrate  {}", r.url);
    println!("  network     {}", reach_line(&r.reach));
    if let Some(e) = &r.handshake_error {
        println!("  rpc         FAIL {e}");
    }
    if let Some(rt) = &r.runtime {
        println!("  chain       {}  (node {} {})", opt(&rt.chain), opt(&rt.node_name), opt(&rt.node_version));
        println!(
            "  runtime     {} spec_version={} impl={} tx_version={}",
            opt(&rt.spec_name),
            opt(&rt.spec_version),
            opt(&rt.impl_version),
            opt(&rt.transaction_version)
        );
        println!("  genesis     {}", opt(&rt.genesis_hash));
        println!("  best block  #{}", opt(&rt.best_block));
        match &rt.metadata {
            Some(m) => println!(
                "  metadata    V{} ({} bytes, sha256 {}…){}",
                m.version,
                m.size_bytes,
                &m.sha256[..16],
                if m.has_type_registry() { "" } else { "  pre-V14: modern subxt cannot decode this" }
            ),
            None => println!("  metadata    unavailable"),
        }
        let unknown = rt.apis.iter().filter(|a| a.name.is_none()).count();
        println!(
            "  apis        {} total, {} unrecognised; capabilities: {}",
            rt.apis.len(),
            unknown,
            if rt.capabilities.is_empty() { "-".into() } else { rt.capabilities.join(", ") }
        );
        for cap in ["wasm-contracts", "evm", "upgrade-testing"] {
            let has = rt.capabilities.iter().any(|c| c == cap);
            println!("    {:<16} {}", cap, if has { "present" } else { "absent" });
        }
    }
    println!("  verdict     {}", if r.healthy { "HEALTHY" } else { "UNHEALTHY" });
}

fn print_eth(r: &EthReport) {
    println!("evm        {}", r.url);
    println!("  network     {}", reach_line(&r.reach));
    if let Some(e) = &r.error {
        println!("  rpc         FAIL {e}");
    }
    if let Some(i) = &r.info {
        println!("  chain id    {}", opt(&i.chain_id));
        println!("  client      {}", opt(&i.client_version));
        println!("  block       #{}", opt(&i.block_number));
    }
    println!("  verdict     {}", if r.healthy { "HEALTHY" } else { "UNHEALTHY" });
}

pub fn run(ws: &[String], eth_urls: &[String], timeout: Duration, as_json: bool) -> ExitCode {
    let ws_reports: Vec<WsReport> = ws.iter().map(|u| check_ws(u, timeout)).collect();
    let eth_reports: Vec<EthReport> = eth_urls.iter().map(|u| check_eth(u, timeout)).collect();
    let all_healthy = ws_reports.iter().all(|r| r.healthy) && eth_reports.iter().all(|r| r.healthy);

    if as_json {
        let out = json!({ "substrate": ws_reports, "evm": eth_reports, "healthy": all_healthy });
        println!("{}", serde_json::to_string_pretty(&out).expect("report serialises"));
    } else {
        for r in &ws_reports {
            print_ws(r);
            println!();
        }
        for r in &eth_reports {
            print_eth(r);
            println!();
        }
    }
    if all_healthy { ExitCode::SUCCESS } else { ExitCode::from(2) }
}
