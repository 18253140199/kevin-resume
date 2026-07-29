export type PortfolioModule =
  | "home"
  | "whoami"
  | "experience"
  | "experience-detail"
  | "projects"
  | "project-detail"
  | "skills"
  | "eval"
  | "loop"
  | "contact"
  | "help";

export type PortfolioMode =
  | "boot"
  | "home"
  | "typing"
  | "executing"
  | "result"
  | "detail"
  | "error"
  | "autoplay";

export type ResumeExperience = {
  id: string;
  company: string;
  department: string;
  role: string;
  period: string;
  summary: string;
  logs: string[];
  highlights: Array<{
    label: string;
    value: string;
    previous?: string;
    change?: string;
  }>;
  responsibilities: string[];
  capabilities: string[];
  relatedProjects: string[];
};

export type ResumeProject = {
  id: string;
  name: string;
  kicker: string;
  problem: string;
  role: string;
  actions: string[];
  results: string[];
  assets: string[];
  capabilities: string[];
  metric: string;
  metricLabel: string;
};

export type CapabilityEvidence = {
  id: string;
  label: string;
  description: string;
  evidence: string[];
  relatedExperiences: string[];
  relatedProjects: string[];
  keyObjectName: string;
};

export type CommandDefinition = {
  id: string;
  command: string;
  aliases: string[];
  label: string;
  description: string;
  functionKey: string;
  physicalKey: string;
  keyObjectName: string;
  module: PortfolioModule;
};

export type KeyboardSceneController = {
  pressKey: (objectName: string) => boolean;
  releaseKey: (objectName: string) => boolean;
  highlightKeys: (objectNames: string[]) => void;
  clearHighlights: () => void;
  setSceneMode: (mode: PortfolioModule) => void;
};
