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
    /* Capture uniquement quand le scroll est déjà dans la zone sticky :
       freeze à la position courante, aucun recalage visible à l'entrée. */
    softCapture: true,
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

/* ---- Mobile : scène bloquante step-by-step, steps DISCRETS ----
   Le scroll vertical amène la section, un mini-moteur local la verrouille
   (body fixed, comme le scroll-lock desktop), puis chaque swipe vertical
   = 1 plat max. Le rail ne bouge qu'au changement de step : la position
   cible est discrète (0 / -100vw / -200vw) et c'est une transition CSS qui
   anime — aucun recalcul JS pixel-par-pixel, donc aucune saccade.
   Le hook global n'est pas utilisé ici : il est désactivé sur mobile et
   le modifier impacterait la section 03. */
const SWIPE_THRESHOLD_PX = 36;
const STEP_COOLDOWN_MS = 520;

function RailMobile() {
  const sectionRef = useRef(null);
  const count = RAIL_DISHES.length;
  const lastIndex = count - 1;
  const [activeIndex, setActiveIndex] = useState(0);
  const stateRef = useRef({
    locked: false,
    index: 0,
    lockY: 0,
    lastScrollY: 0,
    coolAt: 0,
    touchY: 0,
    touchDelta: 0,
    consumed: false,
    released: false,
    bodyRestore: null,
  });

  useEffect(() => {
    const st = stateRef.current;
    st.lastScrollY = window.scrollY || 0;

    const setIndex = (i) => {
      st.index = i;
      setActiveIndex(i);
    };

    const instantScrollTo = (y) => {
      const html = document.documentElement;
      const body = document.body;
      const prevHtml = html.style.scrollBehavior;
      const prevBody = body.style.scrollBehavior;
      html.style.scrollBehavior = "auto";
      body.style.scrollBehavior = "auto";
      window.scrollTo(0, y);
      html.style.scrollBehavior = prevHtml;
      body.style.scrollBehavior = prevBody;
    };

    /* Zone de verrouillage = plage où le stage sticky est épinglé :
       n'importe quel Y dedans affiche exactement le même écran. */
    const zoneBounds = () => {
      const el = sectionRef.current;
      if (!el) return null;
      const top = el.getBoundingClientRect().top + (window.scrollY || 0);
      const stage = el.firstElementChild;
      const stageH = stage ? stage.offsetHeight : window.innerHeight || 1;
      return { top, end: top + Math.max(0, el.offsetHeight - stageH) };
    };

    const lock = (startIndex, freezeY) => {
      if (st.locked) return;
      const el = sectionRef.current;
      if (!el) return;

      /* Freeze à la position visuelle ACTUELLE : le stage sticky rend tout Y
         de la zone identique à l'écran → aucun scrollTo d'alignement. */
      const top = freezeY;
      const body = document.body;
      const html = document.documentElement;

      st.bodyRestore = {
        position: body.style.position,
        top: body.style.top,
        left: body.style.left,
        right: body.style.right,
        width: body.style.width,
        bodyOverscroll: body.style.overscrollBehavior,
        htmlOverscroll: html.style.overscrollBehavior,
      };
      html.style.overscrollBehavior = "none";
      body.style.overscrollBehavior = "none";
      body.style.position = "fixed";
      body.style.top = `-${top}px`;
      body.style.left = "0";
      body.style.right = "0";
      body.style.width = "100%";
      body.classList.add("nh-scene-hard-locked");

      st.locked = true;
      st.lockY = top;
      st.coolAt = performance.now();
      st.touchDelta = 0;
      st.consumed = true;
      setIndex(startIndex);
    };

    const unlock = () => {
      if (!st.locked) return;
      const body = document.body;
      const html = document.documentElement;
      const restore = st.bodyRestore;

      body.classList.remove("nh-scene-hard-locked");
      if (restore) {
        body.style.position = restore.position;
        body.style.top = restore.top;
        body.style.left = restore.left;
        body.style.right = restore.right;
        body.style.width = restore.width;
        body.style.overscrollBehavior = restore.bodyOverscroll;
        html.style.overscrollBehavior = restore.htmlOverscroll;
      }
      st.bodyRestore = null;
      st.locked = false;
      st.released = true;
      instantScrollTo(st.lockY);
      st.lastScrollY = st.lockY;
    };

    /* Capture : le scroll natif amène la section, le stage sticky s'épingle
       tout seul ; dès qu'un event scroll tombe dans la zone épinglée, on gèle
       sur place. Direction d'entrée : par le haut → plat 1, par le bas → plat 3. */
    const onScroll = () => {
      if (st.locked) return;
      const y = window.scrollY || 0;
      const prev = st.lastScrollY;
      st.lastScrollY = y;
      const dir = y > prev ? 1 : y < prev ? -1 : 0;
      if (dir === 0) return;

      const bounds = zoneBounds();
      if (!bounds) return;

      /* Le flag anti-recapture se lève une fois la zone vraiment quittée. */
      if (y < bounds.top - 50 || y > bounds.end + 50) st.released = false;
      if (st.released) return;

      if (y >= bounds.top && y <= bounds.end) {
        lock(dir > 0 ? 0 : lastIndex, y);
        return;
      }

      /* Flick extrême : toute la zone sautée entre deux events (rare).
         Petite correction technique vers le bord le plus proche. */
      if (dir > 0 && prev < bounds.top && y > bounds.end && y - bounds.end < 200) {
        instantScrollTo(bounds.end);
        st.lastScrollY = bounds.end;
        lock(0, bounds.end);
      } else if (dir < 0 && prev > bounds.end && y < bounds.top && bounds.top - y < 200) {
        instantScrollTo(bounds.top);
        st.lastScrollY = bounds.top;
        lock(lastIndex, bounds.top);
      }
    };

    const onTouchStart = (event) => {
      const touch = event.touches?.[0];
      if (!touch) return;
      st.touchY = touch.clientY;
      st.touchDelta = 0;
      st.consumed = false;
    };

    const onTouchMove = (event) => {
      if (!st.locked) return;
      if (event.cancelable) event.preventDefault();

      const touch = event.touches?.[0];
      if (!touch) return;
      st.touchDelta += st.touchY - touch.clientY;
      st.touchY = touch.clientY;

      if (st.consumed || Math.abs(st.touchDelta) < SWIPE_THRESHOLD_PX) return;
      const now = performance.now();
      if (now - st.coolAt < STEP_COOLDOWN_MS) return;

      /* 1 geste = 1 plat max (consumed), + cooldown entre deux gestes. */
      st.consumed = true;
      st.coolAt = now;

      if (st.touchDelta > 0) {
        if (st.index < lastIndex) setIndex(st.index + 1);
        else unlock();
      } else {
        if (st.index > 0) setIndex(st.index - 1);
        else unlock();
      }
    };

    const onTouchEnd = () => {
      st.touchDelta = 0;
      st.consumed = false;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("touchcancel", onTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("touchcancel", onTouchEnd);
      unlock();
    };
  }, [lastIndex]);

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
