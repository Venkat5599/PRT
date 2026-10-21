// Generated from the original static markup; class names and whitespace match it exactly.
export default function Hero() {
  return (
    <header className="hero" id="top">
      <canvas className="dither hero-bg" data-dither="hero" aria-hidden="true"></canvas>
      {" "}
      {" "}
      <h1>
        {"Upgrade the runtime."}
        <br />
        {"Know what "}
        <em>{"breaks."}</em>
      </h1>
      {" "}
      <p className="sub">
        {"Canary runs the same workflows before and after a Portaldot runtime upgrade, "}
        <br className="br" />
        {"shows the exact state that diverged, and hands you one command to reproduce it."}
      </p>
      {" "}
      <div className="cta">
        {" "}
        <a className="btn btn-ghost" href="/dashboard#runs">{"See a run"}</a>
        {" "}
        <a className="btn btn-blue" href="#live">{"Compare live"}</a>
        {" "}
      </div>
      {" "}
      <figure className="stage" aria-label="Recorded run console over a dithered mountain landscape">
        {" "}
        {" "}
        <div className="console" data-console="">
          {" "}
          <p className="cmd">
            <span className="prompt">{"$"}</span>
            {" "}
            <span data-k="cmd">{"canary test --baseline ws://127.0.0.1:9944 --candidate ws://127.0.0.1:9945"}</span>
          </p>
          {" "}
          <div className="console-out" aria-live="polite">
            {" "}
            <strong data-k="big" className="same">{"Loading run…"}</strong>
            {" "}
            <span data-k="small"></span>
            {" "}
          </div>
          {" "}
          <div className="console-bar">
            {" "}
            <div className="picker" data-picker="">
              {" "}
              <button type="button" className="picker-btn" aria-haspopup="listbox" aria-expanded="false" data-picker-btn="">
                {" "}
                <svg viewBox="0 0 14 14" aria-hidden="true">
                  <path d="M2 3.5l3 3-3 3M7 10.5h5"></path>
                </svg>
                {" "}
                <span data-k="runname">{"Deposit ×100"}</span>
                {" "}
                <svg className="chev" viewBox="0 0 12 12" aria-hidden="true">
                  <path d="M3 4.5l3 3 3-3"></path>
                </svg>
                {" "}
              </button>
              {" "}
              <ul className="picker-menu" role="listbox" aria-label="Recorded runs" data-runs="" hidden></ul>
              {" "}
            </div>
            {" "}
            <a className="go" href="/dashboard#runs" aria-label="Open every recorded run on the dashboard">
              <svg viewBox="0 0 16 16" aria-hidden="true">
                <path d="M8 13V3M3.5 7.5L8 3l4.5 4.5"></path>
              </svg>
            </a>
            {" "}
          </div>
          {" "}
          <p className="console-foot">{"Recorded runs on local dev nodes. Pick one to see its verdict."}</p>
          {" "}
        </div>
        {" "}
        <figcaption className="stage-cap">{"ONE RUNTIME. TWO RUNS. EVERY DIFFERENCE ACCOUNTED FOR."}</figcaption>
        {" "}
      </figure>
      {" "}
    </header>
  );
}
