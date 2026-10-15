//! Layered reachability probe: DNS, then TCP, so a failure names the layer that broke.

use std::net::{SocketAddr, TcpStream, ToSocketAddrs};
use std::time::Duration;

use serde::Serialize;
use url::Url;

#[derive(Debug, Clone, Serialize)]
pub struct Target {
    pub host: String,
    pub port: u16,
}

impl Target {
    pub fn from_url(url: &Url) -> anyhow::Result<Self> {
        let host = url
            .host_str()
            .ok_or_else(|| anyhow::anyhow!("url has no host: {url}"))?
            .to_string();
        let port = url
            .port_or_known_default()
            .or(match url.scheme() {
                "ws" => Some(80),
                "wss" => Some(443),
                _ => None,
            })
            .ok_or_else(|| anyhow::anyhow!("cannot infer port for {url}"))?;
        Ok(Self { host, port })
    }
}

#[derive(Debug, Clone, Serialize)]
#[serde(tag = "status", rename_all = "snake_case")]
pub enum Reach {
    Ok { addrs: Vec<String> },
    DnsNoRecord { error: String },
    TcpUnreachable { addrs: Vec<String>, error: String },
}

pub fn probe(target: &Target, timeout: Duration) -> (Reach, Option<TcpStream>) {
    let addrs: Vec<SocketAddr> = match (target.host.as_str(), target.port).to_socket_addrs() {
        Ok(it) => it.collect(),
        Err(e) => return (Reach::DnsNoRecord { error: e.to_string() }, None),
    };
    if addrs.is_empty() {
        return (Reach::DnsNoRecord { error: "resolver returned no addresses".into() }, None);
    }
    let shown: Vec<String> = addrs.iter().map(|a| a.to_string()).collect();
    let mut last_err = String::new();
    for addr in &addrs {
        match TcpStream::connect_timeout(addr, timeout) {
            Ok(stream) => return (Reach::Ok { addrs: shown }, Some(stream)),
            Err(e) => last_err = e.to_string(),
        }
    }
    (Reach::TcpUnreachable { addrs: shown, error: last_err }, None)
}
