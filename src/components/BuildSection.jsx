import { useRef, useState } from "react";
import { motion, useScroll, useTransform, useMotionValueEvent } from "framer-motion";
import { BUILD_STEPS } from "../data/content.js";
import useSteppedScrollSnap from "../hooks/useSteppedScrollSnap.js";
import logo from "../assets/images/logo-napolithein.png";
import build1 from "../assets/images/build-1-rice.png";
import build2 from "../assets/images/build-2-chicken.png";
import build3 from "../assets/images/build-3-sauce.png";
import build4 from "../assets/images/build-4-final.png";
import "../styles/build.css";

const IMAGES = [build1, build2, build3, build4];
const SNAP_POINTS = [0.2, 0.47, 0.72, 0.94];

// Plages d'opacite pour le crossfade des 4 couches, elargies pour un fondu
// progressif. Le hook de snap bloque la wheel et les swipes aux crans
// ou image et texte sont lisibles ensemble.
const IMG_RANGES = [
  { in: [0, 0.2, 0.45], out: [1, 1, 0] },
  { in: [0.2, 0.45, 0.54, 0.7], out: [0, 1, 1, 0] },
  { in: [0.54, 0.7, 0.78, 0.92], out: [0, 1, 1, 0] },
  { in: [0.78, 0.92, 1], out: [0, 1, 1] },
];

// Plages dediees aux textes : fade, plateau de lecture, puis fade.
const TEXT_RANGES = [
  { in: [0, 0.2, 0.45], out: [1, 1, 0] },
  { in: [0.2, 0.45, 0.54, 0.7], out: [0, 1, 1, 0] },
  { in: [0.54, 0.7, 0.78, 0.92], out: [0, 1, 1, 0] },
  { in: [0.78, 0.92, 1], out: [0, 1, 1] },
];

// Points ou le texte entrant devient plus visible que le texte sortant.
const ACTIVE_THRESHOLDS = [0.325, 0.62, 0.85];

function Layer({ progress, range, image }) {
  const opacity = useTransform(progress, range.in, range.out);
  return (
    <motion.div
      className="nh-build__img"
      style={{ backgroundImage: `url(${image})`, opacity }}
    />
  );
}

function TextStep({ progress, range, step }) {
  const opacity = useTransform(progress, range.in, range.out);
  return (
    <motion.div className="nh-build__txt" style={{ opacity }}>
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
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  useSteppedScrollSnap({
    sectionRef,
    snapPoints: SNAP_POINTS,
  });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const next = ACTIVE_THRESHOLDS.findIndex((threshold) => v < threshold);
    const activeIndex = next === -1 ? TEXT_RANGES.length - 1 : next;
    setActive((cur) => (cur === activeIndex ? cur : activeIndex));
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
              <Layer key={i} progress={scrollYProgress} range={IMG_RANGES[i]} image={img} />
            ))}
          </div>

          <div className="nh-build__side">
            <div className="nh-build__num">{"0" + (active + 1)}</div>
            <div className="nh-build__txt-stack">
              {BUILD_STEPS.map((step, i) => (
                <TextStep key={i} progress={scrollYProgress} range={TEXT_RANGES[i]} step={step} />
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
