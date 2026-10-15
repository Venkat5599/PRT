use std::path::PathBuf;
use std::process::ExitCode;
use std::time::Duration;

use clap::{Args, Parser, Subcommand};

mod compare;
mod doctor;
mod invariants;
mod report;
mod runner;
mod test_cmd;
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
    /// calls, events, storage, constants and errors.
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
        Command::Reproduce { workflow, run, timeout, driver } => {
            test_cmd::reproduce(&workflow, &run, driver.into_driver(), Duration::from_secs(timeout))
        }
    }
}
