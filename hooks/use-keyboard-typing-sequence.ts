"use client";

import { useCallback, useEffect, useRef } from "react";

type TypingSequenceOptions = {
  text: string;
  intervalMs?: number;
  pressMs?: number;
  signal?: AbortSignal;
  onInput: (value: string) => void;
  onPress?: (character: string, index: number) => string | null;
  onRelease?: (keyObjectName: string) => void;
};

function wait(ms: number, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal.aborted) {
      reject(new DOMException("Aborted", "AbortError"));
      return;
    }
    const timer = window.setTimeout(resolve, ms);
    signal.addEventListener(
      "abort",
      () => {
        window.clearTimeout(timer);
        reject(new DOMException("Aborted", "AbortError"));
      },
      { once: true },
    );
  });
}

export function useKeyboardTypingSequence() {
  const controllerRef = useRef<AbortController | null>(null);

  const cancel = useCallback(() => {
    controllerRef.current?.abort();
    controllerRef.current = null;
  }, []);

  useEffect(() => cancel, [cancel]);

  const play = useCallback(
    async ({
      text,
      intervalMs = 72,
      pressMs = 54,
      signal,
      onInput,
      onPress,
      onRelease,
    }: TypingSequenceOptions) => {
      cancel();
      const controller = new AbortController();
      controllerRef.current = controller;
      const abortFromParent = () => controller.abort();
      signal?.addEventListener("abort", abortFromParent, { once: true });
      onInput("");

      try {
        for (let index = 0; index < text.length; index += 1) {
          const character = text[index];
          onInput(text.slice(0, index + 1));
          const visualKey = onPress?.(character, index) ?? null;
          await wait(pressMs, controller.signal);
          if (visualKey) onRelease?.(visualKey);
          await wait(intervalMs, controller.signal);
        }
        return true;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return false;
        }
        throw error;
      } finally {
        signal?.removeEventListener("abort", abortFromParent);
        if (controllerRef.current === controller) controllerRef.current = null;
      }
    },
    [cancel],
  );

  return { play, cancel };
}
