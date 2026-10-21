// Generated from the original static markup; class names and whitespace match it exactly.
export default function Harness() {
  return (
    <section className="frame harness" id="harness" aria-labelledby="h-title">
      {" "}
      <header className="sec-head">
        {" "}
        <p className="num">{"#01 / THE HARNESS"}</p>
        {" "}
        <h2 id="h-title">
          {"From a runtime upgrade"}
          <br />
          {"to a verdict you can trust."}
        </h2>
        {" "}
      </header>
      {" "}
      <div className="harness-body">
        {" "}
        <div className="tabs" role="tablist" aria-label="Commands" data-tabs="">
          {" "}
          <button type="button" role="tab" id="tab-doctor" aria-controls="pane" aria-selected="true" data-tab="doctor">
            {" "}
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="8.5"></circle>
              <path d="M12 7.5V12l3 2"></path>
            </svg>
            {" "}
            <b>{"DOCTOR"}</b>
            <span>{"Is the endpoint healthy, and what runtime does it run? One command, every layer."}</span>
            {" "}
          </button>
          {" "}
          <button type="button" role="tab" id="tab-compare" aria-controls="pane" aria-selected="false" data-tab="compare">
            {" "}
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M5 5h6v14H5zM13 5h6v14h-6z"></path>
            </svg>
            {" "}
            <b>{"COMPARE"}</b>
            <span>{"Every pallet, call, event, storage item and constant that moved, with hazards called out."}</span>
            {" "}
          </button>
          {" "}
          <button type="button" role="tab" id="tab-test" aria-controls="pane" aria-selected="false" data-tab="test">
            {" "}
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 8h5l2-4 3 9 2-5h4"></path>
              <path d="M4 17h5l2-2 2 2h7"></path>
            </svg>
            {" "}
            <b>{"TEST"}</b>
            <span>{"The same workflows on both runtimes. Exit 1 means it worked before and breaks after."}</span>
            {" "}
          </button>
          {" "}
        </div>
        {" "}
        <div className="pane-wrap">
          {" "}
          <canvas className="dither dim" data-dither="stairs" aria-hidden="true"></canvas>
          {" "}
          <div className="window" id="pane" role="tabpanel" aria-labelledby="tab-doctor" data-pane="">
            {" "}
            <div className="win-bar">
              <span className="win-name">
                <span className="dots" aria-hidden="true">
                  <b></b>
                  <b></b>
                  <b></b>
                </span>
                <span data-k="file">{"doctor.txt"}</span>
              </span>
              <button type="button" className="copy-ico" data-copy-pane="" aria-label="Copy command">
                <svg viewBox="0 0 16 16" aria-hidden="true">
                  <rect x="5" y="5" width="8.5" height="8.5" rx="1.5"></rect>
                  <path d="M10.5 5V3.5A1.5 1.5 0 0 0 9 2H3.5A1.5 1.5 0 0 0 2 3.5V9a1.5 1.5 0 0 0 1.5 1.5H5"></path>
                </svg>
              </button>
            </div>
            {" "}
            <div className="win-body">
              <div className="win-side">
                <span className="on">
                  <i>{"TX"}</i>
                  {"Text"}
                </span>
                <a data-k="json" href="#">
                  <i>{"JS"}</i>
                  {"JSON"}
                </a>
              </div>
              <pre className="win-code" data-k="code"></pre>
            </div>
            {" "}
            <p className="win-foot" data-k="foot"></p>
            {" "}
          </div>
          {" "}
        </div>
        {" "}
      </div>
      {" "}
      <a className="frame-link" href="https://github.com/Venkat5599/PRT/blob/main/docs/ARCHITECTURE.md">
        {"READ THE ARCHITECTURE "}
        <svg className="arr" viewBox="0 0 12 12" aria-hidden="true">
          <path d="M3.5 8.5l5-5M4.5 3.5h4v4"></path>
        </svg>
      </a>
      {" "}
    </section>
  );
}
