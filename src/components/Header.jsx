import { useEffect, useRef, useState } from "react";
import logo from "../assets/images/logo-napolithein.png";
import { LINKS } from "../data/content.js";
import "../styles/header.css";

export default function Header({ onCavemanTrigger }) {
  const [scrolled, setScrolled] = useState(false);
  const clickCountRef = useRef(0);
  const clickTimerRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function handleLogoClick(e) {
    clickCountRef.current += 1;
    clearTimeout(clickTimerRef.current);
    clickTimerRef.current = setTimeout(() => {
      clickCountRef.current = 0;
    }, 800);

    if (clickCountRef.current >= 3) {
      clickCountRef.current = 0;
      clearTimeout(clickTimerRef.current);
      e.preventDefault();
      onCavemanTrigger?.();
    }
  }

  return (
    <header className={`nh-header${scrolled ? " is-scrolled" : ""}`}>
      <a href="#top" className="nh-header__mark" aria-label="Napolit'hein Crousty - accueil" onClick={handleLogoClick}>
        <img src={logo} alt="Napolit'hein Crousty" className="nh-header__logo" />
      </a>
      <nav className="nh-header__nav">
        <a href="#carte" className="nh-header__link">La carte</a>
        <a href="#commander" className="nh-header__link">Commander</a>
        <a href={LINKS.tel} className="nh-header__pill">06 04 65 94 06</a>
      </nav>
    </header>
  );
}
