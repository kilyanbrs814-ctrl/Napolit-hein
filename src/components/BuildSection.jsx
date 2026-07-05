import { useCallback, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
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
const SNAP_SCROLL_DURATION_MS = 560;
const STEP_TRANSITION_S = 0.98;
const EASE_PREMIUM = [0.22, 1, 0.36, 1];
const clampStepIndex = (index) => Math.max(0, Math.min(index, IMAGES.length - 1));
const INITIAL_VISUAL_STATE = {
  currentIndex: 0,
  previousIndex: null,
  targetIndex: 0,
  isTransitioning: false,
  direction: 0,
};

function Layer({ image, opacity, zIndex, transition }) {
  return (
    <motion.div
      className="nh-build__img"
      style={{ backgroundImage: `url(${image})`, zIndex }}
      initial={false}
      animate={{ opacity }}
      transition={transition}
      aria-hidden="true"
    />
  );
}

function TextStep({ isActive, step, transition }) {
  return (
    <motion.div
      className="nh-build__txt"
      initial={false}
      animate={{ opacity: isActive ? 1 : 0 }}
      transition={transition}
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
  const [visualState, setVisualState] = useState(INITIAL_VISUAL_STATE);
  const visualStateRef = useRef(INITIAL_VISUAL_STATE);
  const logicalVisualIndexRef = useRef(0);
  const expectedSnapIndexRef = useRef(null);
  const activeSnapDirectionRef = useRef(0);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const commitVisualState = useCallback((nextState) => {
    visualStateRef.current = nextState;
    setVisualState(nextState);
  }, []);

  const handleSnapStart = useCallback(({ fromIndex, toIndex, direction }) => {
    const latestState = visualStateRef.current;
    const reliableStartIndex = latestState.isTransitioning
      ? latestState.targetIndex
      : latestState.currentIndex;
    const lastLogicalIndex = logicalVisualIndexRef.current;
    const rawTargetIndex = Number.isFinite(toIndex)
      ? clampStepIndex(toIndex)
      : lastLogicalIndex;
    const safeDirection =
      direction ||
      Math.sign(rawTargetIndex - reliableStartIndex) ||
      Math.sign(rawTargetIndex - fromIndex);
    const safeTargetIndex =
      safeDirection > 0
        ? clampStepIndex(Math.max(rawTargetIndex, lastLogicalIndex))
        : safeDirection < 0
          ? clampStepIndex(Math.min(rawTargetIndex, lastLogicalIndex))
          : rawTargetIndex;

    logicalVisualIndexRef.current = safeTargetIndex;
    expectedSnapIndexRef.current = safeTargetIndex;
    activeSnapDirectionRef.current = safeDirection;

    if (reliableStartIndex === safeTargetIndex) return;

    commitVisualState({
      currentIndex: reliableStartIndex,
      previousIndex: reliableStartIndex,
      targetIndex: safeTargetIndex,
      isTransitioning: true,
      direction: safeDirection,
    });
  }, [commitVisualState]);

  const handleSnapComplete = useCallback((index) => {
    const safeIndex = Number.isFinite(index) ? clampStepIndex(index) : logicalVisualIndexRef.current;
    const latestState = visualStateRef.current;
    const expectedIndex = expectedSnapIndexRef.current;
    const activeDirection = activeSnapDirectionRef.current;
    const logicalIndex = logicalVisualIndexRef.current;

    if (
      (activeDirection > 0 && safeIndex < logicalIndex) ||
      (activeDirection < 0 && safeIndex > logicalIndex)
    ) {
      return;
    }

    if (expectedIndex !== null && safeIndex !== expectedIndex) {
      expectedSnapIndexRef.current = null;
      return;
    }

    if (latestState.isTransitioning && latestState.targetIndex !== safeIndex) return;

    logicalVisualIndexRef.current = safeIndex;
    expectedSnapIndexRef.current = null;
    activeSnapDirectionRef.current = 0;
    commitVisualState({
      currentIndex: safeIndex,
      previousIndex: null,
      targetIndex: safeIndex,
      isTransitioning: false,
      direction: 0,
    });
  }, [commitVisualState]);

  useSteppedScrollSnap({
    sectionRef,
    snapPoints: SNAP_POINTS,
    durationMs: SNAP_SCROLL_DURATION_MS,
    easing: "easeOutCubic",
    onSnapStart: handleSnapStart,
    onSnapComplete: handleSnapComplete,
  });

  const glowOpacity = useTransform(scrollYProgress, (v) => 0.4 + 0.5 * Math.sin(v * Math.PI));
  const stepTransition = {
    duration: reduceMotion ? 0.01 : STEP_TRANSITION_S,
    ease: EASE_PREMIUM,
  };
  const settleTransition = {
    duration: 0.01,
    ease: EASE_PREMIUM,
  };
  const visualTransition = visualState.isTransitioning ? stepTransition : settleTransition;
  const displayIndex = visualState.isTransitioning
    ? visualState.targetIndex
    : visualState.currentIndex;

  return (
    <section id="couches" ref={sectionRef} className="nh-build" data-screen-label="03 Construction">
      <div className="nh-build__stage">
        <div className="nh-eyebrow nh-build__eyebrow">03 · Couche par couche</div>
        <div className="nh-build__grid">
          <div className="nh-build__bowl-wrap">
            <motion.div className="nh-build__glow" style={{ opacity: glowOpacity }} />
            {IMAGES.map((img, i) => {
              const isTarget = i === visualState.targetIndex;
              const isPrevious = i === visualState.previousIndex;
              const isStableCurrent = !visualState.isTransitioning && i === visualState.currentIndex;
              const opacity = isStableCurrent || (visualState.isTransitioning && isTarget) ? 1 : 0;
              const zIndex = visualState.isTransitioning
                ? isTarget
                  ? 3
                  : isPrevious
                    ? 2
                    : 1
                : isStableCurrent
                  ? 2
                  : 1;

              return (
                <Layer
                  key={i}
                  image={img}
                  zIndex={zIndex}
                  opacity={opacity}
                  transition={visualTransition}
                />
              );
            })}
          </div>

          <div className="nh-build__side">
            <div className="nh-build__num">{"0" + (displayIndex + 1)}</div>
            <div className="nh-build__txt-stack">
              {BUILD_STEPS.map((step, i) => (
                <TextStep
                  key={i}
                  isActive={i === displayIndex}
                  step={step}
                  transition={visualTransition}
                />
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
