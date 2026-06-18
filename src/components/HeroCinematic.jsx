import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import logo from "../assets/images/logo-napolithein.png";
import pastaBowl from "../assets/images/hero-pasta.jpg";
import croustyBowl from "../assets/images/crousty-hero.png";
import { HERO_WIDGETS, CROUSTY_CHIPS } from "../data/content.js";
import "../styles/hero.css";

function HeroContent() {
  return (
    <div className="nh-hero__content">
      <img src={logo} alt="Napolit'hein Crousty" className="nh-hero__logo" />
      <h1 className="nh-hero__h1">
        <span>PATES.</span>
        <span className="nh-hero__h1--accent">RIZ CROUSTY.</span>
        <span>SAUCE.</span>
      </h1>
      <p className="nh-hero__lede">
        Recettes maison, portions qui rassasient, ce croustillant qui claque. Sur place, a emporter
        ou livre chez toi.
      </p>
      <div className="nh-hero__ctas">
        <a href="#commander" className="nh-btn nh-btn--primary nh-hero__cta-desktop">
          Commander maintenant
        </a>
        <a href="#carte" className="nh-btn nh-btn--ghost nh-hero__cta-desktop">
          Voir la carte
        </a>
        <a href="#carte" className="nh-btn nh-btn--primary nh-hero__cta-mobile">
          Voir la carte
        </a>
      </div>
    </div>
  );
}

function DeliveryWidgets() {
  return (
    <>
      <div className="nh-hero__widgets-label">Aussi en livraison</div>
      <div className="nh-hero__widgets-row">
        {HERO_WIDGETS.map((w) => (
          <a
            key={w.brand}
            href={w.href}
            target="_blank"
            rel="noopener noreferrer"
            className="nh-widget"
          >
            <span className="nh-widget__glow" style={{ background: w.glow }} />
            <span className="nh-widget__head">
              <img src={w.logo} alt={w.brand} className="nh-widget__logo" />
              {w.showBrand && <span className="nh-widget__brand">{w.brand}</span>}
            </span>
            <span className="nh-widget__rate-row">
              <span className="nh-widget__rate">{w.rating}</span>
              <span className="nh-widget__star">★</span>
              <span className="nh-widget__rev">{w.reviews}</span>
            </span>
            <span className="nh-widget__cta">
              Commander <span aria-hidden>→</span>
            </span>
          </a>
        ))}
      </div>
    </>
  );
}

function CroustyContent() {
  return (
    <div className="nh-hero__cr-text">
      <div className="nh-eyebrow nh-hero__cr-eyebrow">02 · Le croustillant</div>
      <h2 className="nh-hero__cr-h2">Le croustillant qui change tout.</h2>
      <p className="nh-hero__cr-p">
        Dore, genereux, sauce maison, servi chaud. Ce craquant a chaque bouchee, c'est notre
        signature.
      </p>
      <div className="nh-hero__chips">
        {CROUSTY_CHIPS.map((c) => (
          <span key={c} className="nh-chip">{c}</span>
        ))}
      </div>
    </div>
  );
}

export default function HeroCinematic() {
  const sectionRef = useRef(null);
  const reduceMotion = useReducedMotion();
  const isStatic = reduceMotion;
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  // Timeline cinematique pilotee uniquement par le scroll natif (aucun hijack molette).
  const heroOpacity = useTransform(scrollYProgress, [0, 0.45], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.55], [0, -60]);
  const heroScale = useTransform(scrollYProgress, [0, 0.6], [1, 0.95]);

  const widgetsOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);
  const widgetsY = useTransform(scrollYProgress, [0, 0.5], [0, 40]);

  const cueOpacity = useTransform(scrollYProgress, [0, 0.12], [1, 0]);

  const pastaOpacity = useTransform(scrollYProgress, [0.18, 0.55], [1, 0]);
  const croustyOpacity = useTransform(scrollYProgress, [0.4, 0.82], [0, 1]);
  const bowlRotate = useTransform(scrollYProgress, [0.2, 0.9], [0, 12]);
  const bowlScale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);
  const bowlX = useTransform(scrollYProgress, [0.2, 0.9], ["0%", "-6%"]);

  const glowScale = useTransform(scrollYProgress, [0, 1], [1, 1.5]);
  const wordOpacity = useTransform(scrollYProgress, [0.4, 0.95], [0, 0.14]);
  const wordScale = useTransform(scrollYProgress, [0.4, 1], [0.85, 1.1]);

  const crOpacity = useTransform(scrollYProgress, [0.55, 0.95], [0, 1]);
  const crY = useTransform(scrollYProgress, [0.55, 1], [42, 0]);

  // En reduced-motion : aucune transformation inline -> tout reste visible.
  const s = (style) => (isStatic ? undefined : style);

  return (
    <section id="top" ref={sectionRef} className={`nh-hero${isStatic ? " is-static" : ""}`}>
      <div className="nh-hero__stage">
        <motion.div className="nh-hero__glow" style={s({ scale: glowScale })} />

        {!isStatic && (
          <motion.div className="nh-hero__cr-word" style={{ opacity: wordOpacity, scale: wordScale }}>
            CRROUSTY
          </motion.div>
        )}

        <motion.div
          className="nh-hero__bowls"
          style={s({ rotate: bowlRotate, scale: bowlScale, x: bowlX })}
        >
          <motion.div
            className="nh-hero__bowl nh-hero__bowl--pasta"
            style={{ backgroundImage: `url(${pastaBowl})`, ...s({ opacity: pastaOpacity }) }}
          />
          <motion.div
            className="nh-hero__bowl nh-hero__bowl--crousty"
            style={{ backgroundImage: `url(${croustyBowl})`, ...s({ opacity: croustyOpacity }) }}
          />
        </motion.div>

        <motion.div
          className="nh-hero__layer"
          style={s({ opacity: heroOpacity, y: heroY, scale: heroScale })}
        >
          <HeroContent />
        </motion.div>

        <motion.div className="nh-hero__cr-layer" style={s({ opacity: crOpacity, y: crY })}>
          <CroustyContent />
        </motion.div>

        <motion.div
          className="nh-hero__widgets"
          style={s({ opacity: widgetsOpacity, y: widgetsY })}
        >
          <DeliveryWidgets />
        </motion.div>

        <motion.a href="#carte" className="nh-hero__cue" style={s({ opacity: cueOpacity })}>
          <span className="nh-eyebrow">Scroll</span>
        </motion.a>
      </div>
    </section>
  );
}
