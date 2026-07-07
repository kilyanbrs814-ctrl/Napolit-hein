import { useEffect, useRef, useState } from "react";
import logo from "../assets/images/logo-napolithein.png";
import { LINKS } from "../data/content.js";
import "../styles/header.css";

export default function Header({ onCavemanTrigger }) {
  const [visible, setVisible] = useState(false);
  const clickCountRef = useRef(0);
  const clickTimerRef = useRef(null);

  /* La navbar reste cachée pendant le hero ET la bannière rouge (Marquee) :
     elle n'apparaît que lorsque le BAS de .nh-marquee est sorti par le haut
     du viewport — l'instant exact où la section 03 arrive en haut d'écran.
     On mesure la position réelle à l'écran (getBoundingClientRect) plutôt
     qu'un seuil scrollY figé : le hero handoff (margin-top négatif + sticky)
     rend tout offset précalculé faux, alors que la position viewport est
     toujours juste, dans les deux sens de scroll, PC comme mobile. */
  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      const marquee = document.querySelector(".nh-marquee");
      if (marquee) {
        setVisible(marquee.getBoundingClientRect().bottom <= 1);
      } else {
        /* Filet de sécurité si la bannière disparaît du DOM. */
        setVisible(window.scrollY > 40);
      }
    };

    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) window.cancelAnimationFrame(frame);
    };
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
    <header className={`nh-header${visible ? " is-visible is-scrolled" : ""}`}>
      <a href="#top" className="nh-header__mark" aria-label="Napolit'hein Crousty - accueil" onClick={handleLogoClick}>
        <img src={logo} alt="Napolit'hein Crousty" className="nh-header__logo" />
      </a>
      <nav className="nh-header__center" aria-label="Navigation principale">
        <a href="#top" className="nh-header__link">Accueil</a>
        <a href="#couches" className="nh-header__link">Couche par couche</a>
        <a href="#carte" className="nh-header__link">Incontournables</a>
        <a href="#menu" className="nh-header__link">Carte</a>
        <a href="#commander" className="nh-header__link">Commander</a>
        <a href="#avis" className="nh-header__link">Avis</a>
        <a href="#ambiance" className="nh-header__link">Ambiance</a>
      </nav>
      <div className="nh-header__end">
        <a href={LINKS.tel} className="nh-header__pill">
          <span className="nh-header__pill-label">06 04 65 94 06</span>
          <span className="nh-header__pill-mobile">Appeler</span>
        </a>
      </div>
    </header>
  );
}
