import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  decodePiSessionHtml,
  findSessionFile,
  inferTags,
  isPublicDemoAsset,
  listProjectDirectories,
  normalizeFolderName,
  readOverrides,
  relativePosix,
  resolveComparisonGroup
} from "./showcase-core";
import { MODEL_IDS } from "../src/types/showcase";
import type {
  ModelId,
  ProjectStatus,
  SessionMetrics,
  ShowcaseBuildRecord,
  ShowcaseCatalogue,
  ShowcaseComparison,
  ShowcaseProject
} from "../src/types/showcase";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const root = join(scriptDirectory, "..");
const publicRoot = join(root, "public", "generated");
const generatedSourceRoot = join(root, "src", "generated");
const modelLabels: Record<ModelId, string> = { sol: "Sol", terra: "Terra", luna: "Luna" };

function ensureDirectory(path: string): void {
  mkdirSync(path, { recursive: true });
}

function copyDemoAssets(source: string, destination: string): void {
  ensureDirectory(destination);
  for (const entry of readdirSync(source, { withFileTypes: true })) {
    const from = join(source, entry.name);
    const to = join(destination, entry.name);
    if (entry.isDirectory()) {
      if (isPublicDemoAsset(source, from)) cpSync(from, to, { recursive: true });
      else {
        const hasPublicFiles = collectPublicFiles(source, from);
        if (hasPublicFiles.length) {
          for (const file of hasPublicFiles) {
            const relativeFile = relativePosix(source, file);
            const target = join(destination, ...relativeFile.split("/"));
            ensureDirectory(dirname(target));
            cpSync(file, target);
          }
        }
      }
    } else if (isPublicDemoAsset(source, from)) {
      cpSync(from, to);
    }
  }
}

function collectPublicFiles(sourceRoot: string, directory: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const candidate = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...collectPublicFiles(sourceRoot, candidate));
    else if (isPublicDemoAsset(sourceRoot, candidate)) files.push(candidate);
  }
  return files;
}

function statusFor(hasOutput: boolean, hasTranscript: boolean): ProjectStatus {
  if (hasOutput && hasTranscript) return "ready";
  if (!hasOutput && !hasTranscript) return "empty";
  if (!hasOutput) return "missing-output";
  return "missing-transcript";
}

function promptExcerpt(value: string | null): string | null {
  if (!value) return null;
  const compact = value.replace(/\s+/g, " ").trim();
  return compact.length > 280 ? `${compact.slice(0, 277)}…` : compact;
}

function buildProject(model: ModelId, directory: string): ShowcaseProject {
  const folder = basename(directory);
  const normalized = normalizeFolderName(folder);
  const overrides = readOverrides(directory);
  const title = overrides.title || normalized.title;
  const slug = overrides.slug || normalized.slug;
  const order = overrides.order ?? normalized.order;
  const indexPath = join(directory, "index.html");
  const hasOutput = existsSync(indexPath);
  const sessionFile = findSessionFile(directory);
  const hasTranscript = Boolean(sessionFile);
  const issues: string[] = [];
  let status = statusFor(hasOutput, hasTranscript);
  let transcriptPath: string | null = null;
  let sessionId: string | null = null;
  let sessionTimestamp: string | null = null;
  let sessionModelId = `gpt-5.6-${model}`;
  let firstPrompt: string | null = null;
  let messageCount = 0;
  let toolCallCount = 0;
  let skills: string[] = [];
  let metrics: SessionMetrics | null = null;

  if (!hasOutput) issues.push("Missing index.html output.");
  if (!hasTranscript) issues.push("Missing Pi session export.");

  if (sessionFile) {
    try {
      const decoded = decodePiSessionHtml(readFileSync(join(directory, sessionFile), "utf8"));
      sessionId = decoded.transcript.session.id;
      sessionTimestamp = decoded.transcript.session.timestamp;
      sessionModelId = decoded.transcript.session.modelId || sessionModelId;
      firstPrompt = decoded.firstUserText;
      messageCount = decoded.transcript.stats.messages;
      toolCallCount = decoded.transcript.stats.toolCalls;
      skills = decoded.transcript.session.skills;
      metrics = decoded.transcript.metrics;
      transcriptPath = `/generated/transcripts/${model}/${slug}.json`;
      const outputPath = join(publicRoot, "transcripts", model, `${slug}.json`);
      ensureDirectory(dirname(outputPath));
      writeFileSync(outputPath, `${JSON.stringify(decoded.transcript)}\n`, "utf8");
    } catch (error) {
      status = hasOutput ? "missing-transcript" : "missing-output";
      issues.push(error instanceof Error ? error.message : "Pi session could not be decoded.");
    }
  }

  let html = "";
  let demoPath: string | null = null;
  if (hasOutput) {
    html = readFileSync(indexPath, "utf8");
    demoPath = `/generated/demos/${model}/${slug}/index.html`;
    copyDemoAssets(directory, join(publicRoot, "demos", model, slug));
  }

  const inferredTags = inferTags(html, title, firstPrompt);
  const tags = [...new Set([...(overrides.tags ?? []), ...inferredTags])].slice(0, 6);

  return {
    id: `${model}-${slug}`,
    model,
    modelLabel: modelLabels[model],
    modelId: sessionModelId,
    order,
    title,
    slug,
    promptGroup: resolveComparisonGroup(model, slug, order, overrides),
    sourceDirectory: relativePosix(root, directory),
    status,
    issues,
    tags,
    promptExcerpt: promptExcerpt(firstPrompt),
    demoPath,
    transcriptPath,
    sessionId,
    sessionTimestamp,
    messageCount,
    toolCallCount,
    skills,
    metrics,
    featured: overrides.featured ?? status === "ready"
  };
}

function buildComparisons(projects: ShowcaseProject[]): ShowcaseComparison[] {
  const groups = new Map<string, ShowcaseProject[]>();
  for (const project of projects.filter((candidate) => Boolean(candidate.demoPath))) {
    groups.set(project.promptGroup, [...(groups.get(project.promptGroup) ?? []), project]);
  }
  return [...groups.entries()]
    .filter(([, members]) => new Set(members.map((member) => member.model)).size > 1)
    .map(([id, members]) => {
      const sharedOrder = members.every((member) => member.order === members[0].order) ? members[0].order : null;
      return {
      id,
      title: id.startsWith("project-") && sharedOrder !== null
        ? `Project ${String(sharedOrder).padStart(2, "0")}`
        : members[0].title,
      projectIds: members.map((member) => member.id),
      models: [...new Set(members.map((member) => member.model))]
      };
    })
    .sort((a, b) => a.title.localeCompare(b.title, undefined, { numeric: true }));
}

interface BuildRecordConfig {
  title?: string;
  session: string;
  model: ModelId;
}

function buildObservatoryRecord(): ShowcaseBuildRecord | null {
  const configPath = join(root, "showcase.meta.json");
  if (!existsSync(configPath)) return null;

  const config = JSON.parse(readFileSync(configPath, "utf8")) as BuildRecordConfig;
  if (typeof config.session !== "string" || basename(config.session) !== config.session || !/^pi-session-[A-Za-z0-9._-]+\.html$/.test(config.session)) {
    throw new Error("showcase.meta.json must reference a root-level pi-session-*.html export.");
  }
  if (!MODEL_IDS.includes(config.model)) throw new Error("showcase.meta.json contains an unsupported model.");

  const sessionPath = join(root, config.session);
  if (!existsSync(sessionPath)) throw new Error(`Configured Observatory build session is missing: ${config.session}`);
  const decoded = decodePiSessionHtml(readFileSync(sessionPath, "utf8"));
  const transcriptPath = "/generated/transcripts/observatory-build.json";
  const outputPath = join(root, "public", transcriptPath.replace(/^\//, ""));
  ensureDirectory(dirname(outputPath));
  writeFileSync(outputPath, `${JSON.stringify(decoded.transcript)}\n`, "utf8");

  return {
    schemaVersion: 1,
    title: typeof config.title === "string" && config.title.trim() ? config.title.trim() : "Built with Sol",
    model: config.model,
    modelLabel: modelLabels[config.model],
    modelId: decoded.transcript.session.modelId,
    transcriptPath,
    sessionId: decoded.transcript.session.id,
    sessionTimestamp: decoded.transcript.session.timestamp,
    messageCount: decoded.transcript.stats.messages,
    toolCallCount: decoded.transcript.stats.toolCalls,
    skills: decoded.transcript.session.skills,
    metrics: decoded.transcript.metrics
  };
}

function main(): void {
  rmSync(publicRoot, { recursive: true, force: true });
  rmSync(generatedSourceRoot, { recursive: true, force: true });
  ensureDirectory(publicRoot);
  ensureDirectory(generatedSourceRoot);

  const projects = MODEL_IDS.flatMap((model) => listProjectDirectories(root, model).map((directory) => buildProject(model, directory)))
    .sort((a, b) => {
      const modelOrder = MODEL_IDS.indexOf(a.model) - MODEL_IDS.indexOf(b.model);
      if (modelOrder) return modelOrder;
      return (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER) || a.title.localeCompare(b.title);
    });

  const buildRecord = buildObservatoryRecord();
  const catalogue: ShowcaseCatalogue = {
    schemaVersion: 1,
    counts: {
      total: projects.length,
      ready: projects.filter((project) => project.status === "ready").length,
      byModel: Object.fromEntries(MODEL_IDS.map((model) => [model, projects.filter((project) => project.model === model).length])) as Record<ModelId, number>
    },
    projects,
    comparisons: buildComparisons(projects),
    buildRecord
  };

  const json = `${JSON.stringify(catalogue, null, 2)}\n`;
  writeFileSync(join(generatedSourceRoot, "catalogue.json"), json, "utf8");
  writeFileSync(join(publicRoot, "catalogue.json"), json, "utf8");

  const ready = projects.filter((project) => project.status === "ready").length;
  const incomplete = projects.length - ready;
  console.log(`Showcase generated: ${ready} ready, ${incomplete} incomplete, ${catalogue.comparisons.length} comparison group(s).`);
  for (const project of projects.filter((candidate) => candidate.issues.length)) {
    console.log(`  - ${project.sourceDirectory}: ${project.issues.join(" ")}`);
  }
}

main();
