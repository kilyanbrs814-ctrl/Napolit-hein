import { useEffect, useRef, useState } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useTransform,
} from "framer-motion";
import { DISHES, LINKS } from "../data/content.js";
import useLockedSceneSteps from "../hooks/useLockedSceneSteps.js";
import "../styles/rail.css";

const RAIL_DISHES = DISHES.slice(0, 3);
const RAIL_TRANSITION_S = 0.75;
const NATIVE_TRANSITION_S = 0.18;
const EASE_PREMIUM = [0.22, 1, 0.36, 1];

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

function RailCard({ dish, index, count, floatingIndex }) {
  const opacity = useTransform(floatingIndex, (value) => {
    const distance = Math.abs(index - value);
    return clamp(1 - distance * 0.55, 0.25, 1);
  });
  const scale = useTransform(floatingIndex, (value) => {
    const distance = Math.abs(index - value);
    return 1 - Math.min(distance, 1) * 0.07;
  });

  return (
    <motion.div
      className="nh-rail__card"
      style={{ "--dish-color": dish.glow, opacity, scale }}
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
  const reduceMotion = useReducedMotion();
  const count = RAIL_DISHES.length;
  const lastIndex = count - 1;
  const [activeIndex, setActiveIndex] = useState(0);
  const sceneProgress = useMotionValue(0);
  const floatingIndex = useTransform(sceneProgress, (value) => value * lastIndex);
  const trackX = useTransform(sceneProgress, (value) => `${-value * lastIndex * 100}vw`);
  const { step, progress, isNative } = useLockedSceneSteps({
    sectionRef,
    steps: count,
    enabled: !reduceMotion,
    wheelCooldownMs: 840,
    touchThreshold: 42,
  });

  useEffect(() => {
    const target = isNative ? progress : step / lastIndex;
    const controls = animate(sceneProgress, target, {
      duration: reduceMotion ? 0.01 : isNative ? NATIVE_TRANSITION_S : RAIL_TRANSITION_S,
      ease: EASE_PREMIUM,
    });

    return () => controls.stop();
  }, [isNative, lastIndex, progress, reduceMotion, sceneProgress, step]);

  useMotionValueEvent(floatingIndex, "change", (value) => {
    const nextIndex = clamp(Math.round(value), 0, lastIndex);
    setActiveIndex((current) => (current === nextIndex ? current : nextIndex));
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
              floatingIndex={floatingIndex}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
