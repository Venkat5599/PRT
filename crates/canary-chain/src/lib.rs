//! Minimal Substrate client for Portal Canary.
//!
//! Deliberately avoids `subxt`: Portaldot's public node is a 2021-era Substrate
//! fork whose metadata may predate V14. Everything here speaks raw JSON-RPC and
//! inspects SCALE bytes directly, so it works across metadata versions.

pub mod apis;
pub mod codec;
pub mod diff;
pub mod endpoint;
pub mod eth;
pub mod metadata;
pub mod metadata_v13;
pub mod rpc;
pub mod storage;
