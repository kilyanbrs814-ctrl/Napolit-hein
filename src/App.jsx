import Header from "./components/Header.jsx";
import HeroCinematic from "./components/HeroCinematic.jsx";
import Marquee from "./components/Marquee.jsx";
import BuildSection from "./components/BuildSection.jsx";
import RailSection from "./components/RailSection.jsx";
import MenuSection from "./components/MenuSection.jsx";
import DoorsSection from "./components/DoorsSection.jsx";
import ProofSection from "./components/ProofSection.jsx";
import AmbianceSection from "./components/AmbianceSection.jsx";
import FinalCTA from "./components/FinalCTA.jsx";
import Footer from "./components/Footer.jsx";

export default function App() {
  return (
    <>
      <div className="nh-grain" />
      <Header />
      <main>
        <HeroCinematic />
        <Marquee />
        <BuildSection />
        <RailSection />
        <MenuSection />
        <DoorsSection />
        <ProofSection />
        <AmbianceSection />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
