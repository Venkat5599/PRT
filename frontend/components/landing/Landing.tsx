import HeaderBar from "@/components/landing/sections/HeaderBar";
import PageBackground from "@/components/landing/sections/PageBackground";
import Hero from "@/components/landing/sections/Hero";
import Surfaces from "@/components/landing/sections/Surfaces";
import AlsoAvailable from "@/components/landing/sections/AlsoAvailable";
import Features from "@/components/landing/sections/Features";
import GetStarted from "@/components/landing/sections/GetStarted";
import Checks from "@/components/landing/sections/Checks";
import Faq from "@/components/landing/sections/Faq";
import Simpler from "@/components/landing/sections/Simpler";
import Footer from "@/components/landing/sections/Footer";

export default function Landing() {
  return (
    <>
      <HeaderBar />
      <PageBackground />
      <Hero />
      <Surfaces />
      <AlsoAvailable />
      <Features />
      <GetStarted />
      <Checks />
      <Faq />
      <Simpler />
      <Footer />
    </>
  );
}
