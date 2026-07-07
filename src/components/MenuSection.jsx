import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { MENU_GROUPS, BADGE_BG, BADGE_FG, LINKS } from "../data/content.js";
import Reveal from "./Reveal.jsx";
import newCreamy from "../assets/images/new-creamy.png";
import newCurry from "../assets/images/new-curry.png";
import newTandoori from "../assets/images/new-tandoori.png";
import newPoulet from "../assets/images/new-pouletcreme.png";
import newCarbonara from "../assets/images/new-carbonara.png";
import newCroccheese from "../assets/images/new-croccheese.png";
import newDolce from "../assets/images/new-dolce.png";
import "../styles/menu.css";

// Association nom de plat -> visuel deja present dans le repo (aucune image inventee).
// Ordre = priorite du match (les regles les plus specifiques d'abord).
const IMAGE_RULES = [
  [/carbo/i, newCarbonara],
  [/tandoori/i, newTandoori],
  [/curry/i, newCurry],
  [/croc.?cheese/i, newCroccheese],
  [/dolce/i, newDolce],
  [/poulet cr/i, newPoulet],
  [/creamy/i, newCreamy],
];
function getDishImage(name) {
  const match = IMAGE_RULES.find(([re]) => re.test(name));
  return match ? match[1] : null;
}

function MenuCard({ item, index, compact, categoryTitle, reduceMotion }) {
  const img = !compact ? getDishImage(item.name) : null;
  const hasRating = !!item.rating;
  const hasBadge = !!item.badge;
  const hasBadges = hasRating || hasBadge;

  const motionProps = reduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 18 },
        animate: { opacity: 1, y: 0 },
        transition: {
          duration: 0.4,
          delay: Math.min(index * 0.04, 0.32),
          ease: [0.2, 0.7, 0.2, 1],
        },
      };

  return (
    <motion.div className={`nh-menu__card${compact ? " is-compact" : ""}`} {...motionProps}>
      {!compact && (
        <div className="nh-menu__media">
          {img ? (
            <img src={img} alt={item.name} className="nh-menu__image" loading="lazy" />
          ) : (
            <div className="nh-menu__image-fallback">
              <span className="nh-menu__image-fallback-cat">{categoryTitle}</span>
            </div>
          )}
          {hasBadges && (
            <div className="nh-menu__badges">
              {hasBadge && (
                <span
                  className="nh-menu__badge"
                  style={{
                    background: BADGE_BG[item.badge] || "var(--orange)",
                    color: BADGE_FG[item.badge] || "#fff",
                  }}
                >
                  {item.badge}
                </span>
              )}
              {hasRating && (
                <span className="nh-menu__badge nh-menu__badge--rate">★ {item.rating}%</span>
              )}
            </div>
          )}
        </div>
      )}

      <div className="nh-menu__body">
        <h3 className="nh-menu__name">{item.name}</h3>
        {compact && hasRating && (
          <span className="nh-menu__rating-inline">★ {item.rating}%</span>
        )}
        {item.desc && <p className="nh-menu__desc">{item.desc}</p>}
      </div>

      <div className="nh-menu__footer">
        <span className="nh-menu__price">{item.price} €</span>
        <a
          href={LINKS.uber}
          target="_blank"
          rel="noopener noreferrer"
          className={`nh-menu__order${compact ? " nh-menu__order--sm" : ""}`}
        >
          Commander <span aria-hidden>→</span>
        </a>
      </div>
    </motion.div>
  );
}

/* Même breakpoint que menu.css : la nav mobile remplace la nav desktop
   uniquement sous 860px (largeur seule, pas de détection de pointeur,
   pour rester aligné pile sur la media query CSS). */
const MOBILE_LAYOUT_QUERY = "(max-width: 860px)";

function useMobileMenuLayout() {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.matchMedia(MOBILE_LAYOUT_QUERY).matches
  );

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_LAYOUT_QUERY);
    const onChange = (event) => setIsMobile(event.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return isMobile;
}

function Chevron({ dir }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {dir < 0 ? <polyline points="15 18 9 12 15 6" /> : <polyline points="9 18 15 12 9 6" />}
    </svg>
  );
}

/* ---- Rail horizontal mobile des catégories ----
   Carrousel bouclant : la liste est rendue en 3 copies identiques et le
   scroll est re-normalisé en silence vers la plage centrale (les copies
   étant identiques au pixel, la téléportation d'une largeur de copie est
   invisible) → swipe "à l'infini" dans les deux sens. Seule la copie
   centrale porte la sémantique tabs (ids, aria-selected) ; les clones sont
   aria-hidden et non focusables. Les flèches bouclent première ↔ dernière
   et recentrent la pill active la plus proche. Le scroll vertical de la
   page n'est jamais touché (overflow-x natif, aucun scroll de page). */
const RAIL_COPIES = [0, 1, 2];

function MobileCategoryRail({ groups, activeId, onSelect }) {
  const scrollRef = useRef(null);
  const listRef = useRef(null);
  const prevIdRef = useRef(activeId);

  const copyWidth = () => (listRef.current?.scrollWidth || 0) / RAIL_COPIES.length;

  /* Centre l'instance de la catégorie la plus proche de la vue actuelle
     (uniquement le scroll HORIZONTAL du rail : jamais de scroll de page). */
  const centerOn = (id, behavior) => {
    const scroller = scrollRef.current;
    if (!scroller) return;
    const pills = scroller.querySelectorAll(`[data-cat-id="${id}"]`);
    if (!pills.length) return;

    const srect = scroller.getBoundingClientRect();
    const viewCenter = srect.left + srect.width / 2;
    let bestLeft = null;
    let bestDist = Infinity;
    pills.forEach((pill) => {
      const r = pill.getBoundingClientRect();
      const dist = r.left + r.width / 2 - viewCenter;
      if (Math.abs(dist) < bestDist) {
        bestDist = Math.abs(dist);
        bestLeft = scroller.scrollLeft + dist;
      }
    });
    if (bestLeft !== null) scroller.scrollTo({ left: bestLeft, behavior });
  };

  /* Boucle : re-normalise le scroll vers la plage centrale, sans effet
     visible (contenu identique à ±1 largeur de copie près). */
  const onScroll = () => {
    const scroller = scrollRef.current;
    const width = copyWidth();
    if (!scroller || !width) return;
    if (scroller.scrollLeft < width * 0.25) scroller.scrollLeft += width;
    else if (scroller.scrollLeft > width * 1.75) scroller.scrollLeft -= width;
  };

  useEffect(() => {
    const scroller = scrollRef.current;
    const width = copyWidth();
    if (scroller && width) scroller.scrollLeft = width;
    centerOn(prevIdRef.current, "auto");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (prevIdRef.current === activeId) return;
    prevIdRef.current = activeId;
    centerOn(activeId, "smooth");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId]);

  const step = (dir) => {
    const index = groups.findIndex((g) => g.id === activeId);
    const next = groups[(index + dir + groups.length) % groups.length];
    onSelect(next.id);
  };

  return (
    <nav className="nh-menu__mnav" aria-label="Catégories du menu">
      <button
        type="button"
        className="nh-menu__mnav-arrow"
        aria-label="Catégorie précédente"
        onClick={() => step(-1)}
      >
        <Chevron dir={-1} />
      </button>

      <div className="nh-menu__mnav-scroll" ref={scrollRef} onScroll={onScroll}>
        <ul className="nh-menu__mnav-list" role="tablist" ref={listRef}>
          {RAIL_COPIES.map((copy) =>
            groups.map((g) => {
              const isReal = copy === 1;
              const isActive = g.id === activeId;
              return (
                <li
                  key={`${copy}-${g.id}`}
                  role="presentation"
                  aria-hidden={isReal ? undefined : "true"}
                >
                  <button
                    type="button"
                    role={isReal ? "tab" : undefined}
                    id={isReal ? `nh-menu-tab-${g.id}` : undefined}
                    aria-selected={isReal ? isActive : undefined}
                    aria-controls={isReal ? "nh-menu-panel" : undefined}
                    tabIndex={isReal ? undefined : -1}
                    data-cat-id={g.id}
                    className={`nh-menu__mnav-tab${isActive ? " is-active" : ""}`}
                    onClick={() => onSelect(g.id)}
                  >
                    <span className="nh-menu__mnav-emoji" aria-hidden="true">
                      {g.emoji}
                    </span>
                    {g.title}
                  </button>
                </li>
              );
            })
          )}
        </ul>
      </div>

      <button
        type="button"
        className="nh-menu__mnav-arrow"
        aria-label="Catégorie suivante"
        onClick={() => step(1)}
      >
        <Chevron dir={1} />
      </button>
    </nav>
  );
}

export default function MenuSection() {
  const [activeId, setActiveId] = useState(MENU_GROUPS[0].id);
  const reduceMotion = useReducedMotion();
  const isMobileLayout = useMobileMenuLayout();

  const activeGroup = useMemo(
    () => MENU_GROUPS.find((g) => g.id === activeId) || MENU_GROUPS[0],
    [activeId]
  );

  const GridWrap = reduceMotion ? "div" : motion.div;
  const gridMotionProps = reduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 14 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -10 },
        transition: { duration: 0.3, ease: [0.2, 0.7, 0.2, 1] },
      };

  return (
    <section id="menu" className="nh-menu" data-screen-label="05 La carte">
      <div className="nh-menu__glow-a" />
      <div className="nh-menu__glow-b" />
      <div className="nh-menu__inner">
        <Reveal className="nh-menu__head">
          <div className="nh-eyebrow nh-menu__eyebrow">05 · La carte complète</div>
          <h2 className="nh-menu__title">NOTRE MENU.</h2>
          <p className="nh-menu__sub">
            Choisis ta catégorie, trouve ton crousty, commande direct.
          </p>
        </Reveal>

        <div className="nh-menu__content">
          {isMobileLayout ? (
            <MobileCategoryRail
              groups={MENU_GROUPS}
              activeId={activeId}
              onSelect={setActiveId}
            />
          ) : (
            <nav className="nh-menu__side" aria-label="Catégories du menu">
              <ul className="nh-menu__side-list" role="tablist">
                {MENU_GROUPS.map((g) => (
                  <li key={g.id} role="presentation">
                    <button
                      type="button"
                      role="tab"
                      id={`nh-menu-tab-${g.id}`}
                      aria-selected={g.id === activeId}
                      aria-controls="nh-menu-panel"
                      className={`nh-menu__side-tab${g.id === activeId ? " is-active" : ""}`}
                      onClick={() => setActiveId(g.id)}
                    >
                      <span className="nh-menu__tab-emoji" aria-hidden="true">{g.emoji}</span>
                      {g.title}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          )}

          <div id="nh-menu-panel" role="tabpanel" aria-labelledby={`nh-menu-tab-${activeGroup.id}`}>
            <AnimatePresence mode="wait" initial={false}>
              <GridWrap
                key={activeGroup.id}
                className={`nh-menu__grid${activeGroup.isDrink ? " nh-menu__grid--drink" : ""}`}
                {...gridMotionProps}
              >
                {activeGroup.items.map((item, i) => (
                  <MenuCard
                    key={item.name + i}
                    item={item}
                    index={i}
                    compact={!!activeGroup.isDrink}
                    categoryTitle={activeGroup.title}
                    reduceMotion={reduceMotion}
                  />
                ))}
              </GridWrap>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
