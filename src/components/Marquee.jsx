import { MARQUEE_TEXT } from "../data/content.js";
import "../styles/marquee.css";

export default function Marquee() {
  return (
    <div className="nh-marquee">
      <div className="nh-marquee__track">
        <span className="nh-marquee__text">{MARQUEE_TEXT}</span>
        <span className="nh-marquee__text">{MARQUEE_TEXT}</span>
      </div>
    </div>
  );
}
