export const MODEL_IDS = ["sol", "terra", "luna"] as const;

export type ModelId = (typeof MODEL_IDS)[number];
export type ProjectStatus = "ready" | "missing-output" | "missing-transcript" | "empty";
export type ShowcaseArtifactType = "single-html" | "static-app";

export interface ShowcaseArtifactOverride {
  type: "static-app";
  directory: string;
}

export interface SessionTokenUsage {
  input: number;
  output: number;
  reasoning: number;
  cacheRead: number;
  cacheWrite: number;
  total: number;
  reasoningReportedCalls: number;
}

export interface SessionCostUsage {
  currency: "USD";
  available: boolean;
  input: number;
  output: number;
  cacheRead: number;
  cacheWrite: number;
  total: number;
}

export interface SessionTiming {
  startedAt: string | null;
  endedAt: string | null;
  elapsedMs: number;
  activeEstimateMs: number;
  activeGapCapMs: number;
}

export interface SessionMetrics {
  apiCalls: number;
  tokens: SessionTokenUsage;
  cost: SessionCostUsage;
  timing: SessionTiming;
}

export interface ShowcaseProject {
  id: string;
  model: ModelId;
  modelLabel: string;
  modelId: string;
  order: number | null;
  title: string;
  slug: string;
  promptGroup: string;
  artifactType: ShowcaseArtifactType;
  sourceDirectory: string;
  status: ProjectStatus;
  issues: string[];
  tags: string[];
  promptExcerpt: string | null;
  demoPath: string | null;
  transcriptPath: string | null;
  sessionId: string | null;
  sessionTimestamp: string | null;
  messageCount: number;
  toolCallCount: number;
  skills: string[];
  metrics: SessionMetrics | null;
  featured: boolean;
}

export interface ShowcaseComparison {
  id: string;
  title: string;
  projectIds: string[];
  models: ModelId[];
}

export interface ShowcaseBuildRecord {
  schemaVersion: 1;
  title: string;
  model: ModelId;
  modelLabel: string;
  modelId: string;
  transcriptPath: string;
  sessionId: string | null;
  sessionTimestamp: string | null;
  messageCount: number;
  toolCallCount: number;
  skills: string[];
  metrics: SessionMetrics;
}

export interface ShowcaseCounts {
  total: number;
  ready: number;
  byModel: Record<ModelId, number>;
}

export interface ShowcaseCatalogue {
  schemaVersion: 1;
  counts: ShowcaseCounts;
  projects: ShowcaseProject[];
  comparisons: ShowcaseComparison[];
  buildRecord: ShowcaseBuildRecord | null;
}

export type TranscriptRole = "user" | "assistant" | "tool";

export interface TranscriptTextBlock {
  type: "text";
  text: string;
}

export interface TranscriptToolBlock {
  type: "tool";
  name: string;
  summary: string;
  status: "called" | "completed" | "error";
}

export type TranscriptBlock = TranscriptTextBlock | TranscriptToolBlock;

export interface TranscriptMessage {
  id: string;
  role: TranscriptRole;
  timestamp: string | null;
  blocks: TranscriptBlock[];
}

export interface ShowcaseTranscript {
  schemaVersion: 1;
  session: {
    id: string | null;
    timestamp: string | null;
    provider: string | null;
    modelId: string;
    skills: string[];
  };
  stats: {
    messages: number;
    userMessages: number;
    assistantMessages: number;
    toolCalls: number;
  };
  metrics: SessionMetrics;
  messages: TranscriptMessage[];
}

export interface ShowcaseOverrides {
  title?: string;
  slug?: string;
  order?: number;
  promptGroup?: string;
  comparisonGroup?: string | null;
  artifact?: ShowcaseArtifactOverride;
  tags?: string[];
  featured?: boolean;
}
