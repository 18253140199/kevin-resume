"use client";

import { journey, projectCases } from "@/data/resume";

const capabilities = [
  {
    label: "01 / PRODUCT",
    title: "把模糊需求变成产品终态",
    text: "从用户问题、场景价值和技术约束出发，定义 Agent 应该如何工作，而不是先画一个聊天框。",
    tags: ["Agent Product", "PRD", "Prototype", "MCP / RAG"],
  },
  {
    label: "02 / EVALUATION",
    title: "把不确定性变成可治理证据",
    text: "建立样本、Rubric、Trace 与回归机制，让质量变化能够被解释、复现和持续优化。",
    tags: ["Eval", "Trace", "LLM Judge", "Regression"],
  },
  {
    label: "03 / BUILD",
    title: "把一次性工作变成数字资产",
    text: "用 Skill、Loop、脚本和 Demo 固化有效方法，让团队不必从同一个问题重新开始。",
    tags: ["10+ Skill", "2 Loops", "Python", "AI Coding"],
  },
];

export function Portfolio() {
  return (
    <main className="portfolio" id="portfolio">
      <nav className="portfolio-nav">
        <a href="#top" className="portfolio-wordmark">
          YANG ZECUN
        </a>
        <div>
          <a href="#work">项目</a>
          <a href="#path">经历</a>
          <a href="#contact">联系</a>
        </div>
      </nav>

      <section className="portfolio-hero">
        <div>
          <div className="section-number">01 — POSITIONING</div>
          <h2>
            我做的不只是产品需求。
            <br />
            我让 Agent 变得
            <span>可评测、可治理、可持续迭代。</span>
          </h2>
        </div>
        <div className="portfolio-intro">
          <p>
            杨泽存，Agent 产品经理。具备算法研究、AI 产品质量和企业级 Agent
            产品化的复合经历。
          </p>
          <p>
            我擅长把模型、工具和业务流程组织成可运行的产品，也愿意亲手做出 Demo
            来验证判断。
          </p>
        </div>
        <div className="metric-strip">
          <div>
            <strong>7+</strong>
            <span>Agent 质量指标</span>
          </div>
          <div>
            <strong>10+</strong>
            <span>可复用 Skill</span>
          </div>
          <div>
            <strong>2</strong>
            <span>自动化 Loop</span>
          </div>
          <div>
            <strong>17%</strong>
            <span>算法精度提升</span>
          </div>
        </div>
      </section>

      <section className="work-section" id="work">
        <div className="section-heading">
          <div className="section-number">02 — SELECTED WORK</div>
          <h2>三个项目，证明我如何思考与行动。</h2>
        </div>
        <div className="case-list">
          {projectCases.map((item, index) => (
            <article className="case-study" id={`project-${item.id}`} key={item.id}>
              <div className="case-index">0{index + 1}</div>
              <div className="case-main">
                <div className="case-kicker">{item.subtitle}</div>
                <h3>{item.title}</h3>
                <p className="case-summary">{item.summary}</p>
                <div className="case-process">
                  {item.problem ? (
                    <p>
                      <span>问题</span>
                      {item.problem}
                    </p>
                  ) : null}
                  <p>
                    <span>我的行动</span>
                    {item.action}
                  </p>
                  <p>
                    <span>结果</span>
                    {item.result}
                  </p>
                </div>
              </div>
              <div className="case-metric">
                <strong>{item.metric}</strong>
                <span>{item.metricLabel}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="capability-section">
        <div className="section-heading">
          <div className="section-number">03 — HOW I WORK</div>
          <h2>技术理解是底座，产品判断才是方向。</h2>
        </div>
        <div className="capability-grid">
          {capabilities.map((item) => (
            <article key={item.label}>
              <div className="capability-label">{item.label}</div>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
              <div className="tag-row">
                {item.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="journey-section" id="path">
        <div className="section-heading">
          <div className="section-number">04 — JOURNEY</div>
          <h2>不是三次转型，是能力从底层技术向产品落地生长。</h2>
        </div>
        <div className="journey-list">
          {journey.map((item, index) => (
            <article key={item.period}>
              <span className="journey-dot">{index + 1}</span>
              <div className="journey-period">{item.period}</div>
              <div>
                <h3>{item.title}</h3>
                <strong>{item.place}</strong>
                <p>{item.detail}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="belief-section">
        <div className="belief-quote">
          <span>“</span>
          <blockquote>
            火焰会熄灭，
            <br />
            但经历会留下痕迹。
          </blockquote>
        </div>
        <div className="belief-copy">
          <div className="section-number">05 — WHAT I BELIEVE</div>
          <p>
            好的 Agent 产品不该靠一次漂亮 Demo 证明自己，而应该在真实任务里留下可检查的结果。
          </p>
          <p>
            好的产品经理也不只交付需求。他应该留下指标、工具、Skill、工作流，以及下一次能更快做对的判断。
          </p>
        </div>
      </section>

      <section className="contact-section" id="contact">
        <div className="contact-kicker">AVAILABLE FOR THE NEXT HARD PROBLEM</div>
        <h2>
          给我一个值得被
          <br />
          Agent 重新解决的问题。
        </h2>
        <div className="contact-actions">
          <a
            className="contact-primary"
            href="mailto:18253140199@163.com?subject=聊一个值得被 Agent 解决的问题"
          >
            18253140199@163.com <span aria-hidden="true">↗</span>
          </a>
          <a href="tel:18253140199">182 5314 0199</a>
          <button onClick={() => window.print()}>打印 / 导出 PDF</button>
          <a href="#top">重新点燃</a>
        </div>
        <div className="contact-meta">
          <span>北京信息科技大学 · 控制工程硕士</span>
          <span>Agent Product · Eval · Loop Engineering</span>
          <span>© 2026 Yang Zecun</span>
        </div>
      </section>
    </main>
  );
}
