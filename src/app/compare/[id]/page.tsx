import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ComparisonWorkspace } from "@/components/showcase/comparison-workspace";
import { ArrowIcon } from "@/components/showcase/icons";
import { SessionMetricsPresentation } from "@/components/showcase/session-metrics";
import { catalogue, getComparison } from "@/lib/catalogue";
import { models } from "@/lib/models";
import type { ShowcaseProject } from "@/types/showcase";

export function generateStaticParams() { return catalogue.comparisons.map(({ id }) => ({ id })); }
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> { const { id } = await params; const comparison = getComparison(id); return comparison ? { title: `${comparison.title} Comparison`, description: `Compare independent model responses to the numbered brief for ${comparison.title}.` } : {}; }

export default async function ComparisonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; const comparison = getComparison(id); if (!comparison) notFound();
  const projects = comparison.projectIds.map((projectId) => catalogue.projects.find((project) => project.id === projectId)).filter((project): project is ShowcaseProject => Boolean(project));
  return <main id="main-content" className="compare-page">
    <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">Collection</Link><span>/</span><Link href="/compare">Comparative studies</Link><span>/</span><b>{comparison.title}</b></nav>
    <header className="compare-hero"><div><p className="eyebrow">Comparative study / C-{String(catalogue.comparisons.indexOf(comparison) + 1).padStart(3, "0")}</p><h1>{comparison.title}</h1><p>One numbered brief. Independent constructions and project names. Inspect the outputs and process records without collapsing their differences.</p><a className="inspect-link" href="#comparison-stage">Select outputs <ArrowIcon /></a></div><div className="compare-models" aria-label="Models and projects compared">{projects.map((project, index) => <div key={project.id}><span>{String.fromCharCode(65 + index)}</span><div><strong>{project.modelLabel}</strong><em>{project.title}</em></div><small>{project.modelId}</small></div>)}</div></header>
    <section className="shared-prompt"><p className="eyebrow">Numbered brief context</p><blockquote>{projects[0]?.promptExcerpt ?? "Prompt context unavailable."}</blockquote><p>This group aligns by numbered project brief. Archived excerpts and chosen project titles may differ between model sessions.</p></section>
    <section className="comparison-accounting" aria-labelledby="comparison-accounting-title"><div className="comparison-accounting-heading"><div><p className="eyebrow">Efficiency ledger</p><h2 id="comparison-accounting-title">Session metrics at a glance</h2></div><p>Provider-reported totals shown on one scale. Reasoning is listed separately and is not added to total tokens.</p></div><div className="comparison-accounting-grid">{projects.map((project) => <SessionMetricsPresentation key={project.id} variant="comparison" metrics={project.metrics} skills={project.skills} label={project.modelLabel} modelId={project.modelId} projectTitle={project.title} accent={models[project.model].accent} />)}</div></section>
    <ComparisonWorkspace projects={projects} />
  </main>;
}
