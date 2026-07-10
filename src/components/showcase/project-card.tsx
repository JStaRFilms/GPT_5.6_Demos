import Link from "next/link";
import { models } from "@/lib/models";
import type { ShowcaseProject } from "@/types/showcase";
import { ArrowIcon } from "./icons";

interface ProjectCardProps { project: ShowcaseProject; index?: number }

export function ProjectCard({ project, index = 0 }: ProjectCardProps) {
  const identity = models[project.model];
  const isReady = project.status === "ready";
  const href = `/experiments/${project.model}/${project.slug}`;
  const statusLabel = isReady ? "Ready to inspect" : `Incomplete — ${project.status.replaceAll("-", " ")}`;
  return (
    <article className={`project-card model-${project.model}`} style={{ "--accent": identity.accent } as React.CSSProperties}>
      <Link className="card-preview" href={href} aria-label={`Open ${project.title}${isReady ? "" : ", incomplete record"}`}>
        <div className="specimen-art" data-seed={(project.order ?? index) % 4}>
          <span className="orbit orbit-a" /><span className="orbit orbit-b" />
          <strong>{String(project.order ?? index + 1).padStart(2, "0")}</strong>
          {project.artifactType === "static-app" ? <span className="artifact-kind-card">Full web application</span> : null}
          <small>{identity.code} / {project.tags[0] ?? "Study"}</small>
        </div>
      </Link>
      <div className="card-body">
        <div className="card-registration"><span>{identity.label}</span><span>{project.modelId}</span></div>
        <h3><Link href={href}>{project.title}</Link></h3>
        <div className="tag-line" aria-label="Tags">{project.tags.slice(0, 4).map((tag) => <span key={tag}>{tag}</span>)}</div>
        <div className="card-foot">
          <span className={`status status-${project.status}`}><i />{statusLabel}</span>
          <Link className="round-link" href={href} aria-label={`Open ${project.title}${isReady ? "" : ", incomplete record"}`}><ArrowIcon /></Link>
        </div>
        {!isReady && project.issues[0] ? <p className="issue-note">{project.issues[0]}</p> : null}
      </div>
    </article>
  );
}
