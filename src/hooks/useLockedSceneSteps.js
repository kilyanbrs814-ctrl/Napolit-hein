import { useCallback, useEffect, useRef, useState } from "react";

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const CAPTURE_OFFSET_PX = 80;
const CAPTURE_MIN_VISIBLE_RATIO = 0.35;
const GLOBAL_HANDOFF_GUARD_MS = 420;
const GLOBAL_HANDOFF_QUIET_MS = 160;

const globalHandoffGuard = {
  active: false,
  blockedUntil: 0,
  quietUntil: 0,
  releaseDirection: 0,
  timer: null,
};

function getNow() {
  return typeof performance !== "undefined" ? performance.now() : Date.now();
}

function clearGlobalHandoffTimer() {
  if (globalHandoffGuard.timer !== null && typeof window !== "undefined") {
    window.clearTimeout(globalHandoffGuard.timer);
    globalHandoffGuard.timer = null;
  }
}

function isGlobalHandoffGuardActive() {
  if (!globalHandoffGuard.active) return false;

  const now = getNow();
  const guardedUntil = Math.max(globalHandoffGuard.blockedUntil, globalHandoffGuard.quietUntil);

  if (now < guardedUntil) return true;

  globalHandoffGuard.active = false;
  globalHandoffGuard.releaseDirection = 0;
  clearGlobalHandoffTimer();
  return false;
}

function scheduleGlobalHandoffRelease() {
  if (typeof window === "undefined") return;

  clearGlobalHandoffTimer();

  const now = getNow();
  const guardedUntil = Math.max(globalHandoffGuard.blockedUntil, globalHandoffGuard.quietUntil);
  const delay = Math.max(0, guardedUntil - now) + 16;

  globalHandoffGuard.timer = window.setTimeout(() => {
    globalHandoffGuard.timer = null;
    if (isGlobalHandoffGuardActive()) {
      scheduleGlobalHandoffRelease();
    }
  }, delay);
}

function startGlobalHandoffGuard(direction, quietMs) {
  const now = getNow();
  const quietWindow = Math.max(quietMs, GLOBAL_HANDOFF_QUIET_MS);

  globalHandoffGuard.active = true;
  globalHandoffGuard.releaseDirection = Math.sign(direction);
  globalHandoffGuard.blockedUntil = Math.max(
    globalHandoffGuard.blockedUntil,
    now + GLOBAL_HANDOFF_GUARD_MS
  );
  globalHandoffGuard.quietUntil = Math.max(globalHandoffGuard.quietUntil, now + quietWindow);
  scheduleGlobalHandoffRelease();
}

function noteGlobalHandoffInput(quietMs) {
  if (!globalHandoffGuard.active) return;

  const now = getNow();
  const quietWindow = Math.max(quietMs, GLOBAL_HANDOFF_QUIET_MS);
  globalHandoffGuard.quietUntil = now + quietWindow;
  scheduleGlobalHandoffRelease();
}

function normalizeWheelDelta(event, viewportHeight) {
  if (!event) return 0;
  if (event.deltaMode === 1) return event.deltaY * 16;
  if (event.deltaMode === 2) return event.deltaY * viewportHeight;
  return event.deltaY;
}

export default function useLockedSceneSteps({
  sectionRef,
  steps,
  enabled = true,
  onStepChange,
  onProgressChange,
  lockOffset = 0,
  wheelCooldownMs = 700,
  touchThreshold = 42,
  quietMs = 130,
  disableOnCoarsePointer = true,
}) {
  const lastStep = Math.max(0, steps - 1);
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [direction, setDirection] = useState(0);

  const stepRef = useRef(0);
  const progressRef = useRef(0);
  const lockedRef = useRef(false);
  const cooldownUntilRef = useRef(0);
  const wheelArmedRef = useRef(true);
  const quietTimerRef = useRef(null);
  const releaseDirectionRef = useRef(0);
  const lastScrollYRef = useRef(0);
  const touchStartRef = useRef(null);
  const touchConsumedRef = useRef(false);
  const lockEnabledRef = useRef(false);
  const onStepChangeRef = useRef(onStepChange);
  const onProgressChangeRef = useRef(onProgressChange);

  useEffect(() => {
    onStepChangeRef.current = onStepChange;
  }, [onStepChange]);

  useEffect(() => {
    onProgressChangeRef.current = onProgressChange;
  }, [onProgressChange]);

  const commitProgress = useCallback(
    (nextProgress) => {
      const safeProgress = clamp(nextProgress, 0, 1);
      progressRef.current = safeProgress;
      setProgress((current) => (Math.abs(current - safeProgress) < 0.001 ? current : safeProgress));
      if (typeof onProgressChangeRef.current === "function") {
        onProgressChangeRef.current(safeProgress);
      }
    },
    []
  );

  const commitStep = useCallback(
    (nextStep, nextDirection = 0) => {
      const safeStep = clamp(nextStep, 0, lastStep);
      const didChange = safeStep !== stepRef.current;
      stepRef.current = safeStep;
      setStep((current) => (current === safeStep ? current : safeStep));
      setDirection(nextDirection);
      commitProgress(lastStep === 0 ? 0 : safeStep / lastStep);

      if (didChange && typeof onStepChangeRef.current === "function") {
        onStepChangeRef.current(safeStep, nextDirection);
      }
    },
    [commitProgress, lastStep]
  );

  useEffect(() => {
    if (typeof window === "undefined" || !sectionRef?.current || steps < 2) return undefined;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
    const isSmallScreen = window.innerWidth <= 860;
    const lockEnabled =
      enabled && !reduceMotion && !(disableOnCoarsePointer && coarsePointer) && !isSmallScreen;

    lockEnabledRef.current = lockEnabled;
    lastScrollYRef.current = window.scrollY || window.pageYOffset || 0;

    const clearQuietTimer = () => {
      if (quietTimerRef.current !== null) {
        window.clearTimeout(quietTimerRef.current);
        quietTimerRef.current = null;
      }
    };

    const armAfterQuiet = () => {
      clearQuietTimer();
      quietTimerRef.current = window.setTimeout(() => {
        wheelArmedRef.current = true;
        touchConsumedRef.current = false;
        quietTimerRef.current = null;
      }, quietMs);
    };

    const getMetrics = () => {
      const section = sectionRef.current;
      if (!section) return null;

      const rect = section.getBoundingClientRect();
      const scrollY = window.scrollY || window.pageYOffset || 0;
      const viewportHeight = window.innerHeight || 1;
      const sectionTop = scrollY + rect.top;
      const sectionHeight = Math.max(section.offsetHeight, rect.height, viewportHeight);

      return {
        rect,
        scrollY,
        viewportHeight,
        sectionTop,
        sectionHeight,
      };
    };

    const getMaxScrollY = () => {
      const documentElement = document.documentElement;
      const body = document.body;
      const documentHeight = Math.max(
        documentElement?.scrollHeight || 0,
        body?.scrollHeight || 0,
        documentElement?.offsetHeight || 0,
        body?.offsetHeight || 0
      );

      return Math.max(0, documentHeight - (window.innerHeight || 1));
    };

    const scrollToY = (targetY) => {
      const safeY = clamp(targetY, 0, getMaxScrollY());
      window.scrollTo({ top: safeY, left: 0, behavior: "auto" });
      lastScrollYRef.current = safeY;
      return safeY;
    };

    const scrollToEntry = (metrics, fromBelow) => {
      if (!metrics) return window.scrollY || window.pageYOffset || 0;

      const targetY = fromBelow
        ? metrics.sectionTop + metrics.sectionHeight - metrics.viewportHeight + lockOffset
        : metrics.sectionTop - lockOffset;

      return scrollToY(targetY);
    };

    const isInSceneBand = (metrics) =>
      metrics.rect.bottom > lockOffset + 1 &&
      metrics.rect.top < metrics.viewportHeight - 1;

    const isInCaptureZoneAtScrollY = (metrics, scrollY) => {
      const rectTop = metrics.sectionTop - scrollY;
      const rectBottom = rectTop + metrics.sectionHeight;

      return (
        rectTop <= lockOffset + CAPTURE_OFFSET_PX &&
        rectBottom > metrics.viewportHeight * CAPTURE_MIN_VISIBLE_RATIO
      );
    };

    const isInCaptureZone = (metrics) => isInCaptureZoneAtScrollY(metrics, metrics.scrollY);

    const isInProjectedCaptureZone = (metrics, projectedDeltaY) => {
      if (!metrics || !Number.isFinite(projectedDeltaY) || projectedDeltaY === 0) return false;

      const projectedScrollY = clamp(metrics.scrollY + projectedDeltaY, 0, getMaxScrollY());
      return isInCaptureZoneAtScrollY(metrics, projectedScrollY);
    };

    const nativeProgressFromMetrics = (metrics) => {
      const travel = Math.max(metrics.sectionHeight - metrics.viewportHeight, 1);
      if (metrics.sectionHeight <= metrics.viewportHeight + 1) {
        if (metrics.rect.top > lockOffset) return 0;
        if (metrics.rect.bottom < metrics.viewportHeight - lockOffset) return 1;
        return progressRef.current;
      }
      return clamp((metrics.scrollY - metrics.sectionTop + lockOffset) / travel, 0, 1);
    };

    const updateNativeProgress = (metrics = getMetrics()) => {
      if (!metrics) return;
      const nextProgress = nativeProgressFromMetrics(metrics);
      const nextStep = clamp(Math.round(nextProgress * lastStep), 0, lastStep);
      commitProgress(nextProgress);
      if (nextStep !== stepRef.current) {
        commitStep(nextStep, Math.sign(nextStep - stepRef.current));
      }
    };

    const lockScene = (fromBelow, metrics = getMetrics(), options = {}) => {
      if (!metrics || !lockEnabledRef.current || isGlobalHandoffGuardActive()) return false;

      const currentScrollY = options.alignToEntry
        ? scrollToEntry(metrics, fromBelow)
        : window.scrollY || window.pageYOffset || 0;
      releaseDirectionRef.current = 0;
      lockedRef.current = true;
      wheelArmedRef.current = false;
      touchConsumedRef.current = true;
      cooldownUntilRef.current = performance.now() + wheelCooldownMs;
      setIsLocked(true);
      commitStep(fromBelow ? lastStep : 0, fromBelow ? -1 : 1);

      lastScrollYRef.current = currentScrollY;
      armAfterQuiet();
      return true;
    };

    const releaseScene = (releaseDirection) => {
      lockedRef.current = false;
      releaseDirectionRef.current = releaseDirection;
      cooldownUntilRef.current = performance.now() + Math.min(260, wheelCooldownMs);
      wheelArmedRef.current = false;
      touchConsumedRef.current = true;
      setIsLocked(false);
      setDirection(releaseDirection);
      commitProgress(releaseDirection > 0 ? 1 : 0);
      startGlobalHandoffGuard(releaseDirection, quietMs);
      armAfterQuiet();
    };

    const moveStep = (moveDirection) => {
      const currentStep = stepRef.current;

      if (moveDirection > 0) {
        if (currentStep < lastStep) {
          commitStep(currentStep + 1, 1);
          return "step";
        }
        releaseScene(1);
        return "release";
      }

      if (currentStep > 0) {
        commitStep(currentStep - 1, -1);
        return "step";
      }

      releaseScene(-1);
      return "release";
    };

    const preventEvent = (event) => {
      if (event?.cancelable) event.preventDefault();
    };

    const getCaptureState = (metrics, direction, projectedDeltaY = 0) => {
      if (!metrics) return "none";

      const inCaptureZone = isInCaptureZone(metrics);
      const inProjectedCaptureZone =
        !inCaptureZone && isInProjectedCaptureZone(metrics, projectedDeltaY);

      if (!inCaptureZone && !inProjectedCaptureZone) return "none";

      if (releaseDirectionRef.current === direction) return "none";
      if (releaseDirectionRef.current !== 0 && releaseDirectionRef.current !== direction) {
        releaseDirectionRef.current = 0;
      }

      if (isGlobalHandoffGuardActive()) return "blocked";
      return inProjectedCaptureZone ? "projected" : "capture";
    };

    const onWheel = (event) => {
      if (!lockEnabledRef.current) return;
      if (event.defaultPrevented || event.__nhLockedSceneReleased) return;

      const metrics = getMetrics();
      const deltaY = normalizeWheelDelta(event, metrics?.viewportHeight || window.innerHeight || 1);
      if (Math.abs(deltaY) < 4) return;

      const wheelDirection = deltaY > 0 ? 1 : -1;
      const now = performance.now();
      noteGlobalHandoffInput(quietMs);

      armAfterQuiet();

      if (lockedRef.current) {
        const canAct = wheelArmedRef.current && now >= cooldownUntilRef.current;
        const atForwardExit = wheelDirection > 0 && stepRef.current >= lastStep;
        const atBackwardExit = wheelDirection < 0 && stepRef.current <= 0;

        if (canAct && (atForwardExit || atBackwardExit)) {
          preventEvent(event);
          event.__nhLockedSceneReleased = true;
          event.__nhLockedSceneHandled = true;
          releaseScene(wheelDirection);
          return;
        }

        preventEvent(event);
        event.__nhLockedSceneHandled = true;
        if (!canAct) return;

        wheelArmedRef.current = false;
        cooldownUntilRef.current = now + wheelCooldownMs;
        moveStep(wheelDirection);
        return;
      }

      const captureState = getCaptureState(metrics, wheelDirection, deltaY);
      if (captureState === "blocked") {
        return;
      }

      if (captureState === "capture" || captureState === "projected") {
        const didLock = lockScene(wheelDirection < 0, metrics, {
          alignToEntry: captureState === "projected",
        });
        if (didLock) {
          preventEvent(event);
          event.__nhLockedSceneHandled = true;
        }
      }
    };

    const getTouchDirection = (touch) => {
      const start = touchStartRef.current;
      if (!start || !touch) return 0;

      const deltaX = touch.clientX - start.x;
      const deltaY = touch.clientY - start.y;
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);

      if (absY < touchThreshold || absY <= absX) return 0;
      return deltaY < 0 ? 1 : -1;
    };

    const onTouchStart = (event) => {
      if (!lockEnabledRef.current || event.touches.length !== 1) return;
      const touch = event.touches[0];
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
      };
      touchConsumedRef.current = false;
    };

    const onTouchMove = (event) => {
      if (!lockEnabledRef.current || event.touches.length !== 1) return;
      if (event.defaultPrevented || event.__nhLockedSceneReleased) return;

      const directionFromTouch = getTouchDirection(event.touches[0]);
      const metrics = getMetrics();
      if (directionFromTouch !== 0) {
        noteGlobalHandoffInput(quietMs);
      }

      if (lockedRef.current) {
        const now = performance.now();
        const canAct =
          directionFromTouch !== 0 &&
          !touchConsumedRef.current &&
          now >= cooldownUntilRef.current;
        const atForwardExit = directionFromTouch > 0 && stepRef.current >= lastStep;
        const atBackwardExit = directionFromTouch < 0 && stepRef.current <= 0;

        if (canAct && (atForwardExit || atBackwardExit)) {
          preventEvent(event);
          event.__nhLockedSceneReleased = true;
          event.__nhLockedSceneHandled = true;
          releaseScene(directionFromTouch);
          return;
        }

        preventEvent(event);
        if (!canAct) return;

        touchConsumedRef.current = true;
        cooldownUntilRef.current = now + wheelCooldownMs;
        moveStep(directionFromTouch);
        return;
      }

      const captureState =
        directionFromTouch === 0 ? "none" : getCaptureState(metrics, directionFromTouch);
      if (captureState === "blocked") {
        return;
      }

      if (captureState === "capture" || captureState === "projected") {
        const didLock = lockScene(directionFromTouch < 0, metrics);
        if (didLock) {
          preventEvent(event);
          touchConsumedRef.current = true;
        }
      }
    };

    const onTouchEnd = () => {
      touchStartRef.current = null;
      touchConsumedRef.current = false;
      armAfterQuiet();
    };

    const onKeyDown = (event) => {
      if (!lockEnabledRef.current) return;
      if (event.defaultPrevented || event.__nhLockedSceneReleased || event.__nhLockedSceneHandled) {
        return;
      }

      let keyDirection = 0;
      if (event.key === "ArrowDown" || event.key === "PageDown" || event.key === " " || event.key === "Spacebar") {
        keyDirection = 1;
      } else if (event.key === "ArrowUp" || event.key === "PageUp") {
        keyDirection = -1;
      } else {
        return;
      }

      const metrics = getMetrics();
      const now = performance.now();
      noteGlobalHandoffInput(quietMs);

      if (lockedRef.current) {
        const canAct = now >= cooldownUntilRef.current;
        const atForwardExit = keyDirection > 0 && stepRef.current >= lastStep;
        const atBackwardExit = keyDirection < 0 && stepRef.current <= 0;

        if (canAct && (atForwardExit || atBackwardExit)) {
          preventEvent(event);
          event.__nhLockedSceneReleased = true;
          event.__nhLockedSceneHandled = true;
          releaseScene(keyDirection);
          return;
        }

        preventEvent(event);
        event.__nhLockedSceneHandled = true;
        if (!canAct) return;

        cooldownUntilRef.current = now + wheelCooldownMs;
        moveStep(keyDirection);
        return;
      }

      const keyProjectedDelta = metrics ? keyDirection * metrics.viewportHeight : 0;
      const captureState = metrics
        ? getCaptureState(metrics, keyDirection, keyProjectedDelta)
        : "none";
      if (captureState === "blocked") {
        return;
      }

      if (captureState === "capture" || captureState === "projected") {
        const didLock = lockScene(keyDirection < 0, metrics, {
          alignToEntry: captureState === "projected",
        });
        if (didLock) {
          preventEvent(event);
          event.__nhLockedSceneHandled = true;
        }
      }
    };

    const onScroll = () => {
      const metrics = getMetrics();
      if (!metrics) return;

      if (lockedRef.current) return;

      if (!lockEnabledRef.current) {
        updateNativeProgress(metrics);
        return;
      }

      const previousScrollY = lastScrollYRef.current;
      const scrollY = metrics.scrollY;
      const scrollDelta = scrollY - previousScrollY;
      const scrollDirection = Math.sign(scrollDelta);
      lastScrollYRef.current = scrollY;

      if (isGlobalHandoffGuardActive()) {
        return;
      }

      if (!isInSceneBand(metrics)) {
        releaseDirectionRef.current = 0;
        return;
      }

      if (releaseDirectionRef.current !== 0) {
        if (scrollDirection !== 0 && scrollDirection !== releaseDirectionRef.current) {
          releaseDirectionRef.current = 0;
        }
      }
    };

    const onResize = () => {
      const metrics = getMetrics();
      if (!metrics) return;

      if (!lockedRef.current && !lockEnabledRef.current) {
        updateNativeProgress(metrics);
      }
    };

    if (!lockEnabled) {
      updateNativeProgress();
    }

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("touchcancel", onTouchEnd, { passive: true });
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("touchcancel", onTouchEnd);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      clearQuietTimer();
      lockedRef.current = false;
      lockEnabledRef.current = false;
      releaseDirectionRef.current = 0;
      touchStartRef.current = null;
      touchConsumedRef.current = false;
      wheelArmedRef.current = true;
      setIsLocked(false);
    };
  }, [
    commitProgress,
    commitStep,
    disableOnCoarsePointer,
    enabled,
    lastStep,
    lockOffset,
    quietMs,
    sectionRef,
    steps,
    touchThreshold,
    wheelCooldownMs,
  ]);

  return {
    step,
    progress,
    isLocked,
    direction,
    isNative: !lockEnabledRef.current,
  };
}
