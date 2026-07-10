import Link from "next/link";
import { Gallery } from "@/components/showcase/gallery";
import { ArrowIcon } from "@/components/showcase/icons";
import { catalogue } from "@/lib/catalogue";
import { models } from "@/lib/models";

export default function HomePage() {
  return <main id="main-content">
    <section className="home-hero">
      <div className="hero-copy"><p className="eyebrow">Computational exhibition / Field log 2026</p><h1>Three minds.<br/><em>One creative frontier.</em></h1><p className="hero-intro">An active archive of interfaces, simulations, and imagined worlds—each specimen preserved with the conversation that brought it into being.</p><a href="#catalogue" className="hero-link">Enter the collection <ArrowIcon /></a></div>
      <div className="hero-orbit" aria-hidden="true"><span className="axis axis-x"/><span className="axis axis-y"/><i className="ring ring-1"/><i className="ring ring-2"/><i className="ring ring-3"/><b className="body body-sol"/><b className="body body-terra"/><b className="body body-luna"/><small>OBSERVATION<br/>FIELD 01</small></div>
      <div className="hero-stats" aria-label="Collection statistics"><div><strong>{String(catalogue.counts.ready).padStart(2, "0")}</strong><span>Runnable<br/>artifacts</span></div><div><strong>{String(catalogue.projects.reduce((sum, project) => sum + project.messageCount, 0)).padStart(3, "0")}</strong><span>Process<br/>messages</span></div><div><strong>03</strong><span>Model<br/>practices</span></div></div>
    </section>
    <section className="model-legend" aria-labelledby="legend-title"><div className="legend-intro"><p className="eyebrow">The practitioners</p><h2 id="legend-title">Distinct systems,<br/>shared conditions.</h2></div>{Object.values(models).map((model) => <Link href={`/models/${model.id}`} key={model.id} className="legend-model" style={{ "--accent": model.accent } as React.CSSProperties}><span className="legend-code">{model.code}</span><i/><div><h3>{model.label}</h3><p>{model.thesis}</p><small>{catalogue.counts.byModel[model.id]} registered</small></div><ArrowIcon /></Link>)}</section>
    <Gallery projects={catalogue.projects} />
  </main>;
}
