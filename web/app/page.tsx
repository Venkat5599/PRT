import Behaviors from "@/components/Behaviors";
import Flow from "@/components/Flow";
import Footer from "@/components/Footer";
import Harness from "@/components/Harness";
import Hero from "@/components/Hero";
import Invariant from "@/components/Invariant";
import Live from "@/components/Live";
import Motion from "@/components/Motion";
import Nav from "@/components/Nav";
import Runs from "@/components/Runs";
import Start from "@/components/Start";
import Stats from "@/components/Stats";
import Trio from "@/components/Trio";
import Uses from "@/components/Uses";
import V3 from "@/components/V3";

export default function Home() {
  return (
    <>
      <Nav />
      <Hero />
      <main>
        <Live />
        <Trio />
        <Stats />
        <Harness />
        <Flow />
        <Runs />
        <V3 />
        <Uses />
        <Invariant />
        <Start />
      </main>
      <Footer />
      <Motion />
      <Behaviors />
    </>
  );
}
