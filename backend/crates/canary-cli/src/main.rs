use std::path::PathBuf;
use std::process::ExitCode;
use std::time::Duration;

use clap::{Args, Parser, Subcommand};

mod attest;
mod compare;
mod doctor;
mod invariants;
mod report;
mod runner;
mod test_cmd;
mod upgrade;
mod verdict;
mod workflow;

#[derive(Parser)]
#[command(name = "canary", version, about = "Differential runtime-upgrade testing for Portaldot")]
struct Cli {
    #[command(subcommand)]
    command: Command,
}

#[derive(Args, Clone)]
struct DriverArgs {
    /// bun executable used to run the extrinsic driver.
    #[arg(long, env = "CANARY_BUN", default_value = "bun")]
    bun: PathBuf,
    /// Path to the driver script.
    #[arg(long, env = "CANARY_DRIVER", default_value = "driver/src/run.ts")]
    driver: PathBuf,
}

impl DriverArgs {
    fn into_driver(self) -> runner::Driver {
        runner::Driver { bun: self.bun, script: self.driver }
    }
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
    /// Structural diff of two live runtimes: version, runtime APIs, and every pallet's
    /// calls, events, storage, constants and errors. Exits 1 if a change is a known
    /// upgrade hazard (e.g. BABE slot or epoch duration), which would halt a running chain.
    Compare {
        #[arg(long)]
        baseline: String,
        #[arg(long)]
        candidate: String,
        #[arg(long, default_value_t = 30)]
        timeout: u64,
        #[arg(long)]
        json: bool,
    },
    /// Check read-only state invariants (supply conservation) on a live chain, pinned to one block.
    Invariants {
        /// Substrate WebSocket endpoint.
        #[arg(long, default_value = "ws://127.0.0.1:9944")]
        ws: String,
        /// Block hash to pin to. Defaults to the finalized head.
        #[arg(long)]
        at: Option<String>,
        /// Per-request timeout in seconds.
        #[arg(long, default_value_t = 30)]
        timeout: u64,
        /// Emit machine-readable JSON instead of text.
        #[arg(long)]
        json: bool,
    },
    /// Run the workflow corpus against a baseline and a candidate runtime and classify every
    /// difference. Exits 1 on any REGRESSION, 2 if anything is INCONCLUSIVE.
    Test {
        #[arg(long)]
        baseline: String,
        #[arg(long)]
        candidate: String,
        /// Workflow file or directory of *.yaml workflows.
        #[arg(long, default_value = "tests/workflows")]
        suite: PathBuf,
        /// Directory that receives runs/<run-id>/report.{json,html}.
        #[arg(long, default_value = "runs")]
        out: PathBuf,
        /// Run a single workflow by id.
        #[arg(long)]
        only: Option<String>,
        /// Label the candidate as a deliberately injected regression (shown in every report).
        #[arg(long)]
        injected: Option<String>,
        #[arg(long, default_value_t = 60)]
        timeout: u64,
        #[arg(long)]
        json: bool,
        #[command(flatten)]
        driver: DriverArgs,
    },
    /// Anchor a run's verdict on-chain with system.remark (report hash, runtime ids, counts).
    Attest {
        /// Run directory, e.g. runs/1760540000.
        #[arg(long)]
        run: PathBuf,
        #[arg(long, default_value = "ws://127.0.0.1:9944")]
        ws: String,
        /// Dev account (alice, //Name) or `env` to sign with CANARY_SIGNER_URI.
        #[arg(long, default_value = "alice")]
        signer: String,
        #[arg(long, default_value_t = 60)]
        timeout: u64,
        #[command(flatten)]
        driver: DriverArgs,
    },
    /// Apply a candidate runtime WASM to a development node (sudo setCode), wait until it is
    /// live and producing blocks, and diff every account and the supply invariant across the
    /// upgrade. Exits 1 if the chain halts or the migration breaks supply, 2 if not applied.
    Upgrade {
        #[arg(long, default_value = "ws://127.0.0.1:9944")]
        ws: String,
        #[arg(long)]
        wasm: PathBuf,
        #[arg(long, default_value_t = 120)]
        timeout: u64,
        /// Write the full result (state snapshots, per-account changes) to this JSON file.
        #[arg(long)]
        out: Option<PathBuf>,
        #[command(flatten)]
        driver: DriverArgs,
    },
    /// Check an attestation: report file hash, rebuilt payload, chain identity, remark in block.
    Verify {
        #[arg(long)]
        run: PathBuf,
        /// Override the endpoint recorded in attestation.json.
        #[arg(long)]
        ws: Option<String>,
        #[arg(long, default_value_t = 30)]
        timeout: u64,
    },
    /// Re-run one workflow from a recorded run and check the finding hash is identical.
    Reproduce {
        workflow: String,
        /// Run directory, e.g. runs/1760540000.
        #[arg(long)]
        run: PathBuf,
        #[arg(long, default_value_t = 60)]
        timeout: u64,
        #[command(flatten)]
        driver: DriverArgs,
    },
}

fn main() -> ExitCode {
    match Cli::parse().command {
        Command::Doctor { ws, eth, timeout, json } => {
            doctor::run(&ws, &eth, Duration::from_secs(timeout), json)
        }
        Command::Compare { baseline, candidate, timeout, json } => {
            compare::run(&baseline, &candidate, Duration::from_secs(timeout), json)
        }
        Command::Invariants { ws, at, timeout, json } => {
            invariants::run(&ws, at, Duration::from_secs(timeout), json)
        }
        Command::Test { baseline, candidate, suite, out, only, injected, timeout, json, driver } => {
            test_cmd::test(test_cmd::TestArgs {
                baseline,
                candidate,
                suite,
                out,
                driver: driver.into_driver(),
                only,
                injected,
                timeout: Duration::from_secs(timeout),
                json,
            })
        }
        Command::Attest { run, ws, signer, timeout, driver } => {
            attest::attest(&run, &ws, &signer, &driver.into_driver(), Duration::from_secs(timeout))
        }
        Command::Upgrade { ws, wasm, timeout, out, driver } => {
            upgrade::run(&ws, &wasm, &driver.into_driver(), Duration::from_secs(timeout), out.as_deref())
        }
        Command::Verify { run, ws, timeout } => attest::verify(&run, ws.as_deref(), Duration::from_secs(timeout)),
        Command::Reproduce { workflow, run, timeout, driver } => {
            test_cmd::reproduce(&workflow, &run, driver.into_driver(), Duration::from_secs(timeout))
        }
    }
}
