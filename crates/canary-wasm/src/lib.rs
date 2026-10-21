//! `canary compare` for the browser.
//!
//! The page fetches both runtimes over WebSocket JSON-RPC and hands the raw
//! results here. Plain C ABI, no wasm-bindgen: the host writes a JSON request
//! into memory from `alloc`, calls `compare`, then reads `result_ptr` /
//! `result_len`. The result is the same JSON `canary compare --json` prints,
//! or `{"error": "..."}`.
//!
//! Request:
//! `{"baseline": Input, "candidate": Input}` where
//! `Input = {"endpoint", "runtime_version", "metadata": "0x…", "genesis_hash"}`.

use std::cell::RefCell;

use canary_chain::compare::{self, Runtime};
use serde::Deserialize;
use serde_json::{json, Value};

#[derive(Deserialize)]
struct Input {
    endpoint: String,
    runtime_version: Value,
    metadata: String,
    genesis_hash: Option<String>,
}

#[derive(Deserialize)]
struct Request {
    baseline: Input,
    candidate: Input,
}

fn runtime(i: &Input) -> Result<Runtime, String> {
    let bytes = hex::decode(i.metadata.trim_start_matches("0x")).map_err(|e| format!("{}: metadata is not hex: {e}", i.endpoint))?;
    Runtime::new(&i.endpoint, &i.runtime_version, &bytes, i.genesis_hash.clone()).map_err(|e| format!("{}: {e:#}", i.endpoint))
}

/// Run one comparison from a JSON request and return the JSON result.
pub fn run(request: &[u8]) -> String {
    let out = serde_json::from_slice::<Request>(request)
        .map_err(|e| format!("bad request: {e}"))
        .and_then(|r| Ok(compare::compare(&runtime(&r.baseline)?, &runtime(&r.candidate)?)))
        .map(|c| serde_json::to_value(c).expect("serialises"))
        .unwrap_or_else(|e| json!({ "error": e }));
    out.to_string()
}

thread_local! {
    static RESULT: RefCell<Vec<u8>> = const { RefCell::new(Vec::new()) };
}

#[no_mangle]
pub extern "C" fn alloc(len: usize) -> *mut u8 {
    let mut buf = Vec::<u8>::with_capacity(len);
    let ptr = buf.as_mut_ptr();
    std::mem::forget(buf);
    ptr
}

/// # Safety
/// `ptr` must come from `alloc(len)` and not be used afterwards.
#[no_mangle]
pub unsafe extern "C" fn dealloc(ptr: *mut u8, len: usize) {
    drop(Vec::from_raw_parts(ptr, 0, len));
}

/// # Safety
/// `ptr..ptr+len` must be a request the host wrote into memory from `alloc(len)`.
/// The request buffer is freed here.
#[no_mangle]
pub unsafe extern "C" fn compare(ptr: *mut u8, len: usize) {
    let request = Vec::from_raw_parts(ptr, len, len);
    let out = run(&request).into_bytes();
    RESULT.with(|r| *r.borrow_mut() = out);
}

#[no_mangle]
pub extern "C" fn result_ptr() -> *const u8 {
    RESULT.with(|r| r.borrow().as_ptr())
}

#[no_mangle]
pub extern "C" fn result_len() -> usize {
    RESULT.with(|r| r.borrow().len())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn bad_request_is_an_error_not_a_panic() {
        let v: Value = serde_json::from_str(&run(b"{}")).unwrap();
        assert!(v["error"].as_str().unwrap().starts_with("bad request"));
    }

    #[test]
    fn bad_metadata_names_the_endpoint() {
        let side = json!({ "endpoint": "wss://x", "runtime_version": {}, "metadata": "0x00", "genesis_hash": null });
        let req = json!({ "baseline": side, "candidate": side }).to_string();
        let v: Value = serde_json::from_str(&run(req.as_bytes())).unwrap();
        assert!(v["error"].as_str().unwrap().starts_with("wss://x:"), "{v}");
    }
}
