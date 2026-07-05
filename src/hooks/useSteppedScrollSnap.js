import { useEffect, useMemo, useRef } from "react";

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

function normalizeSnapPoints(points = []) {
  return [...points]
    .map((point) => clamp(Number(point), 0, 1))
    .filter((point) => Number.isFinite(point))
    .sort((a, b) => a - b);
}

function getClosestIndex(progress, points) {
  let closest = 0;
  let closestDistance = Infinity;

  points.forEach((point, index) => {
    const distance = Math.abs(progress - point);
    if (distance < closestDistance) {
      closest = index;
      closestDistance = distance;
    }
  });

  return closest;
}

export default function useSteppedScrollSnap({ sectionRef, snapPoints, enabled = true }) {
  const points = useMemo(() => normalizeSnapPoints(snapPoints), [snapPoints]);
  const lockRef = useRef(false);
  const cleanIndexRef = useRef(null);
  const releaseRef = useRef(null);
  const pendingEntryIndexRef = useRef(null);
  const lastRegionRef = useRef(null);
  const scrollTimerRef = useRef(null);
  const cooldownTimerRef = useRef(null);
  const rafRef = useRef(null);
  const touchStartRef = useRef(null);
  const touchHandledRef = useRef(false);

  useEffect(() => {
    if (!enabled || points.length < 2 || typeof window === "undefined") return undefined;

    const SNAP_DEBOUNCE_MS = 120;
    const SETTLE_TIMEOUT_MS = 820;
    const COOLDOWN_MS = 140;
    const SNAP_TOLERANCE_PX = 2;
    const TOUCH_THRESHOLD_PX = 36;
    const REGION_EPSILON = 0.003;
    const lastIndex = points.length - 1;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const clearScrollTimer = () => {
      if (scrollTimerRef.current !== null) {
        window.clearTimeout(scrollTimerRef.current);
        scrollTimerRef.current = null;
      }
    };

    const clearMotionTimers = () => {
      if (cooldownTimerRef.current !== null) {
        window.clearTimeout(cooldownTimerRef.current);
        cooldownTimerRef.current = null;
      }
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };

    const getMetrics = () => {
      const section = sectionRef.current;
      if (!section) return null;

      const rect = section.getBoundingClientRect();
      const scrollY = window.scrollY || window.pageYOffset;
      const viewportHeight = window.innerHeight;
      const travel = Math.max(section.offsetHeight - viewportHeight, 1);
      const top = scrollY + rect.top;
      const progress = (scrollY - top) / travel;

      return {
        progress,
        scrollY,
        top,
        travel,
      };
    };

    const getRegion = (progress) => {
      if (progress < -REGION_EPSILON) return "before";
      if (progress > 1 + REGION_EPSILON) return "after";
      return "inside";
    };

    const getSnapScrollY = (index, metrics) =>
      metrics.top + points[index] * metrics.travel;

    const getCleanIndex = (metrics) => {
      const tolerance = SNAP_TOLERANCE_PX / metrics.travel;
      const index = points.findIndex((point) => Math.abs(metrics.progress - point) <= tolerance);
      return index === -1 ? null : index;
    };

    const snapToIndex = (index, metrics = getMetrics()) => {
      if (!metrics) return;

      const targetIndex = clamp(index, 0, lastIndex);
      const targetY = getSnapScrollY(targetIndex, metrics);

      clearScrollTimer();
      clearMotionTimers();
      lockRef.current = true;
      releaseRef.current = null;
      pendingEntryIndexRef.current = null;

      window.scrollTo({
        top: targetY,
        left: 0,
        behavior: reduceMotion ? "auto" : "smooth",
      });

      const startedAt = performance.now();

      const settle = () => {
        const distance = Math.abs((window.scrollY || window.pageYOffset) - targetY);
        const timedOut = performance.now() - startedAt >= SETTLE_TIMEOUT_MS;

        if (distance <= SNAP_TOLERANCE_PX || timedOut || reduceMotion) {
          if (distance > SNAP_TOLERANCE_PX) {
            window.scrollTo({ top: targetY, left: 0, behavior: "auto" });
          }

          cleanIndexRef.current = targetIndex;
          cooldownTimerRef.current = window.setTimeout(() => {
            lockRef.current = false;
            cooldownTimerRef.current = null;
          }, COOLDOWN_MS);
          rafRef.current = null;
          return;
        }

        rafRef.current = window.requestAnimationFrame(settle);
      };

      rafRef.current = window.requestAnimationFrame(settle);
    };

    const updateCleanState = (metrics) => {
      const cleanIndex = getCleanIndex(metrics);
      if (cleanIndex !== null) {
        cleanIndexRef.current = cleanIndex;
        if (pendingEntryIndexRef.current === cleanIndex) {
          pendingEntryIndexRef.current = null;
        }
      } else if (!lockRef.current) {
        cleanIndexRef.current = null;
      }
      return cleanIndex;
    };

    const canExitFrom = (index, metrics) =>
      getCleanIndex(metrics) === index && cleanIndexRef.current === index;

    const preventEvent = (event) => {
      if (event?.cancelable) event.preventDefault();
    };

    const stepInDirection = (rawDirection, event) => {
      const direction = rawDirection > 0 ? 1 : -1;
      const metrics = getMetrics();
      if (!metrics || getRegion(metrics.progress) !== "inside") return false;

      if (lockRef.current) {
        preventEvent(event);
        return true;
      }

      if (releaseRef.current === "forward" && direction > 0) return false;
      if (releaseRef.current === "backward" && direction < 0) return false;
      releaseRef.current = null;

      const pendingEntryIndex = pendingEntryIndexRef.current;
      if (
        pendingEntryIndex !== null &&
        getCleanIndex(metrics) !== pendingEntryIndex
      ) {
        preventEvent(event);
        snapToIndex(pendingEntryIndex, metrics);
        return true;
      }

      updateCleanState(metrics);

      const currentIndex = getClosestIndex(metrics.progress, points);
      const targetIndex = currentIndex + direction;

      if (targetIndex >= 0 && targetIndex <= lastIndex) {
        preventEvent(event);
        snapToIndex(targetIndex, metrics);
        return true;
      }

      if (direction > 0 && canExitFrom(lastIndex, metrics)) {
        releaseRef.current = "forward";
        return false;
      }

      if (direction < 0 && canExitFrom(0, metrics)) {
        releaseRef.current = "backward";
        return false;
      }

      preventEvent(event);
      snapToIndex(direction > 0 ? lastIndex : 0, metrics);
      return true;
    };

    const onWheel = (event) => {
      if (Math.abs(event.deltaY) < 1) return;
      stepInDirection(event.deltaY > 0 ? 1 : -1, event);
    };

    const onTouchStart = (event) => {
      if (event.touches.length !== 1) {
        touchStartRef.current = null;
        touchHandledRef.current = false;
        return;
      }

      const touch = event.touches[0];
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
      };
      touchHandledRef.current = false;
    };

    const getTouchDirection = (touch) => {
      const start = touchStartRef.current;
      if (!start) return null;

      const deltaX = touch.clientX - start.x;
      const deltaY = touch.clientY - start.y;
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);

      if (absY < TOUCH_THRESHOLD_PX || absY <= absX) return null;
      return deltaY < 0 ? 1 : -1;
    };

    const onTouchMove = (event) => {
      if (event.touches.length !== 1) return;

      const metrics = getMetrics();
      const isInside = metrics && getRegion(metrics.progress) === "inside";

      if (isInside && lockRef.current) {
        preventEvent(event);
      }

      const direction = getTouchDirection(event.touches[0]);
      if (direction === null || !isInside) return;

      if (touchHandledRef.current) {
        preventEvent(event);
        return;
      }

      const handled = stepInDirection(direction, event);
      if (handled) {
        touchHandledRef.current = true;
      }
    };

    const onTouchEnd = (event) => {
      const touch = event.changedTouches[0];
      const direction = touch ? getTouchDirection(touch) : null;

      if (direction !== null && !touchHandledRef.current) {
        stepInDirection(direction, event);
      }

      touchStartRef.current = null;
      touchHandledRef.current = false;
    };

    const onTouchCancel = () => {
      touchStartRef.current = null;
      touchHandledRef.current = false;
    };

    const onScroll = () => {
      const metrics = getMetrics();
      if (!metrics) return;

      const region = getRegion(metrics.progress);
      const previousRegion = lastRegionRef.current;

      if (region !== previousRegion) {
        if (region === "inside" && previousRegion === "before") {
          pendingEntryIndexRef.current = 0;
          releaseRef.current = null;
        }

        if (region === "inside" && previousRegion === "after") {
          pendingEntryIndexRef.current = lastIndex;
          releaseRef.current = null;
        }

        if (region !== "inside") {
          clearScrollTimer();
          cleanIndexRef.current = null;
          pendingEntryIndexRef.current = null;
          releaseRef.current = null;
        }

        lastRegionRef.current = region;
      }

      if (region !== "inside") return;

      const cleanIndex = updateCleanState(metrics);
      if (cleanIndex !== null || lockRef.current || releaseRef.current) {
        clearScrollTimer();
        return;
      }

      clearScrollTimer();
      scrollTimerRef.current = window.setTimeout(() => {
        const latestMetrics = getMetrics();
        if (
          !latestMetrics ||
          getRegion(latestMetrics.progress) !== "inside" ||
          lockRef.current ||
          releaseRef.current
        ) {
          return;
        }

        const latestCleanIndex = updateCleanState(latestMetrics);
        if (latestCleanIndex !== null) return;

        const entryIndex = pendingEntryIndexRef.current;
        const snapIndex =
          entryIndex !== null ? entryIndex : getClosestIndex(latestMetrics.progress, points);

        snapToIndex(snapIndex, latestMetrics);
      }, SNAP_DEBOUNCE_MS);
    };

    const onResize = () => {
      const metrics = getMetrics();
      const cleanIndex = cleanIndexRef.current;
      if (!metrics || getRegion(metrics.progress) !== "inside" || cleanIndex === null) return;
      window.scrollTo({ top: getSnapScrollY(cleanIndex, metrics), left: 0, behavior: "auto" });
    };

    const initialMetrics = getMetrics();
    lastRegionRef.current = initialMetrics ? getRegion(initialMetrics.progress) : null;

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd, { passive: false });
    window.addEventListener("touchcancel", onTouchCancel, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("touchcancel", onTouchCancel);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      clearScrollTimer();
      clearMotionTimers();
      lockRef.current = false;
      releaseRef.current = null;
      pendingEntryIndexRef.current = null;
      cleanIndexRef.current = null;
      touchStartRef.current = null;
      touchHandledRef.current = false;
    };
  }, [enabled, points, sectionRef]);
}
