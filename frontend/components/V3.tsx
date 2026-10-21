// Generated from the original static markup; class names and whitespace match it exactly.
export default function V3() {
  return (
    <section className="frame v3" id="v3" aria-labelledby="v-title">
      {" "}
      <header className="sec-head">
        {" "}
        <p className="num">{"#03 / PORTALDOT V3"}</p>
        {" "}
        <h2 id="v-title">
          {"Mainnet against V3, "}
          <em>{"read live."}</em>
        </h2>
        {" "}
        <p className="lead">{"The first diff of Portaldot mainnet (spec 1002, metadata V13) against the PortaldotV3 testnet (spec 3002, metadata V14), taken on 17 October 2026."}</p>
        {" "}
      </header>
      {" "}
      <div className="v3-grid">
        {" "}
        <div>
          <b>{"+40"}</b>
          <span>{"Pallets added"}</span>
          <small>{"Revive, Nfts, Uniques, NominationPools, AssetConversion, Beefy…"}</small>
        </div>
        {" "}
        <div>
          <b>{"21"}</b>
          <span>{"Pallet indices moved"}</span>
          <small>{"Every client that encodes calls by index must re-read metadata."}</small>
        </div>
        {" "}
        <div className="hz">
          <b>{"3"}</b>
          <span>{"Upgrade hazards"}</span>
          <small>{"BABE slot 60 s → 6 s, epoch 120 → 600, timestamp period. setCode would halt the chain."}</small>
        </div>
        {" "}
        <div>
          <b>{"1 byte"}</b>
          <span>{"Drifting metadata"}</span>
          <small>
            <code>{"Revive.EthBlockBuilderIR"}</code>
            {"'s default changes the V3 metadata hash every few minutes."}
          </small>
        </div>
        {" "}
      </div>
      {" "}
      <div className="setcode">
        {" "}
        <p className="setcode-title">
          {"Every local candidate went in through "}
          <code>{"system.setCode"}</code>
          {", and counts only after three more blocks."}
        </p>
        {" "}
        <div className="chains">
          {" "}
          <article className="chain">
            <h4>
              {"clean "}
              <small>{"1002 → 1003"}</small>
            </h4>
            <svg viewBox="0 0 400 54" preserveAspectRatio="none" data-blocks="live" aria-label="blocks #4 to #7 after setCode"></svg>
            <p>{"#4 → #7, live"}</p>
          </article>
          {" "}
          <article className="chain">
            <h4>
              {"fee10x "}
              <small>{"injected · 1002 → 1005"}</small>
            </h4>
            <svg viewBox="0 0 400 54" preserveAspectRatio="none" data-blocks="live" aria-label="blocks #78 to #81 after setCode"></svg>
            <p>{"#78 → #81, live"}</p>
          </article>
          {" "}
          <article className="chain">
            <h4>
              {"ed100x "}
              <small>{"injected · 1002 → 1004"}</small>
            </h4>
            <svg viewBox="0 0 400 54" preserveAspectRatio="none" data-blocks="live" aria-label="blocks #9 to #12 after setCode"></svg>
            <p>{"#9 → #12, live"}</p>
          </article>
          {" "}
          <article className="chain halted">
            <h4>
              {"public source, 60 s slots "}
              <small>{"1002 → 1003"}</small>
            </h4>
            <svg viewBox="0 0 400 54" preserveAspectRatio="none" data-blocks="halt" aria-label="stuck at block #110"></svg>
            <p>
              {"stuck at #110 · "}
              <code>{"Timestamp slot must match CurrentSlot"}</code>
            </p>
          </article>
          {" "}
        </div>
        {" "}
      </div>
      {" "}
      <a className="frame-link" href="https://github.com/Venkat5599/PRT/blob/main/docs/V3_READINESS.md">
        {"READ THE V3 READINESS LOG "}
        <svg className="arr" viewBox="0 0 12 12" aria-hidden="true">
          <path d="M3.5 8.5l5-5M4.5 3.5h4v4"></path>
        </svg>
      </a>
      {" "}
    </section>
  );
}
