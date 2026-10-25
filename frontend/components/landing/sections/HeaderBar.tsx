// Generated from the landing markup by landing-port/gen.py. Do not edit by hand:
// change the source or the generator and regenerate.
import Header from "@/components/landing/header/Header";

export default function HeaderBar() {
  return (
    <>
    <div className={"h-80 md:h-120 header-placeholder relative overflow-hidden"}>
      <img alt={"Header background vector"} decoding={"async"} fetchPriority={"high"} height={"88"} src={"/assets/images/header/vector.png"} width={"1440"} aria-hidden={"true"} className={"bottom-0 md-max:hidden center-x max-w-unset"} />
      <img alt={"Mobile header background vector"} decoding={"async"} fetchPriority={"high"} height={"65"} src={"/assets/images/header/vector-mobile.png"} width={"390"} aria-hidden={"true"} className={"-bottom-0 md:hidden left-0 absolute max-w-unset gradient-mask-r-70"} />
    </div>
    <Header />
    </>
  );
}
