"use client";

import { useCallback, useEffect, useReducer, useRef } from "react";
import {
  commandLookup,
  commandRegistry,
  experiences,
  projects,
} from "@/data/portfolio";
import type {
  PortfolioMode,
  PortfolioModule,
} from "@/types/portfolio";

type CommandState = {
  mode: PortfolioMode;
  module: PortfolioModule;
  activeCommand: string;
  selectedExperience: string | null;
  selectedProject: string | null;
  history: string[];
  error: string | null;
  suggestion: string | null;
};

type CommandAction =
  | { type: "EXECUTING"; command: string }
  | {
      type: "RESULT";
      module: PortfolioModule;
      command: string;
      selectedExperience?: string | null;
      selectedProject?: string | null;
    }
  | {
      type: "ERROR";
      command: string;
      message: string;
      suggestion: string | null;
    }
  | { type: "BOOT_COMPLETE" }
  | { type: "RESET" };

const initialState: CommandState = {
  mode: "boot",
  module: "home",
  activeCommand: "boot kevin",
  selectedExperience: null,
  selectedProject: null,
  history: [],
  error: null,
  suggestion: null,
};

function reducer(state: CommandState, action: CommandAction): CommandState {
  if (action.type === "EXECUTING") {
    return {
      ...state,
      mode: "executing",
      activeCommand: action.command,
      history: [...state.history.slice(-7), action.command],
      error: null,
      suggestion: null,
    };
  }
  if (action.type === "RESULT") {
    return {
      ...state,
      mode: action.module.endsWith("detail") ? "detail" : "result",
      module: action.module,
      activeCommand: action.command,
      selectedExperience:
        action.selectedExperience === undefined
          ? state.selectedExperience
          : action.selectedExperience,
      selectedProject:
        action.selectedProject === undefined
          ? state.selectedProject
          : action.selectedProject,
      error: null,
      suggestion: null,
    };
  }
  if (action.type === "ERROR") {
    return {
      ...state,
      mode: "error",
      activeCommand: action.command,
      error: action.message,
      suggestion: action.suggestion,
      history: [...state.history.slice(-7), action.command],
    };
  }
  if (action.type === "BOOT_COMPLETE") {
    return {
      ...state,
      mode: "result",
      module: "whoami",
      activeCommand: "whoami",
    };
  }
  return { ...initialState, mode: "home" };
}

function getSuggestion(command: string) {
  const firstLetter = command[0];
  return (
    commandRegistry.find((item) =>
      [item.command, ...item.aliases].some(
        (alias) =>
          alias.startsWith(command) ||
          command.startsWith(alias) ||
          alias[0] === firstLetter,
      ),
    )?.command ?? null
  );
}

export function useCommandEngine(reducedMotion: boolean) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(
    () => () => {
      controllerRef.current?.abort();
    },
    [],
  );

  const execute = useCallback(
    async (rawCommand: string) => {
      const command = rawCommand.trim().toLowerCase().replace(/\s+/g, " ");
      if (!command) return { ok: false as const };

      controllerRef.current?.abort();
      const controller = new AbortController();
      controllerRef.current = controller;
      dispatch({ type: "EXECUTING", command });

      const wait = (ms: number) =>
        new Promise<void>((resolve, reject) => {
          const timer = window.setTimeout(resolve, reducedMotion ? 0 : ms);
          controller.signal.addEventListener(
            "abort",
            () => {
              window.clearTimeout(timer);
              reject(new DOMException("Aborted", "AbortError"));
            },
            { once: true },
          );
        });

      try {
        await wait(260);

        if (command === "clear" || command === "home") {
          dispatch({
            type: "RESULT",
            module: "home",
            command,
            selectedExperience: null,
            selectedProject: null,
          });
          return { ok: true as const, command: "home" };
        }

        if (command === "help") {
          dispatch({ type: "RESULT", module: "help", command });
          return { ok: true as const, command: "help" };
        }

        const experienceMatch = command.match(
          /^experience(?:\s+--open)?\s+([a-z0-9-]+)$/,
        );
        if (experienceMatch) {
          const id = experienceMatch[1];
          const experience = experiences.find(
            (item) =>
              item.id === id ||
              item.company.toLowerCase().includes(id.toLowerCase()),
          );
          if (experience) {
            dispatch({
              type: "RESULT",
              module: "experience-detail",
              command: `experience --open ${experience.id}`,
              selectedExperience: experience.id,
            });
            return {
              ok: true as const,
              command: "experience",
              detail: experience.id,
            };
          }
        }

        const projectMatch = command.match(/^project\s+([a-z0-9-]+)$/);
        if (projectMatch) {
          const id = projectMatch[1];
          const project = projects.find(
            (item) =>
              item.id === id ||
              item.name.toLowerCase().replaceAll(" ", "-").includes(id),
          );
          if (project) {
            dispatch({
              type: "RESULT",
              module: "project-detail",
              command: `project ${project.id}`,
              selectedProject: project.id,
            });
            return {
              ok: true as const,
              command: "projects",
              detail: project.id,
            };
          }
        }

        const definition = commandLookup.get(command);
        if (definition) {
          dispatch({
            type: "RESULT",
            module: definition.module,
            command: definition.command,
          });
          return {
            ok: true as const,
            command: definition.command,
            definition,
          };
        }

        dispatch({
          type: "ERROR",
          command,
          message: `command not found: ${command}`,
          suggestion: getSuggestion(command),
        });
        return { ok: false as const, command };
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return { ok: false as const, aborted: true as const };
        }
        throw error;
      }
    },
    [reducedMotion],
  );

  const bootComplete = useCallback(
    () => dispatch({ type: "BOOT_COMPLETE" }),
    [],
  );
  const reset = useCallback(() => dispatch({ type: "RESET" }), []);

  return { state, execute, bootComplete, reset };
}
