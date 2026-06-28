import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import logo from "../assets/images/logo-napolithein.png";
import { HERO_WIDGETS, CROUSTY_CHIPS } from "../data/content.js";
import "../styles/hero.css";

/* ---- Statut dynamique du restaurant (fuseau Europe/Paris) ---- */
const SLOTS = [
  { days: [1, 2, 3, 4, 5], start: { h: 11, m: 30 }, end: { h: 14, m: 0 } },
  { days: [0, 1, 2, 3, 4, 5, 6], start: { h: 19, m: 0 }, end: { h: 22, m: 30 } },
];
const DAYS_FR = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];

function fmtTime({ h, m }) {
  return m === 0 ? `${h}h` : `${h}h${String(m).padStart(2, "0")}`;
}
function toMin(h, m) { return h * 60 + m; }

function getParisDT() {
  const now = new Date();
  const parts = new Intl.DateTimeFormat("fr-FR", {
    timeZone: "Europe/Paris",
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hour12: false,
  }).formatToParts(now);
  const get = (type) => parseInt(parts.find((p) => p.type === type).value, 10);
  const year = get("year"), month = get("month"), day = get("day");
  const h = get("hour") % 24, m = get("minute");
  return { day: new Date(year, month - 1, day).getDay(), h, m };
}

function computeStatus() {
  const { day, h, m } = getParisDT();
  const now = toMin(h, m);

  for (const slot of SLOTS) {
    if (slot.days.includes(day)) {
      const s = toMin(slot.start.h, slot.start.m);
      const e = toMin(slot.end.h, slot.end.m);
      if (now >= s && now < e)
        return { open: true, label: `Ouvert jusqu’à ${fmtTime(slot.end)}` };
    }
  }

  const todayNext = SLOTS
    .filter((s) => s.days.includes(day) && toMin(s.start.h, s.start.m) > now)
    .sort((a, b) => toMin(a.start.h, a.start.m) - toMin(b.start.h, b.start.m))[0];

  if (todayNext) {
    const prefix = todayNext.start.h >= 17 ? "ce soir" : "aujourd’hui";
    return { open: false, label: `Disponible ${prefix} à ${fmtTime(todayNext.start)}` };
  }

  for (let i = 1; i <= 7; i++) {
    const nd = (day + i) % 7;
    const first = SLOTS
      .filter((s) => s.days.includes(nd))
      .sort((a, b) => toMin(a.start.h, a.start.m) - toMin(b.start.h, b.start.m))[0];
    if (first) {
      const dayLabel = i === 1 ? "demain" : DAYS_FR[nd];
      return { open: false, label: `Disponible ${dayLabel} à ${fmtTime(first.start)}` };
    }
  }

  return { open: false, label: "Fermé" };
}

function useRestaurantStatus() {
  const [status, setStatus] = useState(computeStatus);
  useEffect(() => {
    const id = setInterval(() => setStatus(computeStatus()), 60_000);
    return () => clearInterval(id);
  }, []);
  return status;
}

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

function UberWidget({ href, rating, reviews, logo, status }) {
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="hw-uber"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 420, damping: 22, delay: 0.4 }}
      whileHover={{ y: -6, scale: 1.022 }}
    >
      <div className="hw-uber__bar">
        <img src={logo} alt="Uber Eats" className="hw-uber__logo" />
      </div>
      <div className="hw-uber__body">
        <div className="hw-uber__status">
          <span
            className={`hw-uber__dot${status.open ? "" : " hw-uber__dot--closed"}`}
            aria-hidden="true"
          />
          <span
            className="hw-uber__status-label"
            style={{ color: status.open ? "#06C167" : "#EF4444" }}
          >
            {status.label}
          </span>
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

function DeliverooWidget({ href, rating, reviews, logo, status }) {
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="hw-dlv"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 220, damping: 28, delay: 0.54 }}
      whileHover={{ y: -6, scale: 1.022, transition: { type: "spring", stiffness: 420, damping: 22 } }}
    >
      <div className="hw-dlv__head">
        <img src={logo} alt="Deliveroo" className="hw-dlv__logo" />
      </div>
      <div className="hw-dlv__body">
        <div className="hw-dlv__status">
          <span
            className={`hw-dlv__dot${status.open ? "" : " hw-dlv__dot--closed"}`}
            aria-hidden="true"
          />
          <span
            className="hw-dlv__status-label"
            style={{ color: status.open ? "#00A89E" : "#EF4444" }}
          >
            {status.label}
          </span>
        </div>
        <div className="hw-dlv__rating">
          <span className="hw-dlv__star" aria-hidden="true">★</span>
          <span className="hw-dlv__score">{rating}</span>
          <span className="hw-dlv__reviews">{reviews}</span>
        </div>
        <div className="hw-dlv__tags">
          <span className="hw-dlv__tag">Livraison</span>
          <span className="hw-dlv__tag">À emporter</span>
        </div>
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
  const status = useRestaurantStatus();
  return (
    <>
      <div className="nh-hero__widgets-label">Commander en livraison</div>
      <div className="nh-hero__widgets-row">
        <UberWidget href={uber.href} rating={uber.rating} reviews={uber.reviews} logo={uber.logo} status={status} />
        <DeliverooWidget href={deliv.href} rating={deliv.rating} reviews={deliv.reviews} logo={deliv.logo} status={status} />
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
  // Plages resserrees pour une animation plus reactive au scroll.
  const heroOpacity = useTransform(scrollYProgress, [0, 0.36], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.44], [0, -60]);
  const heroScale = useTransform(scrollYProgress, [0, 0.48], [1, 0.95]);

  const widgetsOpacity = useTransform(scrollYProgress, [0, 0.30], [1, 0]);
  const widgetsY = useTransform(scrollYProgress, [0, 0.40], [0, 40]);

  const cueOpacity = useTransform(scrollYProgress, [0, 0.10], [1, 0]);

  const glowScale = useTransform(scrollYProgress, [0, 1], [1, 1.5]);

  const crOpacity = useTransform(scrollYProgress, [0.36, 0.72], [0, 1]);
  const crY = useTransform(scrollYProgress, [0.36, 0.76], [42, 0]);

  // En reduced-motion : aucune transformation inline -> tout reste visible.
  const s = (style) => (isStatic ? undefined : style);

  return (
    <section id="top" ref={sectionRef} className={`nh-hero${isStatic ? " is-static" : ""}`}>
      <div className="nh-hero__stage">
        <motion.div className="nh-hero__glow" style={s({ scale: glowScale })} />

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
