import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { BUILD_STEPS } from "../data/content.js";
import useSteppedScrollSnap from "../hooks/useSteppedScrollSnap.js";
import logo from "../assets/images/logo-napolithein.png";
import build1 from "../assets/images/build-1-rice.png";
import build2 from "../assets/images/build-2-chicken.png";
import build3 from "../assets/images/build-3-sauce.png";
import build4 from "../assets/images/build-4-final.png";
import "../styles/build.css";

const IMAGES = [build1, build2, build3, build4];
const SNAP_POINTS = [0.2, 0.5, 0.74, 0.95];
const SNAP_DURATION_MS = 1150;
const VISUAL_TRANSITION_S = 1.12;
const TEXT_TRANSITION_S = 0.42;
const TEXT_SWAP_DELAY_MS = 420;
const EASE_PREMIUM = [0.22, 1, 0.36, 1];

function Layer({ image, opacity }) {
  return (
    <motion.div
      className="nh-build__img"
      style={{ backgroundImage: `url(${image})` }}
      initial={false}
      animate={{ opacity }}
      transition={{ duration: VISUAL_TRANSITION_S, ease: EASE_PREMIUM }}
    />
  );
}

function TextStep({ isActive, step }) {
  return (
    <motion.div
      className="nh-build__txt"
      initial={false}
      animate={{ opacity: isActive ? 1 : 0 }}
      transition={{ duration: TEXT_TRANSITION_S, ease: EASE_PREMIUM }}
    >
      {step.lead && <div className="nh-build__txt-lead">{step.lead}</div>}
      {step.isLogo ? (
        <img src={logo} alt="Napolit'hein Crousty" className="nh-build__txt-logo" />
      ) : (
        <div className="nh-build__txt-title">{step.title}</div>
      )}
      <div className="nh-build__txt-desc">{step.desc}</div>
    </motion.div>
  );
}

export default function BuildSection() {
  const sectionRef = useRef(null);
  const [active, setActive] = useState(0);
  const [currentVisualIndex, setCurrentVisualIndex] = useState(0);
  const visualIndexRef = useRef(0);
  const textTimerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const clearTextTimer = useCallback(() => {
    if (textTimerRef.current !== null) {
      window.clearTimeout(textTimerRef.current);
      textTimerRef.current = null;
    }
  }, []);

  const handleSnapStart = useCallback(
    ({ fromIndex, toIndex }) => {
      if (fromIndex === toIndex) return;

      clearTextTimer();
      visualIndexRef.current = toIndex;
      setCurrentVisualIndex(toIndex);

      textTimerRef.current = window.setTimeout(() => {
        setActive(toIndex);
        textTimerRef.current = null;
      }, TEXT_SWAP_DELAY_MS);
    },
    [clearTextTimer]
  );

  const handleSnapComplete = useCallback(
    (index) => {
      clearTextTimer();
      visualIndexRef.current = index;
      setActive(index);
      setCurrentVisualIndex(index);
    },
    [clearTextTimer]
  );

  useEffect(() => clearTextTimer, [clearTextTimer]);

  useSteppedScrollSnap({
    sectionRef,
    snapPoints: SNAP_POINTS,
    durationMs: SNAP_DURATION_MS,
    easing: "easeOutCubic",
    onSnapStart: handleSnapStart,
    onSnapComplete: handleSnapComplete,
  });

  const glowOpacity = useTransform(scrollYProgress, (v) => 0.4 + 0.5 * Math.sin(v * Math.PI));

  return (
    <section id="couches" ref={sectionRef} className="nh-build" data-screen-label="03 Construction">
      <div className="nh-build__stage">
        <div className="nh-eyebrow nh-build__eyebrow">03 · Couche par couche</div>
        <div className="nh-build__grid">
          <div className="nh-build__bowl-wrap">
            <motion.div className="nh-build__glow" style={{ opacity: glowOpacity }} />
            {IMAGES.map((img, i) => (
              <Layer
                key={i}
                image={img}
                opacity={i === currentVisualIndex ? 1 : 0}
              />
            ))}
          </div>

          <div className="nh-build__side">
            <div className="nh-build__num">{"0" + (active + 1)}</div>
            <div className="nh-build__txt-stack">
              {BUILD_STEPS.map((step, i) => (
                <TextStep key={i} isActive={i === active} step={step} />
              ))}
            </div>
            <div className="nh-build__dots">
              {BUILD_STEPS.map((_, i) => (
                <span
                  key={i}
                  className={`nh-build__dot${i <= active ? " is-on" : ""}${
                    i === active ? " is-active" : ""
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
