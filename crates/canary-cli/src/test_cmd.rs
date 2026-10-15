//! `canary test` and `canary reproduce`.

use std::path::{Path, PathBuf};
use std::process::ExitCode;
use std::time::{Duration, SystemTime, UNIX_EPOCH};

use anyhow::Context;

use crate::report::{self, Manifest, Report, SuiteFile, WorkflowResult};
use crate::runner::{self, Driver, Namespace};
use crate::verdict::{self, Verdict};
use crate::workflow;

pub struct TestArgs {
    pub baseline: String,
    pub candidate: String,
    pub suite: PathBuf,
    pub out: PathBuf,
    pub driver: Driver,
    pub only: Option<String>,
    pub injected: Option<String>,
    pub timeout: Duration,
    pub json: bool,
}

fn run_id() -> String {
    let t = SystemTime::now().duration_since(UNIX_EPOCH).unwrap_or_default();
    format!("{}", t.as_secs())
}

fn execute(a: &TestArgs, run_id: &str) -> anyhow::Result<Report> {
    let mut suite = workflow::load_suite(&a.suite)?;
    if let Some(only) = &a.only {
        suite.retain(|l| &l.workflow.id == only);
        anyhow::ensure!(!suite.is_empty(), "no workflow with id {only} in {}", a.suite.display());
    }
    let manifest = Manifest {
        run_id: run_id.into(),
        canary_version: env!("CARGO_PKG_VERSION").into(),
        started_unix: SystemTime::now().duration_since(UNIX_EPOCH).unwrap_or_default().as_secs(),
        suite_path: a.suite.display().to_string(),
        suite: suite
            .iter()
            .map(|l| SuiteFile { workflow: l.workflow.id.clone(), path: l.path.display().to_string(), sha256: l.sha256.clone() })
            .collect(),
        baseline: report::identify(&a.baseline, a.timeout),
        candidate: report::identify(&a.candidate, a.timeout),
        injected: a.injected.clone(),
    };

    let mut results = Vec::new();
    for l in &suite {
        let wf = &l.workflow;
        eprintln!("· {}", wf.id);
        let b = runner::run_side(wf, &Namespace { run_id, side: "baseline" }, &a.baseline, &a.driver, a.timeout);
        let c = runner::run_side(wf, &Namespace { run_id, side: "candidate" }, &a.candidate, &a.driver, a.timeout);
        let finding = verdict::classify(wf, &b, &c);
        eprintln!("  {:?} {:?}", finding.verdict, finding.severity);
        results.push(WorkflowResult {
            reproduce: format!("canary reproduce {} --run {}", wf.id, a.out.join(run_id).display()),
            finding,
            baseline: b,
            candidate: c,
        });
    }
    let summary = report::summarize(&results);
    Ok(Report { manifest, summary, results })
}

fn exit_for(r: &Report) -> ExitCode {
    if r.summary.regression > 0 {
        ExitCode::from(1)
    } else if r.summary.inconclusive > 0 {
        ExitCode::from(2)
    } else {
        ExitCode::SUCCESS
    }
}

pub fn test(a: TestArgs) -> ExitCode {
    let id = run_id();
    let report = match execute(&a, &id) {
        Ok(r) => r,
        Err(e) => {
            eprintln!("error: {e:#}");
            return ExitCode::from(2);
        }
    };
    let dir = a.out.join(&id);
    if let Err(e) = report::write(&dir, &report) {
        eprintln!("error writing report: {e:#}");
        return ExitCode::from(2);
    }
    if a.json {
        println!("{}", serde_json::to_string_pretty(&report).expect("serialises"));
    } else {
        println!();
        for r in &report.results {
            println!("{:<13} {:<9} {}", format!("{:?}", r.finding.verdict).to_uppercase(), format!("{:?}", r.finding.severity), r.finding.workflow);
            for c in &r.finding.regressed {
                println!("    ✗ {}  baseline: {}  candidate: {}", c.what, c.baseline, c.candidate);
            }
        }
        println!();
        println!("{}", report.summary.statement);
        println!("report  {}", dir.join("report.html").display());
    }
    exit_for(&report)
}

/// Re-run one workflow with the recorded endpoints and suite, then compare the finding hash.
pub fn reproduce(workflow_id: &str, run_dir: &Path, driver: Driver, timeout: Duration) -> ExitCode {
    let inner = || -> anyhow::Result<ExitCode> {
        let raw = std::fs::read_to_string(run_dir.join("report.json"))
            .with_context(|| format!("reading {}", run_dir.join("report.json").display()))?;
        let recorded: serde_json::Value = serde_json::from_str(&raw)?;
        let manifest: Manifest = serde_json::from_value(recorded["manifest"].clone())?;
        let prior = recorded["results"]
            .as_array()
            .and_then(|rs| rs.iter().find(|r| r["finding"]["workflow"] == workflow_id))
            .with_context(|| format!("workflow {workflow_id} not in {}", run_dir.display()))?;
        let prior_hash = prior["finding"]["finding_hash"].as_str().unwrap_or_default().to_string();
        let prior_verdict = prior["finding"]["verdict"].as_str().unwrap_or_default().to_string();

        let args = TestArgs {
            baseline: manifest.baseline.endpoint.clone(),
            candidate: manifest.candidate.endpoint.clone(),
            suite: PathBuf::from(&manifest.suite_path),
            out: run_dir.parent().map(Path::to_path_buf).unwrap_or_else(|| PathBuf::from("runs")),
            driver,
            only: Some(workflow_id.into()),
            injected: manifest.injected.clone(),
            timeout,
            json: false,
        };
        let report = execute(&args, &format!("{}-repro-{}", manifest.run_id, run_id()))?;
        let now = &report.results[0].finding;
        let same = now.finding_hash == prior_hash;
        println!("workflow   {workflow_id}");
        println!("recorded   {prior_verdict}  {}", &prior_hash[..prior_hash.len().min(16)]);
        println!("reproduced {:?}  {}", now.verdict, &now.finding_hash[..16]);
        println!("{}", if same { "REPRODUCED: identical finding hash" } else { "NOT REPRODUCED: finding differs" });
        Ok(if !same { ExitCode::from(3) } else if now.verdict == Verdict::Regression { ExitCode::from(1) } else { ExitCode::SUCCESS })
    };
    inner().unwrap_or_else(|e| {
        eprintln!("error: {e:#}");
        ExitCode::from(2)
    })
}
