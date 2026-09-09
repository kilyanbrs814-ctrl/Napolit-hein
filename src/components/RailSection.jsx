import { useEffect, useRef, useState } from "react";
import { DISHES } from "../data/content.js";
import "../styles/rail.css";

const RAIL_DISHES = DISHES.slice(0, 3);
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

function RailCard({ dish, index, count, floatingIndex }) {
  const distance = Math.abs(index - floatingIndex);
  const opacity = clamp(1 - distance * 0.55, 0.25, 1);
  const scale = 1 - Math.min(distance, 1) * 0.07;

  return (
    <div
      className="nh-rail__card"
      style={{
        "--dish-color": dish.glow,
        opacity,
        transform: `scale(${scale})`,
      }}
    >
      <div className="nh-rail__media">
        <img draggable="false" className="nh-rail__dish" src={dish.img} alt={dish.name} />
      </div>
      <div className="nh-rail__info">
        <div className="nh-rail__cat">{dish.cat}</div>
        <div className="nh-rail__name">{dish.name}</div>
        <p className="nh-rail__desc">{dish.desc}</p>
        <div className="nh-rail__row">
          <span className="nh-rail__price">{dish.price}</span>
        </div>
      </div>
      <div className="nh-rail__index">
        {"0" + (index + 1)} / {"0" + count}
      </div>
    </div>
  );
}

export default function RailSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [dragging, setDragging] = useState(false);
  const pointer = useRef(null);
  const count = RAIL_DISHES.length;
  const step = (direction) => setActiveIndex((index) => (index + direction + count) % count);

  useEffect(() => {
    if (dragging) return;
    const timer = setTimeout(() => setActiveIndex((index) => (index + 1) % count), 4000);
    return () => clearTimeout(timer);
  }, [activeIndex, dragging, count]);

  const finishSwipe = (event) => {
    const start = pointer.current;
    if (!start || start.id !== event.pointerId) return;
    pointer.current = null;
    setDragging(false);
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (Math.abs(dx) >= 40 && Math.abs(dx) > Math.abs(dy)) step(dx < 0 ? 1 : -1);
  };

  return (
    <section id="carte" className="nh-rail" data-screen-label="04 Incontournables"
      data-active-index={activeIndex} aria-label="Les incontournables" aria-roledescription="carrousel">
      <div className="nh-rail__stage">
        <div className="nh-rail__header">
          <div className="nh-eyebrow nh-rail__eyebrow">04 · Les incontournables</div>
          <div className="nh-rail__controls">
            <button type="button" aria-label="Plat précédent" onClick={() => step(-1)}>←</button>
            <button type="button" aria-label="Plat suivant" onClick={() => step(1)}>→</button>
          </div>
        </div>
        <div className="nh-rail__track"
          style={{ transform: `translate3d(${-activeIndex * 100}%, 0, 0)` }}
          onPointerDown={(event) => {
            if (!event.isPrimary || event.button !== 0) return;
            pointer.current = { id: event.pointerId, x: event.clientX, y: event.clientY };
            event.currentTarget.setPointerCapture(event.pointerId);
            setDragging(true);
          }}
          onPointerUp={finishSwipe}
          onPointerCancel={() => { pointer.current = null; setDragging(false); }}
          onLostPointerCapture={() => { pointer.current = null; setDragging(false); }}>
          {RAIL_DISHES.map((dish, index) => (
            <RailCard key={dish.name} dish={dish} index={index} count={count} floatingIndex={activeIndex} />
          ))}
        </div>
      </div>
    </section>
  );
}
