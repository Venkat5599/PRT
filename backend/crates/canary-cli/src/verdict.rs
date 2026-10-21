//! Classify a baseline/candidate pair of runs into a finding.
//!
//! REGRESSION    an expectation holds on the baseline and fails on the candidate
//! DIFFERENCE    observable behaviour differs, but every expectation still holds
//! INCONCLUSIVE  the comparison is not trustworthy (setup failed, or the baseline
//!               itself violates the expectation)
//! PASS          all expectations hold on both, and nothing observable differs

use serde::Serialize;
use sha2::{Digest, Sha256};

use crate::runner::SideRun;
use crate::workflow::{Importance, Workflow};

#[derive(Debug, Clone, Copy, Serialize, PartialEq, Eq, PartialOrd, Ord)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum Verdict {
    Pass,
    Difference,
    Inconclusive,
    Regression,
}

#[derive(Debug, Clone, Copy, Serialize, PartialEq, Eq, PartialOrd, Ord)]
#[serde(rename_all = "snake_case")]
pub enum Severity {
    Info,
    Low,
    Medium,
    High,
    Critical,
}

#[derive(Debug, Clone, Serialize)]
pub struct Contrast {
    pub what: String,
    pub baseline: String,
    pub candidate: String,
}

#[derive(Debug, Clone, Serialize)]
pub struct Finding {
    pub workflow: String,
    pub verdict: Verdict,
    pub severity: Severity,
    pub rationale: String,
    /// Expectations that passed on the baseline and failed on the candidate.
    pub regressed: Vec<Contrast>,
    /// Expectations the baseline itself failed (makes the result inconclusive).
    pub baseline_failures: Vec<Contrast>,
    /// Observable differences: step outcomes, emitted events, balance deltas.
    pub differences: Vec<Contrast>,
    /// Differences inside the declared tolerance (e.g. fee-multiplier drift). Shown, not counted.
    pub normalised: Vec<Contrast>,
    pub finding_hash: String,
}

fn severity_for(kind: &str, importance: Importance) -> Severity {
    match (kind, importance) {
        ("invariant", _) => Severity::Critical,
        ("dispatch" | "delta", Importance::Core) => Severity::High,
        ("dispatch" | "delta", Importance::Normal) => Severity::Medium,
        _ => Severity::Medium,
    }
}

fn within_ppm(a: &str, b: &str, ppm: u64) -> bool {
    let (Ok(x), Ok(y)) = (a.trim_start_matches('+').parse::<i128>(), b.trim_start_matches('+').parse::<i128>()) else {
        return false;
    };
    let scale = x.abs().max(y.abs());
    (x - y).abs() * 1_000_000 <= scale * ppm as i128
}

/// Returns (differences, normalised): deltas inside the tolerance are kept for transparency.
/// Events listed in `history_events` depend on chain history rather than the runtime
/// (e.g. `contracts.CodeStored` only fires the first time a code blob is uploaded), so a
/// difference in them alone is normalised, not reported.
fn differences(b: &SideRun, c: &SideRun, wf: &Workflow) -> (Vec<Contrast>, Vec<Contrast>) {
    let mut out = Vec::new();
    let mut normalised = Vec::new();
    for (i, (sb, sc)) in b.steps.iter().zip(&c.steps).enumerate() {
        if sb.status != sc.status {
            out.push(Contrast { what: format!("step {i} status"), baseline: sb.status.clone(), candidate: sc.status.clone() });
        }
        let names = |s: &crate::runner::StepOutcome, skip_history: bool| {
            s.events
                .iter()
                .filter(|e| !skip_history || !wf.history_events.iter().any(|h| h.eq_ignore_ascii_case(&e.name)))
                .map(|e| e.name.clone())
                .collect::<Vec<_>>()
                .join(", ")
        };
        if names(sb, false) != names(sc, false) {
            let item = Contrast { what: format!("step {i} events"), baseline: names(sb, false), candidate: names(sc, false) };
            if names(sb, true) == names(sc, true) { normalised.push(item) } else { out.push(item) }
        }
    }
    let ppm = wf.delta_tolerance_ppm;
    for (k, vb) in &b.deltas {
        let vc = c.deltas.get(k).cloned().unwrap_or_else(|| "-".into());
        if *vb != vc {
            let item = Contrast { what: format!("delta {k}"), baseline: vb.clone(), candidate: vc.clone() };
            if within_ppm(vb, &vc, ppm) { normalised.push(item) } else { out.push(item) }
        }
    }
    (out, normalised)
}

pub fn classify(wf: &Workflow, b: &SideRun, c: &SideRun) -> Finding {
    let mut regressed = Vec::new();
    let mut baseline_failures = Vec::new();
    let mut worst: Option<Severity> = None;
    for (eb, ec) in b.expectations.iter().zip(&c.expectations) {
        let contrast = Contrast { what: eb.description.clone(), baseline: eb.observed.clone(), candidate: ec.observed.clone() };
        if !eb.pass {
            baseline_failures.push(contrast);
        } else if !ec.pass {
            let s = severity_for(eb.kind, wf.importance);
            worst = Some(worst.map_or(s, |w| w.max(s)));
            regressed.push(contrast);
        }
    }
    let (diffs, normalised) = differences(b, c, wf);

    let (verdict, severity, rationale) = if let Some(e) = b.setup_error.as_ref().or(c.setup_error.as_ref()) {
        (Verdict::Inconclusive, Severity::Info, format!("setup failed, runs not comparable: {e}"))
    } else if !baseline_failures.is_empty() {
        (Verdict::Inconclusive, Severity::Info,
         format!("{} expectation(s) fail on the baseline itself; fix the workflow or the baseline first", baseline_failures.len()))
    } else if let Some(sev) = worst {
        (Verdict::Regression, sev, format!(
            "{} expectation(s) hold on the baseline and fail on the candidate under identical setup; worst kind drives severity ({} workflow)",
            regressed.len(), if wf.importance == Importance::Core { "core" } else { "normal" }))
    } else if !diffs.is_empty() {
        (Verdict::Difference, Severity::Low,
         format!("{} observable difference(s), but every declared expectation still holds", diffs.len()))
    } else {
        (Verdict::Pass, Severity::Info, "all expectations hold on both runtimes; no observable differences".into())
    };

    // Identity of a finding = which checks broke, not their run-specific numbers
    // (fees and chain-wide totals drift between runs), so `reproduce` can match it.
    let whats = |v: &[Contrast]| v.iter().map(|c| c.what.clone()).collect::<Vec<_>>();
    let digest_input = serde_json::json!({ "workflow": wf.id, "verdict": verdict, "regressed": whats(&regressed),
                                           "baseline_failures": whats(&baseline_failures), "differences": whats(&diffs) });
    let finding_hash = hex::encode(Sha256::digest(digest_input.to_string().as_bytes()));

    Finding {
        workflow: wf.id.clone(),
        verdict,
        severity,
        rationale,
        regressed,
        baseline_failures,
        differences: diffs,
        normalised,
        finding_hash,
    }
}

#[cfg(test)]
mod tests {
    use super::{differences, within_ppm};
    use crate::runner::{EventRec, SideRun, StepOutcome};

    fn side(events: &[&str]) -> SideRun {
        let step = StepOutcome {
            index: 0,
            call: "Contracts.instantiateWithCode".into(),
            status: "success".into(),
            block_hash: None,
            dispatch_error: None,
            tx_hash: None,
            events: events.iter().map(|n| EventRec { name: n.to_string(), data: serde_json::Value::Null }).collect(),
        };
        SideRun {
            side: "x".into(),
            endpoint: "ws://x".into(),
            setup_error: None,
            pre_block: None,
            post_block: None,
            steps: vec![step],
            deltas: Default::default(),
            expectations: vec![],
        }
    }

    #[test]
    fn history_events_are_normalised_not_reported() {
        let wf = crate::workflow::parse(
            b"id: t\nhistory_events: [contracts.CodeStored]\nsteps: [{ call: A.b, signer: a }]\nexpect: []\n",
        )
        .unwrap();
        let b = side(&["contracts.CodeStored", "contracts.Instantiated"]);
        let c = side(&["contracts.Instantiated"]);
        let (diffs, normalised) = differences(&b, &c, &wf);
        assert!(diffs.is_empty());
        assert_eq!(normalised.len(), 1);

        let other = side(&["contracts.Terminated"]);
        assert_eq!(differences(&b, &other, &wf).0.len(), 1);
    }

    #[test]
    fn fee_drift_is_within_one_ppm() {
        assert!(within_ppm("-101470323190196", "-101470323188215", 1));
    }

    #[test]
    fn real_fee_change_is_not() {
        // 1 POT transfer, fee doubles from 0.0147 to 0.0294 POT.
        assert!(!within_ppm("-101470000000000", "-102940000000000", 1));
    }
}
