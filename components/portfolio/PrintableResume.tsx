import { capabilities, experiences, profile, projects } from "@/data/portfolio";

export function PrintableResume() {
  return (
    <article className="print-resume" aria-hidden="true">
      <header className="print-resume-header">
        <div>
          <span>AGENT PRODUCT MANAGER / AI NATIVE BUILDER</span>
          <h1>{profile.name}</h1>
          <p>{profile.positioning}</p>
        </div>
        <address>
          <strong>{profile.englishName}</strong>
          <a href={`mailto:${profile.email}`}>{profile.email}</a>
          <a href={`tel:${profile.phone.replaceAll(" ", "")}`}>
            {profile.phone}
          </a>
          <span>{profile.education}</span>
        </address>
      </header>

      <section className="print-resume-summary">
        <h2>PROFILE</h2>
        <p>{profile.intro}</p>
        <div>
          <strong>7+ Agent 质量指标</strong>
          <strong>根因定位耗时 -75%</strong>
          <strong>6 个独立自动化工具</strong>
        </div>
      </section>

      <section>
        <h2>EXPERIENCE</h2>
        <div className="print-experience-list">
          {experiences.map((experience) => (
            <article key={experience.id}>
              <header>
                <div>
                  <h3>{experience.company}</h3>
                  <strong>
                    {experience.department} · {experience.role}
                  </strong>
                </div>
                <time>{experience.period}</time>
              </header>
              <p>{experience.summary}</p>
              <ul>
                {experience.responsibilities.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <div className="print-metrics">
                {experience.highlights.map((highlight) => (
                  <span key={highlight.label}>
                    {highlight.label}{" "}
                    <strong>
                      {highlight.previous
                        ? `${highlight.previous} → `
                        : ""}
                      {highlight.value}
                    </strong>
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h2>SELECTED PROJECTS</h2>
        <div className="print-project-grid">
          {projects.map((project) => (
            <article key={project.id}>
              <span>{project.kicker}</span>
              <h3>{project.name}</h3>
              <p>{project.problem}</p>
              <strong>
                {project.metric} · {project.metricLabel}
              </strong>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h2>CAPABILITY EVIDENCE</h2>
        <div className="print-capabilities">
          {capabilities.map((capability) => (
            <article key={capability.id}>
              <h3>{capability.label}</h3>
              <p>{capability.description}</p>
              <span>{capability.evidence.join(" / ")}</span>
            </article>
          ))}
        </div>
      </section>
    </article>
  );
}
