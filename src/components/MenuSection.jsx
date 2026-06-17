import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MENU_GROUPS, BADGE_BG, BADGE_FG } from "../data/content.js";
import Reveal from "./Reveal.jsx";
import "../styles/menu.css";

function MenuItem({ item }) {
  const hasRating = !!item.rating;
  const hasBadge = !!item.badge;
  return (
    <div className="nh-menu__item">
      <div className="nh-menu__item-top">
        <span className="nh-menu__item-name">{item.name}</span>
        <span className="nh-menu__item-price">{item.price} €</span>
      </div>
      {(hasRating || hasBadge) && (
        <div className="nh-menu__item-meta">
          {hasRating && (
            <span className="nh-menu__rating">
              ★ {item.rating}%
              {item.reviews && <span className="nh-menu__reviews">· {item.reviews} avis</span>}
            </span>
          )}
          {hasBadge && (
            <span
              className="nh-menu__badge"
              style={{ background: BADGE_BG[item.badge] || "var(--orange)", color: BADGE_FG[item.badge] || "#fff" }}
            >
              {item.badge}
            </span>
          )}
        </div>
      )}
      {item.desc && <p className="nh-menu__item-desc">{item.desc}</p>}
    </div>
  );
}

export default function MenuSection() {
  const [open, setOpen] = useState({});

  const toggle = (id) => setOpen((s) => ({ ...s, [id]: !s[id] }));
  const allOpen = MENU_GROUPS.every((g) => open[g.id]);
  const toggleAll = () => {
    const next = {};
    MENU_GROUPS.forEach((g) => (next[g.id] = !allOpen));
    setOpen(next);
  };

  return (
    <section id="menu" className="nh-menu" data-screen-label="05 La carte">
      <div className="nh-menu__glow-a" />
      <div className="nh-menu__glow-b" />
      <div className="nh-menu__inner">
        <Reveal className="nh-menu__head">
          <div className="nh-eyebrow nh-menu__eyebrow">05 · Le mur a manger</div>
          <h2 className="nh-menu__title">LA CARTE</h2>
          <p className="nh-menu__sub">
            Tout est fait maison, genereux et pret en 10-15 min. Touche une categorie pour la
            deplier.
          </p>
        </Reveal>

        <div className="nh-menu__groups">
          {MENU_GROUPS.map((g) => {
            const isOpen = !!open[g.id];
            return (
              <div key={g.id} className="nh-menu__group">
                <button
                  type="button"
                  className="nh-menu__group-head"
                  onClick={() => toggle(g.id)}
                  aria-expanded={isOpen}
                >
                  <span className="nh-menu__group-left">
                    <span className="nh-menu__emoji">{g.emoji}</span>
                    <span className={`nh-menu__group-title${isOpen ? " is-open" : ""}`}>
                      {g.title}
                    </span>
                    <span className="nh-menu__count">{g.items.length}</span>
                  </span>
                  <span className={`nh-menu__chev${isOpen ? " is-open" : ""}`}>⌄</span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      className="nh-menu__panel"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: [0.2, 0.7, 0.2, 1] }}
                    >
                      <div className={`nh-menu__grid${g.isDrink ? " nh-menu__grid--drink" : ""}`}>
                        {g.items.map((item, i) => (
                          <MenuItem key={item.name + i} item={item} />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        <div className="nh-menu__toggle-wrap">
          <button type="button" className="nh-menu__toggle" onClick={toggleAll}>
            {allOpen ? "Reduire le menu" : "Voir tout le menu"}
          </button>
        </div>
      </div>
    </section>
  );
}
