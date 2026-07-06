import { useEffect, useState } from "react";

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const COOL_MS = 450;
const QUIET_MS = 130;
const HANDOFF_MS = 360;
const STEP_EASE = 0.18;
const LOCK_SCROLL_TOLERANCE_PX = 3;
const MOBILE_BREAKPOINT = 860;

function normalizeWheelDelta(event, viewportHeight) {
  if (event.deltaMode === 1) return event.deltaY * 16;
  if (event.deltaMode === 2) return event.deltaY * viewportHeight;
  return event.deltaY;
}

function createSnapshot(progress, steps, isNative) {
  const lastStep = Math.max(0, steps - 1);
  const safeProgress = clamp(progress, 0, 1);

  return {
    progress: safeProgress,
    step: clamp(Math.round(safeProgress * lastStep), 0, lastStep),
    isNative,
  };
}

function createSceneEngine() {
  return {
    scenes: new Map(),
    subscribers: new Map(),
    snapshots: new Map(),
    sceneProgress: new Map(),
    sceneTargets: new Map(),
    started: false,
    enabled: false,
    mode: "free",
    activeScene: null,
    step: 0,
    frozenY: 0,
    coolAt: 0,
    armed: true,
    quietTimer: null,
    touchY: 0,
    touchDeltaY: 0,
    touchConsumed: false,
    releasedScene: null,
    handoffDirection: 0,
    handoffUntil: 0,
    rafId: null,

    viewportHeight() {
      return window.innerHeight || 1;
    },

    maxScrollY() {
      return Math.max(0, document.documentElement.scrollHeight - this.viewportHeight());
    },

    clampY(y) {
      return clamp(y, 0, this.maxScrollY());
    },

    sceneByKey(key) {
      return this.scenes.get(key);
    },

    sceneTop(scene) {
      const element = scene?.ref?.current;
      if (!element) return 0;
      return element.getBoundingClientRect().top + (window.scrollY || 0);
    },

    sceneHeight(scene) {
      const element = scene?.ref?.current;
      if (!element) return this.viewportHeight();
      return Math.max(element.offsetHeight, element.getBoundingClientRect().height, 1);
    },

    orderedScenes() {
      return Array.from(this.scenes.values())
        .filter((scene) => scene.ref.current)
        .map((scene) => ({
          ...scene,
          top: this.sceneTop(scene),
          height: this.sceneHeight(scene),
        }))
        .sort((a, b) => a.top - b.top);
    },

    nativeProgress(scene) {
      const element = scene?.ref?.current;
      if (!element) return 0;

      const rect = element.getBoundingClientRect();
      const span = rect.height - this.viewportHeight();

      if (span <= 0) {
        return rect.top <= 0 ? 1 : 0;
      }

      return clamp(-rect.top / span, 0, 1);
    },

    getProgressForScene(scene) {
      if (!this.enabled) return this.nativeProgress(scene);
      return this.sceneProgress.get(scene.key) || 0;
    },

    updateSnapshot(key) {
      const scene = this.sceneByKey(key);
      if (!scene) return;

      const nextSnapshot = createSnapshot(
        this.getProgressForScene(scene),
        scene.steps,
        !this.enabled
      );
      const previous = this.snapshots.get(key);

      if (
        previous &&
        previous.step === nextSnapshot.step &&
        previous.isNative === nextSnapshot.isNative &&
        Math.abs(previous.progress - nextSnapshot.progress) < 0.001
      ) {
        return;
      }

      this.snapshots.set(key, nextSnapshot);
      this.subscribers.get(key)?.forEach((callback) => callback(nextSnapshot));
    },

    updateAllSnapshots() {
      this.scenes.forEach((scene) => this.updateSnapshot(scene.key));
    },

    setSceneProgress(key, progress, immediate = false) {
      const safeProgress = clamp(progress, 0, 1);
      this.sceneTargets.set(key, safeProgress);
      if (immediate) this.sceneProgress.set(key, safeProgress);
      this.updateSnapshot(key);
    },

    clearReleasedSceneIfNeeded(scrollY = window.scrollY || 0) {
      if (!this.releasedScene) return;

      const scene = this.sceneByKey(this.releasedScene.key);
      if (!scene) {
        this.releasedScene = null;
        return;
      }

      const top = this.sceneTop(scene);
      const height = Math.min(this.sceneHeight(scene), this.viewportHeight());
      const below = scrollY > top + height * 0.72;
      const above = scrollY < top - height * 0.42;

      if (
        (this.releasedScene.direction > 0 && below) ||
        (this.releasedScene.direction < 0 && above)
      ) {
        this.releasedScene = null;
      }
    },

    shouldIgnoreScene(scene, direction) {
      return (
        this.releasedScene &&
        this.releasedScene.key === scene.key &&
        this.releasedScene.direction === direction
      );
    },

    beginHandoff(direction) {
      this.handoffDirection = direction;
      this.handoffUntil = performance.now() + HANDOFF_MS;
    },

    isHandoffActive(direction) {
      if (this.handoffDirection !== direction) return false;

      const isActive = performance.now() < this.handoffUntil || !this.armed;
      if (!isActive) this.handoffDirection = 0;
      return isActive;
    },

    findCaptureScene(currentY, projectedY, direction) {
      this.clearReleasedSceneIfNeeded(currentY);

      const viewportHeight = this.viewportHeight();
      const scenes = this.orderedScenes();

      const containing = scenes.find((scene) => {
        const bottom = scene.top + Math.min(scene.height, viewportHeight);
        return currentY >= scene.top - 1 && currentY < bottom - 1;
      });

      if (containing && !this.shouldIgnoreScene(containing, direction)) {
        return containing;
      }

      if (direction > 0) {
        return (
          scenes.find(
            (scene) =>
              !this.shouldIgnoreScene(scene, direction) &&
              scene.top > currentY + 1 &&
              scene.top <= projectedY + 1
          ) || null
        );
      }

      const crossed = scenes.filter(
        (scene) =>
          !this.shouldIgnoreScene(scene, direction) &&
          scene.top < currentY - 1 &&
          scene.top >= projectedY - 1
      );

      return crossed.length ? crossed[crossed.length - 1] : null;
    },

    lockScene(key, fromBelow) {
      const scene = this.sceneByKey(key);
      if (!scene || !this.enabled) return;

      const top = this.sceneTop(scene);
      this.mode = "locked";
      this.activeScene = key;
      this.frozenY = top;
      this.step = fromBelow ? scene.steps - 1 : 0;
      this.armed = false;
      this.touchConsumed = true;
      this.coolAt = performance.now();
      this.releasedScene = null;
      this.handoffDirection = 0;
      this.setSceneProgress(key, fromBelow ? 1 : 0, true);
      window.scrollTo(0, top);
      this.armAfterQuiet();
    },

    releaseScene(direction) {
      const key = this.activeScene;
      if (!key) return;

      this.setSceneProgress(key, direction > 0 ? 1 : 0, true);
      this.mode = "free";
      this.activeScene = null;
      this.releasedScene = { key, direction };
      this.coolAt = performance.now();
      this.armed = false;
      this.touchConsumed = true;
      this.beginHandoff(direction);
      this.armAfterQuiet();
    },

    moveStep(direction) {
      const scene = this.sceneByKey(this.activeScene);
      if (!scene) {
        this.mode = "free";
        this.activeScene = null;
        return;
      }

      if (direction > 0) {
        if (this.step < scene.steps - 1) {
          this.step += 1;
          this.setSceneProgress(scene.key, this.step / (scene.steps - 1));
        } else {
          this.releaseScene(1);
        }
        return;
      }

      if (this.step > 0) {
        this.step -= 1;
        this.setSceneProgress(scene.key, this.step / (scene.steps - 1));
      } else {
        this.releaseScene(-1);
      }
    },

    refreshMode() {
      const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
      const coarsePointer = window.matchMedia?.("(pointer: coarse)").matches;
      const isMobile = coarsePointer || (window.innerWidth || 999) < MOBILE_BREAKPOINT;

      this.enabled = !reduceMotion && !isMobile;

      if (!this.enabled) {
        this.mode = "free";
        this.activeScene = null;
        this.releasedScene = null;
        this.handoffDirection = 0;
      }

      this.updateProgressFromNativeScroll();
      this.updateAllSnapshots();
    },

    armAfterQuiet() {
      if (this.quietTimer) window.clearTimeout(this.quietTimer);
      this.quietTimer = window.setTimeout(() => {
        this.armed = true;
        this.touchConsumed = false;
        this.quietTimer = null;
      }, QUIET_MS);
    },

    captureIfCrossing(deltaY, direction) {
      if (this.isHandoffActive(direction)) {
        this.armAfterQuiet();
        return false;
      }

      const currentY = window.scrollY || 0;
      const projectedY = this.clampY(currentY + deltaY);
      const scene = this.findCaptureScene(currentY, projectedY, direction);

      if (!scene) return false;

      this.lockScene(scene.key, direction < 0);
      return true;
    },

    onWheel(event) {
      if (!this.enabled || event.defaultPrevented) return;

      const deltaY = normalizeWheelDelta(event, this.viewportHeight());
      if (Math.abs(deltaY) < 4) return;

      const direction = deltaY > 0 ? 1 : -1;

      if (this.mode === "locked") {
        event.preventDefault();
        this.armAfterQuiet();

        const now = performance.now();
        if (!this.armed || now - this.coolAt < COOL_MS) return;

        this.armed = false;
        this.coolAt = now;
        this.moveStep(direction);
        return;
      }

      if (this.captureIfCrossing(deltaY, direction)) {
        event.preventDefault();
      }
    },

    onTouchStart(event) {
      const touch = event.touches?.[0];
      if (!touch) return;

      this.touchY = touch.clientY;
      this.touchDeltaY = 0;
      this.touchConsumed = false;
    },

    onTouchMove(event) {
      if (!this.enabled) return;

      const touch = event.touches?.[0];
      if (!touch) return;

      const y = touch.clientY;
      const delta = this.touchY - y;
      this.touchY = y;

      if (this.mode === "locked") {
        event.preventDefault();
        this.touchDeltaY += delta;

        const now = performance.now();
        if (
          !this.touchConsumed &&
          Math.abs(this.touchDeltaY) > 36 &&
          now - this.coolAt > COOL_MS
        ) {
          this.touchConsumed = true;
          this.coolAt = now;
          this.moveStep(this.touchDeltaY > 0 ? 1 : -1);
        }
        return;
      }

      if (Math.abs(delta) < 1) return;

      if (this.captureIfCrossing(delta, delta > 0 ? 1 : -1)) {
        event.preventDefault();
      }
    },

    onTouchEnd() {
      this.touchDeltaY = 0;
      this.touchConsumed = false;
    },

    onKeyDown(event) {
      if (!this.enabled) return;

      if (this.mode === "locked" && (event.key === "Home" || event.key === "End")) {
        event.preventDefault();
        const targetY = event.key === "Home" ? 0 : this.maxScrollY();
        this.mode = "free";
        this.activeScene = null;
        this.releasedScene = null;
        this.handoffDirection = 0;
        window.scrollTo(0, targetY);
        return;
      }

      let direction = 0;
      if (
        event.key === "ArrowDown" ||
        event.key === "PageDown" ||
        event.key === " " ||
        event.key === "Spacebar"
      ) {
        direction = 1;
      } else if (event.key === "ArrowUp" || event.key === "PageUp") {
        direction = -1;
      } else {
        return;
      }

      if (this.mode === "locked") {
        event.preventDefault();

        const now = performance.now();
        if (now - this.coolAt < COOL_MS) return;

        this.coolAt = now;
        this.moveStep(direction);
        return;
      }

      if (this.captureIfCrossing(direction * Math.round(this.viewportHeight() * 0.85), direction)) {
        event.preventDefault();
      }
    },

    updateProgressFromNativeScroll() {
      if (this.enabled) {
        const scrollY = window.scrollY || 0;
        const viewportHeight = this.viewportHeight();

        this.orderedScenes().forEach((scene) => {
          if (this.mode === "locked" && this.activeScene === scene.key) return;

          const sceneEnd = scene.top + Math.min(scene.height, viewportHeight);
          if (scrollY < scene.top - 1) {
            this.setSceneProgress(scene.key, 0, true);
          } else if (scrollY > sceneEnd + 1) {
            this.setSceneProgress(scene.key, 1, true);
          }
        });
        return;
      }

      this.scenes.forEach((scene) => {
        const progress = this.nativeProgress(scene);
        this.sceneProgress.set(scene.key, progress);
        this.sceneTargets.set(scene.key, progress);
        this.updateSnapshot(scene.key);
      });
    },

    onNativeScroll() {
      if (this.enabled && this.mode === "locked") {
        const scrollY = window.scrollY || 0;
        if (Math.abs(scrollY - this.frozenY) > LOCK_SCROLL_TOLERANCE_PX) {
          window.scrollTo(0, this.frozenY);
        }
        return;
      }

      this.clearReleasedSceneIfNeeded();
      this.updateProgressFromNativeScroll();
      this.updateAllSnapshots();
    },

    onResize() {
      this.refreshMode();
    },

    loop() {
      if (!this.started) return;

      if (this.enabled) {
        this.scenes.forEach((scene) => {
          const target = this.sceneTargets.get(scene.key) || 0;
          const current = this.sceneProgress.get(scene.key) || 0;
          const next =
            Math.abs(target - current) < 0.001
              ? target
              : current + (target - current) * STEP_EASE;

          if (next !== current) {
            this.sceneProgress.set(scene.key, next);
            this.updateSnapshot(scene.key);
          }
        });
      }

      this.rafId = window.requestAnimationFrame(() => this.loop());
    },

    start() {
      if (this.started || typeof window === "undefined") return;

      this.started = true;
      this.onWheel = this.onWheel.bind(this);
      this.onTouchStart = this.onTouchStart.bind(this);
      this.onTouchMove = this.onTouchMove.bind(this);
      this.onTouchEnd = this.onTouchEnd.bind(this);
      this.onKeyDown = this.onKeyDown.bind(this);
      this.onNativeScroll = this.onNativeScroll.bind(this);
      this.onResize = this.onResize.bind(this);

      window.addEventListener("wheel", this.onWheel, { passive: false });
      window.addEventListener("touchstart", this.onTouchStart, { passive: true });
      window.addEventListener("touchmove", this.onTouchMove, { passive: false });
      window.addEventListener("touchend", this.onTouchEnd, { passive: true });
      window.addEventListener("touchcancel", this.onTouchEnd, { passive: true });
      window.addEventListener("keydown", this.onKeyDown);
      window.addEventListener("scroll", this.onNativeScroll, { passive: true });
      window.addEventListener("resize", this.onResize);

      this.refreshMode();
      this.rafId = window.requestAnimationFrame(() => this.loop());
    },

    stop() {
      if (!this.started || typeof window === "undefined") return;

      window.removeEventListener("wheel", this.onWheel);
      window.removeEventListener("touchstart", this.onTouchStart);
      window.removeEventListener("touchmove", this.onTouchMove);
      window.removeEventListener("touchend", this.onTouchEnd);
      window.removeEventListener("touchcancel", this.onTouchEnd);
      window.removeEventListener("keydown", this.onKeyDown);
      window.removeEventListener("scroll", this.onNativeScroll);
      window.removeEventListener("resize", this.onResize);

      if (this.quietTimer) window.clearTimeout(this.quietTimer);
      if (this.rafId) window.cancelAnimationFrame(this.rafId);

      this.quietTimer = null;
      this.rafId = null;
      this.started = false;
      this.enabled = false;
      this.mode = "free";
      this.activeScene = null;
      this.releasedScene = null;
      this.handoffDirection = 0;
    },

    registerScene(scene) {
      this.scenes.set(scene.key, scene);
      if (!this.sceneProgress.has(scene.key)) this.sceneProgress.set(scene.key, 0);
      if (!this.sceneTargets.has(scene.key)) this.sceneTargets.set(scene.key, 0);
      if (!this.snapshots.has(scene.key)) {
        this.snapshots.set(scene.key, createSnapshot(0, scene.steps, !this.enabled));
      }

      this.start();
      this.refreshMode();
      this.updateSnapshot(scene.key);

      return () => {
        this.scenes.delete(scene.key);
        this.subscribers.delete(scene.key);
        this.snapshots.delete(scene.key);
        this.sceneProgress.delete(scene.key);
        this.sceneTargets.delete(scene.key);

        if (this.activeScene === scene.key) {
          this.mode = "free";
          this.activeScene = null;
        }

        if (this.releasedScene?.key === scene.key) this.releasedScene = null;

        if (this.scenes.size === 0) this.stop();
      };
    },

    subscribe(key, callback) {
      if (!this.subscribers.has(key)) this.subscribers.set(key, new Set());
      this.subscribers.get(key).add(callback);

      return () => {
        this.subscribers.get(key)?.delete(callback);
      };
    },

    getSnapshot(key, steps) {
      return this.snapshots.get(key) || createSnapshot(0, steps, !this.enabled);
    },
  };
}

let engine;

function getEngine() {
  if (!engine) engine = createSceneEngine();
  return engine;
}

export default function useClaudeStepScene({ sceneKey, sectionRef, steps }) {
  const [snapshot, setSnapshot] = useState(() => createSnapshot(0, steps, true));

  useEffect(() => {
    if (typeof window === "undefined" || !sceneKey || !sectionRef?.current || steps < 2) {
      return undefined;
    }

    const sceneEngine = getEngine();
    const unregister = sceneEngine.registerScene({ key: sceneKey, ref: sectionRef, steps });
    const unsubscribe = sceneEngine.subscribe(sceneKey, setSnapshot);

    setSnapshot(sceneEngine.getSnapshot(sceneKey, steps));

    return () => {
      unsubscribe();
      unregister();
    };
  }, [sceneKey, sectionRef, steps]);

  return snapshot;
}
