"use client";

import { useDeferredValue, useMemo, useState } from "react";
import type { ShowcaseTranscript, TranscriptRole } from "@/types/showcase";
import { ConversationIcon, ReloadIcon, SearchIcon } from "./icons";
import { TranscriptMessage } from "./transcript-message";

type RoleFilter = "all" | TranscriptRole;
interface TranscriptViewerProps { path: string; title: string }

export function TranscriptViewer({ path, title }: TranscriptViewerProps) {
  const [transcript, setTranscript] = useState<ShowcaseTranscript | null>(null);
  const [state, setState] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [query, setQuery] = useState("");
  const [role, setRole] = useState<RoleFilter>("all");
  const deferredQuery = useDeferredValue(query);

  const load = async () => {
    setState("loading");
    try {
      const response = await fetch(path);
      if (!response.ok) throw new Error("Transcript unavailable");
      setTranscript(await response.json() as ShowcaseTranscript);
      setState("ready");
    } catch {
      setState("error");
    }
  };

  const indexedMessages = useMemo(() => transcript?.messages.map((message, originalIndex) => ({
    message,
    ordinal: originalIndex + 1,
    searchText: message.blocks.map((block) => block.type === "text" ? block.text : `${block.name} ${block.summary}`).join(" ").toLocaleLowerCase()
  })) ?? [], [transcript]);

  const messages = useMemo(() => {
    const needle = deferredQuery.trim().toLocaleLowerCase();
    return indexedMessages.filter(({ message, searchText }) => (
      (role === "all" || message.role === role) && (!needle || searchText.includes(needle))
    ));
  }, [deferredQuery, indexedMessages, role]);

  if (state === "idle") return <div className="transcript-gate"><ConversationIcon /><p className="eyebrow">Process archive</p><h3>Read the making of {title}</h3><p>The sanitized conversation is fetched separately and only when requested.</p><button className="primary-button" type="button" onClick={load}>Load conversation</button></div>;
  if (state === "loading") return <div className="transcript-state" role="status"><span className="spinner" />Decoding process record…</div>;
  if (state === "error") return <div className="transcript-state" role="alert"><p>The conversation record could not be retrieved. Check the connection, then try again.</p><button className="text-button" type="button" onClick={load}><ReloadIcon /> Retry conversation</button></div>;
  if (!transcript?.messages.length) return <div className="transcript-state">This process record contains no retained messages.</div>;

  return <div className="transcript-viewer">
    <div className="transcript-controls">
      <label className="transcript-search"><SearchIcon /><span className="sr-only">Search conversation</span><input type="search" name="transcript-search" autoComplete="off" spellCheck={false} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find in process…" aria-describedby="transcript-result-count" /></label>
      <div className="role-filters" aria-label="Filter conversation by role">{(["all", "user", "assistant", "tool"] as RoleFilter[]).map((value) => <button key={value} type="button" aria-pressed={role === value} onClick={() => setRole(value)}>{value}</button>)}</div>
      <p id="transcript-result-count" aria-live="polite" aria-atomic="true"><b>{messages.length}</b> of {transcript.stats.messages} entries shown</p>
    </div>
    <div className="transcript-list">{messages.length ? messages.map(({ message, ordinal }) => <TranscriptMessage message={message} ordinal={ordinal} key={message.id} />) : <div className="transcript-state">No process entries match this search. Adjust the query or role filter.</div>}</div>
  </div>;
}
