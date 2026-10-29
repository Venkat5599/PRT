// Generated from the landing markup by landing-port/gen.py. Do not edit by hand:
// change the source or the generator and regenerate.
import FaqList from "@/components/landing/wall/FaqList";
import IssueButton from "@/components/landing/wall/IssueButton";

export default function Faq() {
  return (
    <section>
      <div className={"px-14 py-4 rounded-full text-body-light-muted bg-body-light-bg-ghost text-special-mono mb-12 w-max mx-auto"}>
        {"F.A.Q"}
      </div>
      <h2 className={"text-body-light-loud text-title-h2 text-center sm:mb-64 mb-16 px-24"}>
        {"Questions & answers"}
      </h2>
      <FaqList />
      <div className={"flex flex-wrap py-16 px-32 justify-center gap-4 mt-42"}>
        <div className={"text-12/22 text-body-light-muted"}>
          {"More questions? Read the"}
        </div>
        <a href={"https://github.com/Venkat5599/portalcanary#readme"} className={"px-5 rounded-6 bg-body-light-bg-ghost transition-all hover:bg-body-light-bg-muted"} target={"_blank"} rel={"noopener"}>
          <div className={"text-14/22 font-500 tracking-[-0.14px] text-body-light-loud"}>
            {"README"}
          </div>
        </a>
        <div className={"text-12/22 text-body-light-muted"}>
          {"or"}
        </div>
        <IssueButton />
      </div>
    </section>
  );
}
