import { useEffect, useState } from "react";

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const COOL_MS = 450;
const QUIET_MS = 130;
const HANDOFF_MS = 340;
const STEP_EASE = 0.18;
/* Détection de "geste frais" à la molette (desktop, mode locked) : on entretient
   une enveloppe des |delta| récents qui décroît exponentiellement. Un event dont
   le delta dépasse nettement l'enveloppe est un nouveau geste (nouveau cran de
   molette, nouveau swipe de trackpad) ; la traîne d'inertie d'un trackpad ou
   d'une molette libre reste sous l'enveloppe et ne peut jamais déclencher
   l'étape suivante. Remplace l'ancien armement par arrêt complet (armed +
   QUIET_MS) qui obligeait à marquer une vraie pause entre deux étapes. */
const WHEEL_ENVELOPE_TAU_MS = 250;
const WHEEL_FRESH_FACTOR = 1.3;
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
    lastWheelAt: 0,
    wheelEnvelope: 0,
    quietTimer: null,
    touchY: 0,
    touchDeltaY: 0,
    touchConsumed: false,
    releasedScene: null,
    handoffDirection: 0,
    handoffUntil: 0,
    scrollBehaviorRestore: null,
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

    preventEvent(event) {
      if (event?.cancelable) event.preventDefault();
    },

    holdInstantScrollBehavior() {
      if (typeof document === "undefined") return;

      const body = document.body;
      const html = document.documentElement;
      if (!body || !html) return;

      if (!this.scrollBehaviorRestore) {
        this.scrollBehaviorRestore = {
          bodyScrollBehavior: body.style.scrollBehavior,
          htmlScrollBehavior: html.style.scrollBehavior,
          rafId: 0,
          nextRafId: 0,
        };
      } else {
        if (this.scrollBehaviorRestore.rafId) {
          window.cancelAnimationFrame(this.scrollBehaviorRestore.rafId);
        }
        if (this.scrollBehaviorRestore.nextRafId) {
          window.cancelAnimationFrame(this.scrollBehaviorRestore.nextRafId);
        }
      }

      html.style.scrollBehavior = "auto";
      body.style.scrollBehavior = "auto";
    },

    scheduleScrollBehaviorRestore() {
      if (!this.scrollBehaviorRestore || typeof document === "undefined") return;

      const restore = () => {
        const snapshot = this.scrollBehaviorRestore;
        if (!snapshot) return;

        document.documentElement.style.scrollBehavior = snapshot.htmlScrollBehavior;
        document.body.style.scrollBehavior = snapshot.bodyScrollBehavior;
        this.scrollBehaviorRestore = null;
      };

      this.scrollBehaviorRestore.rafId = window.requestAnimationFrame(() => {
        if (!this.scrollBehaviorRestore) return;
        this.scrollBehaviorRestore.nextRafId = window.requestAnimationFrame(restore);
      });
    },

    instantScrollTo(y, maxY = this.maxScrollY()) {
      if (typeof window === "undefined") return;

      const safeY = clamp(y, 0, maxY);
      this.holdInstantScrollBehavior();
      window.scrollTo({ top: safeY, left: 0, behavior: "auto" });
      this.scheduleScrollBehaviorRestore();
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
      const height = this.sceneHeight(scene);
      const buffer = 24;

      const fullyBelow = scrollY >= top + height + buffer;
      const fullyAbove = scrollY <= top - buffer;

      /* Sortie de la zone par N'IMPORTE quel côté : le "ne pas re-capturer
         juste après release" n'a plus de raison d'être — la prochaine
         traversée doit re-verrouiller. Ne tester que le côté de la sortie
         laissait releasedScene actif pour toujours quand on remontait
         au-dessus de la scène après une sortie vers le bas : la descente
         suivante traversait la section sans aucun lock. */
      if (fullyBelow || fullyAbove) {
        this.releasedScene = null;
        return;
      }

      /* Toujours dans la zone : on continue d'ignorer la scène (pas de
         nettoyage au temps écoulé), sinon une pause au bord de sortie
         re-capturerait la scène sur place et rejouerait l'animation
         depuis le début. */
    },

    shouldIgnoreScene(scene, direction, currentY = window.scrollY || 0) {
      this.clearReleasedSceneIfNeeded(currentY);

      if (!this.releasedScene || this.releasedScene.key !== scene.key) {
        return false;
      }

      /* N'ignorer la scène QUE dans le sens de sa sortie : parqué au bord aval
         après un release, re-scroller dans le même sens ne doit pas la
         re-capturer sur place ; mais revenir en sens inverse doit la
         re-verrouiller depuis ce bord (remonter de la 04 vers la 03 rejoue
         4 → 3 → 2 → 1, comme sur mobile). */
      return direction === this.releasedScene.direction;
    },

    beginHandoff(direction) {
      this.handoffDirection = direction;
      this.handoffUntil = performance.now() + HANDOFF_MS;
    },

    isHandoffActive() {
      if (this.handoffDirection === 0) return false;

      /* Fenêtre STRICTEMENT bornée à HANDOFF_MS. L'ancienne extension par
         "!armed" prolongeait le handoff tant que des events arrivaient à
         moins de QUIET_MS d'écart : toute la traîne d'inertie d'un trackpad
         bloquait la capture, et remonter de la 04 traversait la 03 sans
         jamais la verrouiller. La protection anti re-capture immédiate est
         assurée par releasedScene, pas par le handoff. */
      const isActive = performance.now() < this.handoffUntil;
      if (!isActive) this.handoffDirection = 0;
      return isActive;
    },

    captureBounds(scene, viewportHeight = this.viewportHeight()) {
      const top = scene.top ?? this.sceneTop(scene);
      const height = scene.height ?? this.sceneHeight(scene);
      const end = top + Math.max(0, height - viewportHeight);

      return { top, end };
    },

    findCaptureScene(currentY, projectedY, direction) {
      this.clearReleasedSceneIfNeeded(currentY);

      const viewportHeight = this.viewportHeight();
      const scenes = this.orderedScenes();

      const containing = scenes.find((scene) => {
        const { top, end } = this.captureBounds(scene, viewportHeight);
        return currentY >= top - 1 && currentY <= end + 1;
      });

      if (containing && !this.shouldIgnoreScene(containing, direction, currentY)) {
        return { scene: containing };
      }

      if (direction > 0) {
        const crossed = scenes.find((scene) => {
          /* softCapture : la scène ne se verrouille que lorsque le scroll est
             DÉJÀ dans sa zone (branche "containing", recalage dans la bande
             donc invisible). Pas de capture par projection → pas de scrollTo
             visible. */
          if (scene.softCapture) return false;
          if (this.shouldIgnoreScene(scene, direction, currentY)) return false;

          const { top } = this.captureBounds(scene, viewportHeight);

          return top > currentY + 1 && top <= projectedY + 1;
        });

        if (!crossed) return null;

        return { scene: crossed };
      }

      const crossed = scenes.filter((scene) => {
        if (scene.softCapture) return false;
        if (this.shouldIgnoreScene(scene, direction, currentY)) return false;

        const { end } = this.captureBounds(scene, viewportHeight);

        return end < currentY - 1 && end >= projectedY - 1;
      });

      if (!crossed.length) return null;

      return { scene: crossed[crossed.length - 1] };
    },

    lockScene(key, fromBelow) {
      const scene = this.sceneByKey(key);
      if (!scene || !this.enabled) return;

      const top = this.sceneTop(scene);
      const end = top + Math.max(0, this.sceneHeight(scene) - this.viewportHeight());
      /* Épingle au bord AMONT de la bande sticky (top en descendant, end en
         remontant) : tout Y de [top, end] affiche le même écran, donc ce
         recalage est invisible, et il laisse toute la bande comme tampon dans
         le sens du scroll. Nécessaire sur PC : Chrome/Edge livrent en
         cancelable:false les wheel events d'une séquence continue dont le
         premier n'a pas été preventDefault-é — le scroll natif résiduel doit
         pouvoir être absorbé dans la bande (re-épinglé par onNativeScroll)
         sans jamais afficher un pixel hors bande. */
      const frozenY = fromBelow ? end : top;
      this.mode = "locked";
      this.activeScene = key;
      this.frozenY = frozenY;
      this.step = fromBelow ? scene.steps - 1 : 0;
      this.touchConsumed = true;
      this.coolAt = performance.now();
      /* Verrouiller une scène (quelle qu'elle soit) clôt l'épisode de release
         précédent. Ne purger que la même clé laissait la 03 marquée "à
         ignorer" pendant tout le lock de la 04 — qui s'épingle pile à sa
         frontière, donc la purge "un écran plus bas" n'arrivait jamais — et
         la remontée 04 → 03 traversait la section sans capture. */
      this.releasedScene = null;
      this.handoffDirection = 0;
      this.setSceneProgress(key, fromBelow ? 1 : 0, true);
      /* Verrou "scroll-pin" : PAS de body position:fixed. Basculer le body en
         fixed créait un nouveau stacking context → Chrome reconstruisait les
         couches et re-rastérisait le contenu ; les scènes lourdes (rail 300vw
         + blurs) disparaissaient 1-2 frames au lock. Il collapsait aussi
         scrollY à 0 (Header, Framer useScroll). Ici on aligne simplement le
         scroll dans la zone épinglée — le stage sticky y affiche le même
         écran pour tout Y — puis les handlers preventDefault neutralisent
         les inputs et onNativeScroll ré-épingle les résidus d'inertie. */
      if (Math.abs((window.scrollY || 0) - frozenY) > 1) {
        this.instantScrollTo(frozenY);
      }
      this.armAfterQuiet();
    },

    releaseScene(direction) {
      const key = this.activeScene;
      if (!key) return;

      /* Sortie au bord AVAL de la bande : recalage invisible (stage sticky),
         et le scroll natif reprend pile au seuil où la section commence à
         glisser — pas de zone morte à re-scroller après la dernière étape. */
      const scene = this.sceneByKey(key);
      const top = scene ? this.sceneTop(scene) : this.frozenY;
      const end = scene
        ? top + Math.max(0, this.sceneHeight(scene) - this.viewportHeight())
        : this.frozenY;
      const targetY = this.clampY(direction > 0 ? end : top);
      const now = performance.now();
      this.setSceneProgress(key, direction > 0 ? 1 : 0, true);
      this.mode = "free";
      this.activeScene = null;
      this.releasedScene = { key, direction };
      this.coolAt = now;
      this.touchConsumed = true;
      this.beginHandoff(direction);
      /* targetY est dans la bande épinglée : ce scrollTo ne change pas
         l'écran affiché, le scroll natif reprend simplement d'ici. */
      this.instantScrollTo(targetY);
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
        this.touchConsumed = false;
        this.quietTimer = null;
      }, QUIET_MS);
    },

    captureIfCrossing(deltaY, direction) {
      if (this.isHandoffActive()) {
        this.armAfterQuiet();
        return false;
      }

      const currentY = window.scrollY || 0;
      const projectedY = this.clampY(currentY + deltaY);
      const capture = this.findCaptureScene(currentY, projectedY, direction);

      if (!capture) return false;

      this.lockScene(capture.scene.key, direction < 0);
      return true;
    },

    onWheel(event) {
      if (!this.enabled || event.defaultPrevented) return;

      const deltaY = normalizeWheelDelta(event, this.viewportHeight());
      if (Math.abs(deltaY) < 4) return;

      const direction = deltaY > 0 ? 1 : -1;

      /* Enveloppe entretenue sur TOUS les events (mode libre compris) : ainsi,
         au moment d'un lock en pleine traîne d'inertie, l'enveloppe connaît
         déjà le geste en cours et la traîne ne compte pas comme geste frais. */
      const now = performance.now();
      const absDelta = Math.abs(deltaY);
      const decayedEnvelope =
        this.wheelEnvelope * Math.exp((this.lastWheelAt - now) / WHEEL_ENVELOPE_TAU_MS);
      const isFreshGesture = absDelta > decayedEnvelope * WHEEL_FRESH_FACTOR;
      this.wheelEnvelope = Math.max(absDelta, decayedEnvelope);
      this.lastWheelAt = now;

      if (this.mode === "locked") {
        this.preventEvent(event);

        /* Une étape max par geste : cooldown depuis la dernière étape + le
           geste doit être frais (pas la traîne du geste précédent). Plus
           d'arrêt obligatoire : dès que le cooldown est passé, le cran de
           molette suivant répond immédiatement. */
        if (!isFreshGesture || now - this.coolAt < COOL_MS) return;

        this.coolAt = now;
        this.moveStep(direction);
        return;
      }

      if (this.isHandoffActive()) {
        this.preventEvent(event);
        return;
      }

      if (this.captureIfCrossing(deltaY, direction)) {
        this.preventEvent(event);
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
        this.preventEvent(event);
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

      const direction = delta > 0 ? 1 : -1;
      if (this.isHandoffActive()) {
        this.preventEvent(event);
        return;
      }

      if (this.captureIfCrossing(delta, direction)) {
        this.preventEvent(event);
      }
    },

    onTouchEnd() {
      this.touchDeltaY = 0;
      this.touchConsumed = false;
    },

    onKeyDown(event) {
      if (!this.enabled) return;

      if (this.mode === "locked" && (event.key === "Home" || event.key === "End")) {
        this.preventEvent(event);
        const targetY = event.key === "Home" ? 0 : this.maxScrollY();
        this.mode = "free";
        this.activeScene = null;
        this.releasedScene = null;
        this.handoffDirection = 0;
        this.instantScrollTo(targetY);
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
        this.preventEvent(event);

        const now = performance.now();
        if (now - this.coolAt < COOL_MS) return;

        this.coolAt = now;
        this.moveStep(direction);
        return;
      }

      if (this.isHandoffActive()) {
        this.preventEvent(event);
        return;
      }

      if (this.captureIfCrossing(direction * Math.round(this.viewportHeight() * 0.85), direction)) {
        this.preventEvent(event);
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
        /* Pin du scroll pendant le lock (remplace le body position:fixed).
           Les inputs sont déjà preventDefault ; ne restent que les résidus
           d'inertie du smooth-scroll navigateur et les sauts programmatiques. */
        const scene = this.sceneByKey(this.activeScene);
        if (!scene?.ref?.current) return;

        const y = window.scrollY || 0;
        const top = this.sceneTop(scene);
        const end = top + Math.max(0, this.sceneHeight(scene) - this.viewportHeight());
        const pinned = clamp(y, top, end);

        /* Saut programmatique (ancre, navigation...) très loin de la zone :
           on libère la scène au lieu de se battre contre ce scroll. */
        if (Math.abs(y - pinned) > this.viewportHeight() / 2) {
          this.mode = "free";
          this.activeScene = null;
          this.handoffDirection = 0;
          return;
        }

        /* Pin DUR sur frozenY, qui reste constant pendant tout le lock. Ne
           plus laisser Y dériver dans la bande : les wheel events
           cancelable:false (séquence continue Chrome/Edge) et l'inertie du
           smooth-scroll le faisaient camper au bord, où chaque pixel de
           dépassement est peint par le compositeur avant le snap-back
           (sautillement) et où un gros delta franchissait l'échappatoire
           ci-dessus (sortie avant la dernière étape). Le recalage dans la
           bande est invisible : le stage sticky y affiche le même écran. */
        this.frozenY = clamp(this.frozenY, top, end);
        if (Math.abs(y - this.frozenY) > 1) this.instantScrollTo(this.frozenY);
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

export default function useClaudeStepScene({ sceneKey, sectionRef, steps, softCapture = false }) {
  const [snapshot, setSnapshot] = useState(() => createSnapshot(0, steps, true));

  useEffect(() => {
    if (typeof window === "undefined" || !sceneKey || !sectionRef?.current || steps < 2) {
      return undefined;
    }

    const sceneEngine = getEngine();
    const unregister = sceneEngine.registerScene({ key: sceneKey, ref: sectionRef, steps, softCapture });
    const unsubscribe = sceneEngine.subscribe(sceneKey, setSnapshot);

    setSnapshot(sceneEngine.getSnapshot(sceneKey, steps));

    return () => {
      unsubscribe();
      unregister();
    };
  }, [sceneKey, sectionRef, steps, softCapture]);

  return snapshot;
}
