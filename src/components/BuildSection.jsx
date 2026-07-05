import { useEffect, useRef, useState } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useTransform,
} from "framer-motion";
import { BUILD_STEPS } from "../data/content.js";
import useLockedSceneSteps from "../hooks/useLockedSceneSteps.js";
import logo from "../assets/images/logo-napolithein.png";
import build1 from "../assets/images/build-1-rice.png";
import build2 from "../assets/images/build-2-chicken.png";
import build3 from "../assets/images/build-3-sauce.png";
import build4 from "../assets/images/build-4-final.png";
import "../styles/build.css";

const IMAGES = [build1, build2, build3, build4];
const LAST_BUILD_INDEX = IMAGES.length - 1;
const STEP_TRANSITION_S = 1.0;
const NATIVE_TRANSITION_S = 0.22;
const EASE_PREMIUM = [0.22, 1, 0.36, 1];

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const smoothstep = (value) => value * value * (3 - 2 * value);

function BuildImageLayer({ image, index, floatingIndex }) {
  const opacity = useTransform(floatingIndex, (value) => {
    const raw = clamp(1 - Math.abs(value - index) * 1.05, 0, 1);
    return smoothstep(raw);
  });
  const scale = useTransform(floatingIndex, (value) => {
    const raw = clamp(1 - Math.abs(value - index) * 1.05, 0, 1);
    return 0.965 + 0.035 * smoothstep(raw);
  });
  const rotate = useTransform(floatingIndex, (value) => `${(index - value) * 2.4}deg`);

  return (
    <motion.div
      className="nh-build__img"
      style={{ backgroundImage: `url(${image})`, opacity, scale, rotate, zIndex: index + 1 }}
      aria-hidden="true"
    />
  );
}

function TextStep({ index, step, floatingIndex }) {
  const opacity = useTransform(floatingIndex, (value) => {
    const raw = clamp(1 - Math.abs(value - index) * 2.2, 0, 1);
    return smoothstep(raw);
  });
  const y = useTransform(floatingIndex, (value) => {
    const raw = clamp(1 - Math.abs(value - index) * 2.2, 0, 1);
    const eased = smoothstep(raw);
    return (1 - eased) * 18 * (index < value ? -1 : 1);
  });

  return (
    <motion.div
      className="nh-build__txt"
      style={{ opacity, y }}
      aria-hidden={false}
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
  const reduceMotion = useReducedMotion();
  const sceneProgress = useMotionValue(0);
  const floatingIndex = useTransform(sceneProgress, (value) => value * LAST_BUILD_INDEX);
  const [displayIndex, setDisplayIndex] = useState(0);
  const { step, progress, isNative } = useLockedSceneSteps({
    sectionRef,
    steps: IMAGES.length,
    enabled: !reduceMotion,
    wheelCooldownMs: 880,
    touchThreshold: 42,
  });

  useEffect(() => {
    const target = isNative ? progress : step / LAST_BUILD_INDEX;
    const controls = animate(sceneProgress, target, {
      duration: reduceMotion ? 0.01 : isNative ? NATIVE_TRANSITION_S : STEP_TRANSITION_S,
      ease: EASE_PREMIUM,
    });

    return () => controls.stop();
  }, [isNative, progress, reduceMotion, sceneProgress, step]);

  useMotionValueEvent(floatingIndex, "change", (value) => {
    const nextIndex = clamp(Math.round(value), 0, LAST_BUILD_INDEX);
    setDisplayIndex((current) => (current === nextIndex ? current : nextIndex));
  });

  const glowOpacity = useTransform(sceneProgress, (value) => 0.4 + 0.5 * Math.sin(value * Math.PI));

  return (
    <section id="couches" ref={sectionRef} className="nh-build" data-screen-label="03 Construction">
      <div className="nh-build__stage">
        <div className="nh-eyebrow nh-build__eyebrow">03 · Couche par couche</div>
        <div className="nh-build__grid">
          <div className="nh-build__bowl-wrap">
            <motion.div className="nh-build__glow" style={{ opacity: glowOpacity }} />
            {IMAGES.map((img, i) => (
              <BuildImageLayer key={img} image={img} index={i} floatingIndex={floatingIndex} />
            ))}
          </div>

          <div className="nh-build__side">
            <div className="nh-build__num">{"0" + (displayIndex + 1)}</div>
            <div className="nh-build__txt-stack">
              {BUILD_STEPS.map((step, i) => (
                <TextStep key={i} index={i} step={step} floatingIndex={floatingIndex} />
              ))}
            </div>
            <div className="nh-build__dots">
              {BUILD_STEPS.map((_, i) => (
                <span
                  key={i}
                  className={`nh-build__dot${i <= displayIndex ? " is-on" : ""}${
                    i === displayIndex ? " is-active" : ""
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
