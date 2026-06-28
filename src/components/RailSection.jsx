import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { DISHES, LINKS } from "../data/content.js";
import "../styles/rail.css";

const SNAP_DURATION = 720;
const SWIPE_THRESHOLD = 48;
const WHEEL_GESTURE_GAP = 180;
const MIN_WHEEL_DELTA = 4;

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
        {"0" + (index + 1)} / {count}
      </div>
    </motion.div>
  );
}

export default function RailSection() {
  const sectionRef = useRef(null);
  const count = DISHES.length;
  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndexRef = useRef(0);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || count < 2) return undefined;

    let touchStartY = null;
    let touchCaptured = false;
    let touchStartedWhileActive = false;
    let lastTouchAt = 0;
    let wasSectionActive = false;
    let lastScrollY = window.scrollY;
    let wheelGestureLocked = false;
    let wheelGestureTimer;

    const isSectionActive = () => {
      const rect = section.getBoundingClientRect();
      return rect.top <= 2 && rect.bottom >= window.innerHeight - 2;
    };

    const updateIndex = (nextIndex) => {
      activeIndexRef.current = nextIndex;
      setActiveIndex(nextIndex);
    };

    const scrollToIndexAnchor = (nextIndex) => {
      const rect = section.getBoundingClientRect();
      const sectionTop = window.scrollY + rect.top;
      const scrollableDistance = Math.max(0, section.offsetHeight - window.innerHeight);
      const target = sectionTop + (nextIndex / (count - 1)) * scrollableDistance;
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

    const unlockWheelAfterGesture = () => {
      window.clearTimeout(wheelGestureTimer);
      wheelGestureTimer = window.setTimeout(() => {
        wheelGestureLocked = false;
      }, WHEEL_GESTURE_GAP);
    };

    const handleWheel = (event) => {
      if (event.ctrlKey || !isSectionActive()) return;

      const delta = normalizeWheelDelta(event);
      if (Math.abs(delta) < MIN_WHEEL_DELTA) return;

      // scroll down (delta > 0) = plat suivant ; scroll up (delta < 0) = plat précédent
      const direction = delta > 0 ? 1 : -1;
      const nextIndex = activeIndexRef.current + direction;

      // Aux limites : laisser le scroll naturel sortir de la section
      if (nextIndex < 0 || nextIndex >= count) return;

      // Toujours bloquer le scroll page quand on est dans la section
      if (event.cancelable) event.preventDefault();

      // Même geste en cours : bloquer sans changer de plat
      if (wheelGestureLocked) {
        unlockWheelAfterGesture();
        return;
      }

      // Premier event du geste : changer de plat et verrouiller
      wheelGestureLocked = true;
      unlockWheelAfterGesture();

      updateIndex(nextIndex);
      scrollToIndexAnchor(nextIndex);
    };

    const handleTouchStart = (event) => {
      if (event.touches.length !== 1) return;
      touchStartY = event.touches[0].clientY;
      touchCaptured = false;
      touchStartedWhileActive = isSectionActive();
    };

    const handleTouchMove = (event) => {
      if (
        touchStartY === null ||
        event.touches.length !== 1 ||
        !touchStartedWhileActive ||
        !isSectionActive()
      ) {
        return;
      }

      const delta = touchStartY - event.touches[0].clientY;
      if (Math.abs(delta) < 8) return;

      const direction = delta > 0 ? 1 : -1;
      const nextIndex = activeIndexRef.current + direction;

      if (nextIndex < 0 || nextIndex >= count) return;

      if (event.cancelable) event.preventDefault();
      if (touchCaptured || Math.abs(delta) < SWIPE_THRESHOLD) return;

      const now = Date.now();
      if (now - lastTouchAt < 480) return;
      lastTouchAt = now;

      touchCaptured = true;
      updateIndex(nextIndex);
      scrollToIndexAnchor(nextIndex);
    };

    const resetTouch = () => {
      touchStartY = null;
      touchCaptured = false;
      touchStartedWhileActive = false;
    };

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const sectionActive = isSectionActive();

      if (sectionActive && !wasSectionActive) {
        const direction = currentScrollY - lastScrollY;
        const rect = section.getBoundingClientRect();
        const sectionTop = currentScrollY + rect.top;
        const scrollableDistance = Math.max(1, section.offsetHeight - window.innerHeight);
        const progress = Math.min(
          1,
          Math.max(0, (currentScrollY - sectionTop) / scrollableDistance)
        );
        const entryIndex =
          direction > 0 ? 0 : direction < 0 ? count - 1 : Math.round(progress * (count - 1));

        updateIndex(entryIndex);
        scrollToIndexAnchor(entryIndex);
      }

      wasSectionActive = sectionActive;
      lastScrollY = currentScrollY;
    };

    const initialRect = section.getBoundingClientRect();
    wasSectionActive = isSectionActive();
    if (wasSectionActive) {
      const sectionTop = window.scrollY + initialRect.top;
      const scrollableDistance = Math.max(1, section.offsetHeight - window.innerHeight);
      const progress = Math.min(
        1,
        Math.max(0, (window.scrollY - sectionTop) / scrollableDistance)
      );
      updateIndex(Math.round(progress * (count - 1)));
    }

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("scroll", handleScroll, { passive: true });
    section.addEventListener("touchstart", handleTouchStart, { passive: true });
    section.addEventListener("touchmove", handleTouchMove, { passive: false });
    section.addEventListener("touchend", resetTouch, { passive: true });
    section.addEventListener("touchcancel", resetTouch, { passive: true });

    return () => {
      window.clearTimeout(wheelGestureTimer);
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
          {DISHES.map((dish, index) => (
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
