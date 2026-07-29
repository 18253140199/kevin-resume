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

  const pressKey = useCallback(
    (objectName: string) => {
      const object = getObject(objectName);
      if (!object) return false;
      if (!baselinesRef.current.has(objectName)) {
        baselinesRef.current.set(objectName, object.position.y);
      }
      const baseline = baselinesRef.current.get(objectName) ?? object.position.y;
      gsap.killTweensOf(object.position);
      gsap.to(object.position, {
        y: baseline - 22,
        duration: 0.08,
        ease: "power2.out",
      });
      return true;
    },
    [getObject],
  );

  const releaseKey = useCallback(
    (objectName: string) => {
      const object = getObject(objectName);
      if (!object) return false;
      const baseline = baselinesRef.current.get(objectName) ?? object.position.y;
      gsap.killTweensOf(object.position);
      gsap.to(object.position, {
        y: baseline,
        duration: 0.32,
        ease: "elastic.out(1, 0.42)",
      });
      return true;
    },
    [getObject],
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
        if (!baselinesRef.current.has(objectName)) {
          baselinesRef.current.set(objectName, object.position.y);
        }
        const baseline =
          baselinesRef.current.get(objectName) ?? object.position.y;
        highlightTweensRef.current.push(
          gsap.fromTo(
            object.position,
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
    },
    [clearHighlights, getObject],
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

    const handleDown = (event: SplineEvent) => {
      pressKey(event.target.name);
      onKeyPress(event.target.name);
    };
    const handleUp = (event: SplineEvent) => {
      releaseKey(event.target.name);
      onKeyRelease(event.target.name);
    };
    const handleHover = (event: SplineEvent) => {
      const name = event.target.name;
      onKeyHover(name === "body" || name === "platform" ? null : name);
    };

    app.addEventListener("keyDown", handleDown);
    app.addEventListener("keyUp", handleUp);
    app.addEventListener("mouseHover", handleHover);

    const cleanupDpr = capSplinePixelRatio(app, maxDpr);
    const handleVisibility = () => {
      if (document.hidden) app.stop();
      else app.play();
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      app.removeEventListener("keyDown", handleDown);
      app.removeEventListener("keyUp", handleUp);
      app.removeEventListener("mouseHover", handleHover);
      document.removeEventListener("visibilitychange", handleVisibility);
      cleanupDpr();
      clearHighlights();
    };
  }, [
    app,
    clearHighlights,
    maxDpr,
    onKeyHover,
    onKeyPress,
    onKeyRelease,
    pressKey,
    releaseKey,
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
          loadedApp.getAllObjects().forEach((object: SPEObject) => {
            if (object.name === "keycap" || object.name === "keycap-desktop") {
              object.visible = true;
            }
            if (object.name === "keycap-mobile") {
              object.visible = false;
            }
            if (object.name) {
              baselinesRef.current.set(object.name, object.position.y);
            }
          });
          onReady();
        }}
        onError={onFailure}
      />
    </Suspense>
  );
});
