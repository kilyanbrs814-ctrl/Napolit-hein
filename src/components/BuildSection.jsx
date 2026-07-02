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

// Plages d'opacite pour le crossfade des 4 couches, elargies pour un fondu
// plus progressif. L'image 4 est totalement visible des 0.84 : le dernier
// cran (0.88) tombe sur son plateau, pas de fin de section forcee.
const IMG_RANGES = [
  { in: [0, 0.36], out: [1, 0] },
  { in: [0, 0.34, 0.69], out: [0, 1, 0] },
  { in: [0.31, 0.67, 0.84], out: [0, 1, 0] },
  { in: [0.64, 0.84, 1], out: [0, 1, 1] },
];

// Plages dediees aux textes : fade, plateau de lecture, puis fade.
const TEXT_RANGES = [
  { in: [0, 0.25, 0.34], out: [1, 1, 0] },
  { in: [0.22, 0.34, 0.5, 0.6], out: [0, 1, 1, 0] },
  { in: [0.47, 0.6, 0.74, 0.84], out: [0, 1, 1, 0] },
  { in: [0.7, 0.84, 1], out: [0, 1, 1] },
];

// Points ou le texte entrant devient plus visible que le texte sortant.
const ACTIVE_THRESHOLDS = [0.29, 0.543, 0.782];

// Points de repos du scroll par crans, un par etape.
// Le dernier cran reste volontairement avant 1 : l'image 4 est stable
// sans que la page ne descende automatiquement vers la section suivante.
const STEP_POINTS = [0, 0.34, 0.67, 0.88];
// Duree du glissement entre deux crans, pilote en rAF pour garder un fondu
// lent et premium (le smooth natif du navigateur est trop court).
const STEP_ANIMATION_MS = 900;
// Verrou anti-spam : un seul cran par action de molette, jamais plus.
const STEP_LOCK_MS = STEP_ANIMATION_MS + 120;

// Depart immediat des le coup de molette, deceleration douce a la fin.
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

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
  // activeRef evite les stale states dans le handler wheel.
  const activeRef = useRef(0);
  const isAnimatingRef = useRef(false);
  const lockTimeoutRef = useRef(null);
  const animationFrameRef = useRef(null);
  // Le scroll par crans ne s'arme qu'apres stabilisation a l'entree :
  // un gros scroll venant de la section precedente ne doit pas enchainer 1->2.
  const entryArmedRef = useRef(false);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const next = ACTIVE_THRESHOLDS.findIndex((threshold) => v < threshold);
    const activeIndex = next === -1 ? TEXT_RANGES.length - 1 : next;
    activeRef.current = activeIndex;
    setActive((cur) => (cur === activeIndex ? cur : activeIndex));
  });

  // Scroll par crans (desktop) : chaque action molette avance ou recule
  // d'une seule image. Les touch events ne sont pas interceptes : le
  // comportement natif mobile reste intact.
  useEffect(() => {
    if (prefersReducedMotion) return undefined;
    const section = sectionRef.current;
    if (!section) return undefined;

    const goToStep = (index) => {
      const rect = section.getBoundingClientRect();
      const sectionTop = window.scrollY + rect.top;
      const scrollRange = section.offsetHeight - window.innerHeight;
      const targetY = sectionTop + STEP_POINTS[index] * scrollRange;
      const startY = window.scrollY;
      const distance = targetY - startY;
      const startTime = performance.now();

      isAnimatingRef.current = true;
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);

      // Micro-avance immediate avant le premier frame rAF : le mouvement
      // demarre des le coup de molette, sans impression de latence.
      window.scrollTo({ top: startY + distance * 0.015, behavior: "instant" });

      // Animation pilotee en rAF : duree et easing controles, la ou le
      // smooth natif est trop rapide. behavior "instant" a chaque frame :
      // "auto" defererait au scroll-behavior: smooth global du site et
      // relancerait un smooth natif par-dessus notre animation.
      const tick = (now) => {
        const t = Math.min((now - startTime) / STEP_ANIMATION_MS, 1);
        window.scrollTo({ top: startY + distance * easeOutCubic(t), behavior: "instant" });
        if (t < 1) {
          animationFrameRef.current = requestAnimationFrame(tick);
        } else {
          animationFrameRef.current = null;
        }
      };
      animationFrameRef.current = requestAnimationFrame(tick);

      if (lockTimeoutRef.current) clearTimeout(lockTimeoutRef.current);
      lockTimeoutRef.current = setTimeout(() => {
        isAnimatingRef.current = false;
      }, STEP_LOCK_MS);
    };

    const handleWheel = (event) => {
      if (event.deltaY === 0) return;
      const rect = section.getBoundingClientRect();
      // N'intercepte que quand le stage est reellement sticky (plein ecran).
      const isSticky = rect.top <= 1 && rect.bottom >= window.innerHeight - 1;
      if (!isSticky) return;

      const dir = event.deltaY > 0 ? 1 : -1;
      const current = activeRef.current;

      // Guard d'entree : le premier wheel apres l'engagement du sticky est
      // absorbe si on vient d'arriver (progress < 0.08). On se cale sur le
      // cran 0, puis le scroll par crans s'arme pour les wheels suivants.
      if (!entryArmedRef.current) {
        entryArmedRef.current = true;
        if (current === 0 && dir > 0 && scrollYProgress.get() < 0.08) {
          event.preventDefault();
          if (!isAnimatingRef.current) goToStep(0);
          return;
        }
      }

      // Sortie basse : depuis l'image 4, descente progressive cappee au lieu
      // d'un saut direct vers la section suivante sur un gros deltaY.
      if (dir > 0 && current >= STEP_POINTS.length - 1) {
        event.preventDefault();
        if (isAnimatingRef.current) return;
        window.scrollBy({ top: Math.min(Math.abs(event.deltaY), 260), behavior: "auto" });
        return;
      }
      // Sortie haute : depuis l'image 1, on laisse le scroll natif remonter.
      if (dir < 0 && current <= 0) return;

      // Entre les crans : un wheel = un seul step, quel que soit deltaY.
      event.preventDefault();
      if (isAnimatingRef.current) return;
      goToStep(current + dir);
    };

    // Desarme le guard d'entree des que la section n'est plus sticky :
    // le prochain wheel a l'interieur repassera par la stabilisation.
    const handleScrollArm = () => {
      const rect = section.getBoundingClientRect();
      const isSticky = rect.top <= 1 && rect.bottom >= window.innerHeight - 1;
      if (!isSticky) entryArmedRef.current = false;
    };

    section.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("scroll", handleScrollArm, { passive: true });
    return () => {
      section.removeEventListener("wheel", handleWheel);
      window.removeEventListener("scroll", handleScrollArm);
      if (lockTimeoutRef.current) clearTimeout(lockTimeoutRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [prefersReducedMotion, scrollYProgress]);

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
