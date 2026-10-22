import Behaviors from "@/components/Behaviors";
import Flow from "@/components/Flow";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import Invariant from "@/components/Invariant";
import Live from "@/components/Live";
import Motion from "@/components/Motion";
import Nav from "@/components/Nav";
import Start from "@/components/Start";
import Uses from "@/components/Uses";
import V3 from "@/components/V3";

export default function Home() {
  return (
    <>
      <Nav morph />
      <Hero />
      <main>
        <Live />
        <Flow />
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
