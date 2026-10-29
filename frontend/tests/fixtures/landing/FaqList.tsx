// Server markup of the original static landing for this component, captured before the React port.
// FaqList: the mainnet-vs-V3 answer no longer quotes a frozen change count; it links the live compare.
// tests/landing.test.tsx asserts the React component still renders exactly this.
export default function FaqList() {
  return (
    <div className={"flex mx-auto max-w-952 flex-col p-14 sm:flex-row sm:gap-16"}>
      <div className={"flex-1 flex flex-col sm:gap-16"}>
        <div className={"overflow-hidden border-x border-t sm:border-b sm:rounded-14 border-body-stroke-lighter first:rounded-t-14"}>
          <button aria-label={"Is Portal Canary for me?"} className={"text-14/22 transition-all rounded-inherit font-500 pl-23 pt-23 pr-15 tracking-[-0.14px] text-start text-body-light-loud select-none cursor-pointer flex w-full justify-between pb-23"}>
            <span className={"flex-1 block"}>
              {"Is Portal Canary for me?"}
            </span>
            <img alt={"chevron down"} decoding={"async"} height={"24"} loading={"lazy"} src={"/assets/images/questions/chevron-down.png"} style={{} as React.CSSProperties} width={"24"} className={"lazy-image opacity-0 h-24"} />
          </button>
          <div style={{"--original-height": "23px"} as React.CSSProperties} className={"transition-all overflow-hidden relative pr-16 pl-23 h-0"}>
            <div className={"text-body-normal text-body-light-muted transition-all opacity-0 blur-[1px]"}>
              <p className={"mb-8"}>
                <b>
                  {"Yes"}
                </b>
                {", if you build or operate Portaldot runtimes and want to know an upgrade is safe before it reaches the chain. Canary checks endpoints, diffs runtimes, runs workflows on both sides of an upgrade and tells you exactly what changed."}
              </p>
              <p className={"mb-8"}>
                {"If you only want to look at a diff without installing anything, open the "}
                <a className={"underline"} href={"/dashboard#compare"}>
                  {"Browser dashboard"}
                </a>
                {" instead."}
              </p>
            </div>
          </div>
        </div>
        <div className={"overflow-hidden border-x border-t sm:border-b sm:rounded-14 border-body-stroke-lighter first:rounded-t-14"}>
          <button aria-label={"Does it work on Portaldot mainnet today?"} className={"text-14/22 transition-all rounded-inherit font-500 pl-23 pt-23 pr-15 tracking-[-0.14px] text-start text-body-light-loud select-none cursor-pointer flex w-full justify-between pb-23"}>
            <span className={"flex-1 block"}>
              {"Does it work on Portaldot mainnet today?"}
            </span>
            <img alt={"chevron down"} decoding={"async"} height={"24"} loading={"lazy"} src={"/assets/images/questions/chevron-down.png"} style={{} as React.CSSProperties} width={"24"} className={"lazy-image opacity-0 h-24"} />
          </button>
          <div style={{"--original-height": "23px"} as React.CSSProperties} className={"transition-all overflow-hidden relative pr-16 pl-23 h-0"}>
            <div className={"text-body-normal text-body-light-muted transition-all opacity-0 blur-[1px]"}>
              <p>
                {"Yes. Mainnet runs metadata V13, which modern subxt cannot decode. Canary speaks raw JSON-RPC and SCALE and decodes V13 and V14, so doctor, compare and invariants all run against mainnet today."}
              </p>
            </div>
          </div>
        </div>
        <div className={"overflow-hidden border-x border-t sm:border-b sm:rounded-14 border-body-stroke-lighter first:rounded-t-14"}>
          <button aria-label={"What is the difference between the CLI and the browser dashboard?"} className={"text-14/22 transition-all rounded-inherit font-500 pl-23 pt-23 pr-15 tracking-[-0.14px] text-start text-body-light-loud select-none cursor-pointer flex w-full justify-between pb-23"}>
            <span className={"flex-1 block"}>
              {"What is the difference between the CLI and the browser dashboard?"}
            </span>
            <img alt={"chevron down"} decoding={"async"} height={"24"} loading={"lazy"} src={"/assets/images/questions/chevron-down.png"} style={{} as React.CSSProperties} width={"24"} className={"lazy-image opacity-0 h-24"} />
          </button>
          <div style={{"--original-height": "23px"} as React.CSSProperties} className={"transition-all overflow-hidden relative pr-16 pl-23 h-0"}>
            <div className={"text-body-normal text-body-light-muted transition-all opacity-0 blur-[1px]"}>
              <p>
                {"Open the "}
                <a className={"underline"} href={"/dashboard#compare"}>
                  {"live compare"}
                </a>
                {"."}
              </p>
              {" In short, the CLI runs every check including real setCode upgrades on a dev chain, while the dashboard runs the compare engine as WebAssembly in your browser against live nodes."}
              <p></p>
            </div>
          </div>
        </div>
        <div className={"overflow-hidden border-x border-t sm:border-b sm:rounded-14 border-body-stroke-lighter first:rounded-t-14"}>
          <button aria-label={"Can I test a real runtime upgrade?"} className={"text-14/22 transition-all rounded-inherit font-500 pl-23 pt-23 pr-15 tracking-[-0.14px] text-start text-body-light-loud select-none cursor-pointer flex w-full justify-between pb-23"}>
            <span className={"flex-1 block"}>
              {"Can I test a real runtime upgrade?"}
            </span>
            <img alt={"chevron down"} decoding={"async"} height={"24"} loading={"lazy"} src={"/assets/images/questions/chevron-down.png"} style={{} as React.CSSProperties} width={"24"} className={"lazy-image opacity-0 h-24"} />
          </button>
          <div style={{"--original-height": "23px"} as React.CSSProperties} className={"transition-all overflow-hidden relative pr-16 pl-23 h-0"}>
            <div className={"text-body-normal text-body-light-muted transition-all opacity-0 blur-[1px]"}>
              <p>
                {"Yes. canary upgrade applies a candidate WASM to a running dev chain with sudo.sudoUncheckedWeight(system.setCode), waits for three more blocks under the new runtime, then runs the workflow corpus against it."}
              </p>
            </div>
          </div>
        </div>
        <div className={"overflow-hidden border-x border-t sm:border-b sm:rounded-14 border-body-stroke-lighter first:rounded-t-14"}>
          <button aria-label={"I already use try-runtime. Why would I need Canary?"} className={"text-14/22 transition-all rounded-inherit font-500 pl-23 pt-23 pr-15 tracking-[-0.14px] text-start text-body-light-loud select-none cursor-pointer flex w-full justify-between pb-23"}>
            <span className={"flex-1 block"}>
              {"I already use try-runtime. Why would I need Canary?"}
            </span>
            <img alt={"chevron down"} decoding={"async"} height={"24"} loading={"lazy"} src={"/assets/images/questions/chevron-down.png"} style={{} as React.CSSProperties} width={"24"} className={"lazy-image opacity-0 h-24"} />
          </button>
          <div style={{"--original-height": "23px"} as React.CSSProperties} className={"transition-all overflow-hidden relative pr-16 pl-23 h-0"}>
            <div className={"text-body-normal text-body-light-muted transition-all opacity-0 blur-[1px]"}>
              <p>
                {"try-runtime tells you the migration ran. Canary tells you whether your app still works, shows the exact state that diverged and gives you one command to reproduce it. See the recorded runs:"}
              </p>
              {"\n      "}
              <ul className={"list-disc list-outside ml-24 flex flex-col m-8 gap-8"}>
                {"\n        "}
                <li className={"m-0 p-0"}>
                  <a className={"underline"} href={"/reports/self-compare/report.html"}>
                    {"Control: same node twice, all PASS"}
                  </a>
                </li>
                {"\n        "}
                <li className={"m-0 p-0"}>
                  <a className={"underline"} href={"/reports/upgrade-fee10x/report.html"}>
                    {"Byte fee \u00d710: four DIFFERENCE findings"}
                  </a>
                </li>
                {"\n        "}
                <li className={"m-0 p-0"}>
                  <a className={"underline"} href={"/reports/upgrade-ed100x/report.html"}>
                    {"Deposit \u00d7100: one REGRESSION"}
                  </a>
                </li>
                {"\n        "}
                <li className={"m-0 p-0"}>
                  <a className={"underline"} href={"/dashboard#compare"}>
                    {"Mainnet vs V3, compared live"}
                  </a>
                </li>
                {"\n      "}
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div className={"flex-1 flex flex-col sm:gap-16"}>
        <div className={"overflow-hidden border-x border-t sm:border-b sm:rounded-14 border-body-stroke-lighter last:border-b last:rounded-b-14"}>
          <button aria-label={"Does the dashboard send my data anywhere?"} className={"text-14/22 transition-all rounded-inherit font-500 pl-23 pt-23 pr-15 tracking-[-0.14px] text-start text-body-light-loud select-none cursor-pointer flex w-full justify-between pb-23"}>
            <span className={"flex-1 block"}>
              {"Does the dashboard send my data anywhere?"}
            </span>
            <img alt={"chevron down"} decoding={"async"} height={"24"} loading={"lazy"} src={"/assets/images/questions/chevron-down.png"} style={{} as React.CSSProperties} width={"24"} className={"lazy-image opacity-0 h-24"} />
          </button>
          <div style={{"--original-height": "23px"} as React.CSSProperties} className={"transition-all overflow-hidden relative pr-16 pl-23 h-0"}>
            <div className={"text-body-normal text-body-light-muted transition-all opacity-0 blur-[1px]"}>
              <p>
                {"No. The page opens a WebSocket from your browser to each node and runs the diff locally. No server is involved. A wallet is optional: it signs only when you run the workflow suite or anchor a report on a chain other than a local dev chain."}
              </p>
            </div>
          </div>
        </div>
        <div className={"overflow-hidden border-x border-t sm:border-b sm:rounded-14 border-body-stroke-lighter last:border-b last:rounded-b-14"}>
          <button aria-label={"What does each verdict mean?"} className={"text-14/22 transition-all rounded-inherit font-500 pl-23 pt-23 pr-15 tracking-[-0.14px] text-start text-body-light-loud select-none cursor-pointer flex w-full justify-between pb-23"}>
            <span className={"flex-1 block"}>
              {"What does each verdict mean?"}
            </span>
            <img alt={"chevron down"} decoding={"async"} height={"24"} loading={"lazy"} src={"/assets/images/questions/chevron-down.png"} style={{} as React.CSSProperties} width={"24"} className={"lazy-image opacity-0 h-24"} />
          </button>
          <div style={{"--original-height": "23px"} as React.CSSProperties} className={"transition-all overflow-hidden relative pr-16 pl-23 h-0"}>
            <div className={"text-body-normal text-body-light-muted transition-all opacity-0 blur-[1px]"}>
              <p>
                {"Every workflow gets one of four verdicts:"}
              </p>
              {"\n      "}
              <ul className={"list-disc list-outside ml-24 flex flex-col m-8 gap-8"}>
                {"\n        "}
                <li className={"m-0 p-0"}>
                  <b>
                    {"REGRESSION:"}
                  </b>
                  {" an expectation holds on the baseline and fails on the candidate."}
                </li>
                {"\n        "}
                <li className={"m-0 p-0"}>
                  <b>
                    {"DIFFERENCE:"}
                  </b>
                  {" observable behaviour differs, every expectation still holds."}
                </li>
                {"\n        "}
                <li className={"m-0 p-0"}>
                  <b>
                    {"INCONCLUSIVE:"}
                  </b>
                  {" not comparable, because setup failed or the baseline itself fails."}
                </li>
                {"\n        "}
                <li className={"m-0 p-0"}>
                  <b>
                    {"PASS:"}
                  </b>
                  {" all expectations hold on both sides and nothing observable differs."}
                </li>
                {"\n      "}
              </ul>
            </div>
          </div>
        </div>
        <div className={"overflow-hidden border-x border-t sm:border-b sm:rounded-14 border-body-stroke-lighter last:border-b last:rounded-b-14"}>
          <button aria-label={"Can I run Canary in CI?"} className={"text-14/22 transition-all rounded-inherit font-500 pl-23 pt-23 pr-15 tracking-[-0.14px] text-start text-body-light-loud select-none cursor-pointer flex w-full justify-between pb-23"}>
            <span className={"flex-1 block"}>
              {"Can I run Canary in CI?"}
            </span>
            <img alt={"chevron down"} decoding={"async"} height={"24"} loading={"lazy"} src={"/assets/images/questions/chevron-down.png"} style={{} as React.CSSProperties} width={"24"} className={"lazy-image opacity-0 h-24"} />
          </button>
          <div style={{"--original-height": "23px"} as React.CSSProperties} className={"transition-all overflow-hidden relative pr-16 pl-23 h-0"}>
            <div className={"text-body-normal text-body-light-muted transition-all opacity-0 blur-[1px]"}>
              <p>
                {"Absolutely. Canary ships a GitHub Action, and its own CI runs against a real Portaldot dev node. Start from the "}
                <a className={"underline"} href={"https://github.com/Venkat5599/PRT/blob/main/action.yml"} target={"_blank"} rel={"noopener"}>
                  {"action.yml in the repository."}
                </a>
              </p>
              {"\n      "}
              <p className={"mb-8"}>
                {"To summarize:"}
              </p>
              {"\n      "}
              <ol className={"list-decimal list-outside ml-24 flex flex-col m-8 gap-8"}>
                {"\n        "}
                <li className={"m-0 p-0"}>
                  {"Build the CLI: cd backend && cargo build --release."}
                </li>
                {"\n        "}
                <li className={"m-0 p-0"}>
                  {"Start a baseline node and a candidate node."}
                </li>
                {"\n        "}
                <li className={"m-0 p-0"}>
                  {"Run canary test against both endpoints."}
                </li>
                {"\n        "}
                <li className={"m-0 p-0"}>
                  {"Read the "}
                  <code className={"bg-body-light-bg-ghost rounded-6 p-4"}>
                    {"exit code"}
                  </code>
                  {" : 1 on any regression, 2 if anything is inconclusive."}
                </li>
                {"\n      "}
              </ol>
              {"\n      "}
              <pre className={"bg-body-light-bg-ghost rounded-6 p-4 mb-12"}>
                <code className={""}>
                  {"canary test --baseline ws://127.0.0.1:9944 --candidate ws://127.0.0.1:9945"}
                </code>
              </pre>
              {"\n      "}
              <p>
                {"Note: "}
                <b>
                  {"A spec_version bump is not proof"}
                </b>
                {". The public dev node and mainnet both report spec_version "}
                <code className={"bg-body-light-bg-ghost rounded-6 p-4"}>
                  {"1002"}
                </code>
                {"but are different runtimes. Run "}
                <code className={"bg-body-light-bg-ghost rounded-6 p-4"}>
                  {"canary compare"}
                </code>
                {" before trusting dev-node results "}
                <code className={"bg-body-light-bg-ghost rounded-6 p-4"}>
                  {"(details"}
                </code>
                {" in "}
                <code className={"bg-body-light-bg-ghost rounded-6 p-4"}>
                  {"docs/V3_READINESS.md)"}
                </code>
                {"."}
              </p>
            </div>
          </div>
        </div>
        <div className={"overflow-hidden border-x border-t sm:border-b sm:rounded-14 border-body-stroke-lighter last:border-b last:rounded-b-14"}>
          <button aria-label={"Is it open source?"} className={"text-14/22 transition-all rounded-inherit font-500 pl-23 pt-23 pr-15 tracking-[-0.14px] text-start text-body-light-loud select-none cursor-pointer flex w-full justify-between pb-23"}>
            <span className={"flex-1 block"}>
              {"Is it open source?"}
            </span>
            <img alt={"chevron down"} decoding={"async"} height={"24"} loading={"lazy"} src={"/assets/images/questions/chevron-down.png"} style={{} as React.CSSProperties} width={"24"} className={"lazy-image opacity-0 h-24"} />
          </button>
          <div style={{"--original-height": "23px"} as React.CSSProperties} className={"transition-all overflow-hidden relative pr-16 pl-23 h-0"}>
            <div className={"text-body-normal text-body-light-muted transition-all opacity-0 blur-[1px]"}>
              <p>
                {"Yes, Apache-2.0. The Rust workspace, the WASM engine, the workflow corpus and the candidate runtimes with their exact source diffs are all in the repository."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
