"use client";

import {
  ArrowDownRight,
  ArrowRight,
  Check,
  Copy,
  Download,
  Mail,
  Phone,
  RotateCcw,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useState } from "react";
import {
  capabilities,
  commandRegistry,
  experiences,
  profile,
  projects,
} from "@/data/portfolio";
import type {
  CapabilityEvidence,
  PortfolioModule,
  PortfolioMode,
} from "@/types/portfolio";

const ASSET_BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

type ShellContentProps = {
  mode: PortfolioMode;
  module: PortfolioModule;
  selectedExperience: string | null;
  selectedProject: string | null;
  error: string | null;
  suggestion: string | null;
  reducedMotion: boolean;
  onExecute: (command: string) => void;
  onHighlightCapability: (capability: CapabilityEvidence | null) => void;
};

const panelMotion = {
  initial: { opacity: 0, y: 14, filter: "blur(6px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  exit: { opacity: 0, y: -10, filter: "blur(4px)" },
  transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] as const },
};

function HomeView({ onExecute }: { onExecute: (command: string) => void }) {
  return (
    <motion.div className="shell-view shell-home" {...panelMotion}>
      <div className="shell-home-copy">
        <span className="terminal-label">SYSTEM READY</span>
        <h1>
          Don&apos;t read my resume.
          <span>Run it.</span>
        </h1>
        <p>
          点击 3D 键帽、按下 F1–F8，
          <br />
          或在下方输入一条命令。
        </p>
      </div>
      <div className="home-command-grid">
        {commandRegistry.slice(0, 6).map((command) => (
          <button
            type="button"
            key={command.id}
            onClick={() => onExecute(command.command)}
          >
            <span>{command.functionKey}</span>
            <strong>{command.command}</strong>
            <small>{command.description}</small>
            <ArrowDownRight aria-hidden="true" />
          </button>
        ))}
      </div>
    </motion.div>
  );
}

function WhoamiView() {
  return (
    <motion.div className="shell-view whoami-view" {...panelMotion}>
      <div className="pixel-avatar-shell">
        <div className="pixel-noise" aria-hidden="true" />
        <Image
          className="identity-avatar"
          src={`${ASSET_BASE_PATH}/character-intro3d-v2.png`}
          alt="穿蓝色休闲夹克的杨泽存 3D 卡通形象"
          width={1024}
          height={1535}
          priority
          unoptimized
        />
        <Image
          className="identity-avatar-badge"
          src={`${ASSET_BASE_PATH}/assets/avatar/avatar-pixel.png`}
          alt=""
          aria-hidden="true"
          width={96}
          height={96}
          unoptimized
        />
        <span>IDENTITY VERIFIED</span>
      </div>
      <div className="whoami-copy">
        <span className="terminal-label">WHOAMI</span>
        <h1>
          {profile.name}
          <small>/ {profile.englishName}</small>
        </h1>
        <div className="identity-role">
          <strong>{profile.role}</strong>
          <span>{profile.secondaryRole}</span>
        </div>
        <div className="identity-tags">
          {profile.positioning.split(" × ").map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
        <p>{profile.intro}</p>
        <div className="identity-stats">
          <div>
            <strong>7+</strong>
            <span>质量指标</span>
          </div>
          <div>
            <strong>10+</strong>
            <span>Agent Skills</span>
          </div>
          <div>
            <strong>2</strong>
            <span>自动化 Loops</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ExperienceIndex({
  onExecute,
}: {
  onExecute: (command: string) => void;
}) {
  return (
    <motion.div className="shell-view index-view" {...panelMotion}>
      <header className="shell-section-heading">
        <span className="terminal-label">EXPERIENCE INDEX</span>
        <h2>选择一段经历，播放执行日志。</h2>
      </header>
      <div className="terminal-index-list">
        {experiences.map((experience, index) => (
          <button
            type="button"
            key={experience.id}
            onClick={() =>
              onExecute(`experience --open ${experience.id}`)
            }
          >
            <span className="index-number">0{index + 1}</span>
            <span>
              <strong>{experience.company}</strong>
              <small>
                {experience.department} · {experience.role}
              </small>
            </span>
            <time>{experience.period}</time>
            <ArrowRight aria-hidden="true" />
          </button>
        ))}
      </div>
      <p className="shell-hint">数字键 1–4 也可以快速打开经历。</p>
    </motion.div>
  );
}

function ExperienceDetail({
  id,
  reducedMotion,
}: {
  id: string;
  reducedMotion: boolean;
}) {
  const experience = experiences.find((item) => item.id === id);
  if (!experience) return null;
  return (
    <motion.div className="shell-view experience-detail" {...panelMotion}>
      <div className="execution-log">
        <div className="execution-log-header">
          <span>EXECUTION LOG</span>
          <strong>RUNNING</strong>
        </div>
        {experience.logs.map((log, index) => (
          <motion.div
            key={log}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: reducedMotion ? 0 : index * 0.13 }}
          >
            <span>[0{index + 1}]</span>
            {log}
            <Check aria-hidden="true" />
          </motion.div>
        ))}
      </div>
      <div className="experience-result">
        <header>
          <span>{experience.period}</span>
          <h2>
            {experience.company}
            <small>{experience.department}</small>
          </h2>
          <strong>{experience.role}</strong>
        </header>
        <p>{experience.summary}</p>
        <div className="experience-work">
          <span>WORK</span>
          <ul>
            {experience.responsibilities.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="result-metrics">
          {experience.highlights.map((highlight) => (
            <div key={highlight.label}>
              <span>{highlight.label}</span>
              {highlight.previous ? <del>{highlight.previous}</del> : null}
              <strong>{highlight.value}</strong>
              {highlight.change ? <em>{highlight.change}</em> : null}
            </div>
          ))}
        </div>
        <div className="capability-line">
          {experience.capabilities.map((capability) => (
            <span key={capability}>{capability}</span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function ProjectsIndex({
  onExecute,
}: {
  onExecute: (command: string) => void;
}) {
  return (
    <motion.div className="shell-view projects-view" {...panelMotion}>
      <header className="shell-section-heading">
        <span className="terminal-label">PROJECT MATRIX</span>
        <h2>六个项目，证明我如何把判断变成结果。</h2>
      </header>
      <div className="project-matrix">
        {projects.map((project, index) => (
          <button
            type="button"
            key={project.id}
            onClick={() => onExecute(`project ${project.id}`)}
          >
            <span className="project-number">0{index + 1}</span>
            <small>{project.kicker}</small>
            <strong>{project.name}</strong>
            <div>
              <em>{project.metric}</em>
              <span>{project.metricLabel}</span>
            </div>
          </button>
        ))}
      </div>
    </motion.div>
  );
}

function ProjectDetail({ id }: { id: string }) {
  const project = projects.find((item) => item.id === id);
  if (!project) return null;
  return (
    <motion.div className="shell-view project-detail" {...panelMotion}>
      <header>
        <div>
          <span className="terminal-label">PROJECT / {project.kicker}</span>
          <h2>{project.name}</h2>
          <strong>{project.role}</strong>
        </div>
        <div className="project-hero-metric">
          <strong>{project.metric}</strong>
          <span>{project.metricLabel}</span>
        </div>
      </header>
      <div className="project-detail-grid">
        <section>
          <span>PROBLEM</span>
          <p>{project.problem}</p>
        </section>
        <section>
          <span>ACTION</span>
          <ul>
            {project.actions.map((action) => (
              <li key={action}>{action}</li>
            ))}
          </ul>
        </section>
        <section>
          <span>RESULT</span>
          <ul>
            {project.results.map((result) => (
              <li key={result}>{result}</li>
            ))}
          </ul>
        </section>
        <section>
          <span>ASSETS</span>
          <div className="asset-tags">
            {project.assets.map((asset) => (
              <em key={asset}>{asset}</em>
            ))}
          </div>
        </section>
      </div>
      <div className="capability-line">
        {project.capabilities.map((capability) => (
          <span key={capability}>{capability}</span>
        ))}
      </div>
    </motion.div>
  );
}

function SkillsView({
  onHighlightCapability,
}: {
  onHighlightCapability: (capability: CapabilityEvidence | null) => void;
}) {
  return (
    <motion.div className="shell-view skills-view" {...panelMotion}>
      <header className="shell-section-heading">
        <span className="terminal-label">CAPABILITY EVIDENCE</span>
        <h2>能力不是标签，每一项都必须有证据。</h2>
      </header>
      <div className="skill-evidence-grid">
        {capabilities.map((capability) => (
          <button
            type="button"
            key={capability.id}
            onMouseEnter={() => onHighlightCapability(capability)}
            onMouseLeave={() => onHighlightCapability(null)}
            onFocus={() => onHighlightCapability(capability)}
            onBlur={() => onHighlightCapability(null)}
          >
            <span>{capability.label}</span>
            <p>{capability.description}</p>
            <ul>
              {capability.evidence.map((evidence) => (
                <li key={evidence}>{evidence}</li>
              ))}
            </ul>
            <small>{capability.relatedExperiences.join(" / ")}</small>
          </button>
        ))}
      </div>
    </motion.div>
  );
}

function EvalView() {
  return (
    <motion.div className="shell-view eval-view" {...panelMotion}>
      <div className="eval-copy">
        <span className="terminal-label">EVALUATION SYSTEM</span>
        <h2>把 Agent 的不确定性，拆成可以治理的证据。</h2>
        <p>
          不是用一个总分掩盖问题，而是沿着会话、Trace、工具调用和最终结果找到真正的质量变化。
        </p>
        <div className="eval-proof">
          <div>
            <strong>7+</strong>
            <span>质量维度</span>
          </div>
          <div>
            <strong>200s</strong>
            <ArrowRight />
            <strong>50s</strong>
            <em>-75%</em>
          </div>
        </div>
      </div>
      <div className="eval-radar" aria-label="评测治理闭环">
        <div className="radar-sweep" />
        {[
          ["OBSERVE", "观测"],
          ["EVALUATE", "评测"],
          ["DIAGNOSE", "定位"],
          ["GOVERN", "治理"],
          ["REGRESS", "回归"],
        ].map(([english, chinese], index) => (
          <motion.div
            className={`radar-node radar-node-${index + 1}`}
            key={english}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.12 }}
          >
            <span>{english}</span>
            <strong>{chinese}</strong>
          </motion.div>
        ))}
        <div className="radar-core">EVAL</div>
      </div>
    </motion.div>
  );
}

function LoopView() {
  const nodes = [
    ["RESEARCH", "研究"],
    ["REQUIREMENT", "需求"],
    ["PRD", "定义"],
    ["DEMO", "验证"],
    ["REVIEW", "评审"],
    ["EVALUATE", "评测"],
    ["ITERATE", "迭代"],
  ];
  return (
    <motion.div className="shell-view loop-view" {...panelMotion}>
      <header className="shell-section-heading">
        <span className="terminal-label">AI NATIVE LOOP</span>
        <h2>让工作流自己发现、验证并推进。</h2>
      </header>
      <div className="loop-flow">
        {nodes.map(([english, chinese], index) => (
          <motion.div
            key={english}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <span>0{index + 1}</span>
            <strong>{english}</strong>
            <small>{chinese}</small>
            {index < nodes.length - 1 ? <ArrowRight aria-hidden="true" /> : null}
          </motion.div>
        ))}
        <RotateCcw className="loop-return" aria-label="持续迭代" />
      </div>
      <div className="loop-principles">
        <p>Agent 负责研究与信息整理</p>
        <p>Spec 与 Demo 负责尽早验证</p>
        <p>Reviewer 保持独立上下文</p>
        <p>Eval 负责客观判断是否继续</p>
      </div>
    </motion.div>
  );
}

function ContactView() {
  const [copied, setCopied] = useState(false);
  const copyEmail = async () => {
    await navigator.clipboard.writeText(profile.email);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };
  return (
    <motion.div className="shell-view contact-view" {...panelMotion}>
      <span className="terminal-label">PROFILE INSPECTION COMPLETED</span>
      <h2>
        Thanks for typing me in.
        <span>Let&apos;s build something interesting.</span>
      </h2>
      <div className="contact-terminal-actions">
        <a href={`mailto:${profile.email}`}>
          <Mail aria-hidden="true" />
          <span>
            EMAIL
            <strong>{profile.email}</strong>
          </span>
          <ArrowDownRight aria-hidden="true" />
        </a>
        <a href={`tel:${profile.phone.replaceAll(" ", "")}`}>
          <Phone aria-hidden="true" />
          <span>
            PHONE
            <strong>{profile.phone}</strong>
          </span>
          <ArrowDownRight aria-hidden="true" />
        </a>
        <button type="button" onClick={copyEmail}>
          <Copy aria-hidden="true" />
          <span>
            COPY
            <strong>{copied ? "Copied." : "复制邮箱"}</strong>
          </span>
        </button>
        <button type="button" onClick={() => window.print()}>
          <Download aria-hidden="true" />
          <span>
            RESUME
            <strong>导出 PDF</strong>
          </span>
        </button>
      </div>
      <p>{profile.education}</p>
    </motion.div>
  );
}

function HelpView({ onExecute }: { onExecute: (command: string) => void }) {
  return (
    <motion.div className="shell-view help-view" {...panelMotion}>
      <header className="shell-section-heading">
        <span className="terminal-label">COMMANDS</span>
        <h2>所有命令都有对应的 HTML 按钮和 3D 键帽。</h2>
      </header>
      <div className="help-command-list">
        {commandRegistry.map((command) => (
          <button
            type="button"
            key={command.id}
            onClick={() => onExecute(command.command)}
          >
            <span>{command.functionKey}</span>
            <strong>{command.command}</strong>
            <small>{command.description}</small>
          </button>
        ))}
        <button type="button" onClick={() => onExecute("home")}>
          <span>ESC</span>
          <strong>home</strong>
          <small>返回系统首页</small>
        </button>
        <button type="button" onClick={() => onExecute("clear")}>
          <span>⌫</span>
          <strong>clear</strong>
          <small>清空当前输出</small>
        </button>
        <button type="button" onClick={() => onExecute("demo")}>
          <span>▶</span>
          <strong>demo</strong>
          <small>自动播放核心经历</small>
        </button>
      </div>
    </motion.div>
  );
}

function ErrorView({
  error,
  suggestion,
  onExecute,
}: {
  error: string;
  suggestion: string | null;
  onExecute: (command: string) => void;
}) {
  return (
    <motion.div className="shell-view error-view" {...panelMotion}>
      <span className="terminal-label">EXECUTION FAILED</span>
      <h2>{error}</h2>
      {suggestion ? (
        <button type="button" onClick={() => onExecute(suggestion)}>
          Did you mean: <strong>&gt; {suggestion}</strong>
        </button>
      ) : null}
      <p>
        输入 <button onClick={() => onExecute("help")}>help</button> 查看可用命令。
      </p>
    </motion.div>
  );
}

export function ShellContent({
  mode,
  module,
  selectedExperience,
  selectedProject,
  error,
  suggestion,
  reducedMotion,
  onExecute,
  onHighlightCapability,
}: ShellContentProps) {
  if (mode === "executing") {
    return (
      <motion.div className="shell-view executing-view" {...panelMotion}>
        <span className="terminal-label">EXECUTING</span>
        <div className="executing-bars">
          {Array.from({ length: 16 }, (_, index) => (
            <i key={index} />
          ))}
        </div>
        <p>Resolving command and loading evidence...</p>
      </motion.div>
    );
  }

  if (mode === "error" && error) {
    return (
      <ErrorView
        error={error}
        suggestion={suggestion}
        onExecute={onExecute}
      />
    );
  }

  const key = `${module}-${selectedExperience ?? ""}-${selectedProject ?? ""}`;
  return (
    <AnimatePresence mode="wait">
      <div key={key}>
        {module === "home" ? <HomeView onExecute={onExecute} /> : null}
        {module === "whoami" ? <WhoamiView /> : null}
        {module === "experience" ? (
          <ExperienceIndex onExecute={onExecute} />
        ) : null}
        {module === "experience-detail" && selectedExperience ? (
          <ExperienceDetail
            id={selectedExperience}
            reducedMotion={reducedMotion}
          />
        ) : null}
        {module === "projects" ? (
          <ProjectsIndex onExecute={onExecute} />
        ) : null}
        {module === "project-detail" && selectedProject ? (
          <ProjectDetail id={selectedProject} />
        ) : null}
        {module === "skills" ? (
          <SkillsView onHighlightCapability={onHighlightCapability} />
        ) : null}
        {module === "eval" ? <EvalView /> : null}
        {module === "loop" ? <LoopView /> : null}
        {module === "contact" ? <ContactView /> : null}
        {module === "help" ? <HelpView onExecute={onExecute} /> : null}
      </div>
    </AnimatePresence>
  );
}
