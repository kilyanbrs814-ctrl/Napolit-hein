import { useEffect, useRef, useState } from "react";
import { BUILD_STEPS } from "../data/content.js";
import useClaudeStepScene from "../hooks/useClaudeStepScene.js";
import logo from "../assets/images/logo-napolithein.png";
import build1 from "../assets/images/build-1-rice.png";
import build2 from "../assets/images/build-2-chicken.png";
import build3 from "../assets/images/build-3-sauce.png";
import build4 from "../assets/images/build-4-final.png";
import "../styles/build.css";

const IMAGES = [build1, build2, build3, build4];
const LAST_BUILD_INDEX = IMAGES.length - 1;

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const smoothstep = (value) => value * value * (3 - 2 * value);
/* Quintique : dérivées 1re ET 2e nulles aux bords → départ/arrivée encore plus doux. */
const smootherstep = (v) => v * v * v * (v * (v * 6 - 15) + 10);

/* Lissage temporel local à la section 03 : le hook (partagé avec la section 04)
   fait sauter progress d'un step entier d'un coup sur desktop ; on interpole ici
   vers cette cible avec une constante de temps ~selon tau, indépendante du framerate.
   Ne modifie pas useClaudeStepScene. */
const SMOOTH_TAU_MS = 340;

/* MOBILE uniquement (mode natif du hook, sans scroll-lock) : le scroll pilote
   progress linéairement sur toute la hauteur de la section. On fait atteindre
   la cible d'animation à 70 % du parcours ; les 30 % restants (le runway rendu
   possible par la hauteur mobile 280svh dans build.css) gardent le stage
   sticky à l'écran pendant que le lissage finit réellement les fondus des
   images 3 et 4 — même sur un swipe rapide, la page ne descend vers la
   section 04 qu'après. Sur desktop, isNative est false (scroll-lock actif) et
   ce remap ne s'applique pas. */
const NATIVE_END_RUNWAY = 0.3;

function useSmoothedValue(target, tau = SMOOTH_TAU_MS) {
  const [value, setValue] = useState(target);
  const stateRef = useRef({ value: target, target });
  stateRef.current.target = target;

  useEffect(() => {
    let rafId;
    let last = performance.now();
    const tick = (now) => {
      const dt = Math.min(now - last, 100);
      last = now;
      const st = stateRef.current;
      if (st.value !== st.target) {
        const k = 1 - Math.exp(-dt / tau);
        const next = st.value + (st.target - st.value) * k;
        st.value = Math.abs(st.target - next) < 0.0005 ? st.target : next;
        setValue(st.value);
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [tau]);

  return value;
}

function BuildImageLayer({ image, index, floatingIndex }) {
  /* Fondu additif : la couche N apparaît lentement PAR-DESSUS la couche N-1,
     qui reste pleinement visible dessous (zIndex croissant). Pas de crossfade
     croisé → jamais de creux semi-transparent au milieu de la transition.
     Fenêtre 1.0 : l'apparition occupe 100 % du trajet entre deux steps. */
  const remaining = Math.max(index - floatingIndex, 0);
  const raw = clamp(1 - remaining, 0, 1);
  const opacity = smootherstep(raw);

  return (
    <div
      className="nh-build__img"
      style={{
        backgroundImage: `url(${image})`,
        opacity,
        zIndex: index + 1,
      }}
      aria-hidden="true"
    />
  );
}

function TextStep({ index, step, floatingIndex, activeIndex }) {
  const opacity = clamp(1 - Math.abs(floatingIndex - index) * 2.2, 0, 1);
  const y = (1 - opacity) * 18 * (index < floatingIndex ? -1 : 1);

  return (
    <div
      className="nh-build__txt"
      style={{
        opacity,
        transform: `translateY(${y}px)`,
      }}
      aria-hidden={index !== activeIndex}
    >
      {step.lead && <div className="nh-build__txt-lead">{step.lead}</div>}
      {step.isLogo ? (
        <img src={logo} alt="Napolit'hein Crousty" className="nh-build__txt-logo" />
      ) : (
        <div className="nh-build__txt-title">{step.title}</div>
      )}
      <div className="nh-build__txt-desc">{step.desc}</div>
    </div>
  );
}

export default function BuildSection() {
  const sectionRef = useRef(null);
  const { progress, isNative } = useClaudeStepScene({
    sceneKey: "buildScene",
    sectionRef,
    steps: IMAGES.length,
  });

  const sceneProgress = isNative
    ? clamp(progress / (1 - NATIVE_END_RUNWAY), 0, 1)
    : progress;
  const floatingIndex = useSmoothedValue(sceneProgress * LAST_BUILD_INDEX);
  const displayIndex = clamp(Math.round(floatingIndex), 0, LAST_BUILD_INDEX);
  const glowOpacity = 0.4 + 0.5 * Math.sin((floatingIndex / LAST_BUILD_INDEX) * Math.PI);

  return (
    <section id="couches" ref={sectionRef} className="nh-build" data-screen-label="03 Construction">
      <div className="nh-build__stage">
        <div className="nh-eyebrow nh-build__eyebrow">03 · Couche par couche</div>
        <div className="nh-build__grid">
          <div className="nh-build__bowl-wrap">
            <div className="nh-build__glow" style={{ opacity: glowOpacity }} />
            {IMAGES.map((img, i) => (
              <BuildImageLayer key={img} image={img} index={i} floatingIndex={floatingIndex} />
            ))}
            <div className="nh-build__ring" aria-hidden="true" />
          </div>

          <div className="nh-build__side">
            <div className="nh-build__num">{"0" + (displayIndex + 1)}</div>
            <div className="nh-build__txt-stack">
              {BUILD_STEPS.map((step, i) => (
                <TextStep
                  key={i}
                  index={i}
                  step={step}
                  floatingIndex={floatingIndex}
                  activeIndex={displayIndex}
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
