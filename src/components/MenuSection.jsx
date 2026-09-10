import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { MENU_GROUPS, BADGE_BG, BADGE_FG, LINKS, DELIVERY_LOGOS } from "../data/content.js";
import Reveal from "./Reveal.jsx";
import newCreamy from "../assets/images/new-creamy.png";
import newCurry from "../assets/images/new-curry.png";
import newTandoori from "../assets/images/new-tandoori.png";
import newPoulet from "../assets/images/new-pouletcreme.png";
import newCarbonara from "../assets/images/new-carbonara.png";
import newCroccheese from "../assets/images/new-croccheese.png";
import newDolce from "../assets/images/new-dolce.png";
import "../styles/menu.css";

const IMAGE_RULES = [
  [/carbo/i, newCarbonara],
  [/tha[iï]/i, newTandoori],
  [/tandoori/i, newTandoori],
  [/curry/i, newCurry],
  [/croc.?cheese/i, newCroccheese],
  [/dolce/i, newDolce],
  [/poulet cr/i, newPoulet],
  [/creamy/i, newCreamy],
  [/napo/i, newCreamy],
  [/champy/i, newCreamy],
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
              {hasRating && <span className="nh-menu__badge nh-menu__badge--rate">★ {item.rating}%</span>}
            </div>
          )}
        </div>
      )}

      <div className="nh-menu__body">
        <h3 className="nh-menu__name">{item.name}</h3>
        {compact && hasRating && <span className="nh-menu__rating-inline">★ {item.rating}%</span>}
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

const MOBILE_GROUP_DEFS = [
  { id: "offers", emoji: "🌟", title: "Offres", sourceIds: ["offers"] },
  { id: "riz", emoji: "🍚", title: "Riz crousty", sourceIds: ["riz"] },
  { id: "pates-mobile", emoji: "🍝", title: "Pâtes", sourceIds: ["pasta", "pates", "gratin"] },
  { id: "cote", emoji: "😋", title: "À côté", sourceIds: ["faim"] },
  { id: "desserts", emoji: "😎", title: "Desserts", sourceIds: ["gourm"] },
  { id: "boissons", emoji: "🥵", title: "Boissons", sourceIds: ["soif"] },
];

const MOBILE_DESCRIPTIONS = {
  "Curry Crousty": "Poulet croustillant, riz et sauce curry.",
  "Dolce Crousty": "Poulet croustillant, riz et sauce sucrée.",
  "Thaï Crunch Crousty": "Riz, poulet croustillant et sauce thaï.",
  "Napo Crousty": "Sauce crémeuse et oignons frits.",
};

function buildMobileGroups() {
  return MOBILE_GROUP_DEFS.map((def) => ({
    ...def,
    items: def.sourceIds.flatMap((id) => MENU_GROUPS.find((group) => group.id === id)?.items || []),
  }));
}

function Chevron({ dir }) {
  return (
    <svg
      width="17"
      height="17"
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

function MobileCategoryRail({ groups, activeId, onSelect }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    const scroller = scrollRef.current;
    const active = scroller?.querySelector(`[data-mobile-cat="${activeId}"]`);
    if (!scroller || !active) return;

    const targetLeft = active.offsetLeft - scroller.clientWidth / 2 + active.clientWidth / 2;
    scroller.scrollTo({ left: targetLeft, behavior: "smooth" });
  }, [activeId]);

  const step = (dir) => {
    const current = groups.findIndex((group) => group.id === activeId);
    const next = groups[(current + dir + groups.length) % groups.length];
    onSelect(next.id);
  };

  return (
    <nav className="nh-menu__mnav" aria-label="Catégories du menu">
      <button type="button" className="nh-menu__mnav-arrow" aria-label="Catégorie précédente" onClick={() => step(-1)}>
        <Chevron dir={-1} />
      </button>

      <div className="nh-menu__mnav-scroll" ref={scrollRef}>
        <ul className="nh-menu__mnav-list" role="tablist">
          {groups.map((group) => {
            const isActive = group.id === activeId;
            return (
              <li key={group.id} role="presentation">
                <button
                  type="button"
                  role="tab"
                  id={`nh-menu-mobile-tab-${group.id}`}
                  aria-selected={isActive}
                  aria-controls="nh-menu-mobile-panel"
                  data-mobile-cat={group.id}
                  className={`nh-menu__mnav-tab${isActive ? " is-active" : ""}`}
                  onClick={() => onSelect(group.id)}
                >
                  <span className="nh-menu__mnav-emoji" aria-hidden="true">{group.emoji}</span>
                  {group.title}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <button type="button" className="nh-menu__mnav-arrow" aria-label="Catégorie suivante" onClick={() => step(1)}>
        <Chevron dir={1} />
      </button>
    </nav>
  );
}

function MobileMenuRow({ item, index, reduceMotion }) {
  const image = getDishImage(item.name);
  const description = MOBILE_DESCRIPTIONS[item.name] || item.desc || "";
  const motionProps = reduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 12 },
        animate: { opacity: 1, y: 0 },
        transition: {
          duration: 0.3,
          delay: Math.min(index * 0.035, 0.22),
          ease: [0.2, 0.7, 0.2, 1],
        },
      };

  return (
    <motion.article className={`nh-menu__mobile-row${image ? "" : " nh-menu__mobile-row--no-image"}`} {...motionProps}>
      <div className="nh-menu__mobile-copy">
        <div className="nh-menu__mobile-titleline">
          <h3 className="nh-menu__mobile-name">{item.name}</h3>
          {item.badge && <span className="nh-menu__mobile-badge">{item.badge}</span>}
        </div>
        {description && <p className="nh-menu__mobile-desc">{description}</p>}
        <span className="nh-menu__mobile-price">{item.price} €</span>
      </div>

      {image && (
        <div className="nh-menu__mobile-media">
          <img src={image} alt={item.name} className="nh-menu__mobile-image" loading="lazy" />
        </div>
      )}
    </motion.article>
  );
}

function MobileOrderChooser() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState("mode");
  const [selectedMode, setSelectedMode] = useState(null);

  const openChooser = () => {
    setStep("mode");
    setSelectedMode(null);
    setOpen(true);
  };

  const openContact = (mode) => {
    setSelectedMode(mode);
    setStep("contact");
  };

  const chooserTitle =
    step === "delivery"
      ? "Livraison"
      : step === "contact"
        ? selectedMode === "place"
          ? "Sur place"
          : "À emporter"
        : "Commander";

  return (
    <>
      <div className="nh-menu__mobile-order-wrap">
        <button type="button" className="nh-menu__mobile-order" onClick={openChooser}>
          Commander
        </button>
        <p className="nh-menu__mobile-order-help">Sur place, à emporter ou en livraison</p>
      </div>

      {open && (
        <div className="nh-menu__chooser-backdrop" role="presentation" onClick={() => setOpen(false)}>
          <div
            className="nh-menu__chooser"
            role="dialog"
            aria-modal="true"
            aria-labelledby="nh-menu-chooser-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="nh-menu__chooser-head">
              <div className="nh-menu__chooser-heading">
                {step !== "mode" && (
                  <button type="button" className="nh-menu__chooser-back" aria-label="Retour" onClick={() => setStep("mode")}>
                    <Chevron dir={-1} />
                  </button>
                )}
                <h3 id="nh-menu-chooser-title" className="nh-menu__chooser-title">{chooserTitle}</h3>
              </div>
              <button type="button" className="nh-menu__chooser-close" aria-label="Fermer" onClick={() => setOpen(false)}>
                ×
              </button>
            </div>

            {step === "mode" && (
              <div className="nh-menu__chooser-modes">
                <button type="button" className="nh-menu__chooser-mode" onClick={() => openContact("place")}>
                  Sur place
                </button>
                <button type="button" className="nh-menu__chooser-mode" onClick={() => openContact("takeaway")}>
                  À emporter
                </button>
                <button type="button" className="nh-menu__chooser-mode" onClick={() => setStep("delivery")}>
                  Livraison
                </button>
              </div>
            )}

            {step === "contact" && (
              <div className="nh-menu__chooser-contact">
                <a className="nh-menu__chooser-contact-row" href={LINKS.tel}>
                  <span className="nh-menu__chooser-contact-label">Téléphone</span>
                  <strong>06 04 65 94 06</strong>
                </a>
                <a
                  className="nh-menu__chooser-contact-row"
                  href={LINKS.maps}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="nh-menu__chooser-contact-label">Adresse</span>
                  <strong>16 Avenue Colonel Teyssier, 81000 Albi</strong>
                </a>
              </div>
            )}

            {step === "delivery" && (
              <div className="nh-menu__chooser-delivery">
                <a
                  className="nh-menu__chooser-logo-link"
                  href={LINKS.uber}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Commander avec Uber Eats"
                >
                  <img src={DELIVERY_LOGOS.uber} alt="Uber Eats" className="nh-menu__chooser-logo" />
                </a>
                <a
                  className="nh-menu__chooser-logo-link"
                  href={LINKS.deliveroo}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Commander avec Deliveroo"
                >
                  <img src={DELIVERY_LOGOS.deliveroo} alt="Deliveroo" className="nh-menu__chooser-logo" />
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

const MOBILE_SIMPLE_CSS = `
@media (max-width: 860px) {
  .nh-menu { padding: 74px 0 78px; background: linear-gradient(180deg, #07101d 0%, #050b14 100%); }
  .nh-menu__inner { padding: 0 18px; }
  .nh-menu__head { gap: 8px; margin-bottom: 26px; align-items: center; text-align: center; }
  .nh-menu__eyebrow { display: none; }
  .nh-menu__title { font-size: clamp(58px, 17vw, 84px); line-height: .88; letter-spacing: -.01em; }
  .nh-menu__sub { max-width: none; font-size: clamp(16px, 4.5vw, 20px); line-height: 1.4; color: rgba(224,230,240,.76); }
  .nh-menu__content { display: block; }

  .nh-menu__mnav { position: static; display: flex; align-items: center; gap: 7px; margin: 0 -18px 18px; padding: 0 10px; background: none; min-width: 0; }
  .nh-menu__mnav-arrow { flex: 0 0 auto; width: 42px; height: 42px; display: flex; align-items: center; justify-content: center; border-radius: 999px; border: 1px solid rgba(255,255,255,.15); background: rgba(255,255,255,.05); color: #fff; cursor: pointer; }
  .nh-menu__mnav-arrow:active { transform: scale(.93); background: rgba(255,90,31,.18); border-color: rgba(255,90,31,.65); }
  .nh-menu__mnav-scroll { flex: 1 1 auto; min-width: 0; overflow-x: auto; overflow-y: hidden; -webkit-overflow-scrolling: touch; scrollbar-width: none; overscroll-behavior-x: contain; scroll-snap-type: x proximity; -webkit-mask-image: linear-gradient(90deg, transparent, #000 14px, #000 calc(100% - 14px), transparent); mask-image: linear-gradient(90deg, transparent, #000 14px, #000 calc(100% - 14px), transparent); }
  .nh-menu__mnav-scroll::-webkit-scrollbar { display: none; }
  .nh-menu__mnav-list { list-style: none; margin: 0; padding: 0 12px 10px; display: flex; gap: 10px; width: max-content; }
  .nh-menu__mnav-tab { min-height: 48px; display: inline-flex; align-items: center; justify-content: center; gap: 7px; border: 1px solid rgba(255,255,255,.16); border-radius: 999px; padding: 11px 20px; background: transparent; color: rgba(213,220,232,.72); font-family: var(--body); font-size: 15px; font-weight: 750; letter-spacing: 0; text-transform: none; line-height: 1; white-space: nowrap; scroll-snap-align: center; }
  .nh-menu__mnav-tab.is-active { border-color: var(--orange); background: var(--orange); color: #fff; box-shadow: none; }
  .nh-menu__mnav-emoji { font-size: 16px; line-height: 1; flex-shrink: 0; }

  .nh-menu__mobile-list { border-top: 1px solid rgba(255,255,255,.13); }
  .nh-menu__mobile-row { min-height: 176px; display: grid; grid-template-columns: minmax(0,1fr) 132px; gap: 16px; align-items: center; padding: 18px 0; border-bottom: 1px solid rgba(255,255,255,.13); }
  .nh-menu__mobile-row--no-image { grid-template-columns: 1fr; min-height: 132px; }
  .nh-menu__mobile-copy { min-width: 0; }
  .nh-menu__mobile-titleline { display: flex; align-items: center; flex-wrap: wrap; gap: 9px; margin-bottom: 8px; }
  .nh-menu__mobile-name { margin: 0; font-family: var(--display); font-size: clamp(27px, 7.9vw, 39px); line-height: .96; letter-spacing: 0; color: #fff; text-transform: uppercase; }
  .nh-menu__mobile-badge { display: inline-flex; align-items: center; min-height: 30px; padding: 6px 10px; border-radius: 7px; background: var(--orange); color: #090d16; font-family: var(--body); font-size: 12px; font-weight: 900; line-height: 1; white-space: nowrap; }
  .nh-menu__mobile-desc { margin: 0 0 14px; color: rgba(216,222,233,.72); font-family: var(--body); font-size: 15px; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  .nh-menu__mobile-price { display: block; font-family: var(--display); font-size: 30px; line-height: 1; color: var(--orange); }
  .nh-menu__mobile-media { width: 132px; height: 132px; border-radius: 16px; overflow: hidden; background: rgba(255,255,255,.04); }
  .nh-menu__mobile-image { width: 100%; height: 100%; display: block; object-fit: cover; }

  .nh-menu__mobile-order-wrap { padding-top: 34px; }
  .nh-menu__mobile-order { width: 100%; min-height: 66px; display: flex; align-items: center; justify-content: center; border: 0; border-radius: 999px; background: var(--orange); color: #fff; font-family: var(--body); font-size: 22px; font-weight: 900; cursor: pointer; box-shadow: 0 18px 42px -28px rgba(255,90,31,.9); }
  .nh-menu__mobile-order:active { transform: scale(.985); }
  .nh-menu__mobile-order-help { margin: 16px 0 0; text-align: center; color: rgba(216,222,233,.68); font-family: var(--body); font-size: 15px; line-height: 1.4; }

  .nh-menu__chooser-backdrop { position: fixed; inset: 0; z-index: 1000; display: flex; align-items: flex-end; justify-content: center; padding: 18px; background: rgba(2,6,12,.72); backdrop-filter: blur(7px); -webkit-backdrop-filter: blur(7px); }
  .nh-menu__chooser { width: min(100%,460px); border: 1px solid rgba(255,255,255,.14); border-radius: 24px; padding: 22px; background: #0b1220; box-shadow: 0 30px 70px rgba(0,0,0,.45); }
  .nh-menu__chooser-head { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 16px; }
  .nh-menu__chooser-heading { display: flex; align-items: center; gap: 10px; min-width: 0; }
  .nh-menu__chooser-title { margin: 0; font-family: var(--display); font-size: 30px; line-height: 1; color: #fff; text-transform: uppercase; }
  .nh-menu__chooser-back, .nh-menu__chooser-close { width: 40px; height: 40px; flex: 0 0 auto; display: flex; align-items: center; justify-content: center; border: 1px solid rgba(255,255,255,.13); border-radius: 999px; background: rgba(255,255,255,.05); color: #fff; cursor: pointer; }
  .nh-menu__chooser-close { font-size: 22px; }
  .nh-menu__chooser-modes { display: grid; gap: 10px; }
  .nh-menu__chooser-mode { width: 100%; min-height: 56px; border: 1px solid rgba(255,255,255,.13); border-radius: 14px; background: rgba(255,255,255,.055); color: #fff; font-family: var(--body); font-size: 16px; font-weight: 850; cursor: pointer; }
  .nh-menu__chooser-mode:active { border-color: var(--orange); background: rgba(255,90,31,.16); }

  .nh-menu__chooser-contact { display: grid; gap: 10px; }
  .nh-menu__chooser-contact-row { display: flex; flex-direction: column; gap: 5px; padding: 14px 16px; border: 1px solid rgba(255,255,255,.13); border-radius: 14px; background: rgba(255,255,255,.055); color: #fff; text-decoration: none; }
  .nh-menu__chooser-contact-label { color: rgba(216,222,233,.62); font-family: var(--body); font-size: 12px; font-weight: 750; text-transform: uppercase; letter-spacing: .05em; }
  .nh-menu__chooser-contact-row strong { font-family: var(--body); font-size: 15px; line-height: 1.35; }

  .nh-menu__chooser-delivery { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .nh-menu__chooser-logo-link { min-height: 88px; display: flex; align-items: center; justify-content: center; padding: 18px; border-radius: 16px; background: #fff; text-decoration: none; overflow: hidden; }
  .nh-menu__chooser-logo { display: block; max-width: 100%; width: auto; max-height: 42px; height: auto; object-fit: contain; }
}

@media (max-width: 480px) {
  .nh-menu__mobile-row { grid-template-columns: minmax(0,1fr) 118px; gap: 13px; min-height: 162px; }
  .nh-menu__mobile-media { width: 118px; height: 118px; border-radius: 14px; }
  .nh-menu__mobile-name { font-size: clamp(25px, 7.7vw, 34px); }
  .nh-menu__mobile-desc { font-size: 14px; }
  .nh-menu__mobile-price { font-size: 28px; }
  .nh-menu__chooser-delivery { grid-template-columns: 1fr; }
}

@media (max-width: 360px) {
  .nh-menu__mobile-row { grid-template-columns: minmax(0,1fr) 104px; }
  .nh-menu__mobile-media { width: 104px; height: 104px; }
  .nh-menu__mobile-badge { font-size: 10px; }
}
`;

export default function MenuSection() {
  const reduceMotion = useReducedMotion();
  const isMobileLayout = useMobileMenuLayout();
  const [desktopActiveId, setDesktopActiveId] = useState(MENU_GROUPS[0].id);
  const [mobileActiveId, setMobileActiveId] = useState("riz");

  const activeDesktopGroup = useMemo(
    () => MENU_GROUPS.find((g) => g.id === desktopActiveId) || MENU_GROUPS[0],
    [desktopActiveId]
  );

  const mobileGroups = useMemo(() => buildMobileGroups(), []);
  const activeMobileGroup = useMemo(
    () => mobileGroups.find((group) => group.id === mobileActiveId) || mobileGroups[1] || mobileGroups[0],
    [mobileGroups, mobileActiveId]
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
      <style>{MOBILE_SIMPLE_CSS}</style>
      <div className="nh-menu__glow-a" />
      <div className="nh-menu__glow-b" />
      <div className="nh-menu__inner">
        <Reveal className="nh-menu__head">
          <div className="nh-eyebrow nh-menu__eyebrow">05 · La carte complète</div>
          <h2 className="nh-menu__title">NOTRE MENU.</h2>
          <p className="nh-menu__sub">
            {isMobileLayout ? "Choisis ton plat, on s’occupe du reste." : "Choisis ta catégorie, trouve ton crousty, commande direct."}
          </p>
        </Reveal>

        {isMobileLayout ? (
          <div className="nh-menu__content">
            <MobileCategoryRail groups={mobileGroups} activeId={mobileActiveId} onSelect={setMobileActiveId} />

            <div id="nh-menu-mobile-panel" role="tabpanel" aria-labelledby={`nh-menu-mobile-tab-${activeMobileGroup.id}`}>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={activeMobileGroup.id}
                  className="nh-menu__mobile-list"
                  initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
                  transition={{ duration: reduceMotion ? 0 : 0.24 }}
                >
                  {activeMobileGroup.items.map((item, index) => (
                    <MobileMenuRow
                      key={`${activeMobileGroup.id}-${item.name}-${index}`}
                      item={item}
                      index={index}
                      reduceMotion={reduceMotion}
                    />
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>

            <MobileOrderChooser />
          </div>
        ) : (
          <div className="nh-menu__content">
            <nav className="nh-menu__side" aria-label="Catégories du menu">
              <ul className="nh-menu__side-list" role="tablist">
                {MENU_GROUPS.map((g) => (
                  <li key={g.id} role="presentation">
                    <button
                      type="button"
                      role="tab"
                      id={`nh-menu-tab-${g.id}`}
                      aria-selected={g.id === desktopActiveId}
                      aria-controls="nh-menu-panel"
                      className={`nh-menu__side-tab${g.id === desktopActiveId ? " is-active" : ""}`}
                      onClick={() => setDesktopActiveId(g.id)}
                    >
                      <span className="nh-menu__tab-emoji" aria-hidden="true">{g.emoji}</span>
                      {g.title}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>

            <div id="nh-menu-panel" role="tabpanel" aria-labelledby={`nh-menu-tab-${activeDesktopGroup.id}`}>
              <AnimatePresence mode="wait" initial={false}>
                <GridWrap
                  key={activeDesktopGroup.id}
                  className={`nh-menu__grid${activeDesktopGroup.isDrink ? " nh-menu__grid--drink" : ""}`}
                  {...gridMotionProps}
                >
                  {activeDesktopGroup.items.map((item, i) => (
                    <MenuCard
                      key={item.name + i}
                      item={item}
                      index={i}
                      compact={!!activeDesktopGroup.isDrink}
                      categoryTitle={activeDesktopGroup.title}
                      reduceMotion={reduceMotion}
                    />
                  ))}
                </GridWrap>
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
