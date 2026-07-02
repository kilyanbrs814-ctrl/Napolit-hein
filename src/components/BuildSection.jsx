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
// Le dernier cran reste avant 1 (image 4 stable, opacity en plateau des 0.84)
// mais proche, pour reduire la zone vide avant la sortie vers la section 04.
const STEP_POINTS = [0, 0.34, 0.67, 0.94];
// Duree du glissement entre deux crans, pilote en rAF pour garder un fondu
// lent et premium (le smooth natif du navigateur est trop court).
const STEP_ANIMATION_MS = 900;
// Verrou anti-spam : un seul cran par action de molette, jamais plus.
const STEP_LOCK_MS = STEP_ANIMATION_MS + 120;
// Cooldown entre deux steps : deux crans ne peuvent jamais s'enchainer
// a moins de cet intervalle, meme si l'animation etait plus courte.
const STEP_COOLDOWN_MS = 750;
// Deux wheels espaces de moins de cet intervalle appartiennent au meme
// geste (inertie) ; au-dela, c'est une nouvelle intention utilisateur.
const GESTURE_QUIET_MS = 220;

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
  // Machine a etats des crans : source de verite pour decider du prochain
  // step, immunisee contre les lectures mi-transition des seuils (activeRef
  // ne sert plus qu'a l'affichage et a la resync au repos).
  const currentStepRef = useRef(0); // cran committe (au repos)
  const targetStepRef = useRef(null); // cran vise pendant l'animation, sinon null
  // Suivi de geste 100% horodate (aucun timer, aucun lock qui peut rester
  // coince) : un geste = chaine de wheels espaces de moins de
  // GESTURE_QUIET_MS. "Consomme" = ce geste a deja produit son step, ou il a
  // commence hors de la section (scroll d'arrivee) : son inertie est absorbee.
  const lastStepTimeRef = useRef(0);
  const lastWheelTimeRef = useRef(0);
  const lastWheelDeltaRef = useRef(0);
  const gestureConsumedRef = useRef(false);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const next = ACTIVE_THRESHOLDS.findIndex((threshold) => v < threshold);
    const activeIndex = next === -1 ? TEXT_RANGES.length - 1 : next;
    activeRef.current = activeIndex;
    // Au repos (aucune animation en vol), le cran committe suit le scroll
    // reel : entrees/sorties natives et re-entrees restent synchronisees.
    if (!isAnimatingRef.current && targetStepRef.current === null) {
      currentStepRef.current = activeIndex;
    }
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
      targetStepRef.current = index;
      lastStepTimeRef.current = performance.now();
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
        // Commit : l'animation est finie, la cible devient le cran courant.
        // Sans cette purge, une ancienne cible fausserait tous les wheels
        // suivants (mauvaise branche, mauvais step).
        if (targetStepRef.current !== null) {
          currentStepRef.current = targetStepRef.current;
          targetStepRef.current = null;
        }
      }, STEP_LOCK_MS);
    };

    const handleWheel = (event) => {
      if (event.deltaY === 0) return;

      // Detection de geste AVANT le filtre de zone : un scroll d'arrivee
      // commence hors de la section et son inertie ne doit pas y declencher
      // un step. Nouvelle intention = vrai silence, ou delta qui remonte
      // nettement au-dessus du flux decroissant de l'inertie.
      const now = performance.now();
      const absDelta = Math.abs(event.deltaY);
      const isNewGesture =
        now - lastWheelTimeRef.current > GESTURE_QUIET_MS ||
        absDelta > lastWheelDeltaRef.current * 1.5;
      lastWheelTimeRef.current = now;
      lastWheelDeltaRef.current = absDelta;
      if (isNewGesture) gestureConsumedRef.current = false;

      const rect = section.getBoundingClientRect();
      // Zone d'activation tolerante : le scroll par crans repond des que la
      // section occupe l'essentiel du viewport, sans exiger un sticky parfait
      // au pixel pres (cause du "premier scroll qui ne marche pas").
      const isBuildActive =
        rect.top <= window.innerHeight * 0.15 &&
        rect.bottom >= window.innerHeight * 0.85;
      if (!isBuildActive) {
        // Geste ne hors de la section : s'il se prolonge dedans (inertie
        // d'arrivee), il sera absorbe. Aucun preventDefault ici.
        gestureConsumedRef.current = true;
        return;
      }

      // 1 step max par animation : pendant la transition, on absorbe.
      if (isAnimatingRef.current) {
        event.preventDefault();
        return;
      }
      // Cooldown par step : deux crans jamais a moins de STEP_COOLDOWN_MS.
      if (now - lastStepTimeRef.current < STEP_COOLDOWN_MS) {
        event.preventDefault();
        return;
      }
      // Inertie d'un geste deja consomme (step deja produit, ou arrivee
      // depuis une autre section) : absorbee. Un scroll rapide mais nouveau
      // (silence > 220ms ou delta en hausse) n'est JAMAIS absorbe ici.
      if (gestureConsumedRef.current) {
        event.preventDefault();
        return;
      }

      const dir = event.deltaY > 0 ? 1 : -1;
      // Hors animation, la source fiable est le cran committe.
      const current = currentStepRef.current;

      // Sortie basse : depuis l'image 4, descente manuelle progressive en
      // "instant" pour couper toute inertie native. Petit scroll = petite
      // descente, gros scroll cappe a 90px : pas de jump.
      if (dir > 0 && current >= STEP_POINTS.length - 1) {
        event.preventDefault();
        const exitDelta = Math.min(Math.abs(event.deltaY), 90);
        window.scrollBy({ top: exitDelta, behavior: "instant" });
        return;
      }
      // Sortie haute : depuis l'image 1, on laisse le scroll natif remonter.
      if (dir < 0 && current <= 0) return;

      // Hors animation : le wheel declenche exactement 1 step, premier scroll
      // dans la section compris (jamais de preventDefault sans action ici).
      // goToStep recale aussi la section si elle n'etait pas parfaitement
      // alignee (targetY est calcule depuis la position reelle).
      event.preventDefault();
      gestureConsumedRef.current = true;
      goToStep(current + dir);
    };

    // Hors de la zone active, on purge les etats : le cran committe se
    // resynchronise via les seuils et aucun lock ne bloque la prochaine entree.
    const handleScrollReset = () => {
      const rect = section.getBoundingClientRect();
      const isBuildActive =
        rect.top <= window.innerHeight * 0.15 &&
        rect.bottom >= window.innerHeight * 0.85;
      if (!isBuildActive) {
        targetStepRef.current = null;
        currentStepRef.current = activeRef.current;
      }
    };

    // Sur window (pas sur la section) : le wheel est capte meme si le curseur
    // n'est pas exactement au-dessus du bon element.
    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("scroll", handleScrollReset, { passive: true });
    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("scroll", handleScrollReset);
      if (lockTimeoutRef.current) clearTimeout(lockTimeoutRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
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
