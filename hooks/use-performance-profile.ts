"use client";

import { useEffect, useMemo, useState } from "react";

export type PerformanceProfile = {
  ready: boolean;
  isMobile: boolean;
  reducedMotion: boolean;
  saveData: boolean;
  disable3D: boolean;
  maxDpr: number;
};

function detectSaveData() {
  if (typeof navigator === "undefined") return false;
  return (
    (
      navigator as Navigator & {
        connection?: { saveData?: boolean };
      }
    ).connection?.saveData ?? false
  );
}

export function usePerformanceProfile(): PerformanceProfile {
  const [state, setState] = useState({
    ready: false,
    isMobile: false,
    reducedMotion: false,
    saveData: false,
  });

  useEffect(() => {
    const mobile = window.matchMedia("(max-width: 760px)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () =>
      setState({
        ready: true,
        isMobile: mobile.matches,
        reducedMotion: reduced.matches,
        saveData: detectSaveData(),
      });
    update();
    mobile.addEventListener("change", update);
    reduced.addEventListener("change", update);
    return () => {
      mobile.removeEventListener("change", update);
      reduced.removeEventListener("change", update);
    };
  }, []);

  return useMemo(
    () => ({
      ...state,
      disable3D: state.isMobile || state.reducedMotion || state.saveData,
      maxDpr: state.isMobile ? 1.25 : 1.75,
    }),
    [state],
  );
}
