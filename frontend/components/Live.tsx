// Generated from the original static markup; class names and whitespace match it exactly.
export default function Live({ standalone = false }: { standalone?: boolean }) {
  return (
    <section className={standalone ? "frame live is-standalone" : "frame live"} id="live" aria-labelledby="l-title" data-live="">
      {" "}
      <header className="live-head">
        {" "}
        <h2 id="l-title">
          {"Two runtimes,"}
          <br />
          {" "}
          <em>{"diffed live."}</em>
        </h2>
        {" "}
        <p className="lead">
          {"Your browser opens a WebSocket to each node and runs Canary's Rust engine, compiled to WebAssembly. Same decoder, same diff, same hazard rules as "}
          <code>{"canary compare"}</code>
          {". Nothing to install."}
          {!standalone && (
            <a className="dash-link" href="/dashboard">
              {"Open the full dashboard"}
              <svg className="arr" viewBox="0 0 12 12" aria-hidden="true"><path d="M3.5 8.5l5-5M4.5 3.5h4v4"></path></svg>
            </a>
          )}
        </p>
        {" "}
      </header>
      {" "}
      <form className="live-form pairs" data-live-form="">
        <input type="hidden" name="baseline" defaultValue="wss://mainnet.portaldot.io" />
        <input type="hidden" name="candidate" defaultValue="wss://test-node-v3.portaldot.dev" />
        <div className="pair-group" role="group" aria-label="Runtimes to compare">
          <button type="button" className="pair" data-pair="wss://mainnet.portaldot.io wss://test-node-v3.portaldot.dev" aria-pressed="true"><b>{"Mainnet → V3"}</b><small>{"The upgrade question"}</small></button>
          <button type="button" className="pair" data-pair="wss://test-node-v3.portaldot.dev wss://test-node-v3.portaldot.dev" aria-pressed="false"><b>{"V3 → V3"}</b><small>{"Control: nothing should differ"}</small></button>
          <button type="button" className="pair" data-pair="wss://mainnet.portaldot.io wss://mainnet.portaldot.io" aria-pressed="false"><b>{"Mainnet → Mainnet"}</b><small>{"Control on the live chain"}</small></button>
        </div>
        <button type="submit" className="btn btn-blue run-btn" data-run-btn="">{"Compare"}</button>
      </form>
      {" "}
      <div className="lanes">
        {" "}
        <div className="lane" data-lane="baseline">
          {" "}
          <p className="lane-id">
            <b>{"A"}</b>
            <span data-l="chain">{"Baseline"}</span>
          </p>
          {" "}
          <dl className="lane-facts">
            <div>
              <dt>{"runtime"}</dt>
              <dd data-l="spec">{"–"}</dd>
            </div>
            <div>
              <dt>{"metadata"}</dt>
              <dd data-l="md">{"–"}</dd>
            </div>
            <div>
              <dt>{"pallets"}</dt>
              <dd data-l="pallets">{"–"}</dd>
            </div>
            <div>
              <dt>{"head"}</dt>
              <dd data-l="head">{"–"}</dd>
            </div>
          </dl>
          {" "}
          <svg className="lane-blocks" data-l="blocks" viewBox="0 0 560 40" preserveAspectRatio="xMaxYMid meet" aria-hidden="true"></svg>
          {" "}
          <p className="lane-state" data-l="state">{"Waiting to connect."}</p>
          {" "}
        </div>
        {" "}
        <div className="lane" data-lane="candidate">
          {" "}
          <p className="lane-id">
            <b>{"B"}</b>
            <span data-l="chain">{"Candidate"}</span>
          </p>
          {" "}
          <dl className="lane-facts">
            <div>
              <dt>{"runtime"}</dt>
              <dd data-l="spec">{"–"}</dd>
            </div>
            <div>
              <dt>{"metadata"}</dt>
              <dd data-l="md">{"–"}</dd>
            </div>
            <div>
              <dt>{"pallets"}</dt>
              <dd data-l="pallets">{"–"}</dd>
            </div>
            <div>
              <dt>{"head"}</dt>
              <dd data-l="head">{"–"}</dd>
            </div>
          </dl>
          {" "}
          <svg className="lane-blocks" data-l="blocks" viewBox="0 0 560 40" preserveAspectRatio="xMaxYMid meet" aria-hidden="true"></svg>
          {" "}
          <p className="lane-state" data-l="state">{"Waiting to connect."}</p>
          {" "}
        </div>
        {" "}
      </div>
      {" "}
      <div className="live-verdict" aria-live="polite">
        {" "}
        <p className="verdict-line" data-k="verdict">{"Press Compare, or scroll here and it starts on its own."}</p>
        {" "}
        <p className="verdict-sub" data-k="verdict-sub"></p>
        {" "}
      </div>
      {" "}
      <div className="tally" data-tally="" hidden>
        {" "}
        <div>
          <b data-t="pallets">{"–"}</b>
          <span>{"Pallets added / removed"}</span>
        </div>
        {" "}
        <div>
          <b data-t="indices">{"–"}</b>
          <span>{"Pallet indices moved"}</span>
        </div>
        {" "}
        <div>
          <b data-t="calls">{"–"}</b>
          <span>{"Calls added / removed / changed"}</span>
        </div>
        {" "}
        <div className="hz">
          <b data-t="hazards">{"–"}</b>
          <span>{"Upgrade hazards"}</span>
        </div>
        {" "}
        <div className="minor">
          <b data-t="events">{"–"}</b>
          <span>{"Events"}</span>
        </div>
        {" "}
        <div className="minor">
          <b data-t="storage">{"–"}</b>
          <span>{"Storage items"}</span>
        </div>
        {" "}
        <div className="minor">
          <b data-t="constants">{"–"}</b>
          <span>{"Constants"}</span>
        </div>
        {" "}
        <div className="minor">
          <b data-t="errors">{"–"}</b>
          <span>{"Errors"}</span>
        </div>
        {" "}
      </div>
      {" "}
      <ul className="hazards" data-hazards="" hidden></ul>
      {" "}
      <div className="explorer" data-explorer="" hidden>
        {" "}
        <div className="explorer-bar">
          {" "}
          <div className="filters" role="group" aria-label="Filter changes" data-cats=""></div>
          {" "}
        </div>
        {" "}
        <ul className="changes" data-changes=""></ul>
        {" "}
        <div className="explorer-foot">
          {" "}
          <button type="button" className="more" data-more="" hidden>{"Show more"}</button>
          {" "}
          <span className="count" data-count=""></span>
          {" "}
          <button type="button" className="copy" data-copy-cli="">
            <code data-k="cli"></code>
            <span>{"copy"}</span>
          </button>
          {" "}
          <a className="dl" href="#" download="compare.json" data-download="">{"Download compare.json"}</a>
          {" "}
        </div>
        {" "}
      </div>
      {" "}
    </section>
  );
}
