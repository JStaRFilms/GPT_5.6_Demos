"use client";

import { useEffect, useRef, useState } from "react";
import { ExpandIcon, ExternalIcon, MonitorIcon, PhoneIcon, PlayIcon, ReloadIcon, StopIcon, TabletIcon } from "./icons";

type Viewport = "desktop" | "tablet" | "mobile";
type PreviewState = "dormant" | "loading" | "ready" | "error";

interface PreviewFrameProps {
  src: string;
  title: string;
}

const PREVIEW_TIMEOUT_MS = 12_000;

export function PreviewFrame({ src, title }: PreviewFrameProps) {
  const [state, setState] = useState<PreviewState>("dormant");
  const [viewport, setViewport] = useState<Viewport>("desktop");
  const [key, setKey] = useState(0);
  const stageRef = useRef<HTMLDivElement>(null);
  const active = state !== "dormant";

  useEffect(() => {
    if (state !== "loading") return;
    const timer = window.setTimeout(() => setState("error"), PREVIEW_TIMEOUT_MS);
    return () => window.clearTimeout(timer);
  }, [key, state]);

  const activate = () => setState("loading");
  const retry = () => {
    setState("loading");
    setKey((value) => value + 1);
  };
  const suspend = () => {
    setState("dormant");
    setKey((value) => value + 1);
  };
  const fullscreen = async () => {
    try {
      await stageRef.current?.requestFullscreen();
    } catch {
      // Fullscreen remains controlled by the browser and user permissions.
    }
  };

  return (
    <section className="preview-module" aria-label={`${title} live preview`}>
      <div className="module-toolbar">
        <div className="toolbar-title"><i className="live-dot" />LIVE OUTPUT <span>{active ? "Sandbox active" : "Dormant"}</span></div>
        <div className="preview-actions">
          <div className="viewport-switch" aria-label="Preview viewport">
            {(["desktop", "tablet", "mobile"] as Viewport[]).map((value) => {
              const DeviceIcon = value === "desktop" ? MonitorIcon : value === "tablet" ? TabletIcon : PhoneIcon;
              return <button key={value} type="button" onClick={() => setViewport(value)} aria-pressed={viewport === value} aria-label={`${value} viewport`}><DeviceIcon /></button>;
            })}
          </div>
          <button type="button" onClick={retry} disabled={!active} aria-label="Reload preview"><ReloadIcon /></button>
          <button type="button" onClick={fullscreen} disabled={!active || state === "error"} aria-label="View preview fullscreen"><ExpandIcon /></button>
          {active ? <button className="suspend-preview" type="button" onClick={suspend} aria-label="Suspend and unload preview"><StopIcon /><span>Suspend</span></button> : null}
          <a href={src} target="_blank" rel="noopener noreferrer" aria-label="Open preview separately"><ExternalIcon /></a>
        </div>
      </div>
      <div className="preview-stage" ref={stageRef} data-viewport={viewport}>
        {state === "dormant" ? <div className="preview-gate"><span className="gate-orbit" aria-hidden="true"><i /></span><p className="eyebrow">Artifact dormant</p><h3>Open the live specimen</h3><p>Interactive output loads only on request to conserve memory, audio, and network resources.</p><button type="button" className="primary-button" onClick={activate}><PlayIcon /> Initialize preview</button></div> : null}
        {active ? <div className="iframe-shell">
          {state === "loading" ? <div className="frame-loading" role="status"><span /><p>Calibrating environment…</p></div> : null}
          {state === "error" ? <div className="frame-error" role="alert"><p className="eyebrow">Preview did not respond</p><h3>The live specimen could not initialize.</h3><p>Its resources may be unavailable or slower than the isolated viewer permits. Retry here, or open the artifact separately.</p><div><button className="primary-button" type="button" onClick={retry}><ReloadIcon /> Retry preview</button><a className="secondary-button" href={src} target="_blank" rel="noopener noreferrer"><ExternalIcon /> Open separately</a></div></div> : null}
          {state !== "error" ? <iframe key={key} src={src} title={`${title} interactive output`} sandbox="allow-scripts allow-pointer-lock allow-downloads" allow="fullscreen" allowFullScreen referrerPolicy="no-referrer" onLoad={() => setState((current) => current === "loading" ? "ready" : current)} /> : null}
        </div> : null}
      </div>
      <p className="compatibility-note">Isolated execution · Scripts and pointer lock permitted · Use Suspend to unload active audio, graphics, and processes</p>
    </section>
  );
}
