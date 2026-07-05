import { useMemo, useRef, useState } from "react";
import { motion, useScroll, useTransform, useMotionValueEvent } from "framer-motion";
import { DISHES, LINKS } from "../data/content.js";
import useIsMobile from "../hooks/useIsMobile.js";
import useSteppedScrollSnap from "../hooks/useSteppedScrollSnap.js";
import "../styles/rail.css";

const RAIL_DISHES = DISHES.slice(0, 3);
const CARD_ANIM_S = 0.72;

/*
 * useScroll/useTransform garde l'animation du rail. Sur desktop, un hook local
 * bloque uniquement la wheel dans cette section pour avancer plat par plat.
 *
 * La section fait 320vh, le stage sticky 100vh. Le menu (section 05) recouvre
 * les 100 derniers vh (margin-top: -100vh), donc l'animation des plats doit
 * etre terminee avant : phase utile = (320 - 200) / (320 - 100) = 6/11 du
 * scrollYProgress. Ensuite le plat 3 reste en place pendant le handoff.
 */
const DISH_PHASE = 6 / 11;
// Part de la phase passee en pause sur chaque plat (le reste = glissements).
const DWELL_FRAC = 0.18;

// Keyframes de translation du track : pause sur chaque plat, glissement entre.
function buildTrackKeyframes(count) {
  const trans = (1 - count * DWELL_FRAC) / (count - 1);
  const keys = [0];
  const vals = ["0vw"];
  const thresholds = [];
  const snapPoints = [];
  let t = 0;
  for (let i = 0; i < count; i++) {
    const dwellStart = t;
    t += DWELL_FRAC; // fin de la pause sur le plat i
    snapPoints.push(((dwellStart + t) / 2) * DISH_PHASE);
    keys.push(t * DISH_PHASE);
    vals.push(`${-i * 100}vw`);
    if (i < count - 1) {
      // seuil d'index actif au milieu du glissement i -> i+1
      thresholds.push((t + trans / 2) * DISH_PHASE);
      t += trans; // fin du glissement vers le plat i+1
      keys.push(t * DISH_PHASE);
      vals.push(`${-(i + 1) * 100}vw`);
    }
  }
  // Plateau final : plat 3 stable pendant la montee du menu.
  keys.push(1);
  vals.push(`${-(count - 1) * 100}vw`);
  return { keys, vals, thresholds, snapPoints };
}

function RailCard({ dish, index, count, isActive }) {
  return (
    <motion.div
      className="nh-rail__card"
      style={{ "--dish-color": dish.glow }}
      initial={false}
      animate={{ opacity: isActive ? 1 : 0.3, scale: isActive ? 1 : 0.93 }}
      transition={{ duration: CARD_ANIM_S, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="nh-rail__media">
        <img className="nh-rail__dish" src={dish.img} alt={dish.name} />
      </div>
      <div className="nh-rail__info">
        <div className="nh-rail__cat">{dish.cat}</div>
        <div className="nh-rail__name">{dish.name}</div>
        <p className="nh-rail__desc">{dish.desc}</p>
        <div className="nh-rail__row">
          <span className="nh-rail__price">{dish.price}</span>
          <a
            href={LINKS.uber}
            target="_blank"
            rel="noopener noreferrer"
            className="nh-rail__btn"
          >
            Commander <span aria-hidden>→</span>
          </a>
        </div>
      </div>
      <div className="nh-rail__index">
        {"0" + (index + 1)} / {"0" + count}
      </div>
    </motion.div>
  );
}

export default function RailSection() {
  const sectionRef = useRef(null);
  const count = RAIL_DISHES.length;
  const isMobile = useIsMobile();
  const [activeIndex, setActiveIndex] = useState(0);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const { keys, vals, thresholds, snapPoints } = useMemo(
    () => buildTrackKeyframes(count),
    [count]
  );
  const trackX = useTransform(scrollYProgress, keys, vals);

  useSteppedScrollSnap({
    sectionRef,
    snapPoints,
    enabled: !isMobile,
  });

  // Le plat actif depend du scroll, pas d'un wheel lock.
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    let next = 0;
    for (const th of thresholds) if (v >= th) next += 1;
    setActiveIndex((cur) => (cur === next ? cur : next));
  });

  return (
    <section
      id="carte"
      ref={sectionRef}
      className="nh-rail"
      data-screen-label="04 Incontournables"
      data-active-index={activeIndex}
    >
      <div className="nh-rail__stage">
        <div className="nh-rail__header">
          <div className="nh-eyebrow nh-rail__eyebrow">04 · Les incontournables</div>
          <div className="nh-eyebrow nh-rail__hint">Scroll →</div>
        </div>
        <motion.div className="nh-rail__track" style={{ x: trackX }}>
          {RAIL_DISHES.map((dish, index) => (
            <RailCard
              key={dish.name}
              dish={dish}
              index={index}
              count={count}
              isActive={index === activeIndex}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
