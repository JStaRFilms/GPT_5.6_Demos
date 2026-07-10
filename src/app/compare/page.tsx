import type { Metadata } from "next";
import Link from "next/link";
import { ArrowIcon } from "@/components/showcase/icons";
import { catalogue } from "@/lib/catalogue";
import { models } from "@/lib/models";
import type { ShowcaseProject } from "@/types/showcase";

export const metadata: Metadata = {
  title: "Comparative Studies",
  description: "Browse model experiments produced from the same numbered project brief.",
};

function getProjects(projectIds: string[]): ShowcaseProject[] {
  return projectIds
    .map((projectId) => catalogue.projects.find((project) => project.id === projectId))
    .filter((project): project is ShowcaseProject => Boolean(project));
}

export default function ComparisonsPage() {
  return <main id="main-content" className="compare-page comparison-index-page">
    <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">Collection</Link><span>/</span><b>Comparative studies</b></nav>
    <header className="comparison-index-hero">
      <div><p className="eyebrow">Cross-model register / {String(catalogue.comparisons.length).padStart(2, "0")} studies</p><h1>Parallel<br/><em>records.</em></h1></div>
      <div className="comparison-index-intro"><span aria-hidden="true">A<br/><i>×</i><br/>B</span><p>Each study joins independent model responses to the same numbered project brief. Project titles can—and often do—differ.</p></div>
    </header>
    <section className="comparison-register" aria-labelledby="comparison-register-title">
      <div className="section-heading"><div><p className="eyebrow">Study catalogue</p><h2 id="comparison-register-title">Comparative studies</h2></div><p>Grouped by project brief, not title</p></div>
      {catalogue.comparisons.length ? <ol className="comparison-records">
        {catalogue.comparisons.map((comparison, comparisonIndex) => {
          const projects = getProjects(comparison.projectIds);
          return <li key={comparison.id}>
            <article className="comparison-record">
              <header><span>C-{String(comparisonIndex + 1).padStart(3, "0")}</span><div><h3>{comparison.title}</h3><code>{comparison.id}</code></div><small>{projects.length} model{projects.length === 1 ? "" : "s"}</small></header>
              <div className="comparison-record-projects">
                {projects.map((project) => <div key={project.id} style={{ "--accent": models[project.model].accent } as React.CSSProperties}>
                  <span><i aria-hidden="true" />{project.modelLabel}</span>
                  <strong>{project.title}</strong>
                  <div className="comparison-record-meta">
                    <small>{project.modelId}</small>
                    {!project.transcriptPath ? <small className="process-record-missing">Live output · process record unavailable</small> : null}
                  </div>
                </div>)}
              </div>
              <footer><p>Shared numbered brief <span>/</span> distinct interpretations</p><Link href={`/compare/${comparison.id}`} aria-label={`Open ${comparison.title} comparative study`}>Open study <ArrowIcon /></Link></footer>
            </article>
          </li>;
        })}
      </ol> : <div className="empty-state comparison-empty"><span className="empty-orbit"/><p className="eyebrow">No aligned records</p><h3>Comparative studies will appear when a project brief has responses from more than one model.</h3><p>The register updates automatically from the generated catalogue.</p><Link className="text-button" href="/">Return to the collection</Link></div>}
    </section>
  </main>;
}
