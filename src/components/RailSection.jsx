import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { DISHES, LINKS } from "../data/content.js";
import "../styles/rail.css";

const RAIL_DISHES = DISHES.slice(0, 3);
const SNAP_DURATION = 720;
const SWIPE_THRESHOLD = 48;
const MIN_WHEEL_DELTA = 6;

function RailCard({ dish, index, count, isActive }) {
  return (
    <motion.div
      className="nh-rail__card"
      style={{ "--dish-color": dish.glow }}
      initial={false}
      animate={{ opacity: isActive ? 1 : 0.3, scale: isActive ? 1 : 0.93 }}
      transition={{ duration: SNAP_DURATION / 1000, ease: [0.22, 1, 0.36, 1] }}
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
  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndexRef = useRef(0);
  const wheelLockedRef = useRef(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || count < 2) return undefined;

    let touchStartY = null;
    let touchCaptured = false;
    let touchStartedWhileActive = false;
    let lastTouchAt = 0;
    let wasSectionActive = false;
    let wasAboveSection = section.getBoundingClientRect().top > 0;
    let wheelTimer = null;

    // Vrai quand le stage sticky couvre tout le viewport (haut sorti, bas pas encore).
    const isSectionActive = () => {
      const rect = section.getBoundingClientRect();
      return rect.top <= 0 && rect.bottom >= window.innerHeight;
    };

    const updateIndex = (nextIndex) => {
      activeIndexRef.current = nextIndex;
      setActiveIndex(nextIndex);
    };

    // Cale le scroll sous-jacent exactement sur l'ancre du plat nextIndex.
    const scrollToIndexAnchor = (nextIndex) => {
      const rect = section.getBoundingClientRect();
      const sectionTop = window.scrollY + rect.top;
      const dishScrollable = Math.max(0, section.offsetHeight - 2 * window.innerHeight);
      const target = sectionTop + (nextIndex / (count - 1)) * dishScrollable;
      window.scrollTo({ top: target, behavior: "auto" });
    };

    const normalizeWheelDelta = (event) => {
      const multiplier =
        event.deltaMode === WheelEvent.DOM_DELTA_LINE
          ? 16
          : event.deltaMode === WheelEvent.DOM_DELTA_PAGE
            ? window.innerHeight
            : 1;
      return event.deltaY * multiplier;
    };

    const handleWheel = (event) => {
      if (event.ctrlKey) return;

      const delta = normalizeWheelDelta(event);
      if (Math.abs(delta) < MIN_WHEEL_DELTA) return;

      const direction = delta > 0 ? 1 : -1;
      const current = activeIndexRef.current;
      const rect = section.getBoundingClientRect();
      const sectionTop = window.scrollY + rect.top;
      const dishScrollable = Math.max(0, section.offsetHeight - 2 * window.innerHeight);

      // ── Zone d'overlap 04 ↔ 05 ─────────────────────────────────────────────
      // Quand scrollY dépasse l'ancre du dernier plat, le menu chevauche le rail.
      // On laisse le scroll naturel passer vers le haut (symétrique à isLeavingDown).
      if (window.scrollY >= sectionTop + dishScrollable && direction < 0) return;

      // ── Pré-entrée depuis le haut ───────────────────────────────────────────
      // Le haut de la section est visible dans le viewport mais pas encore sticky.
      // On cale immédiatement sur l'ancre du plat 01 pour éviter qu'un gros wheel
      // ne saute par-dessus sans passer par le carousel.
      if (direction > 0 && rect.top > 0 && rect.top < window.innerHeight) {
        if (event.cancelable) event.preventDefault();
        if (activeIndexRef.current !== 0) updateIndex(0);
        scrollToIndexAnchor(0);
        return;
      }

      // ── Hors section active : ne pas interférer ─────────────────────────────
      if (!isSectionActive()) return;

      // ── Section active ──────────────────────────────────────────────────────
      const isLeavingUp   = current === 0         && direction < 0;
      const isLeavingDown = current === count - 1 && direction > 0;

      // Sorties autorisées aux limites : scroll naturel vers section 03 ou 05.
      if (isLeavingUp || isLeavingDown) return;

      // Dans la section, hors limites : TOUJOURS bloquer le scroll naturel,
      // même si le verrou d'animation est actif.
      if (event.cancelable) event.preventDefault();

      // Verrou actif (animation en cours) : scroll bloqué, pas de changement de plat.
      if (wheelLockedRef.current) return;

      // Avancer d'exactement un plat, jamais plus.
      wheelLockedRef.current = true;
      window.clearTimeout(wheelTimer);
      wheelTimer = window.setTimeout(() => {
        wheelLockedRef.current = false;
      }, SNAP_DURATION + 100);

      const next = Math.max(0, Math.min(count - 1, current + direction));
      updateIndex(next);
      scrollToIndexAnchor(next);
    };

    const handleTouchStart = (event) => {
      if (event.touches.length !== 1) return;
      touchStartY = event.touches[0].clientY;
      touchCaptured = false;
      touchStartedWhileActive = isSectionActive();
    };

    const handleTouchMove = (event) => {
      if (touchStartY === null || event.touches.length !== 1 || !touchStartedWhileActive || !isSectionActive()) return;

      const delta = touchStartY - event.touches[0].clientY;
      if (Math.abs(delta) < 8) return;

      const direction = delta > 0 ? 1 : -1;
      const current = activeIndexRef.current;

      const isExitingUp   = current === 0         && direction < 0;
      const isExitingDown = current === count - 1 && direction > 0;

      if (isExitingUp || isExitingDown) return;

      // Zone d'overlap 04 ↔ 05 : laisser le scroll naturel passer en remontée.
      const tRect = section.getBoundingClientRect();
      const tSectionTop = window.scrollY + tRect.top;
      const tDishScrollable = Math.max(0, section.offsetHeight - 2 * window.innerHeight);
      if (window.scrollY >= tSectionTop + tDishScrollable && direction < 0) return;

      if (event.cancelable) event.preventDefault();
      if (touchCaptured || Math.abs(delta) < SWIPE_THRESHOLD) return;

      const now = Date.now();
      if (now - lastTouchAt < SNAP_DURATION) return;
      lastTouchAt = now;

      touchCaptured = true;
      const next = current + direction;
      updateIndex(next);
      scrollToIndexAnchor(next);
    };

    const resetTouch = () => {
      touchStartY = null;
      touchCaptured = false;
      touchStartedWhileActive = false;
    };

    const handleScroll = () => {
      const nowActive = isSectionActive();
      const rect = section.getBoundingClientRect();
      const aboveSection = rect.top > 0; // section encore sous le haut du viewport

      if (nowActive && !wasSectionActive) {
        if (wasAboveSection) {
          // Filet de sécurité : gros scroll depuis le haut qui a sauté la pré-entrée.
          // Force le plat 01 et cale l'ancre.
          if (activeIndexRef.current !== 0) updateIndex(0);
          scrollToIndexAnchor(0);
        } else {
          // Entrée depuis le bas (retour depuis section 05 ou overlap) :
          // synchroniser l'index sans snap forcé.
          const sectionTopDoc = window.scrollY + rect.top;
          const ds = Math.max(1, section.offsetHeight - 2 * window.innerHeight);
          const progress = Math.min(1, Math.max(0, (window.scrollY - sectionTopDoc) / ds));
          const entryIndex = Math.round(progress * (count - 1));
          if (activeIndexRef.current !== entryIndex) updateIndex(entryIndex);
        }
      }

      // Sortie de la section : relâcher le verrou par sécurité.
      if (!nowActive && wasSectionActive) wheelLockedRef.current = false;

      wasSectionActive = nowActive;
      wasAboveSection = aboveSection;
    };

    // Init : synchroniser si la section est déjà visible au chargement.
    wasSectionActive = isSectionActive();
    wasAboveSection = section.getBoundingClientRect().top > 0;
    if (wasSectionActive) {
      const rect = section.getBoundingClientRect();
      const sectionTop = window.scrollY + rect.top;
      const dishScrollable = Math.max(1, section.offsetHeight - 2 * window.innerHeight);
      const progress = Math.min(1, Math.max(0, (window.scrollY - sectionTop) / dishScrollable));
      updateIndex(Math.round(progress * (count - 1)));
    }

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("scroll", handleScroll, { passive: true });
    section.addEventListener("touchstart", handleTouchStart, { passive: true });
    section.addEventListener("touchmove", handleTouchMove, { passive: false });
    section.addEventListener("touchend", resetTouch, { passive: true });
    section.addEventListener("touchcancel", resetTouch, { passive: true });

    return () => {
      window.clearTimeout(wheelTimer);
      wheelLockedRef.current = false;
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("scroll", handleScroll);
      section.removeEventListener("touchstart", handleTouchStart);
      section.removeEventListener("touchmove", handleTouchMove);
      section.removeEventListener("touchend", resetTouch);
      section.removeEventListener("touchcancel", resetTouch);
    };
  }, [count]);

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
        <motion.div
          className="nh-rail__track"
          initial={false}
          animate={{ x: `${-activeIndex * 100}vw` }}
          transition={{ duration: SNAP_DURATION / 1000, ease: [0.22, 1, 0.36, 1] }}
        >
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
