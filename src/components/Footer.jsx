import { LINKS } from "../data/content.js";
import logo from "../assets/images/logo-napolithein.png";
import "../styles/footer.css";

export default function Footer() {
  return (
    <footer className="nh-footer">
      <div className="nh-footer__inner">
        <div className="nh-footer__brand">
          <img src={logo} alt="Napolit'hein Crousty" className="nh-footer__logo" />
          <p className="nh-footer__tag">
            Pates &amp; riz crousty · La street food genereuse d'Albi depuis 2019.
          </p>
        </div>

        <div className="nh-footer__col">
          <div className="nh-footer__h">Nous trouver</div>
          <a href={LINKS.maps} target="_blank" rel="noopener noreferrer" className="nh-footer__link">
            16 Av. Colonel Teyssier, Albi
          </a>
          <a href={LINKS.tel} className="nh-footer__link">06 04 65 94 06</a>
          <div className="nh-footer__plain">Tous les soirs · 19h–23h</div>
        </div>

        <div className="nh-footer__col">
          <div className="nh-footer__h">Commander</div>
          <a href={LINKS.uber} target="_blank" rel="noopener noreferrer" className="nh-footer__link">Uber Eats</a>
          <a href={LINKS.deliveroo} target="_blank" rel="noopener noreferrer" className="nh-footer__link">Deliveroo</a>
          <a href={LINKS.tel} className="nh-footer__link">Sur place / A emporter</a>
        </div>

        <div className="nh-footer__col">
          <div className="nh-footer__h">Suivre</div>
          <a href={LINKS.insta} target="_blank" rel="noopener noreferrer" className="nh-footer__link">Instagram</a>
          <a href={LINKS.tiktok} target="_blank" rel="noopener noreferrer" className="nh-footer__link">TikTok</a>
          <a href={LINKS.fb} target="_blank" rel="noopener noreferrer" className="nh-footer__link">Facebook</a>
        </div>
      </div>

      <div className="nh-footer__bottom">
        <span>© 2026 Napolit'hein Crousty · Albi</span>
        <span>Fait maison, servi chaud.</span>
      </div>
    </footer>
  );
}
