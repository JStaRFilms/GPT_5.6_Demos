"use client";

import { useMemo, useState } from "react";
import type { ModelId, ShowcaseProject } from "@/types/showcase";
import { ProjectCard } from "./project-card";
import { SearchIcon } from "./icons";

type FilterModel = "all" | ModelId;
type StatusFilter = "all" | "ready" | "incomplete";
type Sort = "curated" | "title" | "model";

export function Gallery({ projects }: { projects: ShowcaseProject[] }) {
  const [query, setQuery] = useState("");
  const [model, setModel] = useState<FilterModel>("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [sort, setSort] = useState<Sort>("curated");
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return projects.filter((project) => {
      const searchMatch = !needle || [project.title, project.modelLabel, ...project.tags].join(" ").toLowerCase().includes(needle);
      const statusMatch = status === "all" || (status === "ready" ? project.status === "ready" : project.status !== "ready");
      return searchMatch && (model === "all" || project.model === model) && statusMatch;
    }).sort((a, b) => sort === "title" ? a.title.localeCompare(b.title) : sort === "model" ? a.model.localeCompare(b.model) : Number(b.featured) - Number(a.featured) || (a.order ?? 99) - (b.order ?? 99));
  }, [model, projects, query, sort, status]);

  const reset = () => { setQuery(""); setModel("all"); setStatus("all"); setSort("curated"); };
  return (
    <section className="catalogue-section" id="catalogue" aria-labelledby="catalogue-title">
      <div className="section-heading"><div><p className="eyebrow">Index / 001—{String(projects.length).padStart(3, "0")}</p><h2 id="catalogue-title">Collected specimens</h2></div><p aria-live="polite">{filtered.length} {filtered.length === 1 ? "record" : "records"} in view</p></div>
      <div className="catalogue-controls">
        <label className="search-field"><span className="sr-only">Search projects</span><SearchIcon /><input value={query} onChange={(event) => setQuery(event.target.value)} type="search" name="project-search" autoComplete="off" spellCheck={false} placeholder="Search title, model, or medium…" /></label>
        <fieldset className="segmented"><legend className="sr-only">Filter by model</legend>{(["all", "sol", "terra", "luna"] as FilterModel[]).map((value) => <button type="button" aria-pressed={model === value} onClick={() => setModel(value)} key={value}>{value}</button>)}</fieldset>
        <label className="select-control"><span>Status</span><select value={status} onChange={(event) => setStatus(event.target.value as StatusFilter)}><option value="all">All states</option><option value="ready">Ready</option><option value="incomplete">Incomplete</option></select></label>
        <label className="select-control"><span>Order</span><select value={sort} onChange={(event) => setSort(event.target.value as Sort)}><option value="curated">Curated</option><option value="title">A—Z</option><option value="model">By model</option></select></label>
      </div>
      {filtered.length ? <div className="project-grid">{filtered.map((project, index) => <ProjectCard project={project} index={index} key={project.id} />)}</div> : <div className="empty-state"><span className="empty-orbit" aria-hidden="true" /><p className="eyebrow">No signal returned</p><h3>The archive has no matching specimens.</h3><p>Broaden the search field or clear one of the active filters.</p><button type="button" className="text-button" onClick={reset}>Reset the index</button></div>}
    </section>
  );
}
