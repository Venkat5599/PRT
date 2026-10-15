//! Blocking JSON-RPC over WebSocket (ws:// and wss://).

use std::net::TcpStream;
use std::time::Duration;

use anyhow::{anyhow, bail, Context};
use serde_json::{json, Value};
use tungstenite::stream::MaybeTlsStream;
use tungstenite::{Message, WebSocket};
use url::Url;

pub struct WsRpc {
    socket: WebSocket<MaybeTlsStream<TcpStream>>,
    next_id: u64,
}

impl WsRpc {
    /// Upgrade an already-connected TCP stream to a WebSocket session.
    pub fn handshake(url: &Url, stream: TcpStream, timeout: Duration) -> anyhow::Result<Self> {
        stream.set_read_timeout(Some(timeout))?;
        stream.set_write_timeout(Some(timeout))?;
        let (socket, _response) = tungstenite::client_tls(url.as_str(), stream)
            .map_err(|e| anyhow!("websocket handshake failed: {e}"))?;
        Ok(Self { socket, next_id: 1 })
    }

    pub fn call(&mut self, method: &str, params: Value) -> anyhow::Result<Value> {
        let id = self.next_id;
        self.next_id += 1;
        let req = json!({ "jsonrpc": "2.0", "id": id, "method": method, "params": params });
        self.socket
            .send(Message::Text(req.to_string()))
            .with_context(|| format!("sending {method}"))?;

        loop {
            let msg = self.socket.read().with_context(|| format!("reading {method} response"))?;
            let text = match msg {
                Message::Text(t) => t,
                Message::Binary(b) => String::from_utf8(b)?,
                Message::Ping(_) | Message::Pong(_) | Message::Frame(_) => continue,
                Message::Close(frame) => bail!("server closed connection: {frame:?}"),
            };
            let resp: Value = serde_json::from_str(&text)?;
            if resp.get("id").and_then(Value::as_u64) != Some(id) {
                continue; // stray notification or a response to another request
            }
            if let Some(err) = resp.get("error") {
                bail!("{method} returned error: {err}");
            }
            return resp
                .get("result")
                .cloned()
                .ok_or_else(|| anyhow!("{method}: response has neither result nor error"));
        }
    }
}
