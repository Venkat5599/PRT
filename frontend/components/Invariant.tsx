// Generated from the original static markup; class names and whitespace match it exactly.
export default function Invariant() {
  return (
    <section className="invariant" aria-labelledby="i-title">
      {" "}
      <h2 id="i-title" className="sr">{"Mainnet supply invariant"}</h2>
      {" "}
      <div className="equation">
        {" "}
        <div>
          <span className="eq-num">{"1,016,781,509.44"}</span>
          <span className="eq-lbl">{"free + reserved across 4,719 accounts"}</span>
        </div>
        {" "}
        <span className="eq-sign" aria-label="equals">{"="}</span>
        {" "}
        <div>
          <span className="eq-num">{"1,016,781,509.44"}</span>
          <span className="eq-lbl">
            <code>{"Balances.TotalIssuance"}</code>
          </span>
        </div>
        {" "}
      </div>
      {" "}
      <p className="note">{"Portaldot mainnet, block #2,727,345, read-only. Delta: 0 planck. The same check runs before and after every upgrade."}</p>
      {" "}
    </section>
  );
}
