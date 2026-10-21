// Generated from the original static markup; class names and whitespace match it exactly.
export default function Start() {
  return (
    <section className="start" id="start" aria-labelledby="s-title">
      {" "}
      <canvas className="dither" data-dither="summit" aria-hidden="true"></canvas>
      {" "}
      <div className="start-in">
        {" "}
        <h2 id="s-title">
          {"Give your next upgrade"}
          <br />
          {"a "}
          <em>{"dress rehearsal."}</em>
        </h2>
        {" "}
        <div className="term">
          {" "}
          <pre><code><span>{"cargo build --release"}</span>{"\n"}<span>{"canary doctor   --ws wss://test-node-v3.portaldot.dev"}</span>{"\n"}<span>{"canary compare  --baseline wss://mainnet.portaldot.io --candidate wss://test-node-v3.portaldot.dev"}</span>{"\n"}<span>{"canary test     --baseline ws://127.0.0.1:9944 --candidate ws://127.0.0.1:9945"}</span>{"\n"}<span>{"canary reproduce balances.transfer.basic --run runs/<id>"}</span></code></pre>
          {" "}
          <button type="button" className="copy-ico" data-copy="cargo build --release" aria-label="Copy first command">
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <rect x="5" y="5" width="8.5" height="8.5" rx="1.5"></rect>
              <path d="M10.5 5V3.5A1.5 1.5 0 0 0 9 2H3.5A1.5 1.5 0 0 0 2 3.5V9a1.5 1.5 0 0 0 1.5 1.5H5"></path>
            </svg>
          </button>
          {" "}
        </div>
        {" "}
        <dl className="exits">
          <div>
            <dt>{"0"}</dt>
            <dd>{"Pass, or a difference where every expectation still holds"}</dd>
          </div>
          <div>
            <dt>{"1"}</dt>
            <dd>{"Regression: holds on the baseline, fails on the candidate"}</dd>
          </div>
          <div>
            <dt>{"2"}</dt>
            <dd>{"Inconclusive: not comparable, never reported as success"}</dd>
          </div>
        </dl>
        {" "}
        <div className="cta">
          {" "}
          <a className="btn btn-blue" href="https://github.com/Venkat5599/PRT">
            {"Get the source "}
            <svg className="arr" viewBox="0 0 12 12" aria-hidden="true">
              <path d="M3.5 8.5l5-5M4.5 3.5h4v4"></path>
            </svg>
          </a>
          {" "}
          <span className="action-note">
            {"Also a GitHub Action: "}
            <code>{"uses: Venkat5599/PRT@main"}</code>
          </span>
          {" "}
        </div>
        {" "}
      </div>
      {" "}
    </section>
  );
}
