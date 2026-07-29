"use client";

import {
  Command,
  Download,
  HelpCircle,
  SkipForward,
  Volume2,
  VolumeX,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import {
  type FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { KeyboardScene } from "@/components/keyboard/KeyboardScene";
import { KeyboardSceneBoundary } from "@/components/keyboard/KeyboardSceneBoundary";
import { StaticKeyboard } from "@/components/keyboard/StaticKeyboard";
import { PrintableResume } from "@/components/portfolio/PrintableResume";
import { ShellContent } from "@/components/portfolio/ShellContent";
import {
  capabilities,
  commandRegistry,
  experiences,
  profile,
} from "@/data/portfolio";
import {
  CHARACTER_KEY_OBJECTS,
  COMMAND_KEY_OBJECTS,
  normalizeKeyObjectName,
} from "@/components/keyboard/keyboard-config";
import { useCommandEngine } from "@/hooks/use-command-engine";
import { useKeyboardAudio } from "@/hooks/use-keyboard-audio";
import { useKeyboardTypingSequence } from "@/hooks/use-keyboard-typing-sequence";
import { usePerformanceProfile } from "@/hooks/use-performance-profile";
import type {
  CapabilityEvidence,
  KeyboardSceneController,
} from "@/types/portfolio";

const BOOT_KEY = "kevin-shell:booted";
const VISUAL_KEY_FALLBACKS = Object.values(COMMAND_KEY_OBJECTS);
const bootLines = [
  "identity loaded",
  "experience loaded",
  "projects loaded",
  "agent skills loaded",
  "evaluation modules loaded",
];

export function PortfolioStage() {
  const performance = usePerformanceProfile();
  const audio = useKeyboardAudio();
  const audioRef = useRef(audio);
  const { state, execute, bootComplete } = useCommandEngine(
    performance.reducedMotion,
  );
  const keyboardRef = useRef<KeyboardSceneController>(null);
  const autoplayRef = useRef<AbortController | null>(null);
  const introRef = useRef<AbortController | null>(null);
  const { play: playTyping, cancel: cancelTyping } =
    useKeyboardTypingSequence();
  const [input, setInput] = useState("");
  const [isComposing, setIsComposing] = useState(false);
  const [bootProgress, setBootProgress] = useState(0);
  const [skipBootVisible, setSkipBootVisible] = useState(true);
  const [bootTyping, setBootTyping] = useState(false);
  const [splineReady, setSplineReady] = useState(false);
  const [splineFailed, setSplineFailed] = useState(false);
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const [autoplay, setAutoplay] = useState(false);

  useEffect(() => {
    audioRef.current = audio;
  }, [audio]);

  const typeCommand = useCallback(
    (command: string, signal: AbortSignal, intervalMs = 72) =>
      playTyping({
        text: command,
        signal,
        intervalMs,
        onInput: setInput,
        onPress: (character, index) => {
          const preferred =
            CHARACTER_KEY_OBJECTS[character] ??
            VISUAL_KEY_FALLBACKS[index % VISUAL_KEY_FALLBACKS.length];
          let pressedKey = preferred;
          if (!keyboardRef.current?.pressKey(preferred)) {
            pressedKey =
              VISUAL_KEY_FALLBACKS[index % VISUAL_KEY_FALLBACKS.length];
            keyboardRef.current?.pressKey(pressedKey);
          }
          audioRef.current.playPress();
          return pressedKey;
        },
        onRelease: (keyObjectName) => {
          keyboardRef.current?.releaseKey(keyObjectName);
          audioRef.current.playRelease();
        },
      }),
    [playTyping],
  );

  useEffect(() => {
    if (!performance.ready) return;
    let alreadyBooted = false;
    try {
      alreadyBooted = sessionStorage.getItem(BOOT_KEY) === "yes";
    } catch {
      // Session storage is optional.
    }
    if (alreadyBooted || performance.reducedMotion) {
      const immediateBoot = window.setTimeout(() => {
        setBootProgress(bootLines.length);
        setSkipBootVisible(false);
        bootComplete();
      }, 0);
      return () => window.clearTimeout(immediateBoot);
    }

    const controller = new AbortController();
    introRef.current = controller;
    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        const timer = window.setTimeout(resolve, ms);
        controller.signal.addEventListener(
          "abort",
          () => {
            window.clearTimeout(timer);
            resolve();
          },
          { once: true },
        );
      });

    void (async () => {
      for (let index = 0; index < bootLines.length; index += 1) {
        await wait(310);
        if (controller.signal.aborted) return;
        setBootProgress(index + 1);
      }
      await wait(520);
      if (controller.signal.aborted) return;
      setBootTyping(true);
      const typed = await typeCommand("whoami", controller.signal, 185);
      if (!typed || controller.signal.aborted) return;
      keyboardRef.current?.pressKey(COMMAND_KEY_OBJECTS.whoami);
      audioRef.current.playExecute();
      await wait(110);
      keyboardRef.current?.releaseKey(COMMAND_KEY_OBJECTS.whoami);
      const result = await execute("whoami");
      if (!result.ok || controller.signal.aborted) return;
      audioRef.current.playComplete();
      setInput("");
      setBootTyping(false);
      setSkipBootVisible(false);
      try {
        sessionStorage.setItem(BOOT_KEY, "yes");
      } catch {
        // Session storage is optional.
      }
    })();

    return () => {
      controller.abort();
      cancelTyping();
      if (introRef.current === controller) introRef.current = null;
    };
  }, [
    bootComplete,
    cancelTyping,
    execute,
    performance.ready,
    performance.reducedMotion,
    typeCommand,
  ]);

  useEffect(() => {
    keyboardRef.current?.setSceneMode(state.module);
    const definition = commandRegistry.find(
      (item) => item.command === state.activeCommand,
    );
    if (definition) {
      keyboardRef.current?.highlightKeys([definition.keyObjectName]);
    } else {
      keyboardRef.current?.clearHighlights();
    }
  }, [state.activeCommand, state.module]);

  const runCommand = useCallback(
    async (rawCommand: string, userInitiated = true) => {
      if (userInitiated) {
        introRef.current?.abort();
        autoplayRef.current?.abort();
        autoplayRef.current = null;
        cancelTyping();
        setBootTyping(false);
        setAutoplay(false);
      }

      const normalized = rawCommand.trim().toLowerCase();
      if (!normalized) return;
      const definition = commandRegistry.find(
        (item) =>
          item.command === normalized ||
          item.aliases.includes(normalized) ||
          normalized.startsWith(`${item.command} `) ||
          (item.command === "projects" && normalized.startsWith("project ")),
      );
      if (definition) {
        keyboardRef.current?.pressKey(definition.keyObjectName);
        window.setTimeout(
          () => keyboardRef.current?.releaseKey(definition.keyObjectName),
          120,
        );
      }
      audio.playPress();
      audio.playExecute();

      if (normalized === "demo") {
        const controller = new AbortController();
        autoplayRef.current = controller;
        setAutoplay(true);
        const sequence = [
          "whoami",
          "experience --open meituan",
          "project radar-eval",
          "skills",
          "eval",
          "loop",
          "contact",
        ];
        try {
          for (const command of sequence) {
            if (controller.signal.aborted) break;
            const typed = await typeCommand(
              command,
              controller.signal,
              performance.reducedMotion ? 0 : 58,
            );
            if (!typed || controller.signal.aborted) break;
            const definition = commandRegistry.find(
              (item) =>
                item.command === command ||
                command.startsWith(`${item.command} `) ||
                (item.command === "projects" && command.startsWith("project ")),
            );
            if (definition) {
              keyboardRef.current?.pressKey(definition.keyObjectName);
              window.setTimeout(
                () =>
                  keyboardRef.current?.releaseKey(definition.keyObjectName),
                90,
              );
            }
            audio.playExecute();
            const result = await execute(command);
            if (result.ok) audio.playComplete();
            setInput("");
            await new Promise<void>((resolve) => {
              const timer = window.setTimeout(
                resolve,
                performance.reducedMotion ? 350 : 3600,
              );
              controller.signal.addEventListener(
                "abort",
                () => {
                  window.clearTimeout(timer);
                  resolve();
                },
                { once: true },
              );
            });
          }
        } finally {
          if (!controller.signal.aborted) setInput("");
          setAutoplay(false);
          if (autoplayRef.current === controller) autoplayRef.current = null;
        }
        return;
      }

      const result = await execute(normalized);
      if (result.ok) {
        audio.playComplete();
        if (normalized === "resume" || normalized === "pdf") {
          window.setTimeout(() => window.print(), 220);
        }
      } else if (!("aborted" in result)) {
        audio.playError();
      }
      setInput("");
    },
    [audio, cancelTyping, execute, performance.reducedMotion, typeCommand],
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      const isEditable =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable;
      if (isEditable || event.isComposing) return;

      const command = commandRegistry.find(
        (item) => item.physicalKey === event.key,
      );
      if (command) {
        event.preventDefault();
        void runCommand(command.command);
        return;
      }
      if (event.key === "Escape") {
        event.preventDefault();
        void runCommand("home");
        return;
      }
      if (
        state.module === "experience" &&
        ["1", "2", "3", "4"].includes(event.key)
      ) {
        event.preventDefault();
        const experience = experiences[Number(event.key) - 1];
        if (experience) {
          void runCommand(`experience --open ${experience.id}`);
        }
      }
    };
    const onKeyUp = (event: KeyboardEvent) => {
      const command = commandRegistry.find(
        (item) => item.physicalKey === event.key,
      );
      if (command) {
        keyboardRef.current?.releaseKey(command.keyObjectName);
        audio.playRelease();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [audio, runCommand, state.module]);

  const handleCapabilityHighlight = useCallback(
    (capability: CapabilityEvidence | null) => {
      if (!capability) {
        keyboardRef.current?.clearHighlights();
        return;
      }
      keyboardRef.current?.highlightKeys([capability.keyObjectName]);
    },
    [],
  );

  const keyObjectToCommand = useCallback(
    (objectName: string) =>
      commandRegistry.find(
        (item) => item.keyObjectName === normalizeKeyObjectName(objectName),
      ),
    [],
  );

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isComposing) void runCommand(input);
  };

  const skipBoot = () => {
    introRef.current?.abort();
    cancelTyping();
    try {
      sessionStorage.setItem(BOOT_KEY, "yes");
    } catch {
      // Session storage is optional.
    }
    setBootProgress(bootLines.length);
    setBootTyping(false);
    setInput("");
    setSkipBootVisible(false);
    bootComplete();
  };

  const show3D =
    performance.ready &&
    !performance.disable3D &&
    !splineFailed;

  return (
    <main
      className="portfolio-stage"
      data-module={state.module}
      data-safe-mode={!show3D}
    >
      <div className="ambient-grid" />
      <div className="ambient-scanline" />

      <header className="portfolio-statusbar">
        <button
          type="button"
          className="shell-brand"
          onClick={() => void runCommand("home")}
        >
          <span>&gt;_</span>
          <div>
            <strong>KEVIN SHELL</strong>
            <small>INTERACTIVE RESUME OS</small>
          </div>
        </button>
        <div className="runtime-status">
          <span className={show3D && splineReady ? "online" : ""} />
          {show3D
            ? splineReady
              ? "3D RUNTIME ONLINE"
              : "LOADING 3D RUNTIME"
            : "SAFE MODE"}
        </div>
        <div className="status-actions">
          {autoplay ? (
            <button
              type="button"
              onClick={() => {
                autoplayRef.current?.abort();
                cancelTyping();
                setInput("");
                setAutoplay(false);
              }}
            >
              <SkipForward aria-hidden="true" />
              STOP
            </button>
          ) : (
            <button type="button" onClick={() => void runCommand("demo")}>
              <Command aria-hidden="true" />
              DEMO
            </button>
          )}
          <button
            type="button"
            className="icon-button"
            onClick={() => audio.setEnabled(!audio.enabled)}
            aria-label={audio.enabled ? "关闭声音" : "打开声音"}
            title={audio.enabled ? "关闭声音" : "打开声音"}
          >
            {audio.enabled ? <Volume2 /> : <VolumeX />}
          </button>
          <button
            type="button"
            className="icon-button"
            onClick={() => void runCommand("help")}
            aria-label="查看命令帮助"
            title="查看命令帮助"
          >
            <HelpCircle />
          </button>
          <button
            type="button"
            className="icon-button"
            onClick={() => window.print()}
            aria-label="导出 PDF"
            title="导出 PDF"
          >
            <Download />
          </button>
        </div>
      </header>

      <section className="shell-screen" aria-label="Kevin Shell 简历播放器">
        <div className="shell-window-header">
          <div className="window-dots" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <div className="shell-path">kevin@resume:~/{state.module}</div>
          <div className="shell-clock">SESSION 2026</div>
        </div>

        <div className="shell-output">
          <AnimatePresence mode="wait">
            {state.mode === "boot" ? (
              <motion.div
                key="boot"
                className="boot-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, filter: "blur(8px)" }}
              >
                <span className="terminal-label">KEVIN RESUME OS</span>
                <h1>Version 2.1.0</h1>
                <div className="boot-command">&gt; boot kevin</div>
                <div className="boot-lines">
                  {bootLines.map((line, index) => (
                    <motion.div
                      key={line}
                      initial={{ opacity: 0, x: -8 }}
                      animate={
                        bootProgress > index
                          ? { opacity: 1, x: 0 }
                          : { opacity: 0, x: -8 }
                      }
                    >
                      <span>[✓]</span>
                      {line}
                    </motion.div>
                  ))}
                </div>
                <div className="boot-ready">
                  {bootProgress >= bootLines.length
                    ? bootTyping
                      ? "System ready. Typing first command..."
                      : "System ready."
                    : "Loading local modules..."}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="content"
                className="shell-content-mount"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <ShellContent
                  mode={state.mode}
                  module={state.module}
                  selectedExperience={state.selectedExperience}
                  selectedProject={state.selectedProject}
                  error={state.error}
                  suggestion={state.suggestion}
                  reducedMotion={performance.reducedMotion}
                  onExecute={(command) => void runCommand(command)}
                  onHighlightCapability={handleCapabilityHighlight}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {state.mode !== "boot" || bootTyping ? (
          <form className="shell-prompt" onSubmit={submit}>
            <label htmlFor="command-input">
              <span>kevin@resume</span>:<strong>~</strong>$
            </label>
            <input
              id="command-input"
              value={input}
              onChange={(event) => {
                introRef.current?.abort();
                autoplayRef.current?.abort();
                cancelTyping();
                setAutoplay(false);
                if (state.mode === "boot") bootComplete();
                setBootTyping(false);
                setInput(event.target.value);
              }}
              onCompositionStart={() => setIsComposing(true)}
              onCompositionEnd={() => setIsComposing(false)}
              autoComplete="off"
              spellCheck={false}
              placeholder="输入 help，或点击下方命令键..."
              aria-label="输入简历命令"
            />
            <button type="submit">ENTER</button>
          </form>
        ) : null}

        {skipBootVisible && state.mode === "boot" ? (
          <button type="button" className="skip-boot" onClick={skipBoot}>
            跳过启动
            <SkipForward aria-hidden="true" />
          </button>
        ) : null}
      </section>

      <section className="keyboard-zone" aria-label="3D 简历命令键盘">
        <div className="keyboard-zone-glow" />
        {show3D ? (
          <KeyboardSceneBoundary
            onError={() => {
              setSplineFailed(true);
              setSplineReady(false);
            }}
            fallback={
              <StaticKeyboard
                activeCommand={state.activeCommand}
                onCommand={(command) => void runCommand(command)}
              />
            }
          >
            <KeyboardScene
              ref={keyboardRef}
              maxDpr={performance.maxDpr}
              mode={state.module}
              onReady={() => setSplineReady(true)}
              onFailure={() => {
                setSplineFailed(true);
                setSplineReady(false);
              }}
              onKeyPress={(objectName) => {
                audio.playPress();
                const command = keyObjectToCommand(objectName);
                if (command) void runCommand(command.command);
              }}
              onKeyRelease={() => audio.playRelease()}
              onKeyHover={(objectName) => {
                const command = objectName
                  ? keyObjectToCommand(objectName)
                  : undefined;
                const normalizedName = objectName
                  ? normalizeKeyObjectName(objectName)
                  : null;
                const capability = normalizedName
                  ? capabilities.find(
                      (item) => item.keyObjectName === normalizedName,
                    )
                  : undefined;
                setHoveredKey(
                  command
                    ? `${command.functionKey} / ${command.label} — ${command.description}`
                    : capability
                      ? `${capability.label} — ${capability.description}`
                      : null,
                );
              }}
            />
          </KeyboardSceneBoundary>
        ) : (
          <StaticKeyboard
            compact={performance.isMobile}
            activeCommand={state.activeCommand}
            onCommand={(command) => void runCommand(command)}
          />
        )}

        <div className="keyboard-caption">
          <span>{hoveredKey ?? "PRESS A HIGHLIGHTED KEY OR TYPE A COMMAND"}</span>
          <strong>
            {show3D ? "SPLINE INPUT DEVICE" : "HTML SAFE MODE"}
          </strong>
        </div>
      </section>

      {!show3D || state.module === "help" ? (
        <nav className="command-dock" aria-label="快捷命令">
          {commandRegistry.slice(0, 7).map((command) => (
            <button
              type="button"
              key={command.id}
              className={state.activeCommand === command.command ? "active" : ""}
              onClick={() => void runCommand(command.command)}
            >
              <span>{command.functionKey}</span>
              {command.label}
            </button>
          ))}
        </nav>
      ) : null}

      <div className="stage-corner-data" aria-hidden="true">
        <span>BUILD KEVIN-SHELL 2.1</span>
        <span>SESSION 2026</span>
      </div>

      <a className="screen-reader-contact" href={`mailto:${profile.email}`}>
        联系杨泽存
      </a>
      <PrintableResume />
    </main>
  );
}
