export type MatchCategory = "experience" | "project" | "ability" | "asset";

export type MatchItem = {
  id: string;
  category: MatchCategory;
  title: string;
  shortTitle: string;
  subtitle: string;
  summary: string;
  problem?: string;
  action: string;
  result: string;
  metric: string;
  metricLabel: string;
  sticker: string;
  accent: string;
};

export type MatchboxData = {
  id: MatchCategory;
  index: string;
  title: string;
  english: string;
  note: string;
  accent: string;
};

export const matchboxes: MatchboxData[] = [
  {
    id: "experience",
    index: "01",
    title: "经历过的地方",
    english: "PLACES",
    note: "平台塑造视野",
    accent: "#ff6b35",
  },
  {
    id: "project",
    index: "02",
    title: "做成的事情",
    english: "PROJECTS",
    note: "结果证明判断",
    accent: "#f6c453",
  },
  {
    id: "ability",
    index: "03",
    title: "装进脑子里的东西",
    english: "MINDSET",
    note: "方法决定上限",
    accent: "#51c5b5",
  },
  {
    id: "asset",
    index: "04",
    title: "留下来的火种",
    english: "ASSETS",
    note: "沉淀创造复利",
    accent: "#e96278",
  },
];

export const matches: MatchItem[] = [
  {
    id: "meituan",
    category: "experience",
    title: "美团",
    shortTitle: "美团",
    subtitle: "云智能产品 · Agent 产品经理",
    summary: "把智能客服与 Agent 质量问题，转化成可上线、可观测、可持续治理的产品体系。",
    action: "负责 MWS 智能客服产品化，并主导 Radar Agent 观测、评测、治理与回归机制。",
    result: "建立 7+ 质量维度，推动 Skill、Loop 与本地 Eval Agent 三阶段治理。",
    metric: "7+",
    metricLabel: "Agent 质量指标",
    sticker: "RADAR",
    accent: "#ff6b35",
  },
  {
    id: "netease",
    category: "experience",
    title: "网易有道",
    shortTitle: "有道",
    subtitle: "AI 产品部 · 产品质量",
    summary: "参与千万级用户产品的 OCR 与多学科思维链推理验收。",
    action: "制定加权准确率指标，引入 LLM 预处理与人工校验结合的评测方式。",
    result: "独立开发 6 个自动化工具，覆盖标注、转写与题目切分。",
    metric: "6",
    metricLabel: "自动化工具",
    sticker: "QA",
    accent: "#f27c54",
  },
  {
    id: "tsinghua",
    category: "experience",
    title: "清华猛狮智驾团队",
    shortTitle: "清华",
    subtitle: "算法研究 · 多模态感知",
    summary: "主导开放词汇 3D 目标检测，建立了理解模型与数据的技术底座。",
    action: "基于 Transformer 研发多模态融合模型，完成研究、实验与论文沉淀。",
    result: "模型精度提升 17%，并发表 EI 论文。",
    metric: "+17%",
    metricLabel: "模型精度",
    sticker: "3D",
    accent: "#df8c5c",
  },
  {
    id: "radar-eval",
    category: "project",
    title: "Radar Agent 评测体系",
    shortTitle: "Radar",
    subtitle: "质量治理 · Eval / Trace / Regression",
    summary: "把原本依赖人工判断的 Agent 质量，变成可衡量、可追踪、可回归的问题。",
    problem: "根因定位结果缺少稳定标准，日常质量依赖人工抽检。",
    action: "设计 7+ 评测维度、运营页面、数据库与自动回归流程。",
    result: "形成观测—评测—治理—回归闭环，核心流程耗时降低约 50%。",
    metric: "-50%",
    metricLabel: "核心流程耗时",
    sticker: "EVAL",
    accent: "#f6c453",
  },
  {
    id: "mws",
    category: "project",
    title: "MWS 智能客服",
    shortTitle: "MWS",
    subtitle: "Agent 产品化 · 企业服务",
    summary: "让客服从一个聊天入口，变成能答疑、引导并接入业务系统的 Agent 服务。",
    problem: "原有 chatbot 能力分散，难以覆盖私有云产品的统一服务体验。",
    action: "推动 Agent 对话窗口接入公共导航 SDK，负责 5+ 功能迭代。",
    result: "覆盖全部私有云产品子系统，完成 chatbot 到自研 Agent 客服的替换。",
    metric: "5+",
    metricLabel: "功能迭代",
    sticker: "MWS",
    accent: "#f0b84d",
  },
  {
    id: "eval-agent",
    category: "project",
    title: "本地 Eval Agent",
    shortTitle: "Eval",
    subtitle: "自动评测 · Human in the Loop",
    summary: "把会话质量评审从一次次人工劳动，沉淀成可重复运行的评测能力。",
    action: "组合 LLM Judge、规则评测与人工对齐，建立回归验证机制。",
    result: "支持 Agent 会话自动评估，并持续校准与人工判断的一致性。",
    metric: "24/7",
    metricLabel: "可持续评测",
    sticker: "JUDGE",
    accent: "#e6a940",
  },
  {
    id: "agent-product",
    category: "ability",
    title: "Agent 产品设计",
    shortTitle: "Agent",
    subtitle: "模型 × 工具 × 上下文 × 反馈",
    summary: "我关注的不是再加一个聊天框，而是 Agent 如何稳定完成任务。",
    action: "从场景价值出发，组织模型、工具、状态、权限、记忆与反馈循环。",
    result: "能够在产品判断与技术约束之间，定义可落地的 Agent 终态。",
    metric: "E2E",
    metricLabel: "端到端产品判断",
    sticker: "AGENT",
    accent: "#51c5b5",
  },
  {
    id: "eval-thinking",
    category: "ability",
    title: "评测与治理",
    shortTitle: "Eval",
    subtitle: "Rubric × Evidence × Regression",
    summary: "Agent 的不确定性不能靠感觉管理，需要被拆成证据和指标。",
    action: "定义口径、构造样本、追踪 Trace，并用回归验证真实改进。",
    result: "能把模糊的质量争论转化为可行动的产品问题。",
    metric: "LOOP",
    metricLabel: "持续治理",
    sticker: "TRACE",
    accent: "#45b6a9",
  },
  {
    id: "loop-engineering",
    category: "ability",
    title: "Loop Engineering",
    shortTitle: "Loop",
    subtitle: "Agentic workflow · 自动闭环",
    summary: "不是只让 AI 帮我做一次，而是让工作流能够自己发现、验证并推进。",
    action: "设计角色隔离、验收门槛、状态恢复和持续迭代机制。",
    result: "形成质量巡检与研发辅助两套自动化 Loop。",
    metric: "2",
    metricLabel: "自动化 Loop",
    sticker: "LOOP",
    accent: "#3caa9d",
  },
  {
    id: "skills",
    category: "asset",
    title: "Agent Skill 生态",
    shortTitle: "Skill",
    subtitle: "可复用的数字能力",
    summary: "一次性经验只有一次价值，结构化 Skill 才能持续复用。",
    action: "沉淀质量监测、深度评审、周报、语料、容灾演练等完整 SOP。",
    result: "形成包含脚本、用例、错误处理与评测的 Skill 资产。",
    metric: "10+",
    metricLabel: "Agent Skill",
    sticker: "SKILL",
    accent: "#e96278",
  },
  {
    id: "automation",
    category: "asset",
    title: "自动化工具",
    shortTitle: "Tools",
    subtitle: "把重复劳动交给系统",
    summary: "我会把流程里的等待、复制和人工核对，改造成可以运行的工具。",
    action: "用 Python、HTML 与 AI Coding 快速构建标注、转写、切分与评测工具。",
    result: "在有道阶段独立交付 6 个工具，并持续用于后续产品原型。",
    metric: "6+",
    metricLabel: "独立工具",
    sticker: "TOOLS",
    accent: "#d95670",
  },
  {
    id: "demos",
    category: "asset",
    title: "Demo 与工作流",
    shortTitle: "Demo",
    subtitle: "让想法尽早被验证",
    summary: "比起在文档里解释十遍，我更愿意先做出一个可以试用的版本。",
    action: "使用 Codex、Cursor 与 Claude Code 完成前端原型、评测页和工作流验证。",
    result: "让产品判断在研发投入前就能被看见、讨论和修正。",
    metric: "BUILD",
    metricLabel: "从判断到原型",
    sticker: "DEMO",
    accent: "#cf4e67",
  },
];

export const projectCases = matches.filter((item) =>
  ["radar-eval", "mws", "eval-agent"].includes(item.id),
);

export const journey = [
  {
    period: "2025.01 — 2025.05",
    title: "算法与技术基础",
    place: "清华大学 · 猛狮智驾团队",
    detail: "开放词汇 3D 检测、多模态 Transformer、EI 论文。",
  },
  {
    period: "2025.06 — 2025.09",
    title: "AI 产品质量意识",
    place: "网易有道 · AI 产品部",
    detail: "评测指标、验收标准、LLM 辅助标注与自动化工具。",
  },
  {
    period: "2026.04 — 至今",
    title: "Agent 产品与治理",
    place: "美团 · 云智能产品",
    detail: "智能客服产品化、Radar Eval、Skill 与 Loop Engineering。",
  },
];
