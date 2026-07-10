import { memo } from "react";
import type { TranscriptMessage as TranscriptMessageType } from "@/types/showcase";
import { SafeMarkdown } from "./safe-markdown";

interface TranscriptMessageProps {
  message: TranscriptMessageType;
  ordinal: number;
}

export const TranscriptMessage = memo(function TranscriptMessage({ message, ordinal }: TranscriptMessageProps) {
  const label = message.role === "assistant" ? "Model response" : message.role === "user" ? "Curator prompt" : "Process record";
  return (
    <article className={`transcript-message role-${message.role}`}>
      <header><span>{String(ordinal).padStart(3, "0")}</span><strong>{label}</strong>{message.timestamp ? <time dateTime={message.timestamp}>{new Intl.DateTimeFormat("en", { hour: "2-digit", minute: "2-digit" }).format(new Date(message.timestamp))}</time> : null}</header>
      <div className="message-content">
        {message.blocks.map((block, blockIndex) => block.type === "text" ? <SafeMarkdown text={block.text} key={blockIndex} /> : (
          <details className={`tool-entry tool-${block.status}`} key={blockIndex}>
            <summary><span>{block.status}</span><strong>{block.name}</strong><small>Process detail</small></summary>
            <p>{block.summary || "No additional output was retained."}</p>
          </details>
        ))}
      </div>
    </article>
  );
});
