import { useEffect, useRef, useState } from "react";
import { DISHES, LINKS } from "../data/content.js";
import useClaudeStepScene from "../hooks/useClaudeStepScene.js";
import "../styles/rail.css";

const RAIL_DISHES = DISHES.slice(0, 3);

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

/* Même breakpoint que rail.css et que le scroll-lock (MOBILE_BREAKPOINT = 860). */
const MOBILE_QUERY = "(max-width: 860px)";

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.matchMedia(MOBILE_QUERY).matches
  );

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_QUERY);
    const onChange = (event) => setIsMobile(event.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return isMobile;
}

/* Lissage temporel local à la section 04 desktop (copie volontaire de celui de
   la section 03 : le hook partagé ne doit pas changer). Le hook fait sauter
   progress d'un step entier d'un coup ; on glisse vers cette cible avec une
   constante de temps tau, indépendante du framerate. */
const SMOOTH_TAU_MS = 420;

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

/* ---- Desktop : scène sticky + scroll-lock step-by-step (inchangé) ---- */
function RailDesktop() {
  const sectionRef = useRef(null);
  const count = RAIL_DISHES.length;
  const lastIndex = count - 1;
  const { progress } = useClaudeStepScene({
    sceneKey: "railScene",
    sectionRef,
    steps: count,
  });

  /* Cible brute pilotée par le scroll : le lock la fait atterrir pile sur 0/1/2. */
  const rawTarget = progress * lastIndex;
  const floatingIndex = useSmoothedValue(rawTarget);
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

/* ---- Mobile : carousel horizontal 100 % natif (CSS scroll-snap) ----
   Aucun hook de scène, aucun progress, aucun transform JS pendant le swipe :
   Safari compose le scroll sur le thread GPU → fluidité native.
   floatingIndex = index → opacité/scale figées à 1 (rien de recalculé). */
function RailMobile() {
  const count = RAIL_DISHES.length;

  return (
    <section id="carte" className="nh-rail" data-screen-label="04 Incontournables">
      <div className="nh-rail__stage">
        <div className="nh-rail__header">
          <div className="nh-eyebrow nh-rail__eyebrow">04 · Les incontournables</div>
          <div className="nh-eyebrow nh-rail__hint">Swipe →</div>
        </div>
        <div className="nh-rail__track">
          {RAIL_DISHES.map((dish, index) => (
            <RailCard
              key={dish.name}
              dish={dish}
              index={index}
              count={count}
              floatingIndex={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default function RailSection() {
  const isMobile = useIsMobile();
  return isMobile ? <RailMobile /> : <RailDesktop />;
}
