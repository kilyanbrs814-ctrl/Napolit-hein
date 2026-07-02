import { useEffect, useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValueEvent,
  useReducedMotion,
} from "framer-motion";
import { BUILD_STEPS } from "../data/content.js";
import logo from "../assets/images/logo-napolithein.png";
import build1 from "../assets/images/build-1-rice.png";
import build2 from "../assets/images/build-2-chicken.png";
import build3 from "../assets/images/build-3-sauce.png";
import build4 from "../assets/images/build-4-final.png";
import "../styles/build.css";

const IMAGES = [build1, build2, build3, build4];

// Plages d'opacite pour le crossfade des 4 couches.
const IMG_RANGES = [
  { in: [0, 0.33], out: [1, 0] },
  { in: [0, 0.33, 0.66], out: [0, 1, 0] },
  { in: [0.33, 0.66, 1], out: [0, 1, 0] },
  { in: [0.66, 1], out: [0, 1] },
];

// Plages dediees aux textes : fade, plateau de lecture, puis fade.
const TEXT_RANGES = [
  { in: [0, 0.23, 0.3], out: [1, 1, 0] },
  { in: [0.24, 0.31, 0.47, 0.55], out: [0, 1, 1, 0] },
  { in: [0.49, 0.56, 0.72, 0.8], out: [0, 1, 1, 0] },
  { in: [0.74, 0.82, 1], out: [0, 1, 1] },
];

// Points ou le texte entrant devient plus visible que le texte sortant.
const ACTIVE_THRESHOLDS = [0.27, 0.518, 0.77];

// Points de snap magnetique, un par etape : [0, 1/3, 2/3, 1] pour 4 etapes.
const SNAP_POINTS = BUILD_STEPS.map((_, i) => i / (BUILD_STEPS.length - 1));
const SNAP_DEBOUNCE_MS = 150;
const SNAP_RELEASE_MS = 600;

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

  const prefersReducedMotion = useReducedMotion();
  const progressRef = useRef(0);
  const isSnappingRef = useRef(false);
  const isTouchingRef = useRef(false);
  const snapTimeoutRef = useRef(null);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    progressRef.current = v;
    const next = ACTIVE_THRESHOLDS.findIndex((threshold) => v < threshold);
    const activeIndex = next === -1 ? TEXT_RANGES.length - 1 : next;
    setActive((cur) => (cur === activeIndex ? cur : activeIndex));
  });

  // Snap magnetique : une fois le scroll natif immobile, recale doucement
  // sur l'etape la plus proche pour eviter un crossfade fige entre deux couches.
  useEffect(() => {
    if (prefersReducedMotion) return undefined;

    const trySnap = () => {
      const v = progressRef.current;
      // v strictement dans ]0,1[ signifie qu'on est bien a l'interieur de la
      // section (useScroll clampe a 0 ou 1 hors de sa plage) : on ne ramene
      // jamais quelqu'un qui est clairement sorti de .nh-build.
      if (v <= 0 || v >= 1) return;
      if (isTouchingRef.current || isSnappingRef.current) return;

      const nearest = SNAP_POINTS.reduce((best, point) =>
        Math.abs(point - v) < Math.abs(best - v) ? point : best
      );
      if (Math.abs(nearest - v) < 0.001) return;

      const section = sectionRef.current;
      if (!section) return;
      const rect = section.getBoundingClientRect();
      const sectionTop = rect.top + window.scrollY;
      const sectionHeight = rect.height;
      const targetY = sectionTop + nearest * (sectionHeight - window.innerHeight);

      isSnappingRef.current = true;
      window.scrollTo({ top: targetY, behavior: "smooth" });
      window.setTimeout(() => {
        isSnappingRef.current = false;
      }, SNAP_RELEASE_MS);
    };

    const scheduleSnap = () => {
      if (snapTimeoutRef.current) clearTimeout(snapTimeoutRef.current);
      snapTimeoutRef.current = setTimeout(trySnap, SNAP_DEBOUNCE_MS);
    };

    const handleScroll = () => {
      if (isSnappingRef.current) return;
      scheduleSnap();
    };

    // La molette ne doit jamais etre bloquee : un wheel signale une vraie
    // intention utilisateur, donc on relache le verrou pour lui rendre la main
    // meme si un snap etait en cours d'animation.
    const handleUserInput = () => {
      isSnappingRef.current = false;
    };

    const handleTouchStart = () => {
      isTouchingRef.current = true;
      isSnappingRef.current = false;
      if (snapTimeoutRef.current) clearTimeout(snapTimeoutRef.current);
    };

    const handleTouchEnd = () => {
      isTouchingRef.current = false;
      scheduleSnap();
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("wheel", handleUserInput, { passive: true });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("wheel", handleUserInput);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
      if (snapTimeoutRef.current) clearTimeout(snapTimeoutRef.current);
    };
  }, [prefersReducedMotion]);

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
            <div className="nh-build__ring" />
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
