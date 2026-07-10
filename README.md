# Model Observatory

A static-first exhibition for projects created by the **Sol**, **Terra**, and **Luna** OpenAI models. Each experiment can include a runnable output, its sanitized Pi conversation, model metadata, and a comparison with equivalent experiments from other models.

## Architecture

```text
Sol / Terra / Luna experiment folders
                │
                ▼
      pnpm generate (build time)
                │
     ┌──────────┴──────────┐
     ▼                     ▼
public/generated      src/generated
sandboxed demos       typed catalogue
sanitized transcripts
                │
                ▼
      Next.js static routes → Vercel CDN
```

- **Next.js App Router + TypeScript + Tailwind CSS v4**
- **pnpm** package management
- No database, authentication, runtime API, or server-side content store
- Git is the source of truth; Vercel rebuilds the catalogue on every deployment
- Demo iframes and transcripts load only after a visitor requests them

## Current collection

The collection is intentionally open-ended. Run `pnpm validate` to see the current number of ready records, incomplete records, sanitized transcripts, and cross-model comparisons. Newly added folders are included automatically without changing application code.

## Local development

Requirements:

- Node.js 22
- pnpm 10.33.2 or a compatible pnpm 10 release

```bash
pnpm install
pnpm dev
```

`pnpm dev` regenerates the catalogue and publication assets before starting Next.js.

Useful commands:

```bash
pnpm generate   # scan folders, copy demos, sanitize conversations
pnpm validate   # validate routes, generated assets, and publication safety
pnpm test       # unit tests for normalization and transcript sanitization
pnpm typecheck  # regenerate and run TypeScript
pnpm lint       # lint source and tooling
pnpm build      # regenerate and create the production build
pnpm verify     # run every release gate above
```

Generated files under `public/generated/` and `src/generated/` are intentionally ignored by Git. They are recreated locally and during every Vercel build. Demo copying uses a web/media asset extension allowlist and ignores symlinks, hidden files, docs, Markdown, metadata, and raw Pi exports.

## Adding an experiment

Create a directory under the model that produced it:

```text
Sol/
  11. example-project/
    index.html
    pi-session-2026-...html
    showcase.json          # optional
    assets/                # optional project-local assets
```

By default, the required output filename is `index.html`. A Pi export must match `pi-session-*.html`. Incomplete folders remain visible in the catalogue with a clear status instead of breaking the build.

Then run:

```bash
pnpm validate
pnpm dev
```

### Optional `showcase.json`

Most metadata is inferred from the folder, HTML, and Pi session. Add `showcase.json` only to override it:

```json
{
  "$schema": "../../docs/showcase.schema.json",
  "title": "Nitro League",
  "slug": "nitro-league",
  "order": 8,
  "comparisonGroup": "project-08",
  "tags": ["3D", "Game", "Three.js"],
  "featured": true
}
```

Comparison groups are inferred from the numeric project prefix: every runnable Project 1 joins `project-01`, Project 2 joins `project-02`, and so on across Sol, Terra, and Luna. A comparison page appears once at least two models have an output in the same number. Missing transcripts remain clearly marked instead of hiding an otherwise valid output comparison.

Use `comparisonGroup` only when you want manual control. Give projects the same custom string to match them, or set it to `null` to exclude one from comparison. The older `promptGroup` field remains supported for compatibility. `docs/showcase.schema.json` provides editor validation and autocomplete.

### Full static applications

A larger web application can publish a prebuilt static export without being flattened into a single HTML file:

```json
{
  "$schema": "../../docs/showcase.schema.json",
  "artifact": {
    "type": "static-app",
    "directory": "out"
  }
}
```

The declared directory must be a safe relative path and contain `index.html`. Its allowlisted web assets are copied into the isolated generated demo directory. The Observatory never installs dependencies or executes nested project build scripts automatically; build the application explicitly with `pnpm`, review the resulting artifact, and commit the declared export when it should ship on Vercel.

### Observatory build record

`showcase.meta.json` explicitly selects the root Pi export used by the `/built-with-sol` meta exhibit. Generation runs that export through the same transcript sanitizer and publishes only `/generated/transcripts/observatory-build.json`; the raw HTML export is never copied into `public/`. Update the `session` filename in this config when intentionally replacing the build record.

## Pi transcript publication policy

Raw Pi HTML exports are **never copied to the public site**. They may contain local paths, system prompts, tool definitions, environment details, command output, and large embedded payloads.

The build pipeline decodes the export and publishes only:

- User messages
- Assistant-visible text
- Model/provider identity
- Timestamps
- Generic tool/process summaries
- Deduplicated names of skills explicitly loaded or read

It excludes skill contents and locations, hidden reasoning, system prompts, tool schemas, raw tool output, all other tool arguments, local paths, and secret-like fields or token patterns. `pnpm validate` scans generated transcripts for forbidden markers and fails the build if a raw Pi export reaches the public directory.

**Human review is still recommended before publishing a new session.** A user or assistant message can contain project-specific information that an automated redactor cannot understand semantically.

## Session usage metrics

For every Pi export with provider accounting data, ingestion also records:

- Input/context, generated output, reported reasoning, cache-read, cache-write, and total tokens
- Input, output, cache, and total cost in USD
- Count of model API calls carrying usage records
- Exact elapsed session span from the first to last timestamp
- An estimated active-work duration that caps each gap between recorded events at five minutes

Input tokens represent the **entire context sent on each model call**, not only the human-authored prompt. Reported reasoning tokens are informational and may be a subset of output tokens; they must not be added to total tokens again. Elapsed time is exact for the recorded session span, while active time is explicitly approximate because Pi exports do not contain model latency or processing-duration fields.

## Demo isolation

Generated outputs run inside iframes with:

```text
sandbox="allow-scripts allow-pointer-lock allow-downloads"
```

`allow-same-origin` is deliberately omitted. Camera, microphone, location, payment, USB, and display capture are disabled through response headers. Visitors may explicitly open a raw artifact in a separate tab when browser capabilities or third-party resources do not work inside the sandbox.

Some existing artifacts depend on public CDNs, Google Fonts, Unsplash, Three.js, React, Tailwind, or other third-party resources. Those demos can degrade if an upstream asset changes. Vendoring dependencies inside each experiment is the best long-term preservation strategy.

## Deploying to Vercel

1. Push the repository to GitHub, GitLab, or Bitbucket.
2. Import the repository in Vercel.
3. Keep the detected framework as **Next.js**.
4. Vercel uses the checked-in `vercel.json` commands:
   - Install: `pnpm install --frozen-lockfile`
   - Build: `pnpm build`
5. Deploy.

No environment variables or database provisioning are required. Vercel's production URL is detected automatically. Set `NEXT_PUBLIC_SITE_URL` only when you want canonical metadata to use a custom domain during non-production builds.

## Content routes

```text
/                                  collection overview
/models/sol                        model collection
/models/terra
/models/luna
/experiments/{model}/{slug}        output + conversation
/compare/{promptGroup}             cross-model study
```

## Project source and generated output

- `Sol/`, `Terra/`, `Luna/` — immutable source experiments and Pi exports
- `scripts/showcase-core.ts` — normalization, decoding, sanitization, redaction
- `scripts/generate-showcase.ts` — deterministic ingestion and asset generation
- `scripts/validate-showcase.ts` — publication and catalogue safety checks
- `src/types/showcase.ts` — shared data contracts
- `src/components/showcase/` — gallery, preview, transcript, and comparison UI
- `docs/tasks/orchestrator-sessions/` — implementation planning and handoff records
