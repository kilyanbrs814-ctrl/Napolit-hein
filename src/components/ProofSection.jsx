import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { DELIVERY_LOGOS, PLATFORMS, TICKETS } from "../data/content.js";
import "../styles/proof.css";

// Clamp scroll progress to [0, 1] after applying per-ticket delay offset.
function c(v) { return Math.min(1, Math.max(0, v)); }

/*
 * Trajectoire par couloir (vérifiée de 390px à 1920px de largeur) :
 *
 *   x deviation ±720px au passage du centre :
 *   - left  : card right edge = (50vw - 150px) + (-720px) + 300px ≈ −70px  → hors écran gauche ✓
 *   - right : card left  edge = (50vw - 150px) +  720px            ≈ +920px → hors écran droit  ✓
 *
 *   y timeline (px) :
 *   1150  → card sous l'écran   (invisible)
 *    700  → card entre dans la vue par le bas
 *   −200  → card a passé le bloc central (zone y:27-73% du viewport)
 *   −800  → card sort hors écran par le haut
 */
function AnimatedTicket({ ticket, progress }) {
  const d = ticket.delay;
  const left = ticket.lane === "left";

  // --- X : déviation couloir ---
  const xVals = left
    ? [-80, -80, -720, -920, -1200]
    : [ 80,  80,  720,  920,  1200];
  const xKeys = [
    c(d + 0.06), c(d + 0.14), c(d + 0.30), c(d + 0.58), c(d + 0.74),
  ];

  // --- Y : montée depuis le bas ---
  const yVals = [1150, 700, -200, -800];
  const yKeys = [c(d + 0.06), c(d + 0.22), c(d + 0.55), c(d + 0.74)];

  // --- Opacity : invisible → visible → invisible ---
  const opKeys = [c(d + 0.06), c(d + 0.14), c(d + 0.65), c(d + 0.74)];
  const opVals = [0, 1, 1, 0];

  // --- Scale : léger zoom à l'entrée ---
  const scKeys = [c(d + 0.06), c(d + 0.17), c(d + 0.74)];
  const scVals = [0.82, 1, 1];

  const x       = useTransform(progress, xKeys,  xVals);
  const y       = useTransform(progress, yKeys,  yVals);
  const opacity = useTransform(progress, opKeys, opVals);
  const scale   = useTransform(progress, scKeys, scVals);

  const isGoogle = ticket.src === "Google";
  const ticketLogo =
    ticket.logo ||
    (ticket.src === "Uber Eats"
      ? DELIVERY_LOGOS.uber
      : ticket.src === "Deliveroo"
        ? DELIVERY_LOGOS.deliveroo
        : null);

  return (
    <motion.div
      className="nh-proof__ticket"
      style={{ x, y, opacity, scale, rotate: ticket.rot, zIndex: ticket.z }}
    >
      <div className="nh-proof__ticket-top">
        <span
          className={`nh-proof__ticket-badge${ticketLogo ? " is-logo" : ""}${
            isGoogle ? " is-google" : ""
          }`}
          style={ticketLogo ? undefined : { background: ticket.col }}
        >
          {ticketLogo ? (
            <img src={ticketLogo} alt={ticket.src} className="nh-proof__ticket-badge-logo" />
          ) : (
            ticket.mono
          )}
        </span>
        <span className="nh-proof__ticket-src">{ticket.src}</span>
        <span className="nh-proof__ticket-rate">{ticket.rate}</span>
      </div>
      <div className="nh-proof__ticket-body">{ticket.body}</div>
    </motion.div>
  );
}

export default function ProofSection() {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  return (
    <section id="avis" ref={sectionRef} className="nh-proof" data-screen-label="07 Avis">
      <div className="nh-proof__stage">
        <div className="nh-eyebrow nh-proof__eyebrow">07 · Tout le monde valide</div>

        <div className="nh-proof__center">
          <div className="nh-proof__big">4,7</div>
          <div className="nh-proof__stars">★★★★★</div>
          <div className="nh-eyebrow nh-proof__big-sub">130 avis Google · et ca continue</div>
          <div className="nh-proof__platforms">
            {PLATFORMS.map((p) => (
              <div key={p.name} className="nh-proof__platform">
                {p.logo ? (
                  <img
                    src={p.logo}
                    alt={p.name}
                    className={`nh-proof__platform-logo${
                      p.name === "Google" ? " is-google" : ""
                    }`}
                  />
                ) : (
                  <span className="nh-proof__platform-name">{p.name}</span>
                )}
                <span className="nh-proof__platform-rate">{p.rate}</span>
                <span className="nh-proof__platform-star">★</span>
                <span className="nh-proof__platform-rev">{p.reviews}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="nh-proof__field">
          {TICKETS.map((t, i) => (
            <AnimatedTicket key={i} ticket={t} progress={scrollYProgress} />
          ))}
        </div>
      </div>
    </section>
  );
}
