import { useEffect, useLayoutEffect, useState } from "react";
import Header from "./components/Header.jsx";
import HeroCinematic from "./components/HeroCinematic.jsx";
import Marquee from "./components/Marquee.jsx";
import BuildSection from "./components/BuildSection.jsx";
import RailSection from "./components/RailSection.jsx";
import MenuDoorsScene from "./components/MenuDoorsScene.jsx";
import ProofSection from "./components/ProofSection.jsx";
import AmbianceSection from "./components/AmbianceSection.jsx";
import FinalCTA from "./components/FinalCTA.jsx";
import Footer from "./components/Footer.jsx";
import CavemanMode from "./components/CavemanMode.jsx";

export default function App() {
  const [isCaveman, setIsCaveman] = useState(false);

  // Filet de sécurité : certains navigateurs restaurent le scroll après le premier render.
  // useLayoutEffect (synchrone avant paint) + double rAF + timeout 80ms couvrent
  // les trois moments possibles de restauration tardive.
  useLayoutEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    if (!window.location.hash) {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });

      requestAnimationFrame(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      });

      setTimeout(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      }, 80);
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-caveman", isCaveman ? "true" : "false");
  }, [isCaveman]);

  return (
    <>
      <div className="nh-grain" />
      <Header onCavemanTrigger={() => setIsCaveman(true)} />
      <CavemanMode isActive={isCaveman} onDeactivate={() => setIsCaveman(false)} />
      <main>
        <HeroCinematic />
        <div className="nh-hero-handoff">
          <Marquee />
          <BuildSection />
        </div>
        <RailSection />
        <MenuDoorsScene />
        <ProofSection />
        <AmbianceSection />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
