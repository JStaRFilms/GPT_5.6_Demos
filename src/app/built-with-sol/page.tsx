import type { Metadata } from "next";
import Link from "next/link";
import { ExternalIcon } from "@/components/showcase/icons";
import { SessionMetricsPresentation } from "@/components/showcase/session-metrics";
import { TranscriptViewer } from "@/components/showcase/transcript-viewer";
import { catalogue } from "@/lib/catalogue";
import { formatExactNumber, formatSessionTimestamp } from "@/lib/session-metric-formatters";

export const metadata: Metadata = {
  title: "Built with Sol",
  description: "The Model Observatory observes its own construction: a live site, measured build record, and sanitized process transcript.",
  openGraph: {
    title: "Built with Sol — Model Observatory",
    description: "A measured record of how the Model Observatory was built.",
    type: "website",
  },
};

function LiveSiteFrame() {
  return <section className="build-mirror" aria-labelledby="build-mirror-title">
    <div className="build-section-heading">
      <div><p className="eyebrow">Site mirror / live signal</p><h2 id="build-mirror-title">The Observatory,<br/><em>under observation.</em></h2></div>
      <p>This is the live collection—not a reproduction. Navigate it here, or open the full site to leave the frame.</p>
    </div>
    <div className="live-site-browser">
      <div className="browser-chrome">
        <div className="browser-lights" aria-hidden="true"><i/><i/><i/></div>
        <div className="browser-address"><span aria-hidden="true">○</span><strong>model-observatory.local</strong><span>/</span></div>
        <a href="/" target="_blank" rel="noopener noreferrer" aria-label="Open the full Model Observatory in a new tab">Open full site <ExternalIcon /></a>
      </div>
      <div className="live-site-viewport">
        <iframe src="/" title="Live Model Observatory homepage" loading="lazy" />
        <span className="frame-index" aria-hidden="true">FRAME / 01<br/>OBSERVING / SELF</span>
      </div>
    </div>
  </section>;
}

export default function BuiltWithSolPage() {
  const record = catalogue.buildRecord;

  if (!record) return <main id="main-content" className="built-with-sol-page">
    <section className="build-unavailable" aria-labelledby="build-unavailable-title">
      <span className="build-sigil" aria-hidden="true"><i/><i/><i/></span>
      <div><p className="eyebrow">Build record / unavailable</p><h1 id="build-unavailable-title">The instrument is here.<br/><em>Its log is not.</em></h1><p>The Observatory remains open, but no public construction record is present in this catalogue.</p><Link className="text-button" href="/">Return to the collection</Link></div>
    </section>
  </main>;

  return <main id="main-content" className="built-with-sol-page">
    <header className="build-hero">
      <div className="build-hero-copy">
        <p className="eyebrow">Construction record / Self-study 001</p>
        <h1>This website<br/>was built <em>with Sol.</em></h1>
        <p>The Observatory preserves the making of each specimen. Here, the lens turns quietly toward the institution itself.</p>
        <a className="inspect-link" href="#live-site">Observe the live site <span aria-hidden="true">↓</span></a>
      </div>
      <div className="build-sigil" aria-hidden="true"><i/><i/><i/><span>OBJECT<br/>/ OBSERVER</span></div>
    </header>

    <section className="build-register" aria-label="Build record summary">
      <div><span>Builder</span><strong>{record.modelLabel}</strong><small>{record.modelId}</small></div>
      <div><span>Conversation</span><strong>{formatExactNumber(record.messageCount)}</strong><small>retained messages</small></div>
      <div><span>Processes</span><strong>{formatExactNumber(record.toolCallCount)}</strong><small>tool calls</small></div>
      <div><span>Session opened</span><strong className="register-time">{formatSessionTimestamp(record.sessionTimestamp)}</strong><small>public record timestamp</small></div>
      <div><span>Accession</span><strong className="register-id">{record.sessionId ?? "Not recorded"}</strong><small>build session</small></div>
    </section>

    <div id="live-site"><LiveSiteFrame /></div>

    <section className="build-accounting-intro">
      <p className="eyebrow">Measured construction</p>
      <p>The process ledger reports generated values from the complete build session. Counts, timing, tokens, and cost remain attached to the record rather than the page.</p>
    </section>
    <SessionMetricsPresentation metrics={record.metrics} skills={record.skills} />

    <section className="build-transcript" aria-labelledby="build-transcript-title">
      <div className="build-section-heading">
        <div><p className="eyebrow">Sanitized process archive</p><h2 id="build-transcript-title">A record of<br/><em>the making.</em></h2></div>
        <p>The conversation stays sealed until requested, then opens inside this contained reader. Private reasoning, raw exports, and sensitive local data are not part of the exhibit.</p>
      </div>
      <div className="build-transcript-chamber">
        <TranscriptViewer path={record.transcriptPath} title={record.title} />
      </div>
    </section>
  </main>;
}
