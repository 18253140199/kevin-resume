import type { PortfolioModule } from "@/types/portfolio";

export const COMMAND_KEY_OBJECTS = {
  whoami: "js",
  experience: "react",
  projects: "nextjs",
  skills: "ts",
  eval: "docker",
  loop: "git",
  contact: "github",
  resume: "vercel",
} as const;

export const KEYBOARD_MODES: Record<
  PortfolioModule,
  {
    scale: number;
    position: { x: number; y: number; z: number };
    rotation: { x: number; y: number; z: number };
  }
> = {
  home: {
    scale: 0.18,
    position: { x: 0, y: -42, z: 0 },
    rotation: { x: 0.05, y: 0, z: 0 },
  },
  whoami: {
    scale: 0.185,
    position: { x: 90, y: -38, z: 0 },
    rotation: { x: 0.03, y: -0.16, z: 0 },
  },
  experience: {
    scale: 0.175,
    position: { x: -78, y: -28, z: 0 },
    rotation: { x: 0.08, y: 0.24, z: 0 },
  },
  "experience-detail": {
    scale: 0.168,
    position: { x: -112, y: -20, z: 0 },
    rotation: { x: 0.1, y: 0.32, z: 0 },
  },
  projects: {
    scale: 0.172,
    position: { x: 86, y: -20, z: 0 },
    rotation: { x: 0.08, y: -0.25, z: 0 },
  },
  "project-detail": {
    scale: 0.164,
    position: { x: 116, y: -12, z: 0 },
    rotation: { x: 0.1, y: -0.34, z: 0 },
  },
  skills: {
    scale: 0.185,
    position: { x: 0, y: -42, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
  },
  eval: {
    scale: 0.175,
    position: { x: 64, y: -20, z: 0 },
    rotation: { x: 0.14, y: -0.18, z: 0 },
  },
  loop: {
    scale: 0.168,
    position: { x: -64, y: -16, z: 0 },
    rotation: { x: 0.14, y: 0.2, z: 0 },
  },
  contact: {
    scale: 0.18,
    position: { x: 0, y: -34, z: 0 },
    rotation: { x: 0.04, y: 0, z: 0 },
  },
  help: {
    scale: 0.175,
    position: { x: 0, y: -34, z: 0 },
    rotation: { x: 0.06, y: 0, z: 0 },
  },
};
