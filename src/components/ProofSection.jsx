import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { DELIVERY_LOGOS, PLATFORMS, TICKETS } from "../data/content.js";
import "../styles/proof.css";

function Ticket({ ticket, progress }) {
  // parallaxe verticale stable, pilotee par le scroll (jamais par un hijack).
  const y = useTransform(progress, [0, 1], [-110 * ticket.depth, 110 * ticket.depth]);
  const hideMobile = !(ticket.depth > 0.5 || ticket.z > 3);
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
      className={`nh-proof__ticket${hideMobile ? " is-hidden-mobile" : ""}`}
      style={{ left: ticket.x, top: ticket.y, zIndex: ticket.z, rotate: ticket.rot, y }}
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
    <section ref={sectionRef} className="nh-proof" data-screen-label="07 Avis">
      <div className="nh-proof__stage">
        <div className="nh-proof__center">
          <div className="nh-eyebrow nh-proof__eyebrow">07 · Tout le monde valide</div>
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
            <Ticket key={i} ticket={t} progress={scrollYProgress} />
          ))}
        </div>
      </div>
    </section>
  );
}
