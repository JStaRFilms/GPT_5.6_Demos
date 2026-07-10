import type { CSSProperties } from "react";
import {
  formatDuration,
  formatExactNumber,
  formatMetricNumber,
  formatSessionTimestamp,
  formatUsd,
} from "@/lib/session-metric-formatters";
import type { SessionMetrics } from "@/types/showcase";

interface MetricsPresentationProps {
  metrics: SessionMetrics | null;
  skills: string[];
  label?: string;
  modelId?: string;
  projectTitle?: string;
  accent?: string;
  variant?: "detail" | "comparison";
}

const tokenBuckets = [
  { key: "input", label: "Input / context" },
  { key: "output", label: "Generated output" },
  { key: "cacheRead", label: "Cache read" },
  { key: "cacheWrite", label: "Cache write" },
] as const;

function TokenComposition({ metrics }: { metrics: SessionMetrics }) {
  const buckets = tokenBuckets.map((bucket) => ({ ...bucket, value: metrics.tokens[bucket.key] }));
  const compositionTotal = buckets.reduce((sum, bucket) => sum + bucket.value, 0);
  let offset = 0;

  return <div className="token-composition">
    <div className="composition-figure">
      <svg viewBox="0 0 120 120" aria-hidden="true" focusable="false">
        <circle className="composition-track" cx="60" cy="60" r="47" pathLength="100" />
        {compositionTotal > 0 ? buckets.map((bucket) => {
          const percentage = (bucket.value / compositionTotal) * 100;
          const dashOffset = -offset;
          offset += percentage;
          return percentage > 0 ? <circle
            className={`composition-segment segment-${bucket.key}`}
            cx="60" cy="60" r="47" pathLength="100"
            strokeDasharray={`${percentage} ${100 - percentage}`}
            strokeDashoffset={dashOffset}
            key={bucket.key}
          /> : null;
        }) : null}
      </svg>
      <div><strong title={`${formatExactNumber(metrics.tokens.total)} provider-reported tokens`}>{formatMetricNumber(metrics.tokens.total)}</strong><span>Total tokens</span></div>
    </div>
    <dl className="composition-legend">
      {buckets.map((bucket) => <div key={bucket.key} className={`legend-${bucket.key}`}><dt>{bucket.label}</dt><dd title={formatExactNumber(bucket.value)}>{formatMetricNumber(bucket.value)}</dd></div>)}
    </dl>
    {compositionTotal !== metrics.tokens.total ? <p className="composition-note">The ring is normalized to the listed billed buckets ({formatExactNumber(compositionTotal)}); the center preserves the provider-reported total.</p> : null}
  </div>;
}

function MissingMetrics({ label }: { label?: string }) {
  return <div className="metrics-unavailable"><span aria-hidden="true" /><p><strong>No session accounting record</strong>{label ? ` is available for ${label}.` : " is available for this experiment."}</p></div>;
}

function SkillsLoaded({ skills, compact = false }: { skills: string[]; compact?: boolean }) {
  if (!skills.length) return null;
  return <div className={`skills-loaded${compact ? " skills-loaded-compact" : ""}`}>
    <span>Skills loaded</span>
    <ul>{skills.map((skill) => <li key={skill}>{skill}</li>)}</ul>
  </div>;
}

function ComparisonMetrics({ metrics, skills, label, modelId, projectTitle, accent }: MetricsPresentationProps) {
  const header = <header><div><strong>{label}</strong>{projectTitle ? <span>{projectTitle}</span> : null}</div><small>{modelId}</small></header>;
  if (!metrics) return <article className="metrics-compare-card" style={{ "--accent": accent } as CSSProperties}>{header}<MissingMetrics label={label} /><SkillsLoaded skills={skills} compact /></article>;
  const cacheTotal = metrics.tokens.cacheRead + metrics.tokens.cacheWrite;
  return <article className="metrics-compare-card" style={{ "--accent": accent } as CSSProperties}>
    {header}
    <dl className="compare-metric-core">
      <div><dt>Total tokens</dt><dd title={formatExactNumber(metrics.tokens.total)}>{formatMetricNumber(metrics.tokens.total)}</dd></div>
      <div><dt>Total cost</dt><dd>{metrics.cost.available ? formatUsd(metrics.cost.total) : "Not recorded"}</dd></div>
      <div><dt>Elapsed</dt><dd>{formatDuration(metrics.timing.elapsedMs, true)}</dd></div>
      <div><dt>Active estimate</dt><dd>≈ {formatDuration(metrics.timing.activeEstimateMs)}</dd></div>
      <div><dt>API calls</dt><dd>{formatMetricNumber(metrics.apiCalls)}</dd></div>
    </dl>
    <dl className="compare-token-breakdown">
      <div><dt>Input / context</dt><dd title={formatExactNumber(metrics.tokens.input)}>{formatMetricNumber(metrics.tokens.input)}</dd></div>
      <div><dt>Output</dt><dd title={formatExactNumber(metrics.tokens.output)}>{formatMetricNumber(metrics.tokens.output)}</dd></div>
      <div><dt>Cache R/W</dt><dd title={formatExactNumber(cacheTotal)}>{formatMetricNumber(metrics.tokens.cacheRead)} / {formatMetricNumber(metrics.tokens.cacheWrite)}</dd></div>
      <div><dt>Reasoning reported</dt><dd title={formatExactNumber(metrics.tokens.reasoning)}>{formatMetricNumber(metrics.tokens.reasoning)}</dd></div>
    </dl>
    {metrics.cost.available ? <p className="compare-cost-line">Cost · input {formatUsd(metrics.cost.input)} / output {formatUsd(metrics.cost.output)} / cache {formatUsd(metrics.cost.cacheRead + metrics.cost.cacheWrite)}</p> : null}
    <SkillsLoaded skills={skills} compact />
  </article>;
}

export function SessionMetricsPresentation(props: MetricsPresentationProps) {
  if (props.variant === "comparison") return <ComparisonMetrics {...props} />;
  const { metrics } = props;
  return <section className="session-accounting" aria-labelledby="session-accounting-title">
    <div className="accounting-heading"><div><p className="eyebrow">Process ledger</p><h2 id="session-accounting-title">Session accounting</h2></div><p>A measured view of the complete model session—from repeated context to generated output, calls, cost, and time.</p></div>
    {!metrics ? <MissingMetrics /> : <>
      <div className="accounting-layout">
        <TokenComposition metrics={metrics} />
        <dl className="accounting-primary">
          <div><dt>Reported reasoning</dt><dd title={formatExactNumber(metrics.tokens.reasoning)}>{formatMetricNumber(metrics.tokens.reasoning)}<small>tokens · {metrics.tokens.reasoningReportedCalls} calls reporting</small></dd></div>
          <div><dt>Total USD cost</dt><dd>{metrics.cost.available ? formatUsd(metrics.cost.total) : "Not recorded"}<small>{metrics.cost.available ? `input ${formatUsd(metrics.cost.input)} · output ${formatUsd(metrics.cost.output)}` : "Provider pricing was unavailable"}</small></dd></div>
          <div><dt>API calls</dt><dd>{formatMetricNumber(metrics.apiCalls)}<small>model requests</small></dd></div>
          <div><dt>Active time</dt><dd>≈ {formatDuration(metrics.timing.activeEstimateMs)}<small>estimated working intervals</small></dd></div>
        </dl>
      </div>
      <div className="timing-ledger">
        <div><span>Exact elapsed span</span><strong>{formatDuration(metrics.timing.elapsedMs, true)}</strong></div>
        <div><span>Session opened</span><time dateTime={metrics.timing.startedAt ?? undefined}>{formatSessionTimestamp(metrics.timing.startedAt)}</time></div>
        <div><span>Session closed</span><time dateTime={metrics.timing.endedAt ?? undefined}>{formatSessionTimestamp(metrics.timing.endedAt)}</time></div>
        <div><span>Cache cost</span><strong>{metrics.cost.available ? `${formatUsd(metrics.cost.cacheRead)} read · ${formatUsd(metrics.cost.cacheWrite)} write` : "Not recorded"}</strong></div>
      </div>
    </>}
    <SkillsLoaded skills={props.skills} />
    <ul className="accounting-notes">
      <li><b>Input</b> is complete context sent across calls, not only the user prompt.</li>
      <li><b>Reasoning</b> is provider-reported usage and may overlap output accounting; do not add it to the total.</li>
      <li><b>Active time</b> is approximate; each event gap is capped at {metrics ? formatDuration(metrics.timing.activeGapCapMs) : "five minutes"}.</li>
    </ul>
  </section>;
}
