import { useRef } from "react";
import { BUILD_STEPS } from "../data/content.js";
import useClaudeStepScene from "../hooks/useClaudeStepScene.js";
import logo from "../assets/images/logo-napolithein.png";
import build1 from "../assets/images/build-1-rice.png";
import build2 from "../assets/images/build-2-chicken.png";
import build3 from "../assets/images/build-3-sauce.png";
import build4 from "../assets/images/build-4-final.png";
import "../styles/build.css";

const IMAGES = [build1, build2, build3, build4];
const LAST_BUILD_INDEX = IMAGES.length - 1;

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const smoothstep = (value) => value * value * (3 - 2 * value);

function BuildImageLayer({ image, index, floatingIndex }) {
  const raw = clamp(1 - Math.abs(floatingIndex - index) * 1.05, 0, 1);
  const opacity = smoothstep(raw);

  return (
    <div
      className="nh-build__img"
      style={{
        backgroundImage: `url(${image})`,
        opacity,
        zIndex: index + 1,
      }}
      aria-hidden="true"
    />
  );
}

function TextStep({ index, step, floatingIndex, activeIndex }) {
  const opacity = clamp(1 - Math.abs(floatingIndex - index) * 2.2, 0, 1);
  const y = (1 - opacity) * 18 * (index < floatingIndex ? -1 : 1);

  return (
    <div
      className="nh-build__txt"
      style={{
        opacity,
        transform: `translateY(${y}px)`,
      }}
      aria-hidden={index !== activeIndex}
    >
      {step.lead && <div className="nh-build__txt-lead">{step.lead}</div>}
      {step.isLogo ? (
        <img src={logo} alt="Napolit'hein Crousty" className="nh-build__txt-logo" />
      ) : (
        <div className="nh-build__txt-title">{step.title}</div>
      )}
      <div className="nh-build__txt-desc">{step.desc}</div>
    </div>
  );
}

export default function BuildSection() {
  const sectionRef = useRef(null);
  const { progress } = useClaudeStepScene({
    sceneKey: "buildScene",
    sectionRef,
    steps: IMAGES.length,
  });

  const floatingIndex = progress * LAST_BUILD_INDEX;
  const displayIndex = clamp(Math.round(floatingIndex), 0, LAST_BUILD_INDEX);
  const glowOpacity = 0.4 + 0.5 * Math.sin(progress * Math.PI);

  return (
    <section id="couches" ref={sectionRef} className="nh-build" data-screen-label="03 Construction">
      <div className="nh-build__stage">
        <div className="nh-eyebrow nh-build__eyebrow">03 · Couche par couche</div>
        <div className="nh-build__grid">
          <div className="nh-build__bowl-wrap">
            <div className="nh-build__glow" style={{ opacity: glowOpacity }} />
            {IMAGES.map((img, i) => (
              <BuildImageLayer key={img} image={img} index={i} floatingIndex={floatingIndex} />
            ))}
            <div className="nh-build__ring" aria-hidden="true" />
          </div>

          <div className="nh-build__side">
            <div className="nh-build__num">{"0" + (displayIndex + 1)}</div>
            <div className="nh-build__txt-stack">
              {BUILD_STEPS.map((step, i) => (
                <TextStep
                  key={i}
                  index={i}
                  step={step}
                  floatingIndex={floatingIndex}
                  activeIndex={displayIndex}
                />
              ))}
            </div>
            <div className="nh-build__dots">
              {BUILD_STEPS.map((_, i) => (
                <span
                  key={i}
                  className={`nh-build__dot${i <= displayIndex ? " is-on" : ""}${
                    i === displayIndex ? " is-active" : ""
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
