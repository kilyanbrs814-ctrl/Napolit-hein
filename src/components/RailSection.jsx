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
    /* Même capture que la section 03 (buildScene) : lock par projection au
       franchissement de la frontière sticky. Le stage étant épinglé sur toute
       la zone de capture, le clamp dans la zone ne produit aucun décalage
       visuel, et la projection garantit qu'un gros coup de molette ne peut
       pas sauter la section. */
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

/* ---- Mobile : même principe que la section 03 mobile ----
   Aucun verrouillage du scroll : la section est simplement plus haute qu'un
   écran, son stage sticky s'épingle naturellement, et la progression native
   du scroll (fournie par le hook partagé, qui est en mode natif sous 860px —
   exactement comme la section 03) pilote le plat affiché. Le rail ne reçoit
   qu'une position cible discrète (0 / -100vw / -200vw) : c'est la transition
   CSS qui anime le glissement, composée par le GPU.
   Plus aucun body position:fixed ni scrollTo : c'est ce hard-lock custom qui
   basculait le système de scroll au moment du lock, reconstruisait le rendu
   (flash / disparition de la section) et recalait la page. */

/* Marche d'escalier côté RENDU uniquement (le scroll reste libre) : l'index
   affiché avance d'un plat maximum à la fois, avec un palier minimal entre
   deux changements. Un fling qui traverse toute la course affiche donc
   1 → 2 (arrêt réel) → 3, jamais 1 → 3 direct. L'hystérésis évite le
   scintillement quand le scroll s'arrête pile sur une frontière. */
const STEP_DWELL_MS = 650;
const STEP_HYSTERESIS = 0.08;

function useSteppedIndex(target, lastIndex) {
  const [index, setIndex] = useState(() => clamp(Math.round(target), 0, lastIndex));
  const stRef = useRef({ index, lastChange: 0 });

  useEffect(() => {
    const st = stRef.current;
    const direction =
      target > st.index + 0.5 + STEP_HYSTERESIS
        ? 1
        : target < st.index - 0.5 - STEP_HYSTERESIS
          ? -1
          : 0;
    if (direction === 0) return undefined;

    const wait = Math.max(0, st.lastChange + STEP_DWELL_MS - performance.now());
    const timer = setTimeout(() => {
      st.index = clamp(st.index + direction, 0, lastIndex);
      st.lastChange = performance.now();
      setIndex(st.index);
    }, wait);

    return () => clearTimeout(timer);
  }, [target, lastIndex, index]);

  return index;
}

function RailMobile() {
  const sectionRef = useRef(null);
  const count = RAIL_DISHES.length;
  const lastIndex = count - 1;
  const { progress } = useClaudeStepScene({
    sceneKey: "railScene",
    sectionRef,
    steps: count,
  });
  const activeIndex = useSteppedIndex(progress * lastIndex, lastIndex);

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
          <div className="nh-eyebrow nh-rail__hint">Scroll ↓</div>
        </div>
        <div
          className="nh-rail__track"
          style={{ transform: `translate3d(${-activeIndex * 100}vw, 0, 0)` }}
        >
          {RAIL_DISHES.map((dish, index) => (
            <RailCard
              key={dish.name}
              dish={dish}
              index={index}
              count={count}
              floatingIndex={activeIndex}
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
