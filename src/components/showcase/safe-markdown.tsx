import type { ReactNode } from "react";

function inline(text: string): ReactNode[] {
  return text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g).filter(Boolean).map((part, index) => {
    if (part.startsWith("`") && part.endsWith("`")) return <code key={index}>{part.slice(1, -1)}</code>;
    if (part.startsWith("**") && part.endsWith("**")) return <strong key={index}>{part.slice(2, -2)}</strong>;
    return part;
  });
}

export function SafeMarkdown({ text }: { text: string }) {
  const lines = text.replaceAll("\r\n", "\n").split("\n");
  return <div className="safe-markdown">{lines.map((line, index) => {
    if (line.startsWith("### ")) return <h5 key={index}>{inline(line.slice(4))}</h5>;
    if (line.startsWith("## ")) return <h4 key={index}>{inline(line.slice(3))}</h4>;
    if (line.startsWith("# ")) return <h3 key={index}>{inline(line.slice(2))}</h3>;
    if (/^[-*] /.test(line)) return <div className="markdown-list-item" key={index}><span>—</span><p>{inline(line.slice(2))}</p></div>;
    if (/^\d+\. /.test(line)) return <div className="markdown-list-item" key={index}><span>{line.match(/^\d+/)?.[0]}.</span><p>{inline(line.replace(/^\d+\. /, ""))}</p></div>;
    if (line.startsWith("> ")) return <blockquote key={index}>{inline(line.slice(2))}</blockquote>;
    if (!line) return <br key={index} />;
    return <p key={index}>{inline(line)}</p>;
  })}</div>;
}
