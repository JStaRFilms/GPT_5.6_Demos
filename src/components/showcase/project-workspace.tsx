"use client";

import { useId, useRef, useState, type KeyboardEvent } from "react";
import type { ShowcaseProject } from "@/types/showcase";
import { ConversationIcon, MonitorIcon } from "./icons";
import { PreviewFrame } from "./preview-frame";
import { TranscriptViewer } from "./transcript-viewer";
import { useMediaQuery } from "./use-media-query";

type WorkspaceTab = "preview" | "conversation";
const tabs: WorkspaceTab[] = ["preview", "conversation"];

export function ProjectWorkspace({ project }: { project: ShowcaseProject }) {
  const [tab, setTab] = useState<WorkspaceTab>("preview");
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const compact = useMediaQuery("(max-width: 760px)");
  const instanceId = useId().replaceAll(":", "");
  const tabId = (value: WorkspaceTab) => `${instanceId}-${value}-tab`;
  const panelId = (value: WorkspaceTab) => `${instanceId}-${value}-panel`;

  const selectTab = (index: number) => {
    const next = tabs[index];
    setTab(next);
    tabRefs.current[index]?.focus();
  };

  const handleTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let nextIndex: number | null = null;
    if (event.key === "ArrowRight") nextIndex = (index + 1) % tabs.length;
    if (event.key === "ArrowLeft") nextIndex = (index - 1 + tabs.length) % tabs.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = tabs.length - 1;
    if (nextIndex === null) return;
    event.preventDefault();
    selectTab(nextIndex);
  };

  return <section className="workspace" id="workspace" aria-labelledby="workspace-title">
    <div className="section-heading workspace-heading"><div><p className="eyebrow">Inspection chamber</p><h2 id="workspace-title">Output &amp; process</h2></div><p>2 synchronized views of 1 experiment</p></div>
    <div className="workspace-tabs" role={compact ? "tablist" : undefined} aria-label={compact ? "Workspace view" : undefined}>
      {tabs.map((value, index) => {
        const Icon = value === "preview" ? MonitorIcon : ConversationIcon;
        return <button
          key={value}
          id={tabId(value)}
          ref={(node) => { tabRefs.current[index] = node; }}
          type="button"
          role={compact ? "tab" : undefined}
          aria-controls={compact ? panelId(value) : undefined}
          aria-selected={compact ? tab === value : undefined}
          tabIndex={compact && tab !== value ? -1 : 0}
          onClick={() => setTab(value)}
          onKeyDown={(event) => handleTabKeyDown(event, index)}
        ><Icon /> {value === "preview" ? "Preview" : "Conversation"}</button>;
      })}
    </div>
    <div className="workspace-grid">
      <section
        id={panelId("preview")}
        className={tab === "preview" ? "workspace-panel active" : "workspace-panel"}
        role={compact ? "tabpanel" : "region"}
        aria-labelledby={compact ? tabId("preview") : `${instanceId}-preview-title`}
        hidden={compact && tab !== "preview"}
      >
        <h3 className="sr-only" id={`${instanceId}-preview-title`}>Interactive output</h3>
        {project.demoPath ? <PreviewFrame src={project.demoPath} title={project.title} /> : <Unavailable kind="preview" />}
      </section>
      <section
        id={panelId("conversation")}
        className={tab === "conversation" ? "workspace-panel active" : "workspace-panel conversation-panel"}
        role={compact ? "tabpanel" : "region"}
        aria-labelledby={compact ? tabId("conversation") : `${instanceId}-conversation-title`}
        hidden={compact && tab !== "conversation"}
      >
        <h3 className="sr-only" id={`${instanceId}-conversation-title`}>Process conversation</h3>
        {project.transcriptPath ? <TranscriptViewer path={project.transcriptPath} title={project.title} /> : <Unavailable kind="conversation" />}
      </section>
    </div>
  </section>;
}

function Unavailable({ kind }: { kind: string }) {
  return <div className="unavailable"><span aria-hidden="true" /><p className="eyebrow">Record incomplete</p><h3>No {kind} is available yet.</h3><p>The catalogue retains this specimen while its missing material is recovered.</p></div>;
}
