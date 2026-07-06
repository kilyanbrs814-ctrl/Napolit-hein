import { useEffect, useRef, useState } from "react";
import { DISHES, LINKS } from "../data/content.js";
import useClaudeStepScene from "../hooks/useClaudeStepScene.js";
import "../styles/rail.css";

const RAIL_DISHES = DISHES.slice(0, 3);

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

/* Lissage temporel local à la section 04 (copie volontaire de celui de la
   section 03 : le hook partagé ne doit pas changer). Sur desktop, le hook
   fait sauter progress d'un step entier d'un coup ; on glisse vers cette
   cible avec une constante de temps tau, indépendante du framerate.
   Sur mobile, ça interpole entre les événements de scroll natifs
   (fini l'effet basse-FPS) au lieu de suivre chaque event brut. */
const SMOOTH_TAU_MS = 420;
/* Mobile : après ce délai sans variation de scroll, le rail se recale
   en douceur sur le plat le plus proche (jamais entre deux positions). */
const SNAP_IDLE_MS = 160;

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

function RailCard({ dish, index, count, floatingIndex }) {
  const distance = Math.abs(index - floatingIndex);
  const opacity = clamp(1 - distance * 0.55, 0.25, 1);
  const scale = 1 - Math.min(distance, 1) * 0.07;

  return (
    <div
      className="nh-rail__card"
      style={{
        "--dish-color": dish.glow,
        opacity,
        transform: `scale(${scale})`,
      }}
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
    </div>
  );
}

export default function RailSection() {
  const sectionRef = useRef(null);
  const count = RAIL_DISHES.length;
  const lastIndex = count - 1;
  const { progress } = useClaudeStepScene({
    sceneKey: "railScene",
    sectionRef,
    steps: count,
  });
  /* Cible brute pilotée par le scroll. Sur desktop le lock la fait atterrir
     pile sur 0 / 1 / 2 ; sur mobile elle est continue. */
  const rawTarget = progress * lastIndex;

  /* Snap mobile : si le scroll se stabilise entre deux plats, on vise le
     plat le plus proche. Sur desktop, round(rawTarget) == rawTarget → no-op. */
  const [snapTarget, setSnapTarget] = useState(null);
  useEffect(() => {
    setSnapTarget(null);
    const id = window.setTimeout(
      () => setSnapTarget(clamp(Math.round(rawTarget), 0, lastIndex)),
      SNAP_IDLE_MS
    );
    return () => window.clearTimeout(id);
  }, [rawTarget, lastIndex]);

  const floatingIndex = useSmoothedValue(snapTarget ?? rawTarget);
  const activeIndex = clamp(Math.round(floatingIndex), 0, lastIndex);
  const trackX = -floatingIndex * 100;

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
        <div
          className="nh-rail__track"
          style={{ transform: `translate3d(${trackX}vw, 0, 0)` }}
        >
          {RAIL_DISHES.map((dish, index) => (
            <RailCard
              key={dish.name}
              dish={dish}
              index={index}
              count={count}
              floatingIndex={floatingIndex}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
