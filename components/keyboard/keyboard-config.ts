import type { PortfolioModule } from "@/types/portfolio";

export const COMMAND_KEY_OBJECTS = {
  whoami: "cmd-whoami",
  experience: "cmd-experience",
  projects: "cmd-projects",
  skills: "cmd-skills",
  eval: "cmd-eval",
  loop: "cmd-loop",
  contact: "cmd-contact",
  resume: "cmd-resume",
} as const;

export const LEGACY_KEY_OBJECTS: Record<string, string[]> = {
  "cmd-whoami": ["js"],
  "cmd-experience": ["react"],
  "cmd-projects": ["nextjs"],
  "cmd-skills": ["ts"],
  "cmd-eval": ["docker"],
  "cmd-loop": ["git"],
  "cmd-contact": ["github"],
  "cmd-resume": ["vercel"],
};

export const CHARACTER_KEY_OBJECTS: Record<string, string> = Object.fromEntries(
  "abcdefghijklmnopqrstuvwxyz0123456789- ".split("").map((character) => [
    character,
    character === " " ? "key-space" : `key-${character}`,
  ]),
);

export function normalizeKeyObjectName(objectName: string) {
  const standard = Object.entries(LEGACY_KEY_OBJECTS).find(([, legacyNames]) =>
    legacyNames.includes(objectName),
  );
  return standard?.[0] ?? objectName;
}

export const KEYBOARD_MODES: Record<
  PortfolioModule,
  {
    scale: number;
    position: { x: number; y: number; z: number };
    rotation: { x: number; y: number; z: number };
  }
> = {
  home: {
    scale: 0.22,
    position: { x: 0, y: -24, z: 0 },
    rotation: { x: 0.05, y: 0, z: 0 },
  },
  whoami: {
    scale: 0.225,
    position: { x: 42, y: -22, z: 0 },
    rotation: { x: 0.03, y: -0.16, z: 0 },
  },
  experience: {
    scale: 0.21,
    position: { x: -38, y: -18, z: 0 },
    rotation: { x: 0.08, y: 0.24, z: 0 },
  },
  "experience-detail": {
    scale: 0.205,
    position: { x: -50, y: -14, z: 0 },
    rotation: { x: 0.1, y: 0.32, z: 0 },
  },
  projects: {
    scale: 0.21,
    position: { x: 42, y: -14, z: 0 },
    rotation: { x: 0.08, y: -0.25, z: 0 },
  },
  "project-detail": {
    scale: 0.205,
    position: { x: 52, y: -10, z: 0 },
    rotation: { x: 0.1, y: -0.34, z: 0 },
  },
  skills: {
    scale: 0.225,
    position: { x: 0, y: -24, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
  },
  eval: {
    scale: 0.215,
    position: { x: 30, y: -14, z: 0 },
    rotation: { x: 0.14, y: -0.18, z: 0 },
  },
  loop: {
    scale: 0.21,
    position: { x: -30, y: -12, z: 0 },
    rotation: { x: 0.14, y: 0.2, z: 0 },
  },
  contact: {
    scale: 0.22,
    position: { x: 0, y: -20, z: 0 },
    rotation: { x: 0.04, y: 0, z: 0 },
  },
  help: {
    scale: 0.215,
    position: { x: 0, y: -20, z: 0 },
    rotation: { x: 0.06, y: 0, z: 0 },
  },
};
