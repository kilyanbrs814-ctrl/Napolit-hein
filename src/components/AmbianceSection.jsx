import { LINKS } from "../data/content.js";
import salle from "../assets/images/ambiance-salle.jpg";
import Reveal from "./Reveal.jsx";
import "../styles/ambiance.css";

export default function AmbianceSection() {
  return (
    <section className="nh-amb" data-screen-label="08 Le spot">
      <div className="nh-amb__inner">
        <Reveal className="nh-amb__text">
          <div className="nh-eyebrow nh-amb__eyebrow">08 · Le spot</div>
          <h2 className="nh-amb__title">Un coin de rue qui sent bon Albi.</h2>
          <p className="nh-amb__p">
            Tables hautes, murs noirs, neon orange et mur vegetal. On vient recuperer sa commande
            chaude — ou on s'installe pour devorer sur place.
          </p>
          <div className="nh-amb__info-row">
            <div className="nh-amb__info">
              <div className="nh-amb__info-k">Adresse</div>
              <div className="nh-amb__info-v">
                16 Av. Colonel Teyssier
                <br />
                81000 Albi
              </div>
            </div>
            <div className="nh-amb__info">
              <div className="nh-amb__info-k">Telephone</div>
              <div className="nh-amb__info-v">06 04 65 94 06</div>
            </div>
            <div className="nh-amb__info">
              <div className="nh-amb__info-k">Ouvert</div>
              <div className="nh-amb__info-v">
                Tous les soirs
                <br />
                19h00 – 23h00
              </div>
            </div>
          </div>
          <a href={LINKS.maps} target="_blank" rel="noopener noreferrer" className="nh-btn nh-btn--primary">
            Nous trouver <span aria-hidden>→</span>
          </a>
        </Reveal>

        <Reveal className="nh-amb__visual" delay={0.1}>
          <div className="nh-amb__photo" style={{ backgroundImage: `url(${salle})` }} />
          <a href={LINKS.maps} target="_blank" rel="noopener noreferrer" className="nh-amb__map">
            <div className="nh-amb__map-grid" />
            <div className="nh-amb__map-pin">
              <span className="nh-amb__map-dot" />
            </div>
            <div className="nh-amb__map-label">16 Av. Colonel Teyssier · Albi</div>
          </a>
        </Reveal>
      </div>
    </section>
  );
}
