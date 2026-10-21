// Generated from the original static markup; class names and whitespace match it exactly.
export default function Flow() {
  return (
    <section className="flow" id="flow" aria-labelledby="f-title">
      {" "}
      <header className="split-head">
        {" "}
        <div>
          {" "}
          {" "}
          <h2 id="f-title">
            {"One setCode."}
            <br />
            {"A complete before and after."}
          </h2>
          {" "}
        </div>
        {" "}
        <p className="aside">
          {"The baseline becomes a reference."}
          <br />
          {"The candidate has to match it."}
        </p>
        {" "}
      </header>
      {" "}
      <div className="diagram" data-diagram="">
        {" "}
        <div className="card-node in">
          {" "}
          <p className="file">
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path d="M4 1.5h5l3 3v10H4z"></path>
              <path d="M9 1.5v3h3"></path>
            </svg>
            {"baseline · spec 1002"}
          </p>
          {" "}
          <p className="q">
            {"Balances, fees and storage"}
            <br />
            {"as they are "}
            <b>{"today."}</b>
          </p>
          {" "}
          <p className="meta">{"SNAPSHOT AT BLOCK #4"}</p>
          {" "}
        </div>
        {" "}
        <svg className="wires" aria-hidden="true" data-wires=""></svg>
        {" "}
        <div className="hub">
          {" "}
          <span className="sat s1">
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path d="M3 5h10M3 8h10M3 11h6"></path>
            </svg>
            {"Workflows"}
          </span>
          {" "}
          <span className="sat s2">
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path d="M3 8h10M8 3v10"></path>
            </svg>
            {"Invariants"}
          </span>
          {" "}
          <div className="core">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 3v6M12 15v6M5 12H3M21 12h-2M7.5 7.5l3 3M13.5 13.5l3 3M16.5 7.5l-3 3M10.5 13.5l-3 3"></path>
            </svg>
            <i></i>
          </div>
          {" "}
          <span className="sat s3">
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path d="M3 4h4v8H3zM9 4h4v8H9z"></path>
            </svg>
            {"Diff "}
            <em>{"✓"}</em>
          </span>
          {" "}
          <p className="hub-cap">{"SYSTEM.SETCODE + 3 BLOCKS"}</p>
          {" "}
        </div>
        {" "}
        <div className="card-node out">
          {" "}
          <p className="file">
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path d="M4 1.5h5l3 3v10H4z"></path>
              <path d="M9 1.5v3h3"></path>
            </svg>
            {"report.html"}
            <svg className="ok" viewBox="0 0 16 16" aria-hidden="true">
              <path d="M2 8.5l3 3 5-6M7 11.5l1 0 6-7"></path>
            </svg>
          </p>
          {" "}
          <p className="t">{"The verdict."}</p>
          {" "}
          <ol>
            <li>
              <i>{"01"}</i>
              {"What broke, and how badly"}
            </li>
            <li>
              <i>{"02"}</i>
              {"Baseline vs candidate state"}
            </li>
            <li>
              <i>{"03"}</i>
              {"One command to reproduce"}
            </li>
          </ol>
          {" "}
          <p className="meta ok-line">
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path d="M3 8.5l3 3 7-7"></path>
            </svg>
            {"HASHED AND ATTESTED"}
          </p>
          {" "}
        </div>
        {" "}
      </div>
      {" "}
      <div className="steps" role="tablist" aria-label="Upgrade steps" data-steps="">
        {" "}
        <button type="button" role="tab" aria-selected="true" data-step="0">
          <i>{"01"}</i>
          <b>{"Snapshot the baseline"}</b>
          <span className="bar">
            <span></span>
          </span>
        </button>
        {" "}
        <button type="button" role="tab" aria-selected="false" data-step="1">
          <i>{"02"}</i>
          <b>{"Apply the candidate"}</b>
          <span className="bar">
            <span></span>
          </span>
        </button>
        {" "}
        <button type="button" role="tab" aria-selected="false" data-step="2">
          <i>{"03"}</i>
          <b>{"Return a verdict"}</b>
          <span className="bar">
            <span></span>
          </span>
        </button>
        {" "}
      </div>
      {" "}
      <div className="step-text">
        {" "}
        <p data-k="steptext">{"Run every workflow against the live baseline and record balances, fees, events and storage, block by block."}</p>
        {" "}
        <p className="step-io" data-k="stepio">{"INPUT / ws://127.0.0.1:9944"}</p>
        {" "}
      </div>
      {" "}
    </section>
  );
}
