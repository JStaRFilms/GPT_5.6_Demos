import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ComparisonWorkspace } from "@/components/showcase/comparison-workspace";
import { ArrowIcon } from "@/components/showcase/icons";
import { catalogue, getComparison } from "@/lib/catalogue";
import type { ShowcaseProject } from "@/types/showcase";

export function generateStaticParams() { return catalogue.comparisons.map(({ id }) => ({ id })); }
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> { const { id } = await params; const comparison = getComparison(id); return comparison ? { title: `${comparison.title} Comparison`, description: `Compare model interpretations of ${comparison.title}.` } : {}; }

export default async function ComparisonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; const comparison = getComparison(id); if (!comparison) notFound();
  const projects = comparison.projectIds.map((projectId) => catalogue.projects.find((project) => project.id === projectId)).filter((project): project is ShowcaseProject => Boolean(project));
  return <main id="main-content" className="compare-page">
    <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">Collection</Link><span>/</span><b>Comparative study</b></nav>
    <header className="compare-hero"><div><p className="eyebrow">Comparative study / C-{String(catalogue.comparisons.indexOf(comparison) + 1).padStart(3, "0")}</p><h1>{comparison.title}</h1><p>One directive. Two independent constructions. Inspect the outputs and process records without collapsing their differences.</p><a className="inspect-link" href="#comparison-stage">Select outputs <ArrowIcon /></a></div><div className="compare-models" aria-label="Models compared">{projects.map((project, index) => <div key={project.id}><span>{String.fromCharCode(65 + index)}</span><strong>{project.modelLabel}</strong><small>{project.modelId}</small></div>)}</div></header>
    <section className="shared-prompt"><p className="eyebrow">Shared prompt context</p><blockquote>{projects[0]?.promptExcerpt ?? "Prompt context unavailable."}</blockquote><p>The archived excerpts may differ slightly where each session retained its own source wording.</p></section>
    <ComparisonWorkspace projects={projects} />
  </main>;
}
