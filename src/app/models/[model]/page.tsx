import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowIcon } from "@/components/showcase/icons";
import { ProjectCard } from "@/components/showcase/project-card";
import { getProjectsByModel } from "@/lib/catalogue";
import { isModelId, models } from "@/lib/models";
import { MODEL_IDS } from "@/types/showcase";

export function generateStaticParams() { return MODEL_IDS.map((model) => ({ model })); }

export async function generateMetadata({ params }: { params: Promise<{ model: string }> }): Promise<Metadata> {
  const { model } = await params;
  if (!isModelId(model)) return {};
  return { title: `${models[model].label} Collection`, description: models[model].description };
}

export default async function ModelPage({ params }: { params: Promise<{ model: string }> }) {
  const { model } = await params;
  if (!isModelId(model)) notFound();
  const identity = models[model];
  const projects = getProjectsByModel(model);
  const ready = projects.filter((project) => project.status === "ready").length;
  const messages = projects.reduce((sum, project) => sum + project.messageCount, 0);
  return <main id="main-content" className={`model-page model-${model}`} style={{ "--accent": identity.accent } as React.CSSProperties}>
    <section className="model-hero"><div className="model-index"><span>{identity.code}</span><i/><small>MODEL PRACTICE</small></div><div className="model-title"><p className="eyebrow">Collection / {identity.code}</p><h1>{identity.label}</h1><p>{identity.description}</p></div><div className="model-orbital" aria-hidden="true"><i/><b>{identity.label.charAt(0)}</b></div></section>
    <section className="model-register"><div><span>Status</span><strong>{projects.length ? "ACTIVE" : "AWAITING SIGNAL"}</strong></div><div><span>Registered</span><strong>{String(projects.length).padStart(2, "0")}</strong></div><div><span>Runnable</span><strong>{String(ready).padStart(2, "0")}</strong></div><div><span>Messages</span><strong>{String(messages).padStart(3, "0")}</strong></div><div><span>Character</span><strong>{identity.thesis}</strong></div></section>
    <section className="model-projects"><div className="section-heading"><div><p className="eyebrow">Practice index</p><h2>Experiments by {identity.label}</h2></div><Link href="/#catalogue">Full collection <ArrowIcon /></Link></div>{projects.length ? <div className="project-grid">{projects.map((project, index) => <ProjectCard project={project} index={index} key={project.id}/>)}</div> : <div className="empty-state model-empty"><span className="empty-orbit"/><p className="eyebrow">Chamber reserved</p><h3>No specimens have arrived from {identity.label}—yet.</h3><p>The collection is designed to grow. This model register will activate automatically when its first experiment is catalogued.</p><Link className="text-button" href="/">Return to the active archive</Link></div>}</section>
  </main>;
}
