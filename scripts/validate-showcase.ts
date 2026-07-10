import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import type { ShowcaseCatalogue, ShowcaseTranscript } from "../src/types/showcase";

const root = join(fileURLToPath(new URL("..", import.meta.url)));
const cataloguePath = join(root, "src", "generated", "catalogue.json");
const publicGenerated = join(root, "public", "generated");
const forbiddenTranscriptKeys = new Set([
  "systemPrompt",
  "tools",
  "renderedTools",
  "thinkingSignature",
  "encrypted_content"
]);
const forbiddenTranscriptValues: Array<[string, RegExp]> = [
  ["Windows absolute path", /[A-Za-z]:\\/],
  ["private Unix path", /(^|[\s("'`])\/(?:Users|home|root|var|tmp|private|mnt|opt|srv)\//],
  ["private key", /BEGIN (?:OPENSSH|RSA|EC|DSA) PRIVATE KEY/],
  ["bearer token", /\bBearer\s+[A-Za-z0-9._~+/=-]{12,}/i],
  ["known secret format", /\b(?:AKIA[0-9A-Z]{16}|AIza[0-9A-Za-z_-]{35}|glpat-[A-Za-z0-9_-]{12,}|npm_[A-Za-z0-9]{12,}|sk_live_[A-Za-z0-9]{12,})\b/]
];

function walk(directory: string): string[] {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}

function fail(message: string): never {
  console.error(`ERROR: ${message}`);
  process.exit(1);
}

function findUnsafeTranscriptValue(value: unknown, location = "transcript"): string | null {
  if (typeof value === "string") {
    const match = forbiddenTranscriptValues.find(([, pattern]) => pattern.test(value));
    return match ? `${match[0]} at ${location}` : null;
  }
  if (Array.isArray(value)) {
    for (const [index, child] of value.entries()) {
      const issue = findUnsafeTranscriptValue(child, `${location}[${index}]`);
      if (issue) return issue;
    }
    return null;
  }
  if (value && typeof value === "object") {
    for (const [key, child] of Object.entries(value)) {
      if (forbiddenTranscriptKeys.has(key)) return `forbidden key ${key} at ${location}`;
      const issue = findUnsafeTranscriptValue(child, `${location}.${key}`);
      if (issue) return issue;
    }
  }
  return null;
}

if (!existsSync(cataloguePath)) fail("Generated catalogue is missing. Run pnpm generate first.");
const catalogue = JSON.parse(readFileSync(cataloguePath, "utf8")) as ShowcaseCatalogue;
if (catalogue.schemaVersion !== 1) fail("Unsupported catalogue schema version.");

const ids = new Set<string>();
const routes = new Set<string>();
for (const project of catalogue.projects) {
  if (ids.has(project.id)) fail(`Duplicate project id: ${project.id}`);
  ids.add(project.id);
  const route = `${project.model}/${project.slug}`;
  if (routes.has(route)) fail(`Duplicate project route: ${route}`);
  routes.add(route);
  if (project.demoPath && !existsSync(join(root, "public", project.demoPath.replace(/^\//, "")))) {
    fail(`Missing generated demo for ${project.id}: ${project.demoPath}`);
  }
  if (project.transcriptPath && !existsSync(join(root, "public", project.transcriptPath.replace(/^\//, "")))) {
    fail(`Missing generated transcript for ${project.id}: ${project.transcriptPath}`);
  }
}

for (const comparison of catalogue.comparisons) {
  if (comparison.projectIds.length < 2) fail(`Comparison ${comparison.id} has fewer than two projects.`);
  for (const projectId of comparison.projectIds) {
    if (!ids.has(projectId)) fail(`Comparison ${comparison.id} references unknown project ${projectId}.`);
    const project = catalogue.projects.find((candidate) => candidate.id === projectId);
    if (!project?.demoPath) fail(`Comparison ${comparison.id} references a project without a runnable output: ${projectId}.`);
  }
}

if (catalogue.buildRecord) {
  if (!catalogue.buildRecord.transcriptPath.startsWith("/generated/transcripts/")) fail("Build record transcript must use the generated transcript directory.");
  if (!existsSync(join(root, "public", catalogue.buildRecord.transcriptPath.replace(/^\//, "")))) fail("Build record transcript is missing.");
}

const publicFiles = walk(publicGenerated);
const rawSession = publicFiles.find((path) => /pi-session-.*\.html$/i.test(path));
if (rawSession) fail(`Raw Pi export was copied publicly: ${rawSession}`);

const transcripts = publicFiles.filter((path) => path.endsWith(".json") && path.includes(`${join("generated", "transcripts")}`));
for (const path of transcripts) {
  const transcript = JSON.parse(readFileSync(path, "utf8")) as ShowcaseTranscript;
  if (transcript.schemaVersion !== 1 || !Array.isArray(transcript.messages)) fail(`Transcript ${path} has an invalid schema.`);
  const unsafeValue = findUnsafeTranscriptValue(transcript);
  if (unsafeValue) fail(`Transcript ${path} contains ${unsafeValue}.`);
  if (statSync(path).size > 1_000_000) fail(`Transcript ${path} exceeds the 1 MB publication limit.`);
}

const incomplete = catalogue.projects.filter((project) => project.status !== "ready");
console.log(`Catalogue valid: ${catalogue.projects.length} projects, ${catalogue.counts.ready} ready, ${catalogue.comparisons.length} comparison(s).`);
console.log(`Publication safety valid: ${transcripts.length} sanitized transcript(s), no raw Pi exports.`);
if (incomplete.length) {
  console.log("Incomplete records retained as catalogue entries:");
  for (const project of incomplete) console.log(`  - ${project.sourceDirectory}: ${project.issues.join(" ")}`);
}
