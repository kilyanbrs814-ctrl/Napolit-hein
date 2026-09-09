import { useEffect, useRef, useState } from "react";
import logo from "../assets/images/logo-napolithein.png";
import { LINKS } from "../data/content.js";
import "../styles/header.css";

export default function Header({ onCavemanTrigger }) {
  const [visible, setVisible] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const burgerRef = useRef(null);
  const headerRef = useRef(null);
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

  useEffect(() => {
    if (!visible) setMenuOpen(false);
  }, [visible]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        burgerRef.current?.focus();
      }
    };
    const onPointerDown = (event) => {
      if (!headerRef.current?.contains(event.target)) setMenuOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [menuOpen]);

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
    <header ref={headerRef} className={`nh-header${visible ? " is-visible is-scrolled" : ""}`}>
      <a href="#top" className="nh-header__mark" aria-label="Napolit'hein Crousty - accueil" onClick={handleLogoClick}>
        <img src={logo} alt="Napolit'hein Crousty" className="nh-header__logo" />
      </a>
      <button ref={burgerRef} type="button" className="nh-header__burger"
        aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
        aria-expanded={menuOpen} aria-controls="nh-header-navigation"
        onClick={() => setMenuOpen((open) => !open)}>
        <span /><span /><span />
      </button>
      <nav id="nh-header-navigation" className="nh-header__dropdown"
        aria-label="Navigation principale" hidden={!menuOpen}>
        <a href={LINKS.tel} className="nh-header__pill" onClick={() => setMenuOpen(false)}>Appeler</a>
        <a href={LINKS.maps} target="_blank" rel="noopener noreferrer" className="nh-header__link" onClick={() => setMenuOpen(false)}>Nous trouver</a>
        <a href="#menu" className="nh-header__link" onClick={() => setMenuOpen(false)}>Menu</a>
        <a href="#avis" className="nh-header__link" onClick={() => setMenuOpen(false)}>Avis</a>
      </nav>
    </header>
  );
}
