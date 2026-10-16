//! Run manifest plus JSON and static HTML reports.

use std::path::Path;
use std::time::Duration;

use canary_chain::{metadata, storage};
use serde::Serialize;
use serde_json::json;

use crate::invariants::connect;
use crate::runner::SideRun;
use crate::verdict::{Finding, Verdict};

#[derive(Debug, Clone, Serialize, serde::Deserialize)]
pub struct RuntimeId {
    pub endpoint: String,
    pub spec_name: Option<String>,
    pub spec_version: Option<u64>,
    pub transaction_version: Option<u64>,
    pub genesis_hash: Option<String>,
    pub metadata_sha256: Option<String>,
    pub metadata_version: Option<u8>,
}

pub fn identify(ws: &str, timeout: Duration) -> RuntimeId {
    let mut id = RuntimeId {
        endpoint: ws.into(),
        spec_name: None,
        spec_version: None,
        transaction_version: None,
        genesis_hash: None,
        metadata_sha256: None,
        metadata_version: None,
    };
    if let Ok(mut rpc) = connect(ws, timeout) {
        if let Ok(rv) = rpc.call("state_getRuntimeVersion", json!([])) {
            id.spec_name = rv["specName"].as_str().map(String::from);
            id.spec_version = rv["specVersion"].as_u64();
            id.transaction_version = rv["transactionVersion"].as_u64();
        }
        id.genesis_hash = rpc.call("chain_getBlockHash", json!([0])).ok().and_then(|v| v.as_str().map(String::from));
        if let Some(fp) = rpc
            .call("state_getMetadata", json!([]))
            .ok()
            .and_then(|v| v.as_str().map(String::from))
            .and_then(|h| storage::from_hex(&h).ok())
            .and_then(|b| metadata::fingerprint(&b).ok())
        {
            id.metadata_sha256 = Some(fp.sha256);
            id.metadata_version = Some(fp.version);
        }
    }
    id
}

#[derive(Debug, Clone, Serialize, serde::Deserialize)]
pub struct SuiteFile {
    pub workflow: String,
    pub path: String,
    pub sha256: String,
}

#[derive(Debug, Clone, Serialize, serde::Deserialize)]
pub struct Manifest {
    pub run_id: String,
    pub canary_version: String,
    pub started_unix: u64,
    pub suite_path: String,
    pub suite: Vec<SuiteFile>,
    pub baseline: RuntimeId,
    pub candidate: RuntimeId,
    pub injected: Option<String>,
}

#[derive(Debug, Clone, Serialize)]
pub struct WorkflowResult {
    pub finding: Finding,
    pub baseline: SideRun,
    pub candidate: SideRun,
    pub reproduce: String,
}

#[derive(Debug, Clone, Serialize)]
pub struct Summary {
    pub workflows: usize,
    pub pass: usize,
    pub difference: usize,
    pub inconclusive: usize,
    pub regression: usize,
    pub statement: String,
}

#[derive(Debug, Clone, Serialize)]
pub struct Report {
    pub manifest: Manifest,
    pub summary: Summary,
    pub results: Vec<WorkflowResult>,
}

pub fn summarize(results: &[WorkflowResult]) -> Summary {
    let count = |v: Verdict| results.iter().filter(|r| r.finding.verdict == v).count();
    let (pass, difference, inconclusive, regression) =
        (count(Verdict::Pass), count(Verdict::Difference), count(Verdict::Inconclusive), count(Verdict::Regression));
    let expectations: usize = results.iter().map(|r| r.baseline.expectations.len()).sum();
    let statement = if regression > 0 {
        format!("{regression} regression(s) detected across {} workflow(s).", results.len())
    } else {
        // A finite corpus never proves an upgrade safe; say exactly what was checked.
        format!(
            "No regression detected in the configured corpus ({} workflows, {expectations} expectations).{}",
            results.len(),
            if inconclusive > 0 { format!(" {inconclusive} workflow(s) inconclusive.") } else { String::new() }
        )
    };
    Summary { workflows: results.len(), pass, difference, inconclusive, regression, statement }
}

fn esc(s: &str) -> String {
    s.replace('&', "&amp;").replace('<', "&lt;").replace('>', "&gt;").replace('"', "&quot;")
}

fn verdict_class(v: Verdict) -> &'static str {
    match v {
        Verdict::Regression => "v-reg",
        Verdict::Difference => "v-diff",
        Verdict::Inconclusive => "v-inc",
        Verdict::Pass => "v-pass",
    }
}

fn contrast_rows(title: &str, rows: &[crate::verdict::Contrast]) -> String {
    if rows.is_empty() {
        return String::new();
    }
    let body: String = rows
        .iter()
        .map(|c| format!("<tr><td>{}</td><td class=\"d\">{}</td><td class=\"d\">{}</td></tr>", esc(&c.what), esc(&c.baseline), esc(&c.candidate)))
        .collect();
    format!("<h4>{title}</h4><table><thead><tr><th>check</th><th>baseline</th><th>candidate</th></tr></thead><tbody>{body}</tbody></table>")
}

fn runtime_line(label: &str, r: &RuntimeId) -> String {
    format!(
        "<div class=\"rt\"><b>{label}</b> <span>{}</span> <span>spec {}#{} · tx {}</span> <span class=\"d\">metadata V{} {}</span></div>",
        esc(&r.endpoint),
        esc(r.spec_name.as_deref().unwrap_or("-")),
        r.spec_version.map(|v| v.to_string()).unwrap_or("-".into()),
        r.transaction_version.map(|v| v.to_string()).unwrap_or("-".into()),
        r.metadata_version.map(|v| v.to_string()).unwrap_or("-".into()),
        esc(r.metadata_sha256.as_deref().map(|s| &s[..16]).unwrap_or("-")),
    )
}

pub fn html(r: &Report) -> String {
    let s = &r.summary;
    let cards: String = r
        .results
        .iter()
        .map(|w| {
            let f = &w.finding;
            format!(
                "<section class=\"wf {cls}\"><header><span class=\"verdict\">{v:?}</span><span class=\"sev\">{sev:?}</span><h3>{id}</h3></header>\
                 <p class=\"why\">{why}</p>{reg}{base}{diff}{norm}\
                 <p class=\"meta\">blocks · baseline {bp} → {bq} · candidate {cp} → {cq}</p>\
                 <p class=\"meta\">reproduce <code>{repro}</code> · finding <code>{hash}</code></p></section>",
                cls = verdict_class(f.verdict),
                v = f.verdict,
                sev = f.severity,
                id = esc(&f.workflow),
                why = esc(&f.rationale),
                reg = contrast_rows("Regressed expectations", &f.regressed),
                base = contrast_rows("Failing on baseline", &f.baseline_failures),
                diff = contrast_rows("Observable differences", &f.differences),
                norm = contrast_rows("Normalised (within tolerance, not counted)", &f.normalised),
                bp = short(&w.baseline.pre_block),
                bq = short(&w.baseline.post_block),
                cp = short(&w.candidate.pre_block),
                cq = short(&w.candidate.post_block),
                repro = esc(&w.reproduce),
                hash = &f.finding_hash[..16],
            )
        })
        .collect();
    let injected = r
        .manifest
        .injected
        .as_ref()
        .map(|i| format!("<p class=\"inj\"><b>Injected candidate.</b>{}. This is a deliberately modified test runtime, not a Portaldot production finding.</p>", esc(i)))
        .unwrap_or_default();
    format!(
        r#"<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Canary report {run}</title><style>
:root{{--bg:#f4f6f1;--ink:#16201a;--mute:#5c6b60;--line:#d3dccf;--reg:#8a1f1f;--diff:#7a5b12;--inc:#4b5563;--pass:#2f5d3a;--panel:#fbfcf9}}
@media (prefers-color-scheme:dark){{:root{{--bg:#111712;--ink:#e6ece5;--mute:#93a397;--line:#2a352d;--reg:#f08a7e;--diff:#e3c069;--inc:#a7b0bb;--pass:#8fd19e;--panel:#161e18}}}}
*{{box-sizing:border-box}}body{{margin:0;background:var(--bg);color:var(--ink);font:15px/1.5 system-ui,-apple-system,"Segoe UI",sans-serif}}
main{{max-width:1040px;margin:0 auto;padding:40px 20px 80px}}
h1{{font-size:30px;margin:0 0 6px;letter-spacing:-.01em}}.statement{{font-size:18px;margin:0 0 24px}}
.counts{{display:flex;gap:28px;flex-wrap:wrap;margin:0 0 28px}}.counts div{{font-size:13px;color:var(--mute)}}.counts b{{display:block;font-size:28px;color:var(--ink)}}
.rt{{display:flex;gap:14px;flex-wrap:wrap;font-size:13px;padding:6px 0;color:var(--mute)}}.rt b{{color:var(--ink);width:80px}}
.inj{{padding:12px 16px;background:var(--panel);border-radius:10px;font-size:14px;color:var(--mute)}}.inj b{{color:var(--ink);font-weight:650;margin-right:6px}}
.wf{{background:var(--panel);border-radius:10px;padding:18px 20px;margin:16px 0;border:1px solid var(--line)}}
.wf header{{display:flex;align-items:baseline;gap:12px}}.wf h3{{margin:0;font-size:17px}}
.verdict{{font-weight:700;font-size:13px}}.sev{{font-size:13px;color:var(--mute)}}
.v-reg .verdict{{color:var(--reg)}}.v-diff .verdict{{color:var(--diff)}}.v-inc .verdict{{color:var(--inc)}}.v-pass .verdict{{color:var(--pass)}}
.v-reg{{border-color:color-mix(in srgb,var(--reg) 45%,var(--line))}}
.why{{margin:8px 0 4px}}h4{{margin:14px 0 6px;font-size:13px;color:var(--mute);font-weight:600}}
table{{width:100%;border-collapse:collapse;font-size:13px}}th,td{{text-align:left;padding:6px 8px;border-top:1px solid var(--line);vertical-align:top;overflow-wrap:anywhere}}th{{color:var(--mute);font-weight:600}}
.d,code{{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:12px}}.meta{{font-size:12px;color:var(--mute);margin:6px 0 0}}
</style></head><body><main>
<h1>Portal Canary</h1><p class="statement">{statement}</p>
<div class="counts"><div><b>{reg}</b>regression</div><div><b>{diff}</b>difference</div><div><b>{inc}</b>inconclusive</div><div><b>{pass}</b>pass</div></div>
{injected}{base}{cand}
<p class="meta">run {run} · canary {ver} · {n} workflow file(s)</p>
{cards}
</main></body></html>"#,
        run = esc(&r.manifest.run_id),
        statement = esc(&s.statement),
        reg = s.regression,
        diff = s.difference,
        inc = s.inconclusive,
        pass = s.pass,
        injected = injected,
        base = runtime_line("baseline", &r.manifest.baseline),
        cand = runtime_line("candidate", &r.manifest.candidate),
        ver = esc(&r.manifest.canary_version),
        n = r.manifest.suite.len(),
        cards = cards,
    )
}

fn short(h: &Option<String>) -> String {
    h.as_deref().map(|s| s.chars().take(10).collect()).unwrap_or_else(|| "-".into())
}

pub fn write(dir: &Path, r: &Report) -> anyhow::Result<()> {
    std::fs::create_dir_all(dir)?;
    std::fs::write(dir.join("report.json"), serde_json::to_string_pretty(r)?)?;
    std::fs::write(dir.join("report.html"), html(r))?;
    Ok(())
}
