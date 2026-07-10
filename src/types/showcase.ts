export const MODEL_IDS = ["sol", "terra", "luna"] as const;

export type ModelId = (typeof MODEL_IDS)[number];
export type ProjectStatus = "ready" | "missing-output" | "missing-transcript" | "empty";

export interface ShowcaseProject {
  id: string;
  model: ModelId;
  modelLabel: string;
  modelId: string;
  order: number | null;
  title: string;
  slug: string;
  promptGroup: string;
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
  featured: boolean;
}

export interface ShowcaseComparison {
  id: string;
  title: string;
  projectIds: string[];
  models: ModelId[];
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
  };
  stats: {
    messages: number;
    userMessages: number;
    assistantMessages: number;
    toolCalls: number;
  };
  messages: TranscriptMessage[];
}

export interface ShowcaseOverrides {
  title?: string;
  slug?: string;
  order?: number;
  promptGroup?: string;
  tags?: string[];
  featured?: boolean;
}
