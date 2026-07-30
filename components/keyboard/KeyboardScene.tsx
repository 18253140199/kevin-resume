"use client";

import type { Application, SPEObject, SplineEvent } from "@splinetool/runtime";
import gsap from "gsap";
import React, {
  Suspense,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import {
  KEYBOARD_MODES,
  LEGACY_KEY_OBJECTS,
} from "@/components/keyboard/keyboard-config";
import type {
  KeyboardSceneController,
  PortfolioModule,
} from "@/types/portfolio";

const Spline = React.lazy(() => import("@splinetool/react-spline"));
const ASSET_BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

type SplineObjectWithParent = SPEObject & {
  parentUuid?: string;
};

type SplineHoverEvent = {
  entered?: boolean;
  actions?: {
    Transition?: unknown[];
  };
  dispatchEnter?: () => void;
  dispatchLeave?: () => void;
  dispatchUserEvent?: (reverse?: boolean) => void;
};

type KeyboardSceneProps = {
  maxDpr: number;
  mode: PortfolioModule;
  onKeyPress: (objectName: string) => void;
  onKeyRelease: (objectName: string) => void;
  onKeyHover: (objectName: string | null) => void;
  onReady: () => void;
  onFailure: () => void;
};

function capSplinePixelRatio(app: Application, maxDpr: number) {
  const apply = () => {
    try {
      const renderer = (
        app as unknown as {
          _renderer?: { setPixelRatio?: (value: number) => void };
        }
      )._renderer;
      renderer?.setPixelRatio?.(Math.min(window.devicePixelRatio, maxDpr));
    } catch {
      // Spline internal renderer may change; rendering still works without a cap.
    }
  };
  apply();
  window.addEventListener("resize", apply, { passive: true });
  return () => window.removeEventListener("resize", apply);
}

function disableSplineHoverTransitions(
  app: Application,
  keyObjectIds: Iterable<string>,
) {
  const eventsPerObject = (
    app.eventManager?.handlers?.MouseHover as
      | { eventsPerObjects?: Record<string, SplineHoverEvent[]> }
      | undefined
  )?.eventsPerObjects;
  if (!eventsPerObject) return;

  for (const objectId of keyObjectIds) {
    for (const event of eventsPerObject[objectId] ?? []) {
      if (Array.isArray(event.actions?.Transition)) {
        event.actions.Transition.length = 0;
      }
      event.dispatchEnter = () => {
        event.entered = true;
      };
      event.dispatchLeave = () => {
        event.entered = false;
      };
      event.dispatchUserEvent = () => {};
    }
  }
}

export const KeyboardScene = forwardRef<
  KeyboardSceneController,
  KeyboardSceneProps
>(function KeyboardScene(
  {
    maxDpr,
    mode,
    onKeyPress,
    onKeyRelease,
    onKeyHover,
    onReady,
    onFailure,
  },
  forwardedRef,
) {
  const [app, setApp] = useState<Application | null>(null);
  const baselinesRef = useRef(new Map<string, number>());
  const objectByIdRef = useRef(new Map<string, SplineObjectWithParent>());
  const pointerKeyObjectsRef = useRef(
    new Map<string, SplineObjectWithParent>(),
  );
  const animatedKeyPartsRef = useRef(new Map<string, SPEObject[]>());
  const hoveredKeyRef = useRef<SplineObjectWithParent | null>(null);
  const pressedPointerKeyRef = useRef<SplineObjectWithParent | null>(null);
  const hoverFrameRef = useRef<number | null>(null);
  const highlightTweensRef = useRef<gsap.core.Tween[]>([]);

  const getObject = useCallback(
    (objectName: string) => {
      const direct = app?.findObjectByName(objectName);
      if (direct) return direct;
      for (const legacyName of LEGACY_KEY_OBJECTS[objectName] ?? []) {
        const legacyObject = app?.findObjectByName(legacyName);
        if (legacyObject) return legacyObject;
      }
      return undefined;
    },
    [app],
  );

  const getBaseline = useCallback((object: SPEObject) => {
    if (!baselinesRef.current.has(object.uuid)) {
      baselinesRef.current.set(object.uuid, object.position.y);
    }
    return baselinesRef.current.get(object.uuid) ?? object.position.y;
  }, []);

  const getAnimatedKeyParts = useCallback(
    (object: SPEObject) =>
      animatedKeyPartsRef.current.get(object.uuid) ?? [object],
    [],
  );

  const animateKeyDown = useCallback(
    (object: SPEObject) => {
      getAnimatedKeyParts(object).forEach((part) => {
        const baseline = getBaseline(part);
        gsap.killTweensOf(part.position);
        gsap.to(part.position, {
          y: baseline - 22,
          duration: 0.08,
          ease: "power2.out",
        });
      });
    },
    [getAnimatedKeyParts, getBaseline],
  );

  const animateKeyUp = useCallback(
    (object: SPEObject) => {
      getAnimatedKeyParts(object).forEach((part) => {
        const baseline = getBaseline(part);
        gsap.killTweensOf(part.position);
        gsap.to(part.position, {
          y: baseline,
          duration: 0.24,
          ease: "power2.out",
        });
      });
    },
    [getAnimatedKeyParts, getBaseline],
  );

  const pressKey = useCallback(
    (objectName: string) => {
      const object = getObject(objectName);
      if (!object) return false;
      animateKeyDown(object);
      return true;
    },
    [animateKeyDown, getObject],
  );

  const releaseKey = useCallback(
    (objectName: string) => {
      const object = getObject(objectName);
      if (!object) return false;
      animateKeyUp(object);
      return true;
    },
    [animateKeyUp, getObject],
  );

  const clearHighlights = useCallback(() => {
    highlightTweensRef.current.forEach((tween) => tween.kill());
    highlightTweensRef.current = [];
  }, []);

  const highlightKeys = useCallback(
    (objectNames: string[]) => {
      clearHighlights();
      objectNames.forEach((objectName, index) => {
        const object = getObject(objectName);
        if (!object) return;
        getAnimatedKeyParts(object).forEach((part) => {
          const baseline = getBaseline(part);
          highlightTweensRef.current.push(
            gsap.fromTo(
              part.position,
              { y: baseline },
              {
                y: baseline + 18,
                duration: 0.55,
                delay: index * 0.06,
                repeat: 3,
                yoyo: true,
                ease: "sine.inOut",
              },
            ),
          );
        });
      });
    },
    [clearHighlights, getAnimatedKeyParts, getBaseline, getObject],
  );

  const resolvePointerKey = useCallback((event: SplineEvent) => {
    let object =
      objectByIdRef.current.get(event.target.id) ??
      pointerKeyObjectsRef.current.get(event.target.id);

    while (object) {
      const pointerKey = pointerKeyObjectsRef.current.get(object.uuid);
      if (pointerKey) return pointerKey;
      object = object.parentUuid
        ? objectByIdRef.current.get(object.parentUuid)
        : undefined;
    }
    return undefined;
  }, []);

  const resetPointerKeys = useCallback(
    (activeObject: SplineObjectWithParent | null) => {
      pointerKeyObjectsRef.current.forEach((object) => {
        if (object.uuid === activeObject?.uuid) {
          animateKeyDown(object);
        } else {
          animateKeyUp(object);
        }
      });
    },
    [animateKeyDown, animateKeyUp],
  );

  const setHoveredPointerKey = useCallback(
    (object: SplineObjectWithParent | null) => {
      hoveredKeyRef.current = object;
      if (hoverFrameRef.current !== null) {
        window.cancelAnimationFrame(hoverFrameRef.current);
      }

      // Spline's copied keycap states share child names. Reset after its own
      // hover transition, then animate the exact key identified by UUID.
      hoverFrameRef.current = window.requestAnimationFrame(() => {
        resetPointerKeys(object);
        hoverFrameRef.current = null;
      });
    },
    [resetPointerKeys],
  );

  const setSceneMode = useCallback(
    (nextMode: PortfolioModule) => {
      const keyboard = app?.findObjectByName("keyboard");
      if (!keyboard) return;
      const state = KEYBOARD_MODES[nextMode];
      gsap.to(keyboard.scale, {
        x: state.scale,
        y: state.scale,
        z: state.scale,
        duration: 0.9,
        ease: "power3.inOut",
      });
      gsap.to(keyboard.position, {
        ...state.position,
        duration: 0.9,
        ease: "power3.inOut",
      });
      gsap.to(keyboard.rotation, {
        ...state.rotation,
        duration: 1.05,
        ease: "power3.inOut",
      });
    },
    [app],
  );

  useImperativeHandle(
    forwardedRef,
    () => ({
      pressKey,
      releaseKey,
      highlightKeys,
      clearHighlights,
      setSceneMode,
    }),
    [clearHighlights, highlightKeys, pressKey, releaseKey, setSceneMode],
  );

  useEffect(() => {
    if (!app) return;
    setSceneMode(mode);
  }, [app, mode, setSceneMode]);

  useEffect(() => {
    if (!app) return;

    const handleHover = (event: SplineEvent) => {
      const object = resolvePointerKey(event);
      setHoveredPointerKey(object ?? null);
      onKeyHover(object?.name ?? null);
    };

    const handlePointerDown = () => {
      const object = hoveredKeyRef.current;
      if (!object) return;
      pressedPointerKeyRef.current = object;
      animateKeyDown(object);
      onKeyPress(object.name);
    };
    const handlePointerUp = () => {
      const object = pressedPointerKeyRef.current;
      if (!object) return;
      pressedPointerKeyRef.current = null;
      onKeyRelease(object.name);
      if (hoveredKeyRef.current?.uuid !== object.uuid) {
        animateKeyUp(object);
      }
    };
    const handlePointerLeave = () => {
      setHoveredPointerKey(null);
      onKeyHover(null);
    };

    app.addEventListener("mouseHover", handleHover);
    app.canvas.addEventListener("pointerdown", handlePointerDown);
    app.canvas.addEventListener("pointerleave", handlePointerLeave);
    window.addEventListener("pointerup", handlePointerUp);

    const cleanupDpr = capSplinePixelRatio(app, maxDpr);
    const handleVisibility = () => {
      if (document.hidden) app.stop();
      else app.play();
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      app.removeEventListener("mouseHover", handleHover);
      app.canvas.removeEventListener("pointerdown", handlePointerDown);
      app.canvas.removeEventListener("pointerleave", handlePointerLeave);
      window.removeEventListener("pointerup", handlePointerUp);
      document.removeEventListener("visibilitychange", handleVisibility);
      cleanupDpr();
      setHoveredPointerKey(null);
      if (hoverFrameRef.current !== null) {
        window.cancelAnimationFrame(hoverFrameRef.current);
        hoverFrameRef.current = null;
      }
      clearHighlights();
    };
  }, [
    app,
    animateKeyDown,
    animateKeyUp,
    clearHighlights,
    maxDpr,
    onKeyHover,
    onKeyPress,
    onKeyRelease,
    resolvePointerKey,
    setHoveredPointerKey,
  ]);

  return (
    <Suspense
      fallback={
        <div className="keyboard-loading" role="status">
          <span />
          Loading 3D input device...
        </div>
      }
    >
      <Spline
        className="spline-keyboard-canvas"
        scene={`${ASSET_BASE_PATH}/assets/skills-keyboard.splinecode`}
        onLoad={(loadedApp: Application) => {
          const allObjects =
            loadedApp.getAllObjects() as SplineObjectWithParent[];
          objectByIdRef.current = new Map(
            allObjects.map((object) => [object.uuid, object]),
          );
          const hoverEventIds = Object.keys(
            loadedApp.getSplineEvents().mouseHover ?? {},
          );
          pointerKeyObjectsRef.current = new Map(
            hoverEventIds
              .map((id) => [id, objectByIdRef.current.get(id)] as const)
              .filter(
                (
                  entry,
                ): entry is readonly [string, SplineObjectWithParent] =>
                  Boolean(
                    entry[1] &&
                      entry[1].name !== "body" &&
                      entry[1].name !== "platform",
                  ),
              ),
          );
          const childrenByParent = new Map<string, SPEObject[]>();
          allObjects.forEach((object) => {
            if (!object.parentUuid) return;
            const siblings = childrenByParent.get(object.parentUuid) ?? [];
            siblings.push(object);
            childrenByParent.set(object.parentUuid, siblings);
          });
          animatedKeyPartsRef.current = new Map(
            [...pointerKeyObjectsRef.current.values()].map((object) => [
              object.uuid,
              childrenByParent.get(object.uuid) ?? [object],
            ]),
          );
          disableSplineHoverTransitions(
            loadedApp,
            pointerKeyObjectsRef.current.keys(),
          );
          setApp(loadedApp);
          const keyboard = loadedApp.findObjectByName("keyboard");
          if (keyboard) {
            const state = KEYBOARD_MODES[mode];
            keyboard.scale.x = state.scale;
            keyboard.scale.y = state.scale;
            keyboard.scale.z = state.scale;
            keyboard.position.x = state.position.x;
            keyboard.position.y = state.position.y;
            keyboard.position.z = state.position.z;
            keyboard.rotation.x = state.rotation.x;
            keyboard.rotation.y = state.rotation.y;
            keyboard.rotation.z = state.rotation.z;
          }
          allObjects.forEach((object) => {
            if (object.name === "keycap" || object.name === "keycap-desktop") {
              object.visible = true;
            }
            if (object.name === "keycap-mobile") {
              object.visible = false;
            }
            if (object.name) {
              baselinesRef.current.set(object.uuid, object.position.y);
            }
          });
          onReady();
        }}
        onError={onFailure}
      />
    </Suspense>
  );
});
