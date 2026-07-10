import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowIcon, ExternalIcon } from "@/components/showcase/icons";
import { ProjectWorkspace } from "@/components/showcase/project-workspace";
import { SessionMetricsPresentation } from "@/components/showcase/session-metrics";
import { Footer } from "@/components/showcase/site-shell";
import { catalogue, getProject } from "@/lib/catalogue";
import { isModelId, models } from "@/lib/models";

export function generateStaticParams() { return catalogue.projects.map(({ model, slug }) => ({ model, slug })); }

export async function generateMetadata({ params }: { params: Promise<{ model: string; slug: string }> }): Promise<Metadata> {
  const { model, slug } = await params; const project = getProject(model, slug);
  return project ? { title: project.title, description: project.promptExcerpt ?? `${project.title}, a ${project.modelLabel} model experiment.` } : {};
}

export default async function ExperimentPage({ params }: { params: Promise<{ model: string; slug: string }> }) {
  const { model, slug } = await params;
  if (!isModelId(model)) notFound();
  const project = getProject(model, slug); if (!project) notFound();
  const identity = models[model];
  const comparison = catalogue.comparisons.find((item) => item.projectIds.includes(project.id));
  const artifactKind = project.artifactType === "static-app" ? "Full web application" : "Single-file artifact";
  return <>
    <main id="main-content" className={`experiment-page model-${model}`} style={{ "--accent": identity.accent } as React.CSSProperties}>
    <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">Collection</Link><span>/</span><Link href={`/models/${model}`}>{identity.label}</Link><span>/</span><b>{String(project.order ?? 0).padStart(2, "0")}</b></nav>
    <header className="experiment-header"><div className="experiment-registration"><span>{identity.code}</span><i/><small>{project.modelId}</small></div><div className="experiment-title"><p className="eyebrow">Experiment {String(project.order ?? 0).padStart(2, "0")} / {identity.label}</p><h1>{project.title}</h1><div className="tag-line">{project.tags.map((tag) => <span key={tag}>{tag}</span>)}</div><div className="header-actions"><a className="inspect-link" href="#workspace">Inspect output <ArrowIcon /></a>{comparison ? <Link href={`/compare/${comparison.id}`}>Compare models</Link> : null}</div></div><div className="experiment-status"><span className={`status status-${project.status}`}><i/>{project.status === "ready" ? "Fully catalogued" : project.status.replaceAll("-", " ")}</span>{project.sessionTimestamp ? <time dateTime={project.sessionTimestamp}>{new Date(project.sessionTimestamp).toLocaleDateString("en", { month: "short", day: "2-digit", year: "numeric" })}</time> : null}</div></header>
    <section className="prompt-record"><div><p className="eyebrow">Original directive</p><span>PROMPT / 001</span></div><blockquote>{project.promptExcerpt ?? "The originating prompt is not present in the recovered process record."}</blockquote><dl><div><dt>Artifact</dt><dd>{artifactKind}</dd></div><div><dt>Messages</dt><dd>{project.messageCount}</dd></div><div><dt>Processes</dt><dd>{project.toolCallCount}</dd></div><div><dt>State</dt><dd>{project.status}</dd></div></dl></section>
    {comparison ? <Link className="comparison-banner" href={`/compare/${comparison.id}`}><span>Parallel study available</span><strong>Compare {comparison.title} across {comparison.models.length} models</strong><ArrowIcon /></Link> : null}
    <ProjectWorkspace project={project} />
    <SessionMetricsPresentation metrics={project.metrics} skills={project.skills} />
    <div className="project-links"><Link href={`/models/${model}`}>More from {identity.label} <ArrowIcon /></Link>{project.demoPath ? <a href={project.demoPath} target="_blank" rel="noopener noreferrer">Raw output <ExternalIcon /></a> : null}</div>
    </main>
    <Footer />
  </>;
}
