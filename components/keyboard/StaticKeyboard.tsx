"use client";

import { commandRegistry } from "@/data/portfolio";

type StaticKeyboardProps = {
  activeCommand: string;
  onCommand: (command: string) => void;
  compact?: boolean;
};

export function StaticKeyboard({
  activeCommand,
  onCommand,
  compact = false,
}: StaticKeyboardProps) {
  const commands = compact ? commandRegistry.slice(0, 6) : commandRegistry;
  const compactLabels: Record<string, string> = {
    whoami: "WHO",
    experience: "EXP",
    projects: "WORK",
    skills: "SKILL",
    eval: "EVAL",
    loop: "LOOP",
  };
  return (
    <div
      className={`static-keyboard ${compact ? "static-keyboard-compact" : ""}`}
      aria-label="简历命令键盘"
    >
      <div className="static-keyboard-deck">
        {commands.map((command) => (
          <button
            type="button"
            key={command.id}
            className={activeCommand === command.command ? "active" : ""}
            onClick={() => onCommand(command.command)}
          >
            <span>{command.functionKey}</span>
            <strong>
              {compact ? compactLabels[command.command] : command.label}
            </strong>
          </button>
        ))}
      </div>
      {!compact ? (
        <div className="static-keyboard-spacebar">
          <span>KEVIN SHELL</span>
        </div>
      ) : null}
    </div>
  );
}
