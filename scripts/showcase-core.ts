import { existsSync, lstatSync, readFileSync, readdirSync } from "node:fs";
import { basename, extname, join, relative, sep } from "node:path";
import type {
  ModelId,
  SessionMetrics,
  ShowcaseOverrides,
  ShowcaseTranscript,
  TranscriptBlock,
  TranscriptMessage
} from "../src/types/showcase";

const WINDOWS_PATH = /\b[A-Za-z]:\\[^\r\n<>"'`|]*/g;
const UNIX_PRIVATE_PATH = /(^|[\s("'`])\/(?:Users|home|root|var|tmp|private|mnt|opt|srv)\/[^\s<>"'`)]*/g;
const BEARER_TOKEN = /\bBearer\s+[A-Za-z0-9._~+/=-]{12,}/gi;
const COMMON_SECRET = /\b(?:sk|ghp|github_pat|xox[abprs])[-_A-Za-z0-9]{12,}\b/g;
const HIGH_CONFIDENCE_SECRET = /\b(?:AKIA[0-9A-Z]{16}|AIza[0-9A-Za-z_-]{35}|glpat-[A-Za-z0-9_-]{12,}|npm_[A-Za-z0-9]{12,}|sk_live_[A-Za-z0-9]{12,})\b/g;
const SECRET_KEY = /(?:^|[-_])(token|secret|password|passwd|authorization|cookie|credential|api[-_]?key|private[-_]?key)(?:$|[-_])/i;
const MAX_PUBLIC_TEXT = 60_000;
const ACTIVE_GAP_CAP_MS = 5 * 60 * 1000;
const PUBLIC_ASSET_EXTENSIONS = new Set([
  ".html", ".css", ".js", ".mjs", ".cjs", ".json", ".wasm",
  ".png", ".jpg", ".jpeg", ".gif", ".webp", ".avif", ".svg", ".ico",
  ".mp3", ".wav", ".ogg", ".m4a", ".mp4", ".webm",
  ".woff", ".woff2", ".ttf", ".otf",
  ".glb", ".gltf", ".bin", ".obj", ".mtl", ".hdr", ".csv"
]);

interface RawPiUsageCost {
  input?: number;
  output?: number;
  cacheRead?: number;
  cacheWrite?: number;
  total?: number;
}

interface RawPiUsage {
  input?: number;
  output?: number;
  reasoning?: number;
  cacheRead?: number;
  cacheWrite?: number;
  totalTokens?: number;
  cost?: RawPiUsageCost;
}

interface RawPiEntry {
  type?: string;
  id?: string;
  timestamp?: string;
  provider?: string;
  modelId?: string;
  message?: {
    role?: string;
    timestamp?: number | string;
    provider?: string;
    model?: string;
    toolName?: string;
    isError?: boolean;
    content?: unknown;
    usage?: RawPiUsage;
  };
}

interface RawPiSession {
  header?: { id?: string; timestamp?: string };
  entries?: RawPiEntry[];
}

export interface NormalizedFolder {
  order: number | null;
  slug: string;
  title: string;
}

export interface DecodedSession {
  transcript: ShowcaseTranscript;
  firstUserText: string | null;
}

export function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "untitled";
}

function titleCase(value: string): string {
  return value
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((word) => {
      const lower = word.toLowerCase();
      if (["3d", "gbc", "ui", "ux", "ai"].includes(lower)) return lower.toUpperCase();
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(" ");
}

export function normalizeFolderName(folderName: string): NormalizedFolder {
  const match = folderName.trim().match(/^(\d+)\s*[._-]*\s*(.*)$/);
  const order = match ? Number.parseInt(match[1], 10) : null;
  const rawName = (match?.[2] || folderName).replace(/[._-]+/g, " ").trim();
  const title = titleCase(rawName || `Experiment ${order ?? "Untitled"}`);
  return { order, title, slug: slugify(rawName || title) };
}

export function resolveComparisonGroup(
  model: ModelId,
  slug: string,
  order: number | null,
  overrides: ShowcaseOverrides
): string {
  if (overrides.comparisonGroup === null) return `${model}-${slug}`;
  if (typeof overrides.comparisonGroup === "string") return slugify(overrides.comparisonGroup);
  if (typeof overrides.promptGroup === "string") return slugify(overrides.promptGroup);
  return order === null ? slug : `project-${String(order).padStart(2, "0")}`;
}

export function redactText(value: string): string {
  return value
    .replace(WINDOWS_PATH, "[local-path]")
    .replace(UNIX_PRIVATE_PATH, "$1[local-path]")
    .replace(BEARER_TOKEN, "Bearer [redacted]")
    .replace(COMMON_SECRET, "[redacted-secret]")
    .replace(HIGH_CONFIDENCE_SECRET, "[redacted-secret]")
    .slice(0, MAX_PUBLIC_TEXT);
}

export function redactSensitive<T>(value: T, key = ""): T | string {
  if (SECRET_KEY.test(key)) return "[redacted]";
  if (typeof value === "string") return redactText(value);
  if (Array.isArray(value)) return value.map((item) => redactSensitive(item)) as T;
  if (value && typeof value === "object") {
    const output: Record<string, unknown> = {};
    for (const [childKey, childValue] of Object.entries(value)) {
      output[childKey] = redactSensitive(childValue, childKey);
    }
    return output as T;
  }
  return value;
}

function toTimestampMs(value: number | string | undefined): number | null {
  if (typeof value !== "number" && typeof value !== "string") return null;
  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) && timestamp > 0 ? timestamp : null;
}

function roundedMoney(value: number): number {
  return Math.round(value * 1_000_000) / 1_000_000;
}

function buildSessionMetrics(entries: RawPiEntry[], headerTimestamp?: string): SessionMetrics {
  const usages = entries.map((entry) => entry.message?.usage).filter((usage): usage is RawPiUsage => Boolean(usage));
  const tokenSum = (key: keyof Omit<RawPiUsage, "cost">) => usages.reduce((sum, usage) => sum + (Number(usage[key]) || 0), 0);
  const costSum = (key: keyof RawPiUsageCost) => roundedMoney(usages.reduce((sum, usage) => sum + (Number(usage.cost?.[key]) || 0), 0));
  const timestamps = [
    toTimestampMs(headerTimestamp),
    ...entries.flatMap((entry) => [toTimestampMs(entry.timestamp), toTimestampMs(entry.message?.timestamp)])
  ].filter((timestamp): timestamp is number => timestamp !== null).sort((a, b) => a - b);
  const uniqueTimestamps = [...new Set(timestamps)];
  const startedAt = uniqueTimestamps.length ? new Date(uniqueTimestamps[0]).toISOString() : null;
  const endedAt = uniqueTimestamps.length ? new Date(uniqueTimestamps.at(-1)!).toISOString() : null;
  const elapsedMs = uniqueTimestamps.length > 1 ? uniqueTimestamps.at(-1)! - uniqueTimestamps[0] : 0;
  const activeEstimateMs = uniqueTimestamps.slice(1).reduce((sum, timestamp, index) => (
    sum + Math.min(timestamp - uniqueTimestamps[index], ACTIVE_GAP_CAP_MS)
  ), 0);
  const costAvailable = usages.some((usage) => usage.cost && Object.values(usage.cost).some((value) => Number.isFinite(value)));

  return {
    apiCalls: usages.length,
    tokens: {
      input: tokenSum("input"),
      output: tokenSum("output"),
      reasoning: tokenSum("reasoning"),
      cacheRead: tokenSum("cacheRead"),
      cacheWrite: tokenSum("cacheWrite"),
      total: tokenSum("totalTokens"),
      reasoningReportedCalls: usages.filter((usage) => Number.isFinite(usage.reasoning)).length
    },
    cost: {
      currency: "USD",
      available: costAvailable,
      input: costSum("input"),
      output: costSum("output"),
      cacheRead: costSum("cacheRead"),
      cacheWrite: costSum("cacheWrite"),
      total: costSum("total")
    },
    timing: {
      startedAt,
      endedAt,
      elapsedMs,
      activeEstimateMs,
      activeGapCapMs: ACTIVE_GAP_CAP_MS
    }
  };
}

function contentParts(content: unknown): Array<Record<string, unknown>> {
  if (!Array.isArray(content)) return [];
  return content.filter((part): part is Record<string, unknown> => Boolean(part) && typeof part === "object");
}

function safeTimestamp(value: number | string | undefined, fallback?: string): string | null {
  if (typeof value === "number") {
    const date = new Date(value);
    return Number.isNaN(date.valueOf()) ? fallback ?? null : date.toISOString();
  }
  if (typeof value === "string") {
    const date = new Date(value);
    return Number.isNaN(date.valueOf()) ? fallback ?? null : date.toISOString();
  }
  return fallback ?? null;
}

function safeSkillName(value: unknown): string | null {
  return typeof value === "string" && /^[a-z0-9][a-z0-9._-]{0,79}$/i.test(value) ? value : null;
}

function skillNameFromToolCall(name: string, args: unknown): string | null {
  if (!args || typeof args !== "object") return null;
  const record = args as Record<string, unknown>;
  if (name === "skill_load") return safeSkillName(record.skill);
  if (name === "read" && typeof record.path === "string") {
    const match = record.path.match(/[\\/]skills[\\/]([^\\/]+)[\\/]SKILL\.md$/i);
    return safeSkillName(match?.[1]);
  }
  return null;
}

function extractLoadedSkills(entries: RawPiEntry[]): string[] {
  const skills = new Set<string>();
  for (const entry of entries) {
    for (const part of contentParts(entry.message?.content)) {
      if (part.type !== "toolCall" || typeof part.name !== "string") continue;
      const skill = skillNameFromToolCall(part.name, part.arguments);
      if (skill) skills.add(skill);
    }
  }
  return [...skills].sort((a, b) => a.localeCompare(b));
}

function genericToolSummary(name: string, status: "called" | "completed" | "error", args?: unknown): string {
  const labels: Record<string, string> = {
    read: "Read a project file",
    write: "Created or replaced a project file",
    edit: "Updated a project file",
    bash: "Ran a local verification or filesystem command",
    ctx_execute: "Analyzed project data",
    ctx_execute_file: "Analyzed a project file",
    skill_load: "Loaded specialized guidance",
    todo: "Updated implementation progress",
    takomi_mode: "Updated the working mode",
    preview_export: "Generated a preview artifact"
  };
  const base = labels[name] || `Used ${name.replace(/[_-]+/g, " ")}`;
  if (status !== "called" || !args || typeof args !== "object") return base;
  const record = args as Record<string, unknown>;
  const skill = skillNameFromToolCall(name, args);
  const detail = skill ?? [record.action, record.subject, record.format, record.mode]
    .find((candidate) => typeof candidate === "string");
  return detail ? `${base} · ${redactText(String(detail)).slice(0, 80)}` : base;
}

function assistantBlocks(content: unknown): TranscriptBlock[] {
  const blocks: TranscriptBlock[] = [];
  for (const part of contentParts(content)) {
    if (part.type === "text" && typeof part.text === "string") {
      const text = redactText(part.text).trim();
      if (text) blocks.push({ type: "text", text });
    }
    if (part.type === "toolCall" && typeof part.name === "string") {
      blocks.push({
        type: "tool",
        name: part.name,
        summary: genericToolSummary(part.name, "called", part.arguments),
        status: "called"
      });
    }
  }
  return blocks;
}

function userBlocks(content: unknown): TranscriptBlock[] {
  return contentParts(content)
    .filter((part) => part.type === "text" && typeof part.text === "string")
    .map((part) => ({ type: "text" as const, text: redactText(String(part.text)).trim() }))
    .filter((part) => Boolean(part.text));
}

export function decodePiSessionHtml(html: string): DecodedSession {
  const match = html.match(/<script\b(?=[^>]*\bid=["']session-data["'])(?=[^>]*\btype=["']application\/json["'])[^>]*>\s*([\s\S]*?)\s*<\/script>/i);
  if (!match) throw new Error("Pi export does not contain a session-data payload.");

  let raw: RawPiSession;
  try {
    raw = JSON.parse(Buffer.from(match[1].trim(), "base64").toString("utf8")) as RawPiSession;
  } catch (error) {
    throw new Error(`Pi session payload could not be decoded: ${error instanceof Error ? error.message : "unknown error"}`);
  }

  const entries = raw.entries ?? [];
  const modelChange = entries.find((entry) => entry.type === "model_change");
  const assistantEntry = entries.find((entry) => entry.message?.role === "assistant");
  const modelId = modelChange?.modelId || assistantEntry?.message?.model || "unknown";
  const provider = modelChange?.provider || assistantEntry?.message?.provider || null;
  const messages: TranscriptMessage[] = [];
  const metrics = buildSessionMetrics(entries, raw.header?.timestamp);
  const skills = extractLoadedSkills(entries);
  let toolCalls = 0;
  let firstUserText: string | null = null;

  for (const [index, entry] of entries.entries()) {
    if (entry.type !== "message" || !entry.message?.role) continue;
    const role = entry.message.role;
    let blocks: TranscriptBlock[] = [];

    if (role === "user") {
      blocks = userBlocks(entry.message.content);
      if (!firstUserText) {
        firstUserText = blocks.filter((block) => block.type === "text").map((block) => block.text).join("\n").trim() || null;
      }
    } else if (role === "assistant") {
      blocks = assistantBlocks(entry.message.content);
      toolCalls += blocks.filter((block) => block.type === "tool").length;
    } else if (role === "toolResult") {
      const name = entry.message.toolName || "tool";
      blocks = [{
        type: "tool",
        name,
        summary: genericToolSummary(name, entry.message.isError ? "error" : "completed"),
        status: entry.message.isError ? "error" : "completed"
      }];
    } else {
      continue;
    }

    if (!blocks.length) continue;
    messages.push({
      id: entry.id || `message-${index + 1}`,
      role: role === "toolResult" ? "tool" : role,
      timestamp: safeTimestamp(entry.message.timestamp, entry.timestamp),
      blocks
    });
  }

  const transcript: ShowcaseTranscript = {
    schemaVersion: 1,
    session: {
      id: raw.header?.id || null,
      timestamp: safeTimestamp(raw.header?.timestamp),
      provider,
      modelId,
      skills
    },
    stats: {
      messages: messages.length,
      userMessages: messages.filter((message) => message.role === "user").length,
      assistantMessages: messages.filter((message) => message.role === "assistant").length,
      toolCalls
    },
    metrics,
    messages
  };

  return { transcript, firstUserText };
}

export function findSessionFile(directory: string): string | null {
  if (!existsSync(directory)) return null;
  return readdirSync(directory)
    .filter((file) => /^pi-session-.*\.html$/i.test(file))
    .sort()
    .at(-1) ?? null;
}

export function readOverrides(directory: string): ShowcaseOverrides {
  const path = join(directory, "showcase.json");
  if (!existsSync(path)) return {};
  const parsed = JSON.parse(readFileSync(path, "utf8")) as ShowcaseOverrides;
  return {
    ...(typeof parsed.title === "string" ? { title: parsed.title } : {}),
    ...(typeof parsed.slug === "string" ? { slug: slugify(parsed.slug) } : {}),
    ...(typeof parsed.order === "number" ? { order: parsed.order } : {}),
    ...(typeof parsed.promptGroup === "string" ? { promptGroup: slugify(parsed.promptGroup) } : {}),
    ...(parsed.comparisonGroup === null || typeof parsed.comparisonGroup === "string"
      ? { comparisonGroup: parsed.comparisonGroup === null ? null : slugify(parsed.comparisonGroup) }
      : {}),
    ...(Array.isArray(parsed.tags) ? { tags: parsed.tags.filter((tag): tag is string => typeof tag === "string") } : {}),
    ...(typeof parsed.featured === "boolean" ? { featured: parsed.featured } : {})
  };
}

export function inferTags(html: string, title: string, prompt: string | null): string[] {
  const source = `${title} ${prompt ?? ""} ${html}`.toLowerCase();
  const tags = new Set<string>();
  const add = (condition: boolean, label: string) => { if (condition) tags.add(label); };
  add(source.includes("three.js") || source.includes("three@") || source.includes("three.min"), "Three.js");
  add(source.includes("react"), "React");
  add(source.includes("tailwind"), "Tailwind");
  add(/\b3d\b|voxel|spaceship|car soccer/.test(source), "3D");
  add(/\bgame\b|soccer|zombie|monster adventure/.test(source), "Game");
  add(/audio|piano|vinyl|music/.test(source), "Audio");
  add(/editorial|archive|story/.test(source), "Editorial");
  add(/timeline|motion graphics|animation/.test(source), "Motion");
  return [...tags].slice(0, 5);
}

export function listProjectDirectories(root: string, model: ModelId): string[] {
  const modelDirectory = join(root, model.charAt(0).toUpperCase() + model.slice(1));
  if (!existsSync(modelDirectory)) return [];
  return readdirSync(modelDirectory, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => join(modelDirectory, entry.name))
    .sort((a, b) => basename(a).localeCompare(basename(b), undefined, { numeric: true }));
}

export function relativePosix(root: string, target: string): string {
  return relative(root, target).split(sep).join("/");
}

export function isPublicDemoAsset(sourceRoot: string, candidate: string): boolean {
  const rel = relativePosix(sourceRoot, candidate);
  const segments = rel.split("/").map((segment) => segment.toLowerCase());
  const file = basename(candidate).toLowerCase();
  if (segments.some((segment) => ["docs", ".git", ".pi", "node_modules", "__pycache__"].includes(segment))) return false;
  if (file.startsWith(".") || /^pi-session-.*\.html$/i.test(file) || file === "showcase.json") return false;
  if (!PUBLIC_ASSET_EXTENSIONS.has(extname(file))) return false;
  const stats = lstatSync(candidate);
  return !stats.isSymbolicLink() && stats.isFile();
}
