import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const FONT_LINK_ID = "caveman-rocksalt-font";
const FONT_URL =
  "https://fonts.googleapis.com/css2?family=Rock+Salt&display=swap";

/* ---- Cave art SVGs ---- */

function Mammoth() {
  return (
    <svg
      viewBox="0 0 180 120"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", height: "100%" }}
    >
      <path d="M44,96 L38,76 C26,66 18,52 22,40 C26,28 36,22 48,20 L52,12 L60,7 L68,14 C78,9 92,9 104,18 C118,11 134,20 142,34 L140,52 C136,64 124,72 112,73 L108,84 L96,84 L96,73 L80,75 L78,86 L66,86 L66,75 C54,75 44,70 38,62 L44,96 Z" />
      <path d="M52,12 C54,5 60,1 66,4 L70,10" strokeWidth="0" />
    </svg>
  );
}

function Handprint() {
  return (
    <svg
      viewBox="0 0 72 96"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", height: "100%" }}
    >
      {/* Palm */}
      <ellipse cx="36" cy="72" rx="28" ry="22" />
      {/* Thumb */}
      <ellipse
        cx="10"
        cy="58"
        rx="9"
        ry="18"
        transform="rotate(-20 10 58)"
      />
      {/* Index */}
      <ellipse cx="22" cy="36" rx="8" ry="22" transform="rotate(-8 22 36)" />
      {/* Middle */}
      <ellipse cx="36" cy="32" rx="8" ry="24" />
      {/* Ring */}
      <ellipse cx="50" cy="35" rx="8" ry="22" transform="rotate(8 50 35)" />
      {/* Pinky */}
      <ellipse cx="62" cy="45" rx="7" ry="18" transform="rotate(18 62 45)" />
    </svg>
  );
}

function Hunter() {
  return (
    <svg
      viewBox="0 0 80 110"
      fill="none"
      stroke="currentColor"
      strokeWidth="5"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", height: "100%" }}
    >
      <circle cx="28" cy="10" r="9" fill="currentColor" stroke="none" />
      <line x1="28" y1="19" x2="28" y2="62" />
      <line x1="28" y1="34" x2="10" y2="52" />
      <line x1="28" y1="34" x2="54" y2="46" strokeWidth="6" />
      <line x1="28" y1="62" x2="16" y2="94" />
      <line x1="28" y1="62" x2="42" y2="94" />
      {/* Spear shaft */}
      <line x1="54" y1="46" x2="76" y2="14" strokeWidth="3" />
      {/* Spear tip */}
      <polygon
        points="76,9 82,18 70,16"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  );
}

function Deer() {
  return (
    <svg
      viewBox="0 0 120 110"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", height: "100%" }}
    >
      {/* Body */}
      <ellipse cx="65" cy="62" rx="42" ry="26" />
      {/* Neck */}
      <path d="M36,48 C30,40 28,30 32,22 C36,14 44,10 52,14 C48,22 44,34 46,44 Z" />
      {/* Head */}
      <ellipse cx="38" cy="18" rx="16" ry="12" />
      {/* Antler left */}
      <path
        d="M30,8 C28,2 22,0 18,4"
        stroke="currentColor"
        fill="none"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M28,6 C26,0 28,-4 32,-2"
        stroke="currentColor"
        fill="none"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {/* Antler right */}
      <path
        d="M46,8 C48,2 54,0 58,4"
        stroke="currentColor"
        fill="none"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M48,6 C50,0 48,-4 44,-2"
        stroke="currentColor"
        fill="none"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {/* Legs */}
      <rect x="34" y="84" width="10" height="24" rx="5" />
      <rect x="48" y="86" width="10" height="22" rx="5" />
      <rect x="72" y="84" width="10" height="24" rx="5" />
      <rect x="86" y="86" width="10" height="22" rx="5" />
      {/* Tail */}
      <ellipse cx="107" cy="58" rx="7" ry="10" transform="rotate(20 107 58)" />
    </svg>
  );
}

/* ---- Placement des décorations ---- */
const DECOS = [
  { Comp: Mammoth,   pos: { left: "2%",  top: "14%" }, size: 160, rot: 0,   opacity: 0.17 },
  { Comp: Handprint, pos: { left: "87%", top: "26%" }, size: 64,  rot: -12, opacity: 0.15 },
  { Comp: Hunter,    pos: { left: "90%", top: "66%" }, size: 62,  rot: 6,   opacity: 0.13 },
  { Comp: Deer,      pos: { left: "60%", top: "80%" }, size: 100, rot: -4,  opacity: 0.12 },
  { Comp: Handprint, pos: { left: "1%",  top: "72%" }, size: 50,  rot: 22,  opacity: 0.14 },
];

/* ---- Dots décoratifs (petits cercles) ---- */
const DOTS = [
  { x: "14%", y: "52%", r: 5 },
  { x: "16%", y: "56%", r: 4 },
  { x: "12%", y: "58%", r: 6 },
  { x: "82%", y: "45%", r: 5 },
  { x: "85%", y: "49%", r: 4 },
  { x: "79%", y: "47%", r: 5 },
];

const itemVariant = {
  hidden: { opacity: 0, scale: 0.6 },
  visible: (i) => ({
    opacity: 1,
    scale: 1,
    transition: { delay: 0.18 + i * 0.07, type: "spring", stiffness: 220, damping: 22 },
  }),
  exit: { opacity: 0, transition: { duration: 0.25 } },
};

export default function CavemanMode({ isActive, onDeactivate }) {
  /* Charge Rock Salt au premier activate, ne retire pas pour éviter le flash */
  useEffect(() => {
    if (!isActive) return;
    if (document.getElementById(FONT_LINK_ID)) return;
    const link = document.createElement("link");
    link.id = FONT_LINK_ID;
    link.rel = "stylesheet";
    link.href = FONT_URL;
    document.head.appendChild(link);
  }, [isActive]);

  return (
    <>
      {/* Flash feu à l'activation */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            key="cm-flash"
            initial={{ opacity: 0.55 }}
            animate={{ opacity: 0 }}
            exit={{}}
            transition={{ duration: 0.55 }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 9990,
              background:
                "radial-gradient(ellipse at 50% 50%, #E06020 0%, #7B2200 100%)",
              pointerEvents: "none",
            }}
          />
        )}
      </AnimatePresence>

      {/* Teinte chaude persistante */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            key="cm-tint"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7 }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 1,
              background: "rgba(55, 18, 4, 0.30)",
              pointerEvents: "none",
              mixBlendMode: "multiply",
            }}
          />
        )}
      </AnimatePresence>

      {/* Peintures rupestres */}
      <AnimatePresence>
        {isActive &&
          DECOS.map((d, i) => (
            <motion.div
              key={`cm-deco-${i}`}
              custom={i}
              variants={itemVariant}
              initial="hidden"
              animate="visible"
              exit="exit"
              style={{
                position: "fixed",
                ...d.pos,
                width: d.size,
                height: d.size,
                color: "#C84C10",
                transform: `rotate(${d.rot}deg)`,
                pointerEvents: "none",
                zIndex: 2,
                opacity: d.opacity, /* sera surchargée par animate mais on garde la valeur finale */
              }}
            >
              <d.Comp />
            </motion.div>
          ))}
      </AnimatePresence>

      {/* Petits points */}
      <AnimatePresence>
        {isActive &&
          DOTS.map((dot, i) => (
            <motion.div
              key={`cm-dot-${i}`}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 0.18, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.5 + i * 0.06 }}
              style={{
                position: "fixed",
                left: dot.x,
                top: dot.y,
                width: dot.r * 2,
                height: dot.r * 2,
                borderRadius: "50%",
                background: "#C84C10",
                pointerEvents: "none",
                zIndex: 2,
              }}
            />
          ))}
      </AnimatePresence>

      {/* Bannière bas de page */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            key="cm-banner"
            initial={{ y: 80 }}
            animate={{ y: 0 }}
            exit={{ y: 80 }}
            transition={{ type: "spring", stiffness: 260, damping: 26, delay: 0.06 }}
            style={{
              position: "fixed",
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 200,
              background: "linear-gradient(90deg, #6A1A00, #C84C10 50%, #6A1A00)",
              borderTop: "2px solid #A83A08",
              color: "#F0DFB0",
              padding: "12px 24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
              fontFamily: '"Rock Salt", Georgia, serif',
              fontSize: "11px",
              letterSpacing: "0.05em",
            }}
          >
            <span>
              🦴 UGH — MODE CAVERNE ACTIVÉ — NAPOLIT'HEIN CROUSTY BON FEU 🪨
            </span>
            <motion.button
              onClick={onDeactivate}
              whileHover={{ scale: 1.05, background: "rgba(0,0,0,0.5)" }}
              whileTap={{ scale: 0.95 }}
              style={{
                background: "rgba(0,0,0,0.35)",
                border: "1px solid rgba(240,223,176,0.3)",
                color: "#F0DFB0",
                padding: "8px 16px",
                borderRadius: "4px",
                cursor: "pointer",
                fontFamily: '"Rock Salt", Georgia, serif',
                fontSize: "9px",
                letterSpacing: "0.04em",
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              RETOUR ÈRE MODERNE
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
