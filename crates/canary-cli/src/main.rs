use std::process::ExitCode;
use std::time::Duration;

use clap::{Parser, Subcommand};

mod doctor;

#[derive(Parser)]
#[command(name = "canary", version, about = "Differential runtime-upgrade testing for Portaldot")]
struct Cli {
    #[command(subcommand)]
    command: Command,
}

#[derive(Subcommand)]
enum Command {
    /// Diagnose Substrate and EVM endpoints layer by layer (DNS, TCP, WebSocket, RPC, runtime).
    Doctor {
        /// Substrate WebSocket endpoint(s). Repeat to compare several.
        #[arg(long = "ws", default_value = "ws://127.0.0.1:9944")]
        ws: Vec<String>,
        /// Ethereum JSON-RPC endpoint(s) to probe.
        #[arg(long = "eth")]
        eth: Vec<String>,
        /// Per-step timeout in seconds.
        #[arg(long, default_value_t = 8)]
        timeout: u64,
        /// Emit machine-readable JSON instead of text.
        #[arg(long)]
        json: bool,
    },
}

fn main() -> ExitCode {
    match Cli::parse().command {
        Command::Doctor { ws, eth, timeout, json } => {
            doctor::run(&ws, &eth, Duration::from_secs(timeout), json)
        }
    }
}
