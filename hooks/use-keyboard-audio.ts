"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const ASSET_BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const SOUND_KEY = "kevin-shell:sound";

export function useKeyboardAudio() {
  const contextRef = useRef<AudioContext | null>(null);
  const pressBufferRef = useRef<AudioBuffer | null>(null);
  const releaseBufferRef = useRef<AudioBuffer | null>(null);
  const loadingRef = useRef<Promise<AudioContext | null> | null>(null);
  const [enabled, setEnabledState] = useState(() => {
    if (typeof window === "undefined") return true;
    try {
      return localStorage.getItem(SOUND_KEY) !== "off";
    } catch {
      return true;
    }
  });

  const ensureAudio = useCallback(async () => {
    if (contextRef.current) {
      if (contextRef.current.state === "suspended") {
        await contextRef.current.resume();
      }
      return contextRef.current;
    }
    if (loadingRef.current) return loadingRef.current;

    loadingRef.current = (async () => {
      try {
        const context = new AudioContext();
        contextRef.current = context;
        const [pressResponse, releaseResponse] = await Promise.all([
          fetch(`${ASSET_BASE_PATH}/assets/keycap-sounds/press.mp3`),
          fetch(`${ASSET_BASE_PATH}/assets/keycap-sounds/release.mp3`),
        ]);
        const [pressBytes, releaseBytes] = await Promise.all([
          pressResponse.arrayBuffer(),
          releaseResponse.arrayBuffer(),
        ]);
        const [press, release] = await Promise.all([
          context.decodeAudioData(pressBytes),
          context.decodeAudioData(releaseBytes),
        ]);
        pressBufferRef.current = press;
        releaseBufferRef.current = release;
        return context;
      } catch {
        return null;
      }
    })();
    return loadingRef.current;
  }, []);

  useEffect(() => {
    return () => {
      void contextRef.current?.close();
      contextRef.current = null;
      loadingRef.current = null;
    };
  }, []);

  const playBuffer = useCallback(
    async (kind: "press" | "release", volume = 0.16) => {
      if (!enabled) return;
      try {
        const context = await ensureAudio();
        if (!context) return;
        const buffer =
          kind === "press" ? pressBufferRef.current : releaseBufferRef.current;
        if (!buffer) return;
        const source = context.createBufferSource();
        const gain = context.createGain();
        source.buffer = buffer;
        source.detune.value = Math.random() * 80 - 40;
        gain.gain.value = volume;
        source.connect(gain).connect(context.destination);
        source.start();
      } catch {
        // Sound failure must not affect commands.
      }
    },
    [enabled, ensureAudio],
  );

  const playTone = useCallback(
    async (frequency: number, duration: number, volume = 0.035) => {
      if (!enabled) return;
      try {
        const context = await ensureAudio();
        if (!context) return;
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(frequency, context.currentTime);
        gain.gain.setValueAtTime(volume, context.currentTime);
        gain.gain.exponentialRampToValueAtTime(
          0.0001,
          context.currentTime + duration,
        );
        oscillator.connect(gain).connect(context.destination);
        oscillator.start();
        oscillator.stop(context.currentTime + duration);
      } catch {
        // Sound failure must not affect commands.
      }
    },
    [enabled, ensureAudio],
  );

  const setEnabled = useCallback((next: boolean) => {
    setEnabledState(next);
    try {
      localStorage.setItem(SOUND_KEY, next ? "on" : "off");
    } catch {
      // Ignore storage errors.
    }
  }, []);

  return {
    enabled,
    setEnabled,
    playPress: () => void playBuffer("press"),
    playRelease: () => void playBuffer("release", 0.1),
    playExecute: () => void playTone(620, 0.18),
    playComplete: () => void playTone(880, 0.24, 0.028),
    playError: () => void playTone(150, 0.3, 0.035),
  };
}
