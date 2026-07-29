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
import { StaticKeyboard } from "@/components/keyboard/StaticKeyboard";
import { PrintableResume } from "@/components/portfolio/PrintableResume";
import { ShellContent } from "@/components/portfolio/ShellContent";
import {
  capabilities,
  commandRegistry,
  experiences,
  profile,
} from "@/data/portfolio";
import { useCommandEngine } from "@/hooks/use-command-engine";
import { useKeyboardAudio } from "@/hooks/use-keyboard-audio";
import { usePerformanceProfile } from "@/hooks/use-performance-profile";
import type {
  CapabilityEvidence,
  KeyboardSceneController,
} from "@/types/portfolio";

const BOOT_KEY = "kevin-shell:booted";
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
  const { state, execute, bootComplete } = useCommandEngine(
    performance.reducedMotion,
  );
  const keyboardRef = useRef<KeyboardSceneController>(null);
  const autoplayRef = useRef<AbortController | null>(null);
  const [input, setInput] = useState("");
  const [isComposing, setIsComposing] = useState(false);
  const [bootProgress, setBootProgress] = useState(0);
  const [skipBootVisible, setSkipBootVisible] = useState(true);
  const [splineReady, setSplineReady] = useState(false);
  const [splineFailed, setSplineFailed] = useState(false);
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const [autoplay, setAutoplay] = useState(false);

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

    let index = 0;
    const timer = window.setInterval(() => {
      index += 1;
      setBootProgress(index);
      if (index >= bootLines.length) {
        window.clearInterval(timer);
        window.setTimeout(() => {
          try {
            sessionStorage.setItem(BOOT_KEY, "yes");
          } catch {
            // Session storage is optional.
          }
          setSkipBootVisible(false);
          bootComplete();
        }, 520);
      }
    }, 260);
    return () => window.clearInterval(timer);
  }, [bootComplete, performance.ready, performance.reducedMotion]);

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
        autoplayRef.current?.abort();
        autoplayRef.current = null;
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
          "loop",
          "contact",
        ];
        for (const command of sequence) {
          if (controller.signal.aborted) break;
          await execute(command);
          audio.playComplete();
          await new Promise<void>((resolve) => {
            const timer = window.setTimeout(
              resolve,
              performance.reducedMotion ? 500 : 5200,
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
        setAutoplay(false);
        autoplayRef.current = null;
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
    [audio, execute, performance.reducedMotion],
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
      commandRegistry.find((item) => item.keyObjectName === objectName),
    [],
  );

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isComposing) void runCommand(input);
  };

  const skipBoot = () => {
    try {
      sessionStorage.setItem(BOOT_KEY, "yes");
    } catch {
      // Session storage is optional.
    }
    setBootProgress(bootLines.length);
    setSkipBootVisible(false);
    bootComplete();
  };

  const show3D =
    performance.ready &&
    !performance.disable3D &&
    !splineFailed;

  return (
    <main className="portfolio-stage" data-module={state.module}>
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
                setAutoplay(false);
              }}
            >
              <SkipForward aria-hidden="true" />
              停止演示
            </button>
          ) : (
            <button type="button" onClick={() => void runCommand("demo")}>
              <Command aria-hidden="true" />
              自动演示
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
                <h1>Version 2.0.0</h1>
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
                    ? "System ready. Executing whoami..."
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

        {state.mode !== "boot" ? (
          <form className="shell-prompt" onSubmit={submit}>
            <label htmlFor="command-input">
              <span>kevin@resume</span>:<strong>~</strong>$
            </label>
            <input
              id="command-input"
              value={input}
              onChange={(event) => setInput(event.target.value)}
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
              const capability = objectName
                ? capabilities.find(
                    (item) => item.keyObjectName === objectName,
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

      <div className="stage-corner-data" aria-hidden="true">
        <span>LAT 39.9042</span>
        <span>LON 116.4074</span>
        <span>BUILD KEVIN-SHELL 2.0</span>
      </div>

      <a className="screen-reader-contact" href={`mailto:${profile.email}`}>
        联系杨泽存
      </a>
      <PrintableResume />
    </main>
  );
}
