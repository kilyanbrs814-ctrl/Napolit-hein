import { CHANNELS } from "../data/content.js";
import Reveal from "./Reveal.jsx";
import "../styles/doors.css";

export default function DoorsSection() {
  return (
    <section id="commander" className="nh-doors" data-screen-label="06 Commander">
      <div className="nh-doors__inner">
        <Reveal className="nh-doors__head">
          <div className="nh-eyebrow nh-doors__eyebrow">06 · Sans reflechir</div>
          <h2 className="nh-doors__title">
            Tu choisis. On prepare.
            <br />
            Tu te regales.
          </h2>
        </Reveal>

        <div className="nh-doors__grid">
          {CHANNELS.map((c, i) => (
            <Reveal key={c.num} className="nh-door" delay={i * 0.08}>
              <span className="nh-door__glow" style={{ background: c.glow }} />
              <div className="nh-door__num" style={{ color: c.glow }}>{c.num}</div>
              <div className="nh-eyebrow nh-door__kicker">{c.kicker}</div>
              <div className="nh-door__title">{c.title}</div>
              <p className="nh-door__desc">{c.desc}</p>
              <div className="nh-door__actions">
                {c.actions.map((a) => (
                  <a
                    key={a.label}
                    href={a.href}
                    target={a.target}
                    rel="noopener noreferrer"
                    className={`nh-door__action${a.emph ? " is-emph" : ""}`}
                  >
                    {a.logo ? (
                      <img src={a.logo} alt={a.label} className="nh-door__action-logo" />
                    ) : (
                      <span
                        className="nh-door__action-ico"
                        style={a.emph ? undefined : { background: a.col }}
                      >
                        {a.ico}
                      </span>
                    )}
                    {a.label}
                  </a>
                ))}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
