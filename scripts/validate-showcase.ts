import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import type { ShowcaseCatalogue, ShowcaseTranscript } from "../src/types/showcase";

const root = join(fileURLToPath(new URL("..", import.meta.url)));
const cataloguePath = join(root, "src", "generated", "catalogue.json");
const publicGenerated = join(root, "public", "generated");
const forbiddenTranscriptMarkers = [
  "C:\\CreativeOS",
  "C:\\Users\\",
  '"systemPrompt"',
  '"tools"',
  "thinkingSignature",
  "encrypted_content",
  "BEGIN OPENSSH PRIVATE KEY",
  "Bearer eyJ"
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
  }
}

const publicFiles = walk(publicGenerated);
const rawSession = publicFiles.find((path) => /pi-session-.*\.html$/i.test(path));
if (rawSession) fail(`Raw Pi export was copied publicly: ${rawSession}`);

const transcripts = publicFiles.filter((path) => path.endsWith(".json") && path.includes(`${join("generated", "transcripts")}`));
for (const path of transcripts) {
  const source = readFileSync(path, "utf8");
  const marker = forbiddenTranscriptMarkers.find((candidate) => source.includes(candidate));
  if (marker) fail(`Transcript ${path} contains forbidden marker ${JSON.stringify(marker)}.`);
  const transcript = JSON.parse(source) as ShowcaseTranscript;
  if (transcript.schemaVersion !== 1 || !Array.isArray(transcript.messages)) fail(`Transcript ${path} has an invalid schema.`);
  if (statSync(path).size > 1_000_000) fail(`Transcript ${path} exceeds the 1 MB publication limit.`);
}

const incomplete = catalogue.projects.filter((project) => project.status !== "ready");
console.log(`Catalogue valid: ${catalogue.projects.length} projects, ${catalogue.counts.ready} ready, ${catalogue.comparisons.length} comparison(s).`);
console.log(`Publication safety valid: ${transcripts.length} sanitized transcript(s), no raw Pi exports.`);
if (incomplete.length) {
  console.log("Incomplete records retained as catalogue entries:");
  for (const project of incomplete) console.log(`  - ${project.sourceDirectory}: ${project.issues.join(" ")}`);
}
