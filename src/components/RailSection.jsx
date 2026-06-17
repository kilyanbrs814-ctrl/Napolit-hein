import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { DISHES, LINKS } from "../data/content.js";
import "../styles/rail.css";

function RailCard({ dish, index, count, progress }) {
  const center = count > 1 ? index / (count - 1) : 0;
  const span = count > 1 ? 1 / (count - 1) : 1;
  const opacity = useTransform(
    progress,
    [center - span, center, center + span],
    [0.3, 1, 0.3]
  );
  const scale = useTransform(progress, [center - span, center, center + span], [0.93, 1, 0.93]);

  return (
    <motion.div className="nh-rail__card" style={{ opacity, scale }}>
      <div className="nh-rail__glow" style={{ "--glow": dish.glow }} />
      <div className="nh-rail__big">{dish.big}</div>
      <div
        className="nh-rail__bowl"
        style={{ "--glow": dish.glow, backgroundImage: `url(${dish.img})` }}
      >
        <span className="nh-rail__bowl-vig" />
      </div>
      <div className="nh-rail__info">
        <div className="nh-rail__cat" style={{ color: dish.glow }}>{dish.cat}</div>
        <div className="nh-rail__name">{dish.name}</div>
        <p className="nh-rail__desc">{dish.desc}</p>
        <div className="nh-rail__row">
          <span className="nh-rail__price">{dish.price}</span>
          <a
            href={LINKS.uber}
            target="_blank"
            rel="noopener noreferrer"
            className="nh-rail__btn"
          >
            Commander <span aria-hidden>→</span>
          </a>
        </div>
      </div>
      <div className="nh-rail__index">
        {"0" + (index + 1)} / {count}
      </div>
    </motion.div>
  );
}

export default function RailSection() {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const count = DISHES.length;
  const trackTransform = useTransform(
    scrollYProgress,
    (v) => `translateX(${-v * (count - 1) * 100}vw)`
  );

  return (
    <section id="carte" ref={sectionRef} className="nh-rail" data-screen-label="04 Incontournables">
      <div className="nh-rail__stage">
        <div className="nh-rail__header">
          <div className="nh-eyebrow nh-rail__eyebrow">04 · Les incontournables</div>
          <div className="nh-eyebrow nh-rail__hint">Scroll →</div>
        </div>
        <motion.div className="nh-rail__track" style={{ transform: trackTransform }}>
          {DISHES.map((dish, i) => (
            <RailCard
              key={dish.name}
              dish={dish}
              index={i}
              count={count}
              progress={scrollYProgress}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
