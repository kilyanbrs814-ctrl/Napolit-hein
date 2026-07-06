import { useRef, useLayoutEffect } from "react";
import MenuSection from "./MenuSection";
import DoorsSection from "./DoorsSection";
import "../styles/menuDoorsScene.css";

/**
 * Gère ensemble la scène de transition 05 → 06.
 *
 * Principe (identique au Hero → Build) :
 *   .nh-mds             ← conteneur de scroll (menu_h + --mds-size)
 *   .nh-mds__menu       ← position:sticky; top: mds_size - menu_h (négatif)
 *                          → au moment où le sticky se déclanche, le BAS du menu
 *                            est aligné avec le bas du viewport.
 *   <DoorsSection>      ← sibling, margin-top: -mds-size; z-index > menu
 *                          → entre par en bas au même instant et remonte.
 *
 * La hauteur --menu-h est mesurée en JS (ResizeObserver) pour que le calcul
 * sticky soit correct quelle que soit la hauteur réelle du menu.
 */
export default function MenuDoorsScene() {
  const menuRef = useRef(null);
  const sceneRef = useRef(null);

  useLayoutEffect(() => {
    const wrapper = menuRef.current;
    const scene = sceneRef.current;
    if (!wrapper || !scene) return;

    let frame = 0;

    const update = () => {
      const menu = wrapper.querySelector(".nh-menu");
      const viewportH = window.innerHeight || 800;
      if (!menu) return;

      const measuredH = Math.max(
        menu?.offsetHeight || 0,
        menu?.scrollHeight || 0,
        menu?.getBoundingClientRect().height || 0,
        viewportH
      );

      scene.style.setProperty("--menu-h", `${Math.ceil(measuredH)}px`);
    };

    const scheduleUpdate = () => {
      if (frame) window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        update();
      });
    };

    const menu = wrapper.querySelector(".nh-menu");
    const ro = new ResizeObserver(scheduleUpdate);
    if (menu) ro.observe(menu);
    window.addEventListener("resize", scheduleUpdate, { passive: true });
    update();
    scheduleUpdate();
    document.fonts?.ready?.then(scheduleUpdate);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", scheduleUpdate);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <>
      <div className="nh-mds" ref={sceneRef}>
        <div className="nh-mds__menu" ref={menuRef}>
          <MenuSection />
        </div>
      </div>
      <DoorsSection />
    </>
  );
}
