import { LINKS } from "../data/content.js";
import salle from "../assets/images/ambiance-salle.jpg";
import Reveal from "./Reveal.jsx";
import "../styles/ambiance.css";

export default function AmbianceSection() {
  return (
    <section id="ambiance" className="nh-amb" data-screen-label="08 Le spot">
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
          <div className="nh-amb__map">
            <iframe
              title="Napolit'hein Crousty sur Google Maps"
              src="https://maps.google.com/maps?q=16+Avenue+Colonel+Teyssier%2C+81000+Albi%2C+France&t=&z=17&ie=UTF8&iwloc=&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0, display: "block" }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
