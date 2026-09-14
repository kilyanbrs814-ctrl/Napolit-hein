import { useEffect, useState } from "react";

const INTRO_VIDEO_URL =
  "https://d2ol7oe51mr4n9.cloudfront.net/user_3EqFLTgGrEqfcX6D4PlpZJ7PV26/0314ee50-6005-4cba-b4a9-2f32364c77a1.mp4";

export default function MobileLogoIntro() {
  const [isMobile, setIsMobile] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 768px)");
    const sync = () => setIsMobile(media.matches);

    sync();
    media.addEventListener("change", sync);

    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!isMobile || !isVisible) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMobile, isVisible]);

  const finishIntro = () => {
    setIsLeaving(true);
    window.setTimeout(() => setIsVisible(false), 560);
  };

  if (!isMobile || !isVisible) return null;

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 2147483647,
        background: "#fff",
        width: "100vw",
        height: "100dvh",
        overflow: "hidden",
        opacity: isLeaving ? 0 : 1,
        transform: isLeaving ? "scale(1.012)" : "scale(1)",
        transition:
          "opacity 520ms cubic-bezier(0.22, 1, 0.36, 1), transform 520ms cubic-bezier(0.22, 1, 0.36, 1)",
        pointerEvents: isLeaving ? "none" : "auto",
        willChange: "opacity, transform",
      }}
    >
      <video
        src={INTRO_VIDEO_URL}
        autoPlay
        muted
        playsInline
        preload="auto"
        onEnded={finishIntro}
        onError={() => setIsVisible(false)}
        style={{
          display: "block",
          width: "100%",
          height: "100%",
          objectFit: "contain",
          background: "#fff",
        }}
      />
    </div>
  );
}
