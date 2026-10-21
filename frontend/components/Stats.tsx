// Generated from the original static markup; class names and whitespace match it exactly.
export default function Stats() {
  return (
    <section className="frame stats" aria-label="Facts">
      {" "}
      <div>
        <b>{"V13 + V14"}</b>
        <span>{"Mainnet and V3 metadata, decoded"}</span>
      </div>
      {" "}
      <div>
        <b>{"948"}</b>
        <span>{"Changes, mainnet to V3"}</span>
      </div>
      {" "}
      <div>
        <b>{"0 planck"}</b>
        <span>{"Mainnet supply delta"}</span>
      </div>
      {" "}
      <div>
        <b>{"3 exits"}</b>
        <span>{"Pass, regression, inconclusive"}</span>
      </div>
      {" "}
      <p className="stats-cap">{"TESTED AGAINST LIVE PORTALDOT ENDPOINTS"}</p>
      {" "}
      <ul className="endpoints">
        <li>
          <span>{"Mainnet"}</span>
          {"mainnet.portaldot.io"}
        </li>
        <li>
          <span>{"V3 Substrate"}</span>
          {"test-node-v3.portaldot.dev"}
        </li>
        <li>
          <span>{"V3 EVM"}</span>
          {"test-evm-rpc-v3.portaldot.dev"}
        </li>
        <li>
          <span>{"Local dev"}</span>
          {"127.0.0.1:9944"}
        </li>
      </ul>
      {" "}
    </section>
  );
}
