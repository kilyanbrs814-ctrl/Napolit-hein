import { FINAL_BUTTONS } from "../data/content.js";
import logo from "../assets/images/logo-napolithein.png";
import "../styles/final.css";

export default function FinalCTA() {
  return (
    <section className="nh-final" data-screen-label="09 Final">
      <div className="nh-final__glow" />
      <div className="nh-final__inner">
        <img src={logo} alt="Napolit'hein Crousty" className="nh-final__logo" />
        <h2 className="nh-final__h2">
          T'AS FAIM ?
          <br />
          <span className="nh-final__h2-accent">COMMANDE MAINTENANT.</span>
        </h2>
        <div className="nh-final__btn-row">
          {FINAL_BUTTONS.map((b) => (
            <a
              key={b.label}
              href={b.href}
              target={b.target}
              rel="noopener noreferrer"
              className={`nh-final__btn${b.emph ? " is-emph" : ""}${
                !b.emph && b.col ? " is-brand" : ""
              }${b.logo ? " is-logo-only" : ""}${
                b.label === "Uber Eats" ? " is-uber" : ""
              }`}
              style={!b.emph && b.col ? { "--btn-col": b.col } : undefined}
              aria-label={b.logo ? b.label : undefined}
            >
              {b.logo ? (
                /* Logo seul : le nom est déjà dans le logo, le label ne vit
                   plus qu'en aria-label (alt vide → pas de doublon pour les
                   lecteurs d'écran). */
                <img src={b.logo} alt="" className="nh-final__btn-logo" />
              ) : (
                <>
                  <span
                    className="nh-final__btn-ico"
                    style={b.emph ? undefined : { background: b.col }}
                  >
                    {b.ico}
                  </span>
                  <span className="nh-final__btn-label">{b.label}</span>
                </>
              )}
              <span className="nh-final__btn-arrow" aria-hidden>→</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
