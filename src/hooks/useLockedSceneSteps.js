import { useCallback, useEffect, useRef, useState } from "react";

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

function normalizeWheelDelta(event, viewportHeight) {
  if (!event) return 0;
  if (event.deltaMode === 1) return event.deltaY * 16;
  if (event.deltaMode === 2) return event.deltaY * viewportHeight;
  return event.deltaY;
}

function getMaxScrollY() {
  return Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
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
  const lockYRef = useRef(0);
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
        lockY: clamp(sectionTop - lockOffset, 0, getMaxScrollY()),
      };
    };

    const isInSceneBand = (metrics) =>
      metrics.rect.bottom > lockOffset + 1 &&
      metrics.rect.top < metrics.viewportHeight - 1;

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

    const lockScene = (fromBelow, metrics = getMetrics()) => {
      if (!metrics || !lockEnabledRef.current) return;

      releaseDirectionRef.current = 0;
      lockedRef.current = true;
      lockYRef.current = metrics.lockY;
      wheelArmedRef.current = false;
      touchConsumedRef.current = true;
      cooldownUntilRef.current = performance.now() + wheelCooldownMs;
      setIsLocked(true);
      commitStep(fromBelow ? lastStep : 0, fromBelow ? -1 : 1);

      window.scrollTo({ top: metrics.lockY, left: 0, behavior: "auto" });
      lastScrollYRef.current = metrics.lockY;
      armAfterQuiet();
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

    const shouldLockFromWheel = (metrics, wheelDirection, deltaY) => {
      if (!metrics) return false;

      if (releaseDirectionRef.current === wheelDirection) return false;
      if (releaseDirectionRef.current !== 0 && releaseDirectionRef.current !== wheelDirection) {
        releaseDirectionRef.current = 0;
      }

      const currentY = metrics.scrollY;
      const projectedY = clamp(currentY + deltaY, 0, getMaxScrollY());
      const atLockLine = Math.abs(currentY - metrics.lockY) <= 2;
      const crossesDown =
        wheelDirection > 0 && currentY < metrics.lockY && projectedY >= metrics.lockY;
      const crossesUp =
        wheelDirection < 0 && currentY > metrics.lockY && projectedY <= metrics.lockY;

      if (crossesDown || crossesUp) return true;
      if (!isInSceneBand(metrics)) return false;

      const alreadyInside =
        metrics.rect.top <= lockOffset + 2 &&
        metrics.rect.bottom >= Math.min(metrics.viewportHeight, metrics.viewportHeight * 0.45);

      return atLockLine || alreadyInside;
    };

    const onWheel = (event) => {
      if (!lockEnabledRef.current) return;
      if (event.defaultPrevented || event.__nhLockedSceneReleased) return;

      const metrics = getMetrics();
      const deltaY = normalizeWheelDelta(event, metrics?.viewportHeight || window.innerHeight || 1);
      if (Math.abs(deltaY) < 4) return;

      const wheelDirection = deltaY > 0 ? 1 : -1;
      const now = performance.now();
      armAfterQuiet();

      if (lockedRef.current) {
        const canAct = wheelArmedRef.current && now >= cooldownUntilRef.current;
        const atForwardExit = wheelDirection > 0 && stepRef.current >= lastStep;
        const atBackwardExit = wheelDirection < 0 && stepRef.current <= 0;

        if (canAct && (atForwardExit || atBackwardExit)) {
          event.__nhLockedSceneReleased = true;
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

      if (shouldLockFromWheel(metrics, wheelDirection, deltaY)) {
        preventEvent(event);
        event.__nhLockedSceneHandled = true;
        lockScene(wheelDirection < 0, metrics);
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

      if (lockedRef.current) {
        const now = performance.now();
        const canAct =
          directionFromTouch !== 0 &&
          !touchConsumedRef.current &&
          now >= cooldownUntilRef.current;
        const atForwardExit = directionFromTouch > 0 && stepRef.current >= lastStep;
        const atBackwardExit = directionFromTouch < 0 && stepRef.current <= 0;

        if (canAct && (atForwardExit || atBackwardExit)) {
          event.__nhLockedSceneReleased = true;
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

      if (directionFromTouch !== 0 && shouldLockFromWheel(metrics, directionFromTouch, directionFromTouch * touchThreshold * 2)) {
        preventEvent(event);
        touchConsumedRef.current = true;
        lockScene(directionFromTouch < 0, metrics);
      }
    };

    const onTouchEnd = () => {
      touchStartRef.current = null;
      touchConsumedRef.current = false;
      armAfterQuiet();
    };

    const onKeyDown = (event) => {
      if (!lockEnabledRef.current) return;

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

      if (lockedRef.current) {
        const canAct = now >= cooldownUntilRef.current;
        const atForwardExit = keyDirection > 0 && stepRef.current >= lastStep;
        const atBackwardExit = keyDirection < 0 && stepRef.current <= 0;

        if (canAct && (atForwardExit || atBackwardExit)) {
          releaseScene(keyDirection);
          return;
        }

        preventEvent(event);
        if (!canAct) return;

        cooldownUntilRef.current = now + wheelCooldownMs;
        moveStep(keyDirection);
        return;
      }

      if (metrics && shouldLockFromWheel(metrics, keyDirection, keyDirection * metrics.viewportHeight * 0.85)) {
        preventEvent(event);
        lockScene(keyDirection < 0, metrics);
      }
    };

    const onScroll = () => {
      const metrics = getMetrics();
      if (!metrics) return;

      if (lockedRef.current) {
        if (Math.abs((window.scrollY || window.pageYOffset || 0) - lockYRef.current) > 1) {
          window.scrollTo({ top: lockYRef.current, left: 0, behavior: "auto" });
        }
        return;
      }

      if (!lockEnabledRef.current) {
        updateNativeProgress(metrics);
        return;
      }

      const scrollY = metrics.scrollY;
      const scrollDirection = Math.sign(scrollY - lastScrollYRef.current);
      lastScrollYRef.current = scrollY;

      if (!isInSceneBand(metrics)) {
        releaseDirectionRef.current = 0;
        return;
      }

      if (releaseDirectionRef.current !== 0) {
        if (scrollDirection !== 0 && scrollDirection !== releaseDirectionRef.current) {
          releaseDirectionRef.current = 0;
        }
        return;
      }

      if (
        scrollDirection > 0 &&
        metrics.rect.top <= lockOffset + 1 &&
        metrics.rect.bottom >= metrics.viewportHeight * 0.5
      ) {
        lockScene(false, metrics);
      } else if (
        scrollDirection < 0 &&
        Math.abs(metrics.scrollY - metrics.lockY) <= 2 &&
        metrics.rect.bottom >= metrics.viewportHeight * 0.5
      ) {
        lockScene(true, metrics);
      }
    };

    const onResize = () => {
      const metrics = getMetrics();
      if (!metrics) return;

      if (lockedRef.current) {
        lockYRef.current = metrics.lockY;
        window.scrollTo({ top: metrics.lockY, left: 0, behavior: "auto" });
      } else if (!lockEnabledRef.current) {
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
