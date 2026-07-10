"use client";

import { useEffect, useState } from "react";
import { models } from "@/lib/models";
import type { ShowcaseProject } from "@/types/showcase";
import { PlayIcon } from "./icons";
import { PreviewFrame } from "./preview-frame";
import { TranscriptViewer } from "./transcript-viewer";
import { useMediaQuery } from "./use-media-query";

export function ComparisonWorkspace({ projects }: { projects: ShowcaseProject[] }) {
  const [opened, setOpened] = useState<string[]>([]);
  const compact = useMediaQuery("(max-width: 760px)");

  useEffect(() => {
    if (compact) setOpened((current) => current.slice(0, 1));
  }, [compact]);

  const toggle = (id: string) => {
    setOpened((current) => {
      if (compact) return current.includes(id) ? current : [id];
      return current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
    });
  };
  const openInitial = () => setOpened(compact ? projects.slice(0, 1).map((project) => project.id) : projects.map((project) => project.id));
  const visibleProjects = projects.filter((project) => opened.includes(project.id));

  return <section className="comparison-workspace" id="comparison-stage" aria-labelledby="comparison-stage-title">
    <div className="comparison-selector">
      <div><p className="eyebrow">Stage controls</p><h2 id="comparison-stage-title">Select outputs to inspect</h2><p className="compact-comparison-note">On narrow screens, select 1 model at a time to keep each workspace focused.</p></div>
      <div className="model-toggles" aria-label="Projects on stage">{projects.map((project) => <button key={project.id} type="button" aria-pressed={opened.includes(project.id)} onClick={() => toggle(project.id)} style={{ "--accent": models[project.model].accent } as React.CSSProperties}><i /><span>{project.modelLabel}</span><strong>{project.title}</strong></button>)}</div>
    </div>
    {!opened.length ? <div className="comparison-gate"><span className="versus-mark" aria-hidden="true">A<br/><i>×</i><br/>B</span><div><p className="eyebrow">Comparative viewing</p><h3>Outputs remain dormant until selected.</h3><p>Open 1 model for focused inspection, or use a wide screen to stage both workspaces side by side. Live previews still initialize only on request.</p></div></div> : null}
    <div className={`comparison-grid ${visibleProjects.length === 1 ? "single" : ""}`}>{visibleProjects.map((project) => <article className="comparison-column" key={project.id} style={{ "--accent": models[project.model].accent } as React.CSSProperties}>
      <header><span>{models[project.model].code}</span><div><p>{project.modelLabel} · {project.modelId}</p><h3>{project.title}</h3></div><button type="button" onClick={() => setOpened((current) => current.filter((id) => id !== project.id))}>Close project</button></header>
      {project.demoPath ? <PreviewFrame src={project.demoPath} title={`${project.modelLabel} ${project.title}`} /> : <div className="unavailable">Output unavailable</div>}
      <section className="comparison-conversation" aria-label={`${project.modelLabel} process conversation for ${project.title}`}>
        <div className="mini-heading"><p className="eyebrow">Conversation</p><span>{project.transcriptPath ? `${project.messageCount} messages / ${project.toolCallCount} processes` : "Process record not archived"}</span></div>
        {project.transcriptPath ? <TranscriptViewer path={project.transcriptPath} title={project.title} /> : <div className="comparison-record-unavailable"><span aria-hidden="true"/><p className="eyebrow">Output remains live</p><h4>Process record unavailable</h4><p>No session export was recovered for this experiment. Its runnable output remains available for direct comparison above.</p></div>}
      </section>
    </article>)}</div>
    {!opened.length ? <button className="primary-button comparison-open-all" type="button" onClick={openInitial}><PlayIcon /> {compact ? "Open first project" : "Open all projects"}</button> : null}
  </section>;
}
