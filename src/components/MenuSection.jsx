import { useMemo, useState } from "react";
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

export default function MenuSection() {
  const [activeId, setActiveId] = useState(MENU_GROUPS[0].id);
  const reduceMotion = useReducedMotion();

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
