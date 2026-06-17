import { useEffect, useState } from "react";

/**
 * Renvoie true sous le breakpoint donne (ou sur pointeur tactile grossier).
 * Sert a desactiver les animations pilotees par le scroll sur mobile,
 * ou le scroll natif reprend totalement la main (zero blocage).
 */
export default function useIsMobile(breakpoint = 860) {
  const query = `(max-width: ${breakpoint}px), (pointer: coarse)`;
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia(query).matches : false
  );

  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = (e) => setIsMobile(e.matches);
    onChange(mql);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);

  return isMobile;
}
