import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import logo from "../assets/images/logo-napolithein.png";
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

function UberWidget({ href, rating, reviews, logo }) {
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="hw-uber"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 220, damping: 28, delay: 0.4 }}
      whileHover={{ y: -4 }}
    >
      <div className="hw-uber__bar">
        <img src={logo} alt="Uber Eats" className="hw-uber__logo" />
        <span className="hw-uber__avail">Disponible sur</span>
      </div>
      <div className="hw-uber__body">
        <div className="hw-uber__status">
          <span className="hw-uber__dot" aria-hidden="true" />
          <span className="hw-uber__status-label">Ouvert ce soir</span>
        </div>
        <div className="hw-uber__rating">
          <span className="hw-uber__star" aria-hidden="true">★</span>
          <span className="hw-uber__score">{rating}</span>
          <span className="hw-uber__reviews">{reviews}</span>
        </div>
        <div className="hw-uber__tags">
          <span className="hw-uber__tag">Livraison</span>
          <span className="hw-uber__tag">Click &amp; Collect</span>
        </div>
        <div className="hw-uber__cta">
          Commander
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
          </svg>
        </div>
      </div>
    </motion.a>
  );
}

function DeliverooWidget({ href, rating, reviews, logo }) {
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="hw-dlv"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 220, damping: 28, delay: 0.54 }}
      whileHover={{ y: -4 }}
    >
      <div className="hw-dlv__head">
        <img src={logo} alt="Deliveroo" className="hw-dlv__logo" />
      </div>
      <div className="hw-dlv__body">
        <div className="hw-dlv__status">
          <span className="hw-dlv__dot" aria-hidden="true" />
          <span className="hw-dlv__status-label">Disponible maintenant</span>
        </div>
        <div className="hw-dlv__rating">
          <span className="hw-dlv__star" aria-hidden="true">★</span>
          <span className="hw-dlv__score">{rating}</span>
          <span className="hw-dlv__reviews">{reviews}</span>
        </div>
        <div className="hw-dlv__delivery">Livraison rapide</div>
        <div className="hw-dlv__cta">
          Commander
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
          </svg>
        </div>
      </div>
    </motion.a>
  );
}

function DeliveryWidgets() {
  const uber = HERO_WIDGETS[0];
  const deliv = HERO_WIDGETS[1];
  return (
    <>
      <div className="nh-hero__widgets-label">Commander en livraison</div>
      <div className="nh-hero__widgets-row">
        <UberWidget href={uber.href} rating={uber.rating} reviews={uber.reviews} logo={uber.logo} />
        <DeliverooWidget href={deliv.href} rating={deliv.rating} reviews={deliv.reviews} logo={deliv.logo} />
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
